import os
import json
from collections import Counter

DATA_FILES = {
    "listings": {
        "path": "data/listings.json",
        "id_field": "listing_id",
        "important_fields": [
            "listing_id", "title", "locality", "property_type", "price",
            "bedroom", "bathroom", "carpet_area", "latitude", "longitude",
            "posted_by", "is_live"
        ]
    },
    "rentals": {
        "path": "data/rentals.json",
        "id_field": "listing_id",
        "important_fields": [
            "listing_id", "title", "locality", "property_type", "price",
            "deposit", "maintenance", "bedroom", "bathroom", "carpet_area",
            "latitude", "longitude", "posted_by", "is_live"
        ]
    },
    "projects": {
        "path": "data/projects.json",
        "id_field": "project_id",
        "important_fields": [
            "project_id", "apartment_name", "developer_name", "locality",
            "project_status", "total_units", "total_towers", "total_floors",
            "launch_date", "possession_date", "rera_number", "latitude",
            "longitude", "price_min", "price_max"
        ]
    }
}

def validate_dataset(name, config):
    filepath = config["path"]
    id_field = config["id_field"]
    important_fields = config["important_fields"]

    print(f"\n{'=' * 60}")
    print(f"DATASET: {name.upper()} ({filepath})")
    print(f"{'=' * 60}")

    # 1. Check valid JSON and list structure
    if not os.path.exists(filepath):
        print(f"ERROR: File {filepath} does not exist.")
        return

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"ERROR: Invalid JSON in {filepath}: {e}")
        return

    if not isinstance(data, list):
        print(f"ERROR: Expected a JSON array/list in {filepath}, but got {type(data).__name__}.")
        return

    total_records = len(data)
    print(f"1. Valid JSON format: YES (List of records)")
    print(f"2. Total records in file: {total_records}")

    # 2. Extract IDs & check missing primary ID
    ids = []
    missing_id_count = 0
    for idx, item in enumerate(data):
        if not isinstance(item, dict):
            continue
        val = item.get(id_field)
        if val is None or val == "":
            missing_id_count += 1
        else:
            ids.append(str(val))

    unique_ids = set(ids)
    duplicate_count = len(ids) - len(unique_ids)

    print(f"3. Primary ID field checked: '{id_field}'")
    print(f"4. Records missing primary ID: {missing_id_count}")
    print(f"5. Unique IDs count: {len(unique_ids)}")
    print(f"6. Duplicate IDs count: {duplicate_count}")

    # 3. First and last ID (sorted)
    if ids:
        sorted_ids = sorted(unique_ids)
        print(f"7. First ID (sorted): {sorted_ids[0]}")
        print(f"8. Last ID (sorted): {sorted_ids[-1]}")
    else:
        print(f"7. First ID: N/A")
        print(f"8. Last ID: N/A")

    # 4. Check null / missing values in important fields
    print(f"\n--- Null / Missing Values Summary in Important Fields ---")
    missing_stats = {}
    for field in important_fields:
        null_count = 0
        empty_str_count = 0
        for item in data:
            if not isinstance(item, dict) or field not in item or item[field] is None:
                null_count += 1
            elif isinstance(item[field], str) and item[field].strip() == "":
                empty_str_count += 1
        missing_stats[field] = {
            "null_or_missing": null_count,
            "empty_string": empty_str_count
        }

    for field, stats in missing_stats.items():
        total_missing = stats["null_or_missing"] + stats["empty_string"]
        pct = (total_missing / total_records * 100) if total_records > 0 else 0
        print(f"  - {field:<22}: {stats['null_or_missing']:>4} null/absent, {stats['empty_string']:>4} empty string ({pct:>5.1f}% unpopulated)")

def main():
    print("RUNNING DATA VALIDATION SUITE...")
    for name, config in DATA_FILES.items():
        validate_dataset(name, config)
    print(f"\n{'=' * 60}")
    print("VALIDATION COMPLETE")
    print(f"{'=' * 60}")

if __name__ == "__main__":
    main()
