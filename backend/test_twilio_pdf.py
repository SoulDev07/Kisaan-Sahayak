#!/usr/bin/env python3
"""
Simple test script to send a test message with PDF via WhatsApp
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.services.main import send_whatsapp_message, send_text_message

load_dotenv()

async def test_twilio_with_pdf():
    """Test Twilio WhatsApp with a simple message and PDF"""
    print("🧪 Testing Twilio WhatsApp with PDF...")
    
    try:
        # First, send a simple test message
        print("📱 Sending test message...")
        test_success = await send_text_message(
            phone_number="+917020744317",
            message="🧪 *TEST MESSAGE* - This is a test message from Kisan Ki Awaaz backend to verify Twilio is working! ✅"
        )
        
        if test_success:
            print("✅ Test message sent successfully!")
        else:
            print("❌ Test message failed!")
            return False
        
        # Wait a moment
        await asyncio.sleep(2)
        
        # Now try to send a PDF (if one exists)
        pdf_files = []
        if os.path.exists("temp_pdfs"):
            pdf_files = [f for f in os.listdir("temp_pdfs") if f.endswith('.pdf')]
        
        if pdf_files:
            # Use the most recent PDF
            latest_pdf = sorted(pdf_files)[-1]
            pdf_path = os.path.join("temp_pdfs", latest_pdf)
            
            print(f"📄 Sending PDF: {latest_pdf}")
            pdf_success = await send_whatsapp_message(
                phone_number="+917020744317",
                pdf_path=pdf_path,
                scheme_name="TEST SCHEME"
            )
            
            if pdf_success:
                print("✅ PDF message sent successfully!")
            else:
                print("❌ PDF message failed!")
        else:
            print("📄 No PDF files found in temp_pdfs directory")
            # Send another test message instead
            await send_text_message(
                phone_number="+917020744317",
                message="📄 *PDF TEST* - No PDF files found, but Twilio is working! The document generation system is ready. 🎉"
            )
        
        return True
        
    except Exception as e:
        print(f"❌ Error in test: {str(e)}")
        return False

async def main():
    """Main test function"""
    print("🚀 Starting Twilio WhatsApp Test")
    print("=" * 50)
    
    success = await test_twilio_with_pdf()
    
    print("\n" + "=" * 50)
    if success:
        print("🏁 Test completed successfully!")
    else:
        print("🏁 Test failed!")

if __name__ == "__main__":
    asyncio.run(main()) 