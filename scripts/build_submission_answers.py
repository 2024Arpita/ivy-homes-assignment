import json

def get_answers():
    answers = {
        "q1": 900,
        "q2": 888,
        "q3": 723,
        "q4": [
            "100-6002071",
            "MAG-6000453",
            "MAG-6000527",
            "MAG-6002834",
            "SQU-6003044"
        ],
        "q5": 4328000,
        "q6": 13872.30,
        "q7": {
            "project_id": "P60090",
            "price_max_inr": 989000000
        },
        "q8": 37,
        "q9": [
            "MAG-6002941"
        ],
        "q10": 375
    }
    return answers

def main():
    answers = get_answers()
    print("Generated answers object:")
    print(json.dumps(answers, indent=2))

if __name__ == "__main__":
    main()
