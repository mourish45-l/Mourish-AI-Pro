
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
      setMessages(prev => [...prev, { role: 'model', text: "Critical: API Key is missing. Please ensure the API_KEY environment variable is set in your Vercel deployment." }]);
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
        const text = response.text || "I found some information for you.";
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          uri: chunk.web?.uri || chunk.maps?.uri,
          title: chunk.web?.title || chunk.maps?.title || "Source"
        })).filter((s: any) => s.uri);

        setMessages(prev => [...prev, { 
          role: 'model', 
          text, 
          isSearch: true, 
          groundingSources: sources 
        }]);
      } else {
        response = await gemini.chat(input);
        setMessages(prev => [...prev, { role: 'model', text: response.text || '' }]);
      }
    } catch (error: any) {
      console.error("Chat Error:", error);
      let errorMsg = "I encountered an error while processing your request. ";
      
      if (error?.status === 404) {
        errorMsg += "The model version might not be supported on your account yet.";
      } else if (error?.status === 401 || error?.status === 403) {
        errorMsg += "Your API Key seems to be invalid or lacks permissions.";
      } else {
        errorMsg += "Please check your internet connection or try again later.";
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
          <h2 className="text-lg font-semibold text-gray-100">Gemini Workspace</h2>
          <p className="text-xs text-gray-500 font-medium">Mourish Intelligence Hub</p>
        </div>
        <div className="flex items-center space-x-3 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-700">
          <input 
            id="search-toggle"
            type="checkbox" 
            checked={useSearch} 
            onChange={() => setUseSearch(!useSearch)}
            className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-500 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="search-toggle" className="text-xs text-gray-300 font-semibold cursor-pointer select-none">
            Search Grounding
          </label>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
            <div className="p-6 bg-gray-800/50 rounded-3xl border border-gray-700/50">
              <ICONS.Chat />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-400">Welcome to Mourish AI</p>
              <p className="text-sm max-w-xs mx-auto mt-2">Ask a question or build something amazing.</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-800/80 text-gray-100 rounded-tl-none border border-gray-700/50'
            }`}>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.text}</p>
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-2">
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingSources.map((source, idx) => (
                      <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 bg-blue-400/10 px-3 py-1 rounded-lg transition-colors">
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
            <div className="bg-gray-800/80 p-4 rounded-2xl rounded-tl-none border border-gray-700/50 flex space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-800/30 border-t border-gray-800">
        <div className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="w-full bg-gray-950 border border-gray-700 rounded-2xl px-5 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-14 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2.5 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 transition-all"
          >
            <ICONS.Send />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
