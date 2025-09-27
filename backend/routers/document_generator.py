from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
from services.whatsapp_free import send_text_message_free

load_dotenv()

router = APIRouter(prefix="/document", tags=["Document Generation"])

class DocumentRequest(BaseModel):
    farmer_id: str
    scheme_name: str
    phone_number: str
    farmer_data: Dict[str, Any]

@router.post("/generate-pdf")
async def generate_and_send_pdf(request: DocumentRequest):
    """
    Send document download link via WhatsApp (no PDF generation)
    """
    try:
        # Hardcoded Google Drive link for document downloads
        drive_link = "https://drive.google.com/drive/folders/1K5jJklnoj07EBgpDwXHKFSUF8UDDfzMw?usp=sharing"
        
        # Create WhatsApp message with download link
        message = f"""
🎉 *Document Ready for Download!*

📋 *Scheme:* {request.scheme_name}
👤 *Farmer ID:* {request.farmer_id}
📱 *Status:* Document Available

📄 *Download Your Document:*
{drive_link}

*Instructions:*
1. Click the link above
2. Download your {request.scheme_name} application form
3. Fill in your details
4. Submit to the concerned authority

*Important Notes:*
• Keep this document safe for your records
• Application number: {request.farmer_id}
• Generated for: {request.farmer_data.get('name', 'Farmer')}

Thank you for using our services! 🙏
        """
        
        # Send WhatsApp message with download link
        success = await send_text_message_free(
            phone_number=request.phone_number,
            message=message,
            provider="ultramsg"
        )
        
        if success:
            return {
                "success": True,
                "message": "Document download link sent successfully",
                "download_link": drive_link,
                "farmer_id": request.farmer_id,
                "scheme_name": request.scheme_name
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send WhatsApp message")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending document link: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "document_generator"} 