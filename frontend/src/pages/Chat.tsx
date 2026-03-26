import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Sparkles, 
  Download, 
  Loader2, 
  Copy, 
  Check,
  ChevronRight
} from 'lucide-react';
import { useTrendStore } from '../store/useTrendStore';
import { useToastStore } from '../store/useToastStore';
import { cn } from '../utils/cn';
import ReactMarkdown from 'react-markdown';

const TypingIndicator = () => (
  <div className="flex gap-2 p-4 rounded-3xl bg-surface/30 border border-border/5 w-fit">
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 1, delay: 0 }}
      className="w-1.5 h-1.5 rounded-full bg-accent/40"
    />
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
      className="w-1.5 h-1.5 rounded-full bg-accent/40"
    />
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
      className="w-1.5 h-1.5 rounded-full bg-accent/40"
    />
  </div>
);

const Chat: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { chatHistory, addChatMessage, updateChatMessage, clearChatHistory } = useTrendStore();
  const { addToast } = useToastStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const suggestedQueries = [
    "What are the high-velocity signals in Fintech?",
    "Synthesize current AI infrastructure risks",
    "Map product opportunities for edge-compute",
    "Which trends are fading this week?",
    "What emerging trends should I watch in biotech?",
    "Compare AI infrastructure vs. AI application trends",
  ];

  const handleSend = async (text: string = input) => {
    if (!text.trim() || text.trim().length < 3 || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addChatMessage(userMessage);
    setInput('');
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.content }),
      });

      if (!response.ok) throw new Error('Failed to query AI');

      addChatMessage({
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr === '[DONE]') break;
              
              try {
                const data = JSON.parse(dataStr);
                if (data.content) {
                  updateChatMessage(assistantId, data.content);
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      addToast('Failed to get response. Please try again.', 'error');
      addChatMessage({
        id: assistantId,
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please check your connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all chat history? This cannot be undone.')) {
      clearChatHistory();
      addToast('Chat history cleared', 'info');
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    addToast('Message copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const transcript = chatHistory
      .map(m => `[${m.timestamp}] ${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trendsense-chat-transcript-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Chat transcript exported successfully', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-full"  style={{ minHeight: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between py-2 px-1 shrink-0 border-b border-border/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-card bg-surface-raised border border-border/50 flex items-center justify-center">
            <Bot size={16} className="text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-accent font-mono text-[10px] font-bold uppercase tracking-[0.15em]">
              <Sparkles size={9} className="animate-pulse" />
              <span>AI Research Assistant</span>
            </div>
            <h1 className="text-sm font-bold tracking-tight text-text-primary leading-tight">Intelligence Query</h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {chatHistory.length > 0 && (
            <button
              onClick={handleExport}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-raised transition-all duration-150 rounded-btn border border-transparent hover:border-border/50 w-9 h-9 flex items-center justify-center"
              title="Export transcript"
              aria-label="Export conversation transcript"
            >
              <Download size={14} />
            </button>
          )}
          <button
            onClick={handleClearHistory}
            aria-label="Clear conversation history"
            className="p-2 text-text-muted hover:text-danger hover:bg-danger/5 transition-all duration-150 rounded-btn border border-transparent hover:border-danger/10 w-9 h-9 flex items-center justify-center"
            title="Clear history"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar space-y-4 px-1 min-h-0"
        role="log"
        aria-label="Conversation history"
        aria-live="polite"
        aria-atomic="false"
      >
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-8">
            <div className="w-14 h-14 rounded-2xl bg-surface-raised border border-border/50 flex items-center justify-center">
              <Bot size={28} className="text-accent" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-text-primary tracking-tight">How can I assist your research?</h2>
              <p className="text-text-secondary/60 max-w-sm mx-auto text-sm">Query the intelligence engine for trends, market analysis, or strategic insights.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
              {suggestedQueries.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface/30 border border-border/10 hover:border-accent/30 hover:bg-surface-raised transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary leading-snug">{prompt}</span>
                  <ChevronRight size={14} className="text-text-muted/20 group-hover:text-accent transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {chatHistory.map((message) => (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                key={message.id}
                className={cn(
                  "flex gap-3 group",
                  message.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                  message.role === 'user'
                    ? "bg-text-primary text-background"
                    : "bg-surface-raised border border-border/50 text-accent"
                )}>
                  {message.role === 'user' ? <User size={15} /> : <Bot size={15} />}
                </div>

                <div className={cn(
                  "flex flex-col gap-1 max-w-[75%]",
                  message.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl relative text-sm leading-relaxed w-fit",
                    message.role === 'user'
                      ? "bg-surface-raised text-text-primary rounded-tr-none border border-border/50"
                      : "bg-surface/50 text-text-secondary rounded-tl-none border border-border/5"
                  )}>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="absolute -right-9 top-0 p-2 text-text-muted/40 hover:text-text-primary transition-colors duration-150 opacity-0 group-hover:opacity-100"
                      >
                        {copiedId === message.id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                      </button>
                    )}
                    <div className="prose-chat max-w-none">
                      <ReactMarkdown>{message.content || '...'}</ReactMarkdown>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted/40 px-1">
                    {message.timestamp}
                  </span>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-surface-raised border border-border/50 flex items-center justify-center text-accent shrink-0">
                  <Bot size={15} />
                </div>
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 pt-3 px-1">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative group"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about trends or opportunities..."
            className="w-full bg-surface-raised border border-border/50 rounded-card py-3 pl-4 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:bg-surface-overlay transition-all duration-150 resize-none min-h-[48px] max-h-[140px]"
            rows={1}
            disabled={isLoading}
            aria-label="Message input"
          />
          <div className="absolute right-2 bottom-2">
            <button
              type="submit"
              disabled={!input.trim() || input.trim().length < 3 || isLoading}
              title="Send (Enter)"
              aria-label="Send message"
              className={cn(
                "p-2 rounded-btn transition-all duration-150 active:scale-90 w-9 h-9 flex items-center justify-center",
                input.trim().length >= 3 && !isLoading
                  ? "bg-accent text-white shadow-sm shadow-accent/30"
                  : "bg-surface text-text-muted opacity-40 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </form>
        <div className="flex items-center justify-center gap-3 mt-1.5 text-[10px] text-text-muted">
          <span><kbd className="px-1.5 py-0.5 bg-surface-raised rounded text-[9px] border border-border/50">Enter</kbd> send</span>
          <span className="w-1 h-1 rounded-full bg-border/30" />
          <span><kbd className="px-1.5 py-0.5 bg-surface-raised rounded text-[9px] border border-border/50">Shift+Enter</kbd> new line</span>
        </div>
      </div>
    </div>
  );
};

export default Chat;
