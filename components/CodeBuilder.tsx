
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { ICONS } from '../constants';

const CodeBuilder: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState(`<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen">
    <div class="text-center p-8 bg-white rounded-2xl shadow-xl">
        <h1 class="text-3xl font-bold text-gray-800">App Preview</h1>
        <p class="text-gray-500 mt-2">Generate your web app using the prompt below!</p>
    </div>
</body>
</html>`);
  const [loading, setLoading] = useState(false);

  const generateApp = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const gemini = new GeminiService(process.env.API_KEY!);
      const result = await gemini.generateCode(prompt);
      if (result) setCode(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Editor Area */}
        <div className="flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Source Code</span>
            <button className="text-[10px] bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">Copy</button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full bg-gray-950 p-4 font-mono text-sm text-green-400 focus:outline-none resize-none"
            spellCheck={false}
          />
        </div>

        {/* Preview Area */}
        <div className="flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-3 bg-gray-800 border-b border-gray-700">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Live Preview</span>
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

      {/* Control Bar */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-lg">
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateApp()}
            placeholder="Describe the website or web app you want to build..."
            className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={generateApp}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 min-w-[140px]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <ICONS.Builder />
                <span>Build App</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeBuilder;
