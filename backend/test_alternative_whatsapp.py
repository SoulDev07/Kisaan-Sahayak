#!/usr/bin/env python3
"""
Test script for alternative WhatsApp services
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.whatsapp_alternative import test_alternative_whatsapp, WhatsAppService

load_dotenv()

async def test_all_providers():
    """Test all available WhatsApp providers"""
    print("🚀 Testing Alternative WhatsApp Providers")
    print("=" * 50)
    
    providers = ["messagebird", "vonage", "infobip"]
    
    for provider in providers:
        print(f"\n🧪 Testing {provider.upper()}...")
        success = await test_alternative_whatsapp(provider)
        
        if success:
            print(f"✅ {provider.upper()} is working!")
        else:
            print(f"❌ {provider.upper()} failed or not configured")
        
        await asyncio.sleep(2)  # Wait between tests
    
    print("\n" + "=" * 50)
    print("🏁 All provider tests completed!")

async def test_specific_provider(provider="messagebird"):
    """Test a specific provider"""
    print(f"🧪 Testing {provider.upper()} WhatsApp service...")
    
    # Check if API key is configured
    api_key = os.getenv("WHATSAPP_API_KEY")
    phone_number = os.getenv("WHATSAPP_PHONE_NUMBER")
    
    if not api_key:
        print(f"❌ {provider.upper()} API key not configured!")
        print("Please set WHATSAPP_API_KEY in your environment variables")
        return False
    
    if not phone_number:
        print(f"❌ {provider.upper()} phone number not configured!")
        print("Please set WHATSAPP_PHONE_NUMBER in your environment variables")
        return False
    
    success = await test_alternative_whatsapp(provider)
    
    if success:
        print(f"✅ {provider.upper()} test successful!")
    else:
        print(f"❌ {provider.upper()} test failed!")
    
    return success

async def main():
    """Main test function"""
    print("🚀 Alternative WhatsApp Service Test")
    print("=" * 40)
    
    # Test specific provider (change this to test different providers)
    provider = "messagebird"  # Change to: "vonage", "infobip", etc.
    
    success = await test_specific_provider(provider)
    
    print("\n" + "=" * 40)
    if success:
        print("🏁 Test completed successfully!")
    else:
        print("🏁 Test failed!")
        print("\nTo configure a provider:")
        print("1. Sign up for the provider (MessageBird, Vonage, Infobip)")
        print("2. Get your API key and phone number")
        print("3. Set environment variables:")
        print("   - WHATSAPP_API_KEY=your_api_key")
        print("   - WHATSAPP_PHONE_NUMBER=your_whatsapp_number")

if __name__ == "__main__":
    asyncio.run(main()) 