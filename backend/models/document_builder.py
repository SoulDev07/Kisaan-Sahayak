from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class DocumentBuilderStartRequest(BaseModel):
    scheme_name: Optional[str] = Field(None, description="Name or description of the scheme")
    # file will be handled via FormData in FastAPI endpoint

class DocumentBuilderAnswerRequest(BaseModel):
    session_id: str
    answers: Dict[str, str]

class DocumentBuilderQuestion(BaseModel):
    field: str
    question: str

class DocumentBuilderStartResponse(BaseModel):
    session_id: str
    present_fields: Dict[str, str]
    questions: List[DocumentBuilderQuestion]

class DocumentBuilderAnswerResponse(BaseModel):
    session_id: str
    questions: List[DocumentBuilderQuestion]
    all_fields: Dict[str, str]
    document_ready: bool = False
    document_url: Optional[str] = None 