# GURU — Autonomous Agentic AI Study Companion

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![ChromaDB](https://img.shields.io/badge/Vector%20DB-ChromaDB-FF6F61)](https://www.trychroma.com/)

**GURU** is an autonomous multi-agent AI study system that transforms raw learning materials (lecture notes, PDFs, textbook images, audio voice notes) into a personalized, interactive study experience with RAG tutoring, 3D flashcards, automated quizzes, and predictive study scheduling.

---

## 🌟 Key Features

1. **Multimodal Ingestion Hub**:
   - Ingest plain text notes, PDF documents, scanned page images (OCR via Tesseract), and voice notes (Whisper STT).
   - Smart chunking with token overlap for optimal retrieval accuracy.

2. **Concept Explorer & 3D Flashcard Engine**:
   - Auto-generates structured flashcards and concept summaries from ingested notes.
   - Interactive 3D flip card UI with confidence ratings (**Easy ⚡**, **Medium 🤔**, **Hard 😓**).
   - Visual concept hierarchy map viewer.

3. **Ask GURU (RAG Tutor Chat)**:
   - Retrieval-Augmented Generation (RAG) assistant grounded in your study materials.
   - Transparent source attribution with exact material citations and relevance scores.

4. **Quiz & Self-Assessment Center**:
   - Automatically generates multiple-choice quizzes targeted at specific study materials.
   - Instant scoring with explanations and historical attempt tracking.

5. **Predictive & Agentic Study Planner**:
   - Weakness calculation formula evaluating accuracy, exam weights, and recency:
     $$\text{WeaknessScore} = (1.0 - \text{Accuracy}) \times 4.5 + \text{ExamWeight} \times 3.5 + \text{RecencyFactor} \times 2.0$$
   - Automatically generates time-boxed daily study schedules based on your target study hours and exam deadlines.

---

## 🏗️ Multi-Agent Architecture

```mermaid
graph TD
    User([Student / User]) -->|Upload Text / PDF / OCR / Audio| A[1. Ingestion Agent]
    User -->|Ask Question| C[3. Retrieval / RAG Agent]
    User -->|Take Quiz| D[4. Quiz & Progress Agent]
    User -->|Set Deadline & Hours| E[5. Predictive Planner Agent]

    subgraph Multi-Agent Backend Engine
        A -->|Chunks & Embeddings| VS[(ChromaDB Vector Store)]
        A -->|Raw Text| B[2. Summarization & Concept Agent]
        
        B -->|Summaries & Q&A Flashcards| DB[(SQLite Database)]
        B -->|Visual Node Maps| DB

        VS -->|Top-K Context Chunks| C
        C -->|Context-Grounded Answers + Sources| User

        D -->|Scores & Attempt Metrics| DB
        DB -->|Historical Accuracy & Recency| E
        E -->|Time-Boxed Adaptive Schedule| Dashboard[React Dashboard UI]
    end
```

---

## 🤖 AI & Hugging Face Models

| Component / Task | Model / Library | Engine / Pipeline | Purpose |
|---|---|---|---|
| **RAG Embeddings** | `sentence-transformers/all-MiniLM-L6-v2` | SentenceTransformers | Dense 384-dimensional vector embeddings stored in ChromaDB |
| **Summarization** | `sshleifer/distilbart-cnn-12-6` / `facebook/bart-large-cnn` | HuggingFace Transformers | Concise executive summaries & key concept extraction |
| **Flashcard Generator** | `google/flan-t5-base` | Text2Text Pipeline | Extracting structured question-and-answer pairs |
| **Audio Ingestion** | `openai/whisper-tiny` / `openai/whisper-small` | Speech-Recognition | Transcribing recorded lectures & voice notes into text |
| **OCR Ingestion** | `pytesseract` / Pillow | Tesseract Engine | Extracting text from scanned notes & textbook page images |

---

## 📁 Repository Structure

```
GURU/
├── backend/
│   ├── app/
│   │   ├── agents/          # Multi-agent engines (Ingestion, Summarization, RAG, Quiz, Planner)
│   │   ├── database/        # SQLite database connection & ORM models
│   │   ├── routers/         # FastAPI API endpoints
│   │   ├── services/        # Vector store & Model loader services
│   │   ├── config.py        # System configuration & environment settings
│   │   └── main.py          # FastAPI application entrypoint
│   ├── seed_data/           # Sample CS & AI study materials for quick-start demo
│   ├── tests/               # Backend API unit tests
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── public/              # Static assets and icons
│   ├── src/
│   │   ├── api/             # Frontend API client
│   │   ├── components/      # Reusable React components (Flashcards, Concept Map, Navbar, etc.)
│   │   ├── pages/           # Application views (Dashboard, RAG Chat, Quiz, Planner, etc.)
│   │   ├── App.jsx          # Main React App router & layout
│   │   └── index.css        # Styling & design system tokens
│   ├── package.json         # Frontend Node.js dependencies
│   └── vite.config.js       # Vite development configuration
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)

### 1. Set Up & Launch Backend Server
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI backend server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
> The API documentation will be available interactively at `http://127.0.0.1:8000/docs`.

### 2. Set Up & Launch Frontend Client
```bash
# Open a new terminal tab and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
> Open your browser to `http://localhost:5173`.

---

## 💡 How to Use (Live Demo Workflow)

1. Click **"Load Seed Materials"** in the navigation bar to immediately populate the workspace with sample CS & AI study notes.
2. Go to **Ingestion Hub** to upload your own custom PDFs, notes, or image pages.
3. Open **Flashcards & Concept Map** to test your knowledge with 3D flip-cards and review visual node structures.
4. Launch **Ask GURU (RAG Chat)** to ask questions and receive context-grounded answers with direct citations.
5. Take auto-generated quizzes in **Quiz Center** to track your mastery.
6. Check **Adaptive Planner** to see your personal study schedule generated based on identified topic weaknesses.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
