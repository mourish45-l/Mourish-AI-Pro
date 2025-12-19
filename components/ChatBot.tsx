
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

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const gemini = new GeminiService(process.env.API_KEY!);
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
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-gray-900 shadow-2xl rounded-2xl overflow-hidden border border-gray-800">
      <div className="p-4 bg-gray-800/50 border-b border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Gemini Workspace</h2>
          <p className="text-xs text-gray-400">Powered by Gemini 3 Pro & Flash</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-xs text-gray-400 flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={useSearch} 
              onChange={() => setUseSearch(!useSearch)}
              className="mr-2 rounded border-gray-700 bg-gray-900 text-blue-500 focus:ring-blue-500"
            />
            Search Grounding
          </label>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
            <div className="p-4 bg-gray-800 rounded-full">
              <ICONS.Chat />
            </div>
            <p className="text-center max-w-xs">Start a conversation or enable Search Grounding for real-time web results.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'
            }`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingSources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline bg-blue-400/10 px-2 py-1 rounded"
                      >
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
            <div className="bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-700 flex space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-800/50 border-t border-gray-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="absolute right-2 p-2 text-blue-500 hover:text-blue-400 disabled:text-gray-600 transition-colors"
          >
            <ICONS.Send />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
