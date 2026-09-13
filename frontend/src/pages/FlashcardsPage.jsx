import React, { useState, useEffect } from 'react';
import { BookOpen, GitBranch, Layers, Filter } from 'lucide-react';
import FlashcardComponent from '../components/FlashcardComponent';
import ConceptMap from '../components/ConceptMap';
import { api } from '../api/client';

export default function FlashcardsPage() {
  const [viewMode, setViewMode] = useState('flashcards'); // flashcards, concept_map
  const [cards, setCards] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [conceptNodes, setConceptNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cardsData, topicsData, conceptData] = await Promise.all([
        api.getFlashcards(selectedTopic),
        api.getTopics(),
        api.getConceptMap(selectedTopic)
      ]);
      setCards(cardsData || []);
      setTopics(topicsData || []);
      setConceptNodes(conceptData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTopic]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-outfit flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            Concept Explorer & Flashcard Deck
          </h2>
          <p className="text-sm text-gray-400">
            Summaries and auto-generated Q&A flashcards extracted by FLAN-T5 & Bart agents.
          </p>
        </div>

        {/* View Toggle & Topic Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedTopic || ''}
            onChange={(e) => setSelectedTopic(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3.5 py-2 rounded-xl bg-gray-900/90 border border-gray-800 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="">All Topics ({cards.length} cards)</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-900/80 border border-gray-800">
            <button
              onClick={() => setViewMode('flashcards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'flashcards' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Deck Grid
            </button>
            <button
              onClick={() => setViewMode('concept_map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'concept_map' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" /> Concept Map
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'flashcards' ? (
        <div>
          {cards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <FlashcardComponent key={card.id} card={card} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center glass-panel rounded-2xl border border-gray-800 text-gray-400">
              <BookOpen className="w-10 h-10 text-purple-400 mx-auto mb-3 opacity-60" />
              <p className="text-base font-semibold text-white">No flashcards available in this topic deck.</p>
              <p className="text-xs text-gray-500 mt-1">Click "Load Seed Materials" above to populate sample cards.</p>
            </div>
          )}
        </div>
      ) : (
        <ConceptMap nodes={conceptNodes} />
      )}
    </div>
  );
}
