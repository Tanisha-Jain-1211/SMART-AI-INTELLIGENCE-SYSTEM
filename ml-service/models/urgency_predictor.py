import re
from typing import Tuple

class UrgencyPredictor:
    """
    Predicts complaint urgency based on keyword scoring, text length, and formatting.
    """
    
    CRITICAL_KEYWORDS = ["dangerous", "accident", "death", "fire", "electric shock", "fallen wire", "collapsed", "emergency", "injury", "life threat", "bite", "snake"]
    HIGH_KEYWORDS = ["not working since days", "multiple complaints", "no supply", "affecting many", "health risk", "disease", "flooding", "leaking heavily"]
    MEDIUM_KEYWORDS = ["inconvenience", "problem", "issue", "not proper", "irregular", "complaint", "broken", "dirty"]
    LOW_KEYWORDS = ["minor", "small", "sometime", "occasionally", "request", "faded"]
    
    def predict(self, text: str) -> Tuple[str, float]:
        """
        Calculates urgency score based on keyword matches and text features.
        
        Args:
            text (str): The raw complaint text.
            
        Returns:
            Tuple[str, float]: (Urgency Level, Urgency Score)
        """
        text_lower = text.lower()
        score = 0.0
        
        # 1. Keyword Scoring
        for kw in self.CRITICAL_KEYWORDS:
            if kw in text_lower:
                score += 4.0
                
        for kw in self.HIGH_KEYWORDS:
            if kw in text_lower:
                score += 3.0
                
        for kw in self.MEDIUM_KEYWORDS:
            if kw in text_lower:
                score += 2.0
                
        for kw in self.LOW_KEYWORDS:
            if kw in text_lower:
                score += 1.0
                
        # 2. Text Length Factor
        # Longer complaints often mean more detail/frustration
        words = text.split()
        if len(words) > 50:
            score += 1.5
        elif len(words) > 20:
            score += 0.5
            
        # 3. Formatting Cues (Exclamation marks, Caps)
        if "!" in text:
            score += 1.0
        
        # Count uppercase words (excluding first word of sentence)
        upper_words = [w for w in words if w.isupper() and len(w) > 2]
        if len(upper_words) >= 2:
            score += 1.0
            
        # 4. Numbers/Duration Cues
        if re.search(r'\d+\s+(days|weeks|months)', text_lower):
            score += 1.5
            
        # Cap the score mapping
        final_score = round(score, 1)
        
        # Determine category based on score threshold
        if final_score >= 6.0:
            return "CRITICAL", final_score
        elif final_score >= 4.0:
            return "HIGH", final_score
        elif final_score >= 2.0:
            return "MEDIUM", final_score
        else:
            return "LOW", final_score
