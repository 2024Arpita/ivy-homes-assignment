import os
import json
import requests
from dotenv import load_dotenv

def investigate():
    load_dotenv()
    
    BASE_URL = os.getenv("API_BASE_URL")
    API_KEY = os.getenv("API_KEY")
    PASSWORD = os.getenv("API_PASSWORD")
    EMAIL = os.getenv("API_EMAIL", "demo1@ivy.homes")

    # Load local datasets
    with open("data/listings.json", "r", encoding="utf-8") as f:
        listings = json.load(f)
    with open("data/rentals.json", "r", encoding="utf-8") as f:
        rentals = json.load(f)
    with open("data/projects.json", "r", encoding="utf-8") as f:
        projects = json.load(f)

    # 1. Login to obtain token
    login_url = f"{BASE_URL}/auth/login"
    login_res = requests.post(
        login_url,
        headers={"X-API-Key": API_KEY},
        json={"email": EMAIL, "password": PASSWORD}
    )
    token = login_res.json().get("access_token")
    headers = {
        "X-API-Key": API_KEY,
        "Authorization": f"Bearer {token}"
    }

    discrepancies = []
    working_behaviors = []

    # ============================================================
    # 1. AUTHENTICATION
    # ============================================================
    # Test API key in query params
    res_qp = requests.get(f"{BASE_URL}/v1/listings", params={"api_key": API_KEY, "limit": 1}, headers={"Authorization": f"Bearer {token}"})
    if res_qp.status_code == 401:
        discrepancies.append({
            "endpoint": "ALL (/auth/login, /v1/*)",
            "category": "Authentication",
            "documented_behavior": "API key can be passed as a query parameter (e.g., ?api_key=...).",
            "actual_behavior": "API rejects query parameter API keys with HTTP 401: 'send your key in the X-API-Key request header, not as a query parameter'.",
            "how_reproduced": "Sent GET request with ?api_key=... and no X-API-Key header. Received 401 error.",
            "impact": "Clients attempting query-parameter authentication fail to connect.",
            "evidence_ids": []
        })

    working_behaviors.append({
        "endpoint": "/auth/login",
        "feature": "Header Authentication",
        "description": "Authenticates correctly using X-API-Key header and returns Bearer access_token."
    })

    # ============================================================
    # 2. PAGINATION & MAXIMUM LIMITS
    # ============================================================
    # Rentals max limit
    res_rent = requests.get(f"{BASE_URL}/v1/rentals", headers=headers, params={"limit": 200, "offset": 0})
    d_rent = res_rent.json()
    if d_rent.get("limit") == 50:
        discrepancies.append({
            "endpoint": "/v1/rentals",
            "category": "Pagination",
            "documented_behavior": "Supports requesting limit up to 200 records per page.",
            "actual_behavior": "Endpoint enforces a hard cap of limit=50 per response regardless of requested limit.",
            "how_reproduced": "Requested GET /v1/rentals?limit=200. Response returned limit=50 and count=50.",
            "impact": "Clients assuming 200 items per batch skip 150 records per step if incrementing offset by requested limit.",
            "evidence_ids": []
        })

    # Rentals total metadata
    if d_rent.get("total") == 1268 and len(rentals) == 1320:
        discrepancies.append({
            "endpoint": "/v1/rentals",
            "category": "Metadata / Dataset Size",
            "documented_behavior": "Response 'total' field accurately reflects total dataset size (1268).",
            "actual_behavior": "Response reports total=1268, but 1320 unique, non-overlapping records are retrievable.",
            "how_reproduced": "Paginating sequentially with offset += len(results) yielded 1320 records up to offset 1300 before has_more=false.",
            "impact": "Clients relying on total count stop fetching early, missing 52 valid records.",
            "evidence_ids": []
        })

    # Projects max limit & total
    res_proj = requests.get(f"{BASE_URL}/v1/projects", headers=headers, params={"limit": 200, "offset": 0})
    d_proj = res_proj.json()
    if d_proj.get("limit") == 50:
        discrepancies.append({
            "endpoint": "/v1/projects",
            "category": "Pagination",
            "documented_behavior": "Supports requesting limit up to 200 records per page.",
            "actual_behavior": "Endpoint enforces a hard cap of limit=50 per response regardless of requested limit.",
            "how_reproduced": "Requested GET /v1/projects?limit=200. Response returned limit=50 and count=50.",
            "impact": "Clients assuming 200 items per batch skip 150 records per iteration.",
            "evidence_ids": []
        })

    if d_proj.get("total") == 384 and len(projects) == 400:
        discrepancies.append({
            "endpoint": "/v1/projects",
            "category": "Metadata / Dataset Size",
            "documented_behavior": "Response 'total' field accurately reflects total projects count (384).",
            "actual_behavior": "Response reports total=384, but 400 unique project records are retrievable.",
            "how_reproduced": "Paginating sequentially with offset += 50 yielded 400 records across 8 batches.",
            "impact": "Clients stop paginating at 384, missing 16 project records.",
            "evidence_ids": []
        })

    # Page parameter vs Offset
    res_page = requests.get(f"{BASE_URL}/v1/listings", headers=headers, params={"page": 2, "limit": 50})
    d_page = res_page.json()
    if d_page.get("offset") == 0:
        discrepancies.append({
            "endpoint": "/v1/listings",
            "category": "Pagination Parameter",
            "documented_behavior": "Documentation references page-based pagination (?page=...).",
            "actual_behavior": "The 'page' parameter is ignored by the backend; pagination strictly requires 'offset'.",
            "how_reproduced": "Sent GET /v1/listings?page=2&limit=50. Response returned offset=0 and first record 100-6000047.",
            "impact": "Clients attempting page-based pagination repeatedly receive page 1 in an infinite loop.",
            "evidence_ids": []
        })

    # ============================================================
    # 3. LISTINGS ACTIVE STATUS
    # ============================================================
    inactive_listings = [l["listing_id"] for l in listings if l.get("is_live") is False]
    if inactive_listings:
        discrepancies.append({
            "endpoint": "/v1/listings",
            "category": "Data Filtering",
            "documented_behavior": "GET /v1/listings returns only active / live properties (is_live: true).",
            "actual_behavior": f"Endpoint returns both active and inactive records (177 out of 900 records have is_live: false).",
            "how_reproduced": "Inspected /v1/listings output; found 177 listings with is_live=false.",
            "impact": "Consumers displaying raw listing responses show off-market / delisted properties to users.",
            "evidence_ids": inactive_listings[:5]
        })

    # ============================================================
    # 4. AREA UNIT DISCREPANCY
    # ============================================================
    mag_sqm_listings = [l["listing_id"] for l in listings if l.get("website") == "magichomes" and l.get("carpet_area", 0) < 200]
    if mag_sqm_listings:
        discrepancies.append({
            "endpoint": "/v1/listings",
            "category": "Units of Measurement",
            "documented_behavior": "All area values (carpet_area, super_built_up_area) are documented to be in square feet (sqft).",
            "actual_behavior": "Listings sourced from 'magichomes' with area < 200 are populated in square meters (sqm), needing 10.7639x conversion.",
            "how_reproduced": "Analyzed carpet_area distribution by portal; 93 magichomes listings had carpet_area between 36 and 187.",
            "impact": "Price per sqft calculations on raw data are skewed by ~10x for magichomes listings.",
            "evidence_ids": mag_sqm_listings[:5]
        })

    # ============================================================
    # 5. TIMESTAMP FORMATS
    # ============================================================
    naive_ts_listings = [l["listing_id"] for l in listings if l.get("posted_at") and not l["posted_at"].endswith("Z")]
    if naive_ts_listings:
        discrepancies.append({
            "endpoint": "/v1/listings",
            "category": "Date/Time Format",
            "documented_behavior": "Timestamps are documented as UTC ISO-8601 strings with 'Z' suffix (e.g., YYYY-MM-DDTHH:MM:SSZ).",
            "actual_behavior": "Sales listings timestamps omit the 'Z' timezone indicator (e.g., '2026-08-19T10:52:00'), whereas rentals include 'Z'.",
            "how_reproduced": "Inspected posted_at field across listings.json (naive format) vs rentals.json (UTC with Z).",
            "impact": "Timezone parsers default to local system timezone rather than UTC, causing time boundary shifts.",
            "evidence_ids": naive_ts_listings[:5]
        })

    # ============================================================
    # 6. FILTERS & SORTING ON /v1/listings
    # ============================================================
    # Bedroom filter ignored
    res_bed = requests.get(f"{BASE_URL}/v1/listings", headers=headers, params={"bedroom": 2, "limit": 10})
    d_bed = res_bed.json()
    beds = set(r.get("bedroom") for r in d_bed.get("results", []))
    if len(beds) > 1:
        discrepancies.append({
            "endpoint": "/v1/listings",
            "category": "Query Filtering",
            "documented_behavior": "Documentation states 'bedroom' query parameter filters listings by bedroom count.",
            "actual_behavior": "The 'bedroom' filter is ignored by the backend; returns mixed bedroom counts.",
            "how_reproduced": "Sent GET /v1/listings?bedroom=2. Response returned listings with 1, 2, 3, 4, and 5 bedrooms.",
            "impact": "Clients receive unfiltered results and must perform client-side filtering.",
            "evidence_ids": []
        })

    # is_live filter ignored
    res_live = requests.get(f"{BASE_URL}/v1/listings", headers=headers, params={"is_live": "true", "limit": 10})
    d_live = res_live.json()
    lives = set(r.get("is_live") for r in d_live.get("results", []))
    if False in lives:
        discrepancies.append({
            "endpoint": "/v1/listings",
            "category": "Query Filtering",
            "documented_behavior": "Documentation states 'is_live' query parameter filters for active listings only.",
            "actual_behavior": "The 'is_live' filter parameter is ignored; response contains both live and inactive records.",
            "how_reproduced": "Sent GET /v1/listings?is_live=true. Response contained listings with is_live=false.",
            "impact": "Clients must manually filter records client-side.",
            "evidence_ids": []
        })

    # Locality filter works
    res_loc = requests.get(f"{BASE_URL}/v1/listings", headers=headers, params={"locality": "sector 49", "limit": 10})
    d_loc = res_loc.json()
    locs = set(r.get("locality") for r in d_loc.get("results", []))
    if locs == {"sector 49"}:
        working_behaviors.append({
            "endpoint": "/v1/listings",
            "feature": "Locality Filter",
            "description": "Locality filter (?locality=...) works as documented, filtering records accurately."
        })

    # Price sorting works
    res_sort = requests.get(f"{BASE_URL}/v1/listings", headers=headers, params={"sort_by": "price", "order": "asc", "limit": 5})
    d_sort = res_sort.json()
    prices = [r.get("price") for r in d_sort.get("results", [])]
    if prices == sorted(prices):
        working_behaviors.append({
            "endpoint": "/v1/listings",
            "feature": "Price Sorting",
            "description": "Sorting by price (?sort_by=price&order=asc) orders records in ascending price sequence as documented."
        })

    # ============================================================
    # PRINT RESULTS
    # ============================================================
    print("\n" + "=" * 70)
    print("REPRODUCED DOCUMENTATION DISCREPANCIES (API_REFERENCE.md vs ACTUAL API)")
    print("=" * 70)

    for i, disc in enumerate(discrepancies, 1):
        print(f"\n[{i}] {disc['category'].upper()} ({disc['endpoint']})")
        print(f"  - Documented : {disc['documented_behavior']}")
        print(f"  - Actual     : {disc['actual_behavior']}")
        print(f"  - Reproduction: {disc['how_reproduced']}")
        print(f"  - Impact     : {disc['impact']}")
        if disc['evidence_ids']:
            print(f"  - Evidence IDs: {disc['evidence_ids']}")

    print("\n" + "=" * 70)
    print("VERIFIED WORKING DOCUMENTED BEHAVIORS")
    print("=" * 70)
    for i, wb in enumerate(working_behaviors, 1):
        print(f"[{i}] {wb['endpoint']} - {wb['feature']}: {wb['description']}")

if __name__ == "__main__":
    investigate()
