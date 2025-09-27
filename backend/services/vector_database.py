"""
Vector Database Service using ChromaDB for Farmer Scheme Information
Provides fast semantic search and retrieval for government schemes and agricultural data
"""

import json
import logging
from typing import List, Dict, Any, Optional
from config_document_builder import DocumentBuilderConfig
import os

logger = logging.getLogger(__name__)

class VectorDatabaseService:
    def __init__(self):
        """Initialize ChromaDB client and embedding model for fastest retrieval"""
        try:
            # For now, we'll use a simple in-memory search until ChromaDB is installed
            self.schemes_data = []
            self.config = DocumentBuilderConfig()
            self.initialized = False
            logger.info("VectorDatabaseService initialized (fallback mode)")
            
        except Exception as e:
            logger.error(f"Failed to initialize VectorDatabaseService: {e}")
            raise

    async def initialize_schemes_data(self, schemes_file_path: str = None):
        """Initialize vector database with government schemes data"""
        try:
            # Load schemes data from JSON file
            if schemes_file_path is None:
                # Use relative path from current directory
                schemes_file_path = os.path.join(os.path.dirname(__file__), "..", "..", "MyApp", "data", "schemes.json")
            
            # Check if file exists
            if not os.path.exists(schemes_file_path):
                logger.warning(f"Schemes file not found at {schemes_file_path}")
                # Try alternative paths
                alternative_paths = [
                    "schemes.json",
                    "data/schemes.json",
                    "../data/schemes.json",
                    "../../data/schemes.json"
                ]
                
                for alt_path in alternative_paths:
                    if os.path.exists(alt_path):
                        schemes_file_path = alt_path
                        logger.info(f"Found schemes file at: {schemes_file_path}")
                        break
                else:
                    logger.error("Could not find schemes.json file in any expected location")
                    # Create empty schemes data to prevent crashes
                    self.schemes_data = []
                    self.initialized = True
                    return
            
            with open(schemes_file_path, 'r', encoding='utf-8') as file:
                schemes_data = json.load(file)
            
            # Also load crop-specific data
            crop_schemes_path = os.path.join(os.path.dirname(__file__), "..", "..", "crop_specific_data.json")
            crop_schemes_data = {}
            try:
                if os.path.exists(crop_schemes_path):
                    with open(crop_schemes_path, 'r', encoding='utf-8') as crop_file:
                        crop_schemes_data = json.load(crop_file)
                else:
                    logger.info("Crop-specific data file not found, continuing without it")
            except Exception as e:
                logger.warning(f"Could not load crop-specific data: {e}")
            
            # Process and store schemes data
            self.schemes_data = []
            
            # Process Central Government schemes
            if 'centralGovernmentSchemes' in schemes_data:
                for i, scheme in enumerate(schemes_data['centralGovernmentSchemes']):
                    if not scheme:  # Skip empty schemes
                        continue
                        
                    scheme_name = scheme.get('schemeName', f'Scheme_{i}')
                    
                    # Create comprehensive text for search
                    doc_text = self._create_scheme_document_text(scheme)
                    
                    self.schemes_data.append({
                        'id': f"central_scheme_{i}",
                        'scheme_name': scheme_name,
                        'scheme_type': 'central_government',
                        'content': doc_text,
                        'metadata': {
                            'ministry': scheme.get('administeringMinistry', ''),
                            'primary_objective': scheme.get('primaryObjective', ''),
                            'key_benefit': scheme.get('keyBenefit', ''),
                            'official_website': scheme.get('officialWebsite', ''),
                            'helpline_number': scheme.get('helplineNumber', ''),
                            'application_portal': scheme.get('applicationPortal', ''),
                            'applicable_region': scheme.get('applicableRegion', '')
                        },
                        'raw_data': scheme
                    })
            
            # Process Maharashtra State schemes
            if 'maharashtraStateSpecificSchemes' in schemes_data:
                for i, scheme in enumerate(schemes_data['maharashtraStateSpecificSchemes']):
                    scheme_name = scheme.get('schemeName', f'Maharashtra_Scheme_{i}')
                    
                    doc_text = self._create_scheme_document_text(scheme)
                    
                    self.schemes_data.append({
                        'id': f"maharashtra_scheme_{i}",
                        'scheme_name': scheme_name,
                        'scheme_type': 'maharashtra_state',
                        'content': doc_text,
                        'metadata': {
                            'department': scheme.get('administeringDepartment', ''),
                            'primary_objective': scheme.get('primaryObjective', ''),
                            'key_benefit': scheme.get('keyBenefit', ''),
                            'official_website': scheme.get('officialWebsite', ''),
                            'helpline_number': scheme.get('helplineNumber', ''),
                            'application_portal': scheme.get('applicationPortal', ''),
                            'target_group': scheme.get('targetBeneficiaryGroup', '')
                        },
                        'raw_data': scheme
                    })
            
            # Process crop-specific schemes if available
            if 'cropSpecificSchemes' in crop_schemes_data:
                for crop_data in crop_schemes_data['cropSpecificSchemes']:
                    crop_name = crop_data.get('cropName', 'Unknown Crop')
                    for i, scheme in enumerate(crop_data.get('schemes', [])):
                        scheme_name = scheme.get('schemeName', f'{crop_name}_Scheme_{i}')
                        
                        # Create comprehensive text for crop schemes
                        doc_text = f"Scheme Name: {scheme_name} | Crop: {crop_name} | Type: {scheme.get('type', '')} | Description: {scheme.get('description', '')} | Benefits: {' '.join(scheme.get('keyBenefits', []))} | Eligibility: {scheme.get('eligibilityNotes', '')} | Process: {scheme.get('applicationProcess', '')} | Documents: {scheme.get('requiredDocuments', '')}"
                        
                        self.schemes_data.append({
                            'id': f"crop_scheme_{crop_name.lower()}_{i}",
                            'scheme_name': scheme_name,
                            'scheme_type': 'crop_specific',
                            'content': doc_text,
                            'metadata': {
                                'crop_name': crop_name,
                                'scheme_type_detail': scheme.get('type', ''),
                                'key_benefit': scheme.get('keyBenefits', [None])[0] if scheme.get('keyBenefits') else '',
                                'applicable_component': scheme.get('applicableComponent', ''),
                                'procurement_limit': scheme.get('procurementLimit', ''),
                                'applicable_crop_mention': scheme.get('applicableCropMention', '')
                            },
                            'raw_data': scheme
                        })
            
            logger.info(f"Successfully initialized vector database with {len(self.schemes_data)} scheme documents")
            self.initialized = True
            
        except Exception as e:
            logger.error(f"Failed to initialize schemes data: {e}")
            self.initialized = False
            raise

    def _create_scheme_document_text(self, scheme: Dict[str, Any]) -> str:
        """Create comprehensive text representation of a scheme for search"""
        text_parts = []
        
        # Basic scheme information
        if scheme.get('schemeName'):
            text_parts.append(f"Scheme Name: {scheme['schemeName']}")
        
        if scheme.get('administeringMinistry'):
            text_parts.append(f"Ministry: {scheme['administeringMinistry']}")
        
        if scheme.get('administeringDepartment'):
            text_parts.append(f"Department: {scheme['administeringDepartment']}")
        
        if scheme.get('primaryObjective'):
            text_parts.append(f"Objective: {scheme['primaryObjective']}")
        
        if scheme.get('keyBenefit'):
            text_parts.append(f"Key Benefit: {scheme['keyBenefit']}")
        
        if scheme.get('description'):
            text_parts.append(f"Description: {scheme['description']}")
        
        # Eligibility criteria
        if scheme.get('eligibilityCriteria'):
            criteria = scheme['eligibilityCriteria']
            if isinstance(criteria, list):
                text_parts.append(f"Eligibility: {' '.join(criteria)}")
            else:
                text_parts.append(f"Eligibility: {criteria}")
        
        # Application process
        if scheme.get('applicationProcess'):
            process = scheme['applicationProcess']
            if isinstance(process, list):
                text_parts.append(f"Application Process: {' '.join(process)}")
            else:
                text_parts.append(f"Application Process: {process}")
        
        # Required documents
        if scheme.get('requiredDocuments'):
            docs = scheme['requiredDocuments']
            if isinstance(docs, list):
                text_parts.append(f"Required Documents: {' '.join(docs)}")
            else:
                text_parts.append(f"Required Documents: {docs}")
        
        # Contact information
        if scheme.get('helplineNumber'):
            text_parts.append(f"Helpline: {scheme['helplineNumber']}")
        
        if scheme.get('officialWebsite'):
            text_parts.append(f"Website: {scheme['officialWebsite']}")
        
        return ' | '.join(text_parts)

    async def search_schemes(self, query: str, limit: int = None) -> List[Dict[str, Any]]:
        """Search for relevant schemes based on query with fastest retrieval"""
        try:
            # Auto-initialize if not already done
            if not self.initialized or len(self.schemes_data) == 0:
                logger.info("Auto-initializing schemes data...")
                await self.initialize_schemes_data()
            
            if limit is None:
                limit = self.config.MAX_SEARCH_RESULTS
            
            # If no schemes loaded, return empty
            if len(self.schemes_data) == 0:
                logger.warning("No schemes data available")
                return []
            
            query_lower = query.lower()
            search_results = []
            
            # For very generic queries, return all schemes
            generic_queries = ['government scheme', 'scheme', 'all', '', 'government', 'schemes']
            if query_lower.strip() in generic_queries:
                logger.info(f"Generic query '{query}' - returning all schemes")
                for scheme in self.schemes_data[:limit]:
                    search_results.append({
                        'scheme_name': scheme['scheme_name'],
                        'scheme_type': scheme['scheme_type'],
                        'content': scheme['content'],
                        'metadata': scheme['metadata'],
                        'similarity_score': 1.0,
                        'raw_data': scheme['raw_data']
                    })
                return search_results
            
            # Simple text-based search (fallback until ChromaDB is set up)
            for scheme in self.schemes_data:
                content_lower = scheme['content'].lower()
                scheme_name_lower = scheme['scheme_name'].lower()
                
                # Calculate simple relevance score
                relevance_score = 0
                query_words = query_lower.split()
                
                for word in query_words:
                    if word in scheme_name_lower:
                        relevance_score += 3  # Higher weight for scheme name matches
                    if word in content_lower:
                        relevance_score += 1
                
                if relevance_score > 0:
                    search_results.append({
                        'scheme_name': scheme['scheme_name'],
                        'scheme_type': scheme['scheme_type'],
                        'content': scheme['content'],
                        'metadata': scheme['metadata'],
                        'similarity_score': min(relevance_score / 10, 1.0),  # Normalize score
                        'raw_data': scheme['raw_data']
                    })
            
            # If no specific matches found, return all schemes (fallback)
            if len(search_results) == 0:
                logger.info(f"No specific matches for '{query}' - returning all schemes as fallback")
                for scheme in self.schemes_data[:limit]:
                    search_results.append({
                        'scheme_name': scheme['scheme_name'],
                        'scheme_type': scheme['scheme_type'],
                        'content': scheme['content'],
                        'metadata': scheme['metadata'],
                        'similarity_score': 0.5,  # Low relevance but available
                        'raw_data': scheme['raw_data']
                    })
            else:
                # Sort by relevance score and limit results
                search_results.sort(key=lambda x: x['similarity_score'], reverse=True)
                search_results = search_results[:limit]
            
            logger.info(f"Search query: '{query}' returned {len(search_results)} results")
            return search_results
            
        except Exception as e:
            logger.error(f"Failed to search schemes: {e}")
            return []

    async def get_scheme_by_name(self, scheme_name: str) -> Optional[Dict[str, Any]]:
        """Get specific scheme by name"""
        try:
            results = await self.search_schemes(f"scheme name {scheme_name}", limit=5)
            
            # Find exact or closest match
            for result in results:
                if scheme_name.lower() in result['scheme_name'].lower():
                    return result
            
            # Return first result if no exact match
            return results[0] if results else None
            
        except Exception as e:
            logger.error(f"Failed to get scheme by name: {e}")
            return None

    async def get_schemes_by_category(self, category: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get schemes by category (e.g., 'loan', 'subsidy', 'insurance')"""
        try:
            query = f"{category} schemes for farmers"
            return await self.search_schemes(query, limit=limit)
            
        except Exception as e:
            logger.error(f"Failed to get schemes by category: {e}")
            return []

    def get_collection_stats(self) -> Dict[str, Any]:
        """Get vector database statistics"""
        try:
            return {
                'total_documents': len(self.schemes_data),
                'collection_name': self.config.VECTOR_COLLECTION_NAME,
                'status': 'initialized'
            }
        except Exception as e:
            logger.error(f"Failed to get collection stats: {e}")
            return {'error': str(e)}

# Global vector database service instance
vector_db_service = VectorDatabaseService()
