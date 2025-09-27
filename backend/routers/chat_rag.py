from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from services.chat_rag import generate_rag_response
from typing import Optional

router = APIRouter()

class RAGChatRequest(BaseModel):
    user_query: str
    chat_history: str = ""
    section: str = "crops"
    top_k: int = 3
    image: Optional[dict] = None  # Add image field

@router.post("/chat/rag")
def chat_rag_endpoint(request: RAGChatRequest):
    try:
        result = generate_rag_response(
            user_query=request.user_query,
            chat_history=request.chat_history,
            section=request.section,
            top_k=request.top_k,
            image=request.image  # Pass image to service
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 