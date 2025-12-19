
import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { ChatMessage } from '../types';
import { ICONS } from '../constants';

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const clearChat = () => setMessages([]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined") {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "⚠️ API Key Missing: Please ensure you have added 'API_KEY' to your Vercel Environment Variables and redeployed." 
      }]);
      return;
    }

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const gemini = new GeminiService(apiKey);
      let response;
      
      if (useSearch) {
        response = await gemini.searchGrounding(currentInput);
        const text = response.text || "Results found.";
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          uri: chunk.web?.uri || chunk.maps?.uri,
          title: chunk.web?.title || chunk.maps?.title || "Source"
        })).filter((s: any) => s.uri);

        setMessages(prev => [...prev, { role: 'model', text, isSearch: true, groundingSources: sources }]);
      } else {
        response = await gemini.chat(currentInput);
        setMessages(prev => [...prev, { role: 'model', text: response.text || "No response received." }]);
      }
    } catch (error: any) {
      console.error("Chat Error:", error);
      let errorMsg = "Mourish AI encountered a connection error. ";
      if (error?.message?.includes("404")) errorMsg += "The model version might not be supported yet.";
      else if (error?.message?.includes("429")) errorMsg += "Rate limit reached. Please wait a moment.";
      else errorMsg += "Please check your network and API key settings.";
      
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto bg-gray-900 shadow-2xl rounded-2xl overflow-hidden border border-gray-800">
      <div className="p-4 bg-gray-800/60 border-b border-gray-800 flex justify-between items-center backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <ICONS.Chat />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-100">Mourish Workspace</h2>
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Active System</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={clearChat}
            className="text-[10px] font-bold text-gray-500 hover:text-gray-300 uppercase tracking-widest px-3 py-1 hover:bg-gray-700/50 rounded-lg transition-all"
          >
            Clear
          </button>
          <div className="flex items-center space-x-2 bg-gray-950 px-3 py-1.5 rounded-xl border border-gray-700">
            <input 
              id="search-toggle"
              type="checkbox" 
              checked={useSearch} 
              onChange={() => setUseSearch(!useSearch)}
              className="w-3 h-3 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-600 cursor-pointer"
            />
            <label htmlFor="search-toggle" className="text-[10px] text-gray-400 font-bold cursor-pointer select-none">SEARCH</label>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-[radial-gradient(circle_at_50%_50%,_rgba(17,24,39,1)_0%,_rgba(3,7,18,1)_100%)]">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
            <div className="p-8 bg-gray-800/20 rounded-full border border-gray-800/50 shadow-inner">
              <ICONS.Chat />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-400">Welcome to Mourish AI</p>
              <p className="text-xs max-w-xs mx-auto mt-2 text-gray-600">I am your multimodal expert assistant. How can I help you today?</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[90%] p-4 rounded-2xl shadow-xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-800/90 text-gray-100 rounded-tl-none border border-gray-700/50 backdrop-blur-sm'
            }`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700/30">
                  <p className="text-[9px] uppercase font-black text-gray-500 tracking-widest mb-2">Sources</p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.groundingSources.map((source, idx) => (
                      <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all truncate max-w-[140px]">
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/90 p-4 rounded-2xl rounded-tl-none border border-gray-700/50 flex space-x-1.5">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Mourish AI is ready to help..."
            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 pr-14 transition-all shadow-inner placeholder:text-gray-700"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-700 transition-all shadow-lg active:scale-95"
          >
            <ICONS.Send />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
