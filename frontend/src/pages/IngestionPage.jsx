import React, { useState, useEffect } from 'react';
import { Upload, FileText, Image, Mic, Sparkles, CheckCircle, AlertCircle, FileCode } from 'lucide-react';
import { api } from '../api/client';

export default function IngestionPage({ onIngestSuccess }) {
  const [activeMode, setActiveMode] = useState('text'); // text, pdf, image, audio
  const [title, setTitle] = useState('');
  const [topicName, setTopicName] = useState('General');
  const [examWeight, setExamWeight] = useState(1.5);
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [materials, setMaterials] = useState([]);

  const fetchMaterials = async () => {
    try {
      const data = await api.getAllMaterials();
      setMaterials(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Please enter a document title.');

    setLoading(true);
    setResult(null);

    try {
      let res;
      const formData = new FormData();
      formData.append('title', title);
      formData.append('topic_name', topicName);

      if (activeMode === 'text') {
        if (!textContent.trim()) return alert('Please enter study note text.');
        formData.append('text', textContent);
        formData.append('exam_weight', examWeight);
        res = await api.ingestText(formData);
      } else if (activeMode === 'pdf') {
        if (!selectedFile) return alert('Please select a PDF file.');
        formData.append('file', selectedFile);
        res = await api.ingestPdf(formData);
      } else if (activeMode === 'image') {
        if (!selectedFile) return alert('Please select a textbook page image.');
        formData.append('file', selectedFile);
        res = await api.ingestImage(formData);
      } else if (activeMode === 'audio') {
        if (!selectedFile) return alert('Please select an audio voice note file.');
        formData.append('file', selectedFile);
        res = await api.ingestAudio(formData);
      }

      setResult(res);
      fetchMaterials();
      if (onIngestSuccess) onIngestSuccess();

      // Reset fields
      setTitle('');
      setTextContent('');
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert('Error ingesting content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white font-outfit flex items-center gap-2">
          <Upload className="w-6 h-6 text-indigo-400" />
          Multimodal Ingestion Agent Hub
        </h2>
        <p className="text-sm text-gray-400">
          Upload plain text notes, PDF textbook excerpts, image scans (OCR), or audio voice queries. The agent will chunk, embed, and store concepts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-indigo-500/20 space-y-5">
          {/* Modality Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-gray-900/80 border border-gray-800">
            <button
              onClick={() => setActiveMode('text')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMode === 'text' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Text / Notes
            </button>
            <button
              onClick={() => setActiveMode('pdf')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMode === 'pdf' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" /> PDF Textbook
            </button>
            <button
              onClick={() => setActiveMode('image')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMode === 'image' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Image className="w-3.5 h-3.5" /> Image (OCR)
            </button>
            <button
              onClick={() => setActiveMode('audio')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMode === 'audio' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" /> Voice Audio
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 4: Neural Networks"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Topic / Category</label>
                <input
                  type="text"
                  placeholder="e.g. Machine Learning"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {activeMode === 'text' && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Raw Study Notes</label>
                <textarea
                  rows={6}
                  placeholder="Paste lecture notes, definitions, theorems, or formula explanations..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  required
                />
              </div>
            )}

            {activeMode !== 'text' && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Select File ({activeMode.toUpperCase()})</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Agent Processing & Chunking...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Ingest & Generate Concepts</span>
                </>
              )}
            </button>
          </form>

          {/* Output Banner */}
          {result && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-200">
                <CheckCircle className="w-4 h-4" /> Ingestion & Concept Extraction Successful!
              </div>
              <p>• Created <strong>{result.ingestion?.chunk_count || 0}</strong> semantic chunks in ChromaDB</p>
              <p>• Generated <strong>{result.concepts?.flashcard_count || 0}</strong> Q&A Flashcards</p>
            </div>
          )}
        </div>

        {/* Existing Materials List Sidebar */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 space-y-4">
          <h3 className="text-base font-bold text-white font-outfit">Ingested Knowledge Library</h3>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {materials.map((m) => (
              <div key={m.id} className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wide px-2 py-0.5 rounded bg-indigo-500/10">
                    {m.file_type}
                  </span>
                  <span className="text-[11px] text-gray-500">{m.topic_name}</span>
                </div>
                <h4 className="text-sm font-bold text-white truncate">{m.title}</h4>
                <p className="text-[11px] text-gray-400 line-clamp-2">{m.snippet}</p>
              </div>
            ))}
            {materials.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-6">No materials ingested yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
