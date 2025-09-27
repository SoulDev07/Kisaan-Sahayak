import os
import asyncio
from typing import Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class MockWhatsAppService:
    """Mock WhatsApp service for testing - simulates sending messages without external dependencies"""
    
    def __init__(self):
        self.phone_number = os.getenv("TWILIO_PHONE_NUMBER", "+1234567890")
        
    async def send_message(self, phone_number: str, message: str) -> bool:
        """Simulate sending a WhatsApp message"""
        try:
            print(f"📱 [MOCK] WhatsApp message sent to {phone_number}")
            print(f"📝 Message: {message[:100]}{'...' if len(message) > 100 else ''}")
            print(f"✅ Message simulation successful!")
            
            # Simulate network delay
            await asyncio.sleep(1)
            
            return True
            
        except Exception as e:
            print(f"❌ Mock WhatsApp error: {str(e)}")
            return False
    
    async def send_document(self, phone_number: str, file_path: str, caption: str = "") -> bool:
        """Simulate sending a document via WhatsApp"""
        try:
            print(f"📄 [MOCK] WhatsApp document sent to {phone_number}")
            print(f"📁 File: {os.path.basename(file_path)}")
            print(f"📝 Caption: {caption}")
            print(f"✅ Document simulation successful!")
            
            # Simulate file upload delay
            await asyncio.sleep(2)
            
            return True
            
        except Exception as e:
            print(f"❌ Mock WhatsApp document error: {str(e)}")
            return False

# Convenience functions
async def send_whatsapp_message_mock(phone_number: str, pdf_path: str, scheme_name: str) -> bool:
    """Send WhatsApp message with PDF using mock service"""
    service = MockWhatsAppService()
    
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

async def send_text_message_mock(phone_number: str, message: str) -> bool:
    """Send simple text message using mock service"""
    service = MockWhatsAppService()
    return await service.send_message(phone_number, message)

# Test function
async def test_mock_whatsapp():
    """Test mock WhatsApp service"""
    print("🧪 Testing Mock WhatsApp service...")
    
    try:
        success = await send_text_message_mock(
            phone_number="+917020744317",
            message="🧪 *TEST MESSAGE* - This is a test from mock WhatsApp service! ✅"
        )
        
        if success:
            print("✅ Mock WhatsApp test successful!")
        else:
            print("❌ Mock WhatsApp test failed!")
        
        return success
        
    except Exception as e:
        print(f"❌ Error testing mock WhatsApp: {str(e)}")
        return False

if __name__ == "__main__":
    import asyncio
    # Test the mock service
    asyncio.run(test_mock_whatsapp()) 