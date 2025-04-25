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

        # Handle state university variations before removing 'university'
        normalized = normalized.replace("state university", "st").replace("state", "st")

        # Remove common prefixes, suffixes, and words
        normalized = normalized.replace("university", "").replace("college", "")
        normalized = normalized.replace("@", "").replace("the", "").replace("of", "")

        # Handle specific state abbreviations
        state_abbrev = {
            "iowa st": "iowa st",
            "ohio st": "ohio st",
            "michigan st": "michigan st",
            "florida st": "florida st",
            "mississippi st": "mississippi st",
            "kansas st": "kansas st",
            "arizona st": "arizona st",
            "arkansas st": "arkansas st",
            "colorado st": "colorado st",
        }

        for full, abbrev in state_abbrev.items():
            if full in normalized:
                normalized = normalized.replace(full, abbrev)

        # Special cases for common variations
        common_mappings = {
            "unc": "north carolina",
            "nc state": "north carolina st",
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
        return normalized.strip()

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

            # Normalize the search name and school name
            search_name = self._normalize_name(coach_name)
            normalized_school = (
                self._normalize_name(school_name) if school_name else None
            )

            # Search for the coach in the data
            for coach in coach_data:
                if self._normalize_name(coach["person"]) == search_name:
                    history = coach["tenure"]
                    logger.info(f"Found tenure history for {coach_name}: {history}")

                    # If school name provided, verify coach has tenure there
                    if normalized_school and history:
                        # Normalize each school in the tenure history
                        tenure_schools = [
                            (
                                self._normalize_name(school.split("@")[1])
                                if "@" in school
                                else self._normalize_name(school)
                            )
                            for school in history.split("\n")
                        ]

                        if not any(
                            normalized_school in school for school in tenure_schools
                        ):
                            logger.info(f"Coach found but no tenure at {school_name}")
                            continue

                    return history, None

            # If coach not found in database, return "No tenure found"
            logger.info(f"No tenure found in database for {coach_name}")
            return "No tenure found", None

        except Exception as e:
            logger.error(f"Error in search_coach_history: {str(e)}")
            return "No tenure found", str(e)
