
import React, { useState } from 'react';
import { AppView } from './types';
import Sidebar from './components/Sidebar';
import ChatBot from './components/ChatBot';
import CodeBuilder from './components/CodeBuilder';
import MediaLab from './components/MediaLab';
import VoiceStudio from './components/VoiceStudio';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);

  const renderContent = () => {
    switch (currentView) {
      case AppView.CHAT: return <ChatBot />;
      case AppView.BUILDER: return <CodeBuilder />;
      case AppView.MEDIA_LAB: return <MediaLab />;
      case AppView.VOICE_STUDIO: return <VoiceStudio />;
      default: return <ChatBot />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-600 selection:text-white">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-gray-900 pb-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter">
              {currentView === AppView.CHAT && 'Mourish Assistant'}
              {currentView === AppView.BUILDER && 'App Architect Pro'}
              {currentView === AppView.MEDIA_LAB && 'Generative Studio'}
              {currentView === AppView.VOICE_STUDIO && 'Vocal Intelligence'}
            </h2>
            <p className="text-gray-500 text-sm mt-2 font-medium">
              {currentView === AppView.CHAT && 'Multimodal reasoning and expert insights.'}
              {currentView === AppView.BUILDER && 'Instant AI-driven web application development.'}
              {currentView === AppView.MEDIA_LAB && 'Cinematic image and video synthesis.'}
              {currentView === AppView.VOICE_STUDIO && 'Human-parity conversational interface.'}
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 bg-gray-900 border border-gray-800 px-5 py-2.5 rounded-2xl shadow-xl">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              <span className="text-xs font-black text-gray-300 tracking-widest uppercase">Mourish Core Online</span>
            </div>
          </div>
        </header>

        <div className="h-[calc(100vh-200px)]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
