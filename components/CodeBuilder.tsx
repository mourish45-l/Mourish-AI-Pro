
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { ICONS } from '../constants';

const CodeBuilder: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState(`<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-slate-950 flex items-center justify-center min-h-screen">
    <div class="text-center p-12 bg-gray-900 rounded-3xl shadow-2xl max-w-lg border border-gray-800">
        <div class="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </div>
        <h1 class="text-2xl font-black text-white tracking-tighter uppercase italic">App Architect</h1>
        <p class="text-gray-500 mt-4 text-sm leading-relaxed">Describe your vision below and press <span class="text-blue-500 font-bold">Enter</span>.</p>
    </div>
</body>
</html>`);
  const [loading, setLoading] = useState(false);

  const generateApp = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key missing");
      const gemini = new GeminiService(apiKey);
      const result = await gemini.generateCode(prompt);
      if (result) setCode(result);
    } catch (err) {
      console.error(err);
      alert("Failed to build app. Please ensure your API key is correctly set in Vercel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
        {/* Editor Area */}
        <div className="flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
          <div className="p-3 bg-gray-800/80 border-b border-gray-700 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Architecture Source</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(code);
                alert("Code copied!");
              }}
              className="text-[10px] font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-600 hover:text-white px-3 py-1 rounded transition-all"
            >
              Copy
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-gray-950 p-6 font-mono text-[13px] text-blue-400 focus:outline-none resize-none leading-relaxed overflow-auto"
            spellCheck={false}
          />
        </div>

        {/* Preview Area */}
        <div className="flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
          <div className="p-3 bg-gray-800/80 border-b border-gray-700 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Infrastructure</span>
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest">Building...</span>
              </div>
            ) : (
              <button onClick={() => setCode(code)} className="text-[9px] text-gray-500 hover:text-gray-300 uppercase font-black">Re-deploy</button>
            )}
          </div>
          <div className="flex-1 bg-white">
            <iframe
              srcDoc={code}
              title="preview"
              className="w-full h-full border-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 shadow-2xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-600 group-focus-within:text-blue-500 transition-colors">
            <ICONS.Builder />
          </div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateApp()}
            placeholder="Describe your web app (e.g., 'A professional landing page for a coffee shop')..."
            disabled={loading}
            className="w-full bg-gray-950 border border-gray-700 rounded-xl pl-12 pr-32 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all disabled:opacity-50"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
             <div className="px-2 py-1 bg-gray-900 rounded border border-gray-800 text-[9px] font-black text-gray-600 uppercase tracking-widest shadow-inner">
                ENTER ↵
             </div>
             <button 
                onClick={generateApp}
                disabled={loading || !prompt.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-30 transition-all"
             >
                <ICONS.Send />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeBuilder;
