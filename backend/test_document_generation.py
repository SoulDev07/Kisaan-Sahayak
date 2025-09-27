#!/usr/bin/env python3
"""
Test script for document generation and WhatsApp integration
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.document_generator import generate_scheme_pdf
from services.whatsapp_free import send_whatsapp_message_free, test_free_whatsapp

load_dotenv()

async def test_document_generation():
    """Test document generation functionality"""
    print("🧪 Testing Document Generation...")
    
    try:
        # Test farmer data
        farmer_data = {
            "name": "Vinayak Bhatia",
            "father_name": "Suresh Sharma",
            "phoneNumber": "+91 98765 43210",
            "village": "Shirur, Maharashtra",
            "district": "Pune",
            "state": "Maharashtra",
            "pincode": "411046",
            "farmSize": "5 acres",
            "aadhaar_number": "1234-5678-9012",
            "bank_account": "SBI12345678901",
            "ifsc_code": "SBIN0001234",
            "crop_type": "Wheat",
            "sowing_date": "15/11/2024"
        }
        
        # Generate PDF for PM-KISAN scheme
        pdf_path = await generate_scheme_pdf(
            farmer_id="f001",
            scheme_name="PM-KISAN",
            farmer_data=farmer_data
        )
        
        print(f"✅ PDF generated successfully: {pdf_path}")
        
        # Check if file exists
        if os.path.exists(pdf_path):
            file_size = os.path.getsize(pdf_path)
            print(f"📄 File size: {file_size} bytes")
            return pdf_path
        else:
            print("❌ PDF file not found")
            return None
            
    except Exception as e:
        print(f"❌ Error generating document: {str(e)}")
        return None

async def test_whatsapp_integration(pdf_path: str):
    """Test WhatsApp integration"""
    print("\n📱 Testing WhatsApp Integration...")
    
    try:
        # Test WhatsApp connection
        connection_test = await test_free_whatsapp("ultramsg")
        if connection_test:
            print("✅ WhatsApp connection test successful")
        else:
            print("❌ WhatsApp connection test failed")
            return False
        
        # Test sending PDF document
        success = await send_whatsapp_message_free(
            phone_number="+917020744317",
            pdf_path=pdf_path,
            scheme_name="PM-KISAN",
            provider="ultramsg"
        )
        
        if success:
            print("✅ PDF sent via WhatsApp successfully")
            return True
        else:
            print("❌ Failed to send PDF via WhatsApp")
            return False
            
    except Exception as e:
        print(f"❌ Error in WhatsApp integration: {str(e)}")
        return False

async def main():
    """Main test function"""
    print("🚀 Starting Document Generation and WhatsApp Integration Test")
    print("=" * 60)
    
    # Check environment variables
    required_env_vars = [
        "GOOGLE_API_KEY",
        "TWILIO_ACCOUNT_SID", 
        "TWILIO_AUTH_TOKEN",
        "TWILIO_PHONE_NUMBER"
    ]
    
    missing_vars = []
    for var in required_env_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please check your .env file")
        return
    
    print("✅ All environment variables are configured")
    
    # Test document generation
    pdf_path = await test_document_generation()
    
    if pdf_path:
        # Test WhatsApp integration
        await test_whatsapp_integration(pdf_path)
    
    print("\n" + "=" * 60)
    print("🏁 Test completed!")

if __name__ == "__main__":
    asyncio.run(main()) 