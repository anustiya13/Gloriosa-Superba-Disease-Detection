"""
scripts/segment_severity.py
---------------------------
Foliage and lesion segmentation engine for Gloriosa superba.
Implements the paper's severity calculation:
  S = (Ad / A) * 100%
where:
  A  = Total leaf area (px)
  Ad = Diseased / affected area (px)
Severity grades:
  - Healthy  : S < 5%
  - Mild     : 5% <= S < 18%
  - Moderate : 18% <= S < 38%
  - Severe   : S >= 38%
"""

import os
import cv2
import numpy as np

def analyze_leaf_severity(image_path: str, save_overlay_path: str = None) -> dict:
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image at {image_path}")
        
    h, w = img.shape[:2]
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # 1. Segment leaf foliage (Green and yellowish-green leaves)
    # H in [25, 95], S >= 30, V >= 30
    plant_mask = cv2.inRange(hsv, (25, 30, 30), (95, 255, 255))
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    plant_mask = cv2.morphologyEx(plant_mask, cv2.MORPH_CLOSE, kernel)
    plant_mask = cv2.morphologyEx(plant_mask, cv2.MORPH_OPEN, kernel)
    
    plant_area = int(np.count_nonzero(plant_mask))
    if plant_area == 0:
        # Fallback if leaf mask empty: consider central 60% of image
        plant_area = int(h * w * 0.5)
        plant_mask = np.ones((h, w), dtype=np.uint8) * 255
        
    # 2. Chlorosis / yellow discoloration: H in [18, 37], S >= 45, V >= 50
    yellow_mask = cv2.inRange(hsv, (18, 45, 50), (37, 255, 255))
    yellow_in_leaf = cv2.bitwise_and(yellow_mask, yellow_mask, mask=plant_mask)
    
    # 3. Necrotic / blight brown lesions: H in [8, 20], S in [40, 210], V in [25, 175]
    brown_mask = cv2.inRange(hsv, (8, 40, 25), (20, 210, 175))
    brown_in_leaf = cv2.bitwise_and(brown_mask, brown_mask, mask=plant_mask)
    
    # Combined lesion mask (Ad)
    lesion_mask = cv2.bitwise_or(yellow_in_leaf, brown_in_leaf)
    lesion_area = int(np.count_nonzero(lesion_mask))
    
    # Severity index S = (Ad / A) * 100%
    severity_pct = round((lesion_area / plant_area) * 100.0, 2)
    
    if severity_pct < 5.0:
        severity_grade = "Healthy"
    elif severity_pct < 18.0:
        severity_grade = "Mild"
    elif severity_pct < 38.0:
        severity_grade = "Moderate"
    else:
        severity_grade = "Severe"
        
    # Optional overlay generation for visual explainability
    if save_overlay_path:
        overlay = img.copy()
        # Red highlight for necrotic/blight lesions
        overlay[lesion_mask > 0] = [0, 0, 255]
        blended = cv2.addWeighted(img, 0.7, overlay, 0.3, 0)
        cv2.imwrite(save_overlay_path, blended)
        
    return {
        "total_leaf_area_px": plant_area,
        "affected_leaf_area_px": lesion_area,
        "severity_percentage": severity_pct,
        "severity_grade": severity_grade
    }

if __name__ == "__main__":
    test_img = r"c:\Users\anust\OneDrive\Desktop\MINIPROJECT_\dataset\raw_collected_images\WhatsApp Image 2026-10-13 at 3.04.46 PM (1).jpeg"
    res = analyze_leaf_severity(test_img)
    print("Sample Severity Result on Diseased Plant:")
    print(res)
