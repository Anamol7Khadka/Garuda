"""
Seed database with sample data for SewaSathi marketplace
Run with: flask shell < seed_db.py or python seed_db.py
"""

from app import create_app, db
from app.models import User, Provider, ServiceCategory, Service, Booking, Review
from datetime import datetime, timedelta
import random

app = create_app('development')

def get_avatar(name, is_female=False):
    """Generate avatar URL from UI Avatars API with brand colors (no purple)."""
    bg = 'C0392B' if is_female else 'A05A2C'  # brand primary / warm brown
    color = 'ffffff'
    name_encoded = name.replace(' ', '+')
    return f"https://ui-avatars.com/api/?name={name_encoded}&background={bg}&color={color}&size=200&bold=true&rounded=true"

def seed_database():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        print("🌱 Seeding database with sample data...")
        
        # Service Categories
        categories_data = [
            {
                'name': 'Plumbing',
                'name_np': 'प्लम्बिङ',
                'icon': '🔧',
                'description': 'Plumbing services and repairs',
                'base_price': 500
            },
            {
                'name': 'House Cleaning',
                'name_np': 'घर सफाई',
                'icon': '🧹',
                'description': 'Professional house cleaning services',
                'base_price': 300
            },
            {
                'name': 'Electrical',
                'name_np': 'इलेक्ट्रिकल',
                'icon': '⚡',
                'description': 'Electrical installation and repairs',
                'base_price': 600
            },
            {
                'name': 'Beauty & Wellness',
                'name_np': 'सौन्दर्य',
                'icon': '💅',
                'description': 'Beauty and wellness services',
                'base_price': 400
            },
            {
                'name': 'Carpentry',
                'name_np': 'काठको काम',
                'icon': '🪛',
                'description': 'Carpentry and woodwork',
                'base_price': 800
            },
            {
                'name': 'Painting',
                'name_np': 'रंगरोगन',
                'icon': '🎨',
                'description': 'Painting and decoration',
                'base_price': 400
            },
            {
                'name': 'AC & Appliances',
                'name_np': 'एसी मर्मत',
                'icon': '❄️',
                'description': 'AC and appliance repair',
                'base_price': 700
            },
            {
                'name': 'Tutoring',
                'name_np': 'ट्युसन',
                'icon': '📚',
                'description': 'Educational tutoring services',
                'base_price': 200
            },
            {
                'name': 'Pest Control',
                'name_np': 'किरा नियन्त्रण',
                'icon': '🐛',
                'description': 'Pest control services',
                'base_price': 1000
            },
            {
                'name': 'Cooking',
                'name_np': 'खाना पकाउने',
                'icon': '👨\u200d🍳',
                'description': 'Professional cooking services',
                'base_price': 600
            }
        ]
        
        categories = []
        for cat_data in categories_data:
            category = ServiceCategory(**cat_data)
            db.session.add(category)
            categories.append(category)
        
        db.session.commit()
        print(f"✅ Added {len(categories)} service categories")
        
        # Create admin user
        admin = User(
            name='Admin User',
            email='admin@sewasathi.com',
            phone='9841234567',
            role='admin',
            city='Kathmandu',
            is_verified=True,
            profile_photo=get_avatar('Admin User', False)
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("✅ Added admin user")
        
        # Create sample female providers (women first)
        female_names = [
            'Priya Sharma', 'Anita Poudel', 'Radha Singh', 'Bimala Rai',
            'Geeta Thapa', 'Sunita Subedi'
        ]
        
        female_providers = []
        for i, name in enumerate(female_names):
            user = User(
                name=name,
                email=f'provider{i+1}@sewasathi.com',
                phone=f'984{100000 + i}',
                role='provider',
                gender='female',
                city=random.choice(['Kathmandu', 'Lalitpur', 'Bhaktapur']),
                is_verified=True,
                is_female=True,
                profile_photo=get_avatar(name, True)
            )
            user.set_password('provider123')
            db.session.add(user)
            db.session.flush()
            
            # Create provider profile
            provider = Provider(
                user_id=user.id,
                bio=f'Experienced {name} with {random.randint(2, 10)} years of experience',
                skills=random.sample(['Cleaning', 'Cooking', 'Electrical', 'Plumbing', 'Beauty'], 
                                    k=random.randint(2, 3)),
                years_experience=random.randint(1, 15),
                is_available=True,
                rating=round(random.uniform(4.0, 5.0), 1),
                total_jobs=random.randint(10, 100),
                id_verified=True,
                hourly_rate=random.choice([200, 300, 400, 500]),
                service_radius_km=random.choice([5, 10, 15, 20]),
                trust_score=random.randint(70, 100),
                trust_badge=random.choice(['Rising', 'Trusted']),
                completion_rate=round(random.uniform(90, 100), 1)
            )
            db.session.add(provider)
            female_providers.append((user, provider))
        
        db.session.commit()
        print(f"✅ Added {len(female_providers)} female providers (Women First)")
        
        # Create sample male providers
        male_names = ['Roshan Kumar', 'Binod Pathak', 'Sanjeev Yadav', 'Deepak Niraula']
        
        male_providers = []
        for i, name in enumerate(male_names):
            user = User(
                name=name,
                email=f'provider_m{i+1}@sewasathi.com',
                phone=f'985{100000 + i}',
                role='provider',
                gender='male',
                city=random.choice(['Kathmandu', 'Lalitpur', 'Bhaktapur']),
                is_verified=True,
                is_female=False,
                profile_photo=get_avatar(name, False)
            )
            user.set_password('provider123')
            db.session.add(user)
            db.session.flush()
            
            provider = Provider(
                user_id=user.id,
                bio=f'Skilled {name} with {random.randint(1, 12)} years of experience',
                skills=random.sample(['Carpentry', 'Electrical', 'Plumbing', 'Painting', 'AC Repair'], 
                                    k=random.randint(2, 3)),
                years_experience=random.randint(1, 15),
                is_available=True,
                rating=round(random.uniform(3.5, 4.8), 1),
                total_jobs=random.randint(5, 80),
                id_verified=True,
                hourly_rate=random.choice([250, 350, 450, 550]),
                service_radius_km=random.choice([5, 10, 15, 20]),
                trust_score=random.randint(50, 85),
                trust_badge=random.choice(['New', 'Rising', 'Trusted']),
                completion_rate=round(random.uniform(85, 99), 1)
            )
            db.session.add(provider)
            male_providers.append((user, provider))
        
        db.session.commit()
        print(f"✅ Added {len(male_providers)} male providers")
        
        # All providers
        all_providers = female_providers + male_providers
        
        # Create services for each provider
        services_count = 0
        for user, provider in all_providers:
            num_services = random.randint(2, 4)
            for _ in range(num_services):
                category = random.choice(categories)
                service = Service(
                    provider_id=provider.id,
                    category_id=category.id,
                    title=f'{category.name} - {user.name}',
                    description=f'Professional {category.name.lower()} service by {user.name}',
                    price=random.randint(300, 1500),
                    price_type=random.choice(['fixed', 'hourly']),
                    is_active=True
                )
                db.session.add(service)
                services_count += 1
        
        db.session.commit()
        print(f"✅ Added {services_count} services")
        
        # Create sample customers
        customer_names = ['Ramesh Patel', 'Laxmi Gupta', 'Arjun Singh', 'Meera Sharma']
        customers = []
        
        for i, name in enumerate(customer_names):
            user = User(
                name=name,
                email=f'customer{i+1}@sewasathi.com',
                phone=f'986{100000 + i}',
                role='customer',
                city=random.choice(['Kathmandu', 'Lalitpur', 'Bhaktapur']),
                is_verified=True,
                profile_photo=get_avatar(name, name in ['Laxmi Gupta', 'Meera Sharma'])
            )
            user.set_password('customer123')
            db.session.add(user)
            customers.append(user)
        
        db.session.commit()
        print(f"✅ Added {len(customers)} sample customers")
        
        # Create sample bookings
        bookings = []
        for _ in range(15):
            customer = random.choice(customers)
            provider_user, provider = random.choice(all_providers)
            service = random.choice(provider.services)
            
            booking = Booking(
                customer_id=customer.id,
                provider_id=provider_user.id,
                service_id=service.id,
                status=random.choice(['pending', 'confirmed', 'completed']),
                scheduled_at=datetime.utcnow() + timedelta(days=random.randint(1, 30)),
                address=f'{random.randint(1, 100)} {random.choice(["Ramchandra Marg", "Lazimpat", "Thamel", "Durbar Marg"])}, Kathmandu',
                description=f'Need {service.title}',
                final_price=service.price,
                ai_extracted_data={}
            )
            db.session.add(booking)
            bookings.append(booking)
        
        db.session.commit()
        print(f"✅ Added {len(bookings)} sample bookings")
        
        # Create reviews for completed bookings
        reviews_count = 0
        for booking in bookings:
            if booking.status == 'completed':
                review = Review(
                    booking_id=booking.id,
                    customer_id=booking.customer_id,
                    provider_id=booking.provider_id,
                    rating=random.randint(3, 5),
                    comment=random.choice([
                        'Great service! Very professional.',
                        'Good work, on time and clean.',
                        'Excellent service, highly recommended.',
                        'Very satisfied with the work done.',
                        'Professional and courteous provider.'
                    ]),
                    sentiment=random.choice(['positive', 'neutral']),
                    images=[]
                )
                db.session.add(review)
                reviews_count += 1
        
        db.session.commit()
        print(f"✅ Added {reviews_count} sample reviews")
        
        # Update provider ratings based on reviews
        for user, provider in all_providers:
            reviews = Review.query.filter_by(provider_id=user.id).all()
            if reviews:
                avg_rating = sum(r.rating for r in reviews) / len(reviews)
                provider.rating = round(avg_rating, 1)
                
                # Update completion rate
                completed_bookings = Booking.query.filter_by(
                    provider_id=user.id,
                    status='completed'
                ).count()
                total_bookings = Booking.query.filter_by(provider_id=user.id).count()
                if total_bookings > 0:
                    provider.completion_rate = round((completed_bookings / total_bookings) * 100, 1)
        
        db.session.commit()
        
        print("\n" + "="*50)
        print("🎉 Database seeding completed successfully!")
        print("="*50)
        print("\n📊 Seed Statistics:")
        print(f"  • Service Categories: {len(categories)}")
        print(f"  • Female Providers: {len(female_providers)}")
        print(f"  • Male Providers: {len(male_providers)}")
        print(f"  • Total Services: {services_count}")
        print(f"  • Customers: {len(customers)}")
        print(f"  • Bookings: {len(bookings)}")
        print(f"  • Reviews: {reviews_count}")
        print("\n🔐 Login Credentials:")
        print("  Admin: admin@sewasathi.com / admin123")
        print("  Provider: provider1@sewasathi.com / provider123")
        print("  Customer: customer1@sewasathi.com / customer123")

if __name__ == '__main__':
    seed_database()
