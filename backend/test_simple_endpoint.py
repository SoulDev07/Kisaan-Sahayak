#!/usr/bin/env python3
"""
Simple test script for the updated /generate-pdf endpoint
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.whatsapp_free import send_text_message_free

load_dotenv()

async def test_simple_document_link():
    """Test sending document download link via WhatsApp"""
    print("🧪 Testing Simple Document Link Service...")
    
    try:
        # Hardcoded Google Drive link
        drive_link = "https://drive.google.com/drive/folders/1K5jJklnoj07EBgpDwXHKFSUF8UDDfzMw?usp=sharing"
        
        # Test message
        message = f"""
🎉 *Document Ready for Download!*

📋 *Scheme:* PM-KISAN
👤 *Farmer ID:* F001
📱 *Status:* Document Available

📄 *Download Your Document:*
{drive_link}

*Instructions:*
1. Click the link above
2. Download your PM-KISAN application form
3. Fill in your details
4. Submit to the concerned authority

*Important Notes:*
• Keep this document safe for your records
• Application number: F001
• Generated for: Test Farmer

Thank you for using our services! 🙏
        """
        
        # Send WhatsApp message
        success = await send_text_message_free(
            phone_number="+917020744317",
            message=message,
            provider="ultramsg"
        )
        
        if success:
            print("✅ Document link sent successfully!")
            print(f"📄 Download link: {drive_link}")
            return True
        else:
            print("❌ Failed to send document link")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

async def main():
    """Main test function"""
    print("🚀 Simple Document Link Test")
    print("=" * 40)
    
    success = await test_simple_document_link()
    
    print("\n" + "=" * 40)
    if success:
        print("🏁 Test completed successfully!")
        print("✅ No Gemini/LangChain dependencies needed!")
    else:
        print("🏁 Test failed!")

if __name__ == "__main__":
    asyncio.run(main()) 