#!/usr/bin/env python3
"""
Test script for free WhatsApp services
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.whatsapp_free import test_free_whatsapp, FreeWhatsAppService

load_dotenv()

async def test_free_providers():
    """Test all available free WhatsApp providers"""
    print("🚀 Testing Free WhatsApp Providers")
    print("=" * 50)
    
    providers = ["ultramsg", "wamr", "whatsapp_web"]
    
    for provider in providers:
        print(f"\n🧪 Testing {provider.upper()}...")
        success = await test_free_whatsapp(provider)
        
        if success:
            print(f"✅ {provider.upper()} is working!")
        else:
            print(f"❌ {provider.upper()} failed or not configured")
        
        await asyncio.sleep(2)  # Wait between tests
    
    print("\n" + "=" * 50)
    print("🏁 All free provider tests completed!")

async def test_specific_free_provider(provider="ultramsg"):
    """Test a specific free provider"""
    print(f"🧪 Testing {provider.upper()} free WhatsApp service...")
    
    # Check if API key is configured (use existing Twilio credentials)
    api_key = os.getenv("TWILIO_AUTH_TOKEN") or os.getenv("FREE_WHATSAPP_API_KEY")
    phone_number = os.getenv("TWILIO_PHONE_NUMBER") or os.getenv("FREE_WHATSAPP_PHONE_NUMBER")
    
    if not api_key:
        print(f"❌ {provider.upper()} API key not configured!")
        print("Please set TWILIO_AUTH_TOKEN or FREE_WHATSAPP_API_KEY in your environment variables")
        return False
    
    if not phone_number:
        print(f"❌ {provider.upper()} phone number not configured!")
        print("Please set TWILIO_PHONE_NUMBER or FREE_WHATSAPP_PHONE_NUMBER in your environment variables")
        return False
    
    success = await test_free_whatsapp(provider)
    
    if success:
        print(f"✅ {provider.upper()} test successful!")
    else:
        print(f"❌ {provider.upper()} test failed!")
    
    return success

async def main():
    """Main test function"""
    print("🚀 Free WhatsApp Service Test")
    print("=" * 40)
    
    # Test specific provider (change this to test different providers)
    provider = "ultramsg"  # Change to: "wamr", "whatsapp_web"
    
    success = await test_specific_free_provider(provider)
    
    print("\n" + "=" * 40)
    if success:
        print("🏁 Test completed successfully!")
    else:
        print("🏁 Test failed!")
        print("\nTo configure a free provider:")
        print("1. Sign up for the provider:")
        print("   - UltraMsg: https://ultramsg.com/ (free tier)")
        print("   - WAMR: https://wamr.app/ (free tier)")
        print("   - WhatsApp Web: Manual QR code setup")
        print("2. Get your API key and phone number")
        print("3. Set environment variables:")
        print("   - FREE_WHATSAPP_API_KEY=your_api_key")
        print("   - FREE_WHATSAPP_PHONE_NUMBER=your_whatsapp_number")

if __name__ == "__main__":
    asyncio.run(main()) 