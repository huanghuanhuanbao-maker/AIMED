import React, { useMemo } from 'react';
import { Message, Role } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { User, Bot, BrainCircuit, ChevronDown, Terminal, Loader2, Zap, CheckCircle2, FileText, Bot as BotIcon, AlertCircle } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  // Separate thought process from main content
  const { displayThought, displayContent, isThinking } = useMemo(() => {
    if (isUser) {
      return { displayThought: '', displayContent: message.content, isThinking: false };
    }

    let explicitThought = message.thought || '';
    let content = message.content || '';

    // Legacy Heuristic support (if API doesn't use the new structured format yet)
    if (!explicitThought && content) {
        const lines = content.split('\n');
        const thoughtLines: string[] = [];
        let contentStartIndex = 0;
        
        const keywords = ["Thinking", "Searching", "I will", "Checking", "分析", "Retrieving", "start|", "tool_start|"];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line && thoughtLines.length === 0) continue;

          // Check for structured format pipe or keywords
          const isLog = keywords.some(k => line.startsWith(k)) || line.match(/^\[.*\]/) || line.includes('|[');
          
          if (isLog) {
            thoughtLines.push(lines[i]);
            contentStartIndex = i + 1;
          } else {
            break;
          }
        }
        if (thoughtLines.length > 0) {
            explicitThought = thoughtLines.join('\n');
            content = lines.slice(contentStartIndex).join('\n').trim();
        }
    }

    // Determine if the bot is still "thinking" (has thoughts but no content yet)
    const thinking = !!explicitThought && !content;

    return {
      displayThought: explicitThought.trim(),
      displayContent: content.trim(),
      isThinking: thinking
    };
  }, [message.content, message.thought, isUser]);

  // Helper to parse line: TYPE|TIMESTAMP|CONTENT
  const parseLogLine = (line: string) => {
    const parts = line.split('|');
    if (parts.length < 3) {
        // Fallback for legacy plain logs
        return { type: 'text', time: '', content: line };
    }
    return { type: parts[0], time: parts[1], content: parts.slice(2).join('|') };
  };

  return (
    <div className={`flex w-full mb-8 animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] lg:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md mt-1 transition-transform hover:scale-105 ${
          isUser 
            ? 'bg-gradient-to-br from-medical-600 to-medical-800 text-white' 
            : 'bg-white text-medical-600 border border-slate-100'
        }`}>
          {isUser ? <User size={20} /> : <Bot size={22} />}
        </div>

        {/* Bubble Container */}
        <div className="flex flex-col gap-3 w-full min-w-0">
          
          {/* Collapsible Thought Section (Fancy Terminal Style) */}
          {!isUser && displayThought && (
            <div className="w-full">
                <details className="group mb-1" open={isThinking}>
                <summary className="list-none flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-400 hover:text-medical-600 transition-colors w-fit px-2 py-1.5 rounded-md hover:bg-slate-100/50 border border-transparent hover:border-slate-200">
                    {isThinking ? (
                        <Loader2 size={14} className="text-medical-500 animate-spin" />
                    ) : (
                        <BrainCircuit size={14} className="text-medical-400" />
                    )}
                    <span>{isThinking ? "正在深度思考..." : "思维链日志"}</span>
                    <ChevronDown size={12} className="group-open:rotate-180 transition-transform duration-200" />
                </summary>
                
                <div className="mt-2 rounded-xl border border-slate-800 bg-[#0d1117] shadow-2xl overflow-hidden animate-scale-in origin-top-left font-mono text-xs w-full">
                    {/* Terminal Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-slate-800/50">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Terminal size={12} strokeWidth={2.5} />
                            <span className="uppercase tracking-widest text-[10px] font-bold opacity-80">SYSTEM_LOGS :: SPECTRA_AGENT</span>
                        </div>
                        <div className="flex gap-1.5 opacity-60">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        </div>
                    </div>
                    
                    {/* Terminal Content */}
                    <div className="p-4 space-y-3 overflow-x-auto max-h-80 custom-scrollbar">
                        {displayThought.split('\n').map((rawLine, idx) => {
                            if (!rawLine.trim()) return null;
                            const { type, time, content } = parseLogLine(rawLine);
                            
                            let Icon = null;
                            let colorClass = 'text-slate-400';
                            let iconColor = 'text-slate-500';
                            
                            switch(type) {
                                case 'start': 
                                    Icon = BotIcon; 
                                    iconColor = 'text-purple-400'; 
                                    colorClass = 'text-purple-100 font-bold';
                                    break;
                                case 'thinking': 
                                    Icon = BrainCircuit; 
                                    iconColor = 'text-pink-400'; 
                                    colorClass = 'text-sky-300 animate-pulse font-medium';
                                    break;
                                case 'tool_start': 
                                    Icon = Zap; 
                                    iconColor = 'text-amber-400'; 
                                    colorClass = 'text-amber-100';
                                    break;
                                case 'tool_end': 
                                    Icon = CheckCircle2; 
                                    iconColor = 'text-emerald-400'; 
                                    colorClass = 'text-emerald-100';
                                    break;
                                case 'file': 
                                    Icon = FileText; 
                                    iconColor = 'text-slate-500'; 
                                    colorClass = 'text-slate-400 italic';
                                    break;
                                case 'error':
                                    Icon = AlertCircle;
                                    iconColor = 'text-red-500';
                                    colorClass = 'text-red-400 font-bold';
                                    break;
                                default:
                                    // Handle plain text logs
                                    colorClass = 'text-slate-500';
                            }

                            return (
                                <div key={idx} className="flex items-start gap-3 group/line">
                                    {/* Line Number */}
                                    <span className="text-slate-700 select-none w-5 text-right shrink-0 font-medium group-hover/line:text-slate-600 transition-colors">{idx + 1}</span>
                                    
                                    {/* Time & Content */}
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        {time && (
                                            <span className="text-fuchsia-500/70 shrink-0 font-medium font-sans text-[10px] tracking-wide bg-fuchsia-500/5 px-1 rounded">
                                                {time}
                                            </span>
                                        )}
                                        
                                        {Icon && <Icon size={14} className={`${iconColor} shrink-0`} strokeWidth={2} />}
                                        
                                        <span className={`break-all leading-snug ${colorClass} ${type === 'file' ? 'ml-1' : ''}`}>
                                            {content}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {isThinking && (
                            <div className="flex items-center gap-3 pl-[3.5rem] mt-2">
                                <div className="w-2 h-4 bg-slate-600 animate-pulse"></div>
                            </div>
                        )}
                    </div>
                </div>
                </details>
            </div>
          )}

          {/* Main Bubble */}
          {(displayContent || (!displayThought && !isThinking)) && (
            <div className={`
              relative px-5 py-4 rounded-2xl shadow-sm text-sm md:text-base leading-7 animate-fade-in-up
              ${isUser 
                ? 'bg-gradient-to-br from-medical-600 to-medical-700 text-white rounded-tr-sm shadow-medical-500/20' 
                : 'bg-white/90 backdrop-blur-sm text-slate-800 border border-white/50 shadow-slate-200/50 rounded-tl-sm'}
            `}>
               {displayContent ? (
                 <MarkdownRenderer content={displayContent} isUser={isUser} />
               ) : (
                 <div className="flex items-center gap-2 text-slate-400 italic">
                   <Loader2 size={16} className="animate-spin" />
                   <span>生成回复中...</span>
                 </div>
               )}
            </div>
          )}

          {/* Timestamp */}
          {displayContent && (
             <div className={`text-[10px] font-medium opacity-50 px-1 ${isUser ? 'text-right text-slate-400' : 'text-left text-slate-400'}`}>
               {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
