import json
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import Topic, Material
from app.agents.ingestion_agent import ingestion_agent
from app.agents.summarization_agent import summarization_agent

router = APIRouter(prefix="/api/ingest", tags=["Ingestion"])

@router.post("/text")
def ingest_text(
    title: str = Form(...),
    text: str = Form(...),
    topic_name: str = Form("General"),
    exam_weight: float = Form(1.0),
    db: Session = Depends(get_db)
):
    topic = db.query(Topic).filter(Topic.name == topic_name).first()
    if not topic:
        topic = Topic(name=topic_name, exam_weight=exam_weight)
        db.add(topic)
        db.commit()
        db.refresh(topic)

    ingest_res = ingestion_agent.process_text_input(title, text, topic.id, db)
    concept_res = summarization_agent.process_material_concepts(ingest_res["material_id"], db)

    return {
        "status": "success",
        "ingestion": ingest_res,
        "concepts": concept_res
    }

@router.post("/pdf")
async def ingest_pdf(
    title: str = Form(...),
    topic_name: str = Form("General"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    topic = db.query(Topic).filter(Topic.name == topic_name).first()
    if not topic:
        topic = Topic(name=topic_name, exam_weight=1.2)
        db.add(topic)
        db.commit()
        db.refresh(topic)

    pdf_bytes = await file.read()
    ingest_res = ingestion_agent.process_pdf_input(title, pdf_bytes, topic.id, db)
    concept_res = summarization_agent.process_material_concepts(ingest_res["material_id"], db)

    return {
        "status": "success",
        "ingestion": ingest_res,
        "concepts": concept_res
    }

@router.post("/image")
async def ingest_image(
    title: str = Form(...),
    topic_name: str = Form("General"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    topic = db.query(Topic).filter(Topic.name == topic_name).first()
    if not topic:
        topic = Topic(name=topic_name, exam_weight=1.5)
        db.add(topic)
        db.commit()
        db.refresh(topic)

    image_bytes = await file.read()
    ingest_res = ingestion_agent.process_image_ocr(title, image_bytes, topic.id, db)
    concept_res = summarization_agent.process_material_concepts(ingest_res["material_id"], db)

    return {
        "status": "success",
        "ingestion": ingest_res,
        "concepts": concept_res
    }

@router.post("/audio")
async def ingest_audio(
    title: str = Form(...),
    topic_name: str = Form("General"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    topic = db.query(Topic).filter(Topic.name == topic_name).first()
    if not topic:
        topic = Topic(name=topic_name, exam_weight=1.0)
        db.add(topic)
        db.commit()
        db.refresh(topic)

    audio_bytes = await file.read()
    ingest_res = ingestion_agent.process_audio_speech(title, audio_bytes, topic.id, db)
    concept_res = summarization_agent.process_material_concepts(ingest_res["material_id"], db)

    return {
        "status": "success",
        "ingestion": ingest_res,
        "concepts": concept_res
    }
