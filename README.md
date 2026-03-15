# SewaSathi - सेवासाथी
## "मान्छे सेवामा सेवासाथी" - AI-Powered Home Services Marketplace for Nepal

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen.svg)
![Status](https://img.shields.io/badge/status-hackathon%20ready-orange.svg)

**SewaSathi** is a full-stack AI-powered home services marketplace platform built specifically for Nepal, prioritizing women service providers through an innovative "Women First" system.

---

## 🌟 Features

### Core Platform
- ✅ **User Roles**: Customer, Service Provider, Admin
- ✅ **JWT-based Authentication**: Secure, token-based access
- ✅ **PostgreSQL Database**: Robust data persistence
- ✅ **Docker Containerization**: Easy deployment
- ✅ **Responsive Design**: Mobile-first Tailwind CSS

### Women First System 💜
- 👩‍💼 Purple "Women First" badge on all female provider profiles
- 📌 Filters to show women providers first
- 📊 Dedicated homepage section for women entrepreneurs
- 🎯 +10 bonus score in AI matching algorithm for female providers
- 📈 Women First filter toggle on Services page (prominent)

### AI Features (Claude API Integration)
1. **🤖 AI Booking Chatbot** (`/api/ai/chat`)
   - Multi-turn conversation in Nepali/English
   - Context-aware booking assistance
   - Natural language understanding

2. **🎯 Smart Provider Matching** (`/api/ai/match-providers`)
   - AI ranks providers 0-100
   - Considers location, expertise, reviews, gender preference
   - Returns match reasoning for each provider

3. 💰 **AI Price Estimator** (`/api/ai/estimate-price`)
   - Analyzes job descriptions
   - Returns price range with complexity level
   - Nepal-specific pricing factors

4. 📸 **Image Problem Analyzer** (`/api/ai/analyze-image`)
   - Upload photo of issue
   - AI detects problem + suggests service
   - Auto-fills booking form

5. ⭐ **Review Summarizer** (`/api/ai/summarize-reviews`)
   - 2-3 sentence AI summaries after 5+ reviews
   - Highlights strengths and themes

6. 📈 **Trust Score Generator** (`/api/ai/trust-score`)
   - Calculates provider credibility 0-100
   - Assigns badges: New/Rising/Trusted/Expert
   - Factors: experience, ID verification, completion rate

---

## 🤖 AI Architecture (LLM + RAG + Routing)

- **LLM Backbone**: Groq-hosted `llama-3.3-70b-versatile` for fast text generation; Anthropic Claude (`claude-sonnet-4-20250514`) as fallback.
- **RAG (Retrieval-Augmented Generation)**: We ground LLM replies on provider and booking data to reduce hallucinations and localize answers.
- **Vector Database**: PostgreSQL table `provider_embeddings` stores dense vectors; similarity search powers semantic recall.
- **Semantic Search**: User text → embedding → cosine similarity over stored vectors → top-k providers feed the response.
- **Service Intent Detection**: Lightweight keyword scorer + LLM route extraction (`ROUTE_TO` JSON) to decide which service category to open in the UI.
- **Response Parsing**: Backend strips the `ROUTE_TO` block from the LLM message and returns `reply` (text) plus `route_to` (JSON) for the frontend.
- **Rate Limits**: `/api/ai/*` endpoints limited to 20 req/min/user to protect LLM costs.

### RAG Flow
1) User message arrives at `/api/ai/chat` with prior turns.
2) GroqChatService detects intent and calls the LLM with a system prompt that demands a `ROUTE_TO` JSON when confident.
3) If needed, embeddings for providers are fetched and ranked (semantic search over `provider_embeddings`).
4) LLM response is cleaned: text reply + parsed `route_to` JSON.
5) Frontend renders the reply and, when `route_to` exists, deep-links to the matching services page.
6) On Groq failure, Anthropic fallback runs; if both fail, a guided fallback message is returned.

### Frontend ↔ Backend Integration
- **API client**: [frontend/src/api/client.js](frontend/src/api/client.js) proxies `/api` to the backend (`vite.config.js`), adding JWTs automatically.
- **Chat surfaces**: Floating widget [frontend/src/components/ChatBot.jsx](frontend/src/components/ChatBot.jsx) and hero chat [frontend/src/components/HomeChat.jsx](frontend/src/components/HomeChat.jsx).
- **Routing UX**: When `route_to` contains `{ service, message, urgency }`, the React components show a CTA button that navigates to the category (e.g., `/services?category=plumbing`).
- **Multilingual**: `language` param sent with each chat request; LLM answers in Nepali or English.

### Backend Components
- **Endpoints**: `/api/ai/chat`, `/api/ai/match-providers`, `/api/ai/estimate-price`, `/api/ai/extract-booking`, `/api/ai/analyze-image`, `/api/ai/summarize-reviews`, `/api/ai/trust-score` (all in [backend/app/routes/ai.py](backend/app/routes/ai.py)).
- **LLM Client**: [backend/app/utils/groq_chat.py](backend/app/utils/groq_chat.py) (Groq) with automatic model deprecation remap to `llama-3.3-70b-versatile`; [backend/app/utils/ai_service.py](backend/app/utils/ai_service.py) handles Anthropic fallback and shared utilities.
- **Matching**: [backend/app/utils/matching.py](backend/app/utils/matching.py) mixes vector similarity, scoring heuristics, and Women First bonus.
- **Data Plane**: PostgreSQL stores structured data plus embeddings; uploads served via `/uploads/*` proxied from Vite.

### Key Concepts (cheat sheet)
- **LLM (Large Language Model)**: Generates natural language responses and the `ROUTE_TO` hints.
- **RAG**: Pulls real provider/booking facts before the LLM replies to stay accurate and local.
- **Vector Database**: Stores embeddings so we can do semantic similarity instead of keyword search.
- **Semantic Search**: Finds “pipe leaking” ≈ “tap dripping” providers via cosine similarity on embeddings.
- **Response Parsing**: We split the LLM’s free-form text from its structured JSON so the UI can act on routes without showing the JSON.
---

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask 2.3.5
- **Database**: PostgreSQL 15 + SQLAlchemy ORM
- **Authentication**: Flask-JWT-Extended
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Validation**: Marshmallow
- **Migration**: Flask-Migrate
- **Server**: Gunicorn

### Frontend
- **Framework**: React 18.2 + Vite 5
- **Styling**: Tailwind CSS 3 + Custom theme
- **Routing**: React Router v6
- **HTTP**: Axios
- **Icons**: Lucide React
- **Font**: Noto Sans Devanagari (Nepali support)

### DevOps
- **Containerization**: Docker + Docker Compose
- **Volume Persistence**: PostgreSQL data + uploads
- **Network**: Bridge networking
- **Health Checks**: Built-in

---

## 📁 Project Structure

```
sewasathi/
├── docker-compose.yml          # Service orchestration
├── .env.example                # Environment template
├── README.md                   # This file
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── run.py                  # Entry point
│   ├── seed_db.py             # Sample data generator
│   └── app/
│       ├── __init__.py        # App factory
│       ├── config.py          # Configuration
│       ├── models/
│       │   ├── user.py        # User + Provider models
│       │   ├── service.py     # Service + Category models
│       │   ├── booking.py     # Booking model
│       │   └── review.py      # Review model
│       ├── routes/
│       │   ├── auth.py        # Auth endpoints
│       │   ├── providers.py   # Provider endpoints
│       │   ├── services.py    # Service endpoints
│       │   ├── bookings.py    # Booking endpoints
│       │   ├── reviews.py     # Review endpoints
│       │   └── ai.py          # AI endpoints (6 endpoints)
│       └── utils/
│           ├── ai_service.py  # Claude API wrapper
│           └── matching.py    # Provider matching logic
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
        ├── index.css           # Tailwind + custom styles
        ├── api/
        │   └── client.js       # Axios config + interceptors
        ├── context/
        │   ├── AuthContext.jsx
        │   └── BookingContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ChatBot.jsx     # Floating chatbot
        │   ├── ProviderCard.jsx
        │   ├── ServiceCard.jsx
        │   └── Loading.jsx
        └── pages/
            ├── Home.jsx        # Landing page
            ├── Login.jsx
            ├── Register.jsx
            ├── Services.jsx    # Provider list + filters
            ├── ProviderProfile.jsx
            ├── BookingFlow.jsx
            ├── AdminDashboard.jsx
            └── Dashboard/
                ├── CustomerDashboard.jsx
                └── ProviderDashboard.jsx
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git
- API Keys: Anthropic, Google Maps (optional for MVP)

### Setup

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/sewasathi.git
cd sewasathi
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your API keys
```

```env
ANTHROPIC_API_KEY=sk-ant-xxxxxx
JWT_SECRET_KEY=your-super-secret-key
GOOGLE_MAPS_API_KEY=your-api-key
DATABASE_URL=postgresql://postgres:sewasathi123@postgres:5432/sewasathi
POSTGRES_PASSWORD=sewasathi123
FLASK_ENV=development
VITE_API_URL=http://localhost:5002
```

3. **Start Services**
```bash
docker-compose up -d
```

Services start:
- **Backend**: http://localhost:5002
- **Frontend**: http://localhost:3000
- **Database**: localhost:5432

4. **Seed Sample Data**
```bash
docker-compose exec backend python seed_db.py
```

This creates:
- 10 service categories (6 women providers)
- 10 sample providers (6 female)
- 4 customers
- 15 bookings
- Sample reviews

---

## 🔑 API Endpoints

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
| GET | `/api/providers/:id` | None | Get provider profile + services + reviews |
| PUT | `/api/providers/:id` | JWT | Update provider profile |
| POST | `/api/providers/:id/verify` | Admin | Verify provider identity |
| GET | `/api/providers/my-profile` | JWT | Get current provider profile |

### Services
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/services/categories` | None | Get all service categories |
| GET | `/api/services` | None | List services (filterable) |
| POST | `/api/services` | JWT | Create service (provider) |
| PUT | `/api/services/:id` | JWT | Update service |
| DELETE | `/api/services/:id` | JWT | Delete service |

### Bookings
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/bookings` | JWT | Create booking |
| GET | `/api/bookings/my` | JWT | Get customer bookings |
| GET | `/api/bookings/assigned` | JWT | Get provider's assigned bookings |
| GET | `/api/bookings/:id` | JWT | Get booking details |
| PUT | `/api/bookings/:id/status` | JWT | Update booking status |

### Reviews
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/reviews` | JWT | Submit review |
| GET | `/api/reviews/provider/:id` | None | Get provider reviews |
| GET | `/api/reviews/:id` | None | Get review details |

### AI Endpoints (Rate Limited: 20 req/min)
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

## 🗄️ Database Models

### User
```python
id, name, email, password_hash, phone, role (customer/provider/admin),
gender, profile_photo, lat/lng, city, address, is_verified, is_female, created_at
```

### Provider (extends User)
```python
bio, skills[], years_experience, is_available, rating, total_jobs,
total_earnings, trust_score, trust_badge, id_verified, certifications[],
hourly_rate, service_radius_km, review_summary, completion_rate
```

### ServiceCategory
```python
id, name, name_np, icon, description, base_price
```

### Service
```python
id, provider_id, category_id, title, description, price, price_type (fixed/hourly),
is_active, image_url, created_at
```

### Booking
```python
id, customer_id, provider_id, service_id, status (pending/confirmed/in_progress/completed),
scheduled_at, address, lat/lng, description, ai_extracted_data (JSON),
final_price, payment_status, notes, created_at, completed_at
```

### Review
```python
id, booking_id, customer_id, provider_id, rating (1-5), comment,
ai_summary, sentiment (positive/neutral/negative), images[], created_at
```

---

## 💜 Women First Feature

### Design
- **Color**: Purple (#7C3AED) for all Women First UI elements
- **Badge**: "Women First 💜" on provider cards and profiles
- **Filter**: Prominent toggle on Services page
- **Bonus**: +10 AI match score for female providers
- **Homepage**: Dedicated section celebrating women entrepreneurs

### Implementation
- `is_female` boolean on User model
- +10 bonus in `/api/ai/match-providers` endpoint
- Filter parameter `women_first=true` on `/api/providers`
- Sorting by `is_female DESC` in provider listings

---

## 🔐 Security

- ✅ JWT tokens with 24-hour expiration
- ✅ Password hashing with Werkzeug
- ✅ CORS enabled for frontend origin
- ✅ Input validation on all routes (Marshmallow)
- ✅ File upload validation (jpg/png/pdf, max 5MB)
- ✅ Rate limiting on AI endpoints (20 req/min)
- ✅ Admin-only endpoints for sensitive operations

---

## 📝 API Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## 🎯 Demo Credentials

After seeding:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sewasathi.com | admin123 |
| Provider | provider1@sewasathi.com | provider123 |
| Customer | customer1@sewasathi.com | customer123 |

---

## 📊 Service Categories (Seed Data)

1. Plumbing (प्लम्बिङ) - 🔧
2. House Cleaning (घर सफाई) - 🧹
3. Electrical (इलेक्ट्रिकल) - ⚡
4. Beauty & Wellness (सौन्दर्य) - 💅
5. Carpentry (काठको काम) - 🪛
6. Painting (रंगरोगन) - 🎨
7. AC & Appliances (एसी मर्मत) - ❄️
8. Tutoring (ट्युसन) - 📚
9. Pest Control (किरा नियन्त्रण) - 🐛
10. Cooking (खाना पकाउने) - 👨‍🍳

---

## 🎨 Frontend Pages

- **Home** (`/`) - Hero, categories, featured providers, CTA
- **Services** (`/services`) - Provider listing with filters
- **Provider Profile** (`/provider/:id`) - Profile, services, reviews
- **Booking Flow** (`/booking`) - Multi-step booking wizard
- **Login** (`/login`) - Authentication
- **Register** (`/register`) - User signup
- **Customer Dashboard** (`/dashboard/customer`) - Active/past bookings
- **Provider Dashboard** (`/dashboard/provider`) - Bookings, earnings, reviews
- **Admin Dashboard** (`/dashboard/admin`) - Platform analytics

---

## 🚀 Deployment

### Manual
```bash
# Production setup
export FLASK_ENV=production
flask run --host=0.0.0.0 --port=5002
```

### Docker (Recommended)
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

## 📚 Nepali Language Support

- UI fully translated to Nepali (नेपाली)
- Font: Noto Sans Devanagari
- Chatbot supports Nepali/English
- City names in Nepali transliteration

---

## 🙋‍♀️ Women Entrepreneurship Stats (Post-Seeding)

- 6+ female service providers
- 100+ women earning opportunities
- Dedicated "Women First" system
- Safe, verified marketplace
- Equal pay for equal work

---

## 🐛 Known Limitations (MVP)

- Payment integration: Mock (mention eSewa/Khalti for future)
- Maps: Google Maps optional (for MVP)
- Image uploads: Local storage (swappable to S3)
- Notifications: UI ready, backend integration pending

---

## 🔄 Development Workflow

1. **Backend Changes**
   - Edit `backend/app/routes/*.py` or models
   - Backend auto-reloads (Docker volume mounted)

2. **Frontend Changes**
   - Edit `frontend/src/**`
   - Vite hot reload on save

3. **Database Changes**
   - Seed new data via `seed_db.py`
   - Or use Flask-Migrate for migrations

---

## 📈 Future Enhancements

- [ ] Real payment gateway (eSewa/Khalti)
- [ ] SMS/Email notifications
- [ ] Google Maps integration
- [ ] Video call consultation
- [ ] Provider timeline & portfolio
- [ ] Advanced analytics dashboard
- [ ] Multiple language support
- [ ] Push notifications
- [ ] Escrow payment system
- [ ] Provider verification system

---

## 🤝 Contributing

Contributions welcome! For hackathons:

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push and create PR

---

## 📄 License

MIT License - See LICENSE file

---

## 📞 Support

**For hackathon, demo issues or questions:**
- Check API endpoints in `backend/app/routes/`
- Review seed data in `seed_db.py`
- Test endpoints with provided credentials
- Check browser console for frontend errors

---

## 🎉 Thank You

Built with ❤️ for Nepal's digital future.

**सेवासाथी - मान्छे सेवामा सेवासाथी**

Empowering Nepal's service economy, one booking at a time. 💜
