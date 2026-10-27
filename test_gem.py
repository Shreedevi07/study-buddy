
from google import genai
from dotenv import load_dotenv
import os
import time

load_dotenv("study_buddy/.env")

client = genai.Client(
    api_key=os.getenv("GOOGLE_API_KEY"),
    http_options={"timeout": 120000}
)

print("Testing Gemini API...")
start = time.time()

try:
    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents="Reply with only the word READY."
    )
    print("Response:", response.text)
except Exception as e:
    print("Error:", type(e).__name__, str(e))
finally:
    print("Elapsed time:", round(time.time() - start, 2), "seconds")
