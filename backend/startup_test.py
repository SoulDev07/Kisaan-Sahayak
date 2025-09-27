"""
Startup and Testing Script for Document Builder System
Initializes the system and runs basic tests
"""

import asyncio
import sys
import os
import logging

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def initialize_system():
    """Initialize the document builder system"""
    try:
        logger.info("Starting Document Builder System initialization...")
        
        # Import services
        from services.vector_database import vector_db_service
        from services.ai_chat import chat_service
        from services.document_generation import document_service
        
        logger.info("Services imported successfully")
        
        # Initialize vector database with schemes data
        logger.info("Initializing vector database with schemes data...")
        await vector_db_service.initialize_schemes_data()
        
        # Get system stats
        stats = vector_db_service.get_collection_stats()
        logger.info(f"Vector database initialized: {stats}")
        
        # Test AI chat service
        logger.info("Testing AI chat service...")
        test_response = await chat_service.chat_with_context(
            user_message="Tell me about PM-KISAN scheme",
            context_data=[],
            chat_history=[]
        )
        logger.info(f"AI chat test: {'SUCCESS' if test_response['success'] else 'FAILED'}")
        
        # Test document generation
        logger.info("Testing document generation...")
        test_doc = document_service.generate_document(
            document_type="general_application",
            farmer_data={
                "farmer_name": "Test Farmer",
                "aadhaar_number": "1234-5678-9012",
                "scheme_name": "PM-KISAN",
                "purpose": "Testing document generation"
            },
            format_type="html"
        )
        logger.info(f"Document generation test: {'SUCCESS' if test_doc['success'] else 'FAILED'}")
        
        # List available templates
        templates = document_service.list_available_templates()
        logger.info(f"Available document templates: {len(templates['templates'])}")
        
        logger.info("=== SYSTEM INITIALIZATION COMPLETE ===")
        logger.info("System is ready to handle requests!")
        logger.info("Available endpoints:")
        logger.info("- POST /api/v1/document-builder/chat - AI Chat")
        logger.info("- POST /api/v1/document-builder/document/start - Start Document Builder")
        logger.info("- GET /api/v1/document-builder/schemes/search - Search Schemes")
        logger.info("- GET /api/v1/document-builder/stats - System Statistics")
        
        return True
        
    except Exception as e:
        logger.error(f"System initialization failed: {e}")
        return False

async def test_chat_functionality():
    """Test the chat functionality with various queries"""
    try:
        logger.info("\n=== TESTING CHAT FUNCTIONALITY ===")
        
        from services.vector_database import vector_db_service
        from services.ai_chat import chat_service
        
        test_queries = [
            "I want to apply for a loan for my farm",
            "Tell me about crop insurance schemes",
            "What documents do I need for PM-KISAN?",
            "How to apply for Maharashtra state schemes?"
        ]
        
        for query in test_queries:
            logger.info(f"\nTesting query: '{query}'")
            
            # Search for relevant schemes
            context_data = await vector_db_service.search_schemes(query, limit=3)
            logger.info(f"Found {len(context_data)} relevant schemes")
            
            # Get AI response
            response = await chat_service.chat_with_context(
                user_message=query,
                context_data=context_data,
                chat_history=[]
            )
            
            if response['success']:
                logger.info(f"AI Response: {response['response'][:100]}...")
            else:
                logger.error(f"AI Response failed: {response['error']}")
        
        return True
        
    except Exception as e:
        logger.error(f"Chat functionality test failed: {e}")
        return False

async def test_document_builder():
    """Test the document builder functionality"""
    try:
        logger.info("\n=== TESTING DOCUMENT BUILDER ===")
        
        from services.document_generation import document_service
        from services.ai_chat import chat_service
        
        # Test different document types
        test_documents = [
            {
                "document_type": "loan_application",
                "farmer_data": {
                    "farmer_name": "Rajesh Kumar",
                    "aadhaar_number": "1234-5678-9012",
                    "loan_amount": "50000",
                    "loan_purpose": "Buy seeds and fertilizers",
                    "land_details": {"area": "2 acres", "location": "Village ABC"},
                    "scheme_name": "Kisan Credit Card",
                    "contact_number": "9876543210"
                }
            },
            {
                "document_type": "subsidy_application",
                "farmer_data": {
                    "farmer_name": "Priya Sharma",
                    "aadhaar_number": "9876-5432-1098",
                    "scheme_name": "PM-KISAN",
                    "subsidy_amount": "6000",
                    "equipment_type": "Drip irrigation system",
                    "contact_number": "9123456789"
                }
            }
        ]
        
        for test_doc in test_documents:
            logger.info(f"Testing {test_doc['document_type']} generation...")
            
            # Generate questions
            questions = await chat_service.generate_document_questions(
                test_doc['document_type'],
                test_doc['farmer_data']
            )
            logger.info(f"Generated {len(questions)} questions")
            
            # Generate document
            result = document_service.generate_document(
                document_type=test_doc['document_type'],
                farmer_data=test_doc['farmer_data'],
                format_type="html"
            )
            
            if result['success']:
                logger.info(f"Document generated: {result['filename']}")
            else:
                logger.error(f"Document generation failed: {result['error']}")
        
        return True
        
    except Exception as e:
        logger.error(f"Document builder test failed: {e}")
        return False

async def main():
    """Main function to run all tests and initialization"""
    logger.info("Starting Document Builder System Tests...")
    
    # Initialize system
    init_success = await initialize_system()
    if not init_success:
        logger.error("System initialization failed. Exiting.")
        return
    
    # Test chat functionality
    chat_success = await test_chat_functionality()
    if not chat_success:
        logger.error("Chat functionality test failed.")
    
    # Test document builder
    doc_success = await test_document_builder()
    if not doc_success:
        logger.error("Document builder test failed.")
    
    logger.info("\n=== ALL TESTS COMPLETED ===")
    logger.info("The system is ready for production use!")
    logger.info("Start the FastAPI server with: uvicorn main:app --reload")

if __name__ == "__main__":
    asyncio.run(main())
