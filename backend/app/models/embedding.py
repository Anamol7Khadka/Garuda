from app import db
from datetime import datetime
from pgvector.sqlalchemy import Vector
import json


class ProviderEmbedding(db.Model):
    """Store vector embeddings for RAG-based provider search"""
    __tablename__ = 'provider_embeddings'
    
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('providers.id'), nullable=False, unique=True, index=True)
    
    # Store the embedding vector (384 dimensions for all-MiniLM-L6-v2)
    embedding = db.Column(Vector(384), nullable=False)
    
    # Store metadata for RAG context
    provider_bio = db.Column(db.Text, nullable=True)  # Full provider description
    skills_text = db.Column(db.Text, nullable=True)   # Skills as readable text
    service_description = db.Column(db.Text, nullable=True)  # Service details
    
    # Embedding metadata
    embedding_model = db.Column(db.String(120), default='sentence-transformers/all-MiniLM-L6-v2', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_indexed = db.Column(db.Boolean, default=True)
    
    # Relationships
    provider = db.relationship('Provider', backref='embedding', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'provider_id': self.provider_id,
            'embedding_model': self.embedding_model,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_indexed': self.is_indexed,
            'provider_bio': self.provider_bio,
            'skills_text': self.skills_text,
        }


class SearchQueryHistory(db.Model):
    """Track RAG search queries for analytics and improvement"""
    __tablename__ = 'search_query_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    query = db.Column(db.Text, nullable=False)
    query_embedding = db.Column(Vector(1536), nullable=False)
    results_provider_ids = db.Column(db.Text, nullable=True)  # Comma-separated IDs
    results_count = db.Column(db.Integer, default=0)
    selected_provider_id = db.Column(db.Integer, nullable=True)  # Which provider user selected
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = db.relationship('User', backref='search_history', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'query': self.query,
            'results_count': self.results_count,
            'selected_provider_id': self.selected_provider_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
