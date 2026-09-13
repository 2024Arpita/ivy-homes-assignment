import os
import json
import requests
from dotenv import load_dotenv

# 1. Load environment variables
load_dotenv()

BASE_URL = os.getenv("API_BASE_URL")
API_KEY = os.getenv("API_KEY")
PASSWORD = os.getenv("API_PASSWORD")
EMAIL = os.getenv("API_EMAIL", "demo1@ivy.homes")

# 2. Login to get access token
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

if login_response.status_code != 200:
    print(f"Login failed with HTTP status: {login_response.status_code}")
    exit(1)

login_result = login_response.json()
token = login_result.get("access_token")

if not token:
    print("Access token not found in login response.")
    exit(1)

# 3. Fetch ALL project records
projects_url = f"{BASE_URL}/v1/projects"
headers = {
    "X-API-Key": API_KEY,
    "Authorization": f"Bearer {token}"
}

all_projects = []
limit = 50
offset = 0
api_reported_total = None

while True:
    params = {
        "limit": limit,
        "offset": offset
    }

    response = requests.get(
        projects_url,
        headers=headers,
        params=params
    )

    if response.status_code != 200:
        print(f"Request failed with HTTP status: {response.status_code}")
        exit(1)

    data = response.json()
    results = data.get("results", [])
    all_projects.extend(results)

    if api_reported_total is None:
        api_reported_total = data.get("total")

    if not data.get("has_more"):
        break

    offset += len(results)

# 4. Save results to data/projects.json
os.makedirs("data", exist_ok=True)
output_file = "data/projects.json"

with open(output_file, "w", encoding="utf-8") as file:
    json.dump(all_projects, file, indent=2, ensure_ascii=False)

# 5. Calculate unique & duplicate IDs
# Check possible ID keys
id_key = "id"
if all_projects:
    first_item = all_projects[0]
    for candidate in ["project_id", "id", "listing_id"]:
        if candidate in first_item:
            id_key = candidate
            break

project_ids = [p.get(id_key) for p in all_projects if p.get(id_key) is not None]
unique_ids = set(project_ids)
duplicates_count = len(project_ids) - len(unique_ids)

# 6. Print final summary
print(f"total records collected: {len(all_projects)}")
print(f"API reported total: {api_reported_total}")
print(f"number of unique project IDs: {len(unique_ids)}")
print(f"number of duplicate project IDs: {duplicates_count}")
print(f"output file path: {output_file}")
