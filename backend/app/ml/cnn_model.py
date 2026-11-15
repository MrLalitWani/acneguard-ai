import io
import os
from PIL import Image
import numpy as np

# Optional PyTorch imports for high-end inference
try:
    import torch
    import torch.nn as nn
    import torchvision.models as models
    import torchvision.transforms as transforms
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False
    torch = None

# Define class names matching the frontend expectation
CLASSES = ["Clear", "Mild", "Moderate", "Severe"]
ACNE_TYPES = ["cystic", "comedonal", "post-inflammatory", "hormonal"]
LOCATIONS = ["forehead", "cheeks", "chin", "nose"]

if HAS_TORCH:
    class AcneSeverityCNN(nn.Module):
        def __init__(self, num_classes=4):
            super(AcneSeverityCNN, self).__init__()
            self.backbone = models.resnet18(pretrained=False)
            num_ftrs = self.backbone.fc.in_features
            self.backbone.fc = nn.Linear(num_ftrs, num_classes)

        def forward(self, x):
            return self.backbone(x)
else:
    class AcneSeverityCNN:
        pass

# Path to model weights
WEIGHTS_DIR = os.path.join(os.path.dirname(__file__), "weights")
WEIGHTS_PATH = os.path.join(WEIGHTS_DIR, "acne_resnet18.pth")

# Global model instance
model = None

def init_model():
    global model
    if not HAS_TORCH:
        return None
    if model is not None:
        return model
    
    os.makedirs(WEIGHTS_DIR, exist_ok=True)
    try:
        model = models.resnet18(weights=None)
    except Exception:
        model = models.resnet18(pretrained=False)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, 4)
    model.eval()

    if os.path.exists(WEIGHTS_PATH):
        try:
            state = torch.load(WEIGHTS_PATH, map_location=torch.device('cpu'))
            # Strip 'backbone.' prefix if saved from wrapped module
            if any(k.startswith("backbone.") for k in state.keys()):
                state = {k.replace("backbone.", ""): v for k, v in state.items()}
            model.load_state_dict(state)
            print("Successfully loaded PyTorch CNN weights.")
        except Exception as e:
            print(f"Error loading PyTorch model weights: {e}. Running with fallback.")
    else:
        print("Model weights file not found. Running in image-responsive simulation mode.")
    return model

def analyze_image_heuristics(img: Image.Image):
    """
    Fallback image-responsive heuristic when CNN is running without custom weights.
    Calculates localized redness variance to determine severity and region scores.
    """
    img_rgb = img.convert("RGB")
    width, height = img_rgb.size
    img_np = np.array(img_rgb)

    # Break image down into quadrants to represent facial regions
    # Forehead: Top 35% of the image
    # Chin: Bottom 25% of the image
    # Left Cheek: Middle vertical, Left half
    # Right Cheek: Middle vertical, Right half
    
    h_fh = int(height * 0.35)
    h_ch = int(height * 0.75)
    w_mid = int(width * 0.5)

    forehead_patch = img_np[0:h_fh, :]
    chin_patch = img_np[h_ch:height, :]
    left_cheek_patch = img_np[h_fh:h_ch, 0:w_mid]
    right_cheek_patch = img_np[h_fh:h_ch, w_mid:width]

    def get_redness_score(patch):
        if patch.size == 0:
            return 0.0
        # Calculate standard deviation and mean of Red channel minus Green/Blue channels
        # Inflamed acne has a high red difference
        r = patch[:, :, 0].astype(float)
        g = patch[:, :, 1].astype(float)
        b = patch[:, :, 2].astype(float)
        red_diff = r - (g + b) / 2.0
        
        # Focus on positive red differences (highly red spots)
        red_spots = red_diff[red_diff > 15]
        if red_spots.size == 0:
            return 0.05
        # Return a normalized intensity score between 0.0 and 1.0
        return float(min(1.0, np.mean(red_spots) / 100.0 + np.std(red_spots) / 50.0))

    scores = {
        "Forehead": get_redness_score(forehead_patch),
        "Left Cheek": get_redness_score(left_cheek_patch),
        "Right Cheek": get_redness_score(right_cheek_patch),
        "Chin": get_redness_score(chin_patch)
    }

    # Normalize region scores so they look like probability mappings or percentages
    total_score = sum(scores.values())
    if total_score > 0:
        region_scores = {k: round(v / total_score, 2) for k, v in scores.items()}
    else:
        region_scores = {"Forehead": 0.25, "Left Cheek": 0.25, "Right Cheek": 0.25, "Chin": 0.25}

    # Determine severity based on the maximum redness score
    max_red = max(scores.values())
    if max_red < 0.15:
        severity = "Clear"
        skin_score = int(90 + (0.15 - max_red) * 60)
    elif max_red < 0.35:
        severity = "Mild"
        skin_score = int(75 + (0.35 - max_red) * 75)
    elif max_red < 0.60:
        severity = "Moderate"
        skin_score = int(50 + (0.60 - max_red) * 100)
    else:
        severity = "Severe"
        skin_score = int(25 + (1.0 - max_red) * 33)

    skin_score = max(5, min(100, skin_score))

    # Identify primary acne type and location
    primary_location = max(scores, key=scores.get).lower()
    
    # Simple heuristic for type: if redness variance is very high, it indicates cystic/hormonal.
    # Otherwise comedonal or post-inflammatory.
    variance = np.std(list(scores.values()))
    if severity == "Clear":
        acne_type = "none"
        primary_location = "none"
    elif variance > 0.15:
        acne_type = "cystic"
    elif max_red > 0.5:
        acne_type = "hormonal"
    elif max_red > 0.3:
        acne_type = "comedonal"
    else:
        acne_type = "post-inflammatory"

    return {
        "severity": severity,
        "skin_score": skin_score,
        "acne_type": acne_type,
        "location": primary_location,
        "region_scores": region_scores
    }

def analyze_skin(image_bytes: bytes) -> dict:
    # Load image
    try:
        image = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        raise ValueError(f"Invalid image format: {e}")

    # We run the heuristic check to get localized features
    heuristic_res = analyze_image_heuristics(image)

    # Execute PyTorch inference if available
    if HAS_TORCH:
        try:
            init_model()
            preprocess = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ])
            input_tensor = preprocess(image).unsqueeze(0)
            with torch.no_grad():
                outputs = model(input_tensor)
                _, predicted = torch.max(outputs, 1)
                cnn_predicted_class = CLASSES[predicted.item()]
                if os.path.exists(WEIGHTS_PATH):
                    heuristic_res["severity"] = cnn_predicted_class
        except Exception as e:
            print(f"PyTorch prediction notice: {e}. Using image analysis heuristics.")

    return heuristic_res
