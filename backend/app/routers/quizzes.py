from typing import Dict
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.agents.quiz_agent import quiz_agent
from app.database.models import QuizAttempt, Topic, Quiz

router = APIRouter(prefix="/api/quizzes", tags=["Quizzes"])

class QuizSubmitReq(BaseModel):
    quiz_id: int
    answers: Dict[int, str]

@router.get("/generate/{topic_id}")
def generate_quiz(topic_id: int, num_questions: int = 3, db: Session = Depends(get_db)):
    res = quiz_agent.generate_quiz_for_topic(topic_id, db, num_questions)
    return res

@router.post("/submit")
def submit_quiz(req: QuizSubmitReq, db: Session = Depends(get_db)):
    res = quiz_agent.submit_quiz_attempt(req.quiz_id, req.answers, db)
    return res

@router.get("/history")
def get_quiz_history(db: Session = Depends(get_db)):
    attempts = db.query(QuizAttempt).order_by(QuizAttempt.completed_at.desc()).all()
    res = []
    for a in attempts:
        topic_name = a.topic.name if a.topic else "General"
        res.append({
            "id": a.id,
            "quiz_id": a.quiz_id,
            "topic_id": a.topic_id,
            "topic_name": topic_name,
            "score": a.score,
            "total_questions": a.total_questions,
            "score_percentage": a.score_percentage,
            "completed_at": a.completed_at.strftime("%Y-%m-%d %H:%M")
        })
    return res
