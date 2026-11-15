# Clinical Skin Assessment Datasets Guide

This document explains how to acquire, preprocess, and train the **AcneGuard AI** ResNet-18 model using large-scale, peer-reviewed clinical dermatology datasets.

---

## 1. Top Clinical Datasets for Acne Severity & Skin Lesions

### A. ACNE04 Dataset (Gold Standard for Acne Classification)
- **Source**: Developed by National Engineering Laboratory for Video Technology & Peking University First Hospital.
- **Size**: 1,457 high-resolution facial images annotated by certified dermatologists.
- **Labels**: 4 Hayashi severity levels:
  - Level 0 (Mild)
  - Level 1 (Moderate)
  - Level 2 (Severe)
  - Level 3 (Very Severe)
- **Mapping to AcneGuard**:
  - `Level 0` ➔ `Mild`
  - `Level 1` ➔ `Moderate`
  - `Level 2 / 3` ➔ `Severe`
  - Healthy control images ➔ `Clear`

### B. Fitzpatrick 17k Dataset
- **Description**: 16,577 clinical dermatology images labeled with condition and Fitzpatrick skin type (I to VI) to evaluate fairness and prevent model bias across varied complexions.
- **Access**: Available on GitHub: `https://github.com/mattgroh/fitzpatrick17k`

### C. Kaggle Acne / Skin Condition Benchmarks
- **Kaggle Acne Grading Dataset**: ~2,000+ labeled facial images.
- **DermNet NZ Atlas**: 23,000+ clinical dermatological conditions.

---

## 2. Ingesting Your Real Dataset into AcneGuard

The training pipeline uses the standard PyTorch `ImageFolder` structure:

```text
backend/data/
├── train/
│   ├── Clear/        <-- High-resolution clear skin portraits
│   ├── Mild/         <-- Comedones, isolated non-inflammatory blemishes
│   ├── Moderate/     <-- Multiple papules, superficial pustules
│   └── Severe/       <-- Nodules, cystic inflammation, deep erythema
└── val/
    ├── Clear/
    ├── Mild/
    ├── Moderate/
    └── Severe/
```

### Steps to Ingest:
1. Place 80% of your images in `backend/data/train/<Category>/`.
2. Place 20% of your images in `backend/data/val/<Category>/`.
3. Launch the training script:
   ```cmd
   python app/ml/train.py --data-dir data --epochs 30 --batch-size 32 --lr 0.0005
   ```

---

## 3. Training Architecture Highlights

- **Backbone**: Pretrained `ResNet-18` (ImageNet transfer learning).
- **Data Augmentation**:
  - `RandomHorizontalFlip` (p=0.5)
  - `RandomRotation` (±15°)
  - `ColorJitter` (brightness, contrast, saturation shifts to simulate camera differences)
  - `RandomResizedCrop(224)`
- **Class Imbalance Handling**: Automatically calculates inverse-frequency class weights so under-represented severe clinical cases are not overlooked.
- **Output Weights**: Saved directly to `backend/app/ml/weights/acne_resnet18.pth`. The FastAPI backend auto-detects this file and switches from heuristic fallback to full PyTorch neural inference.
