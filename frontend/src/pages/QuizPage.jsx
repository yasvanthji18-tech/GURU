import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { api } from '../api/client';

export default function QuizPage({ onQuizCompleted }) {
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const loadInitial = async () => {
    try {
      const [tData, hData] = await Promise.all([
        api.getTopics(),
        api.getQuizHistory()
      ]);
      setTopics(tData || []);
      setHistory(hData || []);
      if (tData && tData.length > 0) {
        setSelectedTopicId(tData[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const handleGenerateQuiz = async () => {
    if (!selectedTopicId) return alert('Please select a study topic.');
    setLoading(true);
    setQuiz(null);
    setResult(null);
    setUserAnswers({});

    try {
      const res = await api.generateQuiz(selectedTopicId, 3);
      setQuiz(res);
    } catch (e) {
      console.error(e);
      alert('Error generating quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    setLoading(true);

    try {
      const res = await api.submitQuiz(quiz.quiz_id, userAnswers);
      setResult(res);
      const hData = await api.getQuizHistory();
      setHistory(hData || []);
      if (onQuizCompleted) onQuizCompleted();
    } catch (e) {
      console.error(e);
      alert('Error submitting quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Topic Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-outfit flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            Quiz & Mastery Station
          </h2>
          <p className="text-sm text-gray-400">
            Auto-generated quizzes evaluate topic retention and automatically re-calculate your Predictive Planner scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedTopicId || ''}
            onChange={(e) => setSelectedTopicId(parseInt(e.target.value))}
            className="px-3.5 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-xs text-white focus:outline-none cursor-pointer"
          >
            {topics.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <button
            onClick={handleGenerateQuiz}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Generate Quiz</span>
          </button>
        </div>
      </div>

      {/* Main Quiz Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz Runner Panel */}
        <div className="lg:col-span-2 space-y-6">
          {quiz && !result && (
            <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-lg font-bold text-white font-outfit">{quiz.title}</h3>
                <span className="text-xs text-amber-400 font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                  {quiz.questions.length} Questions
                </span>
              </div>

              <div className="space-y-6">
                {quiz.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-3">
                    <h4 className="font-bold text-white text-sm font-outfit">
                      {idx + 1}. {q.question_text}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {Object.entries(q.options).map(([optKey, optText]) => {
                        const isSelected = userAnswers[q.id] === optKey;
                        return (
                          <button
                            key={optKey}
                            onClick={() => handleSelectOption(q.id, optKey)}
                            className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer font-medium ${
                              isSelected
                                ? 'bg-indigo-600/30 text-white border-indigo-500 shadow-md'
                                : 'bg-gray-950/60 text-gray-300 border-gray-800 hover:border-gray-700'
                            }`}
                          >
                            <span className="font-bold text-indigo-400 mr-2">{optKey}.</span>
                            {optText}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmitQuiz}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Submit Quiz Answers</span>
              </button>
            </div>
          )}

          {/* Results Summary Box */}
          {result && (
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-6 bg-gradient-to-b from-emerald-950/20 to-gray-950">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Quiz Completed</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1 font-outfit">
                    Score: {result.score_percentage}% ({result.score} / {result.total})
                  </h3>
                </div>
                <button
                  onClick={handleGenerateQuiz}
                  className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-xs font-bold text-white border border-gray-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                </button>
              </div>

              {/* Detail Breakdown */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white">Answer Breakdown & Explanations:</h4>
                {result.details.map((d, i) => (
                  <div key={i} className={`p-4 rounded-xl border space-y-2 ${
                    d.is_correct ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Question {i+1}</span>
                      <span className={`text-xs font-bold flex items-center gap-1 ${d.is_correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {d.is_correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {d.is_correct ? 'Correct (+100%)' : 'Incorrect'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white">{d.question_text}</p>
                    <p className="text-xs text-gray-300">
                      Correct Option: <strong>{d.correct_answer}</strong>
                    </p>
                    <p className="text-xs text-gray-400 italic">"{d.explanation}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!quiz && !result && (
            <div className="p-12 text-center glass-panel rounded-2xl border border-gray-800 text-gray-400">
              <Award className="w-10 h-10 text-amber-400 mx-auto mb-3 opacity-60" />
              <p className="text-base font-semibold text-white">Ready to test your topic retention?</p>
              <p className="text-xs text-gray-500 mt-1">Select a topic above and click "Generate Quiz" to begin.</p>
            </div>
          )}
        </div>

        {/* History Log Sidebar */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 space-y-4">
          <h3 className="text-base font-bold text-white font-outfit">Quiz History Log</h3>
          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {history.map((h) => (
              <div key={h.id} className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[130px]">{h.topic_name}</h4>
                  <p className="text-[11px] text-gray-500">{h.completed_at}</p>
                </div>
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                  h.score_percentage >= 70 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {h.score_percentage}%
                </span>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-6">No previous attempts logged.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
