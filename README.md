# Garuda 
## AI-Powered Home Services Marketplace for Nepal

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.1.0-brightgreen.svg)
![Status](https://img.shields.io/badge/status-hackathon%20ready-orange.svg)

Garuda is a full-stack AI-powered home services marketplace built for Nepal, prioritizing women service providers through a Women First system. Tested and built on macOS. Recent updates include a Dynamic Cost Calculator, AI-enhanced price estimation with RAG, and a refreshed UI theme (new palette, typography, and subtle animations).

---

## Problems We Address
- Cluttered and informal market: homeowners struggle to find reliable workers and rely on word-of-mouth or random contacts.
- Uncertain prices and unpredictable service quality: no transparent estimates or guarantees.
- Broken connection: demand and skills exist, but matching is inefficient; workers wait at chowks/roadside and often depend on middlemen who take commission

Garuda offers a one-stop solution: verified providers, transparent AI-assisted pricing, structured workflows, and a trusted marketplace that connects homeowners and workers directly.

## Revenue Model
1. Service commission: percentage on completed jobs.
2. Worker subscription plans: premium visibility, faster payouts, and lead boosts for providers.
3. Business partnerships: enterprise and institutional contracts for facilities, housing, and campus maintenance.
4. Data insights: anonymized operational insights for government and agencies where permitted.

## Scaling Strategy
1. Geographic scaling: start in Nepal, expand to South Asia and beyond.
2. Vertical scaling: evolve from recommendations to handling payments, insurance, and end-to-end service guarantees.
3. Institutional scaling: extend from B2C to B2B and toward a SaaS offering for partners.

## Features

### Recent Updates (Mar 2026)
- Dynamic Cost Calculator in the booking flow with travel and multiplier breakdown ([frontend/src/components/DynamicCostCalculator.jsx](frontend/src/components/DynamicCostCalculator.jsx), [frontend/src/pages/BookingFlow.jsx](frontend/src/pages/BookingFlow.jsx)).
- AI price estimator now uses RAG and similarity search for Nepal-specific pricing ([backend/app/utils/ai_service.py](backend/app/utils/ai_service.py)).
- Floating chat widget removed; hero chat remains on the home page ([frontend/src/components/HomeChat.jsx](frontend/src/components/HomeChat.jsx)).
- New color palette, typography, and subtle animations applied across UI ([frontend/tailwind.config.js](frontend/tailwind.config.js), [frontend/src/index.css](frontend/src/index.css)).

### Core Platform
- User roles: Customer, Service Provider, Admin.
- Authentication: JWT-based access control.
- Database: PostgreSQL.
- Deployment: Docker and Docker Compose.
- Frontend: Responsive, mobile-first Tailwind CSS.

### Women First System
- Women First badge on female provider profiles.
- Filters prioritize women providers.
- Dedicated homepage section for women entrepreneurs.
- +10 bonus score in AI matching algorithm for female providers.
- Women First filter toggle on the Services page.

### AI Features (Claude API Integration)
1. AI Booking Chatbot (`/api/ai/chat`): Multi-turn Nepali/English conversation with booking assistance.
2. Smart Provider Matching (`/api/ai/match-providers`): Ranks providers and returns match reasoning with gender preference support.
3. AI Price Estimator with RAG (`/api/ai/estimate-price`): Similarity search over historical bookings plus Nepal baseline rates; formula: Base × Complexity × Location × Rating × Experience + Travel.
4. Dynamic Cost Calculator (frontend): Shows cost after location, computes travel (Rs 10/km) with Haversine distance, applies rating/experience/complexity multipliers, animated breakdown in booking flow.
5. Image Problem Analyzer (`/api/ai/analyze-image`): Detects issue from photo and suggests service, auto-fills booking form.
6. Review Summarizer (`/api/ai/summarize-reviews`): 2-3 sentence summaries after 5+ reviews.
7. Trust Score Generator (`/api/ai/trust-score`): Credibility score 0-100 with badge assignment.

---

## AI Architecture (LLM + RAG + Routing)
- LLM backbone: Groq-hosted `llama-3.3-70b-versatile`; Anthropic Claude (`claude-sonnet-4-20250514`) fallback.
- RAG: Provider and booking data retrieval grounds responses.
- Vector database: PostgreSQL table `provider_embeddings` with cosine similarity search.
- Service intent detection: Keyword scorer plus LLM-extracted `ROUTE_TO` JSON.
- Response parsing: Backend returns `reply` text and `route_to` JSON separately.
- Rate limits: `/api/ai/*` capped at 20 requests per minute per user.

### RAG Flow
1. User message arrives at `/api/ai/chat` with prior turns.
2. GroqChatService detects intent and prompts the LLM for `ROUTE_TO` JSON when confident.
3. Embeddings are fetched and ranked from `provider_embeddings` when needed.
4. Response is cleaned into text plus parsed `route_to` JSON.
5. Frontend renders the reply and deep-links when `route_to` exists.
6. Anthropic fallback runs if Groq fails; guided fallback shown if both fail.

### Frontend ↔ Backend Integration
- API client: [frontend/src/api/client.js](frontend/src/api/client.js) proxies `/api` to the backend (`vite.config.js`), adding JWTs automatically.
- Booking cost: [frontend/src/components/DynamicCostCalculator.jsx](frontend/src/components/DynamicCostCalculator.jsx) renders AI-aware pricing breakdown inside the booking flow.
- Chat surface: Hero chat on the home page ([frontend/src/components/HomeChat.jsx](frontend/src/components/HomeChat.jsx)); floating chat widget removed for a cleaner UI.
- Routing UX: When `route_to` contains `{ service, message, urgency }`, the React components show a CTA that navigates to the category (for example, `/services?category=plumbing`).
- Multilingual: `language` param on each chat request; LLM responds in Nepali or English.

### Backend Components
- Endpoints: `/api/ai/chat`, `/api/ai/match-providers`, `/api/ai/estimate-price`, `/api/ai/extract-booking`, `/api/ai/analyze-image`, `/api/ai/summarize-reviews`, `/api/ai/trust-score` (all in [backend/app/routes/ai.py](backend/app/routes/ai.py)).
- LLM Client: [backend/app/utils/groq_chat.py](backend/app/utils/groq_chat.py); [backend/app/utils/ai_service.py](backend/app/utils/ai_service.py) manages Anthropic fallback, shared utilities, and RAG/similarity-based price estimation.
- Matching: [backend/app/utils/matching.py](backend/app/utils/matching.py) combines vector similarity, scoring heuristics, and Women First bonus.
- Data Plane: PostgreSQL stores structured data plus embeddings; uploads served via `/uploads/*` proxied from Vite.

---

## Tech Stack

### Backend
- Framework: Flask 2.3.5.
- Database: PostgreSQL 15 with SQLAlchemy ORM.
- Authentication: Flask-JWT-Extended.
- AI: Anthropic Claude API (claude-sonnet-4-20250514).
- Validation: Marshmallow.
- Migration: Flask-Migrate.
- Server: Gunicorn.

### Frontend
- Framework: React 18.2 with Vite 5.
- Styling: Tailwind CSS 3 with custom theme.
- Routing: React Router v6.
- HTTP: Axios.
- Icons: Lucide React.
- Fonts: Sora (headings) and Inter (body), Nepali supported via system fallbacks.

### DevOps
- Containerization: Docker and Docker Compose.
- Volume persistence: PostgreSQL data and uploads.
- Network: Bridge networking.
- Health checks: Built-in.

---

## Project Structure

```
garuda/
├── docker-compose.yml          # Service orchestration
├── .env.example                # Environment template
├── README.md                   # This file
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── run.py                  # Entry point
│   ├── seed_db.py              # Sample data generator
│   └── app/
│       ├── __init__.py         # App factory
│       ├── config.py           # Configuration
│       ├── models/
│       │   ├── user.py         # User + Provider models
│       │   ├── service.py      # Service + Category models
│       │   ├── booking.py      # Booking model
│       │   └── review.py       # Review model
│       ├── routes/
│       │   ├── auth.py         # Auth endpoints
│       │   ├── providers.py    # Provider endpoints
│       │   ├── services.py     # Service endpoints
│       │   ├── bookings.py     # Booking endpoints
│       │   ├── reviews.py      # Review endpoints
│       │   └── ai.py           # AI endpoints
│       └── utils/
│           ├── ai_service.py   # Claude and RAG utilities
│           └── matching.py     # Provider matching logic
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/
        │   └── client.js
        ├── context/
        │   ├── AuthContext.jsx
        │   └── BookingContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── HomeChat.jsx            # Hero chatbot on home
        │   ├── DynamicCostCalculator.jsx
        │   ├── ProviderCard.jsx
        │   ├── ServiceCard.jsx
        │   └── Loading.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Services.jsx
            ├── ProviderProfile.jsx
            ├── BookingFlow.jsx
            ├── AdminDashboard.jsx
            └── Dashboard/
                ├── CustomerDashboard.jsx
                └── ProviderDashboard.jsx
```

---

## Setup and Running (macOS)
- Confirm Docker and Docker Compose are installed on macOS.
- All required keys and defaults are provided in [.env.example](.env.example). Copy it to `.env` and adjust as needed.

### Steps
1. Clone and enter the repository
```bash
git clone https://github.com/yourusername/garuda.git
cd garuda
```
2. Create `.env` from the example (contains all keys and ports)
```bash
cp .env.example .env
# Update values if needed (Anthropic, Google Maps, JWT, database, BACKEND_PORT, VITE_API_URL)
```
3. Start services (Docker Compose)
```bash
docker-compose up -d
```
Services:
- Backend: http://localhost:5002 (configurable via BACKEND_PORT)
- Frontend: http://localhost:3000
- Database: localhost:5432

4. Seed sample data
```bash
docker-compose exec backend python seed_db.py
```

5. Develop
- Backend reloads via the mounted volume.
- Frontend uses Vite hot reload.

---

## Environment Variables (.env example contains all keys)
```env
ANTHROPIC_API_KEY=sk-ant-xxxxxx
JWT_SECRET_KEY=your-super-secret-key
GOOGLE_MAPS_API_KEY=your-api-key
DATABASE_URL=postgresql://postgres:sewasathi123@postgres:5432/sewasathi
POSTGRES_PASSWORD=sewasathi123
FLASK_ENV=development
BACKEND_PORT=5002
VITE_API_URL=http://localhost:5002
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Authentication | Purpose |
|--------|----------|----------------|---------|
| POST | `/api/auth/register` | None | Register customer/provider |
| POST | `/api/auth/login` | None | Login, get JWT tokens |
| POST | `/api/auth/refresh` | Refresh Token | Refresh access token |
| GET | `/api/auth/me` | JWT | Get current user |

### Providers
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/providers` | None | List providers (filter: city, min_rating, women_first) |
| GET | `/api/providers/:id` | None | Get provider profile and reviews |
| PUT | `/api/providers/:id` | JWT | Update provider profile |
| POST | `/api/providers/:id/verify` | Admin | Verify provider identity |
| GET | `/api/providers/my-profile` | JWT | Get current provider profile |

### Services
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/services/categories` | None | List categories |
| GET | `/api/services` | None | List services (filterable) |
| POST | `/api/services` | JWT | Create service (provider) |
| PUT | `/api/services/:id` | JWT | Update service |
| DELETE | `/api/services/:id` | JWT | Delete service |

### Bookings
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/bookings` | JWT | Create booking |
| GET | `/api/bookings/my` | JWT | Get customer bookings |
| GET | `/api/bookings/assigned` | JWT | Get provider bookings |
| GET | `/api/bookings/:id` | JWT | Get booking details |
| PUT | `/api/bookings/:id/status` | JWT | Update booking status |

### Reviews
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/reviews` | JWT | Submit review |
| GET | `/api/reviews/provider/:id` | None | Get provider reviews |
| GET | `/api/reviews/:id` | None | Get review details |

### AI Endpoints (20 req/min/user)
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/ai/chat` | None | Multi-turn chatbot |
| POST | `/api/ai/extract-booking` | None | Extract booking from text/image |
| POST | `/api/ai/estimate-price` | None | AI price estimation |
| POST | `/api/ai/match-providers` | None | AI provider matching |
| POST | `/api/ai/analyze-image` | None | Analyze image for problem detection |
| POST | `/api/ai/summarize-reviews` | JWT | Summarize provider reviews |
| POST | `/api/ai/trust-score` | JWT | Calculate provider trust score |

---

## Database Models (fields summarized)
- User: id, name, email, password_hash, phone, role, gender, profile_photo, lat/lng, city, address, is_verified, is_female, created_at.
- Provider (extends User): bio, skills, years_experience, is_available, rating, total_jobs, total_earnings, trust_score, trust_badge, id_verified, certifications, hourly_rate, service_radius_km, review_summary, completion_rate.
- ServiceCategory: id, name, name_np, icon, description, base_price.
- Service: id, provider_id, category_id, title, description, price, price_type, is_active, image_url, created_at.
- Booking: id, customer_id, provider_id, service_id, status, scheduled_at, address, lat/lng, description, ai_extracted_data, final_price, payment_status, notes, created_at, completed_at.
- Review: id, booking_id, customer_id, provider_id, rating, comment, ai_summary, sentiment, images, created_at.

---

## Women First Feature

### Design
- Accent-mid color (#6a6ebd) for Women First UI elements.
- Women First badge on provider cards and profiles.
- Prominent toggle on Services page.
- +10 AI match score for female providers.
- Dedicated homepage section for women entrepreneurs.

### Implementation
- `is_female` boolean on User model.
- +10 bonus in `/api/ai/match-providers` endpoint.
- Filter parameter `women_first=true` on `/api/providers`.
- Sorting by `is_female DESC` in provider listings.

---

## Security
- JWT tokens with 24-hour expiration.
- Password hashing with Werkzeug.
- CORS enabled for frontend origin.
- Input validation on all routes (Marshmallow).
- File upload validation (jpg/png/pdf, max 5MB).
- Rate limiting on AI endpoints (20 req/min).
- Admin-only endpoints for sensitive operations.

---

## Service Categories (Seed Data)
1. Plumbing (प्लम्बिङ)
2. House Cleaning (घर सफाई)
3. Electrical (इलेक्ट्रिकल)
4. Beauty and Wellness (सौन्दर्य)
5. Carpentry (काठको काम)
6. Painting (रंगरोगन)
7. AC and Appliances (एसी मर्मत)
8. Tutoring (ट्युसन)
9. Pest Control (किरा नियन्त्रण)
10. Cooking (खाना पकाउने)

---

## Deployment

### Manual
```bash
# Production setup
export FLASK_ENV=production
flask run --host=0.0.0.0 --port=5002
```

### Docker (recommended)
```bash
docker-compose -f docker-compose.yml up --build -d
```

### Environment for Production
```bash
JWT_SECRET_KEY=<strong-random-key>
ANTHROPIC_API_KEY=<your-key>
DATABASE_URL=postgresql://user:pass@db:5432/sewasathi
FLASK_ENV=production
```

---

## Nepali Language Support
- UI translated to Nepali (नेपाली).
- Fonts: Sora (headings) and Inter (body) with Nepali fallbacks.
- Chatbot supports Nepali and English.
- City names available in Nepali transliteration.

---

## Known Limitations (MVP)
- Payment integration is mocked; future eSewa/Khalti planned.
- Google Maps optional for MVP.
- Image uploads stored locally (swappable to S3).
- Notifications UI exists; backend integration pending.

---

## Development Workflow
1. Backend: edit `backend/app/routes/*.py` or models; auto-reloads via Docker volume.
2. Frontend: edit `frontend/src/**`; Vite hot reload on save.
3. Database: seed via `seed_db.py` or use Flask-Migrate for migrations.

---

## Future Enhancements
- Real payment gateway (eSewa/Khalti).
- SMS/Email notifications.
- Google Maps integration.
- Video call consultation.
- Provider timeline and portfolio.
- Advanced analytics dashboard.
- Multiple language support.
- Push notifications.
- Escrow payment system.
- Provider verification system.

---

## Contributing
1. Fork the repo.
2. Create a feature branch.
3. Commit changes.
4. Push and create a PR.

---

## License
MIT License - See LICENSE file.

---

## Support
- Check API endpoints in `backend/app/routes/`.
- Review seed data in `seed_db.py`.
- Test endpoints with provided credentials.
- Check browser console for frontend errors.

---

Built on macOS to empower Nepal's service economy, one booking at a time.
