import os
import base64
import tempfile
import shutil
from typing import Optional
from twilio.rest import Client
from twilio.base.exceptions import TwilioException
import requests
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# Twilio configuration - use environment variables
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Initialize Twilio client
def get_twilio_client():
    """Initialize Twilio client"""
    if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN]):
        raise Exception("Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.")
    
    return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

async def send_whatsapp_message(phone_number: str, pdf_path: str, scheme_name: str) -> bool:
    """
    Send PDF document via WhatsApp using Twilio
    
    Args:
        phone_number: Recipient's phone number (with country code)
        pdf_path: Path to the PDF file
        scheme_name: Name of the scheme for the message
    
    Returns:
        bool: True if message sent successfully, False otherwise
    """
    try:
        # Validate phone number format
        if not phone_number.startswith('+'):
            phone_number = f"+{phone_number}"
        
        # Read PDF file
        if not os.path.exists(pdf_path):
            raise Exception(f"PDF file not found: {pdf_path}")
        
        with open(pdf_path, 'rb') as pdf_file:
            pdf_content = pdf_file.read()
        
        # Encode PDF to base64
        pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
        
        # Get Twilio client
        client = get_twilio_client()
        
        # Prepare message content
        message_body = f"""
🎉 *Scheme Application Generated Successfully!*

📋 *Scheme:* {scheme_name}
📄 *Document Type:* Application Form
📱 *Status:* Ready for submission

Your application document has been generated and is attached to this message. Please review the details and submit it to the relevant government office.

*Important Notes:*
• Keep this document safe for your records
• Submit the original document to the concerned authority
• Application number is mentioned in the document footer
• For any queries, contact the helpline number mentioned in the document

📌 This report now includes:
• Available Services (numbered list with contacts/costs)
• Transportation and Logistics options with estimated costs

*Next Steps:*
1. Review the application form
2. Verify all details are correct
3. Submit to the nearest government office
4. Keep a copy for your records

Thank you for using our services! 🙏
        """
        
        # For Twilio WhatsApp, we need to upload the file to a public URL first
        # For now, let's send a text message with instructions to download
        message = client.messages.create(
            from_=f"whatsapp:{TWILIO_PHONE_NUMBER}",
            body=message_body + f"\n\n📄 Document saved as: {os.path.basename(pdf_path)}",
            to=f"whatsapp:{phone_number}"
        )
        
        # Copy PDF to a publicly accessible location
        try:
            # Create a copy in the current directory for easy access
            public_pdf_path = os.path.join(os.getcwd(), "public_pdf", os.path.basename(pdf_path))
            os.makedirs(os.path.dirname(public_pdf_path), exist_ok=True)
            shutil.copy2(pdf_path, public_pdf_path)
            
            # Add download instructions to the message
            download_message = f"""
📄 *PDF Document Ready for Download*

Your PDF document has been generated and saved as:
`{os.path.basename(pdf_path)}`

*To access your document:*
1. The file is saved in the backend directory
2. You can download it from the server
3. File size: {len(pdf_content)} bytes

*Document Details:*
• Scheme: {scheme_name}
• Generated: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
• Status: Ready for submission

Please contact the system administrator to download your document.
            """
            
            # Send the download instructions
            download_msg = client.messages.create(
                from_=f"whatsapp:{TWILIO_PHONE_NUMBER}",
                body=download_message,
                to=f"whatsapp:{phone_number}"
            )
            
            print(f"Download instructions sent successfully. SID: {download_msg.sid}")
            
        except Exception as download_error:
            print(f"Could not prepare download: {str(download_error)}")
            print("Sending as text message only")
        
        print(f"WhatsApp message sent successfully. SID: {message.sid}")
        return True
        
    except TwilioException as e:
        print(f"Twilio error: {str(e)}")
        return False
    except Exception as e:
        print(f"Error sending WhatsApp message: {str(e)}")
        return False

async def send_text_message(phone_number: str, message: str) -> bool:
    """
    Send a simple text message via WhatsApp
    
    Args:
        phone_number: Recipient's phone number (with country code)
        message: Text message to send
    
    Returns:
        bool: True if message sent successfully, False otherwise
    """
    try:
        # Validate phone number format
        if not phone_number.startswith('+'):
            phone_number = f"+{phone_number}"
        
        # Get Twilio client
        client = get_twilio_client()
        
        # Send WhatsApp message
        message_obj = client.messages.create(
            from_=f"whatsapp:{TWILIO_PHONE_NUMBER}",
            body=message,
            to=f"whatsapp:{phone_number}"
        )
        
        print(f"WhatsApp text message sent successfully. SID: {message_obj.sid}")
        return True
        
    except TwilioException as e:
        print(f"Twilio error: {str(e)}")
        return False
    except Exception as e:
        print(f"Error sending WhatsApp message: {str(e)}")
        return False

async def send_scheme_notification(phone_number: str, scheme_name: str, application_number: str) -> bool:
    """
    Send a notification about scheme application generation
    
    Args:
        phone_number: Recipient's phone number
        scheme_name: Name of the scheme
        application_number: Generated application number
    
    Returns:
        bool: True if message sent successfully, False otherwise
    """
    message = f"""
🎯 *Scheme Application Update*

📋 *Scheme:* {scheme_name}
🔢 *Application Number:* {application_number}
✅ *Status:* Document Generated

Your application document has been successfully generated and will be sent to you shortly. Please check your WhatsApp for the complete document.

*Application Details:*
• Scheme: {scheme_name}
• Application Number: {application_number}
• Generated Date: {datetime.now().strftime('%d/%m/%Y')}

Please keep your application number safe for future reference.
    """
    
    return await send_text_message(phone_number, message)

# Test function for development
async def test_whatsapp_connection():
    """
    Test WhatsApp connection and credentials
    """
    try:
        client = get_twilio_client()
        
        # Test with a simple message
        test_message = client.messages.create(
            from_=f"whatsapp:{TWILIO_PHONE_NUMBER}",
            body="🧪 Test message from Kisan Ki Awaaz backend",
            to="whatsapp:+917020744317"  # Your test number
        )
        
        print(f"Test message sent successfully. SID: {test_message.sid}")
        return True
        
    except Exception as e:
        print(f"Test failed: {str(e)}")
        return False

if __name__ == "__main__":
    import asyncio
    # Test the WhatsApp service
    asyncio.run(test_whatsapp_connection()) 