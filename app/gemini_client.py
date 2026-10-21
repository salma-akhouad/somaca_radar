import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai #The genai module is a Python client library for interacting with Google's Gemini API, which provides access to advanced AI models for natural language processing and understanding.

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.5-flash-lite",
) 
HELPER_CONTEXT_MESSAGE_LIMIT = int(
    os.getenv("HELPER_CONTEXT_MESSAGE_LIMIT", "20")
)

gemini_client = (
    genai.Client(api_key=GEMINI_API_KEY)
    if GEMINI_API_KEY
    else None
    )

#  The genai.Client class is used to create a client object that can be used to interact with the Gemini API.
#  The api_key parameter is used to authenticate the client with the Gemini API using the provided API key.


