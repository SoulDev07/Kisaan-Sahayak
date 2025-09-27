import os
import numpy as np
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain_core.output_parsers import StrOutputParser
# from sentence_transformers import SentenceTransformer  # Temporarily disabled
from utils.firestore_vector_search import search_farmers_by_vector
import langdetect
from langchain_core.messages import HumanMessage
import base64
import re
from services.firebase import db
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "AIzaSyDd0ah4WW1JlpP68xkZkTMphANAZo8IK9A")
model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GOOGLE_API_KEY)
# embedding_model = SentenceTransformer('all-MiniLM-L6-v2')  # Temporarily disabled

SECTIONS = [
    'profile', 'livestock', 'crops', 'calendarEvents', 'marketListings', 'chatHistory', 'documents'
]

@lru_cache(maxsize=128)
def embed_query(text):
    # return embedding_model.encode(text).tolist()  # Temporarily disabled
    return [0.1] * 384  # Dummy embedding for testing

@lru_cache(maxsize=32)
def build_rich_context(query, top_k=2):
    query_embedding = embed_query(query)
    context = {}
    
    def fetch_section(section):
        results = search_farmers_by_vector(query_embedding, section=section, top_k=top_k)
        return section, results

    with ThreadPoolExecutor(max_workers=len(SECTIONS)) as executor:
        futures = [executor.submit(fetch_section, section) for section in SECTIONS]
        for future in futures:
            section, results = future.result()
            context[section] = results
            
    return context

def parse_response_text(raw_response: str, user_query: str) -> tuple:
    """
    Parse a plain text response to extract action and content.
    Fallback when JSON parsing fails.
    """
    # Default values
    action = "do_nothing"
    content = raw_response.strip()
    
    # Keywords to action mapping based on user query and response content
    query_lower = user_query.lower()
    response_lower = raw_response.lower()
    
    # Determine action based on query keywords
    if any(word in query_lower for word in ['weather', 'rain', 'temperature', 'climate']):
        action = "weather"
    elif any(word in query_lower for word in ['soil', 'moisture', 'irrigation', 'water']):
        action = "soil_moisture"
    elif any(word in query_lower for word in ['listing', 'market', 'sell', 'price', 'crop']):
        action = "market"
    elif any(word in query_lower for word in ['profile', 'information', 'details', 'personal']):
        action = "profile"
    elif any(word in query_lower for word in ['cattle', 'livestock', 'cow', 'animal']):
        action = "cattle_management"
    elif any(word in query_lower for word in ['photo', 'picture', 'image', 'camera', 'capture']):
        action = "capture_image"
    elif any(word in query_lower for word in ['chat', 'talk', 'conversation']):
        action = "chat"
    
    # Clean up the content - remove any JSON-like formatting if present
    import re
    json_pattern = r'```json\s*({.*?})\s*```'
    json_match = re.search(json_pattern, content, re.DOTALL)
    if json_match:
        try:
            import json
            json_data = json.loads(json_match.group(1))
            if 'action' in json_data:
                action = json_data['action']
            if 'response' in json_data:
                content = json_data['response']
        except:
            pass  # Keep original content if JSON parsing fails
    
    # Remove any leftover JSON formatting
    content = re.sub(r'^\s*```json.*?```\s*$', '', content, flags=re.DOTALL)
    content = re.sub(r'^\s*{.*?}\s*$', '', content, flags=re.DOTALL)
    content = content.strip()
    
    return action, content

def context_to_prompt(context):
    prompt_parts = []
    for section, results in context.items():
        if not results:
            continue
        if section == 'profile':
            for sim, data, docid in results:
                prompt_parts.append(f"Farmer profile: {data.get('name','')} from {data.get('village','')} speaks {data.get('language','')}.")
        elif section == 'livestock':
            for sim, data, docid in results:
                livestock = data.get('livestock', [])
                if livestock:
                    animals = ', '.join([f"{a['type']} ({a['name']})" for a in livestock])
                    prompt_parts.append(f"Livestock: {animals}.")
        elif section == 'crops':
            for sim, data, docid in results:
                crops = data.get('crops', [])
                if crops:
                    crop_list = ', '.join([c['name'] for c in crops])
                    prompt_parts.append(f"Crops grown: {crop_list}.")
        elif section == 'calendarEvents':
            for sim, data, docid in results:
                events = data.get('calendarEvents', [])
                if events:
                    event_lines = '\n'.join([f"- {e['date']} {e['task']}: {e['details']}" for e in events])
                    prompt_parts.append(f"Upcoming schedule/events:\n{event_lines}")
        elif section == 'marketListings':
            for sim, data, docid in results:
                listings = data.get('marketListings', [])
                if listings:
                    lines = '\n'.join([f"- {l['name']} ({l['quantity']}): ₹{l['myPrice']} (market: ₹{l['marketPrice']})" for l in listings])
                    prompt_parts.append(f"Market listings:\n{lines}")
        elif section == 'chatHistory':
            for sim, data, docid in results:
                chats = data.get('chatHistory', [])
                if chats:
                    chat_lines = '\n'.join([f"- {c['title']} on {c['date']}" for c in chats])
                    prompt_parts.append(f"Recent chats:\n{chat_lines}")
        elif section == 'documents':
            for sim, data, docid in results:
                docs = data.get('documents', [])
                if docs:
                    doc_lines = '\n'.join([f"- {d['title']} ({d['type']}) on {d['time']}" for d in docs])
                    prompt_parts.append(f"Documents:\n{doc_lines}")
    return '\n\n'.join(prompt_parts)

@lru_cache(maxsize=8)
def get_market_soil_weather_context(query_embedding_tuple):
    query_embedding = np.array(query_embedding_tuple)
    context = {}
    collections = ['market_data', 'soil_data', 'weather_data']

    def fetch_collection(collection):
        doc = db.collection(collection).document('latest').get()
        if doc.exists:
            doc_data = doc.to_dict()
            embedding = doc_data.get('embedding')
            data = doc_data.get('data')
            if embedding:
                sim = np.dot(query_embedding, embedding) / (np.linalg.norm(query_embedding) * np.linalg.norm(embedding))
                return collection, {'similarity': sim, 'data': data}
        return collection, None

    with ThreadPoolExecutor(max_workers=len(collections)) as executor:
        futures = [executor.submit(fetch_collection, c) for c in collections]
        for future in futures:
            collection, result = future.result()
            if result:
                context[collection] = result
                
    return context

def extract_gemini_content(response):
    # Handles both string and list content from Gemini, including AIMessage objects
    # If response is an AIMessage, extract its 'content' attribute
    if hasattr(response, "content"):
        content = response.content
    else:
        content = response
    # If content is an AIMessage (from Gemini), extract its 'content' attribute
    if hasattr(content, "content"):
        content = content.content
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        result = []
        for c in content:
            if isinstance(c, str):
                result.append(c)
            elif isinstance(c, dict) and "text" in c and isinstance(c["text"], str):
                result.append(c["text"])
            elif (
                isinstance(c, tuple)
                and len(c) == 2
                and c[0] == "content"
                and isinstance(c[1], str)
            ):
                result.append(c[1])
        return "".join(result)
    return str(content)

def generate_rag_response(user_query, chat_history=None, section=None, top_k=2, memory=None, image=None):
    multimodal_message = None
    if image:
        # Determine if image['uri'] is a data URL or a file path
        uri = image.get('uri')
        if uri and uri.startswith('data:image/'):
            image_url = uri
        elif uri and re.match(r'^file:/+', uri):
            # Convert file URI to local path
            local_path = re.sub(r'^file:/+', '/', uri)
            with open(local_path, 'rb') as f:
                encoded = base64.b64encode(f.read()).decode('utf-8')
            # Guess mime type from extension
            ext = local_path.split('.')[-1].lower()
            mime = 'jpeg' if ext in ['jpg', 'jpeg'] else ext
            image_url = f"data:image/{mime};base64,{encoded}"
        else:
            image_url = None
        if image_url:
            multimodal_message = HumanMessage(
                content=[
                    {"type": "text", "text": user_query},
                    {"type": "image_url", "image_url": image_url},
                ]
            )
    query_embedding = embed_query(user_query)
    context = build_rich_context(user_query, top_k=top_k)
    context_text = context_to_prompt(context)
    
    # Convert list to tuple for caching
    query_embedding_tuple = tuple(query_embedding)
    msw_context = get_market_soil_weather_context(query_embedding_tuple)
    
    msw_prompt = ''
    for k, v in msw_context.items():
        safe_data = str(v['data']).replace('{', '{{').replace('}', '}}')
        msw_prompt += f"\n[{k.upper()} CONTEXT] (similarity: {v['similarity']:.2f}):\n{safe_data[:2000]}\n"  # limit to 2000 chars for brevity
    # Detect question language
    try:
        question_language = langdetect.detect(user_query)
    except Exception:
        question_language = "en"
    # Format chat history as a numbered list for the model
    formatted_history = ""
    if chat_history:
        try:
            import json
            history = json.loads(chat_history) if isinstance(chat_history, str) else chat_history
            if isinstance(history, list):
                formatted_history = "\n".join([
                    f"{i+1}. {msg['sender'].capitalize()}: {msg['content']}" for i, msg in enumerate(history) if 'sender' in msg and 'content' in msg
                ])
            else:
                formatted_history = str(chat_history)
        except Exception:
            formatted_history = str(chat_history)
    from langchain_core.output_parsers import JsonOutputParser
    
    system_prompt = (
        "You are Kissan AI, an expert agricultural and farm assistant for Indian farmers.\n"
        "ALWAYS answer in the SAME LANGUAGE as the user's question, regardless of the data or previous answers.\n"
        "If the question is in English, answer in English. If in Hindi, answer in Hindi. If in Marathi, answer in Marathi.\n"
        "VOICE INPUT HANDLING: This query comes from a voice command. Be aware that voice transcription may have errors or background noise. Look for agricultural keywords and intents even if the transcription seems imperfect.\n"
        "Based on the user's query and context, determine the best action from:\n"
        "- 'capture_image': For requests to analyze crops, plants, or diseases visually\n"
        "- 'soil_moisture': For queries about soil conditions, irrigation needs, or moisture levels\n"
        "- 'weather': For questions about weather forecasts, rain predictions, or climate impacts\n"
        "- 'profile': For requests about the farmer's personal information or account\n"
        "- 'cattle_management': For livestock or animal husbandry related questions\n"
        "- 'market': For questions about crop prices, selling produce, or market conditions\n"
        "- 'document': For requests related to forms, government schemes, or documentation\n"
        "- 'chat': For general conversation or advice\n"
        "- 'do_nothing': If no specific action is required\n"
        "Then, generate a helpful, detailed, and friendly response using simple language appropriate for farmers.\n"
        "Reference specific crops, techniques, and products available in India when providing recommendations.\n"
        "For disease treatments, prefer locally available and affordable options.\n"
        "Proactively ask a relevant follow-up question at the end of your answer.\n"
        "When including links, always use proper markdown format: [link text](url). For subsidies, use official Indian government links (e.g., https://pmkisan.gov.in).\n"
        "Your final output MUST be a single JSON object with two keys: 'action' and 'response'.\n"
        "Example: {{\"action\": \"weather\", \"response\": \"The weather today is...\"}}\n"
        "The language of the answer must be: {question_language}.\n"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "User question: {user_query}\n\nContext:\n{context_text}\n" + msw_prompt + "\nChat history (numbered list):\n{chat_history}\n"),
    ])
    
    memory = memory or ConversationBufferMemory(return_messages=True)
    
    try:
        if multimodal_message:
            # Multimodal messages do not easily support JSON output, handle separately
            response = model.invoke([multimodal_message])
            content = extract_gemini_content(response)
            action = "do_nothing" # Default action for image queries
        else:
            # Try JSON parsing first, fallback to text parsing if it fails
            try:
                chain = prompt | model | JsonOutputParser()
                response_data = chain.invoke({
                    "user_query": user_query,
                    "context_text": context_text,
                    "chat_history": formatted_history,
                    "question_language": question_language
                })
                action = response_data.get("action", "do_nothing").strip()
                content = response_data.get("response", "")
            except Exception as json_error:
                print(f"JSON parsing failed, falling back to text parsing: {json_error}")
                # Fallback: get raw response and parse manually
                chain = prompt | model | StrOutputParser()
                raw_response = chain.invoke({
                    "user_query": user_query,
                    "context_text": context_text,
                    "chat_history": formatted_history,
                    "question_language": question_language
                })
                
                # Try to extract action and response from raw text
                action, content = parse_response_text(raw_response, user_query)
                print(f"✅ Extracted from text - Action: {action}, Response length: {len(content)}")

        try:
            memory.save_context({"input": user_query}, {"output": content})
        except Exception as e:
            print("Memory save error:", e)
            
        return {
            "response": content,
            "action": action,
        }
    except Exception as e:
        print("RAG error:", e)
        return {
            "response": f"Sorry, there was an error processing your request: {e}",
            "action": "do_nothing",
            "memory": "",
            "context": {}
        }
