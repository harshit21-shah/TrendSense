import React, { useState, useEffect, useRef } from 'react';
import { Search, X, History, TrendingUp, ChevronRight, Loader2, Sparkles, Zap, DollarSign, Leaf, Dna, Bot } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchTrends } from '../../api';
import { useTrendStore } from '../../store/useTrendStore';
import { useToastStore } from '../../store/useToastStore';
import { cn } from '../../utils/cn';
import { type Trend } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const Highlight = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => (
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-accent/30 text-accent font-black rounded-sm px-0.5">{part}</mark>
        ) : part
      ))}
    </>
  );
};

const domainIcons: Record<string, React.ReactNode> = {
  'AI': <Bot size={14} className="text-blue-400" />,
  'Fintech': <DollarSign size={14} className="text-green-400" />,
  'Climate Tech': <Leaf size={14} className="text-emerald-400" />,
  'Biotech': <Dna size={14} className="text-purple-400" />,
  'Agentic': <Zap size={14} className="text-yellow-400" />,
};

// Standardised placeholder — context-aware results, consistent label
function getSearchPlaceholder(_pathname: string) {
  return 'Search...';
}

export const SearchInput: React.FC = () => {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('search_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setSelectedTrend } = useTrendStore();
  const { addToast } = useToastStore();

  const trendingSearches = [
    { term: 'AI', count: 69, icon: domainIcons['AI'] },
    { term: 'Fintech', count: 42, icon: domainIcons['Fintech'] },
    { term: 'Climate Tech', count: 28, icon: domainIcons['Climate Tech'] },
    { term: 'Biotech', count: 35, icon: domainIcons['Biotech'] },
    { term: 'Agentic', count: 51, icon: domainIcons['Agentic'] },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchTrends(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    const handleFocusSearch = () => {
      inputRef.current?.focus();
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('focus-search', handleFocusSearch);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('focus-search', handleFocusSearch);
    };
  }, []);

  const addToHistory = (q: string) => {
    const newHistory = [q, ...history.filter(h => h !== q)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const removeFromHistory = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h !== term);
    setHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const itemsCount = (results?.length || 0) + (query ? 0 : history.length + trendingSearches.length);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < itemsCount - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0) {
        if (results && selectedIndex < results.length) {
          handleSelectTrend(results[selectedIndex]);
        } else if (!query) {
          const hLength = history.length;
          if (selectedIndex < hLength) {
            setQuery(history[selectedIndex]);
          } else if (selectedIndex < hLength + trendingSearches.length) {
            setQuery(trendingSearches[selectedIndex - hLength].term);
          }
        }
      }
    }
  };

  const handleSelectTrend = (trend: Trend) => {
    setSelectedTrend(trend);
    addToHistory(trend.title);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative group w-full">
      <div className="relative">
        <motion.div
          animate={{
            rotate: isLoading ? 360 : 0,
          }}
          transition={{
            duration: 1,
            repeat: isLoading ? Infinity : 0,
            ease: "linear"
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
        >
          <Search 
            size={16} 
            className={cn(
              "transition-colors duration-200",
              isFocused ? "text-accent" : "text-text-muted/60"
            )} 
          />
        </motion.div>
        
        <input 
          ref={inputRef}
          type="text" 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            setIsOpen(true);
            setIsFocused(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={getSearchPlaceholder(location.pathname)}
          className={cn(
            "w-full h-10 bg-surface-raised/50 border rounded-btn py-2 pl-9 pr-16 text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none",
            isFocused 
              ? "border-accent/60 bg-surface-raised/80 shadow-[0_0_0_2px_rgba(99,102,241,0.15)] ring-2 ring-accent/10" 
              : "border-border/40 hover:border-border/60 hover:shadow-sm"
          )}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Loader2 size={12} className="animate-spin text-accent" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setQuery('')}
              className="p-1 hover:bg-surface-overlay rounded text-text-muted/60 hover:text-text-primary transition-all"
            >
              <X size={12} />
            </motion.button>
          )}
          
          {!query && !isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-overlay/50 border border-border/30 text-[9px] font-bold text-text-muted/50"
              title="Press ⌘K to quick search"
            >
              <span className="text-[8px]">⌘</span>
              <span>K</span>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-full left-0 right-0 mt-2 bg-surface-overlay/98 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50"
          >
            <div className="p-5 max-h-[500px] overflow-y-auto no-scrollbar">
              {!query && (
                <div className="space-y-6">
                  {/* Trending Searches */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-[0.15em] text-text-muted/40">
                      <Sparkles size={12} className="text-accent" />
                      <span>Trending Now</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {trendingSearches.map((item, i) => (
                        <motion.button
                          key={item.term}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => setQuery(item.term)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl text-left transition-all border group",
                            selectedIndex === (history.length + i) 
                              ? "bg-accent/10 border-accent/40 shadow-lg shadow-accent/10" 
                              : "bg-surface/50 border-border/20 hover:border-accent/30 hover:bg-surface-raised/50"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {item.icon}
                            <span className="text-sm font-bold text-text-primary">{item.term}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-text-muted/40 group-hover:text-accent transition-colors">
                            ({item.count})
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Searches */}
                  {history.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-text-muted/40">
                          <History size={12} />
                          <span>Recent Searches</span>
                        </div>
                        <button
                          onClick={() => {
                            setHistory([]);
                            localStorage.removeItem('search_history');
                            addToast('Search history cleared', 'info');
                          }}
                          className="text-[9px] font-black uppercase tracking-widest text-text-muted/30 hover:text-danger transition-colors px-2 py-1 rounded hover:bg-danger/5"
                        >
                          Clear
                        </button>
                      </div>
                      {history.map((h, i) => (
                        <motion.button
                          key={h}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => setQuery(h)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left group border",
                            selectedIndex === i 
                              ? "bg-surface-raised border-accent/20" 
                              : "border-transparent hover:bg-surface/50 hover:border-border/20"
                          )}
                        >
                          <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">{h}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => removeFromHistory(e, h)}
                              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-danger/10 rounded transition-all"
                            >
                              <X size={12} className="text-text-muted/60 hover:text-danger" />
                            </button>
                            <ChevronRight size={14} className="text-text-muted/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-2 text-[10px] font-black uppercase tracking-[0.15em] text-text-muted/40">
                      <Zap size={12} className="text-yellow-400" />
                      <span>Quick Actions</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'High Velocity Signals', desc: 'TVS 90-100', action: () => {} },
                        { label: 'Rising Trends', desc: 'Momentum +10%', action: () => {} },
                        { label: 'Last 24 Hours', desc: 'Recent signals', action: () => {} },
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={item.action}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-surface/30 border border-border/10 hover:border-accent/30 hover:bg-surface-raised/50 transition-all text-left group"
                        >
                          <div>
                            <div className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">{item.label}</div>
                            <div className="text-xs text-text-muted/60">{item.desc}</div>
                          </div>
                          <ChevronRight size={14} className="text-text-muted/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {query.length >= 2 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-[0.15em] text-text-muted/40">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={12} className="text-accent" />
                      <span>Intelligence Signals</span>
                    </div>
                    <span className="text-accent">{results?.length || 0} found</span>
                  </div>
                  
                  {results && results.length > 0 ? (
                    results.map((trend, i) => (
                      <motion.button
                        key={trend.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleSelectTrend(trend)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-xl transition-all text-left group border",
                          selectedIndex === i 
                            ? "bg-surface-raised border-accent/30 shadow-lg shadow-accent/5" 
                            : "border-transparent hover:bg-surface/50 hover:border-border/20"
                        )}
                      >
                        <div className="flex flex-col gap-2 flex-1 min-w-0">
                          <span className="text-sm font-black text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                            <Highlight text={trend.title} highlight={query} />
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-text-muted/60 uppercase tracking-widest">{trend.domain}</span>
                            <div className="h-1 w-1 rounded-full bg-border/40" />
                            <span className="text-[10px] font-mono font-bold text-accent">TVS {trend.velocity_score}</span>
                            <div className="h-1 w-1 rounded-full bg-border/40" />
                            <span className="text-[10px] font-bold text-text-muted/60">{trend.stage}</span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-text-muted/40 group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0 ml-3" />
                      </motion.button>
                    ))
                  ) : !isLoading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-12 text-center space-y-4"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-surface-raised/50 flex items-center justify-center mx-auto text-text-muted/30 border border-border/20">
                        <Search size={28} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary mb-1">No signals found</p>
                        <p className="text-xs text-text-muted/60">Try searching for "AI trends" or "Fintech"</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {query.length > 0 && query.length < 2 && (
                <div className="p-8 text-center text-xs text-text-muted/60">
                  Type at least 2 characters to search...
                </div>
              )}
            </div>
            
            <div className="px-5 py-3 bg-surface-raised/50 border-t border-border/30 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.15em] text-text-muted/40">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 rounded-md bg-surface border border-border/50 text-[9px] font-mono">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 rounded-md bg-surface border border-border/50 text-[9px] font-mono">↵</kbd>
                  Select
                </span>
              </div>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 rounded-md bg-surface border border-border/50 text-[9px] font-mono">Esc</kbd>
                Close
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
