import os
import shutil
import cv2
import numpy as np
from pathlib import Path
from .config import UPLOAD_DIR, DATASET_DIR

SAMPLES_DIR = UPLOAD_DIR / "samples"
SAMPLES_DIR.mkdir(parents=True, exist_ok=True)

def setup_sample_images():
    """Initializes high-fidelity sample test images for the acceptance test suite."""
    
    # 1 & 2: Copy real images from LU3M6TGT valid/images, or synthesize if not present
    valid_img_dir = DATASET_DIR / "valid" / "images"
    copied = False
    if valid_img_dir.exists():
        img_files = list(valid_img_dir.glob("*.png"))
        if len(img_files) >= 2:
            shutil.copyfile(img_files[0], SAMPLES_DIR / "lunar_specimen_01.png")
            shutil.copyfile(img_files[1], SAMPLES_DIR / "lunar_specimen_02.png")
            copied = True
            print("Copied authentic LU3M6TGT lunar samples.")
            
    if not copied and not (SAMPLES_DIR / "lunar_specimen_01.png").exists():
        # Synthesize fallback high-contrast lunar impact craters
        lunar_bg = np.random.normal(130, 12, (512, 512)).clip(90, 180).astype(np.uint8)
        lunar_bgr = cv2.cvtColor(lunar_bg, cv2.COLOR_GRAY2BGR)
        # Primary impact crater
        cv2.circle(lunar_bgr, (256, 256), 75, (60, 60, 60), -1)
        cv2.circle(lunar_bgr, (270, 250), 70, (85, 85, 85), -1)
        cv2.circle(lunar_bgr, (256, 256), 75, (210, 210, 210), 3)
        # Secondary crater
        cv2.circle(lunar_bgr, (140, 140), 40, (50, 50, 50), -1)
        cv2.circle(lunar_bgr, (148, 136), 36, (75, 75, 75), -1)
        cv2.circle(lunar_bgr, (140, 140), 40, (200, 200, 200), 2)
        lunar_img = cv2.GaussianBlur(lunar_bgr, (5, 5), 1.2)
        cv2.imwrite(str(SAMPLES_DIR / "lunar_specimen_01.png"), lunar_img)
        cv2.imwrite(str(SAMPLES_DIR / "lunar_specimen_02.png"), lunar_img)
        print("Synthesized cloud fallback lunar specimens.")

    # 3: Martian Crater Specimen (rusty ferric oxide terrain)
    mars_w, mars_h = 512, 512
    mars_bg = np.zeros((mars_h, mars_w, 3), dtype=np.uint8)
    mars_bg[:, :, 0] = np.random.normal(35, 6, (mars_h, mars_w)).clip(20, 60).astype(np.uint8)  # B
    mars_bg[:, :, 1] = np.random.normal(85, 10, (mars_h, mars_w)).clip(60, 110).astype(np.uint8) # G
    mars_bg[:, :, 2] = np.random.normal(185, 15, (mars_h, mars_w)).clip(150, 230).astype(np.uint8) # R
    
    # Draw impact craters
    cv2.circle(mars_bg, (230, 240), 90, (25, 60, 130), -1)
    cv2.circle(mars_bg, (245, 230), 85, (40, 90, 195), -1)
    cv2.circle(mars_bg, (235, 235), 90, (50, 110, 220), 4)
    
    cv2.circle(mars_bg, (390, 380), 50, (25, 60, 130), -1)
    cv2.circle(mars_bg, (398, 375), 46, (40, 90, 195), -1)
    cv2.circle(mars_bg, (392, 378), 50, (50, 110, 220), 3)

    mars_img = cv2.GaussianBlur(mars_bg, (5, 5), 1.5)
    cv2.imwrite(str(SAMPLES_DIR / "mars_specimen_01.png"), mars_img)

    # 4: Smooth Lunar Mare (Valid planetary image, NO CRATER)
    mare_w, mare_h = 512, 512
    # Grayscale uniform basalt plain with subtle regolith granular texture
    mare_gray = np.random.normal(120, 8, (mare_h, mare_w)).clip(90, 150).astype(np.uint8)
    mare_bgr = cv2.cvtColor(mare_gray, cv2.COLOR_GRAY2BGR)
    mare_bgr = cv2.GaussianBlur(mare_bgr, (5, 5), 1.0)
    cv2.imwrite(str(SAMPLES_DIR / "lunar_smooth_mare.png"), mare_bgr)

    # 5: Invalid Human Photograph / Selfie
    # Portrait with face, hair, eyes, lips, background
    selfie = np.zeros((400, 400, 3), dtype=np.uint8)
    selfie[:] = (245, 235, 225)
    # Head
    cv2.ellipse(selfie, (200, 190), (85, 110), 0, 0, 360, (170, 200, 245), -1)
    # Hair
    cv2.ellipse(selfie, (200, 115), (90, 50), 0, 180, 360, (30, 25, 20), -1)
    # Eyes
    cv2.circle(selfie, (170, 175), 10, (255, 255, 255), -1)
    cv2.circle(selfie, (170, 175), 5, (40, 30, 20), -1)
    cv2.circle(selfie, (230, 175), 10, (255, 255, 255), -1)
    cv2.circle(selfie, (230, 175), 5, (40, 30, 20), -1)
    # Nose & Lips
    cv2.line(selfie, (200, 180), (200, 210), (130, 150, 210), 3)
    cv2.ellipse(selfie, (200, 235), (25, 10), 0, 0, 180, (70, 70, 200), -1)
    # Torso
    cv2.ellipse(selfie, (200, 360), (150, 80), 0, 180, 360, (180, 70, 40), -1)
    cv2.imwrite(str(SAMPLES_DIR / "invalid_selfie.png"), selfie)

    # 6: Invalid Car / Vehicle Object
    car_img = np.zeros((400, 500, 3), dtype=np.uint8)
    car_img[:] = (210, 210, 210)
    cv2.rectangle(car_img, (60, 170), (440, 270), (220, 50, 20), -1) # bright blue
    pts = np.array([[120, 170], [170, 95], [340, 95], [380, 170]], np.int32)
    cv2.fillPoly(car_img, [pts], (240, 70, 30))
    pts_win = np.array([[175, 105], [330, 105], [365, 165], [135, 165]], np.int32)
    cv2.fillPoly(car_img, [pts_win], (235, 235, 245))
    for y in range(110, 270, 18):
        cv2.line(car_img, (50, y), (450, y), (30, 30, 30), 2)
    for x in range(80, 430, 25):
        cv2.line(car_img, (x, 140), (x, 265), (30, 30, 30), 2)
    cv2.circle(car_img, (140, 270), 35, (20, 20, 20), -1)
    cv2.circle(car_img, (360, 270), 35, (20, 20, 20), -1)
    cv2.imwrite(str(SAMPLES_DIR / "invalid_car.png"), car_img)

    print("Sample test images generated successfully.")

if __name__ == "__main__":
    setup_sample_images()
