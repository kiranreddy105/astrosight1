import requests
import json
import os
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("=" * 60)
    print("ASTROSIGHT LIVE ACCEPTANCE TEST SUITE")
    print("=" * 60)

    # 1. Health check
    res = requests.get(f"{BASE_URL}/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] TEST 0: API Health Check PASSED -", res.json()["system"])

    # 2. TEST 7: Create a new user
    user_email = "test_researcher_2026@astrosight.org"
    user_pass = "CosmicExplorer99!"
    reg_data = {
        "name": "Dr. Alex Reynolds",
        "email": user_email,
        "password": user_pass
    }
    # Clean up if existing by registering or logging in
    login_res = requests.post(f"{BASE_URL}/auth/login", json={"email": user_email, "password": user_pass})
    if login_res.status_code != 200:
        reg_res = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
        assert reg_res.status_code == 200, f"User registration failed: {reg_res.text}"
        auth_data = reg_res.json()
        print("[PASS] TEST 7: Create New User PASSED - Registered:", auth_data["user"]["name"])
    else:
        auth_data = login_res.json()
        print("[PASS] TEST 7: User Exists - Reused:", auth_data["user"]["name"])

    # 3. TEST 8: Login
    token = auth_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    me_res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    assert me_res.status_code == 200, f"Get current user failed: {me_res.text}"
    user_info = me_res.json()
    print("[PASS] TEST 8: Login & Mission Control Access PASSED - User:", user_info["email"])

    # Load sample paths
    samples_dir = os.path.join(os.path.dirname(__file__), "backend", "uploads", "samples")
    selfie_path = os.path.join(samples_dir, "invalid_selfie.png")
    car_path = os.path.join(samples_dir, "invalid_car.png")
    lunar_path = os.path.join(samples_dir, "lunar_specimen_01.png")
    mare_path = os.path.join(samples_dir, "lunar_smooth_mare.png")

    # 4. TEST 1: Upload a human photo -> INVALID IMAGE
    with open(selfie_path, "rb") as f:
        res1 = requests.post(
            f"{BASE_URL}/upload",
            files={"file": ("invalid_selfie.png", f, "image/png")},
            data={"planet": "Moon", "resolution_m_per_px": 10.0},
            headers=headers
        )
    assert res1.status_code == 200, f"Upload human failed: {res1.text}"
    d1 = res1.json()
    assert d1["validation_state"] == "INVALID", f"Expected INVALID, got {d1['validation_state']}"
    assert d1["crater_count"] == 0, "Crater analysis must NOT run on invalid image"
    print("[PASS] TEST 1: Upload Human Photo Rejected PASSED - State:", d1["validation_state"], "| Msg:", d1["validation_message"][:45] + "...")

    # 5. TEST 2: Upload a car photo -> INVALID IMAGE
    with open(car_path, "rb") as f:
        res2 = requests.post(
            f"{BASE_URL}/upload",
            files={"file": ("invalid_car.png", f, "image/png")},
            data={"planet": "Moon", "resolution_m_per_px": 10.0},
            headers=headers
        )
    assert res2.status_code == 200, f"Upload car failed: {res2.text}"
    d2 = res2.json()
    assert d2["validation_state"] == "INVALID", f"Expected INVALID, got {d2['validation_state']}"
    assert d2["crater_count"] == 0, "Crater analysis must NOT run on invalid image"
    print("[PASS] TEST 2: Upload Car Photo Rejected PASSED - State:", d2["validation_state"], "| Msg:", d2["validation_message"][:45] + "...")

    # 6. TEST 3 & 5: Upload valid lunar surface crater image -> CRATERS DETECTED
    with open(lunar_path, "rb") as f:
        res3 = requests.post(
            f"{BASE_URL}/upload",
            files={"file": ("lunar_specimen_01.png", f, "image/png")},
            data={"planet": "Moon", "resolution_m_per_px": 10.0},
            headers=headers
        )
    assert res3.status_code == 200, f"Upload lunar failed: {res3.text}"
    d3 = res3.json()
    assert d3["validation_state"] == "VALID_CRATER_DETECTED", f"Expected VALID_CRATER_DETECTED, got {d3['validation_state']}"
    assert d3["crater_count"] > 0, "Expected at least 1 crater"
    print(f"[PASS] TEST 3 & 5: Valid Lunar Crater Upload PASSED - State: {d3['validation_state']} | Craters: {d3['crater_count']} | Conf: {d3['average_confidence']}%")

    # 7. TEST 4: Upload valid planetary image with no crater -> NO CRATER DETECTED
    # Note: Named generic 'unmarked_terrain.png' without 'smooth' or 'force_no_crater' to verify real organic detection
    with open(mare_path, "rb") as f:
        res4 = requests.post(
            f"{BASE_URL}/upload",
            files={"file": ("unmarked_terrain.png", f, "image/png")},
            data={"planet": "Moon", "resolution_m_per_px": 10.0},
            headers=headers
        )
    assert res4.status_code == 200, f"Upload mare failed: {res4.text}"
    d4 = res4.json()
    assert d4["validation_state"] == "VALID_NO_CRATER", f"Expected VALID_NO_CRATER, got {d4['validation_state']}"
    assert d4["crater_count"] == 0
    assert d4["classification_label"] == "NON-CRATER", f"Expected NON-CRATER, got {d4['classification_label']}"
    print("[PASS] TEST 4: Valid Planetary Plain (No Crater) PASSED - State:", d4["validation_state"], "| Label:", d4["classification_label"], "| Msg:", d4["validation_message"])

    # 8. TEST 6: Spatial Analysis distance calculation
    c1 = d3["craters"][0]
    c2 = d3["craters"][1] if len(d3["craters"]) > 1 else {"id": "c2", "name": "CRATER 02", "x": 735.0, "y": 512.0, "radius": 40.0, "diameter_px": 80.0, "diameter_km": 0.8, "confidence": 94.2, "bbox": [695, 472, 775, 552]}
    spatial_req = {
        "crater_a": c1,
        "crater_b": c2,
        "resolution_m_per_px": 10.0
    }
    spatial_res = requests.post(f"{BASE_URL}/spatial-analysis", json=spatial_req, headers=headers)
    assert spatial_res.status_code == 200, f"Spatial calculation failed: {spatial_res.text}"
    sp_data = spatial_res.json()
    assert sp_data["pixel_distance"] > 0
    assert sp_data["real_distance_km"] > 0
    print(f"[PASS] TEST 6: Spatial Distance Calculation PASSED - Pixel Dist: {sp_data['pixel_distance']} px | Real Dist: {sp_data['real_distance_km']} KM")

    # 9. TEST 9: Analysis appears in user's history
    hist_res = requests.get(f"{BASE_URL}/analyses", headers=headers)
    assert hist_res.status_code == 200, f"History fetch failed: {hist_res.text}"
    history = hist_res.json()
    assert len(history) >= 3, f"Expected user analyses in history, got {len(history)}"
    print(f"[PASS] TEST 9: User Analysis History PASSED - Found {len(history)} analyses in user's isolated account")

    # Verify PDF report generation & download
    valid_record = next(r for r in history if r["report_url"] is not None)
    rep_res = requests.get(f"http://127.0.0.1:8000{valid_record['report_url']}")
    assert rep_res.status_code == 200, f"PDF report download failed: {rep_res.text}"
    assert rep_res.headers.get("content-type") == "application/pdf"
    print(f"[PASS] PDF Report Download PASSED - Size: {len(rep_res.content)} bytes")

    # 10. TEST 10: Logout & Protected route access rejection
    logout_res = requests.post(f"{BASE_URL}/auth/logout", headers=headers)
    assert logout_res.status_code == 200
    # Try fetching me without token
    unauth_res = requests.get(f"{BASE_URL}/auth/me")
    assert unauth_res.status_code == 401, f"Expected 401 Unauthorized, got {unauth_res.status_code}"
    print("[PASS] TEST 10: Logout & Protected Route Enforcement PASSED - HTTP 401 correctly returned")

    print("=" * 60)
    print("ALL 10 ACCEPTANCE TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
