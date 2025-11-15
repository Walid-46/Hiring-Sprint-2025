import cv2
import base64

def run_yolo(model, image_paths):
    results = model(image_paths)

    batch_results = []
    
    # 2. Iterate over the results and original paths simultaneously
    for i, image_path in enumerate(image_paths):
        # Get the individual result object for this image
        result = results[i]
        
        # Read the image from disk for drawing/display later
        img = cv2.imread(image_path)
        if img is None:
            print(f"Warning: Could not read image file at {image_path}. Skipping.")
            continue

        h, w = img.shape[:2]
        detections = []

        # Process detections for this single image result
        for box in result.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            
            det = {
                "class_id": cls,
                "label": result.names[cls],
                "confidence": round(conf, 3),
                "bbox": [int(x1), int(y1), int(x2), int(y2)]
            }
            # Calculate damage severity
            det["severity"] = calculate_severity(det, w, h) 
            detections.append(det)

        # 3. Append the detections list and the image array to the batch results
        batch_results.append((detections, img))
        
    return batch_results

# draw marking boxed around detected damage new = red, old = green, yello = unchanged
def draw_boxes(img, detections, color, thickness=2):
    for det in detections:
        x1, y1, x2, y2 = det["bbox"]
        label = f"{det['label']} ({det['confidence']})"
        cv2.rectangle(img, (x1, y1), (x2, y2), color, thickness)
        cv2.putText(img, label, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    return img

# calculat intersection over union to check for overlapping damage
def iou(a, b):
    xA = max(a[0], b[0])
    yA = max(a[1], b[1])
    xB = min(a[2], b[2])
    yB = min(a[3], b[3])

    inter = max(0, xB - xA) * max(0, yB - yA)
    if inter == 0:
        return 0

    areaA = (a[2]-a[0]) * (a[3]-a[1])
    areaB = (b[2]-b[0]) * (b[3]-b[1])

    return inter / float(areaA + areaB - inter)

#compare pickup and return image for current and new damage
def compare(pickup_det, return_det, iou_thresh=0.4):
    new_damage = []
    unchanged = []

    for ret in return_det:
        matched = False
        for pick in pickup_det:
            if iou(ret["bbox"], pick["bbox"]) > iou_thresh:
                unchanged.append(ret)
                matched = True
                break
        if not matched:
            new_damage.append(ret)

    return new_damage, unchanged

#calculate the damage severity based on the detected damage box size
def calculate_severity(det, image_width, image_height):
    x1, y1, x2, y2 = det["bbox"]
    bbox_area = (x2 - x1) * (y2 - y1)
    image_area = image_width * image_height

    area_ratio = bbox_area / image_area
    confidence = det["confidence"]

    severity = (confidence * 0.6) + (area_ratio * 0.4)
    return round(severity, 3)


def encode_image_to_base64(img_np, format: str = ".jpg") -> str:
    """Encodes an OpenCV image array (NumPy array) to a Base64 string."""
    # 1. Encode the NumPy array into a byte buffer using the specified format
    is_success, buffer = cv2.imencode(format, img_np)
    if not is_success:
        raise ValueError("Could not encode image to bytes for Base64.")
    
    # 2. Convert buffer to raw bytes, then encode to Base64 string
    img_bytes = buffer.tobytes()
    return base64.b64encode(img_bytes).decode('utf-8')