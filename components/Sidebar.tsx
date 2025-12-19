
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
    { id: AppView.BUILDER, label: 'Builder', icon: ICONS.Builder },
    { id: AppView.MEDIA_LAB, label: 'Media Lab', icon: ICONS.Media },
    { id: AppView.VOICE_STUDIO, label: 'Voice Studio', icon: ICONS.Voice },
  ];

  return (
    <aside className="w-16 md:w-64 bg-gray-950 border-r border-gray-800 flex flex-col items-center md:items-stretch h-screen sticky top-0 z-20 shadow-2xl">
      <div className="p-8 hidden md:block">
        <h1 className="text-2xl font-black bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent tracking-tighter">
          Mourish AI
        </h1>
      </div>
      <div className="p-4 md:hidden text-blue-500">
        <ICONS.Chat />
      </div>

      <div className="flex-1 mt-2 px-3 space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center p-3.5 rounded-2xl transition-all duration-300 group relative ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                  : 'text-gray-500 hover:bg-gray-900 hover:text-gray-300'
              }`}
            >
              <div className={`flex-shrink-0 ${isActive ? 'scale-110' : ''}`}>
                <Icon />
              </div>
              <span className={`ml-3 hidden md:block font-semibold text-sm tracking-tight ${isActive ? 'text-blue-100' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 mt-auto">
        <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800 hidden md:block">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3">System Status</p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Models</span>
              <div className="flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse"></div>
                <span className="text-[11px] text-gray-200 font-bold">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
