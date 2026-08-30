import json
import os
import base64
import numpy as np
import cv2
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Face Recognition Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple JSON-based storage
DB_FILE = "faces_db.json"
face_db = {}

def load_db():
    global face_db
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r") as f:
                face_db = json.load(f)
        except Exception:
            face_db = {}
    else:
        face_db = {}

def save_db():
    with open(DB_FILE, "w") as f:
        json.dump(face_db, f)

load_db()

# Initialize OpenCV lightweight YuNet and SFace models
# These take <50MB RAM compared to InsightFace's 600MB
try:
    detector = cv2.FaceDetectorYN.create("face_detection_yunet.onnx", "", (320, 320))
    recognizer = cv2.FaceRecognizerSF.create("face_recognition_sface.onnx", "")
except Exception as e:
    print(f"Error loading OpenCV models: {e}")

class EnrollRequest(BaseModel):
    userId: str
    images: list[str]

class RecognizeRequest(BaseModel):
    image: str

def decode_base64_image(b64_str: str) -> np.ndarray:
    try:
        if ',' in b64_str:
            b64_str = b64_str.split(',')[1]
        img_data = base64.b64decode(b64_str)
        np_arr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Could not decode image")
        return img
    except Exception as e:
        raise ValueError(f"Invalid image format: {e}")

def get_face_feature(img):
    height, width, _ = img.shape
    detector.setInputSize((width, height))
    _, faces = detector.detect(img)
    if faces is None or len(faces) == 0:
        return None
    
    # Get the largest face in the image
    face = max(faces, key=lambda f: f[2] * f[3])
    
    # Align and extract feature
    aligned_face = recognizer.alignCrop(img, face)
    feature = recognizer.feature(aligned_face)
    return feature[0] # 128D array

@app.post("/enroll")
async def enroll(request: EnrollRequest):
    if not request.images:
        raise HTTPException(status_code=400, detail="No images provided")
    
    embeddings = []
    for b64_img in request.images:
        try:
            img = decode_base64_image(b64_img)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        feature = get_face_feature(img)
        if feature is not None:
            embeddings.append(feature)
        
    if not embeddings:
        raise HTTPException(status_code=400, detail="No faces detected in images")
        
    avg_embedding = np.mean(embeddings, axis=0)
    avg_embedding = avg_embedding / np.linalg.norm(avg_embedding)
    
    face_db[request.userId] = avg_embedding.tolist()
    save_db()
        
    return {"status": "success", "userId": request.userId, "message": "User enrolled successfully"}

@app.post("/recognize")
async def recognize(request: RecognizeRequest):
    try:
        img = decode_base64_image(request.image)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    embedding = get_face_feature(img)
    if embedding is None:
        return {"userId": None, "message": "No face detected"}
        
    if not face_db:
        return {"userId": None, "message": "No users enrolled"}
        
    best_match = None
    best_distance = float('inf')
    
    for uid, stored_emb in face_db.items():
        stored_emb = np.array(stored_emb)
        # Cosine distance (1 - cosine similarity)
        cosine_sim = np.dot(embedding, stored_emb) / (np.linalg.norm(embedding) * np.linalg.norm(stored_emb))
        dist = 1.0 - cosine_sim
        
        if dist < best_distance:
            best_distance = dist
            best_match = uid
    
    # SFace cosine similarity threshold is roughly 0.363 (higher is better). 
    # Therefore cosine distance threshold is 1 - 0.363 = 0.637. Let's use 0.6 as safe threshold.
    THRESHOLD = 0.6
    
    if best_distance < THRESHOLD:
        return {"userId": best_match, "distance": float(best_distance)}
    else:
        return {"userId": None, "message": "Unrecognized", "distance": float(best_distance)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
