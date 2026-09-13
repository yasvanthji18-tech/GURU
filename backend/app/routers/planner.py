from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.agents.planner_agent import planner_agent

router = APIRouter(prefix="/api/planner", tags=["Planner"])

class PlanGenerateReq(BaseModel):
    days_until_exam: int = 7
    daily_minutes: int = 120

@router.get("/weak-topics")
def get_weak_topics(db: Session = Depends(get_db)):
    scores = planner_agent.compute_topic_weakness_scores(db)
    return scores

@router.post("/generate")
def generate_study_plan(req: PlanGenerateReq, db: Session = Depends(get_db)):
    plan = planner_agent.generate_adaptive_study_plan(
        days_until_exam=req.days_until_exam,
        daily_minutes=req.daily_minutes,
        db=db
    )
    return plan
