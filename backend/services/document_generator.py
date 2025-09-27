import os
import uuid
import asyncio
from datetime import datetime
from typing import Dict, Any
from fpdf import FPDF
import json
from .gemini import ask_gemini
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.schema import HumanMessage, SystemMessage

# Create temp directory for PDFs
TEMP_DIR = "temp_pdfs"
os.makedirs(TEMP_DIR, exist_ok=True)

# Initialize Gemini model
def get_gemini_model():
    """Initialize Gemini model with LangChain"""
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.7,
        max_tokens=2048
    )

# Scheme templates and requirements
SCHEME_TEMPLATES = {
    "PM-KISAN": {
        "title": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "description": "Direct income support of ₹6000 per year to farmers",
        "required_fields": [
            "farmer_name", "father_name", "aadhaar_number", "mobile_number",
            "village", "district", "state", "pincode", "land_area", "bank_account", "ifsc_code"
        ],
        "benefits": "₹6000 per year in three equal installments of ₹2000 each"
    },
    "PM Fasal Bima Yojana": {
        "title": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "description": "Comprehensive crop insurance scheme",
        "required_fields": [
            "farmer_name", "father_name", "aadhaar_number", "mobile_number",
            "village", "district", "state", "pincode", "land_area", "crop_type",
            "sowing_date", "bank_account", "ifsc_code"
        ],
        "benefits": "Crop insurance coverage against natural calamities and pests"
    },
    "Soil Health Card": {
        "title": "Soil Health Card Scheme",
        "description": "Soil testing and recommendation scheme",
        "required_fields": [
            "farmer_name", "father_name", "mobile_number", "village", "district",
            "state", "pincode", "land_area", "soil_sample_id"
        ],
        "benefits": "Free soil testing and personalized recommendations"
    }
}

async def generate_scheme_pdf(farmer_id: str, scheme_name: str, farmer_data: Dict[str, Any]) -> str:
    """
    Generate a professional PDF document for scheme application using Gemini and LangChain
    """
    try:
        # Get scheme template
        scheme_template = SCHEME_TEMPLATES.get(scheme_name, SCHEME_TEMPLATES["PM-KISAN"])
        
        # Prepare farmer data with defaults
        farmer_info = {
            "farmer_name": farmer_data.get("name", "Farmer Name"),
            "father_name": farmer_data.get("father_name", "Father's Name"),
            "aadhaar_number": farmer_data.get("aadhaar_number", "XXXX-XXXX-XXXX"),
            "mobile_number": farmer_data.get("phoneNumber", "Mobile Number"),
            "village": farmer_data.get("village", "Village"),
            "district": farmer_data.get("district", "District"),
            "state": farmer_data.get("state", "State"),
            "pincode": farmer_data.get("pincode", "PIN Code"),
            "land_area": farmer_data.get("farmSize", "Land Area"),
            "bank_account": farmer_data.get("bank_account", "Bank Account"),
            "ifsc_code": farmer_data.get("ifsc_code", "IFSC Code"),
            "crop_type": farmer_data.get("crop_type", "Crop Type"),
            "sowing_date": farmer_data.get("sowing_date", "Sowing Date")
        }
        
        # Generate document content using Gemini
        document_content = await generate_document_content(scheme_template, farmer_info)
        
        # Create PDF
        pdf_path = create_pdf_document(document_content, farmer_id, scheme_name)
        
        return pdf_path
        
    except Exception as e:
        raise Exception(f"Error generating PDF: {str(e)}")

async def generate_document_content(scheme_template: Dict, farmer_info: Dict) -> Dict:
    """
    Generate document content using Gemini and LangChain
    """
    try:
        # Create LangChain prompt
        prompt_template = PromptTemplate(
            input_variables=["scheme_title", "scheme_description", "benefits", "farmer_info"],
            template="""
You are an expert government document generator for Indian agricultural schemes.

Generate a professional, official-looking application document with the following requirements:

SCHEME DETAILS:
- Title: {scheme_title}
- Description: {scheme_description}
- Benefits: {benefits}

FARMER INFORMATION:
{farmer_info}

DOCUMENT REQUIREMENTS:
1. Create a formal government document with proper headers
2. Include the Government of India header at the top
3. Format with sections: Personal Details, Land Information, Bank Details, Declaration
4. Include placeholders for official stamps and signatures
5. Add a QR code description for digital verification
6. Use ONLY ENGLISH text for all fields (no Hindi or other languages)
7. Include appropriate legal disclaimers
8. Format dates in DD/MM/YYYY format
9. Make it look like an official government form

RESPONSE FORMAT:
Return a JSON object with:
- header: Document header with scheme name (English only)
- personal_details: Section with farmer's personal information (English only)
- land_details: Section with land and agricultural information (English only)
- bank_details: Section with banking information (English only)
- declaration: Legal declaration section (English only)
- footer: Document footer with disclaimers and QR code info (English only)
- application_number: Generate a unique application number
- date: Current date in DD/MM/YYYY format

IMPORTANT: Use only English text, no Hindi characters or transliterations.
"""
        )
        
        # Format farmer info for prompt
        farmer_info_text = "\n".join([f"- {key.replace('_', ' ').title()}: {value}" for key, value in farmer_info.items()])
        
        # Generate content using Gemini
        model = get_gemini_model()
        
        messages = [
            SystemMessage(content="You are an expert government document generator. Generate professional, official-looking documents for Indian agricultural schemes."),
            HumanMessage(content=prompt_template.format(
                scheme_title=scheme_template["title"],
                scheme_description=scheme_template["description"],
                benefits=scheme_template["benefits"],
                farmer_info=farmer_info_text
            ))
        ]
        
        response = await model.ainvoke(messages)
        
        # Parse JSON response
        try:
            # Try to extract JSON from the response
            response_text = response.content
            if isinstance(response_text, str):
                # Look for JSON in the response
                if '{' in response_text and '}' in response_text:
                    start = response_text.find('{')
                    end = response_text.rfind('}') + 1
                    json_str = response_text[start:end]
                    content = json.loads(json_str)
                else:
                    # If no JSON found, use fallback
                    content = create_fallback_content(scheme_template, farmer_info)
            else:
                content = create_fallback_content(scheme_template, farmer_info)
        except (json.JSONDecodeError, AttributeError):
            # If JSON parsing fails, create a structured response
            content = create_fallback_content(scheme_template, farmer_info)
        
        return content
        
    except Exception as e:
        print(f"LangChain error: {str(e)}")
        # Fallback to direct Gemini API
        try:
            return await generate_content_with_direct_gemini(scheme_template, farmer_info)
        except Exception as e2:
            print(f"Direct Gemini error: {str(e2)}")
            # Final fallback to basic content generation
            return create_fallback_content(scheme_template, farmer_info)

async def generate_content_with_direct_gemini(scheme_template: Dict, farmer_info: Dict) -> Dict:
    """
    Generate document content using direct Gemini API as fallback
    """
    try:
        from .gemini import ask_gemini
        
        prompt = f"""
You are an expert government document generator for Indian agricultural schemes.

Generate a professional, official-looking application document with the following requirements:

SCHEME DETAILS:
- Title: {scheme_template["title"]}
- Description: {scheme_template["description"]}
- Benefits: {scheme_template["benefits"]}

FARMER INFORMATION:
{chr(10).join([f"- {key.replace('_', ' ').title()}: {value}" for key, value in farmer_info.items()])}

DOCUMENT REQUIREMENTS:
1. Create a formal government document with proper headers
2. Include the Government of India header at the top
3. Format with sections: Personal Details, Land Information, Bank Details, Declaration
4. Include placeholders for official stamps and signatures
5. Add a QR code description for digital verification
6. Use ONLY ENGLISH text for all fields (no Hindi)
7. Include appropriate legal disclaimers
8. Format dates in DD/MM/YYYY format
9. Make it look like an official government form

RESPONSE FORMAT:
Return a JSON object with:
- header: Document header with scheme name
- personal_details: Section with farmer's personal information (English only)
- land_details: Section with land and agricultural information (English only)
- bank_details: Section with banking information (English only)
- declaration: Legal declaration section (English only)
- footer: Document footer with disclaimers and QR code info (English only)
- application_number: Generate a unique application number
- date: Current date in DD/MM/YYYY format

IMPORTANT: Use only English text, no Hindi characters or transliterations.
"""
        
        response = ask_gemini(prompt)
        
        if 'error' in response:
            raise Exception(response['error'])
        
        # Try to parse the response
        if isinstance(response, dict) and 'response' in response:
            response_text = response['response']
            if '{' in response_text and '}' in response_text:
                start = response_text.find('{')
                end = response_text.rfind('}') + 1
                json_str = response_text[start:end]
                return json.loads(json_str)
        
        # If response is already a dict with the expected structure
        if isinstance(response, dict) and 'header' in response:
            return response
            
        # Fallback to basic content
        return create_fallback_content(scheme_template, farmer_info)
        
    except Exception as e:
        print(f"Direct Gemini API error: {str(e)}")
        return create_fallback_content(scheme_template, farmer_info)

def create_fallback_content(scheme_template: Dict, farmer_info: Dict) -> Dict:
    """
    Create fallback document content if Gemini fails
    """
    current_date = datetime.now().strftime("%d/%m/%Y")
    application_number = f"APP/{datetime.now().strftime('%Y%m%d')}/{uuid.uuid4().hex[:8].upper()}"
    
    return {
        "header": f"""
        Government of India
        {scheme_template['title']}
        Application Form
        """,
        "personal_details": f"""
        PERSONAL DETAILS
        
        Name: {farmer_info['farmer_name']}
        Father's Name: {farmer_info['father_name']}
        Aadhaar Number: {farmer_info['aadhaar_number']}
        Mobile Number: {farmer_info['mobile_number']}
        Village: {farmer_info['village']}
        District: {farmer_info['district']}
        State: {farmer_info['state']}
        PIN Code: {farmer_info['pincode']}
        """,
        "land_details": f"""
        LAND DETAILS
        
        Land Area: {farmer_info['land_area']}
        Crop Type: {farmer_info['crop_type']}
        Sowing Date: {farmer_info['sowing_date']}
        """,
        "bank_details": f"""
        BANK DETAILS
        
        Bank Account: {farmer_info['bank_account']}
        IFSC Code: {farmer_info['ifsc_code']}
        """,
        "declaration": f"""
        DECLARATION
        
        I hereby declare that all the information provided above is true and correct to the best of my knowledge.
        
        Date: {current_date}
        Signature: _________________
        """,
        "footer": f"""
        Application Number: {application_number}
        Date of Application: {current_date}
        
        QR Code: [QR Code for Digital Verification]
        
        This is a computer-generated document for official use.
        """,
        "application_number": application_number,
        "date": current_date
    }

def sanitize_text(text: str) -> str:
    """
    Sanitize text to ensure it only contains ASCII characters
    """
    if not text:
        return ""
    # Remove or replace non-ASCII characters
    return text.encode('ascii', 'ignore').decode('ascii')

def create_pdf_document(content: Dict, farmer_id: str, scheme_name: str) -> str:
    """
    Create PDF document from generated content
    """
    try:
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{scheme_name.replace(' ', '_')}_{farmer_id}_{timestamp}.pdf"
        pdf_path = os.path.join(TEMP_DIR, filename)
        
        # Create PDF
        pdf = FPDF()
        pdf.add_page()
        
        # Set font for basic ASCII support
        pdf.set_font('Arial', '', 12)
        
        # Add header
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(0, 10, 'Government of India', ln=True, align='C')
        header_text = sanitize_text(str(content.get('header', '')).strip())
        pdf.cell(0, 10, header_text, ln=True, align='C')
        pdf.ln(10)
        
        # Add personal details
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'PERSONAL DETAILS', ln=True)
        pdf.set_font('Arial', '', 12)
        
        personal_details = str(content.get('personal_details', ''))
        for line in personal_details.strip().split('\n'):
            if line.strip():
                # Ensure only ASCII characters
                safe_line = sanitize_text(line.strip())
                pdf.cell(0, 8, safe_line, ln=True)
        pdf.ln(5)
        
        # Add land details
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'LAND DETAILS', ln=True)
        pdf.set_font('Arial', '', 12)
        
        land_details = str(content.get('land_details', ''))
        for line in land_details.strip().split('\n'):
            if line.strip():
                # Ensure only ASCII characters
                safe_line = sanitize_text(line.strip())
                pdf.cell(0, 8, safe_line, ln=True)
        pdf.ln(5)
        
        # Add bank details
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'BANK DETAILS', ln=True)
        pdf.set_font('Arial', '', 12)
        
        bank_details = str(content.get('bank_details', ''))
        for line in bank_details.strip().split('\n'):
            if line.strip():
                # Ensure only ASCII characters
                safe_line = sanitize_text(line.strip())
                pdf.cell(0, 8, safe_line, ln=True)
        pdf.ln(5)
        
        # Add declaration
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'DECLARATION', ln=True)
        pdf.set_font('Arial', '', 12)
        
        declaration = str(content.get('declaration', ''))
        for line in declaration.strip().split('\n'):
            if line.strip():
                # Ensure only ASCII characters
                safe_line = sanitize_text(line.strip())
                pdf.cell(0, 8, safe_line, ln=True)
        pdf.ln(5)
        
        # Add footer
        pdf.set_font('Arial', '', 10)
        footer = str(content.get('footer', ''))
        for line in footer.strip().split('\n'):
            if line.strip():
                # Ensure only ASCII characters
                safe_line = sanitize_text(line.strip())
                pdf.cell(0, 6, safe_line, ln=True)
        
        # Save PDF
        pdf.output(pdf_path)
        
        return pdf_path
        
    except Exception as e:
        raise Exception(f"Error creating PDF: {str(e)}") 