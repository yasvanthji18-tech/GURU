import os
import json
from pathlib import Path
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import Topic, Material, QuizAttempt
from app.agents.ingestion_agent import ingestion_agent
from app.agents.summarization_agent import summarization_agent
from app.agents.quiz_agent import quiz_agent
from app.agents.planner_agent import planner_agent

router = APIRouter(prefix="/api/seed", tags=["Seed"])

@router.post("")
def seed_database(db: Session = Depends(get_db)):
    seed_path = Path(__file__).resolve().parent.parent.parent / "seed_data" / "sample_notes.json"
    if not seed_path.exists():
        return {"status": "error", "message": "Seed file not found"}

    with open(seed_path, "r", encoding="utf-8") as f:
        notes_data = json.load(f)

    seeded_materials = []
    for item in notes_data:
        topic_name = item["topic_name"]
        exam_w = item.get("exam_weight", 1.5)

        topic = db.query(Topic).filter(Topic.name == topic_name).first()
        if not topic:
            topic = Topic(name=topic_name, category="Computer Science", exam_weight=exam_w)
            db.add(topic)
            db.commit()
            db.refresh(topic)

        # Ingest text & generate concepts
        ingest_res = ingestion_agent.process_text_input(
            title=item["title"],
            text=item["text"],
            topic_id=topic.id,
            db=db
        )
        concept_res = summarization_agent.process_material_concepts(ingest_res["material_id"], db)

        # Generate sample quiz & add initial attempts
        quiz_res = quiz_agent.generate_quiz_for_topic(topic.id, db, num_questions=3)
        # Add sample attempt
        sample_score = 1 if "Concurrency" in topic_name else (2 if "Indexing" in topic_name else 3)
        attempt = QuizAttempt(
            quiz_id=quiz_res["quiz_id"],
            topic_id=topic.id,
            score=sample_score,
            total_questions=3,
            score_percentage=round((sample_score / 3.0) * 100, 1)
        )
        db.add(attempt)
        db.commit()

        seeded_materials.append(item["title"])

    # Generate initial study plan
    planner_agent.generate_adaptive_study_plan(days_until_exam=7, daily_minutes=120, db=db)

    return {
        "status": "success",
        "message": f"Successfully seeded {len(seeded_materials)} CS/AI study modules!",
        "materials": seeded_materials
    }
