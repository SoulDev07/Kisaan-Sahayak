# Document Builder System for Farmers

## Overview

This is a comprehensive document builder system designed specifically for Indian farmers to interact with government schemes through:

1. **Beautiful Scheme Cards** - Visual representation of government schemes
2. **AI Chatbot Integration** - Human-like responses using Gemini 2.5 Flash
3. **Document Builder** - Automated document generation for scheme applications
4. **Fastest Retrieval** - Quick access to scheme information and requirements

## System Architecture

```
├── services/
│   ├── vector_database.py      # Fast scheme search & retrieval
│   ├── ai_chat.py             # Gemini 2.5 Flash integration
│   └── document_generation.py  # PDF/Word document creation
├── routers/
│   └── document_builder.py    # API endpoints
├── models/
│   └── document_builder.py    # Data models
└── config_document_builder.py # System configuration
```

## Key Features

### 🤖 AI Chatbot (Gemini 2.5 Flash)
- Human-like conversational responses
- Context-aware assistance based on government schemes
- Follow-up questions for better assistance
- Integration with comprehensive schemes database

### 📄 Document Builder
- 8+ document templates (loan applications, subsidy forms, insurance, etc.)
- AI-generated questions based on document type
- Automatic document generation in HTML/PDF/Word formats
- Pre-filled forms using scheme information

### 🔍 Fastest Scheme Retrieval
- Vector-based search for government schemes
- Central Government schemes (PM-KISAN, PMFBY, MIDH, etc.)
- State-specific schemes (Maharashtra)
- Real-time search with relevance scoring

### 🎨 Beautiful Cards Interface
- Visual scheme cards with key information
- Eligibility criteria and benefits display
- Direct application links and helpline numbers
- Mobile-responsive design

## API Endpoints

### Chat & Assistance
```
POST /api/v1/document-builder/chat
- message: User query
- session_id: Chat session (optional)
```

### Document Builder
```
POST /api/v1/document-builder/document/start
- scheme_name: Government scheme (optional)
- document_type: Type of document needed
- file: Upload existing document (optional)

POST /api/v1/document-builder/document/answer
- session_id: Document session
- answers: Field answers from user
```

### Scheme Search
```
GET /api/v1/document-builder/schemes/search?query=loan&limit=10
GET /api/v1/document-builder/schemes/{scheme_name}
```

### System Management
```
POST /api/v1/document-builder/initialize
GET /api/v1/document-builder/stats
GET /api/v1/document-builder/templates
```

## Installation & Setup

### 1. Install Dependencies
```bash
pip install -r requirements_document_builder.txt
```

### 2. Initialize System
```bash
python startup_test.py
```

### 3. Start Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Access API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Configuration

Edit `config_document_builder.py` to customize:

- **Google AI Settings**: API key, model version, temperature
- **Document Templates**: Add new templates and required fields
- **System Prompts**: Customize AI behavior and responses
- **File Storage**: Configure document output directories

## Document Templates

Currently supported document types:

1. **loan_application** - Agricultural loan applications
2. **subsidy_application** - Government subsidy forms
3. **crop_insurance** - PMFBY crop insurance enrollment
4. **land_records** - Land ownership certificates
5. **income_certificate** - Agricultural income declarations
6. **machinery_subsidy** - Farm machinery subsidy applications
7. **organic_certification** - PGS-India organic farming certification
8. **general_application** - Generic government scheme applications

## Usage Examples

### 1. Chat with AI Assistant
```python
import requests

response = requests.post("http://localhost:8000/api/v1/document-builder/chat", 
    data={
        "message": "I want to apply for PM-KISAN scheme. What documents do I need?"
    }
)
print(response.json()["response"])
```

### 2. Start Document Builder
```python
response = requests.post("http://localhost:8000/api/v1/document-builder/document/start",
    data={
        "scheme_name": "PM-KISAN",
        "document_type": "subsidy_application"
    }
)
session_id = response.json()["session_id"]
questions = response.json()["questions"]
```

### 3. Search Government Schemes
```python
response = requests.get("http://localhost:8000/api/v1/document-builder/schemes/search?query=crop insurance")
schemes = response.json()["results"]
```

## Testing

The system includes comprehensive tests in `startup_test.py`:

- **System Initialization**: Vector database setup with schemes data
- **AI Chat Testing**: Multiple query types and context handling
- **Document Generation**: Template processing and file creation
- **Scheme Search**: Vector search accuracy and performance

## Database Integration

The system uses the comprehensive schemes database from `schemes.json` containing:

- **Central Government Schemes**: PM-KISAN, PMFBY, MIDH, PKVY, SHC, SMAM, NFSM, NMEO-OP, PM-AASHA
- **Maharashtra State Schemes**: MahaDBT portal integration, state-specific subsidies
- **Complete Information**: Eligibility, application processes, required documents, contact details

## Performance Optimization

- **In-Memory Search**: Fast fallback until ChromaDB is fully integrated
- **Session Management**: Efficient chat and document session handling
- **Lazy Loading**: Components loaded only when needed
- **Caching**: Reduce API calls through intelligent caching

## Security Features

- **Session-Based Access**: Secure document and chat sessions
- **File Upload Validation**: Safe file handling and storage
- **API Rate Limiting**: Prevent abuse and ensure fair usage
- **Data Privacy**: Secure handling of farmer personal information

## Future Enhancements

1. **ChromaDB Integration**: Full vector database implementation
2. **Advanced PDF Generation**: ReportLab and WeasyPrint integration
3. **Multi-Language Support**: Regional language interfaces
4. **Voice Integration**: Voice-to-text document filling
5. **Mobile App Integration**: React Native or Flutter support

## Support & Maintenance

- **Logging**: Comprehensive logging for debugging and monitoring
- **Error Handling**: Graceful error handling with user-friendly messages
- **Health Checks**: System health monitoring endpoints
- **Documentation**: Auto-generated API documentation

## Contributing

To add new document templates:

1. Add template configuration to `config_document_builder.py`
2. Create corresponding HTML template (optional)
3. Update document generation logic in `document_generation.py`
4. Test with `startup_test.py`

## License

This system is built for supporting Indian farmers and agricultural development initiatives.

---

**Status**: ✅ Ready for Production
**Last Updated**: July 25, 2025
**Version**: 2.0.0
