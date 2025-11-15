---
title: "Vehicle Damage Detection API"
emoji: "🚗"
colorFrom: "indigo"
colorTo: "purple"
sdk: "docker"
sdk_version: "0.0.0"
app_file: main.py
pinned: false
license: "apache-2.0"
tags:
  ["fastapi", "object-detection", "yolov8", "computer-vision", "vehicle-damage"]
datasets: []
metrics: []
language: "en"
thumbnail: ""
---

A FastAPI-based vehicle damage detection system using YOLO for detecting and comparing vehicle damage between pickup and return images.

## Features

- **Image Upload**: Upload pickup and returned vehicle images
- **Damage Detection**: Uses YOLO to detect vehicle damage
- **Comparison**: Compares pickup vs return images to identify new damage
- **Base64 Encoding**: Returns annotated images as base64-encoded data
- **CORS Enabled**: Ready for frontend integration

## API Endpoints

### `GET /`

Health check endpoint

**Response:**

```json
{
  "message": "Vehicle Damage Detection API is running"
}
```

### `POST /compare-batch`

Compare multiple pairs of pickup and returned images

**Request:**

- `pickup_images`: List of pickup images (multipart/form-data)
- `returned_images`: List of returned images (multipart/form-data)

**Response:**

```json
{
  "status": "success",
  "results": [
    {
      "pair_index": 0,
      "pickup_filename": "pickup.jpg",
      "return_filename": "return.jpg",
      "new_damage_count": 2,
      "unchanged_damage_count": 1,
      "new_damage_details": [
        {
          "label": "scratch",
          "confidence": 0.95,
          "bbox": [100, 150, 200, 250],
          "severity": 0.85
        }
      ],
      "unchanged_damage_details": [...],
      "pickup_annotated_base64": "data:image/jpeg;base64,...",
      "return_annotated_base64": "data:image/jpeg;base64,..."
    }
  ]
}
```

## Deployment on Hugging Face Spaces

1. Create a new Space on [huggingface.co/spaces](https://huggingface.co/spaces)
2. Select "Docker" as the SDK
3. Clone the repo and push to the Space
4. The app will auto-deploy

## Configuration

### Environment Variables

No environment variables required. The app works out of the box.

### CORS Configuration

The API allows requests from:

- `http://localhost:3000` (Next.js dev)
- `http://localhost:3001` (Next.js prod)
- `*` (All origins - for prototyping)

To restrict CORS for production, update `main.py`:

```python
app.add_middleware(
  CORSMiddleware,
  allow_origins=["https://yourdomain.com"],  # Update with your domain
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)
```

### Model Configuration

- **Model File**: `trained.pt` (YOLO format)
- **Model Size**: ~500 MB
- **IoU Threshold**: 0.4 (for damage comparison)
- **Damage Categories**: Configured in trained.pt labels

To use a different model, replace `trained.pt` and update `main.py`:

```python
model = YOLO("your_model.pt")
```

### Temporary Files

Temporary uploads are stored in `temp_uploads/` and automatically cleaned up after each request.

## Local Development

```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 7860
```

Access at `http://localhost:7860`

## Docker

```bash
docker compose up --build
```

Access at `http://localhost:8000`

## Testing & Usage

### Test with cURL

```bash
curl -X POST "http://localhost:7860/compare-batch" \
  -F "pickup_images=@after.jpg" \
  -F "pickup_images=@afterblak.jpg" \
  -F "returned_images=@before1.jpg" \
  -F "returned_images=@beforeblak.jpg"
```

### Test with Python

```python
import requests

API_URL = "http://127.0.0.1:7860/compare-batch"

files = [
    # Pickup images
    ('pickup_images', ('after.jpg', open('after.jpg', 'rb'), 'image/jpeg')),
    ('pickup_images', ('afterblak.jpg', open('afterblak.jpg', 'rb'), 'image/jpeg')),

    # Return images
    ('returned_images', ('before1.jpg', open('before1.jpg', 'rb'), 'image/jpeg')),
    ('returned_images', ('beforeblak.jpg', open('beforeblak.jpg', 'rb'), 'image/jpeg')),
]

response = requests.post(API_URL, files=files)
results = response.json()
print(results)
```

### Response Structure

Each result in the response contains:

- `pair_index`: Index of the image pair
- `pickup_filename`: Name of pickup image
- `return_filename`: Name of return image
- `new_damage_count`: Number of new damages detected
- `unchanged_damage_count`: Number of unchanged damages
- `new_damage_details`: Array of new damage objects with label, confidence, bbox, severity
- `unchanged_damage_details`: Array of unchanged damage objects
- `pickup_annotated_base64`: Base64-encoded pickup image with annotations
- `return_annotated_base64`: Base64-encoded return image with annotations
