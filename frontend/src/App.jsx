import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import IngestionPage from './pages/IngestionPage';
import FlashcardsPage from './pages/FlashcardsPage';
import ChatRAGPage from './pages/ChatRAGPage';
import QuizPage from './pages/QuizPage';
import PlannerPage from './pages/PlannerPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-outfit">
      {/* Navbar Header */}
      <Navbar onSeedSuccess={handleRefresh} />

      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Mobile Navigation Tabs */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-gray-800 p-2 flex justify-around text-xs">
          <button onClick={() => setActiveTab('dashboard')} className={`p-2 font-medium ${activeTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-gray-400'}`}>Overview</button>
          <button onClick={() => setActiveTab('ingest')} className={`p-2 font-medium ${activeTab === 'ingest' ? 'text-indigo-400 font-bold' : 'text-gray-400'}`}>Ingest</button>
          <button onClick={() => setActiveTab('flashcards')} className={`p-2 font-medium ${activeTab === 'flashcards' ? 'text-indigo-400 font-bold' : 'text-gray-400'}`}>Deck</button>
          <button onClick={() => setActiveTab('rag')} className={`p-2 font-medium ${activeTab === 'rag' ? 'text-indigo-400 font-bold' : 'text-gray-400'}`}>Ask GURU</button>
          <button onClick={() => setActiveTab('quizzes')} className={`p-2 font-medium ${activeTab === 'quizzes' ? 'text-indigo-400 font-bold' : 'text-gray-400'}`}>Quiz</button>
          <button onClick={() => setActiveTab('planner')} className={`p-2 font-medium ${activeTab === 'planner' ? 'text-indigo-400 font-bold' : 'text-gray-400'}`}>Planner</button>
        </div>

        {/* Main Content Area */}
        <main key={refreshKey} className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto pb-20 lg:pb-8">
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'ingest' && <IngestionPage onIngestSuccess={handleRefresh} />}
          {activeTab === 'flashcards' && <FlashcardsPage />}
          {activeTab === 'rag' && <ChatRAGPage />}
          {activeTab === 'quizzes' && <QuizPage onQuizCompleted={handleRefresh} />}
          {activeTab === 'planner' && <PlannerPage />}
        </main>
      </div>
    </div>
  );
}
