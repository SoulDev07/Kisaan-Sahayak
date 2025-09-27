#!/usr/bin/env python3
"""
Test script for mock WhatsApp service
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.whatsapp_mock import test_mock_whatsapp, send_whatsapp_message_mock

load_dotenv()

async def test_mock_with_pdf():
    """Test mock WhatsApp with PDF document"""
    print("🧪 Testing Mock WhatsApp with PDF...")
    
    try:
        # Check if there are any PDF files to test with
        pdf_files = []
        if os.path.exists("temp_pdfs"):
            pdf_files = [f for f in os.listdir("temp_pdfs") if f.endswith('.pdf')]
        
        if pdf_files:
            # Use the most recent PDF
            latest_pdf = sorted(pdf_files)[-1]
            pdf_path = os.path.join("temp_pdfs", latest_pdf)
            
            print(f"📄 Testing with PDF: {latest_pdf}")
            success = await send_whatsapp_message_mock(
                phone_number="+917020744317",
                pdf_path=pdf_path,
                scheme_name="TEST SCHEME"
            )
            
            if success:
                print("✅ Mock PDF message test successful!")
            else:
                print("❌ Mock PDF message test failed!")
        else:
            print("📄 No PDF files found, testing text message only")
            success = await test_mock_whatsapp()
        
        return success
        
    except Exception as e:
        print(f"❌ Error in mock test: {str(e)}")
        return False

async def main():
    """Main test function"""
    print("🚀 Mock WhatsApp Service Test")
    print("=" * 40)
    
    # Test basic message
    print("\n📱 Testing basic message...")
    basic_success = await test_mock_whatsapp()
    
    # Test with PDF
    print("\n📄 Testing with PDF document...")
    pdf_success = await test_mock_with_pdf()
    
    print("\n" + "=" * 40)
    if basic_success and pdf_success:
        print("🏁 All mock tests completed successfully!")
        print("\n💡 This mock service simulates WhatsApp messages for testing.")
        print("   Use this for development without needing external providers.")
    else:
        print("🏁 Some mock tests failed!")

if __name__ == "__main__":
    asyncio.run(main()) 