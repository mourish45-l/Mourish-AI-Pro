
import React from 'react';
import { AppView } from '../types';
import { ICONS } from '../constants';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const items = [
    { id: AppView.CHAT, label: 'Assistant', icon: ICONS.Chat },
    { id: AppView.BUILDER, label: 'Web Architect', icon: ICONS.Builder },
    { id: AppView.MEDIA_LAB, label: 'Media Lab', icon: ICONS.Media },
    { id: AppView.VOICE_STUDIO, label: 'Voice Studio', icon: ICONS.Voice },
  ];

  return (
    <aside className="w-16 md:w-64 bg-gray-950 border-r border-gray-800 flex flex-col items-center md:items-stretch h-screen sticky top-0 z-20 shadow-2xl">
      <div className="p-8 hidden md:block">
        <h1 className="text-2xl font-black bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent tracking-tighter uppercase italic">
          Mourish AI
        </h1>
        <div className="h-0.5 w-12 bg-blue-600 mt-1 rounded-full opacity-50"></div>
      </div>
      <div className="p-4 md:hidden text-blue-500 mt-4">
        <ICONS.Chat />
      </div>

      <div className="flex-1 mt-6 px-3 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 group relative ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                  : 'text-gray-500 hover:bg-gray-900 hover:text-gray-300'
              }`}
            >
              <div className={`flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <Icon />
              </div>
              <span className={`ml-4 hidden md:block font-bold text-sm tracking-tight ${isActive ? 'text-white' : ''}`}>{item.label}</span>
              {isActive && (
                <div className="absolute left-0 w-1 h-8 bg-white rounded-full ml-[-4px]"></div>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-6 mt-auto">
        <div className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 hidden md:block backdrop-blur-sm">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4">Infrastructure</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold">Gemini 3</span>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                <span className="text-[11px] text-gray-200 font-black">ACTIVE</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold">Region</span>
              <span className="text-[11px] text-gray-500 font-black">GLOBAL</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
