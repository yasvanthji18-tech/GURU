import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import init_db
from app.routers import ingestion, materials, rag, quizzes, planner, seed

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("guru.main")

app = FastAPI(
    title="GURU — Agentic AI Study Companion API",
    description="Multimodal Ingestion, RAG Retrieval, Summarization, Quiz, & Adaptive Planner Pipeline",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite port 5173 / localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register agent routers
app.include_router(ingestion.router)
app.include_router(materials.router)
app.include_router(rag.router)
app.include_router(quizzes.router)
app.include_router(planner.router)
app.include_router(seed.router)

@app.on_event("startup")
def startup_event():
    logger.info("Initializing GURU SQLite Database & Vector Store...")
    init_db()

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "app": "GURU AI Study Companion",
        "agents": [
            "Ingestion Agent",
            "Summarization & Concept Agent",
            "Retrieval / RAG Layer Agent",
            "Quiz & Progress Agent",
            "Predictive Planner Agent"
        ]
    }
