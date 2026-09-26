import React, { useState } from 'react';
import { Bot, X, MessageSquare, Sparkles, ChevronDown, Maximize2, HelpCircle } from 'lucide-react';
import { ChatAssistant } from './ChatAssistant';
import { useApp } from '../context/AppContext';

export const FloatingChatWidget: React.FC = () => {
  const { activeView, setActiveView, currentStudent } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnreadGreeting, setHasUnreadGreeting] = useState(true);

  // If user is already on the full 'help' view, don't show the floating popup
  if (activeView === 'help') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Expanded Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] mb-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="relative">
            {/* Header controls for Floating window */}
            <div className="absolute top-3.5 right-12 z-20 flex items-center gap-1.5 text-slate-400">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setActiveView('help');
                }}
                className="p-1 hover:text-white hover:bg-slate-750 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                title="Expand to Full Help Center"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <ChatAssistant compact={true} onNavigateToView={setActiveView} />
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <div className="flex items-center gap-2">
        {!isOpen && hasUnreadGreeting && (
          <div
            onClick={() => {
              setIsOpen(true);
              setHasUnreadGreeting(false);
            }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/95 border border-indigo-500/40 text-xs text-white rounded-full shadow-xl cursor-pointer hover:bg-slate-750 transition-transform hover:scale-105 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Need Help with Fees or Receipts? Ask Bursar AI</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setHasUnreadGreeting(false);
              }}
              className="text-slate-400 hover:text-white ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setHasUnreadGreeting(false);
          }}
          className={`w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-200 cursor-pointer ${
            isOpen
              ? 'bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300'
              : 'bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/40 shadow-blue-600/40 hover:scale-105'
          }`}
          title={isOpen ? 'Close Bursar AI Assistant' : 'Open Bursar AI Assistant'}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative">
              <Bot className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
