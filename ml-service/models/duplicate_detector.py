import numpy as np
from typing import List, Dict, Any, Tuple
from sentence_transformers import SentenceTransformer, util

class DuplicateDetector:
    """
    Detects duplicate complaints using semantic similarity via sentence-transformers.
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initializes the model. The first run will download the weights (approx ~90MB).
        """
        self.model = SentenceTransformer(model_name)
        
    def get_embedding(self, text: str) -> np.ndarray:
        """
        Converts text to an embedding vector.
        
        Args:
            text (str): Preprocessed text.
            
        Returns:
            np.ndarray: Embedding vector.
        """
        return self.model.encode(text, convert_to_tensor=True)
        
    def compute_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Computes cosine similarity between two embeddings.
        
        Args:
            embedding1 (np.ndarray): First embedding
            embedding2 (np.ndarray): Second embedding
            
        Returns:
            float: Similarity score between 0.0 and 1.0
        """
        # util.cos_sim returns a matrix, we extract the scalar item
        sim = util.cos_sim(embedding1, embedding2).item()
        return float(sim)
        
    def check_duplicate(self, new_text: str, existing_complaints_list: List[Dict[str, Any]], threshold: float = 0.85) -> Dict[str, Any]:
        """
        Checks if a new complaint is a duplicate of any existing complaints.
        
        Args:
            new_text (str): The new complaint text.
            existing_complaints_list (List[dict]): List of dicts with 'id' and 'text'.
            threshold (float): Minimum similarity to be considered a duplicate.
            
        Returns:
            dict: Duplicate check result
        """
        if not existing_complaints_list or not new_text.strip():
            return {
                "is_duplicate": False,
                "similar_complaint_id": None,
                "similarity_score": 0.0
            }
            
        # Get embedding for new text
        new_embedding = self.get_embedding(new_text)
        
        highest_sim = 0.0
        similar_id = None
        
        # In a production scenario, we could pre-compute or store these embeddings 
        # in a Vector DB, but comparing ~100 embeddings on the fly is very fast.
        for existing in existing_complaints_list:
            if not existing.get('text'):
                continue
                
            existing_emb = self.get_embedding(existing['text'])
            sim = self.compute_similarity(new_embedding, existing_emb)
            
            if sim > highest_sim:
                highest_sim = sim
                similar_id = existing['id']
                
        is_duplicate = highest_sim >= threshold
        
        return {
            "is_duplicate": is_duplicate,
            "similar_complaint_id": similar_id if is_duplicate else None,
            "similarity_score": round(highest_sim, 4)
        }
