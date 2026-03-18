"""
Improved seed database with realistic data for SewaSathi
- 10 providers per service category
- Gender-appropriate skill matching
- Proper location data for map functionality
- No emojis in data (only for display)

Run with: python seed_db_v2.py
"""

from app import create_app, db
from app.models import User, Provider, ServiceCategory, Service, Booking, Review
from datetime import datetime, timedelta
import random

app = create_app('development')

# Service categories with gender skills mapping
CATEGORIES = [
    {'id': 1, 'name': 'Plumbing', 'name_np': 'प्लम्बिङ', 'base_price': 500},
    {'id': 2, 'name': 'House Cleaning', 'name_np': 'घर सफाई', 'base_price': 300},
    {'id': 3, 'name': 'Electrical', 'name_np': 'इलेक्ट्रिकल', 'base_price': 600},
    {'id': 4, 'name': 'Beauty & Wellness', 'name_np': 'सौन्दर्य', 'base_price': 400},
    {'id': 5, 'name': 'Carpentry', 'name_np': 'काठको काम', 'base_price': 800},
    {'id': 6, 'name': 'Painting', 'name_np': 'रंगरोगन', 'base_price': 400},
    {'id': 7, 'name': 'AC & Appliances', 'name_np': 'एसी मर्मत', 'base_price': 700},
    {'id': 8, 'name': 'Tutoring', 'name_np': 'ट्युसन', 'base_price': 200},
    {'id': 9, 'name': 'Pest Control', 'name_np': 'किरा नियन्त्रण', 'base_price': 1000},
    {'id': 10, 'name': 'Cooking', 'name_np': 'खाना पकाउने', 'base_price': 600}
]

# Realistic female names
FEMALE_NAMES = [
    'Priya Sharma', 'Anita Poudel', 'Radha Singh', 'Bimala Rai', 'Geeta Thapa',
    'Sunita Subedi', 'Nisha Gautam', 'Kavya Mishra', 'Asha Mehta', 'Divya Niroula',
    'Sandhya Thakuri', 'Deepa Gurung', 'Isha Koirala', 'Pooja Adhikari', 'Neha Shrestha',
    'Ritika Pathak', 'Smita Bansal', 'Anjali Verma', 'Rashmi Das', 'Usha Yadav'
]

# Realistic male names
MALE_NAMES = [
    'Roshan Kumar', 'Binod Pathak', 'Sanjeev Yadav', 'Deepak Niraula', 'Vikram Singh',
    'Arun Poudel', 'Suresh Thapa', 'Ramesh Gautam', 'Harish Gurung', 'Naresh Koirala',
    'Rajesh Mishra', 'Ashok Adhikari', 'Mohan Shrestha', 'Prakash Rai', 'Sanjay Yadav',
    'Arjun Singh', 'Nitin Kumar', 'Vishal Verma', 'Rakesh Das', 'Kiran Patel'
]

# Kathmandu area coordinates (varied realistic locations)
KATHMANDU_LOCATIONS = [
    (27.7172, 85.3240),  # City center
    (27.7245, 85.3380),  # Thamel
    (27.7092, 85.3206),  # Sinamangal
    (27.7150, 85.2900),  # Bhaktapur area
    (27.6800, 85.2950),  # Lalitpur area
    (27.7300, 85.3600),  # North Kathmandu
    (27.7400, 85.3300),  # East Kathmandu
    (27.6950, 85.3150),  # South Kathmandu
]

# Skill mapping: which categories are appropriate for each gender
FEMALE_SKILLS = [
    'House Cleaning', 'Beauty & Wellness', 'Cooking', 'Tutoring', 'Painting'
]

MALE_SKILLS = [
    'Plumbing', 'Electrical', 'Carpentry', 'AC & Appliances', 'Pest Control', 
    'Painting', 'House Cleaning', 'Tutoring', 'Cooking'
]

def get_avatar_url(name, is_female=False):
    """Generate avatar URL from UI Avatars API with brand palette (no purple)."""
    bg = 'C0392B' if is_female else 'A05A2C'  # brand primary / warm brown
    color = 'ffffff'
    name_encoded = name.replace(' ', '+')
    return f"https://ui-avatars.com/api/?name={name_encoded}&background={bg}&color={color}&size=200"

def seed_database():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        print("Seeding database with realistic data...\n")
        
        # Create service categories
        categories_map = {}
        for cat_data in CATEGORIES:
            category = ServiceCategory(
                name=cat_data['name'],
                name_np=cat_data['name_np'],
                base_price=cat_data['base_price']
            )
            db.session.add(category)
            db.session.flush()
            categories_map[cat_data['name']] = category.id
        
        db.session.commit()
        print(f"Created {len(CATEGORIES)} service categories")
        
        # Create admin
        admin = User(
            name='Admin',
            email='admin@sewasathi.com',
            role='admin',
            city='Kathmandu',
            is_verified=True
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("Created admin user\n")
        
        # Convenience demo provider (stable login)
        # Demo provider pinned to Janakpur for tutoring demos
        janakpur_lat, janakpur_lng = 26.7288, 85.9230
        demo_user = User(
            name='Demo Tutor - Janakpur',
            email='provider1@sewasathi.com',
            phone='9840000000',
            role='provider',
            gender='female',
            city='Janakpur',
            is_verified=True,
            is_female=True,
            latitude=janakpur_lat,
            longitude=janakpur_lng,
            profile_photo=get_avatar_url('Demo Tutor - Janakpur', True)
        )
        demo_user.set_password('provider123')
        db.session.add(demo_user)
        db.session.flush()

        demo_provider = Provider(
            user_id=demo_user.id,
            bio='Demo tutor for quick logins (Janakpur)',
            skills=['Tutoring'],
            years_experience=5,
            is_available=True,
            rating=4.8,
            total_jobs=42,
            id_verified=True,
            hourly_rate=450,
            service_radius_km=10,
            trust_score=90,
            trust_badge='Trusted',
            completion_rate=98.5
        )
        db.session.add(demo_provider)
        db.session.flush()

        demo_service = Service(
            provider_id=demo_provider.id,
            category_id=categories_map.get('Tutoring', 8),
            title='Tutoring Service',
            description='Friendly tutoring support from Janakpur demo provider',
            price=600,
            price_type='hourly',
            is_active=True
        )
        db.session.add(demo_service)
        db.session.commit()
        print("Created demo provider provider1@sewasathi.com / provider123\n")

        providers_created = 0
        services_created = 0
        
        # Create 10 female providers per appropriate category
        print("Creating female providers...")
        for category_name in FEMALE_SKILLS:
            category_id = categories_map[category_name]
            
            for i in range(10):
                name = random.choice(FEMALE_NAMES)
                lat, lng = random.choice(KATHMANDU_LOCATIONS)
                
                user = User(
                    name=name,
                    email=f'female_{category_name.lower().replace(" ", "_")}_{i}@sewasathi.com',
                    phone=f'984{random.randint(100000, 999999)}',
                    role='provider',
                    gender='female',
                    city='Kathmandu',
                    is_verified=True,
                    is_female=True,
                    latitude=lat + random.uniform(-0.01, 0.01),
                    longitude=lng + random.uniform(-0.01, 0.01),
                    profile_photo=get_avatar_url(name, True)
                )
                user.set_password('provider123')
                db.session.add(user)
                db.session.flush()
                
                provider = Provider(
                    user_id=user.id,
                    bio=f'{name} specializing in {category_name} with {random.randint(2, 10)} years experience',
                    skills=[category_name],
                    years_experience=random.randint(2, 10),
                    is_available=True,
                    rating=round(random.uniform(4.2, 5.0), 1),
                    total_jobs=random.randint(20, 150),
                    id_verified=True,
                    hourly_rate=random.choice([300, 400, 500, 600]),
                    service_radius_km=10,
                    trust_score=random.randint(75, 100),
                    trust_badge=random.choice(['Rising', 'Trusted', 'Expert']),
                    completion_rate=round(random.uniform(95, 100), 1)
                )
                db.session.add(provider)
                db.session.flush()
                
                # Create service
                service = Service(
                    provider_id=provider.id,
                    category_id=category_id,
                    title=f'{category_name} Service',
                    description=f'Professional {category_name.lower()} by {name}',
                    price=random.randint(500, 1500),
                    price_type='hourly',
                    is_active=True
                )
                db.session.add(service)
                providers_created += 1
                services_created += 1
        
        db.session.commit()
        print(f"Created {providers_created} female providers with {services_created} services\n")
        
        # Create 10 male providers per appropriate category
        print("Creating male providers...")
        male_providers_created = 0
        for category_name in MALE_SKILLS:
            category_id = categories_map[category_name]
            
            for i in range(10):
                name = random.choice(MALE_NAMES)
                lat, lng = random.choice(KATHMANDU_LOCATIONS)
                
                user = User(
                    name=name,
                    email=f'male_{category_name.lower().replace(" ", "_")}_{i}@sewasathi.com',
                    phone=f'985{random.randint(100000, 999999)}',
                    role='provider',
                    gender='male',
                    city='Kathmandu',
                    is_verified=True,
                    is_female=False,
                    latitude=lat + random.uniform(-0.01, 0.01),
                    longitude=lng + random.uniform(-0.01, 0.01),
                    profile_photo=get_avatar_url(name, False)
                )
                user.set_password('provider123')
                db.session.add(user)
                db.session.flush()
                
                provider = Provider(
                    user_id=user.id,
                    bio=f'{name} specializing in {category_name} with {random.randint(2, 10)} years experience',
                    skills=[category_name],
                    years_experience=random.randint(2, 10),
                    is_available=True,
                    rating=round(random.uniform(4.0, 4.9), 1),
                    total_jobs=random.randint(15, 120),
                    id_verified=True,
                    hourly_rate=random.choice([350, 450, 550, 650]),
                    service_radius_km=10,
                    trust_score=random.randint(70, 95),
                    trust_badge=random.choice(['New', 'Rising', 'Trusted']),
                    completion_rate=round(random.uniform(90, 99), 1)
                )
                db.session.add(provider)
                db.session.flush()
                
                # Create service
                service = Service(
                    provider_id=provider.id,
                    category_id=category_id,
                    title=f'{category_name} Service',
                    description=f'Professional {category_name.lower()} by {name}',
                    price=random.randint(500, 1600),
                    price_type='hourly',
                    is_active=True
                )
                db.session.add(service)
                male_providers_created += 1
                services_created += 1
        
        db.session.commit()
        print(f"Created {male_providers_created} male providers with services\n")
        
        # Create sample customers
        customer_names = ['Ramesh Patel', 'Laxmi Gupta', 'Arjun Singh', 'Meera Sharma']
        lat, lng = KATHMANDU_LOCATIONS[0]
        
        for i, name in enumerate(customer_names):
            is_female = name in ['Laxmi Gupta', 'Meera Sharma']
            user = User(
                name=name,
                email=f'customer{i+1}@sewasathi.com',
                phone=f'986{100000 + i}',
                role='customer',
                city='Kathmandu',
                is_verified=True,
                is_female=is_female,
                latitude=lat + random.uniform(-0.005, 0.005),
                longitude=lng + random.uniform(-0.005, 0.005),
                profile_photo=get_avatar_url(name, is_female)
            )
            user.set_password('customer123')
            db.session.add(user)
        
        db.session.commit()
        print("Created 4 sample customers\n")
        
        print("=" * 50)
        print("DATABASE SEEDING COMPLETE")
        print("=" * 50)
        print(f"Total Providers: {providers_created + male_providers_created}")
        print(f"Total Services: {services_created}")
        print(f"Login: admin@sewasathi.com / admin123")
        print(f"Provider: female_house_cleaning_0@sewasathi.com / provider123")
        print(f"Customer: customer1@sewasathi.com / customer123")

if __name__ == '__main__':
    seed_database()
