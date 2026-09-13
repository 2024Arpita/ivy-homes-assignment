import os
import json
import requests
from dotenv import load_dotenv

# Load values from .env
load_dotenv()

BASE_URL = os.getenv("API_BASE_URL")
API_KEY = os.getenv("API_KEY")
PASSWORD = os.getenv("API_PASSWORD")

EMAIL = "demo1@ivy.homes"


# ============================================================
# 1. LOGIN
# ============================================================

login_url = f"{BASE_URL}/auth/login"

login_headers = {
    "X-API-Key": API_KEY
}

login_data = {
    "email": EMAIL,
    "password": PASSWORD
}

login_response = requests.post(
    login_url,
    headers=login_headers,
    json=login_data
)

print("Login status:", login_response.status_code)

if login_response.status_code != 200:
    print("Login failed:", login_response.text)
    exit()

login_result = login_response.json()

print("Login successful!")
print("Token type:", login_result.get("token_type"))
print("Expires in:", login_result.get("expires_in"))


# ============================================================
# 2. GET ACCESS TOKEN
# ============================================================

token = login_result.get("access_token")

if not token:
    print("Could not find access_token.")
    print("Available keys:", list(login_result.keys()))
    exit()

print("Access token received successfully.")


# ============================================================
# 3. COMMON HEADERS
# ============================================================

headers = {
    "X-API-Key": API_KEY,
    "Authorization": f"Bearer {token}"
}


# ============================================================
# 4. GET ALL LISTINGS
# ============================================================

listings_url = f"{BASE_URL}/v1/listings"

all_listings = []

limit = 200
offset = 0

while True:

    params = {
        "limit": limit,
        "offset": offset
    }

    print(f"Fetching listings: offset={offset}, limit={limit}")

    response = requests.get(
        listings_url,
        headers=headers,
        params=params
    )

    if response.status_code != 200:
        print("Listings request failed!")
        print("Status:", response.status_code)
        print("Response:", response.text)
        exit()

    data = response.json()

    results = data.get("results", [])

    all_listings.extend(results)

    print(
        f"Received {len(results)} listings | "
        f"Total collected: {len(all_listings)} | "
        f"API total: {data.get('total')}"
    )

    # Stop when API says there is no more data
    if not data.get("has_more"):
        break

    # Move to the next batch
    offset += limit


# ============================================================
# 5. SAVE DATA
# ============================================================

os.makedirs("data", exist_ok=True)

output_file = "data/listings.json"

with open(output_file, "w", encoding="utf-8") as file:
    json.dump(all_listings, file, indent=2, ensure_ascii=False)

print("\n========================================")
print("DONE!")
print("Total listings collected:", len(all_listings))
print("Saved to:", output_file)
print("========================================")
