
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
      case AppView.CHAT:
        return <ChatBot />;
      case AppView.BUILDER:
        return <CodeBuilder />;
      case AppView.MEDIA_LAB:
        return <MediaLab />;
      case AppView.VOICE_STUDIO:
        return <VoiceStudio />;
      default:
        return <ChatBot />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100 font-sans">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {currentView === AppView.CHAT && 'AI Workspace'}
              {currentView === AppView.BUILDER && 'Web App Architect'}
              {currentView === AppView.MEDIA_LAB && 'Generative Media Lab'}
              {currentView === AppView.VOICE_STUDIO && 'Voice Integration Hub'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {currentView === AppView.CHAT && 'Multimodal reasoning with Gemini 3 Pro.'}
              {currentView === AppView.BUILDER && 'Instant website generation and live editing.'}
              {currentView === AppView.MEDIA_LAB && 'Professional 4K images and cinematic videos.'}
              {currentView === AppView.VOICE_STUDIO && 'Real-time conversational intelligence.'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-full text-xs font-medium text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Gemini 3 Pro Active</span>
            </div>
          </div>
        </header>

        <div className="h-[calc(100vh-160px)]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
