'use client';

import React from 'react';
import { Home, MessageSquare, Bot, Wrench, User } from 'lucide-react';

export type ClientTab = 'beranda' | 'chat' | 'agents' | 'tools' | 'akun';

interface ClientBottomNavProps {
  activeTab: ClientTab;
  onSelectTab: (tab: ClientTab) => void;
}

export const ClientBottomNav: React.FC<ClientBottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'beranda' as ClientTab, label: 'Beranda', icon: Home, color: 'bg-[#C9F2D5]' },
    { id: 'chat' as ClientTab, label: 'Chat AI', icon: MessageSquare, color: 'bg-[#D9D5FF]' },
    { id: 'agents' as ClientTab, label: 'Agents', icon: Bot, color: 'bg-[#F9D8E5]' },
    { id: 'tools' as ClientTab, label: 'Tools', icon: Wrench, color: 'bg-[#FBE7B2]' },
    { id: 'akun' as ClientTab, label: 'Akun', icon: User, color: 'bg-[#D8ECFF]' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#F7F4EC]/95 dark:bg-[#1E201D]/95 backdrop-blur-md border-t-2 border-[#171717] dark:border-[#4A4A46] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-transform active:scale-95 select-none"
              aria-label={tab.label}
            >
              <div
                className={`w-9 h-8 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? `${tab.color} border-2 border-[#171717] dark:border-[#171717] neo-shadow-sm scale-105`
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#171717] stroke-[2.5]' : 'stroke-[2]'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight font-extrabold ${
                  isActive
                    ? 'text-[#171717] dark:text-[#F7F4EC]'
                    : 'text-gray-500 dark:text-gray-400 font-semibold'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
