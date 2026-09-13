import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, BookOpen, ExternalLink, ShieldCheck, User } from 'lucide-react';
import { api } from '../api/client';

export default function ChatRAGPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'guru',
      text: "Hello! I am GURU, your RAG-powered study companion. Ask me any question about your ingested study notes, textbooks, or research topics. I will answer strictly based on your materials and cite source references.",
      sources: []
    }
  ]);
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    "What is the function of backpropagation in deep learning?",
    "Compare B-Tree vs Hash indexes for database queries.",
    "Explain Coffman conditions for operating system deadlocks."
  ];

  const handleSend = async (questionText = query) => {
    const textToSend = questionText || query;
    if (!textToSend.trim()) return;

    // Push user message
    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.askRAG(textToSend);
      const guruMsg = {
        sender: 'guru',
        text: res.answer,
        sources: res.sources || [],
        confidence: res.confidence || 'High'
      };
      setMessages(prev => [...prev, guruMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        sender: 'guru',
        text: e.message || "Error retrieving grounded answer from knowledge base. Please ensure the backend server is running.",
        sources: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white font-outfit flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-400" />
          Ask GURU — RAG Tutor Chat
        </h2>
        <p className="text-sm text-gray-400">
          Powered by SentenceTransformer MiniLM embeddings & ChromaDB vector store. Grounded in your uploaded notes.
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">Quick Prompts:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1 rounded-full bg-gray-900/90 hover:bg-indigo-600/30 text-xs text-gray-300 border border-gray-800 hover:border-indigo-500/40 transition-all cursor-pointer truncate max-w-xs"
          >
            "{p}"
          </button>
        ))}
      </div>

      {/* Chat Conversation Box */}
      <div className="glass-panel rounded-2xl border border-indigo-500/20 flex flex-col h-[520px]">
        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'guru' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed space-y-3 ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-gray-900/90 text-gray-200 border border-gray-800 rounded-tl-none'
                }`}
              >
                <p className="font-outfit">{m.text}</p>

                {/* Source Citations */}
                {m.sources && m.sources.length > 0 && (
                  <div className="pt-3 border-t border-gray-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Grounded References ({m.sources.length})
                      </span>
                      <span className="text-gray-400 font-normal capitalize">Confidence: {m.confidence}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {m.sources.map((src, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-gray-950/70 border border-gray-800 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-gray-300">
                            <span className="truncate">Source {src.source_id}: {src.title}</span>
                            <span className="text-emerald-400 text-[10px]">{Math.round(src.relevance_score * 100)}% match</span>
                          </div>
                          <p className="text-[11px] text-gray-400 line-clamp-2 italic">"{src.snippet}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-indigo-400 font-medium animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>GURU Agent retrieving ChromaDB vector chunks & synthesizing answer...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/60 rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask a question about your study material..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0"
            >
              <span>Ask</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
