from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db
from app.models import User, Provider
from datetime import datetime

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@bp.route('/register', methods=['POST'])
def register():
    """Register a new user (customer or provider)"""
    try:
        data = request.get_json()
        
        # Validation
        if not data or not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Missing required fields", "code": "VALIDATION_ERROR"}), 400
        
        # Check if email already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email already registered", "code": "EMAIL_EXISTS"}), 409
        
        # Create user
        user = User(
            name=data.get('name'),
            email=data.get('email'),
            phone=data.get('phone'),
            role=data.get('role', 'customer'),
            gender=data.get('gender'),
            city=data.get('city'),
            is_female=(data.get('gender', '').lower() == 'female')
        )
        user.set_password(data.get('password'))
        
        db.session.add(user)
        db.session.flush()  # Get user ID without committing
        
        # If provider, create provider profile with skills
        if user.role == 'provider':
            provider = Provider(
                user_id=user.id,
                skills=data.get('skills', [])
            )
            db.session.add(provider)
        
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            "data": {
                "user": user.to_dict(),
                "access_token": access_token,
                "refresh_token": refresh_token
            },
            "message": "User registered successfully"
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e), "code": "REGISTER_ERROR"}), 500


@bp.route('/login', methods=['POST'])
def login():
    """Login user with email and password"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Missing email or password", "code": "VALIDATION_ERROR"}), 400
        
        user = User.query.filter_by(email=data.get('email')).first()
        
        if not user or not user.check_password(data.get('password')):
            return jsonify({"error": "Invalid email or password", "code": "AUTH_FAILED"}), 401
        
        # Generate tokens
        access_token = create_access_token(identity=str(user.id))   # RIGHT - string
        refresh_token = create_refresh_token(identity=str(user.id)) # RIGHT - string
        
        return jsonify({
            "data": {
                "user": user.to_dict(),
                "access_token": access_token,
                "refresh_token": refresh_token
            },
            "message": "Login successful"
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e), "code": "LOGIN_ERROR"}), 500


@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        user_id = int(get_jwt_identity())
        access_token = create_access_token(identity=str(user_id))
        
        return jsonify({
            "data": {"access_token": access_token},
            "message": "Token refreshed successfully"
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e), "code": "REFRESH_ERROR"}), 500


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current logged-in user"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found", "code": "NOT_FOUND"}), 404
        
        return jsonify({
            "data": user.to_dict(),
            "message": "User retrieved successfully"
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e), "code": "FETCH_ERROR"}), 500


@bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found", "code": "NOT_FOUND"}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        for field in ['name', 'phone', 'city', 'address', 'bio']:
            if field in data:
                setattr(user, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            "data": user.to_dict(),
            "message": "Profile updated successfully"
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e), "code": "UPDATE_ERROR"}), 500


@bp.route('/upload-photo', methods=['POST'])
@jwt_required()
def upload_photo():
    """Upload user profile photo"""
    import os
    from werkzeug.utils import secure_filename
    
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    UPLOAD_FOLDER = 'uploads/profiles'
    
    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found", "code": "NOT_FOUND"}), 404
        
        if 'photo' not in request.files:
            return jsonify({'error': 'No photo provided'}), 400
        
        file = request.files['photo']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'}), 400
        
        # Check file size (max 5MB)
        file.seek(0, 2)
        size = file.tell()
        file.seek(0)
        if size > 5 * 1024 * 1024:
            return jsonify({'error': 'File too large (max 5MB)'}), 400
        
        # Ensure upload directory exists
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Save file with user ID in filename
        filename = secure_filename(f"user_{user_id}_{file.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Save URL to user profile
        photo_url = f"/uploads/profiles/{filename}"
        user.profile_photo = photo_url
        db.session.commit()
        
        # Verify the update was saved
        refreshed_user = User.query.get(user_id)
        
        return jsonify({
            'data': {
                'photo_url': photo_url,
                'user': refreshed_user.to_dict()
            },
            'message': 'Photo uploaded successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'code': 'UPLOAD_ERROR'}), 500

