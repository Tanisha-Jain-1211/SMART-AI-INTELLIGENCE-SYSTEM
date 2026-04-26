import os
import joblib
from typing import Tuple, Dict

from utils.text_preprocessor import TextPreprocessor

# Keyword mapping for Fallback Approach A
KEYWORD_RULES = {
    "ELECTRICITY": ["electric", "power", "wire", "transformer", "voltage", "spark", "current", "meter", "light", "shock", "blackout"],
    "WATER": ["water", "pipe", "leak", "drain", "sewage", "flood", "tap", "tank", "drinking", "supply"],
    "ROADS": ["road", "pothole", "street", "highway", "traffic", "pavement", "footpath", "divider", "breaker"],
    "GARBAGE": ["garbage", "waste", "trash", "dustbin", "smell", "dump", "sweep", "clean", "dead animal"],
    "STREET_LIGHTS": ["street light", "streetlamp", "halogen", "bulb", "dark", "pole"],
    "EDUCATION": ["school", "teacher", "student", "class", "education", "study", "exam", "mid-day meal"],
    "PUBLIC_SAFETY": ["police", "safety", "robbery", "theft", "drunk", "nuisance", "dog bite", "snake", "fire", "cctv"]
}

class ComplaintClassifier:
    """
    Classifies complaint text into one of the 8 predefined categories.
    Uses a hybrid approach:
    Approach B: Scikit-learn ML model (TF-IDF + Logistic Regression)
    Approach A: Fallback to keyword matching if ML confidence is low.
    """
    
    def __init__(self, model_dir: str = "./saved_models"):
        self.vectorizer = None
        self.classifier = None
        self.is_loaded = False
        
        vectorizer_path = os.path.join(model_dir, "vectorizer.joblib")
        classifier_path = os.path.join(model_dir, "classifier.joblib")
        
        if os.path.exists(vectorizer_path) and os.path.exists(classifier_path):
            try:
                self.vectorizer = joblib.load(vectorizer_path)
                self.classifier = joblib.load(classifier_path)
                self.is_loaded = True
            except Exception as e:
                print(f"Error loading ML models: {e}. Will use fallback.")
    
    def predict(self, text: str, min_confidence: float = 0.6) -> Tuple[str, float]:
        """
        Predicts category using ML model first, falls back to keywords if needed.
        
        Args:
            text (str): Cleaned complaint text
            min_confidence (float): Minimum confidence to accept ML prediction
            
        Returns:
            Tuple[str, float]: (category, confidence_score)
        """
        # Approach B: ML Prediction
        if self.is_loaded and text.strip():
            try:
                X = self.vectorizer.transform([text])
                probs = self.classifier.predict_proba(X)[0]
                best_class_idx = probs.argmax()
                confidence = probs[best_class_idx]
                
                if confidence >= min_confidence:
                    category = self.classifier.classes_[best_class_idx]
                    return category, float(confidence)
            except Exception as e:
                print(f"Error during ML prediction: {e}")
                
        # Approach A: Fallback to Keyword matching
        return self._rule_based_predict(text)
        
    def _rule_based_predict(self, text: str) -> Tuple[str, float]:
        """
        Matches keywords in text to determine category.
        """
        text_lower = text.lower()
        scores: Dict[str, int] = {cat: 0 for cat in KEYWORD_RULES.keys()}
        
        for category, keywords in KEYWORD_RULES.items():
            for kw in keywords:
                if kw in text_lower:
                    scores[category] += 1
                    
        best_category = max(scores, key=scores.get)
        best_score = scores[best_category]
        
        if best_score > 0:
            # Estimate confidence based on keyword hits (maxes around 0.85 for rules)
            confidence = min(0.5 + (best_score * 0.1), 0.85)
            return best_category, confidence
            
        return "OTHER", 0.5
