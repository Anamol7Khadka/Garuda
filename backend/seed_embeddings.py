#!/usr/bin/env python
"""
Initialize vector embeddings for all existing providers.
Run this after deploying the vector database feature.
"""

import os
import sys
import logging
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import Provider, ProviderEmbedding
from app.utils.vector_service import VectorDatabaseService

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """Initialize vector embeddings for all providers"""
    
    app = create_app()
    
    with app.app_context():
        try:
            logger.info("Starting vector embedding initialization...")
            
            # Initialize vector service
            vector_service = VectorDatabaseService()
            
            if not vector_service.embedding_model:
                logger.error("Failed to initialize embedding model")
                return 1
            
            # Get statistics before
            total_providers = Provider.query.count()
            already_indexed = ProviderEmbedding.query.count()
            
            logger.info(f"Total providers: {total_providers}")
            logger.info(f"Already indexed: {already_indexed}")
            
            # Index all providers
            logger.info("Starting indexing process...")
            stats = vector_service.index_all_providers()
            
            logger.info(f"""
Indexing Complete!
==================
Total Providers: {stats['total']}
Successfully Indexed: {stats['successful']}
Failed: {stats['failed']}
Coverage: {(stats['successful']/stats['total']*100):.1f}%
""")
            
            # Verify indexing
            final_indexed = ProviderEmbedding.query.filter_by(is_indexed=True).count()
            logger.info(f"Verified indexed providers: {final_indexed}")
            
            return 0
        except Exception as e:
            logger.error(f"Error during initialization: {e}", exc_info=True)
            return 1


if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
