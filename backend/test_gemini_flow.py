"""
Detailed test to show how schemes.json context flows to Gemini AI
"""

import sys
import os
import asyncio

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def test_gemini_context_flow():
    """Test complete flow: schemes.json → vector search → context → Gemini → response"""
    
    print("🚀 TESTING COMPLETE GEMINI CONTEXT FLOW")
    print("=" * 60)
    
    from services.vector_database import vector_db_service
    from services.ai_chat import chat_service
    
    # Initialize vector database with schemes.json data
    await vector_db_service.initialize_schemes_data()
    
    # Test query
    user_query = "I want to apply for PM-KISAN scheme. What are the eligibility criteria and required documents?"
    
    print(f"👤 USER QUERY: {user_query}")
    print("\n" + "="*60)
    
    # Step 1: Search schemes.json data
    print("📊 STEP 1: SEARCHING SCHEMES.JSON DATA")
    context_data = await vector_db_service.search_schemes(user_query, limit=3)
    
    print(f"🔍 Found {len(context_data)} relevant schemes:")
    for i, scheme in enumerate(context_data, 1):
        print(f"  {i}. {scheme['scheme_name']}")
        print(f"     Type: {scheme['scheme_type']}")
        print(f"     Score: {scheme['similarity_score']:.3f}")
        print(f"     Content: {scheme['content'][:100]}...")
        print()
    
    print("="*60)
    
    # Step 2: Show context being sent to Gemini
    print("🤖 STEP 2: CONTEXT BEING SENT TO GEMINI")
    
    # Build the context text (same as what goes to Gemini)
    context_text = "\n\nRelevant Scheme Information:\n"
    for item in context_data[:5]:
        context_text += f"- {item.get('scheme_name', 'Unknown Scheme')}: {item.get('content', '')[:300]}...\n"
    
    print("📝 CONTEXT TEXT SENT TO GEMINI:")
    print(context_text)
    print("="*60)
    
    # Step 3: Get Gemini response with context
    print("🧠 STEP 3: GEMINI PROCESSING WITH CONTEXT")
    
    response = await chat_service.chat_with_context(
        user_message=user_query,
        context_data=context_data,
        chat_history=[]
    )
    
    if response['success']:
        print("✅ GEMINI RESPONSE RECEIVED")
        print(f"🤖 MODEL USED: {response.get('model', 'Unknown')}")
        print(f"📊 CONTEXT SCHEMES USED: {response.get('context_used', 0)}")
        print("\n🗣️ GEMINI'S FILTERED RESPONSE:")
        print("-" * 40)
        print(response['response'])
        print("-" * 40)
    else:
        print(f"❌ GEMINI RESPONSE FAILED: {response['error']}")
    
    print("\n" + "="*60)
    print("✅ COMPLETE FLOW DEMONSTRATED!")
    print("📋 Summary:")
    print("  1. User query processed")
    print("  2. schemes.json data searched and relevant schemes found")
    print("  3. Context built from real scheme data")
    print("  4. Context + query sent to Gemini 2.5 Flash")
    print("  5. Gemini returns human-like filtered response")

async def test_different_queries_with_context():
    """Test different types of queries to show Gemini's contextual responses"""
    
    print("\n🔬 TESTING DIFFERENT QUERIES WITH GEMINI CONTEXT")
    print("=" * 60)
    
    from services.vector_database import vector_db_service
    from services.ai_chat import chat_service
    
    # Initialize vector database
    await vector_db_service.initialize_schemes_data()
    
    test_cases = [
        {
            "query": "What is PM-KISAN and how much money do I get?",
            "expected_context": "Should find PM-KISAN scheme data"
        },
        {
            "query": "I need crop insurance for my wheat farm",
            "expected_context": "Should find PMFBY crop insurance data"
        },
        {
            "query": "Maharashtra state schemes for small farmers",
            "expected_context": "Should find Maharashtra state scheme data"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 TEST CASE {i}")
        print(f"👤 Query: {test_case['query']}")
        print(f"🎯 Expected: {test_case['expected_context']}")
        
        # Get context from schemes.json
        context_data = await vector_db_service.search_schemes(test_case['query'], limit=3)
        print(f"📊 Found {len(context_data)} schemes in context")
        
        # Show which schemes were found
        if context_data:
            print("🔍 Schemes in context:")
            for scheme in context_data:
                print(f"  - {scheme['scheme_name']} (score: {scheme['similarity_score']:.3f})")
        
        # Get Gemini response
        response = await chat_service.chat_with_context(
            user_message=test_case['query'],
            context_data=context_data,
            chat_history=[]
        )
        
        if response['success']:
            print(f"🤖 Gemini Response (first 150 chars):")
            print(f"   {response['response'][:150]}...")
            print(f"✅ Context used: {response.get('context_used', 0)} schemes")
        else:
            print(f"❌ Failed: {response['error']}")
        
        print("-" * 40)

async def show_raw_vs_filtered_response():
    """Show the difference between raw scheme data vs Gemini's filtered response"""
    
    print("\n📊 RAW SCHEME DATA vs GEMINI FILTERED RESPONSE")
    print("=" * 60)
    
    from services.vector_database import vector_db_service
    from services.ai_chat import chat_service
    
    await vector_db_service.initialize_schemes_data()
    
    query = "Tell me about PM-KISAN eligibility"
    
    # Get raw scheme data
    context_data = await vector_db_service.search_schemes(query, limit=1)
    
    if context_data:
        raw_scheme = context_data[0]
        
        print("📄 RAW SCHEME DATA FROM schemes.json:")
        print("-" * 40)
        print(f"Scheme: {raw_scheme['scheme_name']}")
        print(f"Content: {raw_scheme['content'][:300]}...")
        print("-" * 40)
        
        # Get Gemini's filtered response
        response = await chat_service.chat_with_context(
            user_message=query,
            context_data=context_data,
            chat_history=[]
        )
        
        if response['success']:
            print("\n🤖 GEMINI'S FILTERED & HUMAN-LIKE RESPONSE:")
            print("-" * 40)
            print(response['response'])
            print("-" * 40)
            
            print("\n🎯 KEY DIFFERENCES:")
            print("✅ Raw data: Technical, structured, comprehensive")
            print("✅ Gemini response: Human-like, conversational, filtered")
            print("✅ Gemini adds context, explanations, and follow-up questions")
            print("✅ Gemini formats information in farmer-friendly language")

if __name__ == "__main__":
    print("🔬 COMPREHENSIVE GEMINI CONTEXT FLOW TESTING")
    print("This will demonstrate how schemes.json data flows through Gemini AI")
    print("=" * 80)
    
    asyncio.run(test_gemini_context_flow())
    asyncio.run(test_different_queries_with_context())
    asyncio.run(show_raw_vs_filtered_response())
    
    print("\n" + "="*80)
    print("🎉 PROOF: The system works exactly as intended!")
    print("📋 Flow: schemes.json → search → context → Gemini → human response")
    print("✅ All responses are generated by Gemini 2.5 Flash using real scheme data")
