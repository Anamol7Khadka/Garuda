from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_name="development"):
    """Application factory"""
    app = Flask(__name__)
    
    # Load configuration
    from app.config import config
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app, 
         resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:5173"]}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )
    
    # Register blueprints
    from app.routes import auth, services, providers, bookings, reviews, ai, rag
    
    app.register_blueprint(auth.bp)
    app.register_blueprint(services.bp)
    app.register_blueprint(providers.bp)
    app.register_blueprint(bookings.bp)
    app.register_blueprint(reviews.bp)
    app.register_blueprint(ai.bp)
    app.register_blueprint(rag.bp)
    
    # Static file serving for uploads
    import os
    from flask import send_from_directory
    
    # Ensure uploads directory exists
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('uploads/profiles', exist_ok=True)
    
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        response = send_from_directory('uploads', filename)
        response.headers['Cache-Control'] = 'public, max-age=3600'
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    # Error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return {"error": "Bad Request", "code": "BAD_REQUEST"}, 400
    
    @app.errorhandler(404)
    def not_found(error):
        return {"error": "Not Found", "code": "NOT_FOUND"}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {"error": "Internal Server Error", "code": "INTERNAL_ERROR"}, 500
    
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    return app
