#!/usr/bin/env python
"""
Drop and recreate provider_embeddings table with correct dimensions.
"""

import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

load_dotenv()

def reset_embeddings_table():
    """Drop and recreate provider_embeddings table"""
    
    try:
        # Get database connection string
        db_url = os.getenv(
            "DATABASE_URL",
            "postgresql://postgres:sewasathi123@localhost:5432/sewasathi"
        )
        
        # Parse connection string
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
        
        # Set autocommit mode
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Drop provider_embeddings table if it exists
        print("Dropping provider_embeddings table...")
        cursor.execute("DROP TABLE IF EXISTS provider_embeddings CASCADE;")
        print("✓ Table dropped")
        
        # Drop search_query_history table if it exists
        print("Dropping search_query_history table...")
        cursor.execute("DROP TABLE IF EXISTS search_query_history CASCADE;")
        print("✓ Table dropped")
        
        cursor.close()
        conn.close()
        
        print("\n✓ Tables reset. You can now run seed_embeddings.py")
        return 0
        
    except psycopg2.OperationalError as e:
        print(f"❌ Connection Error: {e}")
        return 1
    except psycopg2.Error as e:
        print(f"❌ Database Error: {e}")
        return 1
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1


if __name__ == '__main__':
    exit_code = reset_embeddings_table()
    sys.exit(exit_code)
