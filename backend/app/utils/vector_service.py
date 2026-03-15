import os
import logging
import json
from typing import List, Tuple, Dict, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
from app import db
from app.models import Provider, User, ProviderEmbedding, SearchQueryHistory
from app.models.service import ServiceCategory
from app.utils.ai_service import AIService

logger = logging.getLogger(__name__)


class VectorDatabaseService:
    """Manages vector embeddings and RAG-based provider search"""
    
    def __init__(self):
        """Initialize the vector database service with embedding model"""
        self.embedding_model_name = 'sentence-transformers/all-MiniLM-L6-v2'
        self.ai_service = AIService()
        
        try:
            self.embedding_model = SentenceTransformer(self.embedding_model_name)
            logger.info(f"Embedding model loaded: {self.embedding_model_name}")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            self.embedding_model = None
    
    def generate_provider_bio(self, provider: Provider, user: User) -> str:
        """Generate comprehensive bio for a provider"""
        bio_parts = [
            f"Name: {user.name}",
            f"Role: {provider.category.name if provider.category else 'Service Provider'}" if hasattr(provider, 'category') else "",
        ]
        
        if user.gender:
            bio_parts.append(f"Gender: {user.gender}")
        if provider.years_experience:
            bio_parts.append(f"Experience: {provider.years_experience} years")
        if provider.hourly_rate:
            bio_parts.append(f"Rate: Rs {provider.hourly_rate} per hour")
        if provider.rating:
            bio_parts.append(f"Rating: {provider.rating}/5.0")
        if provider.completion_rate:
            bio_parts.append(f"Completion Rate: {provider.completion_rate}%")
        if provider.skills:
            skills = json.loads(provider.skills) if isinstance(provider.skills, str) else provider.skills
            bio_parts.append(f"Skills: {', '.join(skills) if skills else 'Not specified'}")
        if provider.bio:
            bio_parts.append(f"Bio: {provider.bio}")
        
        return " | ".join([p for p in bio_parts if p])
    
    def generate_provider_embedding(self, provider: Provider) -> Tuple[List[float], str]:
        """
        Generate embedding for a provider
        Returns: (embedding vector, provider bio text)
        """
        if not self.embedding_model:
            raise Exception("Embedding model not initialized")
        
        try:
            user = User.query.get(provider.user_id)
            if not user:
                raise Exception(f"User not found for provider {provider.id}")
            
            # Generate comprehensive bio
            bio = self.generate_provider_bio(provider, user)
            
            # Generate embedding
            embedding = self.embedding_model.encode(bio, convert_to_tensor=False)
            
            return embedding.tolist(), bio
        except Exception as e:
            logger.error(f"Error generating embedding for provider {provider.id}: {e}")
            raise
    
    def index_provider(self, provider: Provider) -> bool:
        """
        Create or update vector embedding for a provider
        Returns: True if successful
        """
        try:
            embedding_vec, bio = self.generate_provider_embedding(provider)
            
            # Check if embedding already exists
            existing = ProviderEmbedding.query.filter_by(provider_id=provider.id).first()
            
            if existing:
                existing.embedding = embedding_vec
                existing.provider_bio = bio
                existing.updated_at = db.func.now()
                logger.info(f"Updated embedding for provider {provider.id}")
            else:
                new_embedding = ProviderEmbedding(
                    provider_id=provider.id,
                    embedding=embedding_vec,
                    provider_bio=bio,
                    embedding_model=self.embedding_model_name,
                    is_indexed=True
                )
                db.session.add(new_embedding)
                logger.info(f"Created new embedding for provider {provider.id}")
            
            db.session.commit()
            return True
        except Exception as e:
            logger.error(f"Error indexing provider {provider.id}: {e}")
            db.session.rollback()
            return False
    
    def index_all_providers(self) -> Dict[str, int]:
        """Index all providers in the database"""
        stats = {'total': 0, 'successful': 0, 'failed': 0}
        providers = Provider.query.all()
        
        for provider in providers:
            stats['total'] += 1
            if self.index_provider(provider):
                stats['successful'] += 1
            else:
                stats['failed'] += 1
        
        logger.info(f"Indexing complete: {stats}")
        return stats
    
    def vector_search(self, query: str, limit: int = 5, user_id: Optional[int] = None) -> List[Dict]:
        """
        Perform vector similarity search for providers
        Returns: List of provider dicts with similarity scores
        """
        if not self.embedding_model:
            raise Exception("Embedding model not initialized")
        
        try:
            # Generate embedding for query
            query_embedding = self.embedding_model.encode(query, convert_to_tensor=False).tolist()
            
            # Search for similar providers using pgvector similarity
            results = db.session.query(
                ProviderEmbedding,
                Provider,
                User,
                (ProviderEmbedding.embedding.cosine_distance(query_embedding)).label('similarity')
            ).join(
                Provider, ProviderEmbedding.provider_id == Provider.id
            ).join(
                User, Provider.user_id == User.id
            ).filter(
                ProviderEmbedding.is_indexed == True
            ).order_by(
                'similarity'
            ).limit(limit).all()
            
            # Format results
            formatted_results = []
            for embedding_record, provider, user, similarity in results:
                similarity_score = 1 - similarity  # Convert distance to similarity
                formatted_results.append({
                    'provider_id': provider.id,
                    'user_id': user.id,
                    'name': user.name,
                    'category': provider.category.name if provider.category else 'Service Provider',
                    'rating': provider.rating,
                    'hourly_rate': provider.hourly_rate,
                    'years_experience': provider.years_experience,
                    'skills': json.loads(provider.skills) if isinstance(provider.skills, str) else provider.skills,
                    'similarity_score': float(similarity_score),
                    'city': user.city,
                    'is_female': user.is_female,
                    'completion_rate': provider.completion_rate,
                })
            
            # Log search query
            if user_id:
                search_history = SearchQueryHistory(
                    user_id=user_id,
                    query=query,
                    query_embedding=query_embedding,
                    results_provider_ids=','.join(str(r['provider_id']) for r in formatted_results),
                    results_count=len(formatted_results)
                )
                db.session.add(search_history)
                db.session.commit()
            
            return formatted_results
        except Exception as e:
            logger.error(f"Error in vector search: {e}")
            raise
    
    def rag_search(self, user_query: str, user_id: Optional[int] = None, context_limit: int = 3) -> Dict:
        """
        RAG-based provider search using Claude
        Combines vector search with LLM for intelligent results
        Returns: Dict with Claude's analysis and provider recommendations
        """
        try:
            # Step 1: Vector search to get context
            search_results = self.vector_search(user_query, limit=context_limit, user_id=user_id)
            
            if not search_results:
                return {
                    'success': False,
                    'message': 'No providers found matching your request',
                    'providers': []
                }
            
            # Step 2: Prepare context for Claude
            context_text = "## Available Providers\n\n"
            for provider in search_results:
                context_text += f"**{provider['name']}** (ID: {provider['provider_id']})\n"
                context_text += f"- Service: {provider['category']}\n"
                context_text += f"- Rating: {provider['rating']}/5.0 (Completion: {provider['completion_rate']}%)\n"
                context_text += f"- Skills: {', '.join(provider['skills']) if provider['skills'] else 'Not specified'}\n"
                context_text += f"- Experience: {provider['years_experience']} years\n"
                context_text += f"- Rate: Rs {provider['hourly_rate']}/hour\n"
                context_text += f"- Location: {provider['city']}\n"
                context_text += f"- Match Score: {provider['similarity_score']*100:.1f}%\n\n"
            
            # Step 3: Use Claude to generate intelligent recommendation
            system_prompt = """You are a helpful service provider recommendation assistant. 
Based on the user's request and the available providers, recommend the best match with clear reasoning.
Focus on: skill match, experience, rating, and suitability for the specific request.
Provide a brief paragraph (2-3 sentences) explaining your top recommendation."""
            
            messages = [
                {
                    "role": "user",
                    "content": f"""User Request: {user_query}

{context_text}

Based on this request and the available providers, which provider would be the best fit and why?"""
                }
            ]
            
            claude_response = self.ai_service.chat(messages, system_prompt=system_prompt, max_tokens=300)
            
            return {
                'success': True,
                'user_query': user_query,
                'claude_recommendation': claude_response,
                'providers': search_results,
                'total_matches': len(search_results),
            }
        except Exception as e:
            logger.error(f"Error in RAG search: {e}")
            return {
                'success': False,
                'message': f'RAG search failed: {str(e)}',
                'providers': []
            }
    
    def get_provider_statistics(self) -> Dict:
        """Get statistics about indexed providers"""
        total_providers = Provider.query.count()
        indexed_providers = ProviderEmbedding.query.filter_by(is_indexed=True).count()
        # Note: SearchQueryHistory has a 'query' column, so use db.session.query() explicitly
        total_searches = db.session.query(SearchQueryHistory).count()
        
        return {
            'total_providers': total_providers,
            'indexed_providers': indexed_providers,
            'indexing_coverage': f"{(indexed_providers/total_providers*100):.1f}%" if total_providers > 0 else "0%",
            'total_searches': total_searches,
            'embedding_model': self.embedding_model_name,
        }
