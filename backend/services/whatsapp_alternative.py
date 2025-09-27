import os
import requests
import json
from typing import Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class WhatsAppService:
    """Generic WhatsApp service that can work with different providers"""
    
    def __init__(self, provider="messagebird"):
        self.provider = provider
        self.api_key = os.getenv("WHATSAPP_API_KEY")
        self.phone_number = os.getenv("WHATSAPP_PHONE_NUMBER")
        
    async def send_message(self, phone_number: str, message: str) -> bool:
        """Send a text message via WhatsApp"""
        try:
            if self.provider == "messagebird":
                return await self._send_via_messagebird(phone_number, message)
            elif self.provider == "vonage":
                return await self._send_via_vonage(phone_number, message)
            elif self.provider == "infobip":
                return await self._send_via_infobip(phone_number, message)
            else:
                print(f"Provider {self.provider} not implemented yet")
                return False
        except Exception as e:
            print(f"Error sending WhatsApp message: {str(e)}")
            return False
    
    async def send_document(self, phone_number: str, file_path: str, caption: str = "") -> bool:
        """Send a document via WhatsApp"""
        try:
            if self.provider == "messagebird":
                return await self._send_document_via_messagebird(phone_number, file_path, caption)
            elif self.provider == "vonage":
                return await self._send_document_via_vonage(phone_number, file_path, caption)
            elif self.provider == "infobip":
                return await self._send_document_via_infobip(phone_number, file_path, caption)
            else:
                print(f"Document sending not implemented for {self.provider}")
                return False
        except Exception as e:
            print(f"Error sending WhatsApp document: {str(e)}")
            return False
    
    async def _send_via_messagebird(self, phone_number: str, message: str) -> bool:
        """Send message via MessageBird"""
        try:
            url = "https://conversations.messagebird.com/v1/send"
            headers = {
                "Authorization": f"AccessKey {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "to": phone_number,
                "from": self.phone_number,
                "type": "text",
                "content": {
                    "text": message
                }
            }
            
            response = requests.post(url, headers=headers, json=data)
            
            if response.status_code == 201:
                print(f"MessageBird message sent successfully: {response.json()}")
                return True
            else:
                print(f"MessageBird error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"MessageBird error: {str(e)}")
            return False
    
    async def _send_via_vonage(self, phone_number: str, message: str) -> bool:
        """Send message via Vonage"""
        try:
            url = "https://messages-sandbox.nexmo.com/v1/messages"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "from": {
                    "type": "whatsapp",
                    "number": self.phone_number
                },
                "to": {
                    "type": "whatsapp",
                    "number": phone_number
                },
                "message": {
                    "content": {
                        "type": "text",
                        "text": message
                    }
                }
            }
            
            response = requests.post(url, headers=headers, json=data)
            
            if response.status_code == 202:
                print(f"Vonage message sent successfully: {response.json()}")
                return True
            else:
                print(f"Vonage error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"Vonage error: {str(e)}")
            return False
    
    async def _send_via_infobip(self, phone_number: str, message: str) -> bool:
        """Send message via Infobip"""
        try:
            url = "https://api.infobip.com/whatsapp/1/message/text"
            headers = {
                "Authorization": f"App {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "messages": [
                    {
                        "from": self.phone_number,
                        "to": phone_number,
                        "content": {
                            "text": message
                        }
                    }
                ]
            }
            
            response = requests.post(url, headers=headers, json=data)
            
            if response.status_code == 200:
                print(f"Infobip message sent successfully: {response.json()}")
                return True
            else:
                print(f"Infobip error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"Infobip error: {str(e)}")
            return False
    
    async def _send_document_via_messagebird(self, phone_number: str, file_path: str, caption: str) -> bool:
        """Send document via MessageBird"""
        try:
            url = "https://conversations.messagebird.com/v1/send"
            headers = {
                "Authorization": f"AccessKey {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # For MessageBird, we need to upload the file first
            # This is a simplified version - you'd need to implement file upload
            data = {
                "to": phone_number,
                "from": self.phone_number,
                "type": "text",
                "content": {
                    "text": f"{caption}\n\n📄 Document: {os.path.basename(file_path)}\n\nPlease contact support to download the document."
                }
            }
            
            response = requests.post(url, headers=headers, json=data)
            
            if response.status_code == 201:
                print(f"MessageBird document notification sent successfully")
                return True
            else:
                print(f"MessageBird error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"MessageBird document error: {str(e)}")
            return False

# Convenience functions
async def send_whatsapp_message_alt(phone_number: str, pdf_path: str, scheme_name: str, provider="messagebird") -> bool:
    """Send WhatsApp message with PDF using alternative provider"""
    service = WhatsAppService(provider)
    
    message = f"""
🎉 *Scheme Application Generated Successfully!*

📋 *Scheme:* {scheme_name}
📄 *Document Type:* Application Form
📱 *Status:* Ready for submission

Your application document has been generated and is ready for download.

*Important Notes:*
• Keep this document safe for your records
• Submit the original document to the concerned authority
• Application number is mentioned in the document footer

Thank you for using our services! 🙏
    """
    
    # Send the message
    success = await service.send_message(phone_number, message)
    
    if success:
        # Send document notification
        await service.send_document(phone_number, pdf_path, f"📄 {scheme_name} Application Document")
    
    return success

async def send_text_message_alt(phone_number: str, message: str, provider="messagebird") -> bool:
    """Send simple text message using alternative provider"""
    service = WhatsAppService(provider)
    return await service.send_message(phone_number, message)

# Test function
async def test_alternative_whatsapp(provider="messagebird"):
    """Test alternative WhatsApp service"""
    print(f"🧪 Testing {provider} WhatsApp service...")
    
    try:
        success = await send_text_message_alt(
            phone_number="+917020744317",
            message="🧪 *TEST MESSAGE* - This is a test from alternative WhatsApp service! ✅",
            provider=provider
        )
        
        if success:
            print(f"✅ {provider} test successful!")
        else:
            print(f"❌ {provider} test failed!")
        
        return success
        
    except Exception as e:
        print(f"❌ Error testing {provider}: {str(e)}")
        return False

if __name__ == "__main__":
    import asyncio
    # Test the alternative service
    asyncio.run(test_alternative_whatsapp("messagebird")) 