import requests
import json

base_url = "http://localhost:8000"

samples = [
    {
        "title": "Street light not working",
        "description": "The street light near Sector 14 market is completely dark for 3 days."
    },
    {
        "title": "Live electric wire fallen",
        "description": "A live electric wire has fallen on the road near the main bus stand, very dangerous to life."
    },
    {
        "title": "Contaminated water supply",
        "description": "Muddy sewage water is mixing with the drinking water supply since morning in Block C."
    }
]

print("--- Testing /classify Endpoint ---")
for i, sample in enumerate(samples):
    print(f"\nSample {i+1}: {sample['title']}")
    res = requests.post(f"{base_url}/classify", json=sample)
    print(json.dumps(res.json(), indent=2))

print("\n\n--- Testing /duplicate-check Endpoint ---")
existing_complaints = [
    {"id": "c1", "text": "Street light not working near Sector 14 market for 3 days"},
    {"id": "c2", "text": "Live electric wire fallen on road near bus stand dangerous to life"}
]

test_dup_sample = {
    "title": "Sector 14 street lamp broken",
    "description": "The street lamp at sector 14 market is broken and not working for 3 days.",
    "complaint_id": "new_c1",
    "existing_complaints": existing_complaints
}

print(f"\nChecking Duplicate for: {test_dup_sample['title']}")
res_dup = requests.post(f"{base_url}/duplicate-check", json=test_dup_sample)
print(json.dumps(res_dup.json(), indent=2))
