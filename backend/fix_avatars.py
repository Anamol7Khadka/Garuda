"""
Fix avatars for existing users in the database
Run with: python fix_avatars.py
"""

import os
from dotenv import load_dotenv

# Load env first
load_dotenv()

# Simple approach - connect directly
import psycopg2

try:
    conn = psycopg2.connect(
        dbname=os.getenv('POSTGRES_DB', 'sewasathi'),
        user=os.getenv('POSTGRES_USER', 'postgres'),
        password=os.getenv('POSTGRES_PASSWORD', 'sewasathi123'),
        host=os.getenv('POSTGRES_HOST', 'localhost'),
        port=os.getenv('POSTGRES_PORT', '5432')
    )
    cur = conn.cursor()
    
    # Get users without profile_photo
    cur.execute("SELECT id, name, is_female FROM users WHERE profile_photo IS NULL")
    users = cur.fetchall()
    
    updated = 0
    for user_id, name, is_female in users:
        bg = 'C0392B' if is_female else 'A05A2C'  # brand primary / warm brown
        name_encoded = name.replace(' ', '+')
        avatar_url = (
            f"https://ui-avatars.com/api/"
            f"?name={name_encoded}"
            f"&background={bg}"
            f"&color=ffffff"
            f"&size=200"
            f"&bold=true"
            f"&rounded=true"
        )
        cur.execute("UPDATE users SET profile_photo = %s WHERE id = %s", (avatar_url, user_id))
        updated += 1
    
    conn.commit()
    print(f"✅ Updated {updated} user avatars")
    
    # Check total with avatars
    cur.execute("SELECT COUNT(*) FROM users WHERE profile_photo IS NOT NULL")
    total = cur.fetchone()[0]
    print(f"📊 Total users with profile photos: {total}")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("Make sure PostgreSQL is running and DATABASE_URL is correct")
