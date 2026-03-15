import os
from dotenv import load_dotenv
from app import create_app, db
from app.models import User, Provider, ServiceCategory, Service, Booking, Review, ProviderEmbedding, SearchQueryHistory

# Load environment variables from .env files
load_dotenv()  # loads .env from current directory
load_dotenv('../.env')  # also try parent directory

app = create_app(os.getenv('FLASK_ENV', 'development'))

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Provider': Provider, 'ServiceCategory': ServiceCategory, 
            'Service': Service, 'Booking': Booking, 'Review': Review, 'ProviderEmbedding': ProviderEmbedding, 
            'SearchQueryHistory': SearchQueryHistory}

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5002, debug=True)
