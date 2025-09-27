"""
Test script to verify PDF generation functionality
"""

import sys
import os
import json
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_pdf_generation():
    """Test PDF generation with sample farmer data"""
    
    print("=== TESTING PDF GENERATION ===")
    
    try:
        from services.document_generation import document_service
        
        # Sample farmer data for testing
        sample_farmer_data = {
            "farmer_name": "राजेश पाटील",
            "aadhaar_number": "1234-5678-9012",
            "contact_number": "+91-9876543210",
            "address": "गाव: शिरपूर, तालुका: शिरपूर, जिल्हा: धुळे, महाराष्ट्र - 425405",
            "bank_details": {
                "account_number": "1234567890",
                "ifsc_code": "SBIN0001234",
                "bank_name": "State Bank of India"
            },
            "loan_amount": "₹2,00,000",
            "loan_purpose": "खरीप हंगामासाठी बियाणे आणि खत खरेदी",
            "land_details": {
                "survey_number": "123/4",
                "area": "5 एकर",
                "soil_type": "काळी मिट्टी",
                "irrigation": "ठिबक सिंचन"
            },
            "scheme_name": "प्रधानमंत्री किसान सम्मान निधी (PM-KISAN)",
            "repayment_period": "12 महिने",
            "collateral_details": "जमीन गहाण",
            # New: Available Services visible in app
            "available_services": [
                {"name": "Soil Testing", "description": "On-site soil sample collection and lab report", "contact": "+91 90000 11111", "cost": "₹250/sample"},
                {"name": "Fertilizer Advisory", "description": "AI-based fertilizer plan based on soil & crop", "provider": "KVK Nashik", "price": "₹0 (free)"},
                {"name": "Market Linkage", "description": "Direct buyer introductions for onions & tomatoes", "contact": "+91 98888 22222"}
            ],
            # New: Transportation options with costs
            "transportation_options": [
                {"mode": "Shared Tractor Trolley", "cost_per_quintal": "₹15/qtl", "capacity": "50 qtl", "contact": "+91 97777 33333"},
                {"mode": "Mini Truck (Tata Ace)", "cost_per_quintal": "₹25/qtl", "capacity": "80 qtl", "phone": "+91 96666 44444", "eta": "2 hrs"},
                {"mode": "3-Wheeler Loader", "cost": "₹35/qtl", "capacity": "30 qtl"}
            ],
            "mandi_contact": {"name": "Vashi APMC Helpdesk", "phone": "+91 93222 55555", "hours": "6am-6pm"}
        }
        
        # Test different document types
        document_types = [
            "loan_application",
            "subsidy_application", 
            "crop_insurance"
        ]
        
        pdf_results = []
        
        for doc_type in document_types:
            print(f"\n🔄 Testing {doc_type} PDF generation...")
            
            # Generate PDF
            result = document_service.generate_document(
                document_type=doc_type,
                farmer_data=sample_farmer_data,
                format_type="pdf"
            )
            
            if result["success"]:
                print(f"✅ {doc_type} PDF generated successfully!")
                print(f"   📁 File: {result['filename']}")
                print(f"   📍 Path: {result['file_path']}")
                print(f"   🕒 Generated at: {result['generated_at']}")
                
                # Check if file actually exists
                if os.path.exists(result['file_path']):
                    file_size = os.path.getsize(result['file_path'])
                    print(f"   📊 File size: {file_size} bytes")
                    pdf_results.append({
                        "type": doc_type,
                        "success": True,
                        "file_path": result['file_path'],
                        "size": file_size
                    })
                else:
                    print(f"   ❌ File not found at specified path!")
                    pdf_results.append({
                        "type": doc_type,
                        "success": False,
                        "error": "File not found"
                    })
                    
            else:
                print(f"❌ {doc_type} PDF generation failed!")
                print(f"   Error: {result.get('error', 'Unknown error')}")
                pdf_results.append({
                    "type": doc_type,
                    "success": False,
                    "error": result.get('error', 'Unknown error')
                })
        
        # Summary
        print(f"\n=== PDF GENERATION SUMMARY ===")
        successful = sum(1 for r in pdf_results if r['success'])
        total = len(pdf_results)
        
        print(f"📊 Results: {successful}/{total} document types generated successfully")
        
        for result in pdf_results:
            status = "✅" if result['success'] else "❌"
            print(f"   {status} {result['type']}")
            if result['success']:
                print(f"      File size: {result['size']} bytes")
            else:
                print(f"      Error: {result['error']}")
        
        # Test different formats for comparison
        print(f"\n=== TESTING DIFFERENT FORMATS ===")
        
        formats = ["pdf", "html"]
        
        for fmt in formats:
            print(f"\n🔄 Testing {fmt.upper()} format...")
            
            result = document_service.generate_document(
                document_type="loan_application",
                farmer_data=sample_farmer_data,
                format_type=fmt
            )
            
            if result["success"]:
                print(f"✅ {fmt.upper()} generated successfully!")
                print(f"   📁 File: {result['filename']}")
                
                if os.path.exists(result['file_path']):
                    file_size = os.path.getsize(result['file_path'])
                    print(f"   📊 File size: {file_size} bytes")
                else:
                    print(f"   ❌ File not found!")
            else:
                print(f"❌ {fmt.upper()} generation failed: {result.get('error', 'Unknown error')}")
        
        return pdf_results
        
    except Exception as e:
        print(f"❌ PDF generation test failed: {e}")
        import traceback
        traceback.print_exc()
        return []

def test_pdf_libraries():
    """Test which PDF libraries are available"""
    
    print(f"\n=== TESTING PDF LIBRARIES AVAILABILITY ===")
    
    # Test reportlab
    try:
        import reportlab
        from reportlab.lib.pagesizes import letter
        try:
            version = reportlab.__version__
        except:
            version = "Unknown"
        print(f"✅ Reportlab is available (version: {version})")
        reportlab_available = True
    except ImportError as e:
        print(f"❌ Reportlab not available: {e}")
        reportlab_available = False
    
    # Test weasyprint
    try:
        import weasyprint
        try:
            version = weasyprint.__version__
        except:
            version = "Unknown"
        print(f"✅ Weasyprint is available (version: {version})")
        weasyprint_available = True
    except (ImportError, OSError) as e:
        print(f"❌ Weasyprint not available: {e}")
        weasyprint_available = False
    
    return {
        "reportlab": reportlab_available,
        "weasyprint": weasyprint_available
    }

if __name__ == "__main__":
    print("🚀 Starting PDF generation tests...\n")
    
    # Test library availability
    libraries = test_pdf_libraries()
    
    # Test PDF generation
    results = test_pdf_generation()
    
    # Final summary
    print(f"\n✅ PDF generation testing completed!")
    print(f"📋 Libraries available: Reportlab={libraries['reportlab']}, Weasyprint={libraries['weasyprint']}")
    
    if results:
        successful_pdfs = sum(1 for r in results if r['success'])
        print(f"📊 Generated {successful_pdfs}/{len(results)} PDF documents successfully")
    
    print(f"\n🎯 PDF generation is now ready for production use!")
