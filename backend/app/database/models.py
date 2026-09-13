import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    category = Column(String(100), default="General")
    exam_weight = Column(Float, default=1.0) # Frequency in past exams / syllabus weight
    created_at = Column(DateTime, default=datetime.utcnow)

    materials = relationship("Material", back_populates="topic", cascade="all, delete-orphan")
    summaries = relationship("Summary", back_populates="topic", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="topic", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="topic", cascade="all, delete-orphan")

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    file_type = Column(String(50), nullable=False) # 'text', 'pdf', 'image', 'audio'
    file_path = Column(String(500), nullable=True)
    raw_text = Column(Text, nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("Topic", back_populates="materials")
    chunks = relationship("Chunk", back_populates="material", cascade="all, delete-orphan")

class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=False)
    text = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    embedding_id = Column(String(100), nullable=True)

    material = relationship("Material", back_populates="chunks")

class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=True)
    summary_text = Column(Text, nullable=False)
    key_takeaways = Column(Text, nullable=True) # JSON list
    created_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("Topic", back_populates="summaries")

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    confidence_level = Column(String(20), default="medium") # easy, medium, hard
    created_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("Topic", back_populates="flashcards")

class ConceptNode(Base):
    __tablename__ = "concept_nodes"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    label = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    parent_label = Column(String(150), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    title = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(300), nullable=False)
    option_b = Column(String(300), nullable=False)
    option_c = Column(String(300), nullable=False)
    option_d = Column(String(300), nullable=False)
    correct_option = Column(String(10), nullable=False) # 'A', 'B', 'C', 'D'
    explanation = Column(Text, nullable=True)

    quiz = relationship("Quiz", back_populates="questions")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    score_percentage = Column(Float, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)

    topic = relationship("Topic", back_populates="quiz_attempts")

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    days_until_exam = Column(Integer, nullable=False, default=7)
    daily_minutes = Column(Integer, nullable=False, default=120)
    plan_json = Column(Text, nullable=False) # JSON object
    created_at = Column(DateTime, default=datetime.utcnow)
