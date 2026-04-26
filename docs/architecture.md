<!-- Documents high-level architecture, service responsibilities, and ML model plans. -->
# Smart Complaint Intelligence System - Architecture

## 3-Service Architecture Overview
The platform is structured as three deployable services:
- **Frontend (`frontend`)**: citizen/admin web client for complaint submission, tracking, and analytics.
- **Backend (`backend`)**: API gateway and business logic layer handling auth, complaint lifecycle, and persistence.
- **ML Service (`ml-service`)**: inference API for complaint category prediction, urgency estimation, and duplicate detection.

## Complaint Submission Data Flow
1. Citizen submits a complaint from the frontend with description, optional image, and location details.
2. Frontend calls backend API endpoint to create a complaint.
3. Backend validates JWT/session data and request payload.
4. Backend sends complaint text to ML service `/classify` endpoint.
5. ML service returns predicted category, urgency, and confidence.
6. Backend calls ML service `/duplicate-check` for similarity screening.
7. Backend stores complaint plus AI metadata in PostgreSQL via Prisma.
8. Backend returns created complaint record to frontend.
9. Admin dashboard queries backend for operational and AI-assisted analytics.

## Service Matrix
| Service | Tech Stack | Port | Deployment Target |
|---|---|---:|---|
| Frontend | React 18, Vite, Tailwind CSS | 5173 | Vercel / Netlify |
| Backend API | Node.js, Express, Prisma, PostgreSQL | 5000 | Render / Railway / Fly.io |
| ML Service | FastAPI, Transformers, Sentence-Transformers | 8000 | Render / Railway / Kubernetes |
| Database | PostgreSQL (Neon) | Managed | Neon Cloud |

## Planned ML Models
| Model Capability | Suggested Model Family | Input | Output |
|---|---|---|---|
| Complaint Category Classification | DistilBERT / RoBERTa fine-tuned classifier | Complaint text | Category label + confidence |
| Urgency Prediction | Gradient Boosting or Transformer classifier | Complaint text + metadata | Urgency level + score |
| Duplicate Detection | Sentence-Transformers embeddings + cosine similarity | New complaint text + historical complaints | Duplicate flag + similar complaint ID + similarity score |
| Complaint Summarization | T5/BART summarizer | Long complaint text | Concise complaint summary |
