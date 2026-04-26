import os
import time
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from utils.text_preprocessor import TextPreprocessor
from utils.model_loader import model_loader

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Smart Complaint ML Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class ClassifyRequest(BaseModel):
    title: str
    description: str

class ComplaintItem(BaseModel):
    id: str
    text: str

class DuplicateCheckRequest(BaseModel):
    title: str
    description: str
    complaint_id: Optional[str] = None
    existing_complaints: List[ComplaintItem] = []

class BatchClassifyRequest(BaseModel):
    complaints: List[Dict[str, str]]  # list of dicts with id, title, description

# --- Startup Event ---

@app.on_event("startup")
async def startup_event():
    """Load models when the server starts."""
    model_dir = os.getenv("MODEL_CACHE_DIR", "./saved_models")
    try:
        model_loader.load_all_models(model_dir)
        logger.info("Startup complete. ML Engine is ready.")
    except Exception as e:
        logger.error(f"Failed to load models during startup: {e}")
        # We don't raise here so the health check can report failure rather than crashing

# --- Endpoints ---

@app.get("/health")
async def health_check():
    """Returns the health status of the ML service and its models."""
    return {
        "status": "ok",
        "service": "ml-service",
        "models_loaded": model_loader.health_check()
    }

@app.get("/model-stats")
async def get_model_stats():
    """Returns information about the loaded models."""
    status = model_loader.health_check()
    return {
        "classifier": {
            "type": "TF-IDF + LogisticRegression" if status.get("classifier_is_ml") else "Keyword Fallback",
            "categories": 8,
            "trained_on": 80
        },
        "urgency": {
            "type": "keyword-scoring",
            "levels": 4
        },
        "duplicate": {
            "model": "all-MiniLM-L6-v2",
            "embedding_dim": 384,
            "threshold": float(os.getenv("DUPLICATE_THRESHOLD", 0.85))
        }
    }

@app.post("/classify")
async def classify_complaint(payload: ClassifyRequest):
    """Classifies a complaint and predicts its urgency."""
    start_time = time.time()
    
    try:
        classifier = model_loader.get_classifier()
        urgency_predictor = model_loader.get_urgency_predictor()
        
        # 1 & 2. Combine and preprocess
        clean_text = TextPreprocessor.combine_and_clean(payload.title, payload.description)
        
        # 3. Classify
        min_conf = float(os.getenv("MIN_CONFIDENCE", 0.6))
        category, confidence = classifier.predict(clean_text, min_confidence)
        
        # 4. Predict Urgency
        raw_combined = f"{payload.title} {payload.description}"
        urgency, urgency_score = urgency_predictor.predict(raw_combined)
        
        elapsed = round((time.time() - start_time) * 1000, 2)
        logger.info(f"Classify took {elapsed}ms | Cat: {category} ({confidence:.2f}) | Urg: {urgency} ({urgency_score})")
        
        return {
            "category": category,
            "urgency": urgency,
            "confidence": round(confidence, 4),
            "urgency_score": urgency_score,
            "processed_text": clean_text
        }
        
    except Exception as e:
        logger.error(f"Classification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/duplicate-check")
async def check_duplicate(payload: DuplicateCheckRequest):
    """Checks if the new complaint is a duplicate of existing ones."""
    start_time = time.time()
    
    try:
        detector = model_loader.get_duplicate_detector()
        
        # 1. Combine and preprocess
        clean_text = TextPreprocessor.combine_and_clean(payload.title, payload.description)
        
        # Convert existing complaints to format expected by detector
        # Make sure to ignore the current complaint if it's in the list
        existing_list = [
            {"id": c.id, "text": c.text} 
            for c in payload.existing_complaints 
            if c.id != payload.complaint_id
        ]
        
        threshold = float(os.getenv("DUPLICATE_THRESHOLD", 0.85))
        
        # Run detection
        result = detector.check_duplicate(clean_text, existing_list, threshold)
        result["threshold_used"] = threshold
        
        elapsed = round((time.time() - start_time) * 1000, 2)
        logger.info(f"Duplicate check took {elapsed}ms | Dup: {result['is_duplicate']} | Max Sim: {result['similarity_score']:.2f}")
        
        return result
        
    except Exception as e:
        logger.error(f"Duplicate check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch-classify")
async def batch_classify(payload: BatchClassifyRequest):
    """Classifies multiple complaints in a single batch."""
    try:
        classifier = model_loader.get_classifier()
        urgency_predictor = model_loader.get_urgency_predictor()
        min_conf = float(os.getenv("MIN_CONFIDENCE", 0.6))
        
        results = []
        for item in payload.complaints:
            title = item.get("title", "")
            desc = item.get("description", "")
            id_val = item.get("id")
            
            clean_text = TextPreprocessor.combine_and_clean(title, desc)
            cat, conf = classifier.predict(clean_text, min_conf)
            urg, score = urgency_predictor.predict(f"{title} {desc}")
            
            results.append({
                "id": id_val,
                "category": cat,
                "urgency": urg,
                "confidence": round(conf, 4),
                "urgency_score": score
            })
            
        return {"success": True, "data": results}
        
    except Exception as e:
        logger.error(f"Batch classification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
