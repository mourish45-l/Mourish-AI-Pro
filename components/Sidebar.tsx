
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
    <aside className="w-16 md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col items-center md:items-stretch h-screen sticky top-0">
      <div className="p-6 hidden md:block">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Mourish AI
        </h1>
      </div>
      <div className="flex-1 mt-4 px-2 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <div className="flex-shrink-0">
                <Icon />
              </div>
              <span className="ml-3 hidden md:block font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg p-3 hidden md:block">
          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Status</p>
          <div className="flex items-center mt-1">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-300">Models Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
