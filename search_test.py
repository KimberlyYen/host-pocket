import os

import requests

url = "https://www.searchapi.io/api/v1/search"
params = {
    "engine": "google_rank_tracking",
    "q": "Kimberly Yen",
    "target_url": "website-kimberly-yen.vercel.app",
    "location": "Taiwan",
    "device": "desktop",
    "api_key": os.environ["SEARCHAPI_KEY"],
}

response = requests.get(url, params=params)
print(response.text)
