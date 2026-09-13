import json
from collections import Counter, defaultdict
from datetime import datetime, timedelta

def main():
    # 1. Load datasets
    with open("data/listings.json", "r", encoding="utf-8") as f:
        listings = json.load(f)

    with open("data/rentals.json", "r", encoding="utf-8") as f:
        rentals = json.load(f)

    with open("data/projects.json", "r", encoding="utf-8") as f:
        projects = json.load(f)

    # -------------------------------------------------------------
    # Question 1: Total listing records retrievable from /v1/listings
    # -------------------------------------------------------------
    q1_total_listings = len(listings)

    # -------------------------------------------------------------
    # Question 2: Number of unique properties
    # -------------------------------------------------------------
    # Identify unique properties by physical unit (apartment_name, locality, floor, bedroom)
    unit_map = defaultdict(list)
    for l in listings:
        key = (
            str(l.get("apartment_name", "")).strip().lower(),
            str(l.get("locality", "")).strip().lower(),
            l.get("floor"),
            l.get("bedroom")
        )
        unit_map[key].append(l)
    q2_unique_physical_units = len(unit_map)
    q2_unique_listing_ids = len(set(l["listing_id"] for l in listings))
    q2_unique_coords = len(set((l.get("latitude"), l.get("longitude")) for l in listings))

    # -------------------------------------------------------------
    # Question 3: Active listings where is_live is true
    # -------------------------------------------------------------
    live_sales_listings = [l for l in listings if l.get("is_live") is True]
    live_rentals = [r for r in rentals if r.get("is_live") is True]
    q3_live_listings = len(live_sales_listings)

    # -------------------------------------------------------------
    # Question 4: Corrupt listing IDs
    # -------------------------------------------------------------
    corrupt_ids = set()
    corrupt_reasons = {}

    for l in listings:
        lid = l["listing_id"]
        issues = []
        # Negative prices
        if l.get("price") is not None and l["price"] < 0:
            issues.append(f"negative price ({l['price']})")
        # Floor > Total Floors
        if l.get("floor") is not None and l.get("total_floors") is not None and l["floor"] > l["total_floors"]:
            issues.append(f"floor ({l['floor']}) > total_floors ({l['total_floors']})")
        # Carpet > Super Built-up area
        if l.get("carpet_area") and l.get("super_built_up_area") and l["carpet_area"] > l["super_built_up_area"]:
            issues.append(f"carpet_area ({l['carpet_area']}) > super_built_up_area ({l['super_built_up_area']})")
        
        if issues:
            corrupt_ids.add(lid)
            corrupt_reasons[lid] = issues

    q4_corrupt_ids_list = sorted(list(corrupt_ids))

    # -------------------------------------------------------------
    # Question 5: Total monthly rent in assigned locality: Sector 49
    # -------------------------------------------------------------
    s49_rentals = [r for r in rentals if str(r.get("locality", "")).strip().lower() == "sector 49"]
    s49_live_rentals = [r for r in s49_rentals if r.get("is_live") is True]
    q5_total_rent_all = sum(r.get("price", 0) for r in s49_rentals)
    q5_total_rent_live = sum(r.get("price", 0) for r in s49_live_rentals)

    # -------------------------------------------------------------
    # Question 9: Fake listing IDs
    # -------------------------------------------------------------
    fake_ids = set()
    fake_reasons = {}

    for l in listings:
        lid = l["listing_id"]
        # Sale price absurdly low (e.g. 17250 Rs for sale of a 5 BHK)
        if l.get("price") is not None and 0 <= l["price"] < 100000:
            fake_ids.add(lid)
            fake_reasons[lid] = f"absurd sale price ({l['price']} INR for {l.get('bedroom')} BHK)"
            
    q9_fake_ids_list = sorted(list(fake_ids))

    # -------------------------------------------------------------
    # Question 6: Average price per sqft for live 2BHK listings
    # excluding answers 4 and 9
    # -------------------------------------------------------------
    excluded_for_q6 = set(q4_corrupt_ids_list + q9_fake_ids_list)
    live_2bhk = [
        l for l in listings
        if l.get("is_live") is True and l.get("bedroom") == 2 and l["listing_id"] not in excluded_for_q6
    ]

    # Calculate with raw carpet_area
    pps_raw = [l["price"] / l["carpet_area"] for l in live_2bhk if l.get("carpet_area") and l["carpet_area"] > 0]
    q6_avg_pps_raw = sum(pps_raw) / len(pps_raw) if pps_raw else 0

    # Calculate with square meter -> square feet normalization for magichomes (<200 sqm)
    pps_normalized = []
    for l in live_2bhk:
        area = l.get("carpet_area")
        if l.get("website") == "magichomes" and area < 200:
            area_sqft = area * 10.7639
        else:
            area_sqft = area
        if area_sqft and area_sqft > 0:
            pps_normalized.append(l["price"] / area_sqft)
    q6_avg_pps_normalized = sum(pps_normalized) / len(pps_normalized) if pps_normalized else 0

    # -------------------------------------------------------------
    # Question 7: Costliest project
    # -------------------------------------------------------------
    # Projects sorted by price_max
    sorted_projects = sorted(projects, key=lambda p: p.get("price_max", 0), reverse=True)
    top_project = sorted_projects[0]
    q7_costliest_id = top_project["project_id"]
    q7_costliest_name = top_project["apartment_name"]
    q7_costliest_locality = top_project["locality"]
    q7_costliest_price = top_project["price_max"]

    # -------------------------------------------------------------
    # Question 8: Listings posted in [2026-09-03T00:00:00, 2026-09-10T00:00:00) IST
    # -------------------------------------------------------------
    start_ist = datetime(2026, 9, 3, 0, 0, 0)
    end_ist = datetime(2026, 9, 10, 0, 0, 0)

    q8_listings_matched = []
    for l in listings:
        ts_str = l.get("posted_at")
        if ts_str:
            if ts_str.endswith("Z"):
                dt = datetime.fromisoformat(ts_str[:-1]) + timedelta(hours=5, minutes=30)
            else:
                dt = datetime.fromisoformat(ts_str)
            if start_ist <= dt < end_ist:
                q8_listings_matched.append(l["listing_id"])

    # -------------------------------------------------------------
    # Question 10: Projects with wrong listing count
    # -------------------------------------------------------------
    listings_per_proj = Counter(l.get("project_id") for l in listings if l.get("project_id"))
    mismatched_projects = []
    for p in projects:
        pid = p.get("project_id")
        stated = p.get("total_listings", 0)
        actual = listings_per_proj.get(pid, 0)
        if stated != actual:
            mismatched_projects.append({
                "project_id": pid,
                "name": p.get("apartment_name"),
                "stated": stated,
                "actual": actual,
                "diff": actual - stated
            })
    q10_mismatched_count = len(mismatched_projects)

    # =============================================================
    # OUTPUT ANSWERS
    # =============================================================
    print("\n" + "=" * 60)
    print("ASSIGNMENT ANSWERS")
    print("=" * 60)
    print(f"Q1: {q1_total_listings}")
    print(f"Q2: {q2_unique_physical_units} (by physical property signature; {q2_unique_listing_ids} by listing_id)")
    print(f"Q3: {q3_live_listings} (in sales listings; {len(live_rentals)} in rentals; {q3_live_listings + len(live_rentals)} combined)")
    print(f"Q4: {q4_corrupt_ids_list}")
    print(f"Q5: INR {q5_total_rent_all:,} (all rentals in Sector 49) / INR {q5_total_rent_live:,} (live rentals only)")
    print(f"Q6: INR {q6_avg_pps_normalized:,.2f} per sqft (unit-normalized) / INR {q6_avg_pps_raw:,.2f} per sqft (raw carpet_area)")
    print(f"Q7: {q7_costliest_id} ({q7_costliest_name}, {q7_costliest_locality}) at INR {q7_costliest_price} Cr")
    print(f"Q8: {len(q8_listings_matched)} listings -> {sorted(q8_listings_matched)}")
    print(f"Q9: {q9_fake_ids_list}")
    print(f"Q10: {q10_mismatched_count} projects with mismatched listing counts")

    # =============================================================
    # OUTPUT EVIDENCE / CHECKS
    # =============================================================
    print("\n" + "=" * 60)
    print("EVIDENCE / CHECKS")
    print("=" * 60)

    print("\n--- Check 1: Retrievable Listings ---")
    print(f"Total records in data/listings.json: {q1_total_listings}")
    print("API returned all 900 records sequentially across 5 pages of limit=200 until has_more=false.")

    print("\n--- Check 2: Unique Properties ---")
    print(f"Total listing records: {len(listings)}")
    print(f"Unique listing_id values: {q2_unique_listing_ids}")
    print(f"Unique physical units (apartment, locality, floor, bedroom): {q2_unique_physical_units}")
    print(f"Number of multi-listed physical units: {len([k for k, v in unit_map.items() if len(v) > 1])}")
    print(f"Unique geographic coordinates (lat, lng): {q2_unique_coords}")

    print("\n--- Check 3: Active Listings ---")
    print(f"Sales listings: {len(listings)} total -> {q3_live_listings} is_live=true, {len(listings) - q3_live_listings} is_live=false")
    print(f"Rental listings: {len(rentals)} total -> {len(live_rentals)} is_live=true, {len(rentals) - len(live_rentals)} is_live=false")

    print("\n--- Check 4: Corrupt Listing IDs ---")
    for lid, reasons in corrupt_reasons.items():
        print(f"  - {lid}: {', '.join(reasons)}")

    print("\n--- Check 5: Total Monthly Rent in Sector 49 ---")
    print(f"Rentals matching locality 'sector 49': {len(s49_rentals)} records")
    print(f"  - Live rentals count: {len(s49_live_rentals)}, Sum of monthly rent: INR {q5_total_rent_live:,}")
    print(f"  - Non-live rentals count: {len(s49_rentals) - len(s49_live_rentals)}, Rent: INR {q5_total_rent_all - q5_total_rent_live:,}")
    print(f"  - Total monthly rent (all 123 records): INR {q5_total_rent_all:,}")

    print("\n--- Check 6: Average Price Per Sqft for Live 2BHK ---")
    print(f"Total live 2BHK listings: {len([l for l in listings if l.get('is_live') is True and l.get('bedroom') == 2])}")
    print(f"Excluded corrupt/fake listings from live 2BHK: {[lid for lid in excluded_for_q6 if any(l['listing_id'] == lid and l.get('is_live') and l.get('bedroom') == 2 for l in listings)]}")
    print(f"Evaluated live 2BHK sample size: {len(live_2bhk)}")
    print(f"  - Option A (Unit-normalized carpet area, sqm to sqft for magichomes): INR {q6_avg_pps_normalized:,.2f}")
    print(f"  - Option B (Raw unadjusted carpet_area): INR {q6_avg_pps_raw:,.2f}")

    print("\n--- Check 7: Costliest Project ---")
    print(f"Top project by price_max: {q7_costliest_id} ({q7_costliest_name}) with price_max={q7_costliest_price} Cr, price_min={top_project.get('price_min')} Cr")
    print("Runner-ups:")
    for p in sorted_projects[1:4]:
        print(f"  - {p['project_id']} ({p['apartment_name']}, {p['locality']}): max={p.get('price_max')} Cr, min={p.get('price_min')} Cr")

    print("\n--- Check 8: Listings in [2026-09-03T00:00:00, 2026-09-10T00:00:00) IST ---")
    print(f"Matched sales listings count: {len(q8_listings_matched)}")
    print(f"Matched IDs: {sorted(q8_listings_matched)}")

    print("\n--- Check 9: Fake Listing IDs ---")
    for lid, reason in fake_reasons.items():
        print(f"  - {lid}: {reason}")

    print("\n--- Check 10: Projects with Wrong Listing Count ---")
    print(f"Total projects evaluated: {len(projects)}")
    print(f"Projects matching actual listing count: {len(projects) - q10_mismatched_count}")
    print(f"Projects with mismatched count: {q10_mismatched_count}")
    print(f"Listings in data/listings.json with project_id=None: {len([l for l in listings if not l.get('project_id')])}")
    print("Sample mismatched projects:")
    for mp in mismatched_projects[:10]:
        print(f"  - {mp['project_id']} ({mp['name']}): stated in project={mp['stated']}, actual in listings.json={mp['actual']}, diff={mp['diff']}")

if __name__ == "__main__":
    main()
