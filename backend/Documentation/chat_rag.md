# Chat RAG (Retrieval-Augmented Generation) Feature

## Overview
The Chat RAG feature provides an intelligent conversational interface that combines retrieval-based context enhancement with generative AI capabilities. It retrieves relevant information from various data sources and generates contextually appropriate responses to user queries.

## Components

### Router: `chat_rag.py`
Handles HTTP endpoints for chat functionality:
- **POST `/chat/rag`**: Accepts user queries and optional parameters to generate contextually relevant responses.

### Service: `chat_rag.py`
Implements the core RAG functionality:
- **generate_rag_response()**: Main function that processes user queries and generates responses.
- **build_rich_context()**: Retrieves relevant contextual information from various data sources.
- **context_to_prompt()**: Converts retrieved context into a format suitable for the LLM prompt.

## Technical Details
- Uses Google Gemini 2.5 Flash LLM
- Integrates with SentenceTransformer for semantic embeddings
- Supports multimodal inputs (text + images)
- Implements language detection for multi-language support
- Uses vector search for context retrieval from Firestore

## Data Sources
The RAG system retrieves contextual information from multiple sections:
- Farmer profiles
- Livestock information
- Crop data
- Calendar events
- Market listings
- Chat history
- Documents
- Market data
- Soil data
- Weather data

## Prompt Improvement
The existing system prompt could be enhanced by:

1. **Agricultural Expertise**: Further refine the prompts to include more domain-specific agricultural knowledge.
2. **Local Context Awareness**: Improve understanding of regional farming practices across different Indian states.
3. **Actionable Insights**: Better distinguish between general information and actionable guidance.
4. **Personalization**: Enhance the use of farmer's historical data to provide more personalized responses.
5. **Image Analysis**: Improve prompts for better interpretation of crop/soil/disease images.

## Usage Example
```python
# Example of using the Chat RAG API
import requests
import json

url = "https://api.kisankiawaaz.com/chat/rag"
payload = {
    "user_query": "मेरी फसल पर कीट लगे हैं, क्या करूं?",
    "chat_history": json.dumps([
        {"sender": "user", "content": "नमस्ते"},
        {"sender": "bot", "content": "नमस्ते किसान भाई, आप कैसे हैं?"}
    ]),
    "section": "crops",
    "top_k": 3
}
response = requests.post(url, json=payload)
result = response.json()
print(f"Response: {result['response']}")
print(f"Action: {result['action']}")
``` 