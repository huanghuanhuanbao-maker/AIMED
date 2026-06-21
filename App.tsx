
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, Activity } from 'lucide-react';
import { Message, Role } from './types';
import { callSpectraAgent } from './services/spectraService';
import { MessageBubble } from './components/MessageBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { OnboardingModal } from './components/OnboardingModal';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: Role.ASSISTANT,
  content: "你好！我是你的医学科研成果转化顾问，有什么可以帮你。",
  timestamp: Date.now()
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async (overrideValue?: string) => {
    const textToSend = overrideValue || inputValue.trim();
    if (!textToSend || isLoading) return;

    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    let isFirstChunk = true;

    try {
      const response = await callSpectraAgent(
        textToSend, 
        conversationId, 
        (streamedText, streamedThought) => {
          if (isFirstChunk) {
            setIsLoading(false);
            setMessages(prev => [
              ...prev,
              {
                id: botMessageId,
                role: Role.ASSISTANT,
                content: streamedText,
                thought: streamedThought,
                timestamp: Date.now(),
              }
            ]);
            isFirstChunk = false;
          } else {
            setMessages(prev => prev.map(msg => 
              msg.id === botMessageId ? { ...msg, content: streamedText, thought: streamedThought } : msg
            ));
          }
        }
      );

      if (isFirstChunk) {
         setMessages(prev => [
            ...prev,
            {
              id: botMessageId,
              role: Role.ASSISTANT,
              content: response.text,
              thought: response.thought,
              timestamp: Date.now(),
            }
          ]);
          setIsLoading(false);
      }

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

    } catch (err) {
      console.error(err);
      setError("系统连接繁忙，请稍后重试。");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-white text-slate-900 font-sans relative overflow-hidden">
      
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

      <header className="flex-none glass-panel sticky top-0 z-30 px-6 py-4 border-b border-white/40">
        <div className="max-w-5xl mx-auto flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-medical-500 to-medical-700 p-2.5 rounded-xl text-white shadow-lg shadow-medical-500/20">
              <Activity size={22} className="animate-pulse-slow" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-none tracking-tight">医学科研成果转化顾问</h1>
              <div className="flex items-center gap-1.5 mt-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Expert System Online</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold text-medical-700 bg-medical-50 border border-medical-100 px-3 py-1.5 rounded-full">
               <Sparkles size={12} className="text-medical-500" />
               医学科研成果转化顾问 v2.0
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth custom-scrollbar relative">
        <div className="max-w-4xl mx-auto pt-4">
          
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex w-full mb-8 justify-start animate-fade-in-up">
              <div className="flex max-w-[80%] flex-row items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white text-medical-600 border border-slate-100 flex items-center justify-center shadow-md">
                   <Sparkles size={20} className="animate-spin [animation-duration:3s]" />
                </div>
                <div className="glass-panel px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm border border-white">
                  <TypingIndicator />
                </div>
              </div>
            </div>
          )}

          {error && (
             <div className="flex justify-center mb-6 animate-scale-in">
                <div className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border border-red-100 shadow-sm font-medium">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
             </div>
          )}
          
          <div ref={messagesEndRef} className="h-12" />
        </div>
      </main>

      <footer className="flex-none bg-white/80 backdrop-blur-2xl border-t border-slate-200/50 p-5 z-20">
        <div className="max-w-4xl mx-auto relative">
          <div className="relative flex items-end gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-medical-500/30 focus-within:border-medical-500/50 transition-all shadow-xl shadow-slate-200/30">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="描述您的科研项目或转化困惑 (例如: 某种介入支架的专利布局策略?)"
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 text-slate-700 placeholder:text-slate-400 leading-relaxed py-2 font-medium"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className={`flex-shrink-0 mb-1 p-2.5 rounded-xl transition-all duration-300 ${
                inputValue.trim() && !isLoading
                  ? 'bg-gradient-to-r from-medical-600 to-medical-500 text-white shadow-lg shadow-medical-500/30 hover:scale-105 active:scale-95'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              <Send size={20} strokeWidth={2.5} />
            </button>
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-4 font-bold tracking-tight uppercase">
            专业医学科研辅助 · 遵循 HIPAA/人遗办合规 · 仅供专家参考
          </p>
        </div>
      </footer>
    </div>
  );
}
