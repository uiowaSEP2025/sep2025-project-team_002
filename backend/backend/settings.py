import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Azure Search Settings
AZURE_SEARCH_KEY = os.environ.get('AZURE_SEARCH_KEY')

# OpenAI Settings
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# ... rest of settings ... 