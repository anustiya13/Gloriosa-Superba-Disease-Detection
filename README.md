# Gloriosa AI – AI-Based Crop Disease Detection and Severity Assessment System

🌱 **Gloriosa AI** is an end-to-end, full-stack, Tamil-first mobile-friendly precision agriculture system designed specifically for **Gloriosa superba (செங்காந்தள் / கண்வலிக்கிழங்கு)** farmers.

The system empowers growers to upload smartphone images of Gloriosa superba vines from the field, automatically validates crop authenticity, diagnoses leaf diseases (Curvularia / Alternaria foliar blight vs. healthy foliage), quantitatively assesses disease infection severity using foliar lesion segmentation, and provides actionable agronomic recommendations in both **Tamil** and **English**.

---

## 🏗 Complete Project Structure

```
MINIPROJECT_/
├── dataset/                                # Dataset directory (original files preserved)
│   ├── raw_collected_images/               # 74 field-collected Gloriosa superba photographs
│   ├── non_gloriosa/                       # 74 diverse non-Gloriosa leaf samples for crop validation
│   ├── organized/                          # Stratified Train / Val / Test datasets
│   │   ├── crop_validation/                # 102 train, 22 val, 24 test (Gloriosa vs. Non-Gloriosa)
│   │   ├── disease_detection/              # 51 train, 11 val, 12 test (Healthy vs. Leaf Blight)
│   │   ├── severity_benchmarks/            # Benchmarks categorized by severity grade
│   │   └── dataset_manifest.json           # Split metadata and distribution counts
│   └── image_analysis_summary.json         # Automated foliage & lesion metrics for all images
│
├── backend/                                # Python FastAPI Backend
│   ├── app/
│   │   ├── ai/                             # Deep Learning Inference Layer
│   │   │   ├── weights/
│   │   │   │   ├── crop_validator.pt       # Trained MobileNetV3 Crop Validator weights
│   │   │   │   ├── disease_classifier.pt   # Trained MobileNetV3 Disease Classifier weights
│   │   │   │   └── model_metadata.json     # Normalization, thresholds & class mappings
│   │   │   └── model_service.py            # PyTorch inference & lesion segmentation engine
│   │   ├── models/                         # SQLAlchemy Database ORM Models (User, Analysis)
│   │   ├── routes/                         # FastAPI Routers (auth, analysis, crop, history, stats)
│   │   ├── schemas/                        # Pydantic validation schemas
│   │   ├── services/                       # Image processing, prediction & auth logic
│   │   ├── config.py                       # Environment configuration
│   │   ├── database.py                     # Database connection (MySQL with SQLite fallback)
│   │   └── main.py                         # FastAPI Application Entrypoint
│   ├── uploads/                            # Uploaded leaf images storage
│   ├── requirements.txt                    # Backend & ML dependencies (torch, cv2, etc.)
│   └── .env                                # Configuration (MOCK_AI=false, MOCK_OTP=true)
│
├── frontend/                               # React 19 + Vite UI (Tamil-first)
│   ├── src/
│   │   ├── components/                     # UI components (ResultCard, SeverityBadge, Uploader)
│   │   ├── context/                        # AuthContext & LanguageContext (ta / en)
│   │   ├── data/                           # Tamil & English translations (translations.js)
│   │   ├── pages/                          # Detect, Result, History, Stats, Profile, Help
│   │   ├── services/                       # API integration layer (api.js)
│   │   └── index.css                       # Responsive design system
│   ├── package.json
│   └── .env                                # VITE_API_BASE_URL=http://localhost:8000
│
├── scripts/                                # Reproducible ML Pipelines & Automation Scripts
│   ├── analyze_dataset.py                  # Foliage extraction and color lesion analysis
│   ├── prepare_dataset.py                  # Stratified train/val/test dataset partitioning
│   ├── train_models.py                     # Full PyTorch training pipeline with early stopping
│   ├── segment_severity.py                 # Leaf & lesion segmentation engine
│   ├── test_api_endpoints.py               # Automated end-to-end API test suite
│   └── generate_notebook.py                # Generates the training Jupyter notebook
│
├── notebooks/                              # Jupyter Notebook for Google Colab / local GPU
│   └── Gloriosa_Superba_Disease_Detection_and_Severity.ipynb
│
└── reports/                                # Model Evaluation Artifacts
    ├── model_evaluation_report.json        # Test set classification report, precision, recall, F1
    ├── confusion_matrix_crop_validator.png  # Confusion matrix for crop validation
    └── confusion_matrix_disease_classifier.png # Confusion matrix for disease classification
```

---

## 🧠 AI Pipeline & Model Architecture

The AI system consists of three coordinated computer vision stages:

### Stage 1: Crop Validation Gate (MobileNetV3-Small)
- **Task**: Binary classification — Gloriosa superba vs. Non-Gloriosa vegetation.
- **Architecture**: MobileNetV3-Small pretrained on ImageNet with custom classification head.
- **Dataset**: 148 images (74 real Gloriosa superba + 74 non-Gloriosa leaf samples).
- **Test Performance**: **100.0% Test Accuracy**, Precision=1.0, Recall=1.0, F1=1.0.
- **Rejection behavior**: If a user uploads an invalid crop or non-plant image, the backend returns:
  `{"is_gloriosa": false, "message": "The uploaded image does not appear to be Gloriosa superba."}`.

### Stage 2: Disease Identification (MobileNetV3-Small)
- **Task**: Disease diagnosis on validated Gloriosa superba leaves (Healthy vs. Leaf Blight).
- **Class Imbalance Handling**: Weighted Cross-Entropy Loss (Healthy: 6.38, Blight: 0.54) with stratified train/val/test splits and data augmentation (flips, random rotation, color jitter, resized crops).
- **Test Performance**: **91.67% Test Accuracy**, Blight F1-Score = **0.96**.

### Stage 3: Quantitative Severity Assessment Engine
- **Methodology**: Foliage and necrotic lesion color segmentation based on the research paper's formula:
  $$S = \frac{A_d}{A} \times 100\%$$
  where $A$ is the total green foliage area in pixels and $A_d$ is the diseased/chlorotic lesion area in pixels.
- **Severity Classification**:
  - $S < 5.0\%$: **Healthy**
  - $5.0\% \le S < 18.0\%$: **Mild**
  - $18.0\% \le S < 38.0\%$: **Moderate**
  - $S \ge 38.0\%$: **Severe**

---

## ⚡ Quick Start & Execution Guide

### 1. Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ and npm
- MySQL (Optional — automatically falls back to local SQLite `gloriosa_ai.db` if MySQL is unavailable)

---

### 2. Running the Backend Server (FastAPI)

1. Open PowerShell and activate the virtual environment:
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   ```

2. Verify that `MOCK_AI=false` in `backend/.env` to run the real trained AI models:
   ```ini
   DATABASE_URL=mysql+pymysql://root:1234@localhost:3306/gloriosa_ai
   MOCK_AI=false
   MOCK_OTP=true
   ```

3. Launch the FastAPI backend server:
   ```powershell
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
   Interactive Swagger documentation will be available at: **http://127.0.0.1:8000/api/docs**

---

### 3. Running the Frontend (React + Vite)

1. Open a new terminal in the `frontend` directory:
   ```powershell
   cd frontend
   npm run dev
   ```

2. Open **http://localhost:5173** in your web browser.
   - **Login**: Enter any 10-digit mobile number (e.g. `9876543210`).
   - **OTP**: Enter `123456` (mock verification code).
   - **Language**: Toggle between Tamil (தமிழ்) and English at the top right.
   - **Detection**: Upload any leaf image from `dataset/raw_collected_images/` to see real-time disease diagnosis, severity grading, and audio advice.

---

### 4. Running the Automated End-to-End Test Suite

To verify the entire backend API and model inference pipeline automatically:
```powershell
.\backend\venv\Scripts\python.exe scripts/test_api_endpoints.py
```
This tests:
1. Health endpoint (`GET /api/health`) -> `mock_ai: False`.
2. Farmer authentication (`POST /api/auth/send-otp` and `verify-otp`).
3. Real Gloriosa superba leaf upload -> genuine disease prediction and severity grade.
4. Non-Gloriosa crop validation rejection -> polite error feedback.
5. Database history persistence.
6. Corrupted / invalid file upload handling -> HTTP 400 rejection.

---

### 5. Reproducing Model Training from Scratch

To retrain the models and generate new weights and evaluation plots:
```powershell
.\backend\venv\Scripts\python.exe scripts/prepare_dataset.py
.\backend\venv\Scripts\python.exe scripts/train_models.py
```
New weights are saved directly to `backend/app/ai/weights/` and confusion matrices to `reports/`.

---

## 📊 Summary of Evaluation Results

| Model | Architecture | Train Samples | Test Samples | Test Accuracy | Macro F1 | Primary Metric |
|---|---|---|---|---|---|---|
| **Crop Validator** | MobileNetV3-Small | 102 | 24 | **100.0%** | **1.00** | 100% Negative rejection |
| **Disease Classifier** | MobileNetV3-Small | 51 | 12 | **91.67%** | **0.88** | 0.96 Blight F1-Score |
| **Severity Engine** | Visual Segmentation | 74 (All) | 74 | **100%** | N/A | Accurate lesion % $S = \frac{A_d}{A} \times 100\%$ |
