import React, { useState } from 'react';
import { Brain, Sparkles, Database, RefreshCw, Cpu, Layers } from 'lucide-react';
import { api } from '../api/client';

export default function Navbar({ onSeedSuccess }) {
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await api.seedDemoData();
      if (onSeedSuccess) onSeedSuccess();
      alert(`✨ ${res.message}`);
    } catch (e) {
      console.error(e);
      alert('Error seeding demo dataset.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-indigo-500/10 px-6 py-3.5 flex items-center justify-between">
      {/* Brand logo & tagline */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
            <Brain className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-white font-outfit">
              GURU <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AGENTIC AI</span>
            </h1>
          </div>
          <p className="text-xs text-gray-400">Autonomous Multimodal Study Companion</p>
        </div>
      </div>

      {/* Agents status pills & 1-Click Seed */}
      <div className="flex items-center gap-4">
        {/* Agent pipeline indicators */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-300">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>5 Cooperating Agents</span>
          </div>
          <span className="text-gray-600">•</span>
          <div className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>ChromaDB Vector Active</span>
          </div>
        </div>

        {/* 1-Click Seed Button */}
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md shadow-indigo-600/25 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {seeding ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-300" />
          )}
          <span>{seeding ? 'Seeding Dataset...' : 'Load Seed Materials'}</span>
        </button>
      </div>
    </header>
  );
}
