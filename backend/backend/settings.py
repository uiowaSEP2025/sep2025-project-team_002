import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Azure Search Settings
AZURE_SEARCH_KEY = os.environ.get('AZURE_SEARCH_KEY')

# OpenAI Settings
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

# Azure Text Analytics Settings
AZURE_TEXT_ANALYTICS_KEY = os.getenv('AZURE_TEXT_ANALYTICS_KEY', '')
AZURE_TEXT_ANALYTICS_ENDPOINT = os.getenv('AZURE_TEXT_ANALYTICS_ENDPOINT', '')

# Validate Azure credentials
if not AZURE_TEXT_ANALYTICS_KEY or not AZURE_TEXT_ANALYTICS_ENDPOINT:
    import logging
    logging.warning(
        "Azure Text Analytics credentials not properly configured. "
        "Make sure AZURE_TEXT_ANALYTICS_KEY and AZURE_TEXT_ANALYTICS_ENDPOINT "
        "are set in your environment variables."
    )

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# ... rest of settings ... 

# Remove the incorrect INSTALLED_APPS modification
# The azure package doesn't need to be in INSTALLED_APPS 