import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import Topic, Material, Summary, Flashcard, ConceptNode

router = APIRouter(prefix="/api/materials", tags=["Materials"])

@router.get("/topics")
def list_topics(db: Session = Depends(get_db)):
    topics = db.query(Topic).all()
    res = []
    for t in topics:
        material_count = db.query(Material).filter(Material.topic_id == t.id).count()
        flashcard_count = db.query(Flashcard).filter(Flashcard.topic_id == t.id).count()
        res.append({
            "id": t.id,
            "name": t.name,
            "category": t.category,
            "exam_weight": t.exam_weight,
            "material_count": material_count,
            "flashcard_count": flashcard_count
        })
    return res

@router.get("/all")
def list_all_materials(db: Session = Depends(get_db)):
    materials = db.query(Material).all()
    return [
        {
            "id": m.id,
            "title": m.title,
            "file_type": m.file_type,
            "topic_id": m.topic_id,
            "topic_name": m.topic.name if m.topic else "General",
            "snippet": m.raw_text[:200] + "...",
            "created_at": m.created_at.isoformat()
        }
        for m in materials
    ]

@router.get("/flashcards")
def list_flashcards(topic_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Flashcard)
    if topic_id:
        query = query.filter(Flashcard.topic_id == topic_id)
    cards = query.all()
    return [
        {
            "id": c.id,
            "topic_id": c.topic_id,
            "topic_name": c.topic.name if c.topic else "General",
            "question": c.question,
            "answer": c.answer,
            "confidence_level": c.confidence_level
        }
        for c in cards
    ]

@router.post("/flashcards/{card_id}/confidence")
def update_flashcard_confidence(card_id: int, confidence: str, db: Session = Depends(get_db)):
    card = db.query(Flashcard).filter(Flashcard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    card.confidence_level = confidence
    db.commit()
    return {"status": "success", "card_id": card_id, "confidence": confidence}

@router.get("/summaries")
def list_summaries(db: Session = Depends(get_db)):
    summaries = db.query(Summary).all()
    res = []
    for s in summaries:
        takeaways = json.loads(s.key_takeaways) if s.key_takeaways else []
        res.append({
            "id": s.id,
            "topic_name": s.topic.name if s.topic else "General",
            "summary_text": s.summary_text,
            "key_takeaways": takeaways,
            "created_at": s.created_at.isoformat()
        })
    return res

@router.get("/concept-map")
def get_concept_map(topic_id: int = None, db: Session = Depends(get_db)):
    query = db.query(ConceptNode)
    if topic_id:
        query = query.filter(ConceptNode.topic_id == topic_id)
    nodes = query.all()
    return [
        {
            "id": n.id,
            "topic_id": n.topic_id,
            "label": n.label,
            "description": n.description,
            "parent_label": n.parent_label
        }
        for n in nodes
    ]
