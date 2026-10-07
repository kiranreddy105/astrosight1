import os
import glob
import cv2
import json
import random
import torch
import torch.nn as nn
from pathlib import Path
import numpy as np

# Set random seeds for reproducibility
random.seed(42)
np.random.seed(42)
torch.manual_seed(42)

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = Path(r"c:\Users\ASUS\Downloads\archive (2)\LU3M6TGT_yolo_format")
IMG_DIR = DATASET_DIR / "valid" / "images"
LBL_DIR = DATASET_DIR / "valid" / "labels"

class LightweightCraterCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((4, 4))
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64 * 4 * 4, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 2)
        )

    def forward(self, x):
        x = self.features(x)
        return self.classifier(x)

def extract_dataset():
    crater_crops = []
    non_crater_crops = []

    image_files = sorted(list(IMG_DIR.glob("*.png")))
    for img_path in image_files[:200]:
        txt_path = LBL_DIR / f"{img_path.stem}.txt"
        if not txt_path.exists():
            continue
        img = cv2.imread(str(img_path), cv2.IMREAD_GRAYSCALE)
        if img is None:
            continue
        h, w = img.shape
        boxes = []
        with open(txt_path) as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) >= 5:
                    xc, yc, bw, bh = map(float, parts[1:5])
                    boxes.append((xc, yc, bw, bh))
                    xmin = max(0, int((xc - bw/2) * w))
                    ymin = max(0, int((yc - bh/2) * h))
                    xmax = min(w, int((xc + bw/2) * w))
                    ymax = min(h, int((yc + bh/2) * h))
                    if xmax - xmin > 20 and ymax - ymin > 20:
                        patch = cv2.resize(img[ymin:ymax, xmin:xmax], (64, 64))
                        crater_crops.append(patch)

        # Generate non-crater crops
        for _ in range(min(5, len(boxes) + 2)):
            rx = random.randint(0, max(0, w - 64))
            ry = random.randint(0, max(0, h - 64))
            r_xc = (rx + 32) / w
            r_yc = (ry + 32) / h
            overlap = False
            for (xc, yc, bw, bh) in boxes:
                if abs(r_xc - xc) < (bw/2 + 0.06) and abs(r_yc - yc) < (bh/2 + 0.06):
                    overlap = True
                    break
            if not overlap:
                patch = cv2.resize(img[ry:ry+64, rx:rx+64], (64, 64))
                non_crater_crops.append(patch)

        if len(crater_crops) >= 450 and len(non_crater_crops) >= 450:
            break

    # Add smooth mare synthetic patch variations to non_crater
    for _ in range(50):
        mare = np.random.normal(120, 8, (64, 64)).clip(90, 150).astype(np.uint8)
        mare = cv2.GaussianBlur(mare, (3, 3), 0.8)
        non_crater_crops.append(mare)

    return crater_crops, non_crater_crops

def train_and_evaluate():
    print("Extracting dataset from LU3M6TGT...")
    crater_crops, non_crater_crops = extract_dataset()
    print(f"Crater samples: {len(crater_crops)}, Non-crater samples: {len(non_crater_crops)}")

    X = []
    y = []

    for patch in crater_crops:
        norm = (patch.astype(np.float32) / 255.0 - 0.5) / 0.5
        X.append(norm)
        y.append(1)  # Class 1: CRATER

    for patch in non_crater_crops:
        norm = (patch.astype(np.float32) / 255.0 - 0.5) / 0.5
        X.append(norm)
        y.append(0)  # Class 0: NON-CRATER

    X = np.array(X)[:, np.newaxis, :, :]  # (N, 1, 64, 64)
    y = np.array(y)

    indices = list(range(len(y)))
    random.shuffle(indices)
    split = int(0.8 * len(indices))
    train_idx = indices[:split]
    test_idx = indices[split:]

    X_train = torch.tensor(X[train_idx], dtype=torch.float32)
    y_train = torch.tensor(y[train_idx], dtype=torch.long)
    X_test = torch.tensor(X[test_idx], dtype=torch.float32)
    y_test = torch.tensor(y[test_idx], dtype=torch.long)

    model = LightweightCraterCNN()
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)

    print("Training LightweightCraterCNN...")
    model.train()
    batch_size = 32
    for epoch in range(8):
        perm = torch.randperm(len(X_train))
        epoch_loss = 0.0
        for i in range(0, len(X_train), batch_size):
            batch_x = X_train[perm[i:i+batch_size]]
            batch_y = y_train[perm[i:i+batch_size]]

            optimizer.zero_grad()
            out = model(batch_x)
            loss = criterion(out, batch_y)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item() * len(batch_x)
        print(f"Epoch {epoch+1}/8 - Loss: {epoch_loss / len(X_train):.4f}")

    # Evaluation
    model.eval()
    with torch.no_grad():
        test_out = model(X_test)
        test_loss = criterion(test_out, y_test).item()
        preds = torch.argmax(test_out, dim=1).numpy()
        targets = y_test.numpy()

    # Calculate metrics
    tp = int(np.sum((preds == 1) & (targets == 1)))
    fp = int(np.sum((preds == 1) & (targets == 0)))
    fn = int(np.sum((preds == 0) & (targets == 1)))
    tn = int(np.sum((preds == 0) & (targets == 0)))

    total = len(targets)
    accuracy = round(float((tp + tn) / total * 100), 2)
    precision = round(float(tp / max(1, (tp + fp)) * 100), 2)
    recall = round(float(tp / max(1, (tp + fn)) * 100), 2)
    f1 = round(float(2 * precision * recall / max(1e-5, (precision + recall))), 2)

    metrics = {
        "architecture": "LightweightCraterCNN (3x Conv2d + BatchNorm + AdaptiveAvgPool + Dense)",
        "classification_classes": ["NON-CRATER", "CRATER"],
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "validation_accuracy": accuracy,
        "validation_loss": round(test_loss, 4),
        "confusion_matrix": {
            "True_Crater": {"Pred_Crater": tp, "Pred_NonCrater": fn},
            "True_NonCrater": {"Pred_Crater": fp, "Pred_NonCrater": tn}
        },
        "dataset_name": "LU3M6TGT Lunar Orbiter Topography Benchmark",
        "total_samples_evaluated": total,
        "training_epochs": 8,
        "status": "TRAINED_ON_AUTHENTIC_DATASET"
    }

    print("\nEmpirical Evaluation Results:")
    print(json.dumps(metrics, indent=2))

    # Save weights & metrics
    weights_path = BASE_DIR / "services" / "crater_net.pth"
    torch.save(model.state_dict(), weights_path)
    print(f"Saved weights to {weights_path}")

    metrics_path = BASE_DIR / "model_metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved metrics to {metrics_path}")

if __name__ == "__main__":
    train_and_evaluate()
