import os
import json
import logging
from groq import Groq

logger = logging.getLogger(__name__)

SERVICE_CATEGORIES = {
    'plumbing': ['pipe', 'leak', 'tap', 'drain', 'toilet', 'water', 'plumb', 'faucet', 'sink', 'bathroom'],
    'electrical': ['electric', 'wire', 'switch', 'light', 'power', 'socket', 'fan', 'circuit', 'bulb', 'wiring'],
    'cleaning': ['clean', 'wash', 'dust', 'sweep', 'mop', 'dirty', 'hygiene', 'sanitize', 'vacuum', 'house clean'],
    'beauty': ['hair', 'makeup', 'facial', 'massage', 'manicure', 'pedicure', 'salon', 'beauty', 'skin', 'wax'],
    'carpentry': ['wood', 'door', 'furniture', 'cabinet', 'shelf', 'carpenter', 'table', 'chair', 'broken door'],
    'painting': ['paint', 'wall', 'color', 'brush', 'coat', 'repaint', 'whitewash', 'ceiling'],
    'ac_repair': ['ac', 'air condition', 'cooling', 'refrigerator', 'fridge', 'appliance', 'hvac', 'cold', 'hot'],
    'tutoring': ['tutor', 'teach', 'study', 'homework', 'math', 'science', 'class', 'learn', 'teacher'],
    'pest_control': ['pest', 'cockroach', 'rat', 'insect', 'bug', 'termite', 'mosquito', 'ant', 'mice'],
    'cooking': ['cook', 'food', 'meal', 'kitchen', 'chef', 'recipe', 'catering', 'dinner', 'lunch']
}


class GroqChatService:
    def __init__(self):
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            raise ValueError("GROQ_API_KEY not set")
        self.client = Groq(api_key=api_key)
        # FIXED: updated to current working model
        self.model = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
        logger.info(f'Groq initialized with model: {self.model}')

    def detect_service_intent(self, text):
        """Detect which service category user needs from text."""
        text_lower = text.lower()
        scores = {}
        for category, keywords in SERVICE_CATEGORIES.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            if score > 0:
                scores[category] = score
        if scores:
            best = max(scores, key=scores.get)
            return best, scores[best]
        return None, 0

    def chat(self, messages, language='english'):
        try:
            system = f"""You are SewaSathi's smart booking assistant for Nepal.
You help users find home service providers (plumbers, electricians, cleaners, 
beauty, carpentry, painting, AC repair, tutoring, pest control, cooking).

When user describes a problem:
1. Understand what service they need
2. Give a brief helpful response (max 2-3 sentences)
3. If you can identify the service needed, add this at the end:

ROUTE_TO: {{"service": "plumbing|electrical|cleaning|beauty|carpentry|painting|ac_repair|tutoring|pest_control|cooking", "message": "brief reason", "urgency": "low|medium|high"}}

Respond in {'Nepali' if language == 'nepali' else 'English'}.
Be warm, concise and helpful."""

            logger.info(f'Groq: Sending {len(messages)} messages to {self.model}')

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{'role': 'system', 'content': system}] + messages,
                max_tokens=300,
                temperature=0.7
            )
            return response.choices[0].message.content

        except Exception as e:
            logger.error(f'Groq error: {type(e).__name__}: {str(e)}')
            raise

    def extract_route(self, response_text):
        """Extract routing intent from AI response."""
        if 'ROUTE_TO:' in response_text:
            try:
                json_str = response_text.split('ROUTE_TO:')[1].strip()
                start = json_str.find('{')
                end = json_str.find('}') + 1
                if start >= 0 and end > 0:
                    route_data = json.loads(json_str[start:end])
                    clean_text = response_text.split('ROUTE_TO:')[0].strip()
                    return clean_text, route_data
            except Exception as e:
                logger.warning(f'Route extraction failed: {e}')
        return response_text, None

    def get_service_suggestion(self, problem_description):
        """Suggest a service type based on problem description."""
        try:
            prompt = f"""Based on this problem, suggest the best service type:
Problem: {problem_description}

Respond with ONLY valid JSON:
{{"service_type": "plumbing|electrical|cleaning|beauty|carpentry|painting|ac_repair|tutoring|pest_control|cooking|general", "confidence": 0.0-1.0, "reasoning": "brief"}}"""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{'role': 'user', 'content': prompt}],
                max_tokens=150
            )

            text = response.choices[0].message.content.strip()
            try:
                return json.loads(text)
            except json.JSONDecodeError:
                return {"service_type": "general", "confidence": 0.5, "reasoning": "Unable to determine"}

        except Exception as e:
            logger.error(f'Service suggestion error: {e}')
            return {"service_type": "general", "confidence": 0.0, "reasoning": "Error"}