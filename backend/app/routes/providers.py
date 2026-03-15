from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Provider, Service, Review
from sqlalchemy import func
from math import radians, cos

bp = Blueprint('providers', __name__, url_prefix='/api/providers')


@bp.route('', methods=['GET'])
def list_providers():
    try:
        city = request.args.get('city')
        category_id = request.args.get('category_id', type=int)
        min_rating = request.args.get('min_rating', type=float, default=0)
        women_first = request.args.get('women_first', 'false').lower() == 'true'
        page = request.args.get('page', type=int, default=1)
        per_page = request.args.get('per_page', type=int, default=10)

        # Query Provider, JOIN User — this allows ORDER BY both tables
        query = db.session.query(Provider).join(
            User, Provider.user_id == User.id
        ).filter(
            User.role == 'provider',
            Provider.is_available == True
        )

        if city:
            query = query.filter(User.city.ilike(f'%{city}%'))
        if women_first:
            query = query.filter(User.is_female == True)
        if min_rating > 0:
            query = query.filter(Provider.rating >= min_rating)
        if category_id:
            query = query.join(Service, Service.provider_id == Provider.id).filter(
                Service.category_id == category_id,
                Service.is_active == True
            )

        total = query.count()

        query = query.order_by(
            User.is_female.desc(),
            Provider.rating.desc(),
            Provider.trust_score.desc()
        ).offset((page - 1) * per_page).limit(per_page)

        providers = query.all()

        data = []
        for provider in providers:
            user = provider.user
            if not user:
                continue
            provider_data = user.to_dict()
            provider_data['provider'] = provider.to_dict()
            provider_data['services_count'] = len(provider.services)
            data.append(provider_data)

        return jsonify({
            "data": {
                "providers": data,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": total,
                    "pages": (total + per_page - 1) // per_page
                }
            },
            "message": "Providers retrieved successfully"
        }), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e), "code": "LIST_ERROR"}), 500


@bp.route('/<int:provider_id>', methods=['GET'])
def get_provider(provider_id):
    try:
        provider = Provider.query.filter_by(user_id=provider_id).first()

        if not provider:
            return jsonify({"error": "Provider not found", "code": "NOT_FOUND"}), 404

        user = provider.user
        services = [s.to_dict() for s in provider.services if s.is_active]
        reviews = Review.query.filter_by(provider_id=user.id).all()
        reviews_data = [r.to_dict() for r in reviews]

        avg_rating = 0
        if reviews:
            avg_rating = sum(r.rating for r in reviews) / len(reviews)

        response_data = {
            **user.to_dict(),
            'provider': provider.to_dict(),
            'services': services,
            'reviews': reviews_data,
            'review_stats': {
                'total_reviews': len(reviews),
                'average_rating': round(avg_rating, 1),
                'women_first_badge': user.is_female
            }
        }

        return jsonify({
            "data": response_data,
            "message": "Provider profile retrieved"
        }), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e), "code": "FETCH_ERROR"}), 500


@bp.route('/<int:provider_id>', methods=['PUT'])
@jwt_required()
def update_provider(provider_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or user.role != 'provider' or user.id != provider_id:
            return jsonify({"error": "Unauthorized", "code": "UNAUTHORIZED"}), 403

        provider = Provider.query.filter_by(user_id=user_id).first()
        if not provider:
            return jsonify({"error": "Provider profile not found", "code": "NOT_FOUND"}), 404

        data = request.get_json()

        for field in ['bio', 'skills', 'years_experience', 'hourly_rate',
                      'service_radius_km', 'is_available']:
            if field in data:
                setattr(provider, field, data[field])

        for field in ['phone', 'city', 'address', 'latitude',
                      'longitude', 'profile_photo']:
            if field in data:
                setattr(user, field, data[field])

        db.session.commit()

        return jsonify({
            "data": {**user.to_dict(), 'provider': provider.to_dict()},
            "message": "Provider profile updated successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e), "code": "UPDATE_ERROR"}), 500


@bp.route('/<int:provider_id>/verify', methods=['POST'])
@jwt_required()
def verify_provider(provider_id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user or current_user.role != 'admin':
            return jsonify({"error": "Admin access required", "code": "FORBIDDEN"}), 403

        provider = Provider.query.filter_by(user_id=provider_id).first()
        if not provider:
            return jsonify({"error": "Provider not found", "code": "NOT_FOUND"}), 404

        provider.id_verified = True
        provider.user.is_verified = True
        db.session.commit()

        return jsonify({
            "data": provider.user.to_dict(),
            "message": "Provider verified successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e), "code": "VERIFY_ERROR"}), 500


@bp.route('/nearby', methods=['GET'])
def get_nearby_providers():
    try:
        lat = request.args.get('lat', 27.7172, type=float)
        lng = request.args.get('lng', 85.3240, type=float)
        radius_km = request.args.get('radius', 5, type=float)
        female_only = request.args.get('female_only', 'false').lower() == 'true'
        category_id = request.args.get('category_id', type=int)
        limit = request.args.get('limit', 30, type=int)

        # Haversine bounding box (no PostGIS needed)
        lat_delta = radius_km / 111.0
        lng_delta = radius_km / (111.0 * abs(cos(radians(lat))))

        query = db.session.query(Provider).join(
            User, Provider.user_id == User.id
        ).filter(
            User.role == 'provider',
            Provider.is_available == True,
            User.latitude != None,
            User.longitude != None,
            User.latitude.between(lat - lat_delta, lat + lat_delta),
            User.longitude.between(lng - lng_delta, lng + lng_delta)
        )

        if female_only:
            query = query.filter(User.is_female == True)
        if category_id:
            query = query.join(Service, Service.provider_id == Provider.id).filter(
                Service.category_id == category_id,
                Service.is_active == True
            )

        providers = query.order_by(
            User.is_female.desc(),
            Provider.rating.desc()
        ).limit(limit).all()

        data = []
        for provider in providers:
            user = provider.user
            if user:
                d = user.to_dict()
                d['provider'] = provider.to_dict()
                data.append(d)

        return jsonify({
            "data": {
                "providers": data,
                "center": {"lat": lat, "lng": lng},
                "radius_km": radius_km,
                "count": len(data)
            },
            "message": f"Found {len(data)} providers within {radius_km}km"
        }), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e), "code": "NEARBY_ERROR"}), 500


@bp.route('/my-profile', methods=['GET'])
@jwt_required()
def get_my_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or user.role != 'provider':
            return jsonify({"error": "Not a provider", "code": "UNAUTHORIZED"}), 403

        provider = Provider.query.filter_by(user_id=user_id).first()
        services = [s.to_dict() for s in provider.services] if provider else []

        response_data = {
            **user.to_dict(),
            'services': services,
            'provider': provider.to_dict() if provider else None
        }

        return jsonify({
            "data": response_data,
            "message": "Profile retrieved"
        }), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e), "code": "FETCH_ERROR"}), 500