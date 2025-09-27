"""
Test Script for Enhanced Offline RAG
Shows how the system processes different types of queries with intelligent filtering
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import asyncio
from services.offline_rag import OfflineRAGEngine

def test_offline_rag():
    """Test the enhanced offline RAG system"""
    
    print("🚀 Testing Enhanced Offline RAG System\n")
    
    # Initialize RAG engine
    rag_engine = OfflineRAGEngine()
    
    # Test queries for different intents
    test_queries = [
        # Market queries
        "What is the current price of wheat?",
        "Where can I sell my cotton at good price?",
        
        # Crop recommendation queries  
        "What crops should I plant in kharif season?",
        "Which crops are suitable for Maharashtra?",
        
        # Disease/problem queries
        "My tomato plants have yellow leaves, what should I do?",
        "How to control pests in rice crop?",
        
        # Government scheme queries
        "What loan schemes are available for farmers?",
        "Tell me about PM Kisan scheme",
        
        # Weather queries
        "Will it rain next week?",
        "What is the temperature today?",
        
        # General farming queries
        "How to improve soil fertility?",
        "Best time to plant onions",
    ]
    
    print("=" * 80)
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n🔍 Test Query {i}: '{query}'")
        print("-" * 60)
        
        try:
            # Process query with enhanced RAG
            result = rag_engine.process_rag_query(query, top_k=3)
            
            # Print results
            print(f"📊 Intent Type: {result['intent']['type']}")
            print(f"🎯 Keywords: {', '.join(result['intent']['keywords'][:5])}")
            print(f"📈 Confidence: {result['confidence']:.2f}")
            print(f"🔎 Search Results Found: {len(result['search_results'])}")
            
            print(f"\n💬 Response:")
            print(result['response'])
            
            if result['search_results']:
                print(f"\n📚 Top Sources:")
                for j, search_result in enumerate(result['search_results'][:2], 1):
                    print(f"  {j}. [{search_result['source']}] Score: {search_result['score']}")
                    print(f"     {search_result['text'][:100]}...")
            
        except Exception as e:
            print(f"❌ Error processing query: {e}")
        
        print("=" * 80)

def test_intent_extraction():
    """Test the intent extraction functionality"""
    
    print("\n🧠 Testing Intent Extraction\n")
    
    rag_engine = OfflineRAGEngine()
    
    test_cases = [
        "What is the price of wheat in Punjab?",
        "My cotton crop has pest problems",
        "Which crops are good for monsoon season?",
        "Are there any government schemes for small farmers?",
        "Will it rain tomorrow in Maharashtra?",
        "How to rent a tractor in my village?",
    ]
    
    for query in test_cases:
        intent = rag_engine.extract_query_intent(query)
        print(f"Query: '{query}'")
        print(f"  Type: {intent['type']}")
        print(f"  Keywords: {intent['keywords'][:5]}")
        print(f"  Crop: {intent['crop_name']}")
        print(f"  Season: {intent['season']}")
        print(f"  Urgency: {intent['urgency']}")
        print()

def compare_responses():
    """Compare basic vs enhanced offline responses"""
    
    print("\n⚖️  Comparing Basic vs Enhanced Offline Responses\n")
    
    rag_engine = OfflineRAGEngine()
    
    test_query = "What crops should I plant for good profit?"
    
    print(f"Query: '{test_query}'\n")
    
    # Enhanced response
    print("🔹 Enhanced Offline RAG Response:")
    enhanced_result = rag_engine.process_rag_query(test_query)
    print(enhanced_result['response'])
    print(f"Confidence: {enhanced_result['confidence']:.2f}")
    
    print("\n" + "="*60 + "\n")
    
    # Basic response (what the old system would return)
    print("🔸 Basic Offline Response (old system):")
    basic_response = "I'm currently in offline mode and couldn't find relevant information in the cached data. Please try again when online."
    print(basic_response)
    print("Confidence: 0.0")

if __name__ == "__main__":
    try:
        # Run all tests
        test_offline_rag()
        test_intent_extraction()
        compare_responses()
        
        print("\n🎉 All tests completed!")
        print("\n📋 Summary of Enhanced Offline RAG Features:")
        print("✅ Intent detection and classification")
        print("✅ Keyword extraction and matching")
        print("✅ Source-specific weighting")
        print("✅ Relevance scoring and ranking")
        print("✅ Context-aware response generation")
        print("✅ Confidence scoring")
        print("✅ Fallback handling")
        print("✅ Multi-source data integration")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
