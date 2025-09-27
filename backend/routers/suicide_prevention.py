from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import json
from typing import Optional
from config import BLAND_API_URL, BLAND_API_KEY, BLAND_PATHWAY_ID, BLAND_PHONE_NUMBER

def start_bland_call(phone_number: str, pathway_id: str):
    if not phone_number or not pathway_id:
        return {"error": "Missing phone_number or pathway_id"}

    payload = {
        "phone_number": phone_number,
        "pathway_id": pathway_id
    }

    headers = {
        "authorization": BLAND_API_KEY,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(BLAND_API_URL, json=payload, headers=headers)
        return {
            "status_code": response.status_code,
            "response": response.json()
        }
    except Exception as e:
        return {"error": str(e)}

router = APIRouter(prefix="/suicide-prevention", tags=["Suicide Prevention"])

class EmergencyCallRequest(BaseModel):
    phone_number: str
    recipient_name: Optional[str] = None
    message: Optional[str] = None

class EmergencyCallResponse(BaseModel):
    success: bool
    message: str
    call_id: Optional[str] = None
    error: Optional[str] = None

@router.post("/emergency-call", response_model=EmergencyCallResponse)
async def initiate_emergency_call(request: EmergencyCallRequest):
    """
    Initiate an emergency call using Bland.ai for suicide prevention
    """
    try:
        # Use Bland.ai with environment variables
        phone = BLAND_PHONE_NUMBER
        pathway = BLAND_PATHWAY_ID
        
        result = start_bland_call(phone, pathway)
        
        if "error" in result:
            return EmergencyCallResponse(
                success=False,
                message="Failed to initiate emergency call",
                error=result["error"]
            )
        
        if result["status_code"] == 200 or result["status_code"] == 201:
            return EmergencyCallResponse(
                success=True,
                message="Emergency call initiated successfully",
                call_id=result["response"].get("call_id")
            )
        else:
            return EmergencyCallResponse(
                success=False,
                message="Failed to initiate emergency call",
                error=f"Status code: {result['status_code']}, Response: {result['response']}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while initiating the emergency call: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """
    Health check endpoint for suicide prevention service
    """
    return {
        "status": "healthy",
        "service": "suicide_prevention",
        "message": "Suicide prevention service is running"
    }

@router.get("/helplines")
async def get_helplines():
    """
    Get list of available helpline numbers
    """
    helplines = [
        {
            "id": 1,
            "name": "National Crisis Helpline",
            "number": "988",
            "description": "24/7 Suicide Prevention Lifeline",
            "icon": "phone",
            "color": "#ef4444",
        },
        {
            "id": 2,
            "name": "Crisis Text Line",
            "number": "741741",
            "description": "Text HOME to connect with a counselor",
            "icon": "message-text",
            "color": "#3b82f6",
        },
        {
            "id": 3,
            "name": "Vandrevala Foundation",
            "number": "1860-266-2345",
            "description": "Mental health support in India",
            "icon": "heart",
            "color": "#10b981",
        },
        {
            "id": 4,
            "name": "iCall Helpline",
            "number": "022-25521111",
            "description": "Professional counseling support",
            "icon": "account-tie",
            "color": "#8b5cf6",
        },
        {
            "id": 5,
            "name": "Sneha Foundation",
            "number": "044-24640050",
            "description": "24/7 emotional support",
            "icon": "hand-heart",
            "color": "#f59e0b",
        },
        {
            "id": 6,
            "name": "AASRA",
            "number": "9820466726",
            "description": "Suicide prevention and counseling",
            "icon": "shield",
            "color": "#ec4899",
        },
    ]
    
    return {
        "success": True,
        "helplines": helplines,
        "count": len(helplines)
    } 