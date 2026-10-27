
from google import genai
from dotenv import load_dotenv
import os

load_dotenv("study_buddy/.env")

client = genai.Client(
    api_key=os.getenv("GOOGLE_API_KEY")
)

try:
    print("Checking available models...")
    for model in client.models.list():
        if "flash" in model.name.lower():
            print(model.name)
except Exception as e:
    print(type(e).__name__, str(e))
