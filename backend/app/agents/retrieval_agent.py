import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.services.vector_store import vector_store_service
from app.services.model_loader import model_loader
from app.database.models import Chunk, Material, Topic

logger = logging.getLogger("guru.agents.retrieval")

class RetrievalRAGAgent:
    """
    Retrieval / RAG Agent:
    - Embeds queries with sentence-transformers/all-MiniLM-L6-v2
    - Retrieves top-k relevant material chunks from ChromaDB
    - Constructs context-grounded prompt to prevent hallucinations
    - Synthesizes precise answer with exact source citations
    """

    def answer_question(self, question: str, topic_id: int = None, top_k: int = 3, db: Session = None) -> Dict[str, Any]:
        # 1. Retrieve top-k chunks from ChromaDB vector store
        similar_chunks = vector_store_service.query_similar(query=question, top_k=top_k)

        if not similar_chunks:
            return {
                "question": question,
                "answer": "No relevant study materials found in GURU knowledge base for this question. Please upload notes or textbook pages on this topic first.",
                "sources": [],
                "confidence": "Low"
            }

        # 2. Extract context & citations
        context_passages = []
        sources = []

        for idx, item in enumerate(similar_chunks):
            chunk_text = item['text']
            meta = item.get('metadata', {})
            material_title = meta.get('title', 'Study Material')
            topic_id_meta = meta.get('topic_id', None)

            context_passages.append(f"[Source {idx+1}: {material_title}]\n{chunk_text}")
            sources.append({
                "source_id": idx + 1,
                "title": material_title,
                "snippet": chunk_text[:180] + ("..." if len(chunk_text) > 180 else ""),
                "relevance_score": round(max(0.0, 1.0 - item.get('distance', 0.5)), 3)
            })

        full_context = "\n\n".join(context_passages)

        # 3. Generate grounded answer via FLAN-T5 LLM or context synthesis
        synthesized_answer = None

        # Check if local text generator is cached and available
        try:
            flan_gen = model_loader.get_text_generator()
            if flan_gen:
                prompt = f"Answer the student's question based strictly on this context: {full_context[:600]}\nQuestion: {question}\nAnswer:"
                res = flan_gen(prompt, max_length=150)
                if res and isinstance(res, list) and 'generated_text' in res[0]:
                    ans = res[0]['generated_text'].strip()
                    if len(ans) > 15:
                        synthesized_answer = ans
        except Exception as e:
            logger.warning(f"FLAN-T5 QA synthesis warning: {e}")

        # High-quality grounded fallback synthesizer using retrieved knowledge chunks
        if not synthesized_answer:
            primary_title = sources[0]['title']
            primary_chunk = similar_chunks[0]['text'].strip()
            
            if len(similar_chunks) > 1:
                secondary_chunk = similar_chunks[1]['text'].strip()
                synthesized_answer = (
                    f"Based on your study notes ('{primary_title}'):\n\n"
                    f"• {primary_chunk}\n\n"
                    f"Additionally ({sources[1]['title']}): {secondary_chunk}"
                )
            else:
                synthesized_answer = (
                    f"Based on your study notes ('{primary_title}'):\n\n"
                    f"{primary_chunk}"
                )

        return {
            "question": question,
            "answer": synthesized_answer,
            "sources": sources,
            "retrieved_chunk_count": len(similar_chunks),
            "confidence": "High" if sources and sources[0]['relevance_score'] > 0.4 else "Medium"
        }

retrieval_agent = RetrievalRAGAgent()
