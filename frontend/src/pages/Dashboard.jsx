import React, { useState, useEffect } from 'react';
import { BookOpen, Award, Flame, Target, ArrowRight, Brain, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import MetricCard from '../components/MetricCard';
import { api } from '../api/client';

export default function Dashboard({ setActiveTab }) {
  const [topics, setTopics] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tData, wData, qData, pData] = await Promise.all([
        api.getTopics(),
        api.getWeakTopics(),
        api.getQuizHistory(),
        api.generateStudyPlan(7, 120)
      ]);
      setTopics(tData || []);
      setWeakTopics(wData || []);
      setQuizHistory(qData || []);
      setPlan(pData || null);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute stats
  const totalMaterials = topics.reduce((acc, t) => acc + (t.material_count || 0), 0);
  const totalFlashcards = topics.reduce((acc, t) => acc + (t.flashcard_count || 0), 0);
  const avgQuizScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((acc, q) => acc + q.score_percentage, 0) / quizHistory.length)
    : 0;

  // Chart dataset for Weak Topic Heatmap/Rankings
  const weakTopicChartData = weakTopics.map(t => ({
    name: t.topic_name.length > 15 ? t.topic_name.substring(0, 15) + '...' : t.topic_name,
    Score: t.weakness_score,
    Accuracy: t.avg_accuracy_pct,
    Weight: t.exam_weight
  }));

  // Chart dataset for Quiz score history
  const quizTrendData = quizHistory.slice(0, 7).reverse().map((q, idx) => ({
    attempt: `Quiz #${idx + 1}`,
    Score: q.score_percentage,
    topic: q.topic_name
  }));

  return (
    <div className="space-[# dashboard page] space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-gray-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> System Operational
            </span>
            <span className="text-xs text-gray-400">Exam Countdown: <strong>7 Days</strong></span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-2 font-outfit">
            Welcome back to <span className="text-gradient-purple">GURU AI</span>
          </h2>
          <p className="text-sm text-gray-300 mt-1 max-w-xl">
            Your personalized study companion has analyzed your ingested notes and quiz attempts. Review weak area rankings below.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('rag')}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 shrink-0"
        >
          <Brain className="w-4 h-4 text-purple-200" />
          <span>Ask GURU RAG Chat</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Topics Ingested"
          value={topics.length}
          subtitle={`${totalMaterials} Documents Processed`}
          icon={BookOpen}
          color="indigo"
        />
        <MetricCard
          title="Flashcards Generated"
          value={totalFlashcards}
          subtitle="Interactive Q&A Cards"
          icon={Brain}
          color="emerald"
        />
        <MetricCard
          title="Average Quiz Score"
          value={`${avgQuizScore}%`}
          subtitle={`${quizHistory.length} Total Quizzes Taken`}
          icon={Award}
          color="amber"
        />
        <MetricCard
          title="Study Plan Priority"
          value={plan?.top_priority ? (plan.top_priority.length > 14 ? plan.top_priority.substring(0, 14) + '...' : plan.top_priority) : 'None'}
          subtitle="Top Focus Recommendation"
          icon={Flame}
          color="rose"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak Topic Priority Heatmap Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Weak-Topic Priority Ranking
              </h3>
              <p className="text-xs text-gray-400">Higher weakness score = higher recommended study time</p>
            </div>
            <button
              onClick={() => setActiveTab('planner')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              View Plan <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64 w-full">
            {weakTopicChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weakTopicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="Score" fill="#818cf8" radius={[6, 6, 0, 0]} name="Weakness Score" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">
                Click "Load Seed Materials" above to populate charts
              </div>
            )}
          </div>
        </div>

        {/* Quiz Accuracy Trend Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Quiz Score Trend (%)
              </h3>
              <p className="text-xs text-gray-400">Score progress logged over recent quiz attempts</p>
            </div>
            <button
              onClick={() => setActiveTab('quizzes')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              Take Quiz <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64 w-full">
            {quizTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quizTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="attempt" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="Score" stroke="#34d399" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} name="Score %" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">
                No quiz history yet. Take your first quiz!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Focus Next Recommended Schedule Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-rose-400 animate-bounce" />
            <h3 className="text-lg font-bold text-white font-outfit">Focus Next — Recommended Study Schedule</h3>
          </div>
          <span className="text-xs text-gray-400">Time-boxed allocation (120 min/day target)</span>
        </div>

        {plan && plan.schedule && plan.schedule.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plan.schedule.slice(0, 3).map((item) => (
              <div key={item.topic_id} className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    item.priority_level === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    Rank #{item.rank} • {item.priority_level} Priority
                  </span>
                  <span className="text-xs font-semibold text-indigo-400">{item.allocated_daily_mins} mins/day</span>
                </div>
                <h4 className="font-bold text-white text-base font-outfit">{item.topic_name}</h4>
                <p className="text-xs text-gray-400">{item.rationale}</p>
                <div className="pt-2 border-t border-gray-800 space-y-1">
                  {item.suggested_actions.slice(0, 2).map((act, i) => (
                    <div key={i} className="text-[11px] text-gray-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-gray-500">
            No active plan. Click "Load Seed Materials" to auto-generate study schedule.
          </div>
        )}
      </div>
    </div>
  );
}
