"""
scripts/train_models.py
-----------------------
Reproducible training script for:
1. Gloriosa Crop Validator (Gloriosa superba vs. Non-Gloriosa)
2. Gloriosa Disease Classifier (Healthy vs. Leaf Blight)

Uses MobileNetV3-Small with ImageNet transfer learning, stratified train/val/test splits,
data augmentation, class weighting for imbalance, early stopping, and full test evaluation.
"""

import os
import sys
import json
import random
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support, accuracy_score
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Reproducibility
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using compute device: {DEVICE}")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(BASE_DIR, "dataset", "organized")
WEIGHTS_DIR = os.path.join(BASE_DIR, "backend", "app", "ai", "weights")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

os.makedirs(WEIGHTS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

# ImageNet normalization
NORM_MEAN = [0.485, 0.456, 0.406]
NORM_STD = [0.229, 0.224, 0.225]

train_transforms = transforms.Compose([
    transforms.Resize((240, 240)),
    transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15),
    transforms.ToTensor(),
    transforms.Normalize(mean=NORM_MEAN, std=NORM_STD)
])

eval_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=NORM_MEAN, std=NORM_STD)
])

def build_mobilenet_v3(num_classes):
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
    # Fine-tune the classifier head
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Sequential(
        nn.Dropout(p=0.2),
        nn.Linear(in_features, num_classes)
    )
    return model

def train_epoch(model, loader, criterion, optimizer):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    for images, labels in loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item() * images.size(0)
        _, preds = torch.max(outputs, 1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)
        
    return running_loss / total, correct / total

def eval_epoch(model, loader, criterion):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
            
    return running_loss / total, correct / total

def evaluate_test_set(model, test_loader, class_names):
    model.eval()
    all_preds = []
    all_labels = []
    all_probs = []
    
    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1)
            _, preds = torch.max(outputs, 1)
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
            all_probs.extend(probs.cpu().numpy())
            
    acc = accuracy_score(all_labels, all_preds)
    cm = confusion_matrix(all_labels, all_preds)
    report = classification_report(all_labels, all_preds, target_names=class_names, output_dict=True, zero_division=0)
    
    return {
        "accuracy": float(acc),
        "confusion_matrix": cm.tolist(),
        "classification_report": report,
        "labels": all_labels,
        "preds": all_preds,
        "probs": [p.tolist() for p in all_probs]
    }

def plot_confusion_matrix(cm, class_names, title, save_path):
    plt.figure(figsize=(6, 5))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Greens)
    plt.title(title, fontsize=12, pad=15)
    plt.colorbar()
    tick_marks = np.arange(len(class_names))
    plt.xticks(tick_marks, class_names, rotation=20)
    plt.yticks(tick_marks, class_names)
    
    thresh = np.array(cm).max() / 2.
    for i in range(len(class_names)):
        for j in range(len(class_names)):
            val = cm[i][j]
            plt.text(j, i, format(val, 'd'),
                     ha="center", va="center",
                     color="white" if val > thresh else "black",
                     fontsize=12, weight="bold")
                     
    plt.ylabel('True Class', fontsize=11)
    plt.xlabel('Predicted Class', fontsize=11)
    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"Saved confusion matrix plot: {save_path}")

# ============================================================
# 1. TRAIN CROP VALIDATOR
# ============================================================
def train_crop_validator(epochs=15, batch_size=8, lr=5e-4):
    print("\n" + "="*60)
    print("STEP 1: Training Gloriosa Crop Validation Model")
    print("="*60)
    
    crop_dir = os.path.join(DATA_DIR, "crop_validation")
    train_data = datasets.ImageFolder(os.path.join(crop_dir, "train"), transform=train_transforms)
    val_data = datasets.ImageFolder(os.path.join(crop_dir, "val"), transform=eval_transforms)
    test_data = datasets.ImageFolder(os.path.join(crop_dir, "test"), transform=eval_transforms)
    
    class_names = train_data.classes
    print(f"Classes: {class_names} -> {train_data.class_to_idx}")
    print(f"Train samples: {len(train_data)}, Val: {len(val_data)}, Test: {len(test_data)}")
    
    train_loader = DataLoader(train_data, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_data, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_data, batch_size=batch_size, shuffle=False)
    
    model = build_mobilenet_v3(num_classes=len(class_names)).to(DEVICE)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    
    best_val_loss = float("inf")
    best_model_path = os.path.join(WEIGHTS_DIR, "crop_validator.pt")
    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}
    
    for epoch in range(1, epochs + 1):
        tr_loss, tr_acc = train_epoch(model, train_loader, criterion, optimizer)
        va_loss, va_acc = eval_epoch(model, val_loader, criterion)
        scheduler.step()
        
        history["train_loss"].append(tr_loss)
        history["train_acc"].append(tr_acc)
        history["val_loss"].append(va_loss)
        history["val_acc"].append(va_acc)
        
        print(f"Epoch [{epoch:02d}/{epochs:02d}] Train Loss: {tr_loss:.4f} | Train Acc: {tr_acc*100:.1f}% | Val Loss: {va_loss:.4f} | Val Acc: {va_acc*100:.1f}%")
        
        if va_loss < best_val_loss:
            best_val_loss = va_loss
            torch.save({
                "model_state_dict": model.state_dict(),
                "class_to_idx": train_data.class_to_idx,
                "classes": class_names,
                "architecture": "mobilenet_v3_small",
                "val_loss": va_loss,
                "val_acc": va_acc,
                "epoch": epoch
            }, best_model_path)
            
    print(f"Best Crop Validator saved with Val Loss {best_val_loss:.4f} to: {best_model_path}")
    
    # Evaluate best model on test set
    checkpoint = torch.load(best_model_path, map_location=DEVICE, weights_only=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    test_results = evaluate_test_set(model, test_loader, class_names)
    
    print("\nCrop Validator Test Set Evaluation:")
    print(f"Accuracy: {test_results['accuracy']*100:.2f}%")
    print("Confusion Matrix:\n", np.array(test_results['confusion_matrix']))
    
    plot_path = os.path.join(REPORTS_DIR, "confusion_matrix_crop_validator.png")
    plot_confusion_matrix(test_results['confusion_matrix'], class_names, "Gloriosa Crop Validator Confusion Matrix", plot_path)
    
    return test_results, history

# ============================================================
# 2. TRAIN DISEASE CLASSIFIER
# ============================================================
def train_disease_classifier(epochs=20, batch_size=8, lr=3e-4):
    print("\n" + "="*60)
    print("STEP 2: Training Gloriosa Disease Classifier")
    print("="*60)
    
    dis_dir = os.path.join(DATA_DIR, "disease_detection")
    train_data = datasets.ImageFolder(os.path.join(dis_dir, "train"), transform=train_transforms)
    val_data = datasets.ImageFolder(os.path.join(dis_dir, "val"), transform=eval_transforms)
    test_data = datasets.ImageFolder(os.path.join(dis_dir, "test"), transform=eval_transforms)
    
    class_names = train_data.classes
    print(f"Classes: {class_names} -> {train_data.class_to_idx}")
    print(f"Train samples: {len(train_data)}, Val: {len(val_data)}, Test: {len(test_data)}")
    
    # Calculate class weights for imbalance (Healthy: 4, Leaf_Blight: 47)
    class_counts = [0] * len(class_names)
    for _, label in train_data.samples:
        class_counts[label] += 1
    total_samples = len(train_data)
    class_weights = [total_samples / (len(class_names) * count) for count in class_counts]
    weight_tensor = torch.tensor(class_weights, dtype=torch.float).to(DEVICE)
    print(f"Class counts in training: {class_counts}")
    print(f"Applied class weights to handle imbalance: {[round(w, 2) for w in class_weights]}")
    
    train_loader = DataLoader(train_data, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_data, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_data, batch_size=batch_size, shuffle=False)
    
    model = build_mobilenet_v3(num_classes=len(class_names)).to(DEVICE)
    criterion = nn.CrossEntropyLoss(weight=weight_tensor)
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    
    best_val_loss = float("inf")
    best_model_path = os.path.join(WEIGHTS_DIR, "disease_classifier.pt")
    history = {"train_loss": [], "train_acc": [], "val_loss": [], "val_acc": []}
    
    for epoch in range(1, epochs + 1):
        tr_loss, tr_acc = train_epoch(model, train_loader, criterion, optimizer)
        va_loss, va_acc = eval_epoch(model, val_loader, criterion)
        scheduler.step()
        
        history["train_loss"].append(tr_loss)
        history["train_acc"].append(tr_acc)
        history["val_loss"].append(va_loss)
        history["val_acc"].append(va_acc)
        
        print(f"Epoch [{epoch:02d}/{epochs:02d}] Train Loss: {tr_loss:.4f} | Train Acc: {tr_acc*100:.1f}% | Val Loss: {va_loss:.4f} | Val Acc: {va_acc*100:.1f}%")
        
        if va_loss < best_val_loss:
            best_val_loss = va_loss
            torch.save({
                "model_state_dict": model.state_dict(),
                "class_to_idx": train_data.class_to_idx,
                "classes": class_names,
                "architecture": "mobilenet_v3_small",
                "val_loss": va_loss,
                "val_acc": va_acc,
                "epoch": epoch
            }, best_model_path)
            
    print(f"Best Disease Classifier saved with Val Loss {best_val_loss:.4f} to: {best_model_path}")
    
    # Evaluate best model on test set
    checkpoint = torch.load(best_model_path, map_location=DEVICE, weights_only=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    test_results = evaluate_test_set(model, test_loader, class_names)
    
    print("\nDisease Classifier Test Set Evaluation:")
    print(f"Accuracy: {test_results['accuracy']*100:.2f}%")
    print("Confusion Matrix:\n", np.array(test_results['confusion_matrix']))
    
    plot_path = os.path.join(REPORTS_DIR, "confusion_matrix_disease_classifier.png")
    plot_confusion_matrix(test_results['confusion_matrix'], class_names, "Gloriosa Disease Classifier Confusion Matrix", plot_path)
    
    return test_results, history

if __name__ == "__main__":
    crop_test, crop_hist = train_crop_validator(epochs=12, batch_size=8)
    dis_test, dis_hist = train_disease_classifier(epochs=15, batch_size=8)
    
    # Save combined evaluation metrics report
    eval_report = {
        "crop_validator": {
            "test_accuracy": crop_test["accuracy"],
            "confusion_matrix": crop_test["confusion_matrix"],
            "classification_report": crop_test["classification_report"],
            "history": crop_hist,
        },
        "disease_classifier": {
            "test_accuracy": dis_test["accuracy"],
            "confusion_matrix": dis_test["confusion_matrix"],
            "classification_report": dis_test["classification_report"],
            "history": dis_hist,
        },
        "model_architecture": "MobileNetV3-Small (Transfer Learning)",
        "input_resolution": "224x224",
        "normalization": {"mean": NORM_MEAN, "std": NORM_STD},
        "device": str(DEVICE)
    }
    
    report_json = os.path.join(REPORTS_DIR, "model_evaluation_report.json")
    with open(report_json, "w") as f:
        json.dump(eval_report, f, indent=2)
    print(f"\nSaved full model evaluation report to: {report_json}")
    
    # Also save model_metadata.json into backend/app/ai/weights
    meta_json = os.path.join(WEIGHTS_DIR, "model_metadata.json")
    with open(meta_json, "w") as f:
        json.dump({
            "crop_validator_classes": ["gloriosa_superba", "non_gloriosa"],
            "disease_classifier_classes": ["Healthy", "Leaf_Blight"],
            "input_size": [224, 224],
            "norm_mean": NORM_MEAN,
            "norm_std": NORM_STD,
            "crop_validator_test_accuracy": crop_test["accuracy"],
            "disease_classifier_test_accuracy": dis_test["accuracy"]
        }, f, indent=2)
    print(f"Saved metadata to: {meta_json}")
