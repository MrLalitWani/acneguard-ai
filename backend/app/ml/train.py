"""
AcneGuard AI - Clinical ResNet-18 Model Training Pipeline
Trains a deep convolutional neural network on clinical skin assessment images
classified across 4 severity tiers: Clear, Mild, Moderate, Severe.
"""

import os
import sys
import time
import argparse
import copy
from typing import Tuple, Dict

import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim import lr_scheduler
from torch.utils.data import DataLoader, WeightedRandomSampler
import torchvision
from torchvision import datasets, models, transforms
import numpy as np

# Class labels
CLASSES = ["Clear", "Mild", "Moderate", "Severe"]


def get_model(num_classes: int = 4, pretrained: bool = True) -> nn.Module:
    """
    Builds ResNet-18 with ImageNet transfer learning backbone.
    """
    print(f"[*] Initializing ResNet-18 (Pretrained on ImageNet: {pretrained})...")
    try:
        # Modern torchvision weights API
        weights = models.ResNet18_Weights.DEFAULT if pretrained else None
        model = models.resnet18(weights=weights)
    except Exception:
        # Fallback for older torchvision
        model = models.resnet18(pretrained=pretrained)

    num_ftrs = model.fc.in_features
    # Clinical linear classification head (matches cnn_model.py)
    model.fc = nn.Linear(num_ftrs, num_classes)
    return model


def get_data_transforms() -> Dict[str, transforms.Compose]:
    """
    Clinical image augmentation transforms.
    Simulates variations in lighting, patient angle, and skin tones.
    """
    return {
        'train': transforms.Compose([
            transforms.Resize(256),
            transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(degrees=15),
            transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.1, hue=0.03),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    }


def compute_class_weights(dataset: datasets.ImageFolder) -> torch.Tensor:
    """
    Computes inverse class frequency weights to handle clinical class imbalance.
    """
    targets = [sample[1] for sample in dataset.samples]
    class_counts = np.bincount(targets, minlength=len(dataset.classes))
    total_samples = len(targets)
    # Compute inverse frequency with smoothing
    weights = total_samples / (len(dataset.classes) * (class_counts + 1e-5))
    weights = torch.FloatTensor(weights)
    return weights


def train_model(
    data_dir: str,
    output_path: str,
    num_epochs: int = 25,
    batch_size: int = 16,
    learning_rate: float = 0.001,
    device_name: str = "auto"
):
    # Determine compute device
    if device_name == "auto":
        device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    else:
        device = torch.device(device_name)
    print(f"[*] Target Compute Device: {device} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() and device.type == 'cuda' else 'CPU'})")

    transforms_dict = get_data_transforms()

    train_dir = os.path.join(data_dir, 'train')
    val_dir = os.path.join(data_dir, 'val')

    if not os.path.exists(train_dir):
        raise FileNotFoundError(f"Training directory not found at: {train_dir}")
    if not os.path.exists(val_dir):
        raise FileNotFoundError(f"Validation directory not found at: {val_dir}")

    # Load datasets
    image_datasets = {
        'train': datasets.ImageFolder(train_dir, transforms_dict['train']),
        'val': datasets.ImageFolder(val_dir, transforms_dict['val'])
    }

    dataset_sizes = {x: len(image_datasets[x]) for x in ['train', 'val']}
    print(f"[*] Found {dataset_sizes['train']} training samples and {dataset_sizes['val']} validation samples.")
    print(f"[*] Classes detected: {image_datasets['train'].classes}")

    # Handle class imbalance with weighted loss
    class_weights = compute_class_weights(image_datasets['train']).to(device)
    print(f"[*] Calculated Clinical Class Weights: {class_weights.cpu().numpy().round(3)}")

    dataloaders = {
        'train': DataLoader(image_datasets['train'], batch_size=batch_size, shuffle=True, num_workers=0),
        'val': DataLoader(image_datasets['val'], batch_size=batch_size, shuffle=False, num_workers=0)
    }

    # Initialize model
    model = get_model(num_classes=len(CLASSES), pretrained=True)
    model = model.to(device)

    # Weighted Cross Entropy Loss for medical diagnostic safety
    criterion = nn.CrossEntropyLoss(weight=class_weights)

    # Optimizer with differential learning rates (lower for backbone, higher for head)
    backbone_params = [p for n, p in model.named_parameters() if not n.startswith('fc')]
    head_params = model.fc.parameters()

    optimizer = optim.AdamW([
        {'params': backbone_params, 'lr': learning_rate * 0.1},
        {'params': head_params, 'lr': learning_rate}
    ], weight_decay=1e-4)

    # Cosine annealing learning rate scheduler
    scheduler = lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs, eta_min=1e-6)

    since = time.time()
    best_model_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0
    best_loss = float('inf')

    print("\n" + "=" * 65)
    print("  BEGINNING CLINICAL RESNET-18 TRAINING & FINE-TUNING")
    print("=" * 65 + "\n")

    for epoch in range(num_epochs):
        print(f"Epoch {epoch + 1}/{num_epochs}")
        print("-" * 35)

        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0
            all_preds = []
            all_labels = []

            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())

            if phase == 'train':
                scheduler.step()

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]

            print(f"[{phase.upper():5s}] Loss: {epoch_loss:.4f} | Accuracy: {epoch_acc:.4f} ({running_corrects}/{dataset_sizes[phase]})")

            # Checkpoint best validation model
            if phase == 'val' and (epoch_acc > best_acc or (epoch_acc == best_acc and epoch_loss < best_loss)):
                best_acc = epoch_acc
                best_loss = epoch_loss
                best_model_wts = copy.deepcopy(model.state_dict())
                print(f"  >>> ⭐ New best validation checkpoint! (Acc: {best_acc:.4f}, Loss: {best_loss:.4f})")

        print()

    time_elapsed = time.time() - since
    print("=" * 65)
    print(f"Training completed in {time_elapsed // 60:.0f}m {time_elapsed % 60:.0f}s")
    print(f"Best Validation Accuracy: {best_acc:.4f}")
    print("=" * 65)

    # Save weights
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    model.load_state_dict(best_model_wts)

    # Extract state dict compatible with cnn_model.py
    # Re-structure state_dict to match simple fc format expected by AcneSeverityCNN
    torch.save(model.state_dict(), output_path)
    print(f"\n[SUCCESS] Model weights successfully exported to:\n -> {os.path.abspath(output_path)}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="AcneGuard Clinical AI Training")
    parser.add_argument('--data-dir', type=str, default=os.path.join(os.path.dirname(__file__), '..', '..', 'data'),
                        help="Path to dataset directory containing 'train' and 'val' folders")
    parser.add_argument('--output', type=str, default=os.path.join(os.path.dirname(__file__), 'weights', 'acne_resnet18.pth'),
                        help="Destination .pth weights path")
    parser.add_argument('--epochs', type=int, default=15, help="Number of training epochs")
    parser.add_argument('--batch-size', type=int, default=16, help="Batch size")
    parser.add_argument('--lr', type=float, default=0.001, help="Initial learning rate")
    parser.add_argument('--device', type=str, default="auto", help="Compute device: 'auto', 'cuda', 'cpu'")

    args = parser.parse_args()

    train_model(
        data_dir=args.data_dir,
        output_path=args.output,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
        device_name=args.device
    )
