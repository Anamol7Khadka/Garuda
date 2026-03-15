from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
import os
import logging
from app import db
from app.models import Review, Provider, User, Booking
from app.utils.ai_service import AIService
from app.utils.matching import ProviderMatcher
import base64
import json
from functools import wraps
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

bp = Blueprint('ai', __name__, url_prefix='/api/ai')

# Initialize AI service with error handling
try:
    ai_service = AIService()
    logger.info('AI Service initialized successfully')
except Exception as e:
    logger.error(f'Failed to initialize AI Service: {str(e)}')
    ai_service = None

matcher = ProviderMatcher()

# Simple rate limiting (in-memory)
request_counts = {}


def rate_limit(max_requests=20, window=60):
    """Rate limit decorator (20 req/min per user)"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            # FIXED: use verify_jwt_in_request(optional=True) instead of get_jwt_identity()
            try:
                verify_jwt_in_request(optional=True)
                identity = get_jwt_identity()
                user_id = str(identity) if identity else request.remote_addr or 'anon'
            except Exception:
                user_id = request.remote_addr or 'anon'

            now = datetime.utcnow()
            key = f"{user_id}:{now.minute}"

            if key not in request_counts:
                request_counts[key] = []

            request_counts[key] = [
                t for t in request_counts[key]
                if (now - t).total_seconds() < window
            ]

            if len(request_counts[key]) >= max_requests:
                return jsonify({"error": "Rate limit exceeded", "code": "RATE_LIMIT"}), 429

            request_counts[key].append(now)
            return f(*args, **kwargs)
        return decorated
    return decorator


@bp.route('/test-groq', methods=['GET'])
def test_groq():
    """Test if Groq is properly configured"""
    try:
        groq_key = os.getenv('GROQ_API_KEY')
        if not groq_key:
            return jsonify({'status': 'error', 'message': 'GROQ_API_KEY not set'}), 200

        from app.utils.groq_chat import GroqChatService
        service = GroqChatService()
        test_response = service.chat([{'role': 'user', 'content': 'Hello'}], 'english')

        return jsonify({
            'status': 'success',
            'message': 'Groq is working',
            'model': service.model,
            'sample_response': test_response[:150]
        }), 200
    except Exception as e:
        logger.error(f'Groq test error: {type(e).__name__}: {str(e)}', exc_info=True)
        return jsonify({
            'status': 'error',
            'error': str(e),
            'error_type': type(e).__name__
        }), 200


@bp.route('/chat', methods=['POST'])
@rate_limit(max_requests=20)
def chat():
    """AI booking chatbot - multi-turn conversation with service routing"""
    SERVICE_NAMES = {
        'plumbing': 'plumbers', 'electrical': 'electricians', 'cleaning': 'cleaners',
        'beauty': 'beauty & wellness professionals', 'carpentry': 'carpenters', 'painting': 'painters',
        'ac_repair': 'AC & appliance repair technicians', 'tutoring': 'tutors', 'pest_control': 'pest control experts', 'cooking': 'cooks'
    }
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided', 'code': 'VALIDATION_ERROR'}), 400

        messages = data.get('messages', [])
        language = data.get('language', 'english')

        if not messages:
            return jsonify({'error': 'No messages provided', 'code': 'VALIDATION_ERROR'}), 400

        logger.info(f'Chat request: {len(messages)} messages, language: {language}')

        detected_service = None
        confidence = 0
        route_data = None
        
        # ALWAYS detect service first from latest message
        try:
            from app.utils.groq_chat import GroqChatService
            temp_svc = GroqChatService()
            latest_msg = messages[-1].get('content', '') if messages else ''
            detected_service, confidence = temp_svc.detect_service_intent(latest_msg)
            logger.info(f'Detected service: {detected_service} (confidence: {confidence})')
        except Exception as det_err:
            logger.debug(f'Service detection error: {det_err}')

        # Try Groq for natural response
        try:
            from app.utils.groq_chat import GroqChatService
            logger.info('Attempting Groq service...')
            service = GroqChatService()

            raw_response = service.chat(messages, language)
            logger.info(f'Groq response received: {len(raw_response)} chars')
            clean_text, route_data = service.extract_route(raw_response)

            if not route_data and detected_service and confidence >= 2:
                route_data = {'service': detected_service, 'message': f'Showing {detected_service} providers', 'urgency': 'medium'}

            return jsonify({
                'data': {'reply': clean_text, 'route_to': route_data, 'detected_service': detected_service, 'language': language},
                'message': 'Chat response generated'
            }), 200

        except Exception as groq_err:
            logger.warning(f'Groq error: {type(groq_err).__name__}: {str(groq_err)[:80]}')

        # Fallback to Anthropic
        try:
            if ai_service:
                logger.info('Falling back to Anthropic...')
                response = ai_service.booking_assistant_chat(messages, language)
                if detected_service and confidence >= 2:
                    route_data = {'service': detected_service, 'message': f'Showing {detected_service} providers', 'urgency': 'medium'}
                return jsonify({
                    'data': {'reply': response, 'route_to': route_data, 'detected_service': detected_service, 'language': language},
                    'message': 'Chat response generated (via Anthropic)'
                }), 200
        except Exception as anth_err:
            logger.warning(f"Anthropic error: {type(anth_err).__name__}: {str(anth_err)[:80]}")

        # Final fallback: Use service detection to provide routing
        logger.info('Using service detection fallback')
        reply = "I can help you find the right professionals!"
        
        if detected_service and confidence >= 2:
            friendly = SERVICE_NAMES.get(detected_service, detected_service)
            reply = f"Great! I found {friendly} for you. Let me show you the best matches."
            route_data = {'service': detected_service, 'message': f'Found {friendly}', 'urgency': 'medium'}
        else:
            reply = 'Hi! What home service do you need — plumbing, electrical, cleaning, or something else?'

        return jsonify({
            'data': {'reply': reply, 'route_to': route_data, 'detected_service': detected_service, 'language': language},
            'message': 'Response generated (fallback)'
        }), 200

    except Exception as e:
        logger.error(f'Chat error: {type(e).__name__}: {str(e)}', exc_info=True)
        return jsonify({
            'data': {'reply': 'Sorry, I had trouble responding. Please try again.', 'route_to': None},
            'message': 'Error occurred'
        }), 200


@bp.route('/extract-booking', methods=['POST'])
@rate_limit(max_requests=20)
def extract_booking():
    """Extract structured booking data from natural language or image"""
    try:
        if not ai_service:
            return jsonify({'error': 'AI service not available', 'code': 'AI_SERVICE_UNAVAILABLE'}), 503

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided', 'code': 'VALIDATION_ERROR'}), 400

        description = data.get('description')
        image_base64 = data.get('image')

        if image_base64:
            extracted = ai_service.analyze_image(image_base64)
        elif description:
            extracted = ai_service.extract_booking_details(description)
        else:
            return jsonify({'error': 'No description or image provided', 'code': 'VALIDATION_ERROR'}), 400

        return jsonify({'data': extracted, 'message': 'Booking details extracted'}), 200

    except Exception as e:
        logger.error(f'Extract booking error: {str(e)}', exc_info=True)
        return jsonify({'error': str(e), 'code': 'EXTRACTION_ERROR'}), 500


@bp.route('/estimate-price', methods=['POST'])
@rate_limit(max_requests=20)
def estimate_price():
    """AI price estimation based on service and description"""
    try:
        if not ai_service:
            return jsonify({'error': 'AI service not available', 'code': 'AI_SERVICE_UNAVAILABLE'}), 503

        data = request.get_json()
        service_category = data.get('service_category')
        description = data.get('description')

        if not service_category or not description:
            return jsonify({"error": "Missing service_category or description"}), 400

        estimate = ai_service.estimate_price(service_category, description)
        return jsonify({"data": estimate, "message": "Price estimation generated"}), 200

    except Exception as e:
        return jsonify({"error": str(e), "code": "ESTIMATION_ERROR"}), 500


@bp.route('/match-providers', methods=['POST'])
@rate_limit(max_requests=20)
def match_providers():
    """AI-ranked provider recommendations"""
    try:
        data = request.get_json()
        service_type = data.get('service_type')
        location = data.get('location')
        budget = data.get('budget')
        preferred_gender = data.get('preferred_gender')
        description = data.get('description')

        if not service_type or not location:
            return jsonify({"error": "Missing service_type or location"}), 400

        result = matcher.match_providers(service_type, location, budget, preferred_gender, description)
        return jsonify({"data": result, "message": "Provider recommendations generated"}), 200

    except Exception as e:
        return jsonify({"error": str(e), "code": "MATCHING_ERROR"}), 500


@bp.route('/analyze-image', methods=['POST'])
@rate_limit(max_requests=10)
def analyze_image():
    """Upload photo to detect problem and suggest service"""
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No filename"}), 400

        if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            return jsonify({"error": "Invalid file type"}), 400

        file_data = file.read()
        image_base64 = base64.b64encode(file_data).decode('utf-8')

        if not ai_service:
            return jsonify({'error': 'AI service not available'}), 503

        analysis = ai_service.analyze_image(image_base64)
        return jsonify({"data": analysis, "message": "Image analyzed successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e), "code": "IMAGE_ANALYSIS_ERROR"}), 500


@bp.route('/summarize-reviews', methods=['POST'])
@jwt_required()
def summarize_reviews():
    """AI summarize provider reviews"""
    try:
        data = request.get_json()
        provider_id = data.get('provider_id')

        if not provider_id:
            return jsonify({"error": "provider_id required"}), 400

        provider = Provider.query.get(provider_id)
        if not provider:
            return jsonify({"error": "Provider not found"}), 404

        if not ai_service:
            return jsonify({'error': 'AI service not available'}), 503

        reviews = Review.query.filter_by(provider_id=provider.user_id).all()

        if len(reviews) < 5:
            return jsonify({
                "data": {
                    "summary": None,
                    "review_count": len(reviews),
                    "message": "Need at least 5 reviews for AI summary"
                }
            }), 200

        reviews_data = [r.to_dict() for r in reviews[-10:]]
        summary = ai_service.summarize_reviews(reviews_data)

        provider.review_summary = summary
        db.session.commit()

        return jsonify({
            "data": {"summary": summary, "review_count": len(reviews)},
            "message": "Reviews summarized"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e), "code": "SUMMARY_ERROR"}), 500


@bp.route('/trust-score', methods=['POST'])
@jwt_required()
def calculate_trust_score():
    """Generate AI trust score for provider"""
    try:
        data = request.get_json()
        provider_id = data.get('provider_id')

        if not provider_id:
            return jsonify({"error": "provider_id required"}), 400

        provider = Provider.query.get(provider_id)
        if not provider:
            return jsonify({"error": "Provider not found"}), 404

        if not ai_service:
            return jsonify({'error': 'AI service not available'}), 503

        reviews = Review.query.filter_by(provider_id=provider.user_id).all()
        sentiments = [r.sentiment for r in reviews if r.sentiment]
        positive_count = sum(1 for s in sentiments if s == 'positive')
        positive_pct = (positive_count / len(sentiments) * 100) if sentiments else 50
        avg_sentiment = 'positive' if positive_pct > 60 else ('negative' if positive_pct < 30 else 'neutral')

        provider_data = {
            'years_experience': provider.years_experience,
            'id_verified': provider.id_verified,
            'total_jobs': provider.total_jobs,
            'avg_rating': provider.rating,
            'completion_rate': provider.completion_rate,
            'review_sentiment': avg_sentiment
        }

        result = ai_service.calculate_trust_score(provider_data)

        provider.trust_score = result['trust_score']
        provider.trust_badge = result['badge']
        db.session.commit()

        return jsonify({"data": result, "message": "Trust score calculated"}), 200

    except Exception as e:
        return jsonify({"error": str(e), "code": "TRUST_SCORE_ERROR"}), 500