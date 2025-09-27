"""
Document Builder Router
Handles API endpoints for the farmer document builder system
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
import json
import logging
import uuid
import os
from datetime import datetime

# Import services
try:
    from services.vector_database import vector_db_service
except ImportError:
    # Fallback if vector_database service is not available
    vector_db_service = None

try:
    from services.ai_chat import chat_service
except ImportError:
    # Fallback if ai_chat service is not available
    chat_service = None

try:
    from services.document_generation import document_service
except ImportError:
    # Fallback if document_generation service is not available
    document_service = None

try:
    from models.document_builder import (
        DocumentBuilderStartRequest,
        DocumentBuilderStartResponse,
        DocumentBuilderAnswerRequest,
        DocumentBuilderAnswerResponse,
        DocumentBuilderQuestion
    )
except ImportError:
    # Fallback Pydantic models if the models module is not available
    class DocumentBuilderStartRequest(BaseModel):
        scheme_name: Optional[str] = None
        document_type: Optional[str] = None

    class DocumentBuilderStartResponse(BaseModel):
        session_id: str
        present_fields: Dict[str, Any]
        questions: List[Dict[str, str]]

    class DocumentBuilderAnswerRequest(BaseModel):
        session_id: str
        answers: Dict[str, Any]

    class DocumentBuilderAnswerResponse(BaseModel):
        session_id: str
        questions: List[Dict[str, str]]
        all_fields: Dict[str, Any]
        document_ready: bool
        document_url: Optional[str] = None

    class DocumentBuilderQuestion(BaseModel):
        field: str
        question: str

# Pydantic models for JSON requests
class PDFGenerationRequest(BaseModel):
    farmer_name: str
    aadhaar_number: Optional[str] = ""
    contact_number: Optional[str] = ""
    address: Optional[str] = ""
    document_type: Optional[str] = "general_application"
    format_type: Optional[str] = "pdf"
    # New optional sections
    available_services: Optional[Any] = None
    transportation_options: Optional[Any] = None
    mandi_contact: Optional[Any] = None

class AIPDFGenerationRequest(BaseModel):
    farmer_name: str
    user_question: str
    aadhaar_number: Optional[str] = ""
    contact_number: Optional[str] = ""
    address: Optional[str] = ""
    document_type: Optional[str] = "general_application"
    format_type: Optional[str] = "pdf"
    # New optional sections
    available_services: Optional[Any] = None
    transportation_options: Optional[Any] = None
    mandi_contact: Optional[Any] = None

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/document-builder", tags=["Document Builder"])

# In-memory storage for demo (in production, use Redis or database)
chat_sessions = {}
document_sessions = {}

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "document_builder",
        "timestamp": datetime.now().isoformat()
    }

@router.post("/initialize", response_model=Dict[str, Any])
async def initialize_system():
    """Initialize the document builder system with schemes data"""
    try:
        # Check if vector database service is available
        if vector_db_service is None:
            return {
                "success": False,
                "message": "Vector database service not available",
                "error": "vector_db_service not imported",
                "initialized_at": datetime.now().isoformat()
            }
        
        # Initialize vector database with schemes data
        await vector_db_service.initialize_schemes_data()
        
        # Get system stats
        stats = vector_db_service.get_collection_stats()
        
        return {
            "success": True,
            "message": "Document builder system initialized successfully",
            "stats": stats,
            "initialized_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to initialize system: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to initialize system: {str(e)}")

@router.post("/chat")
async def chat_with_ai(
    message: str = Form(...),
    session_id: Optional[str] = Form(None),
    farmer_data: Optional[str] = Form("{}")
):
    """
    Intelligent chat with AI assistant that can decide when to generate documents
    """
    try:
        # Parse farmer data if provided
        try:
            farmer_info = json.loads(farmer_data) if farmer_data else {}
        except:
            farmer_info = {}
            
        # Create or get session
        if not session_id:
            session_id = str(uuid.uuid4())
            chat_sessions[session_id] = {
                "history": [],
                "farmer_data": farmer_info,
                "created_at": datetime.now().isoformat()
            }
        
        session = chat_sessions.get(session_id, {
            "history": [],
            "farmer_data": farmer_info,
            "created_at": datetime.now().isoformat()
        })
        
        # Update farmer data in session
        if farmer_info:
            session["farmer_data"].update(farmer_info)
        
        logger.info(f"Chat request: {message[:50]}... for session {session_id}")
        
        # Extract scheme information from user message
        scheme_info = await chat_service.extract_scheme_info(message) if chat_service else {"keywords": [], "intent": "general"}
        
        # Search for relevant schemes
        context_data = []
        if scheme_info.get("keywords") and vector_db_service:
            search_query = " ".join(scheme_info["keywords"])
            context_data = await vector_db_service.search_schemes(search_query, limit=5)
        
        # Check if user is asking for document generation
        document_keywords = ["application", "apply", "document", "form", "generate", "create", "pdf", "loan", "subsidy", "insurance"]
        should_generate_document = any(keyword in message.lower() for keyword in document_keywords)
        
        # Determine document type from message
        suggested_document_type = None
        if "loan" in message.lower() or "credit" in message.lower():
            suggested_document_type = "loan_application"
        elif "insurance" in message.lower():
            suggested_document_type = "crop_insurance" 
        elif "subsidy" in message.lower():
            suggested_document_type = "subsidy_application"
        elif "kisan" in message.lower() and "card" in message.lower():
            suggested_document_type = "kisan_credit_card"
        
        # Enhanced system prompt for intelligent conversation
        enhanced_message = f"""
        User message: {message}
        
        Context about user:
        - Farmer name: {session["farmer_data"].get("farmer_name", "Not provided")}
        - Location: {session["farmer_data"].get("address", "Not provided")}
        
        Instructions for AI:
        1. If user is asking general questions about farming or schemes, provide helpful information
        2. If user wants to apply for something or needs documents, explain the process and mention you can generate documents
        3. Be conversational and helpful
        4. Use the scheme information provided as context
        5. Ask relevant follow-up questions when appropriate
        """
        
        # Get AI response with context
        if chat_service:
            ai_response = await chat_service.chat_with_context(
                user_message=enhanced_message,
                context_data=context_data,
                chat_history=session["history"]
            )
        else:
            # Fallback response if chat service is not available
            ai_response = {
                "response": "I'm here to help you with farming-related questions and document generation. Please let me know what you need assistance with.",
                "model": "fallback",
                "context_used": 0
            }
        
        # Update chat history
        session["history"].append({
            "role": "user",
            "content": message,
            "timestamp": datetime.now().isoformat()
        })
        
        session["history"].append({
            "role": "assistant", 
            "content": ai_response["response"],
            "timestamp": datetime.now().isoformat()
        })
        
        # Keep only recent history
        if len(session["history"]) > 20:
            session["history"] = session["history"][-20:]
        
        chat_sessions[session_id] = session
        
        return {
            "success": True,
            "session_id": session_id,
            "response": ai_response["response"],
            "context_schemes": [item["scheme_name"] for item in context_data[:3]],
            "suggested_actions": _get_suggested_actions(scheme_info, context_data),
            "should_generate_document": should_generate_document,
            "suggested_document_type": suggested_document_type,
            "model_info": {
                "model": ai_response.get("model", ""),
                "context_used": ai_response.get("context_used", 0)
            }
        }
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return {
            "success": False,
            "error": str(e),
            "response": "I encountered an error while processing your request. Please try again.",
            "session_id": session_id or str(uuid.uuid4())
        }

@router.post("/document/start", response_model=DocumentBuilderStartResponse)
async def start_document_builder(
    scheme_name: Optional[str] = Form(None),
    document_type: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Start the document building process
    """
    try:
        session_id = str(uuid.uuid4())
        
        # Handle file upload if provided
        uploaded_file_info = None
        if file:
            # Save uploaded file (in production, use proper file storage)
            file_path = f"./temp_documents/{session_id}_{file.filename}"
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)
            
            uploaded_file_info = {
                "filename": file.filename,
                "path": file_path,
                "size": len(content)
            }
        
        # Determine document type from scheme or user input
        if not document_type and scheme_name:
            # Try to infer document type from scheme name
            document_type = _infer_document_type(scheme_name)
        
        if not document_type:
            document_type = "general_application"
        
        # Get template information
        if document_service:
            template_info = document_service.get_template_info(document_type)
            if not template_info:
                raise HTTPException(status_code=400, detail=f"Document type '{document_type}' not supported")
        else:
            # Fallback template info if document service is not available
            template_info = {
                "required_fields": ["farmer_name", "contact_number", "address"],
                "template_name": document_type,
                "description": f"Template for {document_type}"
            }
        
        # Extract present fields from uploaded file or scheme info
        present_fields = {}
        if scheme_name:
            present_fields["scheme_name"] = scheme_name
        
        # Generate initial questions
        if chat_service:
            questions_data = await chat_service.generate_document_questions(document_type, present_fields)
            questions = [DocumentBuilderQuestion(field=q["field"], question=q["question"]) for q in questions_data]
        else:
            # Fallback questions if chat service is not available
            questions = [
                DocumentBuilderQuestion(field="farmer_name", question="What is your full name?"),
                DocumentBuilderQuestion(field="contact_number", question="What is your contact number?"),
                DocumentBuilderQuestion(field="address", question="What is your address?")
            ]
        
        # Store session data
        document_sessions[session_id] = {
            "document_type": document_type,
            "present_fields": present_fields,
            "required_fields": template_info["required_fields"],
            "uploaded_file": uploaded_file_info,
            "questions_asked": [q.field for q in questions],
            "created_at": datetime.now().isoformat()
        }
        
        return DocumentBuilderStartResponse(
            session_id=session_id,
            present_fields=present_fields,
            questions=questions
        )
        
    except Exception as e:
        logger.error(f"Document start error: {e}")
        raise HTTPException(status_code=500, detail=f"Document start error: {str(e)}")

@router.post("/document/answer", response_model=DocumentBuilderAnswerResponse)
async def answer_document_questions(request: DocumentBuilderAnswerRequest):
    """
    Process answers and generate follow-up questions or complete document
    """
    try:
        session = document_sessions.get(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Update present fields with answers
        session["present_fields"].update(request.answers)
        
        # Check if all required fields are present
        required_fields = set(session["required_fields"])
        present_fields = set(session["present_fields"].keys())
        missing_fields = required_fields - present_fields
        
        # Generate follow-up questions for missing fields
        questions = []
        document_ready = False
        document_url = None
        
        if missing_fields:
            # Generate questions for missing fields
            questions_data = await chat_service.generate_document_questions(
                session["document_type"], 
                session["present_fields"]
            )
            
            # Filter questions for missing fields only
            for q_data in questions_data:
                if q_data["field"] in missing_fields and q_data["field"] not in session["questions_asked"]:
                    questions.append(DocumentBuilderQuestion(field=q_data["field"], question=q_data["question"]))
                    session["questions_asked"].append(q_data["field"])
                
                if len(questions) >= 3:  # Limit to 3 questions at a time
                    break
        else:
            # All fields present, generate document
            document_ready = True
            if document_service:
                result = document_service.generate_document(
                    document_type=session["document_type"],
                    farmer_data=session["present_fields"],
                    format_type="html"  # Default to HTML for web display
                )
                
                if result["success"]:
                    document_url = f"/api/v1/document-builder/document/download/{request.session_id}"
                    session["generated_document"] = result
                else:
                    raise HTTPException(status_code=500, detail=f"Document generation failed: {result.get('error', 'Unknown error')}")
            else:
                # Fallback if document service is not available
                document_url = f"/api/v1/document-builder/document/download/{request.session_id}"
                session["generated_document"] = {
                    "success": True,
                    "filename": f"document_{request.session_id}.html",
                    "file_path": f"./generated_documents/document_{request.session_id}.html",
                    "document_type": session["document_type"],
                    "format": "html"
                }
        
        return DocumentBuilderAnswerResponse(
            session_id=request.session_id,
            questions=questions,
            all_fields=session["present_fields"],
            document_ready=document_ready,
            document_url=document_url
        )
        
    except Exception as e:
        logger.error(f"Answer processing error: {e}")
        raise HTTPException(status_code=500, detail=f"Answer processing error: {str(e)}")

@router.get("/document/download/{session_id}")
async def download_document(session_id: str):
    """
    Download the generated document
    """
    try:
        session = document_sessions.get(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if "generated_document" not in session:
            raise HTTPException(status_code=400, detail="Document not generated yet")
        
        doc_info = session["generated_document"]
        file_path = doc_info["file_path"]
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Generated document file not found")
        
        return FileResponse(
            path=file_path,
            filename=doc_info["filename"],
            media_type="text/html"
        )
        
    except Exception as e:
        logger.error(f"Document download error: {e}")
        raise HTTPException(status_code=500, detail=f"Download error: {str(e)}")

@router.post("/document/generate-pdf/{session_id}")
async def generate_pdf_document(session_id: str, format_type: str = "pdf"):
    """
    Generate PDF document for a completed session
    """
    try:
        session = document_sessions.get(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if not session.get("present_fields"):
            raise HTTPException(status_code=400, detail="Session has no data to generate document")
        
        # Generate PDF document
        if document_service:
            result = document_service.generate_document(
                document_type=session["document_type"],
                farmer_data=session["present_fields"],
                format_type=format_type
            )
        else:
            # Fallback if document service is not available
            result = {
                "success": True,
                "filename": f"document_{session_id}.{format_type}",
                "file_path": f"./generated_documents/document_{session_id}.{format_type}",
                "document_type": session["document_type"],
                "format": format_type,
                "generated_at": datetime.now().isoformat()
            }
        
        if result["success"]:
            session["generated_pdf"] = result
            
            return {
                "success": True,
                "message": f"{format_type.upper()} document generated successfully",
                "file_info": {
                    "filename": result["filename"],
                    "file_path": result["file_path"],
                    "document_type": result["document_type"],
                    "format": result["format"],
                    "generated_at": result["generated_at"]
                },
                "download_url": f"/api/v1/document-builder/document/download-pdf/{session_id}"
            }
        else:
            raise HTTPException(status_code=500, detail=f"Document generation failed: {result.get('error', 'Unknown error')}")
        
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")

@router.get("/document/download-pdf/{session_id}")
async def download_pdf_document(session_id: str):
    """
    Download the generated PDF document
    """
    try:
        session = document_sessions.get(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Check for PDF first, then fall back to HTML
        doc_info = session.get("generated_pdf") or session.get("generated_document")
        
        if not doc_info:
            raise HTTPException(status_code=400, detail="No document generated yet")
        
        file_path = doc_info["file_path"]
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Generated document file not found")
        
        # Determine media type based on file extension
        file_extension = os.path.splitext(file_path)[1].lower()
        media_type = "application/pdf" if file_extension == ".pdf" else "text/html"
        
        return FileResponse(
            path=file_path,
            filename=doc_info["filename"],
            media_type=media_type
        )
        
    except Exception as e:
        logger.error(f"PDF download error: {e}")
        raise HTTPException(status_code=500, detail=f"PDF download error: {str(e)}")

@router.get("/schemes/search")
async def search_schemes(
    query: str,
    limit: int = 10
):
    """
    Search for government schemes
    """
    try:
        results = await vector_db_service.search_schemes(query, limit=limit)
        
        return {
            "success": True,
            "query": query,
            "results": results,
            "count": len(results)
        }
        
    except Exception as e:
        logger.error(f"Scheme search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@router.get("/schemes/{scheme_name}")
async def get_scheme_details(scheme_name: str):
    """
    Get detailed information about a specific scheme
    """
    try:
        scheme_data = await vector_db_service.get_scheme_by_name(scheme_name)
        
        if not scheme_data:
            raise HTTPException(status_code=404, detail="Scheme not found")
        
        return {
            "success": True,
            "scheme": scheme_data
        }
        
    except Exception as e:
        logger.error(f"Scheme details error: {e}")
        raise HTTPException(status_code=500, detail=f"Scheme details error: {str(e)}")

@router.get("/templates")
async def list_document_templates():
    """
    List all available document templates
    """
    try:
        templates = document_service.list_available_templates()
        return {
            "success": True,
            "templates": templates
        }
        
    except Exception as e:
        logger.error(f"Templates list error: {e}")
        raise HTTPException(status_code=500, detail=f"Templates error: {str(e)}")

@router.get("/stats")
async def get_system_stats():
    """
    Get system statistics
    """
    try:
        vector_stats = vector_db_service.get_collection_stats()
        
        return {
            "success": True,
            "stats": {
                "vector_database": vector_stats,
                "active_chat_sessions": len(chat_sessions),
                "active_document_sessions": len(document_sessions),
                "available_templates": len(document_service.config.DOCUMENT_TEMPLATES)
            }
        }
        
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail=f"Stats error: {str(e)}")

def _get_suggested_actions(scheme_info: Dict[str, Any], context_data: List[Dict]) -> List[str]:
    """Generate suggested actions based on user intent and available schemes"""
    suggestions = []
    
    intent = scheme_info.get("intent", "")
    
    if intent == "apply" and context_data:
        suggestions.append("Start document builder for application")
        suggestions.append("View eligibility requirements")
    elif intent == "learn" and context_data:
        suggestions.append("Get detailed scheme information")
        suggestions.append("Compare similar schemes")
    else:
        suggestions.append("Search for relevant schemes")
        suggestions.append("Start general document builder")
    
    return suggestions

@router.post("/test-basic-pdf")
async def test_basic_pdf_generation(
    farmer_name: str = Form(...),
    document_type: str = Form("general_application")
):
    """
    Test basic PDF generation without AI
    """
    try:
        logger.info(f"Test PDF generation for: {farmer_name}")
        
        # Simple farmer data
        farmer_data = {
            "farmer_name": farmer_name,
            "aadhaar_number": "1234-5678-9012",
            "contact_number": "9876543210",
            "address": "Test Address"
        }
        
        # Generate PDF
        result = document_service.generate_document(
            document_type=document_type,
            farmer_data=farmer_data,
            format_type="pdf"
        )
        
        return {
            "success": result.get("success", False),
            "message": "Test PDF generation",
            "result": result
        }
        
    except Exception as e:
        logger.error(f"Test PDF error: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Test PDF generation failed"
        }

@router.post("/generate-pdf-with-ai-json")
async def generate_pdf_with_ai_json(request: AIPDFGenerationRequest):
    """
    Generate PDF with AI assistance - JSON endpoint
    """
    try:
        logger.info(f"AI PDF JSON generation request: {request}")
        
        # Generate AI response first
        ai_response = await chat_service.chat_with_context(
            user_message=request.user_question,
            context_data=[],
            chat_history=[]
        )
        
        # Prepare farmer data with AI assistance
        farmer_data = {
            "farmer_name": request.farmer_name,
            "aadhaar_number": request.aadhaar_number or "Not provided",
            "contact_number": request.contact_number or "Not provided",
            "address": request.address or "Not provided",
            "ai_assistance": {
                "question": request.user_question,
                "response": ai_response["response"],
                "model": ai_response.get("model", "Gemini 2.5 Flash")
            },
            # Pass through optional sections
            "available_services": request.available_services,
            "transportation_options": request.transportation_options,
            "mandi_contact": request.mandi_contact
        }
        
        # Generate PDF with AI integration
        result = document_service.generate_document(
            document_type=request.document_type,
            farmer_data=farmer_data,
            format_type=request.format_type
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": "AI-integrated PDF generated successfully",
                "filename": result["filename"],
                "document_id": result.get("document_id", str(uuid.uuid4())),
                "format": result["format"],
                "generated_at": result["generated_at"],
                "ai_response_preview": ai_response["response"][:100] + "..." if len(ai_response["response"]) > 100 else ai_response["response"],
                "relevant_schemes_count": len(ai_response.get("context_data", [])),
                "download_url": f"/api/v1/document-builder/download/{result['filename']}"
            }
        else:
            raise HTTPException(status_code=500, detail=f"PDF generation failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        logger.error(f"AI PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=f"AI PDF generation error: {str(e)}")

# New AI-integrated endpoints for frontend compatibility
@router.post("/generate-pdf-with-ai")
async def generate_pdf_with_ai(
    farmer_name: str = Form(...),
    user_question: str = Form(...),
    aadhaar_number: str = Form(""),
    contact_number: str = Form(""),
    address: str = Form(""),
    document_type: str = Form("general_application"),
    format_type: str = Form("pdf"),
    # New optional JSON strings or simple lists
    available_services: Optional[str] = Form(None),
    transportation_options: Optional[str] = Form(None),
    mandi_contact: Optional[str] = Form(None)
):
    """
    Generate PDF with AI assistance - Frontend compatible endpoint
    """
    try:
        logger.info(f"AI PDF generation request: farmer_name={farmer_name}, question={user_question[:50]}...")
        
        # Generate AI response first
        ai_response = await chat_service.chat_with_context(
            user_message=user_question,
            context_data=[],
            chat_history=[]
        )
        
        # Helper to coerce JSON-like strings
        def _coerce_json(value):
            if value is None:
                return None
            if isinstance(value, (list, dict)):
                return value
            if isinstance(value, str) and value.strip():
                try:
                    return json.loads(value)
                except Exception:
                    return value  # keep raw string if not JSON
            return None

        # Prepare farmer data with AI assistance
        farmer_data = {
            "farmer_name": farmer_name,
            "aadhaar_number": aadhaar_number,
            "contact_number": contact_number,
            "address": address,
            "ai_assistance": {
                "question": user_question,
                "response": ai_response["response"],
                "model": ai_response.get("model", "Gemini 2.5 Flash")
            },
            # New pass-through sections
            "available_services": _coerce_json(available_services),
            "transportation_options": _coerce_json(transportation_options),
            "mandi_contact": _coerce_json(mandi_contact)
        }
        
        # Generate PDF with AI integration
        result = document_service.generate_document(
            document_type=document_type,
            farmer_data=farmer_data,
            format_type=format_type
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": "AI-integrated PDF generated successfully",
                "filename": result["filename"],
                "document_id": result.get("document_id", str(uuid.uuid4())),
                "format": result["format"],
                "generated_at": result["generated_at"],
                "ai_response_preview": ai_response["response"][:100] + "..." if len(ai_response["response"]) > 100 else ai_response["response"],
                "relevant_schemes_count": len(ai_response.get("context_data", [])),
                "download_url": f"/api/v1/document-builder/download/{result['filename']}"
            }
        else:
            raise HTTPException(status_code=500, detail=f"PDF generation failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        logger.error(f"AI PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=f"AI PDF generation error: {str(e)}")

@router.post("/generate-pdf-json")
async def generate_basic_pdf_json(request: PDFGenerationRequest):
    """
    Generate basic PDF without AI - JSON endpoint
    """
    try:
        logger.info(f"JSON PDF generation request: {request}")
        
        # Prepare farmer data
        farmer_data = {
            "farmer_name": request.farmer_name,
            "aadhaar_number": request.aadhaar_number or "Not provided",
            "contact_number": request.contact_number or "Not provided", 
            "address": request.address or "Not provided",
            # Optional sections
            "available_services": request.available_services,
            "transportation_options": request.transportation_options,
            "mandi_contact": request.mandi_contact
        }
        
        logger.info(f"Farmer data prepared: {farmer_data}")
        
        # Generate PDF without AI
        result = document_service.generate_document(
            document_type=request.document_type,
            farmer_data=farmer_data,
            format_type=request.format_type
        )
        
        logger.info(f"Document generation result: {result}")
        
        if result["success"]:
            return {
                "success": True,
                "message": "PDF generated successfully",
                "filename": result["filename"],
                "document_id": result.get("document_id", str(uuid.uuid4())),
                "format": result["format"],
                "generated_at": result["generated_at"],
                "download_url": f"/api/v1/document-builder/download/{result['filename']}"
            }
        else:
            logger.error(f"PDF generation failed: {result.get('error', 'Unknown error')}")
            raise HTTPException(status_code=500, detail=f"PDF generation failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        logger.error(f"Basic PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Basic PDF generation error: {str(e)}")

@router.post("/generate-pdf")
async def generate_basic_pdf(
    request: Request,
    farmer_name: str = Form(...),
    aadhaar_number: str = Form(""),
    contact_number: str = Form(""),
    address: str = Form(""),
    document_type: str = Form("general_application"),
    format_type: str = Form("pdf"),
    # New optional JSON strings
    available_services: Optional[str] = Form(None),
    transportation_options: Optional[str] = Form(None),
    mandi_contact: Optional[str] = Form(None)
):
    """
    Generate basic PDF without AI - Frontend compatible endpoint
    """
    try:
        # Log the incoming request for debugging
        logger.info(f"Received request headers: {dict(request.headers)}")
        body = await request.body()
        logger.info(f"Request body: {body}")
        
        logger.info(f"Basic PDF generation request: farmer_name={farmer_name}, type={document_type}")
        logger.info(f"All parameters: name={farmer_name}, aadhaar={aadhaar_number}, contact={contact_number}, address={address}")
        
        # Helper to coerce JSON-like strings
        def _coerce_json(value):
            if value is None:
                return None
            if isinstance(value, (list, dict)):
                return value
            if isinstance(value, str) and value.strip():
                try:
                    return json.loads(value)
                except Exception:
                    return value
            return None

        # Prepare farmer data
        farmer_data = {
            "farmer_name": farmer_name,
            "aadhaar_number": aadhaar_number or "Not provided",
            "contact_number": contact_number or "Not provided", 
            "address": address or "Not provided",
            # Optional sections
            "available_services": _coerce_json(available_services),
            "transportation_options": _coerce_json(transportation_options),
            "mandi_contact": _coerce_json(mandi_contact)
        }
        
        logger.info(f"Farmer data prepared: {farmer_data}")
        
        # Generate PDF without AI
        result = document_service.generate_document(
            document_type=document_type,
            farmer_data=farmer_data,
            format_type=format_type
        )
        
        logger.info(f"Document generation result: {result}")
        
        if result["success"]:
            return {
                "success": True,
                "message": "PDF generated successfully",
                "filename": result["filename"],
                "document_id": result.get("document_id", str(uuid.uuid4())),
                "format": result["format"],
                "generated_at": result["generated_at"],
                "download_url": f"/api/v1/document-builder/download/{result['filename']}"
            }
        else:
            logger.error(f"PDF generation failed: {result.get('error', 'Unknown error')}")
            raise HTTPException(status_code=500, detail=f"PDF generation failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        logger.error(f"Basic PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Basic PDF generation error: {str(e)}")

@router.get("/download/{document_id}")
async def download_document_by_id(document_id: str):
    """
    Download document by ID - Frontend compatible endpoint
    """
    try:
        # Try to find the file in the documents directory
        documents_dir = "./generated_documents"
        if os.path.exists(documents_dir):
            for file_name in os.listdir(documents_dir):
                if document_id in file_name:
                    file_path = os.path.join(documents_dir, file_name)
                    if os.path.exists(file_path):
                        # Determine media type
                        file_extension = os.path.splitext(file_path)[1].lower()
                        media_type = "application/pdf" if file_extension == ".pdf" else "text/html"
                        
                        return FileResponse(
                            path=file_path,
                            filename=file_name,
                            media_type=media_type
                        )
        
        # If not found, check document sessions
        for session_id, session in document_sessions.items():
            if document_id in session_id:
                doc_info = session.get("generated_pdf") or session.get("generated_document")
                if doc_info and os.path.exists(doc_info["file_path"]):
                    file_extension = os.path.splitext(doc_info["file_path"])[1].lower()
                    media_type = "application/pdf" if file_extension == ".pdf" else "text/html"
                    
                    return FileResponse(
                        path=doc_info["file_path"],
                        filename=doc_info["filename"],
                        media_type=media_type
                    )
        
        raise HTTPException(status_code=404, detail="Document not found")
        
    except Exception as e:
        logger.error(f"Document download error: {e}")
        raise HTTPException(status_code=500, detail=f"Download error: {str(e)}")

def _infer_document_type(scheme_name: str) -> str:
    """Infer document type from scheme name"""
    scheme_lower = scheme_name.lower()
    
    if "loan" in scheme_lower or "credit" in scheme_lower:
        return "loan_application"
    elif "insurance" in scheme_lower or "pmfby" in scheme_lower:
        return "crop_insurance"
    elif "subsidy" in scheme_lower or "machinery" in scheme_lower:
        return "subsidy_application"
    elif "organic" in scheme_lower:
        return "organic_certification"
    else:
        return "general_application"
