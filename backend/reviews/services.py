import os
from openai import OpenAI
import logging

# Set up logging to always show info level messages
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CoachSearchService:
    def __init__(self):
        self.client = OpenAI()

    def search_coach_history(self, coach_name, school_name=None):
        try:
            if not coach_name:
                return "", None

            logger.info(f"Starting tenure search for coach: {coach_name}")
            
            # Build a specific prompt for school tenure only
            system_prompt = "I will give you a coach name and return to me the values from tenure section. Return ONLY the head coaching tenures in exactly this format: 'YYYY-YYYY: School Name' for past positions or 'YYYY-present: School Name' for current position. Do not include assistant coaching positions. List the tenures chronologically. Do not include any other text or formatting."
            
            # Specific query for the school
            query = f"{coach_name}"
            
            logger.info(f"Sending request to OpenAI with prompt: {system_prompt}")
            logger.info(f"Query: {query}")
            
            completion = self.client.chat.completions.create(
                model="gpt-4-1106-preview",  # Using GPT-4.1
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": query,
                    },
                ],
                temperature=0,  # More precise responses
                max_tokens=100,  # Shorter response needed for single tenure
            )
            
            history = completion.choices[0].message.content
            logger.info(f"Raw OpenAI response for {coach_name}: '{history}'")
            
            if history and any(char.isdigit() for char in history):
                logger.info(f"Found valid tenure history for {coach_name}: {history}")
                return history.strip(), None
                
            logger.info(f"No valid tenure history found for {coach_name}")
            return "", None
            
        except Exception as e:
            logger.error(f"Error in search_coach_history: {str(e)}")
            return "", str(e)