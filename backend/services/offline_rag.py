"""
Enhanced Offline RAG System
Provides intelligent filtering, ranking, and response generation for offline mode
"""

import json
import os
import re
from typing import Dict, List, Any, Tuple
from datetime import datetime
import numpy as np
from collections import defaultdict

class OfflineRAGEngine:
    def __init__(self, offline_data_dir: str = "offline_data"):
        self.offline_data_dir = offline_data_dir
        self.search_index = None
        self.embeddings_matrix = None
        self.document_store = {}
        self.load_data()
    
    def load_data(self):
        """Load and prepare offline data for RAG"""
        print("🔄 Loading offline RAG data...")
        
        # Load comprehensive search index
        index_path = os.path.join(self.offline_data_dir, 'comprehensive_search_index.json')
        if os.path.exists(index_path):
            with open(index_path, 'r', encoding='utf-8') as f:
                self.search_index = json.load(f)
                print(f"✅ Loaded search index with {self.search_index.get('total_items', 0)} items")
        
        # Load all document collections
        self._load_document_collections()
        
        # Prepare embeddings matrix if available
        self._prepare_embeddings()
    
    def _load_document_collections(self):
        """Load all document collections into memory"""
        collections = [
            'farmers_data.json',
            'market_data.json', 
            'crop_intelligence_data.json',
            'government_schemes_data.json',
            'processed_crop_specific_data.json',
            'processed_data.json'
        ]
        
        for collection_file in collections:
            file_path = os.path.join(self.offline_data_dir, collection_file)
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        collection_name = collection_file.replace('.json', '')
                        self.document_store[collection_name] = data.get('data', {})
                        print(f"✅ Loaded {collection_name}")
                except Exception as e:
                    print(f"❌ Error loading {collection_file}: {e}")
    
    def _prepare_embeddings(self):
        """Prepare embeddings matrix for similarity search"""
        if not self.search_index or 'searchable_items' not in self.search_index:
            return
        
        embeddings = []
        for item in self.search_index['searchable_items']:
            if item.get('embedding'):
                embeddings.append(item['embedding'])
        
        if embeddings:
            self.embeddings_matrix = np.array(embeddings)
            print(f"✅ Prepared embeddings matrix: {self.embeddings_matrix.shape}")
    
    def cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors"""
        try:
            dot_product = np.dot(vec1, vec2)
            norm_vec1 = np.linalg.norm(vec1)
            norm_vec2 = np.linalg.norm(vec2)
            
            if norm_vec1 == 0 or norm_vec2 == 0:
                return 0.0
            
            return float(dot_product / (norm_vec1 * norm_vec2))
        except:
            return 0.0
    
    def extract_query_intent(self, query: str) -> Dict[str, Any]:
        """Extract intent and key information from user query"""
        query_lower = query.lower()
        
        intent = {
            'type': 'general',
            'keywords': [],
            'location': None,
            'crop_name': None,
            'season': None,
            'problem_type': None,
            'urgency': 'medium'
        }
        
        # Extract keywords (remove stop words)
        stop_words = {'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by'}
        words = re.findall(r'\b\w+\b', query_lower)
        intent['keywords'] = [w for w in words if w not in stop_words and len(w) > 2]
        
        # Detect query type
        if any(word in query_lower for word in ['price', 'market', 'sell', 'buy', 'cost']):
            intent['type'] = 'market'
        elif any(word in query_lower for word in ['weather', 'rain', 'temperature', 'climate']):
            intent['type'] = 'weather'
        elif any(word in query_lower for word in ['disease', 'pest', 'problem', 'sick', 'dying']):
            intent['type'] = 'crop_disease'
        elif any(word in query_lower for word in ['plant', 'grow', 'crop', 'seed', 'recommend']):
            intent['type'] = 'crop_recommendation'
        elif any(word in query_lower for word in ['loan', 'scheme', 'government', 'subsidy']):
            intent['type'] = 'government_schemes'
        elif any(word in query_lower for word in ['rent', 'equipment', 'machine', 'tool']):
            intent['type'] = 'rental'
        
        # Extract crop names
        crop_names = ['wheat', 'rice', 'cotton', 'sugarcane', 'tomato', 'potato', 'onion', 'maize', 'soybean']
        for crop in crop_names:
            if crop in query_lower:
                intent['crop_name'] = crop
                break
        
        # Extract seasons
        seasons = ['kharif', 'rabi', 'summer', 'monsoon', 'winter']
        for season in seasons:
            if season in query_lower:
                intent['season'] = season
                break
        
        # Detect urgency
        if any(word in query_lower for word in ['urgent', 'emergency', 'immediate', 'quickly', 'asap']):
            intent['urgency'] = 'high'
        elif any(word in query_lower for word in ['later', 'future', 'planning', 'next']):
            intent['urgency'] = 'low'
        
        return intent
    
    def search_documents(self, query: str, intent: Dict[str, Any], limit: int = 5) -> List[Dict]:
        """Search documents with intent-based filtering"""
        results = []
        query_lower = query.lower()
        
        # Weight different sources based on intent
        source_weights = {
            'market': {'market_data': 1.0, 'farmers_data': 0.3},
            'weather': {'farmers_data': 0.5, 'processed_data': 0.7},
            'crop_disease': {'crop_intelligence_data': 1.0, 'processed_crop_specific_data': 0.8},
            'crop_recommendation': {'crop_intelligence_data': 1.0, 'processed_crop_specific_data': 1.0},
            'government_schemes': {'government_schemes_data': 1.0},
            'rental': {'farmers_data': 0.3},
            'general': {'processed_data': 0.8, 'processed_crop_specific_data': 0.8}
        }
        
        weights = source_weights.get(intent['type'], source_weights['general'])
        
        if self.search_index and 'searchable_items' in self.search_index:
            for item in self.search_index['searchable_items']:
                text = item.get('text', '').lower()
                source = item.get('source_category', '')
                
                # Calculate base relevance score
                relevance = 0.0
                
                # Keyword matching
                matched_keywords = 0
                for keyword in intent['keywords']:
                    if keyword in text:
                        matched_keywords += 1
                        relevance += 1.0
                
                # Exact phrase matching (higher weight)
                if query_lower in text:
                    relevance += 2.0
                
                # Intent-specific matching
                if intent['crop_name'] and intent['crop_name'] in text:
                    relevance += 1.5
                
                if intent['season'] and intent['season'] in text:
                    relevance += 1.0
                
                # Apply source weight
                source_weight = weights.get(source, 0.5)
                final_score = relevance * source_weight
                
                # Only include if relevance is above threshold
                if final_score > 0.5:
                    results.append({
                        'text': item.get('text', ''),
                        'score': final_score,
                        'source': source,
                        'data': item.get('original_data', {}),
                        'matched_keywords': matched_keywords,
                        'total_keywords': len(intent['keywords'])
                    })
        
        # Sort by relevance score and return top results
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:limit]
    
    def generate_contextual_response(self, query: str, search_results: List[Dict], intent: Dict[str, Any]) -> str:
        """Generate a contextual response based on search results and intent"""
        
        if not search_results:
            return self._generate_fallback_response(query, intent)
        
        # Group results by type for better response structure
        grouped_results = defaultdict(list)
        for result in search_results:
            grouped_results[result['source']].append(result)
        
        response_parts = []
        
        # Intent-specific response generation
        if intent['type'] == 'market':
            response_parts.append(self._generate_market_response(search_results, intent))
        elif intent['type'] == 'weather':
            response_parts.append(self._generate_weather_response(search_results, intent))
        elif intent['type'] == 'crop_disease':
            response_parts.append(self._generate_disease_response(search_results, intent))
        elif intent['type'] == 'crop_recommendation':
            response_parts.append(self._generate_recommendation_response(search_results, intent))
        elif intent['type'] == 'government_schemes':
            response_parts.append(self._generate_schemes_response(search_results, intent))
        else:
            response_parts.append(self._generate_general_response(search_results, intent))
        
        # Add confidence and source information
        confidence = min(search_results[0]['score'] / 3.0, 1.0) if search_results else 0.0
        confidence_text = "high" if confidence > 0.7 else "medium" if confidence > 0.4 else "low"
        
        response_parts.append(f"\n(Offline response with {confidence_text} confidence based on cached data)")
        
        return "\n".join(response_parts)
    
    def _generate_market_response(self, results: List[Dict], intent: Dict[str, Any]) -> str:
        """Generate market-specific response"""
        market_info = []
        for result in results[:3]:
            data = result.get('data', {})
            if 'commodity' in data or 'Commodity' in data:
                commodity = data.get('commodity') or data.get('Commodity', 'Unknown')
                price = data.get('modal_price') or data.get('Modal_Price', 'N/A')
                market = data.get('market') or data.get('Market', 'N/A')
                market_info.append(f"• {commodity}: ₹{price}/quintal at {market}")
        
        if market_info:
            response = f"Based on available market data:\n" + "\n".join(market_info)
            if intent['crop_name']:
                response += f"\n\nFor {intent['crop_name']}, consider current market trends and transportation costs to nearby markets."
            return response
        
        return "I found some market information, but specific price data may not be current in offline mode."
    
    def _generate_weather_response(self, results: List[Dict], intent: Dict[str, Any]) -> str:
        """Generate weather-specific response"""
        return ("Based on available weather patterns:\n"
                "• Check local weather conditions before planning farm activities\n"
                "• Consider seasonal patterns for your region\n"
                "• Plan irrigation based on expected rainfall\n\n"
                "Note: For current weather, please check when online.")
    
    def _generate_disease_response(self, results: List[Dict], intent: Dict[str, Any]) -> str:
        """Generate crop disease response"""
        response = "Based on crop health information:\n\n"
        
        for i, result in enumerate(results[:2]):
            text = result['text'][:200] + "..." if len(result['text']) > 200 else result['text']
            response += f"• {text}\n\n"
        
        response += ("General recommendations:\n"
                    "• Inspect crops regularly for early signs\n"
                    "• Maintain proper spacing and ventilation\n"
                    "• Use organic methods when possible\n"
                    "• Consult agricultural extension officer for severe cases")
        
        return response
    
    def _generate_recommendation_response(self, results: List[Dict], intent: Dict[str, Any]) -> str:
        """Generate crop recommendation response"""
        response = "Based on available crop data:\n\n"
        
        recommendations = []
        for result in results[:3]:
            data = result.get('data', {})
            if 'name' in data:
                crop_name = data['name']
                season = data.get('season', 'suitable season')
                recommendations.append(f"• {crop_name} - {season}")
        
        if recommendations:
            response += "\n".join(recommendations)
        else:
            response += "Consider crops suitable for your local climate and soil conditions."
        
        if intent['season']:
            response += f"\n\nFor {intent['season']} season, focus on crops that match your local weather patterns."
        
        return response
    
    def _generate_schemes_response(self, results: List[Dict], intent: Dict[str, Any]) -> str:
        """Generate government schemes response"""
        response = "Available government schemes:\n\n"
        
        schemes = []
        for result in results[:3]:
            data = result.get('data', {})
            if 'name' in data:
                name = data['name']
                description = data.get('description', '')[:100] + "..." if len(data.get('description', '')) > 100 else data.get('description', '')
                schemes.append(f"• {name}: {description}")
        
        if schemes:
            response += "\n".join(schemes)
        else:
            response += "Check with local agricultural office for current schemes."
        
        response += "\n\nNote: Scheme details and eligibility may have changed. Verify with official sources."
        
        return response
    
    def _generate_general_response(self, results: List[Dict], intent: Dict[str, Any]) -> str:
        """Generate general response"""
        response = "Based on available information:\n\n"
        
        for i, result in enumerate(results[:2]):
            text = result['text'][:150] + "..." if len(result['text']) > 150 else result['text']
            response += f"{i+1}. {text}\n\n"
        
        return response
    
    def _generate_fallback_response(self, query: str, intent: Dict[str, Any]) -> str:
        """Generate fallback response when no good matches found"""
        fallback_responses = {
            'market': "I don't have current market price information available offline. When online, I can provide real-time market prices for your crops.",
            'weather': "Weather information requires online access for current conditions. Please check when connected to internet.",
            'crop_disease': "For crop disease diagnosis, I recommend consulting with a local agricultural expert when detailed analysis is needed.",
            'crop_recommendation': "Crop recommendations depend on local soil and climate conditions. Consider consulting local agricultural extension services.",
            'government_schemes': "Government scheme information may have changed. Please check official websites or local offices for current schemes.",
            'general': "I don't have specific information about that topic in my offline data. Please try a different question or check when online."
        }
        
        return fallback_responses.get(intent['type'], fallback_responses['general'])
    
    def process_rag_query(self, query: str, chat_history: str = "", section: str = "crops", top_k: int = 5) -> Dict[str, Any]:
        """Main RAG processing function"""
        # Extract intent from query
        intent = self.extract_query_intent(query)
        
        # Search relevant documents
        search_results = self.search_documents(query, intent, limit=top_k)
        
        # Generate contextual response
        response = self.generate_contextual_response(query, search_results, intent)
        
        return {
            "response": response,
            "source": "offline_rag",
            "intent": intent,
            "search_results": [
                {
                    "text": r["text"][:200] + "..." if len(r["text"]) > 200 else r["text"],
                    "score": round(r["score"], 3),
                    "source": r["source"]
                }
                for r in search_results[:3]
            ],
            "confidence": search_results[0]["score"] / 3.0 if search_results else 0.0,
            "timestamp": datetime.now().isoformat()
        }

# Global instance
offline_rag_engine = None

def get_offline_rag_engine():
    """Get or create offline RAG engine instance"""
    global offline_rag_engine
    if offline_rag_engine is None:
        offline_rag_engine = OfflineRAGEngine()
    return offline_rag_engine
