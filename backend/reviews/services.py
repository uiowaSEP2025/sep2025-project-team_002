import os
import json
import logging
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

# Set up logging to always show info level messages
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load API key from .env
load_dotenv()


class CoachSearchService:
    def __init__(self):
        self.mbb_coach_data = self._load_coach_data("coach_tenures.json")
        self.wbb_coach_data = self._load_coach_data("coach_tenures_wbb.json")

    def _convert_sport_to_code(self, sport):
        """Convert sport display name to code"""
        sport_mapping = {
            "Men's Basketball": "mbb",
            "Women's Basketball": "wbb",
            # Also handle the codes themselves
            "mbb": "mbb",
            "wbb": "wbb",
        }
        return sport_mapping.get(sport, sport)

    def _load_coach_data(self, filename):
        try:
            # Get the absolute path to the fixtures directory
            fixtures_path = Path(__file__).parent / "fixtures" / filename
            with open(fixtures_path, "r") as file:
                return json.load(file)
        except Exception as e:
            logger.error(f"Error loading coach data from {filename}: {str(e)}")
            return []

    def _normalize_name(self, name):
        """Normalize coach names and school names for better matching"""
        if not name:
            return ""
        # Remove extra spaces and standardize periods
        normalized = (
            name.replace("  ", " ").replace(". ", ".").replace(" .", ".").lower()
        )

        # Handle "University of X" format first
        if "university of" in normalized:
            normalized = normalized.replace("university of", "").strip()

        # Remove common prefixes, suffixes, and words
        normalized = normalized.replace("university", "").replace("college", "")
        normalized = normalized.replace("@", "").replace("the", "").replace("of", "")

        # Special cases for common variations
        common_mappings = {
            "unc": "north carolina",
            "nc state": "north carolina state",
            "usc": "southern california",
            "pitt": "pittsburgh",
            "ucla": "california los angeles",
            "ucf": "central florida",
            "ole miss": "mississippi",
            "unc greensboro": "greensboro",
            "penn": "pennsylvania",
        }

        for short_name, full_name in common_mappings.items():
            if short_name in normalized:
                normalized = normalized.replace(short_name, full_name)

        # Final cleanup
        normalized = " ".join(normalized.split())  # Normalize spaces
        normalized = normalized.strip()

        # For school names with locations (e.g. "Indiana University Bloomington"),
        # also return just the main school name without the location
        parts = normalized.split()
        if len(parts) > 1:
            # Try to identify the main school name (usually the first word)
            main_name = parts[0]
            # For cases like "north carolina", keep both words
            if main_name in ["north", "south", "east", "west"]:
                main_name = f"{parts[0]} {parts[1]}"
            return [normalized, main_name]

        return [normalized]

    def search_coach_history(self, coach_name, school_name=None, sport=None):
        try:
            if not coach_name:
                return "", None

            logger.info(
                f"Starting tenure search for coach: {coach_name} (sport: {sport})"
            )

            # Convert sport to code and select the appropriate coach data
            sport_code = self._convert_sport_to_code(sport)
            logger.info(f"Converted sport '{sport}' to code '{sport_code}'")

            if sport_code == "wbb":
                coach_data = self.wbb_coach_data
                logger.info("Using women's basketball coach data")
            else:  # Default to men's basketball
                coach_data = self.mbb_coach_data
                logger.info("Using men's basketball coach data")

            # Normalize the search name
            search_name = self._normalize_name(coach_name)[
                0
            ]  # Take first normalized form

            # Search for the coach in the data
            for coach in coach_data:
                if self._normalize_name(coach["person"])[0] == search_name:
                    history = coach["tenure"]
                    logger.info(f"Found tenure history for {coach_name}: {history}")
                    return history, None

            # If coach not found in database, return "No tenure found"
            logger.info(f"No tenure found in database for {coach_name}")
            return "No tenure found", None

        except Exception as e:
            logger.error(f"Error in search_coach_history: {str(e)}")
            return "No tenure found", str(e)
