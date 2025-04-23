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
            if not school_name:
                return "", None

            # Build a specific prompt for school tenure only
            system_prompt = "For a given coach name and school: First check the CSV data for their tenure at this school. ONLY use internet sources if either: 1) This is their most recent coaching position (then use 'Present' if still there), or 2) The school isn't found in their CSV tenure data. For all other cases, use EXACTLY the tenure dates from the CSV. Format as 'YYYY-YY - Present @School' for current position or 'YYYY-YY - YYYY-YY @School' for past positions. Return ONLY the formatted string, no other text. If not found in either source, return empty string."
            
            # Specific query for the school
            query = f"Check CSV data for {coach_name}'s tenure at {school_name}. Only check internet if this is their current school or if {school_name} isn't in their CSV tenure history."
            
            logger.info(f"Starting tenure search for {coach_name} at {school_name}")
            
            completion = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
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
            if history and any(char.isdigit() for char in history):
                logger.info(f"Found tenure history for {coach_name} at {school_name}: {history}")
                return history.strip(), None
                
            logger.info(f"No tenure history found for {coach_name} at {school_name}")
            return "", None
            
        except Exception as e:
            logger.error(f"Error in search: {str(e)}")
            return "", str(e)