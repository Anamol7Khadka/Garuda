from dotenv import load_dotenv
load_dotenv()
load_dotenv('../.env')

from app import create_app, db
from app.models import User

app = create_app()

KATHMANDU_LOCATIONS = [
    (27.7172, 85.3240, "Thamel"),
    (27.6933, 85.3423, "Patan"),
    (27.6710, 85.4298, "Bhaktapur"),
    (27.7325, 85.3312, "Balaju"),
    (27.7030, 85.3143, "Kirtipur"),
    (27.7560, 85.3340, "Budhanilkantha"),
    (27.6797, 85.3185, "Thankot"),
    (27.7192, 85.3737, "Koteshwor"),
    (27.7104, 85.3006, "Kalimati"),
    (27.6588, 85.4193, "Madhyapur"),
]

with app.app_context():
    providers = User.query.filter_by(role='provider').all()
    for i, user in enumerate(providers):
        loc = KATHMANDU_LOCATIONS[i % len(KATHMANDU_LOCATIONS)]
        user.latitude = loc[0]
        user.longitude = loc[1]
        user.city = loc[2]
        print(f"Updated {user.name}: {loc[0]}, {loc[1]} - {loc[2]}")
    db.session.commit()
    print(f"✅ Updated {len(providers)} providers with coordinates")
