from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from typing import List
import shutil
import os
from utils import run_yolo, compare, draw_boxes, encode_image_to_base64
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Vehicle Damage Detection API")
#cors to allow front end using * as it is a prototype and there is no live front end link yet
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001","*"],  # Your Next.js dev/prod URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
model = YOLO("trained.pt")
TEMP_DIR = "temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.get("/")
def root():
    return {"message": "Vehicle Damage Detection API is running"}

@app.post("/compare-batch")
async def compare_image_sets(
    pickup_images: List[UploadFile] = File(...),
    returned_images: List[UploadFile] = File(...)
):
    """
    Compares a list of pickup images with a corresponding list of return images.
    The order is assumed to be matched (e.g., [side_A, front] vs [side_A, front]).
    """
    
    if len(pickup_images) != len(returned_images):
        return {"error": "The number of pickup images must match the number of return images."}, 400

    results_summary = []
    temp_file_paths = []
    # 1. Iterate through the lists simultaneously using zip()
    # zip() pairs (pickup_images[0], returned_images[0]), (pickup_images[1], returned_images[1]), etc.
    for i, (pickup_file, returned_file) in enumerate(zip(pickup_images, returned_images)):
        
        # 2. Read contents in memory (since we avoid saving to disk)
        pickup_path = os.path.join(TEMP_DIR, f"pair_{i}_pickup_{pickup_file.filename}")
        return_path = os.path.join(TEMP_DIR, f"pair_{i}_return_{returned_file.filename}")

        temp_file_paths.extend([pickup_path, return_path])

        try:
            with open(pickup_path, "wb") as buffer:
                # Reset pointer before copying if read() was called previously
                pickup_file.file.seek(0)
                shutil.copyfileobj(pickup_file.file, buffer)
            
            with open(return_path, "wb") as buffer:
                returned_file.file.seek(0)
                shutil.copyfileobj(returned_file.file, buffer)
        except Exception as e:
             raise HTTPException(status_code=500, detail=f"File saving failed: {e}")
            
    try:
           # Returns a list in the order: [Det_P0, Det_R0, Det_P1, Det_R1, ...]
           all_detections_and_images = run_yolo(model, temp_file_paths)
            
        
        
        # Slice for all Pickup Results (Every second element starting at index 0)
           pickup_results = all_detections_and_images[0::2]
        
        # Slice for all Return Results (Every second element starting at index 1)
           return_results = all_detections_and_images[1::2]
        
        # Iterate over the paired results for comparison and drawing
           for i, ((pickup_det, pickup_img), (return_det, return_img)) in enumerate(zip(pickup_results, return_results)):
            
            # Retrieve the original file objects to get filenames
               pickup_file = pickup_images[i]
               returned_file = returned_images[i]
            
            # Comparison 
               new_damage, unchanged = compare(pickup_det, return_det)
    
            # 4. Draw visualizations and save output
               pickup_annotated = draw_boxes(pickup_img, pickup_det, (0,255,0))
               return_annotated = draw_boxes(return_img, unchanged, (255,255,0))
               return_annotated = draw_boxes(return_annotated, new_damage, (0,0,255))
    
            # Encode annotated images to base64
               pickup_b64 = encode_image_to_base64(pickup_annotated)
               return_b64 = encode_image_to_base64(return_annotated)
            
            # Extract damage details from new_damage detections
               new_damage_details = [
                   {
                       "label": det["label"],
                       "confidence": det["confidence"],
                       "bbox": det["bbox"],
                       "severity": det["severity"]
                   }
                   for det in new_damage
               ]
            
            # Extract damage details from unchanged detections
               unchanged_damage_details = [
                   {
                       "label": det["label"],
                       "confidence": det["confidence"],
                       "bbox": det["bbox"],
                       "severity": det["severity"]
                   }
                   for det in unchanged
               ]
            
            # 5. Compile Results
               results_summary.append({
                   "pair_index": i,
                   "pickup_filename": pickup_file.filename,
                   "return_filename": returned_file.filename,
                   "new_damage_count": len(new_damage),
                   "unchanged_damage_count": len(unchanged),
                   "new_damage_details": new_damage_details,
                   "unchanged_damage_details": unchanged_damage_details,
                   "pickup_annotated_base64": f"data:image/jpeg;base64,{pickup_b64}",
                   "return_annotated_base64": f"data:image/jpeg;base64,{return_b64}"
               })
    except:
        None
    finally:
        for path in temp_file_paths:
            if os.path.exists(path):
                os.remove(path)
            
    return JSONResponse(content={"status": "success", "results": results_summary})