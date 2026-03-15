import os
from anthropic import Anthropic
from groq import Groq
import base64
import json
import logging

logger = logging.getLogger(__name__)


class AIService:
    """Wrapper for AI APIs - Primary: Groq Llama 3.2 70B, Fallback: Anthropic Claude"""
    
    def __init__(self):
        # Primary: Groq for text-based AI
        groq_key = os.getenv("GROQ_API_KEY")
        self.groq_client = Groq(api_key=groq_key) if groq_key else None
        self.groq_model = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")
        
        # Fallback: Anthropic for image analysis
        self.client = Anthropic()
        self.model = os.getenv("AI_MODEL", "claude-sonnet-4-20250514")
    
    def chat(self, messages, system_prompt=None, max_tokens=1024):
        """Send messages using Groq (primary) or Claude (fallback)"""
        # Try Groq first (faster, cheaper)
        if self.groq_client:
            try:
                response = self.groq_client.chat.completions.create(
                    model=self.groq_model,
                    max_tokens=max_tokens,
                    system=system_prompt,
                    messages=messages
                )
                return response.choices[0].message.content
            except Exception as groq_err:
                logger.warning(f"Groq error, falling back to Claude: {str(groq_err)[:100]}")
        
        # Fallback to Claude
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                system=system_prompt,
                messages=messages
            )
            return response.content[0].text
        except Exception as e:
            raise Exception(f"AI Service Error (Groq and Claude failed): {str(e)}")
    
    def extract_booking_details(self, description):
        """Extract structured booking data from natural language"""
        prompt = f"""Extract booking details from this description. Return valid JSON only.
        
Description: {description}

Return a JSON object with these fields (infer from context, use null if not found):
- service_type (string)
- location (string)
- preferred_time (string or null)
- urgency (low/medium/high)
- estimated_budget (number or null)
- problem_description (string)

JSON only, no markdown:"""
        
        response = self.chat([{"role": "user", "content": prompt}], max_tokens=500)
        
        try:
            # Extract JSON from response
            json_str = response.strip()
            if "```" in json_str:
                json_str = json_str.split("```")[1]
                if json_str.startswith("json"):
                    json_str = json_str[4:]
            
            return json.loads(json_str)
        except json.JSONDecodeError:
            return {
                "service_type": None,
                "location": None,
                "preferred_time": None,
                "urgency": "medium",
                "estimated_budget": None,
                "problem_description": description
            }
    
    def estimate_price(self, service_category, description, location="Kathmandu"):
        """
        AI price estimation with RAG and similarity search
        
        Process:
        1. Similarity search on historical bookings (RAG)
        2. Service complexity analysis
        3. Location factor consideration
        4. AI-powered base price estimation
        5. Return comprehensive pricing breakdown
        """
        from app.models import Booking, Service, Provider
        
        # RAG: Find similar past bookings for this service category
        similar_bookings = []
        try:
            bookings_query = Booking.query.join(
                Service, Booking.service_id == Service.id
            ).filter(
                Service.title.ilike(f'%{service_category}%')
            ).all()
            
            similar_bookings = [
                {
                    'price': b.final_price,
                    'description': b.description,
                    'status': b.status
                } for b in bookings_query[-10:] if b.final_price > 0
            ]
        except:
            similar_bookings = []
        
        # Calculate RAG-based baseline
        rag_baseline = None
        if similar_bookings:
            completed_bookings = [b for b in similar_bookings if b['status'] == 'completed']
            if completed_bookings:
                rag_baseline = sum(b['price'] for b in completed_bookings) / len(completed_bookings)
        
        # Service-specific web search baseline (hardcoded for common services in Nepal)
        service_baselines = {
            'plumbing': {'low': 300, 'medium': 800, 'high': 2000},
            'electrical': {'low': 400, 'medium': 1000, 'high': 2500},
            'cleaning': {'low': 200, 'medium': 600, 'high': 1500},
            'house cleaning': {'low': 200, 'medium': 600, 'high': 1500},
            'beauty': {'low': 500, 'medium': 1500, 'high': 3000},
            'carpentry': {'low': 400, 'medium': 1200, 'high': 3000},
            'painting': {'low': 300, 'medium': 1000, 'high': 2500},
            'ac': {'low': 400, 'medium': 1500, 'high': 3500},
            'electrical repair': {'low': 400, 'medium': 1000, 'high': 2500},
            'appliance repair': {'low': 500, 'medium': 1200, 'high': 3000},
            'tutoring': {'low': 300, 'medium': 800, 'high': 1500},
            'pest control': {'low': 1000, 'medium': 2000, 'high': 5000},
            'cooking': {'low': 600, 'medium': 1500, 'high': 3000},
        }
        
        # Get baseline for service
        category_lower = service_category.lower()
        baseline_prices = None
        for key, prices in service_baselines.items():
            if key in category_lower:
                baseline_prices = prices
                break
        
        if not baseline_prices:
            baseline_prices = {'low': 500, 'medium': 1500, 'high': 3500}  # Default
        
        # AI-powered complexity analysis
        prompt = f"""Analyze this home service request and determine complexity level.

Service: {service_category}
Description: {description}
Location: {location} (Kathmandu valley)

Based on the description, classify as LOW, MEDIUM, or HIGH complexity.
Also estimate a price multiplier (0.7 to 1.5) based on difficulty.

Return ONLY valid JSON:
{{
  "complexity": "low|medium|high",
  "multiplier": number,
  "factors": ["factor1", "factor2"],
  "recommendation": "brief explanation"
}}"""
        
        try:
            response = self.chat([{"role": "user", "content": prompt}], max_tokens=300)
            json_str = response.strip()
            if "```" in json_str:
                json_str = json_str.split("```")[1]
                if json_str.startswith("json"):
                    json_str = json_str[4:]
            
            complexity_data = json.loads(json_str)
        except:
            complexity_data = {
                'complexity': 'medium',
                'multiplier': 1.0,
                'factors': [],
                'recommendation': 'Standard service'
            }
        
        complexity = complexity_data.get('complexity', 'medium')
        multiplier = float(complexity_data.get('multiplier', 1.0))
        
        # Delhi/Kathmandu valley location premium (15-20%)
        location_multiplier = 1.15 if 'kathmandu' in location.lower() or 'valley' in location.lower() else 1.0
        
        # Calculate price range
        base_min = baseline_prices['low']
        base_mid = baseline_prices['medium']
        base_max = baseline_prices['high']
        
        # Apply RAG adjustment if available
        if rag_baseline:
            # Weight: 60% web search baseline, 40% RAG (similar past bookings)
            base_mid = (base_mid * 0.6) + (rag_baseline * 0.4)
        
        # Apply multipliers
        final_min = int(base_min * multiplier * location_multiplier)
        final_mid = int(base_mid * multiplier * location_multiplier)
        final_max = int(base_max * multiplier * location_multiplier)
        
        return {
            "min_price": final_min,
            "max_price": final_max,
            "currency": "NPR",
            "base_price": final_mid,
            "reasoning": complexity_data.get('recommendation', 'AI-estimated based on service complexity'),
            "complexity": complexity,
            "location_factor": f"{(location_multiplier * 100):.0f}%",
            "multiplier": f"{(multiplier * 100):.0f}%",
            "factors": complexity_data.get('factors', [])
        }
    
    def analyze_image(self, image_base64):
        """Analyze an image to detect problems and suggest services"""
        prompt = "Analyze this image and identify: 1) What problem is shown, 2) What service category it needs, 3) Urgency level, 4) Complexity, 5) What to tell the provider. Return JSON only."
        
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=500,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": image_base64
                                }
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ]
            )
            
            response_text = response.content[0].text
            json_str = response_text.strip()
            if "```" in json_str:
                json_str = json_str.split("```")[1]
                if json_str.startswith("json"):
                    json_str = json_str[4:]
            
            return json.loads(json_str)
        except json.JSONDecodeError:
            return {
                "problem_description": "Unable to analyze image",
                "suggested_service": None,
                "urgency_level": "medium",
                "complexity": "medium",
                "provider_notes": "Please describe the issue"
            }
        except Exception as e:
            raise Exception(f"Image analysis failed: {str(e)}")
    
    def summarize_reviews(self, reviews):
        """Summarize multiple reviews into 2-3 sentences"""
        reviews_text = "\n".join([f"Rating {r['rating']}/5: {r['comment']}" for r in reviews])
        
        prompt = f"""Summarize these reviews in 2-3 sentences. Highlight main themes.

Reviews:
{reviews_text}

Provide a concise, professional summary only."""
        
        response = self.chat([{"role": "user", "content": prompt}], max_tokens=200)
        return response.strip()
    
    def calculate_trust_score(self, provider_data):
        """Calculate AI trust score for a provider"""
        prompt = f"""Based on this provider data, calculate a trust score 0-100 and assign a badge.

Data:
- Years of experience: {provider_data.get('years_experience', 0)}
- ID verified: {provider_data.get('id_verified', False)}
- Total jobs completed: {provider_data.get('total_jobs', 0)}
- Average rating: {provider_data.get('avg_rating', 0)}/5
- Completion rate: {provider_data.get('completion_rate', 0)}%
- Review sentiment: {provider_data.get('review_sentiment', 'neutral')}

Return ONLY valid JSON:
{{
  "trust_score": number (0-100),
  "badge": "New|Rising|Trusted|Expert"
}}"""
        
        try:
            response = self.chat([{"role": "user", "content": prompt}], max_tokens=200)
            json_str = response.strip()
            if "```" in json_str:
                json_str = json_str.split("```")[1]
                if json_str.startswith("json"):
                    json_str = json_str[4:]
            return json.loads(json_str)
        except json.JSONDecodeError:
            return {"trust_score": 50, "badge": "New"}
    
    def booking_assistant_chat(self, message_history, language="english"):
        """AI booking assistant for multi-turn conversation"""
        system_prompt = f"""You are SewaSathi's booking assistant for Nepal. Help users book home services.
        
Language: {language}
- Extract service type, location, time, description, urgency from conversation
- Be warm, helpful, and respond in the user's language (Nepali or English)
- When user seems ready to book, return JSON with extracted data
- Available services: Plumbing, House Cleaning, Electrical, Beauty, Carpentry, Painting, AC, Tutoring, Pest Control, Cooking"""
        
        response = self.chat(message_history, system_prompt=system_prompt, max_tokens=500)
        return response
