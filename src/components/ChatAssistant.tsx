import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Clock,
  RotateCcw,
  Volume2,
  VolumeX,
  CreditCard,
  FileCheck,
  Building2,
  Calendar,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  source?: 'gemini-ai' | 'knowledge-engine';
}

interface ChatAssistantProps {
  compact?: boolean;
  onNavigateToView?: (view: any) => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  compact = false,
  onNavigateToView,
}) => {
  const { currentStudent, calculateStudentDues, setActiveView } = useApp();

  const dues = currentStudent ? calculateStudentDues(currentStudent.id) : null;

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play subtle chime on message arrival
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio not permitted without user gesture, ignore
    }
  };

  const studentContext = currentStudent
    ? {
        name: currentStudent.name,
        rollNo: currentStudent.rollNo,
        program: currentStudent.program,
        branch: currentStudent.branch,
        semester: currentStudent.semester,
        pendingBalance: dues?.pendingBalance,
        totalFee: dues?.totalFee,
        amountPaid: dues?.amountPaid,
        daysRemaining: dues?.daysRemaining,
        regularDueDate: dues?.schedule?.regularDueDate,
        isUrgentDue: dues?.isUrgentDue,
        isOverdue: dues?.isOverdue,
      }
    : null;

  const initialGreeting: ChatMessage = {
    id: 'msg-init-1',
    role: 'model',
    content: currentStudent
      ? `Hello **${currentStudent.name}**! 👋 Welcome to the NIST EduPay Bursar & Accounts Help Desk.

I am your official Academic Accounts Assistant. You currently have **₹${dues?.pendingBalance ? Number(dues.pendingBalance).toLocaleString('en-IN') : '0'}** pending for Semester ${currentStudent.semester} (Due in **${dues?.daysRemaining ?? 0} days**).

How can I assist you with your fees or scholarships today?`
      : `Hello! 👋 Welcome to the NIST EduPay Bursar & Academic Accounts Help Desk.

I am your official University Bursar Assistant. I can assist you with:
• **Semester tuition payment methods** (UPI, NetBanking, Cards)
• **Offline SBI bank challan** deposition & verification
• **Scholarship grants & DBT fee adjustments**
• **Accounts Counter operating hours** & contacts
• **80E tax deduction receipts**

How may I assist you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    source: 'knowledge-engine',
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedChips = [
    'How do I pay tuition online via UPI QR?',
    'What are the accounts counter operating hours?',
    'How does scholarship fee adjustment work?',
    'How to deposit an offline SBI challan?',
    'Where can I download my 80E tax receipt?',
    'What is the late fee policy if I am delayed?',
    dues?.pendingBalance ? 'What is my current pending balance?' : 'Show tuition payment options',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputText).trim();
    if (!message || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-usr`,
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          history: historyPayload,
          studentContext: studentContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'model',
        content:
          data.reply ||
          'Thank you. If you have additional questions, our bursar desk is open from 09:30 AM to 03:30 PM.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source === 'gemini-ai' ? 'gemini-ai' : 'knowledge-engine',
      };

      setMessages((prev) => [...prev, modelMsg]);
      playChime();
    } catch (err: any) {
      console.error('Chat Assistant Client Error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now()}-fallback`,
        role: 'model',
        content: `I'm having a brief issue contacting the server, but here is immediate Bursar guidance:

• **Online Payments**: Go to Student Dashboard and click **"Pay Online"** for instant UPI/Card clearance.
• **Offline SBI Challan**: Deposit at the SBI NIST Campus Branch (#04128) and upload counterfoil at Counter #3.
• **Counter Timings**: Counter #1 (Online: 09:30 AM – 01:30 PM), Counter #2 (Scholarships: 10:00 AM – 03:30 PM), Counter #3 (Challans: 11:00 AM – 02:00 PM).
• **Direct Phone**: (020) 2590-4421.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'knowledge-engine',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([initialGreeting]);
  };

  // Simple Markdown renderer for bold, lists, and headers
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-xs">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          // Header ###
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-white text-xs mt-2 mb-1 flex items-center gap-1.5">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }

          // Bullet points
          if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const rawText = trimmed.replace(/^[•\-\*]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-1.5 ml-1">
                <span className="text-blue-400 mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(rawText) }} />
              </div>
            );
          }

          // Numbered lists
          if (/^\d+\.\s+/.test(trimmed)) {
            const match = trimmed.match(/^(\d+\.)\s+(.*)/);
            if (match) {
              return (
                <div key={idx} className="flex items-start gap-1.5 ml-1">
                  <span className="font-mono text-indigo-400 font-semibold">{match[1]}</span>
                  <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(match[2]) }} />
                </div>
              );
            }
          }

          return (
            <p
              key={idx}
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }}
              className="text-slate-200"
            />
          );
        })}
      </div>
    );
  };

  const formatInlineMarkdown = (text: string) => {
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-900 text-indigo-300 font-mono text-[10px] rounded border border-slate-700">$1</code>');
    return formatted;
  };

  return (
    <div
      className={`bg-slate-900 border border-slate-700 rounded-2xl flex flex-col shadow-2xl overflow-hidden ${
        compact ? 'h-[500px]' : 'h-[620px]'
      }`}
    >
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-850 via-slate-800 to-slate-850 border-b border-slate-700/80 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">EduPay Bursar AI Assistant</h3>
              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-[9px] font-mono font-semibold">
                Official Desk
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>National Institute of Science & Technology</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Support
              </span>
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition-colors"
            title={soundEnabled ? 'Mute notification sound' : 'Enable notification sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[78%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3.5 rounded-2xl shadow-md ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-800/95 border border-slate-700/80 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {isUser ? (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    renderMessageContent(msg.content)
                  )}
                </div>

                <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.source && (
                    <span className="text-[9px] font-mono text-slate-400">
                      {msg.source === 'gemini-ai' ? '✨ Gemini AI' : '🏛️ Bursar Knowledge'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg shrink-0 bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-800/95 border border-slate-700/80 p-3.5 rounded-2xl rounded-tl-none shadow-md">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-xs text-slate-400 ml-2 font-mono">Bursar AI checking records...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mr-1" />
        {suggestedChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question (fees, challans, scholarships, counters)..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-600/20"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-[10px] text-slate-500 mt-1.5 text-center">
          Official NIST Bursar Support • Physical Counter Timings: 09:30 AM – 03:30 PM (Mon–Fri)
        </p>
      </div>
    </div>
  );
};
