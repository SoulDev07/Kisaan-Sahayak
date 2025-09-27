#!/usr/bin/env python3
"""
Test script to verify Gemini integration fix
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

def test_gemini_import():
    """Test if we can import the ask_gemini function"""
    try:
        from services.gemini import ask_gemini
        print("✅ Successfully imported ask_gemini function")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_gemini_api():
    """Test if Gemini API is working"""
    try:
        from services.gemini import ask_gemini
        
        # Simple test prompt
        test_prompt = "Generate a simple JSON response with a greeting message."
        
        print("🧪 Testing Gemini API...")
        response = ask_gemini(test_prompt)
        
        if 'error' in response:
            print(f"❌ Gemini API error: {response['error']}")
            return False
        else:
            print("✅ Gemini API is working")
            print(f"Response: {response}")
            return True
            
    except Exception as e:
        print(f"❌ Error testing Gemini API: {e}")
        return False

def test_document_generation():
    """Test document generation service"""
    try:
        from services.document_generator import generate_scheme_pdf
        
        # Test farmer data
        farmer_data = {
            "name": "Test Farmer",
            "phoneNumber": "+91 98765 43210",
            "village": "Test Village",
            "farmSize": "2 acres"
        }
        
        print("🧪 Testing document generation...")
        
        # This will test the async function
        async def run_test():
            try:
                pdf_path = await generate_scheme_pdf(
                    farmer_id="test001",
                    scheme_name="PM-KISAN",
                    farmer_data=farmer_data
                )
                print(f"✅ Document generated: {pdf_path}")
                return True
            except Exception as e:
                print(f"❌ Document generation error: {e}")
                return False
        
        return asyncio.run(run_test())
        
    except Exception as e:
        print(f"❌ Error testing document generation: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Testing Gemini Integration Fix")
    print("=" * 40)
    
    # Check environment variables
    if not os.getenv("GOOGLE_API_KEY"):
        print("⚠️  GOOGLE_API_KEY not found in environment variables")
        print("Using fallback API key...")
    
    # Test imports
    if not test_gemini_import():
        print("❌ Import test failed")
        return
    
    # Test Gemini API
    if not test_gemini_api():
        print("❌ Gemini API test failed")
        return
    
    # Test document generation
    if not test_document_generation():
        print("❌ Document generation test failed")
        return
    
    print("\n" + "=" * 40)
    print("🎉 All tests passed! Gemini integration is working.")

if __name__ == "__main__":
    main() 