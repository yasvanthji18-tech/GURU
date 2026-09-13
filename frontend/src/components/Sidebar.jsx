import React from 'react';
import { LayoutDashboard, Upload, BookOpen, MessageSquare, Award, Calendar } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ingest', label: 'Ingestion Hub', icon: Upload },
    { id: 'flashcards', label: 'Flashcards & Concept Map', icon: BookOpen },
    { id: 'rag', label: 'Ask GURU (RAG Chat)', icon: MessageSquare },
    { id: 'quizzes', label: 'Quiz Center', icon: Award },
    { id: 'planner', label: 'Adaptive Planner', icon: Calendar },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-indigo-500/10 p-4 flex flex-col justify-between hidden lg:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
          Study Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-white border border-indigo-500/40 shadow-inner'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Model Info Card */}
      <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 text-xs text-gray-400 space-y-2">
        <div className="flex items-center justify-between text-gray-300 font-medium">
          <span>HF Local Pipeline</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>
        <div className="space-y-1 text-[11px] text-gray-400">
          <p>• MiniLM-L6-v2 Embeddings</p>
          <p>• DistilBART Summarization</p>
          <p>• FLAN-T5 Instruction Q&A</p>
          <p>• Whisper STT & pytesseract</p>
        </div>
      </div>
    </aside>
  );
}
