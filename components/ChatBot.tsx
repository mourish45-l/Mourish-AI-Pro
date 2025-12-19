
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
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "⚠️ Mourish AI Configuration Error: The API_KEY environment variable is not set. Please add your Gemini API Key in Vercel project settings and redeploy." 
      }]);
      return;
    }

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const gemini = new GeminiService(apiKey);
      let response;
      
      if (useSearch) {
        response = await gemini.searchGrounding(input);
        const text = response.text || "I've analyzed the search results for you.";
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          uri: chunk.web?.uri || chunk.maps?.uri,
          title: chunk.web?.title || chunk.maps?.title || "Reference"
        })).filter((s: any) => s.uri);

        setMessages(prev => [...prev, { 
          role: 'model', 
          text, 
          isSearch: true, 
          groundingSources: sources 
        }]);
      } else {
        response = await gemini.chat(input);
        setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm sorry, I couldn't generate a response." }]);
      }
    } catch (error: any) {
      console.error("Chat Error:", error);
      let errorMsg = "I encountered an error. ";
      
      if (error?.status === 404) {
        errorMsg += "The model version might not be active on your account yet. Mourish AI is trying to use " + (useSearch ? "Flash Search" : "Gemini Flash") + ".";
      } else if (error?.status === 401 || error?.status === 403) {
        errorMsg += "Authentication failed. Your API key might be invalid.";
      } else {
        errorMsg += "Please ensure your internet is stable or check the Vercel logs for details.";
      }

      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto bg-gray-900 shadow-2xl rounded-2xl overflow-hidden border border-gray-800">
      <div className="p-4 bg-gray-800/40 border-b border-gray-800 flex justify-between items-center backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-gray-100">Mourish Workspace</h2>
          <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Active Intelligence</p>
        </div>
        <div className="flex items-center space-x-3 bg-gray-950 px-4 py-2 rounded-xl border border-gray-700 shadow-inner">
          <input 
            id="search-toggle"
            type="checkbox" 
            checked={useSearch} 
            onChange={() => setUseSearch(!useSearch)}
            className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-600 cursor-pointer"
          />
          <label htmlFor="search-toggle" className="text-xs text-gray-300 font-bold cursor-pointer select-none">
            Web Search
          </label>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-6">
            <div className="p-8 bg-gray-800/30 rounded-full border border-gray-700 shadow-2xl animate-pulse">
              <ICONS.Chat />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-300">Welcome to Mourish AI</p>
              <p className="text-sm max-w-xs mx-auto mt-2 text-gray-500">I am your expert assistant, ready to help with code, information, and creative tasks.</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className={`max-w-[85%] p-5 rounded-3xl shadow-xl leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700/50 shadow-blue-900/10'
            }`}>
              <p className="whitespace-pre-wrap text-[15px]">{msg.text}</p>
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-700/50">
                  <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-3">Verified Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingSources.map((source, idx) => (
                      <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 px-4 py-2 rounded-xl border border-blue-500/20 transition-all flex items-center">
                        <span className="truncate max-w-[150px]">{source.title}</span>
                        <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
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
            <div className="bg-gray-800 p-5 rounded-3xl rounded-tl-none border border-gray-700 flex space-x-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-gray-800/30 border-t border-gray-800 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Mourish AI is ready to help..."
            className="w-full bg-gray-950 border border-gray-700 rounded-2xl px-6 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-600/50 pr-16 transition-all placeholder:text-gray-600 shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-3 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-700 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <ICONS.Send />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
