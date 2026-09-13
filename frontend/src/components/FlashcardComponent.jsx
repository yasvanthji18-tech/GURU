import React, { useState } from 'react';
import { RotateCw, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { api } from '../api/client';

export default function FlashcardComponent({ card, onConfidenceUpdate }) {
  const [flipped, setFlipped] = useState(false);
  const [confidence, setConfidence] = useState(card.confidence_level || 'medium');

  const handleConfidence = async (level, e) => {
    e.stopPropagation();
    setConfidence(level);
    try {
      await api.updateFlashcardConfidence(card.id, level);
      if (onConfidenceUpdate) onConfidenceUpdate(card.id, level);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="perspective-1000 w-full h-72 cursor-pointer group"
    >
      <div
        className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
          flipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Face */}
        <div className="absolute inset-0 glass-panel rounded-2xl p-6 flex flex-col justify-between border border-indigo-500/20 backface-hidden group-hover:border-indigo-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-400 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                {card.topic_name || 'Study Topic'}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <RotateCw className="w-3 h-3 animate-spin-slow" /> Click to flip
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-5 font-outfit leading-snug">
              {card.question}
            </h3>
          </div>
          <div className="text-xs text-gray-400 italic flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <span>Test your recall before flipping</span>
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 glass-panel rounded-2xl p-6 flex flex-col justify-between border border-purple-500/30 rotate-y-180 backface-hidden bg-gray-900/95">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-300 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30">
                Answer Key
              </span>
              <span className="text-xs text-gray-400 capitalize">
                Mastery: <strong className="text-white">{confidence}</strong>
              </span>
            </div>
            <p className="text-sm text-gray-200 mt-4 leading-relaxed font-outfit">
              {card.answer}
            </p>
          </div>

          {/* Self-Rating Confidence Buttons */}
          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <p className="text-[11px] text-gray-400 text-center font-medium">Rate your confidence:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={(e) => handleConfidence('hard', e)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                  confidence === 'hard'
                    ? 'bg-rose-500/30 text-rose-300 border-rose-500/50'
                    : 'bg-gray-800/60 text-gray-400 border-gray-700 hover:text-rose-300'
                }`}
              >
                Hard 😓
              </button>
              <button
                onClick={(e) => handleConfidence('medium', e)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                  confidence === 'medium'
                    ? 'bg-amber-500/30 text-amber-300 border-amber-500/50'
                    : 'bg-gray-800/60 text-gray-400 border-gray-700 hover:text-amber-300'
                }`}
              >
                Medium 🤔
              </button>
              <button
                onClick={(e) => handleConfidence('easy', e)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                  confidence === 'easy'
                    ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50'
                    : 'bg-gray-800/60 text-gray-400 border-gray-700 hover:text-emerald-300'
                }`}
              >
                Easy ⚡
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
