import re
import string

# Define basic stop words to avoid relying on external NLTK download during runtime
STOP_WORDS = {
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", 
    "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", 
    "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", 
    "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", 
    "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", 
    "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", 
    "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", 
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", 
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", 
    "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", 
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", 
    "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"
}

class TextPreprocessor:
    """
    Utility class for cleaning and preprocessing text for ML models.
    """
    
    @staticmethod
    def clean_text(text: str) -> str:
        """
        Lowercases text, removes special characters, extra spaces, and stop words.
        
        Args:
            text (str): The input text to clean.
            
        Returns:
            str: The cleaned text.
        """
        if not text:
            return ""
            
        # Lowercase
        text = str(text).lower()
        
        # Remove special characters and punctuation
        text = re.sub(r'[%s]' % re.escape(string.punctuation), ' ', text)
        
        # Remove numbers
        # text = re.sub(r'\w*\d\w*', '', text) # Keeping numbers as they can indicate urgency
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Remove stop words
        words = text.split()
        cleaned_words = [word for word in words if word not in STOP_WORDS]
        
        return ' '.join(cleaned_words)
        
    @staticmethod
    def combine_and_clean(title: str, description: str) -> str:
        """
        Combines title and description, then applies cleaning.
        
        Args:
            title (str): Complaint title
            description (str): Complaint description
            
        Returns:
            str: The cleaned and combined text.
        """
        combined = f"{title} {description}"
        return TextPreprocessor.clean_text(combined)
