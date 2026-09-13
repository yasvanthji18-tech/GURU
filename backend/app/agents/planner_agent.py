import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.database.models import Topic, QuizAttempt, StudyPlan

logger = logging.getLogger("guru.agents.planner")

class PredictivePlannerAgent:
    """
    Predictive & Agentic Planner Agent:
    - Analyzes student quiz performance, recency, and past-exam syllabus weights
    - Computes explainable Weak-Area Scores per topic
    - Outputs a prioritized, time-boxed study plan with topic rankings and allocated study durations
    """

    def compute_topic_weakness_scores(self, db: Session) -> List[Dict[str, Any]]:
        topics = db.query(Topic).all()
        topic_scores = []

        now = datetime.utcnow()

        for topic in topics:
            attempts = db.query(QuizAttempt).filter(QuizAttempt.topic_id == topic.id).all()

            if attempts:
                avg_accuracy = sum(a.score_percentage for a in attempts) / len(attempts) / 100.0
                last_attempt = max(attempts, key=lambda a: a.completed_at)
                days_since = (now - last_attempt.completed_at).days
            else:
                avg_accuracy = 0.5 # Default un-assessed assumption
                days_since = 14 # 2 weeks assumed un-reviewed

            # Accuracy weight (45%), Exam weight (35%), Recency factor (20%)
            accuracy_weakness = 1.0 - avg_accuracy
            exam_weight = topic.exam_weight if topic.exam_weight else 1.0
            recency_factor = min(1.0, days_since / 10.0)

            # Combined explainable weak area score (0.0 to 10.0)
            combined_score = round(
                (accuracy_weakness * 4.5) + (min(exam_weight, 3.0) * 3.5) + (recency_factor * 2.0),
                2
            )

            priority_level = "High" if combined_score > 6.0 else ("Medium" if combined_score > 3.5 else "Low")

            topic_scores.append({
                "topic_id": topic.id,
                "topic_name": topic.name,
                "category": topic.category,
                "avg_accuracy_pct": round(avg_accuracy * 100, 1),
                "exam_weight": exam_weight,
                "days_since_reviewed": days_since,
                "weakness_score": combined_score,
                "priority_level": priority_level,
                "rationale": (
                    f"{'Low accuracy (' + str(round(avg_accuracy*100,1)) + '%)' if avg_accuracy < 0.6 else 'Recent practice'} "
                    f"+ High exam frequency (x{exam_weight})"
                )
            })

        # Sort topics descending by weakness score (highest focus needed first)
        topic_scores.sort(key=lambda x: x["weakness_score"], reverse=True)
        return topic_scores

    def generate_adaptive_study_plan(
        self,
        days_until_exam: int,
        daily_minutes: int,
        db: Session
    ) -> Dict[str, Any]:
        scored_topics = self.compute_topic_weakness_scores(db)

        if not scored_topics:
            return {
                "days_until_exam": days_until_exam,
                "daily_minutes": daily_minutes,
                "schedule": [],
                "top_recommendation": "Ingest study materials to generate personalized plan."
            }

        total_weakness = sum(t["weakness_score"] for t in scored_topics) or 1.0
        total_available_minutes = days_until_exam * daily_minutes

        ranked_plan = []
        for rank, item in enumerate(scored_topics, 1):
            share_ratio = item["weakness_score"] / total_weakness
            allocated_total_mins = int(total_available_minutes * share_ratio)
            allocated_daily_mins = int(daily_minutes * share_ratio)

            ranked_plan.append({
                "rank": rank,
                "topic_id": item["topic_id"],
                "topic_name": item["topic_name"],
                "priority_level": item["priority_level"],
                "weakness_score": item["weakness_score"],
                "allocated_daily_mins": max(15, allocated_daily_mins),
                "allocated_total_mins": max(30, allocated_total_mins),
                "suggested_actions": [
                    f"Review flashcards for {item['topic_name']}",
                    f"Ask GURU RAG Chat 2 questions on weak concepts",
                    f"Take a 5-question practice quiz"
                ],
                "rationale": item["rationale"]
            })

        plan_data = {
            "days_until_exam": days_until_exam,
            "daily_minutes": daily_minutes,
            "total_topics": len(ranked_plan),
            "top_priority": ranked_plan[0]["topic_name"] if ranked_plan else "None",
            "schedule": ranked_plan
        }

        # Persist generated plan in DB
        study_plan_db = StudyPlan(
            days_until_exam=days_until_exam,
            daily_minutes=daily_minutes,
            plan_json=json.dumps(plan_data)
        )
        db.add(study_plan_db)
        db.commit()

        return plan_data

planner_agent = PredictivePlannerAgent()
