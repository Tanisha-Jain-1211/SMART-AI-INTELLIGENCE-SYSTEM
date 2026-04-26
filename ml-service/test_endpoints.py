import httpx
import json

base_url = "http://localhost:8000"

print("--- Testing /classify ---")
classify_payload = {
    "title": "No electricity",
    "description": "Power cut in our area since 2 days, transformer sparking near Sector 14"
}
try:
    res = httpx.post(f"{base_url}/classify", json=classify_payload, timeout=10.0)
    print("Status:", res.status_code)
    print("Response:", json.dumps(res.json(), indent=2))
except Exception as e:
    print("Error:", e)

print("\n--- Testing /duplicate-check ---")
dup_payload = {
    "title": "Garbage not collected",
    "description": "The dustbin is overflowing and smells very bad since 3 days.",
    "complaint_id": "new-123",
    "existing_complaints": [
        {"id": "old-1", "text": "Garbage not collected from our street for a week, smell everywhere"},
        {"id": "old-2", "text": "Water pipeline burst on main road causing flooding"}
    ]
}
try:
    res = httpx.post(f"{base_url}/duplicate-check", json=dup_payload, timeout=10.0)
    print("Status:", res.status_code)
    print("Response:", json.dumps(res.json(), indent=2))
except Exception as e:
    print("Error:", e)
