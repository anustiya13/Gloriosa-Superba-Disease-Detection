"""
scripts/prepare_dataset.py
--------------------------
Organizes raw images into reproducible, stratified Train / Val / Test sets (70% / 15% / 15%).
Preserves all original raw images untouched.
Outputs detailed dataset manifest and summary JSON.
"""

import os
import shutil
import json
import random
import cv2
import numpy as np

SEED = 42
random.seed(SEED)
np.random.seed(SEED)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RAW_GLORIOSA = os.path.join(BASE_DIR, "dataset", "raw_collected_images")
RAW_NON_GLORIOSA = os.path.join(BASE_DIR, "dataset", "non_gloriosa")
SUMMARY_JSON = os.path.join(BASE_DIR, "dataset", "image_analysis_summary.json")
ORGANIZED_DIR = os.path.join(BASE_DIR, "dataset", "organized")

def create_splits(items, train_ratio=0.70, val_ratio=0.15):
    shuffled = list(items)
    random.shuffle(shuffled)
    n = len(shuffled)
    n_train = int(n * train_ratio)
    n_val = int(n * val_ratio)
    train_set = shuffled[:n_train]
    val_set = shuffled[n_train:n_train + n_val]
    test_set = shuffled[n_train + n_val:]
    return train_set, val_set, test_set

def prepare_crop_validation_dataset():
    crop_dir = os.path.join(ORGANIZED_DIR, "crop_validation")
    if os.path.exists(crop_dir):
        shutil.rmtree(crop_dir)
        
    gloriosa_files = sorted([f for f in os.listdir(RAW_GLORIOSA) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    non_gloriosa_files = sorted([f for f in os.listdir(RAW_NON_GLORIOSA) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    
    g_train, g_val, g_test = create_splits(gloriosa_files)
    ng_train, ng_val, ng_test = create_splits(non_gloriosa_files)
    
    splits = {
        "train": {"gloriosa_superba": (RAW_GLORIOSA, g_train), "non_gloriosa": (RAW_NON_GLORIOSA, ng_train)},
        "val": {"gloriosa_superba": (RAW_GLORIOSA, g_val), "non_gloriosa": (RAW_NON_GLORIOSA, ng_val)},
        "test": {"gloriosa_superba": (RAW_GLORIOSA, g_test), "non_gloriosa": (RAW_NON_GLORIOSA, ng_test)},
    }
    
    summary = {}
    for split_name, class_dict in splits.items():
        summary[split_name] = {}
        for cls_name, (src_dir, files) in class_dict.items():
            dest = os.path.join(crop_dir, split_name, cls_name)
            os.makedirs(dest, exist_ok=True)
            for f in files:
                shutil.copy2(os.path.join(src_dir, f), os.path.join(dest, f))
            summary[split_name][cls_name] = len(files)
            
    return summary

def prepare_disease_dataset():
    disease_dir = os.path.join(ORGANIZED_DIR, "disease_detection")
    if os.path.exists(disease_dir):
        shutil.rmtree(disease_dir)
        
    with open(SUMMARY_JSON, "r") as f:
        metadata = json.load(f)
        
    healthy_files = [m["filename"] for m in metadata if m["assigned_severity"] == "Healthy"]
    blight_files = [m["filename"] for m in metadata if m["assigned_severity"] != "Healthy"]
    
    # Ensure at least 1 sample in validation and test for healthy class
    h_shuffled = list(healthy_files)
    random.shuffle(h_shuffled)
    h_train, h_val, h_test = h_shuffled[:4], h_shuffled[4:5], h_shuffled[5:]
    
    b_train, b_val, b_test = create_splits(blight_files)
    
    splits = {
        "train": {"Healthy": h_train, "Leaf_Blight": b_train},
        "val": {"Healthy": h_val, "Leaf_Blight": b_val},
        "test": {"Healthy": h_test, "Leaf_Blight": b_test},
    }
    
    summary = {}
    for split_name, class_dict in splits.items():
        summary[split_name] = {}
        for cls_name, files in class_dict.items():
            dest = os.path.join(disease_dir, split_name, cls_name)
            os.makedirs(dest, exist_ok=True)
            for f in files:
                shutil.copy2(os.path.join(RAW_GLORIOSA, f), os.path.join(dest, f))
            summary[split_name][cls_name] = len(files)
            
    # Also create a severity subfolder structure for severity analysis/testing
    sev_dir = os.path.join(ORGANIZED_DIR, "severity_benchmarks")
    for sev in ["Healthy", "Mild", "Moderate", "Severe"]:
        dest = os.path.join(sev_dir, sev)
        os.makedirs(dest, exist_ok=True)
        sev_files = [m["filename"] for m in metadata if m["assigned_severity"] == sev]
        for f in sev_files:
            shutil.copy2(os.path.join(RAW_GLORIOSA, f), os.path.join(dest, f))
            
    return summary

if __name__ == "__main__":
    print("Preparing Crop Validation Dataset Splits...")
    crop_summary = prepare_crop_validation_dataset()
    print("Crop Validation Splits:", json.dumps(crop_summary, indent=2))
    
    print("\nPreparing Disease Detection Dataset Splits...")
    disease_summary = prepare_disease_dataset()
    print("Disease Detection Splits:", json.dumps(disease_summary, indent=2))
    
    full_manifest = {
        "crop_validation": crop_summary,
        "disease_detection": disease_summary,
        "split_ratios": {"train": 0.70, "val": 0.15, "test": 0.15},
        "random_seed": SEED,
    }
    manifest_path = os.path.join(ORGANIZED_DIR, "dataset_manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(full_manifest, f, indent=2)
    print(f"\nSaved dataset manifest to {manifest_path}")
