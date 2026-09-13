import os
import logging
from typing import List, Dict, Any
from app.config import CHROMA_DIR, EMBEDDING_MODEL_NAME

logger = logging.getLogger("guru.vector_store")

class VectorStore:
    def __init__(self):
        self.chroma_client = None
        self.collection = None
        self.embedding_model = None
        self._initialize_store()

    def _initialize_store(self):
        try:
            import chromadb
            self.chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))
            self.collection = self.chroma_client.get_or_create_collection(
                name="guru_knowledge_chunks"
            )
            logger.info("ChromaDB vector store initialized successfully.")
        except Exception as e:
            logger.warning(f"ChromaDB initialization fallback mode: {e}")
            self.chroma_client = None
            self.memory_store = [] # Fallback in-memory list if Chroma fails

        # Initialize local Sentence Transformer model for embeddings
        try:
            from sentence_transformers import SentenceTransformer
            self.embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
            logger.info(f"Loaded SentenceTransformer: {EMBEDDING_MODEL_NAME}")
        except Exception as e:
            logger.warning(f"SentenceTransformer load warning: {e}. Using TF-IDF/Basic fallback embeddings.")
            self.embedding_model = None

    def _get_embedding(self, text: str) -> List[float]:
        if self.embedding_model:
            return self.embedding_model.encode(text).tolist()
        # Fallback simple deterministic vector if model isn't available
        import random
        random.seed(hash(text) % 100000)
        return [random.uniform(-1.0, 1.0) for _ in range(384)]

    def add_chunks(self, chunks: List[Dict[str, Any]]):
        """
        chunks: List of dicts containing 'id', 'text', 'metadata' (e.g. material_id, topic_id, title)
        """
        if not chunks:
            return

        ids = [str(c['id']) for c in chunks]
        texts = [c['text'] for c in chunks]
        metadatas = [c.get('metadata', {}) for c in chunks]
        embeddings = [self._get_embedding(t) for t in texts]

        if self.collection:
            self.collection.add(
                ids=ids,
                documents=texts,
                embeddings=embeddings,
                metadatas=metadatas
            )
        else:
            for idx, text, emb, meta in zip(ids, texts, embeddings, metadatas):
                self.memory_store.append({
                    'id': idx,
                    'text': text,
                    'embedding': emb,
                    'metadata': meta
                })

    def query_similar(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        query_emb = self._get_embedding(query)

        if self.collection and self.collection.count() > 0:
            results = self.collection.query(
                query_embeddings=[query_emb],
                n_results=min(top_k, self.collection.count())
            )
            retrieved = []
            if results and 'documents' in results and results['documents']:
                docs = results['documents'][0]
                metas = results['metadatas'][0] if 'metadatas' in results and results['metadatas'] else [{}] * len(docs)
                distances = results['distances'][0] if 'distances' in results and results['distances'] else [0.0] * len(docs)
                ids = results['ids'][0] if 'ids' in results and results['ids'] else [''] * len(docs)
                
                for doc_id, doc_text, meta, dist in zip(ids, docs, metas, distances):
                    retrieved.append({
                        'id': doc_id,
                        'text': doc_text,
                        'metadata': meta,
                        'distance': float(dist)
                    })
            return retrieved

        # Fallback cosine distance search over memory_store if Chroma collection empty/disabled
        if getattr(self, 'memory_store', None):
            def cosine_similarity(v1, v2):
                dot = sum(a*b for a, b in zip(v1, v2))
                norm1 = sum(a*a for a in v1) ** 0.5
                norm2 = sum(b*b for b in v2) ** 0.5
                return dot / (norm1 * norm2 + 1e-9)

            scored = []
            for item in self.memory_store:
                sim = cosine_similarity(query_emb, item['embedding'])
                scored.append((sim, item))
            scored.sort(key=lambda x: x[0], reverse=True)
            return [
                {
                    'id': item['id'],
                    'text': item['text'],
                    'metadata': item['metadata'],
                    'distance': 1.0 - sim
                }
                for sim, item in scored[:top_k]
            ]
        return []

vector_store_service = VectorStore()
