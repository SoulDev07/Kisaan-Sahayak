import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Bland.ai Configuration
BLAND_API_KEY = os.getenv("BLAND_API_KEY", "")
BLAND_PATHWAY_ID = os.getenv("BLAND_PATHWAY_ID", "")
BLAND_PHONE_NUMBER = os.getenv("BLAND_PHONE_NUMBER", "+917020744317")
BLAND_API_URL = os.getenv("BLAND_API_URL", "https://api.bland.ai/v1/calls")

# Fallback values if environment variables are not set
if not BLAND_API_KEY:
    print("Warning: BLAND_API_KEY not found in environment variables")
if not BLAND_PATHWAY_ID:
    print("Warning: BLAND_PATHWAY_ID not found in environment variables")
if not BLAND_PHONE_NUMBER:
    print("Warning: BLAND_PHONE_NUMBER not found in environment variables")
