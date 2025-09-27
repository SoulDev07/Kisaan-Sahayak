# Document Generation & WhatsApp Integration

This feature generates professional PDF documents for agricultural scheme applications and sends them via WhatsApp using Twilio.

## 🚀 Features

- **AI-Powered Document Generation**: Uses Gemini + LangChain to create professional government documents
- **WhatsApp Integration**: Sends PDF documents directly via WhatsApp using Twilio
- **Multiple Scheme Support**: PM-KISAN, PM Fasal Bima Yojana, Soil Health Card, and more
- **Bilingual Documents**: Hindi and English text support
- **Professional Formatting**: Official government document styling with QR codes and signatures

## 📋 Prerequisites

### Environment Variables
Add these to your `.env` file:

```env
# Google Gemini API
GOOGLE_API_KEY=your_google_api_key_here

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_whatsapp_number
```

### Dependencies
Install required packages:

```bash
pip install -r requirements_new.txt
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd KisanKiAwaaz-Backend/backend
pip install twilio==8.10.0 fpdf==1.7.2 langchain==0.1.0 langchain-google-genai==0.0.6
```

### 2. Configure Environment Variables

Create or update your `.env` file with the required credentials:

```env
# Google Gemini API Key
GOOGLE_API_KEY=your_google_api_key_here

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886  # Your Twilio WhatsApp number
```

### 3. Test the Integration

Run the test script to verify everything works:

```bash
python test_document_generation.py
```

## 📱 API Endpoints

### Generate and Send PDF Document

**POST** `/document/generate-pdf`

**Request Body:**
```json
{
  "farmer_id": "f001",
  "scheme_name": "PM-KISAN",
  "phone_number": "+917020744317",
  "farmer_data": {
    "name": "Vinayak Bhatia",
    "father_name": "Suresh Sharma",
    "phoneNumber": "+91 98765 43210",
    "village": "Shirur, Maharashtra",
    "district": "Pune",
    "state": "Maharashtra",
    "pincode": "411046",
    "farmSize": "5 acres",
    "aadhaar_number": "1234-5678-9012",
    "bank_account": "SBI12345678901",
    "ifsc_code": "SBIN0001234",
    "crop_type": "Wheat",
    "sowing_date": "15/11/2024"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document generated and sent successfully",
  "pdf_path": "temp_pdfs/PM-KISAN_f001_20241215_143022.pdf"
}
```

### Health Check

**GET** `/document/health`

**Response:**
```json
{
  "status": "healthy",
  "service": "document_generator"
}
```

## 📄 Supported Schemes

### 1. PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)
- **Benefits**: ₹6000 per year in three installments
- **Required Fields**: Name, Aadhaar, Bank details, Land records

### 2. PM Fasal Bima Yojana (PMFBY)
- **Benefits**: Crop insurance coverage
- **Required Fields**: Crop details, Land information, Bank details

### 3. Soil Health Card
- **Benefits**: Free soil testing and recommendations
- **Required Fields**: Land details, Soil sample information

## 🔧 File Structure

```
backend/
├── routers/
│   └── document_generator.py          # API endpoints
├── services/
│   ├── document_generator.py          # PDF generation logic
│   └── whatsapp_service.py           # WhatsApp integration
├── temp_pdfs/                        # Generated PDF storage
├── test_document_generation.py       # Test script
└── requirements_new.txt              # Dependencies
```

## 🧪 Testing

### Manual Testing

1. **Test Document Generation:**
```bash
python test_document_generation.py
```

2. **Test API Endpoint:**
```bash
curl -X POST "http://localhost:8000/document/generate-pdf" \
  -H "Content-Type: application/json" \
  -d '{
    "farmer_id": "f001",
    "scheme_name": "PM-KISAN",
    "phone_number": "+917020744317",
    "farmer_data": {
      "name": "Vinayak Bhatia",
      "phoneNumber": "+91 98765 43210",
      "village": "Shirur, Maharashtra",
      "farmSize": "5 acres"
    }
  }'
```

### Expected Results

1. ✅ PDF document generated in `temp_pdfs/` directory
2. ✅ WhatsApp message sent to the specified number
3. ✅ Professional document with government styling
4. ✅ Bilingual (Hindi/English) content

## 🚨 Troubleshooting

### Common Issues

1. **Twilio Authentication Error**
   - Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
   - Check if Twilio account is active

2. **Google API Key Error**
   - Verify `GOOGLE_API_KEY` is valid
   - Check API quota and billing

3. **PDF Generation Failed**
   - Check if `temp_pdfs/` directory exists
   - Verify write permissions

4. **WhatsApp Message Not Sent**
   - Verify phone number format (+91XXXXXXXXXX)
   - Check Twilio WhatsApp sandbox setup

### Debug Commands

```bash
# Check environment variables
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('GOOGLE_API_KEY:', bool(os.getenv('GOOGLE_API_KEY'))); print('TWILIO_ACCOUNT_SID:', bool(os.getenv('TWILIO_ACCOUNT_SID')))"

# Test Twilio connection
python -c "from services.whatsapp_service import test_whatsapp_connection; import asyncio; asyncio.run(test_whatsapp_connection())"
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Run the test script to identify specific issues
4. Check Twilio and Google API documentation

## 🔄 Updates

- **v1.0**: Initial implementation with PM-KISAN support
- **v1.1**: Added multiple scheme templates
- **v1.2**: Enhanced WhatsApp integration with rich messages
- **v1.3**: Added bilingual document support 