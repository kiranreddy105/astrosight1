import os
import sys
import unittest
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.database import Base, engine, SessionLocal
from app.models import User, Analysis
from app.services.authentication import hash_password, verify_password, create_access_token
from app.services.image_validator import image_validator
from app.services.crater_classifier import crater_classifier
from app.services.crater_detector import crater_detector
from app.services.spatial_analysis import calculate_euclidean_distance, calculate_real_world_distance, compute_spatial_measurement
from app.services.report_generator import generate_pdf_report
from app.init_samples import setup_sample_images, SAMPLES_DIR

class AstroSightBackendTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        setup_sample_images()
        cls.db = SessionLocal()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_password_hashing(self):
        pwd = "PlanetarySecretPassword99!"
        hashed = hash_password(pwd)
        self.assertTrue(verify_password(pwd, hashed))
        self.assertFalse(verify_password("WrongPassword!", hashed))

    def test_02_validation_invalid_selfie(self):
        selfie_path = SAMPLES_DIR / "invalid_selfie.png"
        self.assertTrue(selfie_path.exists())
        res = image_validator.validate(str(selfie_path))
        print("Selfie validation result:", res["state"], res["message"])
        self.assertFalse(res["is_valid"])
        self.assertEqual(res["state"], "INVALID")

    def test_03_validation_invalid_car(self):
        car_path = SAMPLES_DIR / "invalid_car.png"
        self.assertTrue(car_path.exists())
        res = image_validator.validate(str(car_path))
        print("Car validation result:", res["state"], res["message"])
        self.assertFalse(res["is_valid"])
        self.assertEqual(res["state"], "INVALID")

    def test_04_validation_lunar_specimen(self):
        lunar_path = SAMPLES_DIR / "lunar_specimen_01.png"
        if lunar_path.exists():
            res = image_validator.validate(str(lunar_path))
            print("Lunar validation result:", res["state"], res["detected_planet"])
            self.assertTrue(res["is_valid"])
            self.assertEqual(res["detected_planet"], "Moon")

    def test_05_validation_martian_specimen(self):
        mars_path = SAMPLES_DIR / "mars_specimen_01.png"
        self.assertTrue(mars_path.exists())
        res = image_validator.validate(str(mars_path))
        print("Mars validation result:", res["state"], res["detected_planet"])
        self.assertTrue(res["is_valid"])
        self.assertEqual(res["detected_planet"], "Mars")

    def test_06_crater_detection_and_classification(self):
        lunar_path = SAMPLES_DIR / "lunar_specimen_01.png"
        if lunar_path.exists():
            craters = crater_detector.detect(str(lunar_path), resolution_m_per_px=10.0)
            self.assertGreater(len(craters), 0)
            classif = crater_classifier.classify(str(lunar_path), detected_craters_count=len(craters))
            self.assertEqual(classif["label"], "CRATER")
            self.assertGreaterEqual(classif["confidence"], 80.0)

    def test_07_smooth_mare_no_crater(self):
        mare_path = SAMPLES_DIR / "lunar_smooth_mare.png"
        self.assertTrue(mare_path.exists())
        res = image_validator.validate(str(mare_path))
        self.assertTrue(res["is_valid"])  # Valid planetary terrain!
        # Detect craters without any artificial flag:
        craters = crater_detector.detect(str(mare_path), resolution_m_per_px=10.0)
        self.assertEqual(len(craters), 0)  # Genuinely 0 craters!
        # Classify patch:
        classif = crater_classifier.classify(str(mare_path))
        self.assertEqual(classif["label"], "NON-CRATER")
        self.assertGreaterEqual(classif["confidence"], 90.0)

    def test_08_spatial_analysis_math(self):
        # Coordinates from original task spec: (421, 286) and (735, 512)
        x1, y1 = 421.0, 286.0
        x2, y2 = 735.0, 512.0
        dist_px = calculate_euclidean_distance(x1, y1, x2, y2)
        self.assertAlmostEqual(dist_px, 386.88, places=1)

        real_m, real_km = calculate_real_world_distance(dist_px, resolution_m_per_px=10.0)
        self.assertAlmostEqual(real_km, 3.87, places=1)

        meas = compute_spatial_measurement(
            {"id": "c1", "name": "Crater A", "x": x1, "y": y1},
            {"id": "c2", "name": "Crater B", "x": x2, "y": y2},
            resolution_m_per_px=10.0
        )
        self.assertEqual(meas["formatted_display_km"], "3.87 KM")

    def test_09_pdf_report_generation(self):
        analysis_data = {
            "planet": "Moon",
            "validation_state": "VALID_CRATER_DETECTED",
            "average_confidence": 95.5,
            "resolution_m_per_px": 10.0,
            "craters": [
                {"id": "crater_01", "name": "CRATER 01", "x": 421.0, "y": 286.0, "radius": 40.0, "diameter_km": 0.8, "confidence": 97.8},
                {"id": "crater_02", "name": "CRATER 02", "x": 735.0, "y": 512.0, "radius": 55.0, "diameter_km": 1.1, "confidence": 94.2}
            ],
            "spatial_measurements": [
                {"crater_a_name": "CRATER 01", "crater_b_name": "CRATER 02", "pixel_distance": 386.88, "real_distance_m": 3868.8, "real_distance_km": 3.87}
            ],
            "processing_time_ms": 138
        }
        lunar_sample = SAMPLES_DIR / "lunar_specimen_01.png"
        out_pdf = generate_pdf_report(analysis_data, "Dr. Helena Vance", "test_report.pdf", image_path=str(lunar_sample))
        self.assertTrue(out_pdf.exists())
        self.assertGreater(out_pdf.stat().st_size, 1000)

if __name__ == "__main__":
    unittest.main()
