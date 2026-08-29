import base64
import numpy as np
import cv2
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
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

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="faces")

# Initialize InsightFace
face_app = FaceAnalysis(name='buffalo_l')
face_app.prepare(ctx_id=0, det_size=(640, 640))

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
    embedding_list = avg_embedding.tolist()
    
    try:
        collection.upsert(
            ids=[request.userId],
            embeddings=[embedding_list]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
        
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
    embedding_list = embedding.tolist()
    
    try:
        results = collection.query(
            query_embeddings=[embedding_list],
            n_results=1
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
        
    if not results['ids'] or not results['ids'][0]:
        return {"userId": None, "message": "No matches found"}
        
    distance = results['distances'][0][0]
    matched_id = results['ids'][0][0]
    
    THRESHOLD = 1.0
    
    if distance < THRESHOLD:
        return {"userId": matched_id, "distance": distance}
    else:
        return {"userId": None, "message": "Unrecognized", "distance": distance}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
