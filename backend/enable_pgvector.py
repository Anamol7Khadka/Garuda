#!/usr/bin/env python
"""
Enable pgvector extension in PostgreSQL.
Run this once before using vector embeddings.
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

load_dotenv()

def enable_pgvector():
    """Enable pgvector extension in PostgreSQL"""
    
    try:
        # Get database connection string
        db_url = os.getenv(
            "DATABASE_URL",
            "postgresql://postgres:sewasathi123@localhost:5432/sewasathi"
        )
        
        # Parse connection string
        # Format: postgresql://user:password@host:port/dbname
        parts = db_url.replace('postgresql://', '').split('@')
        user_pass = parts[0].split(':')
        host_db = parts[1].split('/')
        
        user = user_pass[0]
        password = user_pass[1]
        host = host_db[0].split(':')[0]
        port = host_db[0].split(':')[1] if ':' in host_db[0] else '5432'
        dbname = host_db[1]
        
        print(f"Connecting to PostgreSQL at {host}:{port}/{dbname}...")
        
        # Connect to database
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            dbname=dbname
        )
        
        # Set autocommit mode to execute CREATE EXTENSION
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Enable pgvector extension
        print("Installing pgvector extension...")
        cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        print("✓ pgvector extension installed successfully")
        
        # Verify installation
        cursor.execute("SELECT extversion FROM pg_extension WHERE extname = 'vector';")
        result = cursor.fetchone()
        if result:
            print(f"✓ pgvector version: {result[0]}")
        
        cursor.close()
        conn.close()
        
        print("\n✓ PostgreSQL is ready for vector embeddings!")
        return 0
        
    except psycopg2.OperationalError as e:
        print(f"❌ Connection Error: Could not connect to PostgreSQL")
        print(f"   Make sure PostgreSQL is running at {host}:{port}")
        print(f"   Error: {e}")
        return 1
    except psycopg2.Error as e:
        print(f"❌ Database Error: {e}")
        return 1
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1


if __name__ == '__main__':
    exit_code = enable_pgvector()
    sys.exit(exit_code)
