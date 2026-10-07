# ASTROSIGHT — Autonomous AI Planetary Crater Intelligence Platform

AstroSight is an aerospace-grade planetary surface analysis web application designed for lunar and Martian orbital remote sensing, automated impact crater identification, multi-stage spectral validation, and mathematical spatial distance intelligence.

---

## Key Capabilities

1. **Strict Multi-Stage Image Validation (Anti-Terrestrial Filter)**
   - Rejects non-planetary imagery: Human selfies/portraits (via OpenCV Haar cascades), vehicles/automobiles (rectilinear edge density), terrestrial vegetation (chlorophyll ExG index), and atmospheric water/sky signatures.
   - Distinct 3-State Output:
     - ❌ `INVALID IMAGE`: Non-planetary imagery strictly rejected.
     - ℹ️ `VALID PLANETARY IMAGE — NO CRATER`: Valid lunar/Martian regolith, but no prominent crater features detected.
     - ✅ `VALID PLANETARY IMAGE — CRATER DETECTED`: Valid planetary terrain with identified impact craters, center coordinates $(X, Y)$, radius, and calibrated confidence.

2. **Crater Classification & Detection**
   - Deep CNN & Multi-Scale Circular Hough Manifold trained and evaluated against the LU3M6TGT Lunar Orbiter Benchmark.
   - Classification Classes: `CRATER` vs `NON-CRATER`.

3. **Mathematical Spatial Analysis**
   - Planar Euclidean Distance Metric: $d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$
   - Real-World Distance Scaling: $D = d \times \text{Resolution (m/px)}$
   - Interactive Measurement: Select any two crater points to draw live animated vectors and display real-world distances in kilometers.

4. **Interactive 3D Planetary Visualization (Three.js)**
   - Dedicated 3D Celestial Globe for Moon and Mars.
   - Drag-to-rotate orbital trackball controls, zoom, and coordinate parallels/meridians grid.
   - Detected 2D craters dynamically projected onto 3D spherical coordinates with illuminated telemetry beacon pins.

5. **Aerospace PDF Report Generation**
   - Formal mission reports generated via Python ReportLab.
   - Contains mission metadata, crater coordinate matrix, spatial distance vectors, and UN SDG 9 alignment.

6. **Authentication & User Data Isolation**
   - PBKDF2-HMAC-SHA256 password hashing.
   - JWT session management.
   - User-isolated SQLite telemetry storage (User A cannot view User B's analyses).

---

## Live Endpoints

- **Frontend Application**: `http://127.0.0.1:5173/`
- **FastAPI Backend Telemetry Node**: `http://127.0.0.1:8000/`
- **Interactive OpenAPI Documentation**: `http://127.0.0.1:8000/docs`

---

## Demo Researcher Credentials

- **Email**: `commander@astrosight.org`
- **Password**: `Password123!`
- *Or register any new researcher account in 1-click on the Sign-Up modal.*

---

## Automated Acceptance Test Suite

Run all 10 acceptance tests:
```bash
python test_acceptance_live.py
```
Outputs:
- TEST 1: Upload Human Photo Rejected -> `INVALID`
- TEST 2: Upload Car Photo Rejected -> `INVALID`
- TEST 3 & 5: Valid Lunar Crater Upload -> `VALID_CRATER_DETECTED`
- TEST 4: Valid Planetary Plain (No Crater) -> `VALID_NO_CRATER`
- TEST 6: Spatial Distance Calculation ($d$ & real km)
- TEST 7: Create New User
- TEST 8: Login & Mission Control Access
- TEST 9: User Analysis History & PDF Report Download
- TEST 10: Logout & Protected Route Enforcement
