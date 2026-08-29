import json
import os

# Limit CPU threads to drastically reduce memory usage for Render's 512MB Free Tier
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

import base64
import numpy as np
import cv2
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from insightface.app import FaceAnalysis

app = FastAPI(title="Face Recognition Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple JSON-based storage to replace memory-heavy ChromaDB
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

# Initialize InsightFace with a smaller model to fit in 512MB RAM
face_app = FaceAnalysis(name='buffalo_s')
face_app.prepare(ctx_id=-1, det_size=(640, 640))

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
        
        faces = face_app.get(img)
        if not faces:
            continue
        
        target_face = faces[0]
        embeddings.append(target_face.embedding)
        
    if not embeddings:
        raise HTTPException(status_code=400, detail="No faces detected in any of the provided images")
        
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
        
    faces = face_app.get(img)
    if not faces:
        return {"userId": None, "message": "No face detected"}
        
    target_face = faces[0]
    embedding = target_face.embedding
    embedding = embedding / np.linalg.norm(embedding)
    
    if not face_db:
        return {"userId": None, "message": "No users enrolled"}
        
    best_match = None
    best_distance = float('inf')
    
    for uid, stored_emb in face_db.items():
        stored_emb = np.array(stored_emb)
        # Cosine distance since vectors are normalized (1 - dot product)
        # However, we used L2 distance previously in chromadb default. 
        # L2 distance squared = 2 - 2 * dot(a, b) for normalized vectors.
        # Let's just use L2 distance.
        dist = np.linalg.norm(embedding - stored_emb)
        if dist < best_distance:
            best_distance = dist
            best_match = uid
    
    THRESHOLD = 1.0
    
    if best_distance < THRESHOLD:
        return {"userId": best_match, "distance": float(best_distance)}
    else:
        return {"userId": None, "message": "Unrecognized", "distance": float(best_distance)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
