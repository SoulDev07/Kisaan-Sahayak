"""
Test AI-integrated PDF generation
"""

import sys
import os
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_ai_pdf_generation():
    """Test PDF generation with AI responses included"""
    
    print("🤖 Testing AI-Integrated PDF Generation")
    print("=" * 50)
    
    try:
        from services.document_generation import document_service
        
        # Sample farmer data with AI assistance
        farmer_data_with_ai = {
            "farmer_name": "राजेश कुमार पाटील",
            "aadhaar_number": "1234-5678-9012",
            "contact_number": "+91-9876543210",
            "address": "गाव: शिरपूर, जिल्हा: धुळे, महाराष्ट्र",
            "loan_amount": "₹3,00,000",
            "loan_purpose": "खरीप हंगामासाठी यंत्रसामग्री खरेदी",
            "scheme_name": "प्रधानमंत्री किसान सम्मान निधी (PM-KISAN)",
            "land_details": {
                "survey_number": "123/1",
                "area": "7 एकर",
                "soil_type": "काळी मिट्टी"
            },
            # 🤖 AI assistance data
            "ai_assistance": {
                "user_question": "मला PM-KISAN योजनेसाठी अर्ज करायचा आहे. याची पात्रता काय आहे आणि कसे अर्ज करावा?",
                "ai_response": "नमस्कार शेतकरी भाऊ! PM-KISAN योजनेसाठी अर्ज करण्यासाठी तुम्ही खालील पात्रता पूर्ण करावी:\n\n1. भारतीय नागरिक असावे\n2. 2 हेक्टर पर्यंत शेतजमीन असावी\n3. आधार कार्ड, जमीन कागदपत्रे आणि बँक खाते असावे\n\nअर्ज करण्याची प्रक्रिया:\n• PM-KISAN वेबसाइटवर जा (pmkisan.gov.in)\n• 'Farmer Registration' वर क्लिक करा\n• आधार नंबर टाका\n• सर्व माहिती भरा\n• कागदपत्रे अपलोड करा\n• सबमिट करा\n\nयोजनेत वर्षातून ₹6000 तीन हप्त्यात मिळतात. पहिला हप्ता एप्रिल-जुलै, दुसरा ऑगस्ट-नोव्हेंबर आणि तिसरा डिसेंबर-मार्च मध्ये येतो.",
                "relevant_schemes": ["PM-KISAN", "PM Fasal Bima Yojana", "KCC Scheme"],
                "consultation_date": "25/07/2025",
                "consultation_time": "07:00 PM",
                "ai_model": "Gemini 2.5 Flash"
            }
        }
        
        print("📋 Testing loan application with AI assistance...")
        
        # Generate PDF with AI content
        result = document_service.generate_document(
            document_type="loan_application",
            farmer_data=farmer_data_with_ai,
            format_type="pdf"
        )
        
        if result["success"]:
            print(f"✅ AI-integrated PDF generated successfully!")
            print(f"   📁 File: {result['filename']}")
            print(f"   📍 Path: {result['file_path']}")
            print(f"   📊 File size: {os.path.getsize(result['file_path'])} bytes")
            print(f"   🕒 Generated at: {result['generated_at']}")
            
            return result
        else:
            print(f"❌ PDF generation failed: {result.get('error', 'Unknown error')}")
            return None
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_chat_session_pdf():
    """Test PDF generation with multiple AI chat exchanges"""
    
    print(f"\n💬 Testing Chat Session PDF Generation")
    print("=" * 50)
    
    try:
        from services.document_generation import document_service
        
        # Sample farmer data with AI chat session
        farmer_data_with_chat = {
            "farmer_name": "सुनीता देवी शर्मा",
            "purpose": "कृषी सल्लामसलत आणि योजना माहिती",
            "scheme_name": "AI-Recommended Schemes",
            # 💬 AI chat session data
            "ai_chat_session": {
                "total_questions": 3,
                "conversation_summary": [
                    {
                        "question": "मला ऊस लागवडीसाठी कर्ज हवे आहे. कोणती योजना चांगली?",
                        "ai_response": "ऊस लागवडीसाठी तुम्ही KCC (किसान क्रेडिट कार्ड) योजनेचा फायदा घेऊ शकता. याद्वारे 4% व्याजदराने कर्ज मिळते. PM-KISAN योजनेतूनही वर्षी ₹6000 मिळतात.",
                        "relevant_schemes": ["KCC Scheme", "PM-KISAN"]
                    },
                    {
                        "question": "पीक विम्यासाठी काय करावे?",
                        "ai_response": "PMFBY (प्रधानमंत्री फसल बीमा योजना) अंतर्गत पीक विमा करवा. ऊसासाठी फक्त 2% प्रीमियम भरावे लागते. नैसर्गिक आपत्तीमुळे पीक खराब झाल्यास भरपाई मिळते.",
                        "relevant_schemes": ["PMFBY", "Crop Insurance"]
                    },
                    {
                        "question": "सरकारकडून खत कसे मिळेल?",
                        "ai_response": "DBT (Direct Benefit Transfer) द्वारे खत सबसिडी थेट तुमच्या खात्यात येते. नजीकच्या खत दुकानात आधार कार्ड घेऊन जा. PM किसान सम्मान निधी योजनेत नोंदणी झाली असेल तर खत सहज मिळेल.",
                        "relevant_schemes": ["DBT Fertilizer", "PM-KISAN"]
                    }
                ],
                "session_date": "25/07/2025",
                "session_time": "07:15 PM",
                "ai_model": "Gemini 2.5 Flash",
                "note": "या दस्तावेजात AI द्वारे दिलेली माहिती संदर्भासाठी आहे. अचूक माहितीसाठी संबंधित कार्यालयाशी संपर्क साधा."
            }
        }
        
        print("📋 Testing general application with AI chat session...")
        
        # Generate PDF with chat session content
        result = document_service.generate_document(
            document_type="general_application",
            farmer_data=farmer_data_with_chat,
            format_type="pdf"
        )
        
        if result["success"]:
            print(f"✅ Chat session PDF generated successfully!")
            print(f"   📁 File: {result['filename']}")
            print(f"   📍 Path: {result['file_path']}")
            print(f"   📊 File size: {os.path.getsize(result['file_path'])} bytes")
            print(f"   💬 Contains 3 AI conversations")
            
            return result
        else:
            print(f"❌ PDF generation failed: {result.get('error', 'Unknown error')}")
            return None
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("🚀 Starting AI-Integrated PDF Generation Tests...\n")
    
    # Test 1: Single AI assistance
    result1 = test_ai_pdf_generation()
    
    # Test 2: Multiple AI chat exchanges
    result2 = test_chat_session_pdf()
    
    # Summary
    print(f"\n🎯 TEST SUMMARY")
    print("=" * 50)
    
    success_count = 0
    if result1:
        success_count += 1
        print("✅ AI Assistance PDF: SUCCESS")
    else:
        print("❌ AI Assistance PDF: FAILED")
    
    if result2:
        success_count += 1
        print("✅ Chat Session PDF: SUCCESS")
    else:
        print("❌ Chat Session PDF: FAILED")
    
    print(f"\n🏆 Results: {success_count}/2 tests passed")
    
    if success_count == 2:
        print("\n🎉 AI-Integrated PDF Generation is WORKING PERFECTLY!")
        print("   Gemini responses are now embedded in PDF documents!")
        print("   Farmers can get PDFs with AI assistance included!")
    else:
        print("\n⚠️  Some tests failed. Check the error messages above.")
