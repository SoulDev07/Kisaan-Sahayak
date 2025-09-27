"""
Test script to verify schemes.json data loading and processing
"""

import sys
import os
import json

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_schemes_json_loading():
    """Test loading and processing of schemes.json data"""
    
    schemes_file_path = "C:/Users/vinay/OneDrive/Desktop/unoff-google/google-agentic-ai/MyApp/data/schemes.json"
    
    print("=== TESTING SCHEMES.JSON DATA LOADING ===")
    
    # Test 1: Load raw JSON data
    try:
        with open(schemes_file_path, 'r', encoding='utf-8') as file:
            schemes_data = json.load(file)
        
        print(f"✅ Successfully loaded schemes.json")
        print(f"📊 File size: {os.path.getsize(schemes_file_path)} bytes")
        
        # Analyze structure
        print(f"\n📋 Data Structure:")
        for key in schemes_data.keys():
            print(f"  - {key}: {type(schemes_data[key])}")
        
        # Count schemes
        central_schemes = schemes_data.get('centralGovernmentSchemes', [])
        maharashtra_schemes = schemes_data.get('maharashtraStateSpecificSchemes', [])
        
        # Filter out empty schemes
        valid_central_schemes = [s for s in central_schemes if s and s.get('schemeName')]
        valid_maharashtra_schemes = [s for s in maharashtra_schemes if s and s.get('schemeName')]
        
        print(f"\n📈 Scheme Counts:")
        print(f"  - Total Central Government Schemes: {len(central_schemes)}")
        print(f"  - Valid Central Government Schemes: {len(valid_central_schemes)}")
        print(f"  - Total Maharashtra State Schemes: {len(maharashtra_schemes)}")
        print(f"  - Valid Maharashtra State Schemes: {len(valid_maharashtra_schemes)}")
        
        # Show sample schemes
        print(f"\n🔍 Sample Central Government Schemes:")
        for i, scheme in enumerate(valid_central_schemes[:5]):
            scheme_name = scheme.get('schemeName', 'Unknown')
            objective = scheme.get('primaryObjective', 'No objective')
            print(f"  {i+1}. {scheme_name} - {objective[:50]}...")
        
        print(f"\n🔍 Sample Maharashtra State Schemes:")
        for i, scheme in enumerate(valid_maharashtra_schemes[:5]):
            scheme_name = scheme.get('schemeName', 'Unknown')
            objective = scheme.get('primaryObjective', 'No objective')
            print(f"  {i+1}. {scheme_name} - {objective[:50]}...")
        
        return schemes_data
        
    except Exception as e:
        print(f"❌ Failed to load schemes.json: {e}")
        return None

def test_vector_database_with_real_data():
    """Test vector database initialization with real schemes data"""
    
    print(f"\n=== TESTING VECTOR DATABASE WITH REAL DATA ===")
    
    try:
        from services.vector_database import vector_db_service
        
        # Initialize with real data
        import asyncio
        
        async def run_test():
            await vector_db_service.initialize_schemes_data()
            
            # Get stats
            stats = vector_db_service.get_collection_stats()
            print(f"✅ Vector database initialized:")
            print(f"  - Total documents: {stats['total_documents']}")
            print(f"  - Collection name: {stats['collection_name']}")
            print(f"  - Status: {stats['status']}")
            
            # Test search functionality
            print(f"\n🔍 Testing search functionality:")
            
            test_queries = [
                "PM-KISAN direct benefit transfer",
                "crop insurance PMFBY",
                "Maharashtra state schemes",
                "organic farming certification",
                "farm machinery subsidy"
            ]
            
            for query in test_queries:
                results = await vector_db_service.search_schemes(query, limit=3)
                print(f"  Query: '{query}' -> {len(results)} results")
                
                if results:
                    top_result = results[0]
                    print(f"    Top result: {top_result['scheme_name']} (score: {top_result['similarity_score']:.3f})")
        
        asyncio.run(run_test())
        
    except Exception as e:
        print(f"❌ Vector database test failed: {e}")
        import traceback
        traceback.print_exc()

def test_ai_chat_with_real_context():
    """Test AI chat with real scheme context"""
    
    print(f"\n=== TESTING AI CHAT WITH REAL CONTEXT ===")
    
    try:
        from services.ai_chat import chat_service
        from services.vector_database import vector_db_service
        
        async def run_chat_test():
            # First ensure vector database is initialized
            await vector_db_service.initialize_schemes_data()
            
            test_queries = [
                "I am a small farmer in Maharashtra. What schemes can help me get a loan?",
                "Tell me about PM-KISAN scheme eligibility and benefits",
                "I need crop insurance for my rice and wheat crops"
            ]
            
            for query in test_queries:
                print(f"\n👤 User Query: '{query}'")
                
                # Get relevant context
                context_data = await vector_db_service.search_schemes(query, limit=5)
                print(f"🔍 Found {len(context_data)} relevant schemes for context")
                
                # Get AI response
                response = await chat_service.chat_with_context(
                    user_message=query,
                    context_data=context_data,
                    chat_history=[]
                )
                
                if response['success']:
                    print(f"🤖 AI Response: {response['response'][:200]}...")
                    print(f"📊 Context used: {response.get('context_used', 0)} schemes")
                else:
                    print(f"❌ AI response failed: {response['error']}")
        
        import asyncio
        asyncio.run(run_chat_test())
        
    except Exception as e:
        print(f"❌ AI chat test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 Starting comprehensive data loading tests...\n")
    
    # Test 1: Raw JSON loading
    schemes_data = test_schemes_json_loading()
    
    if schemes_data:
        # Test 2: Vector database with real data
        test_vector_database_with_real_data()
        
        # Test 3: AI chat with real context
        test_ai_chat_with_real_context()
    
    print(f"\n✅ All tests completed!")
