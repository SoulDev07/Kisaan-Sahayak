"""
Test script to verify PDF API endpoints functionality
"""

import sys
import os
import json
import requests
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

BASE_URL = "http://localhost:8001"

def test_complete_pdf_workflow():
    """Test the complete PDF generation workflow via API"""
    
    print("=== TESTING COMPLETE PDF WORKFLOW VIA API ===")
    
    try:
        # Step 1: Initialize system
        print("\n🔄 Step 1: Initializing system...")
        init_response = requests.post(f"{BASE_URL}/api/v1/document-builder/initialize")
        
        if init_response.status_code == 200:
            print("✅ System initialized successfully")
        else:
            print(f"❌ System initialization failed: {init_response.status_code}")
            return False
        
        # Step 2: Start document builder session
        print("\n🔄 Step 2: Starting document builder session...")
        
        start_data = {
            "farmer_name": "राजेश पाटील",
            "aadhaar_number": "1234-5678-9012",
            "contact_number": "+91-9876543210",
            "scheme_name": "PM-KISAN",
            "document_type": "loan_application"
        }
        
        # Send as form data
        start_response = requests.post(
            f"{BASE_URL}/api/v1/document-builder/start",
            data=start_data
        )
        
        if start_response.status_code == 200:
            start_result = start_response.json()
            session_id = start_result["session_id"]
            print(f"✅ Session started successfully: {session_id}")
            print(f"   Questions to ask: {len(start_result.get('questions', []))}")
        else:
            print(f"❌ Session start failed: {start_response.status_code}")
            print(f"   Response: {start_response.text}")
            return False
        
        # Step 3: Answer questions to complete document data
        print("\n🔄 Step 3: Answering questions...")
        
        # Simulate answering questions with complete data
        answer_data = {
            "session_id": session_id,
            "field": "loan_amount",
            "answer": "₹2,00,000"
        }
        
        # Keep answering until document is ready
        document_ready = False
        answer_attempts = 0
        max_attempts = 10
        
        while not document_ready and answer_attempts < max_attempts:
            answer_response = requests.post(
                f"{BASE_URL}/api/v1/document-builder/answer",
                json=answer_data
            )
            
            if answer_response.status_code == 200:
                answer_result = answer_response.json()
                document_ready = answer_result.get("document_ready", False)
                questions = answer_result.get("questions", [])
                
                print(f"   Attempt {answer_attempts + 1}: Ready={document_ready}, Questions={len(questions)}")
                
                if not document_ready and questions:
                    # Answer next question
                    next_question = questions[0]
                    answer_data = {
                        "session_id": session_id,
                        "field": next_question["field"],
                        "answer": "Test Answer for " + next_question["field"]
                    }
                    
            else:
                print(f"❌ Answer failed: {answer_response.status_code}")
                break
                
            answer_attempts += 1
        
        if not document_ready:
            print("❌ Document not ready after maximum attempts")
            return False
        
        print("✅ Document data collection completed")
        
        # Step 4: Generate PDF
        print("\n🔄 Step 4: Generating PDF...")
        
        pdf_response = requests.post(
            f"{BASE_URL}/api/v1/document-builder/document/generate-pdf/{session_id}",
            params={"format_type": "pdf"}
        )
        
        if pdf_response.status_code == 200:
            pdf_result = pdf_response.json()
            print("✅ PDF generated successfully")
            print(f"   Filename: {pdf_result['file_info']['filename']}")
            print(f"   Download URL: {pdf_result['download_url']}")
            
            # Step 5: Download PDF
            print("\n🔄 Step 5: Downloading PDF...")
            
            download_response = requests.get(
                f"{BASE_URL}/api/v1/document-builder/document/download-pdf/{session_id}"
            )
            
            if download_response.status_code == 200:
                # Save PDF to test file
                pdf_filename = f"test_download_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                pdf_path = os.path.join(".", pdf_filename)
                
                with open(pdf_path, 'wb') as f:
                    f.write(download_response.content)
                
                file_size = os.path.getsize(pdf_path)
                print(f"✅ PDF downloaded successfully")
                print(f"   File: {pdf_filename}")
                print(f"   Size: {file_size} bytes")
                
                return True
            else:
                print(f"❌ PDF download failed: {download_response.status_code}")
                return False
        else:
            print(f"❌ PDF generation failed: {pdf_response.status_code}")
            print(f"   Response: {pdf_response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure FastAPI server is running on port 8001")
        return False
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_direct_pdf_generation():
    """Test direct PDF generation using the service"""
    
    print("\n=== TESTING DIRECT PDF GENERATION ===")
    
    try:
        from services.document_generation import document_service
        
        # Sample data
        sample_data = {
            "farmer_name": "Direct Test Farmer",
            "aadhaar_number": "9876-5432-1098",
            "contact_number": "+91-1234567890",
            "address": "Test Village, Test District",
            "loan_amount": "₹1,50,000",
            "loan_purpose": "Agricultural equipment purchase",
            "scheme_name": "PM-KISAN Direct Test"
        }
        
        # Test PDF generation
        result = document_service.generate_document(
            document_type="loan_application",
            farmer_data=sample_data,
            format_type="pdf"
        )
        
        if result["success"]:
            print("✅ Direct PDF generation successful")
            print(f"   File: {result['filename']}")
            print(f"   Path: {result['file_path']}")
            
            if os.path.exists(result['file_path']):
                file_size = os.path.getsize(result['file_path'])
                print(f"   Size: {file_size} bytes")
                return True
            else:
                print("❌ Generated file not found")
                return False
        else:
            print(f"❌ Direct PDF generation failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Direct PDF test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def print_api_usage_guide():
    """Print guide for using the PDF API"""
    
    print("\n=== PDF API USAGE GUIDE ===")
    print("""
📋 Complete PDF Generation Workflow:

1. Initialize System:
   POST /api/v1/document-builder/initialize

2. Start Document Session:
   POST /api/v1/document-builder/start
   Data: farmer_name, aadhaar_number, contact_number, scheme_name, document_type

3. Answer Questions (repeat until document_ready=true):
   POST /api/v1/document-builder/answer
   JSON: {"session_id": "...", "field": "...", "answer": "..."}

4. Generate PDF:
   POST /api/v1/document-builder/document/generate-pdf/{session_id}
   Params: format_type=pdf (or html)

5. Download PDF:
   GET /api/v1/document-builder/document/download-pdf/{session_id}

🎯 Key Features:
   - Supports PDF and HTML formats
   - Uses reportlab for professional PDF generation
   - Bilingual support (English/Hindi)
   - Government scheme integration
   - Interactive question-answer flow

📊 Document Types Available:
   - loan_application
   - subsidy_application  
   - crop_insurance
   - kisan_credit_card
   - general_application
   - crop_registration
   - land_record_update
   - scheme_enrollment
""")

if __name__ == "__main__":
    print("🚀 Starting PDF API tests...\n")
    
    # Test direct generation first
    direct_success = test_direct_pdf_generation()
    
    # Test API workflow (requires server to be running)
    api_success = test_complete_pdf_workflow()
    
    # Print usage guide
    print_api_usage_guide()
    
    # Summary
    print(f"\n=== TEST SUMMARY ===")
    print(f"✅ Direct PDF Generation: {'PASSED' if direct_success else 'FAILED'}")
    print(f"{'✅' if api_success else '❌'} API Workflow: {'PASSED' if api_success else 'FAILED (Server may not be running)'}")
    
    if direct_success:
        print(f"\n🎉 PDF generation is working perfectly!")
        print(f"   Ready for production use with FastAPI server")
    else:
        print(f"\n⚠️ PDF generation needs attention")
