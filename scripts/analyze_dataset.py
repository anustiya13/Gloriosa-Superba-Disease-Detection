import os
import cv2
import numpy as np
import json
from collections import Counter

def analyze_all_images(folder):
    files = sorted([f for f in os.listdir(folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    records = []
    
    for f in files:
        path = os.path.join(folder, f)
        img = cv2.imread(path)
        if img is None:
            continue
        h, w = img.shape[:2]
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        # Leaf foliage segmentation mask
        # Green to yellowish-green range
        plant_mask = cv2.inRange(hsv, (25, 30, 30), (95, 255, 255))
        
        # Morphological cleanup
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        plant_mask = cv2.morphologyEx(plant_mask, cv2.MORPH_CLOSE, kernel)
        plant_mask = cv2.morphologyEx(plant_mask, cv2.MORPH_OPEN, kernel)
        
        plant_px = np.count_nonzero(plant_mask)
        if plant_px == 0:
            plant_px = 1
            
        # Healthy green: H in [38, 88], S >= 45, V >= 35
        healthy_green_mask = cv2.inRange(hsv, (38, 45, 35), (88, 255, 255))
        healthy_in_plant = cv2.bitwise_and(healthy_green_mask, healthy_green_mask, mask=plant_mask)
        
        # Chlorosis / yellow leaf discolouration: H in [18, 37], S >= 45, V >= 50
        yellow_mask = cv2.inRange(hsv, (18, 45, 50), (37, 255, 255))
        yellow_in_plant = cv2.bitwise_and(yellow_mask, yellow_mask, mask=plant_mask)
        
        # Necrotic / blight / leaf spot brown lesions: H in [8, 20], S in [40, 210], V in [25, 175]
        brown_mask = cv2.inRange(hsv, (8, 40, 25), (20, 210, 175))
        brown_in_plant = cv2.bitwise_and(brown_mask, brown_mask, mask=plant_mask)
        
        healthy_px = np.count_nonzero(healthy_in_plant)
        yellow_px = np.count_nonzero(yellow_in_plant)
        brown_px = np.count_nonzero(brown_in_plant)
        
        # Affected lesion ratio within plant foliage
        lesion_px = yellow_px + brown_px
        lesion_pct = (lesion_px / plant_px) * 100
        healthy_pct = (healthy_px / plant_px) * 100
        
        # Determine visual condition according to Team LUNAR research criteria:
        # Healthy: lesion < 5%
        # Mild: 5% <= lesion < 18%
        # Moderate: 18% <= lesion < 38%
        # Severe: lesion >= 38%
        if lesion_pct < 5.0:
            assigned_severity = "Healthy"
            assigned_condition = "Healthy"
        elif lesion_pct < 18.0:
            assigned_severity = "Mild"
            assigned_condition = "Leaf Blight / Spot"
        elif lesion_pct < 38.0:
            assigned_severity = "Moderate"
            assigned_condition = "Leaf Blight / Spot"
        else:
            assigned_severity = "Severe"
            assigned_condition = "Leaf Blight / Spot"
            
        records.append({
            "filename": f,
            "width": w,
            "height": h,
            "plant_coverage_pct": round((plant_px / (h * w)) * 100, 2),
            "healthy_leaf_pct": round(healthy_pct, 2),
            "yellow_chlorosis_pct": round((yellow_px / plant_px) * 100, 2),
            "brown_lesion_pct": round((brown_px / plant_px) * 100, 2),
            "affected_area_pct": round(lesion_pct, 2),
            "assigned_condition": assigned_condition,
            "assigned_severity": assigned_severity,
        })
        
    return records

if __name__ == "__main__":
    dataset_dir = r"c:\Users\anust\OneDrive\Desktop\MINIPROJECT_\dataset\raw_collected_images"
    records = analyze_all_images(dataset_dir)
    print(f"Total processed images: {len(records)}")
    
    severity_counts = Counter(r["assigned_severity"] for r in records)
    condition_counts = Counter(r["assigned_condition"] for r in records)
    
    print("\nCondition Distribution:")
    for k, v in condition_counts.items():
        print(f"  {k}: {v} images ({v/len(records)*100:.1f}%)")
        
    print("\nSeverity Distribution:")
    for k, v in severity_counts.items():
        print(f"  {k}: {v} images ({v/len(records)*100:.1f}%)")
        
    # Save detailed JSON summary
    out_json = r"c:\Users\anust\OneDrive\Desktop\MINIPROJECT_\dataset\image_analysis_summary.json"
    with open(out_json, "w") as f:
        json.dump(records, f, indent=2)
    print(f"\nDetailed metrics saved to: {out_json}")
