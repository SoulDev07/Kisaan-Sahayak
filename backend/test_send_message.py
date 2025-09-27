#!/usr/bin/env python3
"""
Test script to send WhatsApp message using UltraMsg API
"""

import http.client
import ssl
import json

def send_whatsapp_message_ultramsg():
    """Send WhatsApp message using UltraMsg API"""
    print("🧪 Testing UltraMsg WhatsApp API...")
    
    try:
        # UltraMsg API configuration
        conn = http.client.HTTPSConnection("api.ultramsg.com", context=ssl._create_unverified_context())
        
        # Message payload
        payload = "token=qdy3ue6d8i6tt48f&to=+917020744317&body=🧪 *TEST MESSAGE* - WhatsApp API on UltraMsg.com works good! ✅"
        payload = payload.encode('utf8').decode('iso-8859-1')
        
        headers = {'content-type': "application/x-www-form-urlencoded"}
        
        # Send the request
        conn.request("POST", "/instance135415/messages/chat", payload, headers)
        
        # Get response
        res = conn.getresponse()
        data = res.read()
        
        # Parse and print response
        response_text = data.decode("utf-8")
        print(f"📱 Response: {response_text}")
        
        # Try to parse JSON response
        try:
            response_json = json.loads(response_text)
            if response_json.get("sent"):
                print("✅ Message sent successfully!")
                return True
            else:
                print(f"❌ Message failed: {response_json}")
                return False
        except json.JSONDecodeError:
            print("⚠️ Response is not JSON format")
            print(f"Raw response: {response_text}")
            return False
            
    except Exception as e:
        print(f"❌ Error sending message: {str(e)}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def send_custom_message(to_number, message):
    """Send custom WhatsApp message"""
    print(f"📱 Sending message to {to_number}...")
    
    try:
        conn = http.client.HTTPSConnection("api.ultramsg.com", context=ssl._create_unverified_context())
        
        payload = f"token=qdy3ue6d8i6tt48f&to={to_number}&body={message}"
        payload = payload.encode('utf8').decode('iso-8859-1')
        
        headers = {'content-type': "application/x-www-form-urlencoded"}
        
        conn.request("POST", "/instance135415/messages/chat", payload, headers)
        
        res = conn.getresponse()
        data = res.read()
        
        response_text = data.decode("utf-8")
        print(f"📱 Response: {response_text}")
        
        try:
            response_json = json.loads(response_text)
            if response_json.get("sent"):
                print("✅ Custom message sent successfully!")
                return True
            else:
                print(f"❌ Custom message failed: {response_json}")
                return False
        except json.JSONDecodeError:
            print("⚠️ Response is not JSON format")
            return False
            
    except Exception as e:
        print(f"❌ Error sending custom message: {str(e)}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

def main():
    """Main test function"""
    print("🚀 UltraMsg WhatsApp API Test")
    print("=" * 40)
    
    # Test 1: Send test message
    print("\n📱 Test 1: Sending test message...")
    success1 = send_whatsapp_message_ultramsg()
    
    # Test 2: Send custom message
    print("\n📱 Test 2: Sending custom message...")
    custom_message = """
🎉 *Document Generation Test*

📋 *Status:* System Working
📄 *Service:* UltraMsg WhatsApp API
✅ *Result:* Successfully integrated

Your document generation system is now connected to WhatsApp!
    """
    
    success2 = send_custom_message("+917020744317", custom_message)
    
    print("\n" + "=" * 40)
    if success1 and success2:
        print("🏁 All tests completed successfully!")
        print("✅ UltraMsg WhatsApp API is working!")
    else:
        print("🏁 Some tests failed!")
        print("❌ Check your UltraMsg configuration")

if __name__ == "__main__":
    main() 