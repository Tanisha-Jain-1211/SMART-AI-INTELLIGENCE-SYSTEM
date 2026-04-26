import time
import logging
from typing import Dict, Any

from models.classifier import ComplaintClassifier
from models.urgency_predictor import UrgencyPredictor
from models.duplicate_detector import DuplicateDetector

logger = logging.getLogger(__name__)

class ModelLoader:
    """
    Singleton class to load and hold all ML models in memory.
    Ensures models are only loaded once during application startup.
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
        
    def _initialize(self):
        self.classifier = None
        self.urgency_predictor = None
        self.duplicate_detector = None
        
        self.load_times = {}
        
    def load_all_models(self, model_dir: str = "./saved_models"):
        """Loads all models and records the time taken."""
        logger.info("Loading ML models...")
        
        # Load Classifier
        start = time.time()
        self.classifier = ComplaintClassifier(model_dir=model_dir)
        self.load_times['classifier'] = round(time.time() - start, 2)
        logger.info(f"Classifier loaded in {self.load_times['classifier']}s (ML backend: {self.classifier.is_loaded})")
        
        # Load Urgency Predictor
        start = time.time()
        self.urgency_predictor = UrgencyPredictor()
        self.load_times['urgency_predictor'] = round(time.time() - start, 2)
        logger.info(f"Urgency Predictor loaded in {self.load_times['urgency_predictor']}s")
        
        # Load Duplicate Detector
        start = time.time()
        self.duplicate_detector = DuplicateDetector()
        self.load_times['duplicate_detector'] = round(time.time() - start, 2)
        logger.info(f"Duplicate Detector loaded in {self.load_times['duplicate_detector']}s")
        
        logger.info("All models loaded successfully!")
        
    def get_classifier(self) -> ComplaintClassifier:
        if not self.classifier:
            raise RuntimeError("Classifier not loaded yet.")
        return self.classifier
        
    def get_urgency_predictor(self) -> UrgencyPredictor:
        if not self.urgency_predictor:
            raise RuntimeError("Urgency predictor not loaded yet.")
        return self.urgency_predictor
        
    def get_duplicate_detector(self) -> DuplicateDetector:
        if not self.duplicate_detector:
            raise RuntimeError("Duplicate detector not loaded yet.")
        return self.duplicate_detector
        
    def health_check(self) -> Dict[str, Any]:
        """Returns the status of all models."""
        return {
            "classifier": self.classifier is not None,
            "classifier_is_ml": getattr(self.classifier, "is_loaded", False) if self.classifier else False,
            "urgency_predictor": self.urgency_predictor is not None,
            "duplicate_detector": self.duplicate_detector is not None,
            "load_times_seconds": self.load_times
        }

# Global singleton instance
model_loader = ModelLoader()
