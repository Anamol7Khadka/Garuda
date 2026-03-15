from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
import logging
from app import db
from app.models import Provider, ProviderEmbedding, User
from app.utils.vector_service import VectorDatabaseService
from functools import wraps

logger = logging.getLogger(__name__)

bp = Blueprint('rag', __name__, url_prefix='/api/rag')

# Initialize vector database service
try:
    vector_service = VectorDatabaseService()
    logger.info('Vector Database Service initialized successfully')
except Exception as e:
    logger.error(f'Failed to initialize Vector Database Service: {e}')
    vector_service = None


@bp.route('/health', methods=['GET'])
def health_check():
    """Check vector database health and statistics"""
    try:
        if not vector_service:
            return jsonify({'status': 'error', 'message': 'Vector service not initialized'}), 500
        
        stats = vector_service.get_provider_statistics()
        return jsonify({
            'status': 'healthy',
            'statistics': stats
        }), 200
    except Exception as e:
        logger.error(f'Health check error: {e}')
        return jsonify({'status': 'error', 'message': str(e)}), 500


@bp.route('/index/providers', methods=['POST'])
@jwt_required(optional=True)
def index_all_providers():
    """
    Index all providers with vector embeddings
    Requires admin or provider role
    """
    try:
        if not vector_service:
            return jsonify({'error': 'Vector service not initialized'}), 500
        
        # Get current user's role
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
            if user_id:
                user = User.query.get(user_id)
                if not user or user.role not in ['admin', 'provider']:
                    return jsonify({'error': 'Unauthorized. Admin or provider access required'}), 403
        except:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Index all providers
        logger.info('Starting provider indexing...')
        stats = vector_service.index_all_providers()
        
        return jsonify({
            'message': 'Provider indexing completed',
            'statistics': stats
        }), 200
    except Exception as e:
        logger.error(f'Error indexing providers: {e}')
        return jsonify({'error': str(e)}), 500


@bp.route('/index/provider/<int:provider_id>', methods=['POST'])
@jwt_required(optional=True)
def index_provider(provider_id):
    """
    Index a single provider with vector embedding
    """
    try:
        if not vector_service:
            return jsonify({'error': 'Vector service not initialized'}), 500
        
        provider = Provider.query.get(provider_id)
        if not provider:
            return jsonify({'error': 'Provider not found'}), 404
        
        # Index the provider
        success = vector_service.index_provider(provider)
        
        if success:
            return jsonify({
                'message': f'Provider {provider_id} indexed successfully',
                'provider_id': provider_id
            }), 200
        else:
            return jsonify({'error': 'Failed to index provider'}), 500
    except Exception as e:
        logger.error(f'Error indexing provider {provider_id}: {e}')
        return jsonify({'error': str(e)}), 500


@bp.route('/search', methods=['POST'])
@jwt_required(optional=True)
def vector_search():
    """
    Simple vector similarity search for providers
    
    Request body:
    {
        "query": "I need a plumber to fix my pipe",
        "limit": 5
    }
    """
    try:
        if not vector_service:
            return jsonify({'error': 'Vector service not initialized'}), 500
        
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'error': 'Missing required field: query'}), 400
        
        query = data.get('query', '').strip()
        limit = data.get('limit', 5)
        
        if not query or len(query) < 3:
            return jsonify({'error': 'Query must be at least 3 characters long'}), 400
        
        if limit < 1 or limit > 20:
            limit = 5
        
        # Get user ID if authenticated
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except:
            user_id = None
        
        # Perform search
        results = vector_service.vector_search(query, limit=limit, user_id=user_id)
        
        return jsonify({
            'success': True,
            'query': query,
            'results_count': len(results),
            'providers': results
        }), 200
    except Exception as e:
        logger.error(f'Vector search error: {e}')
        return jsonify({'error': str(e), 'success': False}), 500


@bp.route('/rag', methods=['POST'])
@jwt_required(optional=True)
def rag_search():
    """
    RAG-based provider search with Claude recommendations
    
    Request body:
    {
        "query": "I need someone to clean my house and do laundry",
        "context_limit": 3
    }
    
    Returns Claude's intelligent recommendation with matching providers
    """
    try:
        if not vector_service:
            return jsonify({'error': 'Vector service not initialized'}), 500
        
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'error': 'Missing required field: query'}), 400
        
        query = data.get('query', '').strip()
        context_limit = data.get('context_limit', 3)
        
        if not query or len(query) < 5:
            return jsonify({'error': 'Query must be at least 5 characters long'}), 400
        
        if context_limit < 1 or context_limit > 10:
            context_limit = 3
        
        # Get user ID if authenticated
        try:
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
        except:
            user_id = None
        
        # Perform RAG search
        rag_result = vector_service.rag_search(query, user_id=user_id, context_limit=context_limit)
        
        return jsonify(rag_result), (200 if rag_result.get('success') else 400)
    except Exception as e:
        logger.error(f'RAG search error: {e}')
        return jsonify({'error': str(e), 'success': False}), 500


@bp.route('/rag/feedback', methods=['POST'])
@jwt_required()
def rag_feedback():
    """
    Store user feedback on RAG recommendations to improve ranking
    
    Request body:
    {
        "query_history_id": 123,
        "selected_provider_id": 456,
        "rating": 4,
        "feedback": "Great recommendation!"
    }
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'selected_provider_id' not in data:
            return jsonify({'error': 'Missing required field: selected_provider_id'}), 400
        
        from app.models import SearchQueryHistory
        
        # Update search history with feedback
        query_history = SearchQueryHistory.query.filter_by(
            id=data.get('query_history_id'),
            user_id=user_id
        ).first()
        
        if query_history:
            query_history.selected_provider_id = data.get('selected_provider_id')
            db.session.commit()
        
        return jsonify({
            'message': 'Feedback recorded successfully',
            'provider_id': data.get('selected_provider_id')
        }), 200
    except Exception as e:
        logger.error(f'Feedback error: {e}')
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/stats', methods=['GET'])
def get_vector_stats():
    """Get vector database statistics"""
    try:
        if not vector_service:
            return jsonify({'error': 'Vector service not initialized'}), 500
        
        stats = vector_service.get_provider_statistics()
        return jsonify(stats), 200
    except Exception as e:
        logger.error(f'Error getting statistics: {e}')
        return jsonify({'error': str(e)}), 500
