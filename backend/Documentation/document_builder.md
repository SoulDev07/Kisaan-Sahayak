# Document Builder Feature

## Overview
The Document Builder feature helps farmers create official government documents and forms by guiding them through an interactive question-answering process. It can extract information from existing documents through OCR and generate new documents based on farmer inputs.

## Components

### Router: `document_builder.py`
Handles HTTP endpoints for document building functionality:
- **POST `/document-builder/start`**: Initiates a document building session.
- **POST `/document-builder/answer`**: Processes user answers and generates new questions or completes the document.
- **POST `/document-builder/reset/{session_id}`**: Resets a session.
- **GET `/document-builder/download/{session_id}`**: Downloads the generated document.

### Service: `document_builder.py`
Core functionality for document generation:
- **run_ocr()**: Extracts text from uploaded document images.
- **start_builder()**: Initiates the document building process by analyzing the scheme and any provided documents.
- **process_answers()**: Processes user answers and determines next steps.
- **get_document_path()**: Retrieves the path to the generated document.

## Technical Details
- Uses Google Gemini AI for intelligent form filling assistance
- Implements OCR via pytesseract for document text extraction
- Generates PDF documents using fpdf
- Maintains stateful sessions using UUID-based session tracking

## Workflow
1. User starts a session by providing a scheme name and optionally uploading an existing document.
2. System extracts text from any uploaded documents using OCR.
3. Based on the scheme and extracted text, the system determines which fields are already present and which need to be collected.
4. System generates user-friendly questions in Hinglish to collect missing information.
5. User provides answers to the questions.
6. Once all necessary information is collected, the system generates an official-looking document in PDF format.
7. User can download the generated document.

## Prompt Improvement
The current prompts in the document builder could be enhanced by:

1. **Scheme-Specific Knowledge**: Improve the prompt with more specific details about different Indian agricultural schemes.
2. **Document Structure**: Enhance the prompt to generate more authentic-looking government documents with proper formatting, logos, and layout.
3. **Multilingual Support**: Improve prompts to handle multiple Indian languages more effectively.
4. **Field Validation**: Add prompting logic to validate that entered information matches expected formats (e.g., Aadhaar number format).
5. **OCR Enhancement**: Better handling of low-quality scanned documents and handwritten text.

## Usage Example
```python
# Example of using the Document Builder API
import requests

# Start a new document building session
start_url = "https://api.kisankiawaaz.com/document-builder/start"
files = {"file": open("existing_document.jpg", "rb")}
data = {"scheme_name": "PM Kisan Samman Nidhi"}
start_response = requests.post(start_url, files=files, data=data)
session_data = start_response.json()
session_id = session_data["session_id"]

# Answer questions
answer_url = "https://api.kisankiawaaz.com/document-builder/answer"
answers = {
    "session_id": session_id,
    "answers": {
        "farmer_name": "Raj Kumar",
        "aadhaar": "1234 5678 9012",
        "land_area": "5 acres"
    }
}
answer_response = requests.post(answer_url, json=answers)
result = answer_response.json()

# Download the document if it's ready
if result["document_ready"]:
    download_url = f"https://api.kisankiawaaz.com{result['document_url']}"
    document = requests.get(download_url)
    with open("completed_document.pdf", "wb") as f:
        f.write(document.content)
``` 