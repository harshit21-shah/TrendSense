import { useState, useRef, useEffect, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, RotateCcw, User, Sparkles, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getChatSuggestions, queryTrends } from '../api';
import { useChatStore } from '../store/useChatStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { cn } from '../lib/cn';

export default function Chat() {
  useDocumentTitle('Ava');
  const { messages, isStreaming, addMessage, appendToLastMessage, setStreaming, clearMessages } =
    useChatStore();

  const { data: suggestions = [] } = useQuery({
    queryKey: ['chat-suggestions'],
    queryFn: getChatSuggestions,
    staleTime: 5 * 60_000,
  });

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isAtBottomRef = useRef(true);

  // Abort any in-flight stream and reset isStreaming when navigating away
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      // Reset streaming state so input isn't stuck disabled on return
      setStreaming(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only auto-scroll when user is already at the bottom
  useEffect(() => {
    if (isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleContainerScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  };

  const handleSend = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || isStreaming) return;

      // Abort any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      isAtBottomRef.current = true;

      addMessage({ role: 'user', content: q });
      addMessage({ role: 'assistant', content: '' });
      setStreaming(true);

      await queryTrends(
        q,
        (chunk) => appendToLastMessage(chunk),
        (err) => appendToLastMessage(`\n\n*Error: ${err}*`),
        abortRef.current.signal,
      );
      setStreaming(false);
    },
    [isStreaming, addMessage, appendToLastMessage, setStreaming],
  );

  const handleClearMessages = () => {
    // Abort stream before clearing — prevents ghost messages
    abortRef.current?.abort();
    abortRef.current = null;
    clearMessages();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600/20 ring-1 ring-violet-500/30 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Ava</h2>
            <p className="text-xs text-zinc-500">AI Trend Analyst · grounded in live signal data</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearMessages}
            className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New conversation
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleContainerScroll}
        className="flex-1 overflow-y-auto px-6 py-6"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 max-w-lg mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/15 ring-1 ring-violet-500/25 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-violet-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-200 mb-2">Ask Ava</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                I analyze emerging technology trends from live pipeline data. Ask about investment
                theses, product opportunities, competitive dynamics, or what's breaking out in any
                domain.
              </p>
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="px-3 py-2 text-sm text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 rounded-lg ring-1 ring-zinc-700/60 transition-colors text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    msg.role === 'user'
                      ? 'bg-zinc-700 ring-1 ring-zinc-600'
                      : 'bg-violet-600/20 ring-1 ring-violet-500/35',
                  )}
                >
                  {msg.role === 'user' ? (
                    <User className="h-3.5 w-3.5 text-zinc-300" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={cn(
                    'max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-violet-600/20 text-zinc-100 ring-1 ring-violet-500/20'
                      : 'bg-zinc-800/60 ring-1 ring-zinc-700/40',
                  )}
                >
                  {msg.role === 'assistant' ? (
                    msg.content ? (
                      <div className="ts-prose text-sm">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => (
                              <a href={href} target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 py-1" aria-label="Thinking…">
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"
                          style={{ animationDelay: '0ms' }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"
                          style={{ animationDelay: '150ms' }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    )
                  ) : (
                    <p className="text-zinc-100">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 pb-5 pt-3 border-t border-zinc-800/40 shrink-0">
        <div className="flex items-end gap-2.5 bg-zinc-900/80 ring-1 ring-zinc-800 rounded-xl px-3.5 py-2.5 focus-within:ring-violet-500/30 transition-all max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize(e.target);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about trends, investment theses, or market signals…"
            rows={1}
            disabled={isStreaming}
            aria-label="Chat input"
            className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none resize-none leading-relaxed disabled:opacity-40 py-0.5"
            style={{ maxHeight: '8rem' }}
          />
          {isStreaming ? (
            <button
              onClick={() => { abortRef.current?.abort(); setStreaming(false); }}
              className="shrink-0 w-7 h-7 rounded-md bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
              aria-label="Stop generation"
            >
              <StopCircle className="h-3.5 w-3.5 text-zinc-400" />
            </button>
          ) : (
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              className="shrink-0 w-7 h-7 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              aria-label="Send message"
            >
              <Send className="h-3 w-3 text-white" />
            </button>
          )}
        </div>
        <p className="text-[10px] text-zinc-700 mt-1.5 text-center max-w-3xl mx-auto">
          <kbd className="font-mono">Shift+Enter</kbd> for new line
          {isStreaming && <span className="ml-3 text-violet-600 animate-pulse">Generating…</span>}
        </p>
      </div>
    </div>
  );
}
