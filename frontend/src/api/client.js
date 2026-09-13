const API_BASE = '/api';

export const api = {
  // Ingestion
  async ingestText(formData) {
    const res = await fetch(`${API_BASE}/ingest/text`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async ingestPdf(formData) {
    const res = await fetch(`${API_BASE}/ingest/pdf`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async ingestImage(formData) {
    const res = await fetch(`${API_BASE}/ingest/image`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async ingestAudio(formData) {
    const res = await fetch(`${API_BASE}/ingest/audio`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async seedDemoData() {
    const res = await fetch(`${API_BASE}/seed`, { method: 'POST' });
    return res.json();
  },

  // Materials & Concepts
  async getTopics() {
    const res = await fetch(`${API_BASE}/materials/topics`);
    return res.json();
  },

  async getAllMaterials() {
    const res = await fetch(`${API_BASE}/materials/all`);
    return res.json();
  },

  async getFlashcards(topicId = null) {
    const url = topicId ? `${API_BASE}/materials/flashcards?topic_id=${topicId}` : `${API_BASE}/materials/flashcards`;
    const res = await fetch(url);
    return res.json();
  },

  async updateFlashcardConfidence(cardId, confidence) {
    const res = await fetch(`${API_BASE}/materials/flashcards/${cardId}/confidence?confidence=${confidence}`, {
      method: 'POST'
    });
    return res.json();
  },

  async getSummaries() {
    const res = await fetch(`${API_BASE}/materials/summaries`);
    return res.json();
  },

  async getConceptMap(topicId = null) {
    const url = topicId ? `${API_BASE}/materials/concept-map?topic_id=${topicId}` : `${API_BASE}/materials/concept-map`;
    const res = await fetch(url);
    return res.json();
  },

  // RAG QA
  async askRAG(question, topicId = null, topK = 3) {
    const payload = { question, top_k: topK };
    if (topicId !== null && topicId !== undefined) {
      payload.topic_id = topicId;
    }
    const res = await fetch(`${API_BASE}/rag/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Server status ${res.status}: Failed to retrieve answer`);
    }
    return res.json();
  },

  // Quizzes
  async generateQuiz(topicId, numQuestions = 3) {
    const res = await fetch(`${API_BASE}/quizzes/generate/${topicId}?num_questions=${numQuestions}`);
    return res.json();
  },

  async submitQuiz(quizId, answers) {
    const res = await fetch(`${API_BASE}/quizzes/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quiz_id: quizId, answers })
    });
    return res.json();
  },

  async getQuizHistory() {
    const res = await fetch(`${API_BASE}/quizzes/history`);
    return res.json();
  },

  // Planner
  async getWeakTopics() {
    const res = await fetch(`${API_BASE}/planner/weak-topics`);
    return res.json();
  },

  async generateStudyPlan(daysUntilExam = 7, dailyMinutes = 120) {
    const res = await fetch(`${API_BASE}/planner/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days_until_exam: daysUntilExam, daily_minutes: dailyMinutes })
    });
    return res.json();
  }
};
