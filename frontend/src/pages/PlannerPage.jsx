import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Flame, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

export default function PlannerPage() {
  const [days, setDays] = useState(7);
  const [minutes, setMinutes] = useState(120);
  const [plan, setPlan] = useState(null);
  const [weakTopics, setWeakTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPlan = async (d = days, m = minutes) => {
    setLoading(true);
    try {
      const [planData, weakData] = await Promise.all([
        api.generateStudyPlan(d, m),
        api.getWeakTopics()
      ]);
      setPlan(planData);
      setWeakTopics(weakData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleUpdate = (e) => {
    e.preventDefault();
    fetchPlan(days, minutes);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white font-outfit flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-400" />
          Predictive & Agentic Study Planner
        </h2>
        <p className="text-sm text-gray-400">
          Ranked topic focus and time-boxed study allocations computed from quiz accuracy, past exam syllabus frequency, and recency.
        </p>
      </div>

      {/* Control Panel */}
      <form onSubmit={handleUpdate} className="glass-panel p-6 rounded-2xl border border-indigo-500/20 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-400" /> Days Remaining Until Exam
          </label>
          <input
            type="number"
            min={1}
            max={60}
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value) || 7)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-400" /> Target Daily Study Time (Minutes)
          </label>
          <input
            type="number"
            min={30}
            max={600}
            step={15}
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value) || 120)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none font-bold"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-Calculate Adaptive Plan</span>
        </button>
      </form>

      {/* Generated Schedule Timetable */}
      {plan && plan.schedule && plan.schedule.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white font-outfit">Prioritized Topic Timetable:</h3>

          <div className="space-y-3">
            {plan.schedule.map((item) => (
              <div key={item.topic_id} className="glass-panel p-5 rounded-2xl border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel-hover">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                    item.rank === 1 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-gray-800 text-gray-300'
                  }`}>
                    #{item.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white font-outfit">{item.topic_name}</h4>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        item.priority_level === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {item.priority_level} Focus
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Algorithm Rationale: {item.rationale}</p>
                  </div>
                </div>

                {/* Duration Badge & Actions */}
                <div className="flex flex-col md:items-end gap-1.5 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-800">
                  <div className="text-sm font-extrabold text-indigo-300">
                    {item.allocated_daily_mins} mins / day ({item.allocated_total_mins} mins total)
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-2">
                    <span>Weakness Score: <strong>{item.weakness_score}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak-Area Score Breakdown Table */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 space-y-4">
        <h3 className="text-base font-bold text-white font-outfit">Explainable Weak-Area Score Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 px-2">Topic Name</th>
                <th className="pb-3 px-2">Quiz Accuracy</th>
                <th className="pb-3 px-2">Past-Exam Weight</th>
                <th className="pb-3 px-2">Recency</th>
                <th className="pb-3 px-2 text-right">Weakness Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-300">
              {weakTopics.map((wt) => (
                <tr key={wt.topic_id} className="hover:bg-gray-900/50">
                  <td className="py-3 px-2 font-bold text-white">{wt.topic_name}</td>
                  <td className="py-3 px-2">{wt.avg_accuracy_pct}%</td>
                  <td className="py-3 px-2 text-amber-400 font-semibold">x{wt.exam_weight}</td>
                  <td className="py-3 px-2 text-gray-400">{wt.days_since_reviewed} days ago</td>
                  <td className="py-3 px-2 text-right font-extrabold text-indigo-400 text-sm">{wt.weakness_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
