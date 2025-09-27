"""
AI Chat Service for Document Builder
Provides human-like responses using Gemini 2.5 Flash with context from vector database
"""

import requests
import json
import logging
from typing import List, Dict, Any, Optional
from config_document_builder import DocumentBuilderConfig

logger = logging.getLogger(__name__)

class ChatService:
    """AI Chat service for farmer assistance with context awareness"""
    
    def __init__(self):
        self.config = DocumentBuilderConfig()
        self.api_key = self.config.GOOGLE_API_KEY
        self.model = self.config.GEMINI_MODEL
        self.temperature = self.config.GEMINI_TEMPERATURE
        self.max_tokens = self.config.GEMINI_MAX_TOKENS
        
        self.api_url = f'https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}'

    async def chat_with_context(self, user_message: str, context_data: List[Dict] = None, chat_history: List[Dict] = None) -> Dict[str, Any]:
        """
        Chat with Gemini using context from vector database and chat history
        Returns human-like responses for farmer queries
        """
        try:
            # Build comprehensive context
            system_prompt = self.config.SYSTEM_PROMPT
            
            # Add context from vector database if available
            context_text = ""
            if context_data:
                context_text = "\n\nRelevant Scheme Information:\n"
                for item in context_data[:5]:  # Limit to top 5 most relevant
                    context_text += f"- {item.get('scheme_name', 'Unknown Scheme')}: {item.get('content', '')[:300]}...\n"
            
            # Add chat history for continuity
            history_text = ""
            if chat_history:
                history_text = "\n\nRecent Conversation:\n"
                for msg in chat_history[-10:]:  # Last 10 messages
                    role = msg.get('role', 'user')
                    content = msg.get('content', '')
                    history_text += f"{role.capitalize()}: {content}\n"
            
            # Construct the full prompt
            full_prompt = f"""{system_prompt}
            
{context_text}
{history_text}

Current User Question: {user_message}

Please provide a helpful, human-like response that:
1. Directly addresses the farmer's question
2. Uses the relevant scheme information provided
3. Gives specific, actionable advice
4. Asks relevant follow-up questions if needed
5. Maintains a friendly, conversational tone"""

            # Prepare API request
            data = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": full_prompt}]
                    }
                ],
                "generationConfig": {
                    "temperature": self.temperature,
                    "maxOutputTokens": self.max_tokens,
                    "topP": 0.8,
                    "topK": 40
                }
            }
            
            # Make API call
            response = requests.post(self.api_url, json=data)
            
            if response.status_code != 200:
                logger.error(f"Gemini API error: {response.text}")
                return {
                    "success": False,
                    "error": f"API error: {response.status_code}",
                    "response": "I'm having trouble connecting right now. Please try again in a moment."
                }
            
            result = response.json()
            
            # Extract response text
            if 'candidates' in result and result['candidates']:
                response_text = result['candidates'][0]['content']['parts'][0]['text']
                
                return {
                    "success": True,
                    "response": response_text,
                    "model": self.model,
                    "context_used": len(context_data) if context_data else 0
                }
            else:
                return {
                    "success": False,
                    "error": "No response generated",
                    "response": "I couldn't generate a response. Please try rephrasing your question."
                }
                
        except Exception as e:
            logger.error(f"Error in chat_with_context: {e}")
            return {
                "success": False,
                "error": str(e),
                "response": "I encountered an error while processing your request. Please try again."
            }

    async def generate_document_questions(self, document_type: str, existing_data: Dict = None) -> List[Dict[str, str]]:
        """
        Generate follow-up questions for document creation based on document type
        """
        try:
            prompt = f"""
You are helping a farmer create a {document_type} document. Based on the document type and any existing information provided, generate 3-5 relevant questions to gather missing information needed for the document.

Document Type: {document_type}
Existing Data: {json.dumps(existing_data, indent=2) if existing_data else "None"}

Generate questions that are:
1. Specific to the document type
2. Easy for farmers to understand
3. Focused on gathering essential information
4. Conversational and friendly

Format your response as a JSON array of objects with 'field' and 'question' keys.
Example: [{"field": "farmer_name", "question": "What is your full name as it appears on your Aadhaar card?"}]
"""

            data = {
                "contents": [
                    {
                        "role": "user", 
                        "parts": [{"text": prompt}]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 1000
                }
            }
            
            response = requests.post(self.api_url, json=data)
            
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and result['candidates']:
                    response_text = result['candidates'][0]['content']['parts'][0]['text']
                    
                    # Try to extract JSON from response
                    try:
                        # Find JSON in the response
                        start = response_text.find('[')
                        end = response_text.rfind(']') + 1
                        if start != -1 and end != 0:
                            json_str = response_text[start:end]
                            questions = json.loads(json_str)
                            return questions
                    except json.JSONDecodeError:
                        pass
            
            # Fallback questions if API fails
            return self._get_fallback_questions(document_type)
            
        except Exception as e:
            logger.error(f"Error generating document questions: {e}")
            return self._get_fallback_questions(document_type)

    def _get_fallback_questions(self, document_type: str) -> List[Dict[str, str]]:
        """Fallback questions for common document types"""
        fallback_questions = {
            "loan_application": [
                {"field": "farmer_name", "question": "What is your full name as it appears on your Aadhaar card?"},
                {"field": "loan_amount", "question": "How much loan amount do you need?"},
                {"field": "loan_purpose", "question": "What will you use this loan for?"},
                {"field": "land_area", "question": "How much land do you own (in acres or hectares)?"}
            ],
            "subsidy_application": [
                {"field": "farmer_name", "question": "What is your full name?"},
                {"field": "scheme_name", "question": "Which government scheme are you applying for?"},
                {"field": "subsidy_amount", "question": "What is the subsidy amount you're requesting?"},
                {"field": "equipment_type", "question": "What equipment or service do you need subsidy for?"}
            ],
            "crop_insurance": [
                {"field": "farmer_name", "question": "What is your full name?"},
                {"field": "crop_type", "question": "Which crops do you want to insure?"},
                {"field": "land_area", "question": "What is the total area under cultivation?"},
                {"field": "insurance_amount", "question": "What is the sum insured amount you need?"}
            ],
            "general_application": [
                {"field": "farmer_name", "question": "What is your full name?"},
                {"field": "purpose", "question": "What is the purpose of this application?"},
                {"field": "contact_number", "question": "What is your mobile number?"},
                {"field": "address", "question": "What is your complete address?"}
            ]
        }
        
        return fallback_questions.get(document_type, fallback_questions["general_application"])

    async def extract_scheme_info(self, user_input: str) -> Dict[str, Any]:
        """
        Extract scheme information from user input using AI
        """
        try:
            prompt = f"""
Analyze the following user input and extract any information about government schemes they might be interested in or asking about.

User Input: "{user_input}"

Extract:
1. scheme_name: Any specific scheme mentioned
2. scheme_type: Type of scheme (loan, subsidy, insurance, etc.)
3. intent: What the user wants to do (apply, learn about, get documents for, etc.)
4. keywords: Important keywords for searching

Respond in JSON format:
{{"scheme_name": "", "scheme_type": "", "intent": "", "keywords": []}}
"""

            data = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": prompt}]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.1,
                    "maxOutputTokens": 500
                }
            }
            
            response = requests.post(self.api_url, json=data)
            
            if response.status_code == 200:
                result = response.json()
                if 'candidates' in result and result['candidates']:
                    response_text = result['candidates'][0]['content']['parts'][0]['text']
                    
                    try:
                        # Extract JSON from response
                        start = response_text.find('{')
                        end = response_text.rfind('}') + 1
                        if start != -1 and end != 0:
                            json_str = response_text[start:end]
                            extracted_info = json.loads(json_str)
                            return extracted_info
                    except json.JSONDecodeError:
                        pass
            
            # Fallback extraction
            return {
                "scheme_name": "",
                "scheme_type": "",
                "intent": "general_inquiry",
                "keywords": user_input.lower().split()
            }
            
        except Exception as e:
            logger.error(f"Error extracting scheme info: {e}")
            return {
                "scheme_name": "",
                "scheme_type": "",
                "intent": "general_inquiry", 
                "keywords": []
            }

# Global chat service instance
chat_service = ChatService()
