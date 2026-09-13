from typing import Optional
from fastapi import APIRouter, Depends, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.agents.retrieval_agent import retrieval_agent

router = APIRouter(prefix="/api/rag", tags=["RAG QA"])

class RAGQuery(BaseModel):
    question: str
    topic_id: Optional[int] = None
    top_k: int = 3

@router.post("/ask")
def ask_question(req: RAGQuery, db: Session = Depends(get_db)):
    res = retrieval_agent.answer_question(
        question=req.question,
        topic_id=req.topic_id,
        top_k=req.top_k,
        db=db
    )
    return res
