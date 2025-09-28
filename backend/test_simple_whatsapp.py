#!/usr/bin/env python3
"""
Simple test script to send "hi" via WhatsApp
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.services.main import send_text_message

load_dotenv()

async def test_simple_message():
    """Test Twilio WhatsApp with a simple 'hi' message"""
    print("🧪 Testing Twilio WhatsApp with simple message...")
    
    try:
        # Send a simple "hi" message
        print("📱 Sending 'hi' message...")
        success = await send_text_message(
            phone_number="+917020744317",
            message="Hi! 👋 This is a test message from Kisan Ki Awaaz backend."
        )
        
        if success:
            print("✅ Message sent successfully!")
            return True
        else:
            print("❌ Message failed!")
            return False
        
    except Exception as e:
        print(f"❌ Error in test: {str(e)}")
        return False

async def main():
    """Main test function"""
    print("🚀 Starting Simple WhatsApp Test")
    print("=" * 40)
    
    success = await test_simple_message()
    
    print("\n" + "=" * 40)
    if success:
        print("🏁 Test completed successfully!")
    else:
        print("🏁 Test failed!")

if __name__ == "__main__":
    asyncio.run(main()) 