import os
import json
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

from utils.text_preprocessor import TextPreprocessor

def main():
    print("Loading training data...")
    data_path = os.path.join(os.path.dirname(__file__), "data", "training_data.json")
    
    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    texts = []
    labels = []
    
    for item in data:
        # We only have 'text' in the json, which simulates combined title+desc
        clean_text = TextPreprocessor.clean_text(item["text"])
        texts.append(clean_text)
        labels.append(item["category"])
        
    print(f"Loaded {len(texts)} samples.")
    
    # Train/test split just for evaluation
    X_train, X_test, y_train, y_test = train_test_split(texts, labels, test_size=0.2, random_state=42)
    
    print("Training TF-IDF Vectorizer...")
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    
    # Fit on ALL data to maximize vocabulary since we have limited samples
    X_all_vec = vectorizer.fit_transform(texts)
    
    # But evaluate on split
    X_train_vec = vectorizer.transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    print("Training Logistic Regression classifier...")
    # class_weight='balanced' handles any slight class imbalance
    classifier = LogisticRegression(random_state=42, class_weight='balanced', max_iter=1000)
    
    # Train on all data for the final model, but evaluate on the split first
    classifier.fit(X_train_vec, y_train)
    y_pred = classifier.predict(X_test_vec)
    
    print("\n--- Evaluation ---")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")
    
    # Retrain on all data for deployment
    print("\nRetraining on full dataset for deployment...")
    classifier.fit(X_all_vec, labels)
    
    # Ensure saved_models dir exists
    models_dir = os.path.join(os.path.dirname(__file__), "saved_models")
    os.makedirs(models_dir, exist_ok=True)
    
    # Save the models
    vectorizer_path = os.path.join(models_dir, "vectorizer.joblib")
    classifier_path = os.path.join(models_dir, "classifier.joblib")
    
    joblib.dump(vectorizer, vectorizer_path)
    joblib.dump(classifier, classifier_path)
    
    print(f"Model saved to {classifier_path}")
    print(f"Vectorizer saved to {vectorizer_path}")
    print("Training complete!")

if __name__ == "__main__":
    main()
