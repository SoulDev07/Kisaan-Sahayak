import os
import requests
import json
import asyncio
from typing import Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class FreeWhatsAppService:
    """Free and open source WhatsApp service using various free APIs"""
    
    def __init__(self, provider="ultramsg"):
        self.provider = provider
        # Use existing Twilio credentials for now
        self.api_key = os.getenv("TWILIO_AUTH_TOKEN") or os.getenv("FREE_WHATSAPP_API_KEY")
        self.phone_number = os.getenv("TWILIO_PHONE_NUMBER") or os.getenv("FREE_WHATSAPP_PHONE_NUMBER")
        
    async def send_message(self, phone_number: str, message: str) -> bool:
        """Send a text message via free WhatsApp service"""
        try:
            if self.provider == "ultramsg":
                return await self._send_via_ultramsg(phone_number, message)
            elif self.provider == "wamr":
                return await self._send_via_wamr(phone_number, message)
            elif self.provider == "whatsapp_web":
                return await self._send_via_whatsapp_web(phone_number, message)
            else:
                print(f"Provider {self.provider} not implemented yet")
                return False
        except Exception as e:
            print(f"Error sending WhatsApp message: {str(e)}")
            return False
    
    async def send_document(self, phone_number: str, file_path: str, caption: str = "") -> bool:
        """Send a document via free WhatsApp service"""
        try:
            if self.provider == "ultramsg":
                return await self._send_document_via_ultramsg(phone_number, file_path, caption)
            elif self.provider == "wamr":
                return await self._send_document_via_wamr(phone_number, file_path, caption)
            else:
                print(f"Document sending not implemented for {self.provider}")
                return False
        except Exception as e:
            print(f"Error sending WhatsApp document: {str(e)}")
            return False
    
    async def _send_via_ultramsg(self, phone_number: str, message: str) -> bool:
        """Send message via UltraMsg (free tier available)"""
        try:
            import http.client
            import ssl
            import json
            
            # UltraMsg API configuration using your working setup
            conn = http.client.HTTPSConnection("api.ultramsg.com", context=ssl._create_unverified_context())
            
            # Message payload
            payload = f"token=qdy3ue6d8i6tt48f&to={phone_number}&body={message}"
            payload = payload.encode('utf8').decode('iso-8859-1')
            
            headers = {'content-type': "application/x-www-form-urlencoded"}
            
            # Send the request
            conn.request("POST", "/instance135415/messages/chat", payload, headers)
            
            # Get response
            res = conn.getresponse()
            data = res.read()
            
            # Parse response
            response_text = data.decode("utf-8")
            response_json = json.loads(response_text)
            
            if response_json.get("sent") == "true":
                print(f"UltraMsg message sent successfully: {response_json}")
                return True
            else:
                print(f"UltraMsg error: {response_json}")
                return False
                
        except Exception as e:
            print(f"UltraMsg error: {str(e)}")
            return False
        finally:
            if 'conn' in locals():
                conn.close()
    
    async def _send_via_wamr(self, phone_number: str, message: str) -> bool:
        """Send message via WAMR (free tier available)"""
        try:
            url = "https://api.wamr.app/api/send-message"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            data = {
                "phone": phone_number,
                "message": message
            }
            
            response = requests.post(url, headers=headers, json=data)
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    print(f"WAMR message sent successfully: {result}")
                    return True
                else:
                    print(f"WAMR error: {result}")
                    return False
            else:
                print(f"WAMR error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"WAMR error: {str(e)}")
            return False
    
    async def _send_via_whatsapp_web(self, phone_number: str, message: str) -> bool:
        """Send message via WhatsApp Web API (requires QR code setup)"""
        try:
            # This is a placeholder for WhatsApp Web API
            # You would need to implement QR code scanning and session management
            print("WhatsApp Web API requires manual QR code setup")
            print("This is a placeholder implementation")
            
            # For now, just simulate success
            print(f"Simulated WhatsApp Web message to {phone_number}: {message[:50]}...")
            return True
                
        except Exception as e:
            print(f"WhatsApp Web error: {str(e)}")
            return False
    
    async def _send_document_via_ultramsg(self, phone_number: str, file_path: str, caption: str) -> bool:
        """Send document via UltraMsg"""
        try:
            url = "https://api.ultramsg.com/instance_id/messages/document"
            headers = {
                "Content-Type": "application/json"
            }
            
            # For UltraMsg, we need to upload the file first
            # This is a simplified version
            data = {
                "token": self.api_key,
                "to": phone_number,
                "filename": os.path.basename(file_path),
                "caption": caption,
                "document": f"data:application/pdf;base64,{self._file_to_base64(file_path)}"
            }
            
            response = requests.post(url, headers=headers, json=data)
            
            if response.status_code == 200:
                result = response.json()
                if result.get("sent"):
                    print(f"UltraMsg document sent successfully")
                    return True
                else:
                    print(f"UltraMsg document error: {result}")
                    return False
            else:
                print(f"UltraMsg document error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"UltraMsg document error: {str(e)}")
            return False
    
    async def _send_document_via_wamr(self, phone_number: str, file_path: str, caption: str) -> bool:
        """Send document via WAMR"""
        try:
            url = "https://api.wamr.app/api/send-document"
            headers = {
                "Authorization": f"Bearer {self.api_key}"
            }
            
            with open(file_path, 'rb') as file:
                files = {'document': file}
                data = {
                    'phone': phone_number,
                    'caption': caption
                }
                
                response = requests.post(url, headers=headers, data=data, files=files)
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    print(f"WAMR document sent successfully")
                    return True
                else:
                    print(f"WAMR document error: {result}")
                    return False
            else:
                print(f"WAMR document error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"WAMR document error: {str(e)}")
            return False
    
    def _file_to_base64(self, file_path: str) -> str:
        """Convert file to base64 string"""
        import base64
        with open(file_path, 'rb') as file:
            return base64.b64encode(file.read()).decode('utf-8')

# Convenience functions
async def send_whatsapp_message_free(phone_number: str, pdf_path: str, scheme_name: str, provider="ultramsg") -> bool:
    """Send WhatsApp message with PDF using free service"""
    service = FreeWhatsAppService(provider)
    
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

async def send_text_message_free(phone_number: str, message: str, provider="ultramsg") -> bool:
    """Send simple text message using free service"""
    service = FreeWhatsAppService(provider)
    return await service.send_message(phone_number, message)

# Test function
async def test_free_whatsapp(provider="ultramsg"):
    """Test free WhatsApp service"""
    print(f"🧪 Testing {provider} free WhatsApp service...")
    
    try:
        success = await send_text_message_free(
            phone_number="+917020744317",
            message="🧪 *TEST MESSAGE* - This is a test from free WhatsApp service! ✅",
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
    # Test the free service
    asyncio.run(test_free_whatsapp("ultramsg")) 