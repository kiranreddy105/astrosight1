import os
import cv2
import numpy as np
from pathlib import Path
from typing import Tuple, Dict, Any

class ImageValidator:
    def __init__(self):
        # Load Haar Cascade for frontal face detection
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        if os.path.exists(cascade_path):
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
        else:
            self.face_cascade = None

        profile_path = cv2.data.haarcascades + "haarcascade_profileface.xml"
        if os.path.exists(profile_path):
            self.profile_cascade = cv2.CascadeClassifier(profile_path)
        else:
            self.profile_cascade = None

    def validate(self, image_path: str) -> Dict[str, Any]:
        """
        Strictly validates whether an uploaded image is a valid planetary surface (Lunar or Martian)
        or an invalid image (human photo, car, animal, building, food, cartoon, Earth landscape, screenshot).
        Supports 8-bit, 16-bit, grayscale, and color TIFF/PNG/JPEG.
        """
        raw_img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
        if raw_img is None:
            return {
                "is_valid": False,
                "state": "INVALID",
                "title": "INVALID IMAGE",
                "message": "Unable to decode image file format.",
                "detected_planet": "Unknown",
                "planet_confidence": 0.0,
                "details": {"rejection_reason": "Corrupt or unreadable image file"}
            }

        # Normalize 16-bit or float images to 8-bit uint8
        if raw_img.dtype == np.uint16:
            img = cv2.normalize(raw_img, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
        elif raw_img.dtype in (np.float32, np.float64):
            img = (raw_img * 255.0).clip(0, 255).astype(np.uint8)
        else:
            img = raw_img.copy()

        # Handle grayscale vs multi-channel
        if len(img.shape) == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        elif len(img.shape) == 3 and img.shape[2] == 4:
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

        height, width = img.shape[:2]
        if height < 120 or width < 120:
            return {
                "is_valid": False,
                "state": "INVALID",
                "title": "INVALID IMAGE",
                "message": "The image resolution is too low for reliable planetary analysis.",
                "detected_planet": "Unknown",
                "planet_confidence": 0.0,
                "details": {"rejection_reason": "Low resolution image (< 120x120)"}
            }

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 1. Face / Human Portrait Detection (Frontal + Profile Haar)
        faces_count = 0
        if self.face_cascade is not None:
            faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
            faces_count += len(faces)

        if self.profile_cascade is not None and faces_count == 0:
            profiles = self.profile_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
            faces_count += len(profiles)

        if faces_count > 0:
            return {
                "is_valid": False,
                "state": "INVALID",
                "title": "INVALID IMAGE",
                "message": "Human photograph or facial features detected. AstroSight only accepts extraterrestrial planetary surfaces.",
                "detected_planet": "Unknown",
                "planet_confidence": 0.0,
                "details": {"rejection_reason": "Human / Selfie detected", "face_count": faces_count}
            }

        # 2. Color & Spectrum Analysis
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)

        b = img[:, :, 0].astype(np.float32)
        g = img[:, :, 1].astype(np.float32)
        r = img[:, :, 2].astype(np.float32)

        mean_s = float(np.mean(s)) / 255.0
        std_s = float(np.std(s)) / 255.0

        # Earth vegetation index ExG = 2*G - R - B
        exg = 2.0 * g - r - b
        vegetation_ratio = float(np.mean(exg > 25.0))

        # Sky / Water detection (strong blue over red)
        sky_water_ratio = float(np.mean((b > r + 30.0) & (b > 90.0)))

        # Human Skin Tone analysis in HSV
        # Hue roughly 0-25 or 170-180, moderate saturation and value
        skin_mask = (
            ((h <= 25) | (h >= 170)) &
            (s >= 40) & (s <= 180) &
            (v >= 70) & (v <= 250)
        )
        skin_ratio = float(np.mean(skin_mask))

        # Channel difference standard deviation (chromatic diversity)
        rg_diff_std = float(np.std(r - g))
        rb_diff_std = float(np.std(r - b))

        # Check for truly blank / uniform single-color image
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        if laplacian_var < 0.2:
            return {
                "is_valid": False,
                "state": "INVALID",
                "title": "INVALID IMAGE",
                "message": "Uniform or blank image without planetary regolith topography.",
                "detected_planet": "Unknown",
                "planet_confidence": 0.0,
                "details": {"rejection_reason": "Blank image", "laplacian_var": laplacian_var}
            }

        # Human portrait / skin rejection
        if skin_ratio > 0.28:
            return {
                "is_valid": False,
                "state": "INVALID",
                "title": "INVALID IMAGE",
                "message": "Human photograph or biological skin tones detected. AstroSight strictly requires extraterrestrial planetary surfaces.",
                "detected_planet": "Unknown",
                "planet_confidence": 0.0,
                "details": {"rejection_reason": "Human skin tone detected", "skin_ratio": round(skin_ratio, 3)}
            }

        # 3. Check vegetation (plants, trees, grass, agriculture)
        if vegetation_ratio > 0.08:
            return {
                "is_valid": False,
                "state": "INVALID",
                "title": "INVALID IMAGE",
                "message": "Earth vegetation or biological chlorophyll signature detected. AstroSight requires extraterrestrial terrain.",
                "detected_planet": "Unknown",
                "planet_confidence": 0.0,
                "details": {"rejection_reason": "Terrestrial vegetation signature", "vegetation_ratio": round(vegetation_ratio, 3)}
            }

        # 4. Check sky or body of water
        if sky_water_ratio > 0.15:
            return {
                "is_valid": False,
                "state": "INVALID",
                "title": "INVALID IMAGE",
                "message": "Atmospheric sky or terrestrial body of water detected. Only vacuum/thin-atmosphere planetary imagery allowed.",
                "detected_planet": "Unknown",
                "planet_confidence": 0.0,
                "details": {"rejection_reason": "Terrestrial sky or water detected", "sky_water_ratio": round(sky_water_ratio, 3)}
            }

        # 5. Long Rectilinear / Architectural grid lines (Buildings, indoor scenes, screenshots, man-made structures)
        min_dim = min(height, width)
        min_len = max(60, int(min_dim * 0.28))
        edges = cv2.Canny(gray, 70, 190, apertureSize=3)
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=min_len, maxLineGap=8)

        if lines is not None and len(lines) >= 14:
            angles = []
            for l in lines:
                x1, y1, x2, y2 = l[0]
                ang = np.degrees(np.arctan2(y2 - y1, x2 - x1)) % 180
                angles.append(ang)
            angles = np.array(angles)

            # Man-made architecture and grids have orthogonal horizontal and vertical lines (0 deg and 90 deg)
            h_v_count = np.sum((angles <= 10) | (angles >= 170) | (abs(angles - 90) <= 10))
            rectilinear_ratio = float(h_v_count) / len(angles)

            # Only reject if there is a dominant artificial perpendicular grid pattern
            if len(lines) >= 16 and rectilinear_ratio > 0.60:
                return {
                    "is_valid": False,
                    "state": "INVALID",
                    "title": "INVALID IMAGE",
                    "message": "Man-made rectilinear structures, architectural lines, or vehicle features detected.",
                    "detected_planet": "Unknown",
                    "planet_confidence": 0.0,
                    "details": {
                        "rejection_reason": "Man-made straight grid edges detected",
                        "line_count": len(lines),
                        "rectilinear_ratio": round(rectilinear_ratio, 2)
                    }
                }

        # 6. Determine Lunar vs Martian Planetary Signature
        is_lunar = False
        is_martian = False
        planet_name = "Moon"
        planet_conf = 92.0

        # Lunar: almost purely grayscale regolith (very low saturation, RG and RB differences close to 0)
        if mean_s < 0.16 and rg_diff_std < 14.0 and rb_diff_std < 14.0:
            is_lunar = True
            planet_name = "Moon"
            planet_conf = min(99.4, round(88.0 + (0.16 - mean_s) * 75.0, 1))
        else:
            # Check Mars ferric oxide characteristics
            # Mars has R > G > B, hue around orange-rust (0-35), moderate saturation
            is_red_dominant = float(np.mean(r > g)) > 0.70 and float(np.mean(g > b)) > 0.60
            mars_hue_match = float(np.mean((h <= 35) | (h >= 170))) > 0.65
            if is_red_dominant and mars_hue_match and mean_s < 0.95:
                is_martian = True
                planet_name = "Mars"
                planet_conf = min(98.8, round(86.0 + mean_s * 12.0, 1))

        # If it matches neither Lunar nor Martian spectral characteristics:
        if not is_lunar and not is_martian:
            return {
                "is_valid": False,
                "state": "INVALID",
                "title": "INVALID IMAGE",
                "message": "Chromatic spectrum is inconsistent with lunar or Martian planetary surfaces.",
                "detected_planet": "Unknown",
                "planet_confidence": 0.0,
                "details": {
                    "rejection_reason": "Non-planetary chromatic variance",
                    "mean_saturation": round(mean_s, 3),
                    "rg_diff_std": round(rg_diff_std, 1)
                }
            }

        # Planetary surface validated!
        return {
            "is_valid": True,
            "state": "VALID_PLANETARY",
            "title": "IMAGE VALIDATED",
            "message": f"Planetary surface detected: {planet_name} terrain confirmed.",
            "detected_planet": planet_name,
            "planet_confidence": round(planet_conf, 1),
            "details": {
                "resolution": f"{width}x{height}",
                "mean_saturation": round(mean_s, 3),
                "laplacian_var": round(laplacian_var, 1),
                "is_lunar": is_lunar,
                "is_martian": is_martian
            }
        }

image_validator = ImageValidator()
