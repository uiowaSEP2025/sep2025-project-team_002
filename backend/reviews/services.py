import os
import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class CoachSearchService:
    def __init__(self):
        self.search_url = "https://athleticinsidersearch.search.windows.net"
        self.api_key = getattr(settings, 'AZURE_SEARCH_KEY', None)
        if self.api_key:
            self.headers = {
                "api-key": self.api_key,
                "Content-Type": "application/json"
            }
        else:
            logger.warning("AZURE_SEARCH_KEY not found in settings")

    def search_coach_history(self, coach_name, current_school):
        """
        Search for coach history using Azure Search
        """
        try:
            # If no API key, return None values
            if not self.api_key:
                logger.warning("Skipping coach history search - no API key available")
                return None, False

            # Prepare the search query
            search_params = {
                "search": coach_name,
                "queryType": "full",
                "searchMode": "all",
                "select": "coach_name,years,schools",
                "count": "true"
            }

            # Make the request to Azure Search
            response = requests.get(
                f"{self.search_url}/indexes/coaches/docs",
                headers=self.headers,
                params=search_params
            )

            if response.status_code != 200:
                logger.error(f"Azure Search request failed: {response.status_code}")
                return None, False

            data = response.json()
            
            # Process the response
            if not data.get('value'):
                logger.warning(f"No coach history found for {coach_name}")
                return None, False

            # Get the most recent entry
            latest_entry = data['value'][0]
            
            # Format the history
            history = f"{coach_name} has served as a head coach for {len(data['value'])} seasons at various institutions. His tenure includes:\n\n"
            for entry in data['value']:
                years = entry.get('years', '')
                schools = entry.get('schools', '')
                history += f"{years} at {schools}\n"

            # Check if the coach is still at the current school
            # Look at the most recent entry's school
            latest_school = data['value'][0].get('schools', '')
            is_current = current_school.lower() in latest_school.lower()

            return history, not is_current

        except Exception as e:
            logger.error(f"Error in coach search: {str(e)}")
            return None, False