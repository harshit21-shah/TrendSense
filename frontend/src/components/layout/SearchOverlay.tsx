import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useSearchTrends } from '../../hooks/useTrends';
import { DomainBadge } from '../ui/Badge';
import { TVSBadge } from '../ui/TVSBadge';
import { cn } from '../../lib/cn';

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, selectTrend } = useAppStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: results = [], isFetching } = useSearchTrends(query);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery('');
    }
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setSearchOpen]);

  const hasQuery = query.trim().length > 1;

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.12 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2 px-4"
          >
            <div className="bg-zinc-900 rounded-xl shadow-2xl ring-1 ring-zinc-700/80 overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
                <Search className="h-4 w-4 text-zinc-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search trends, domains, topics…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 outline-none"
                  autoComplete="off"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="text-zinc-600 hover:text-zinc-300 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Results */}
              {hasQuery && (
                <div className="max-h-72 overflow-y-auto">
                  {isFetching && results.length === 0 && (
                    <div className="p-4 text-sm text-zinc-500 text-center">Searching…</div>
                  )}
                  {!isFetching && results.length === 0 && (
                    <div className="p-4 text-sm text-zinc-500 text-center">
                      No trends found for "{query}"
                    </div>
                  )}
                  {results.map((trend) => (
                    <button
                      key={trend.id}
                      onClick={() => {
                        selectTrend(trend.id);
                        setSearchOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/70 transition-colors text-left border-b border-zinc-800/40 last:border-none"
                    >
                      <TVSBadge score={trend.velocity_score} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-100 truncate font-medium">{trend.title}</p>
                        {trend.summary && (
                          <p className="text-xs text-zinc-500 truncate mt-0.5">
                            {trend.summary.slice(0, 90)}
                            {trend.summary.length > 90 ? '…' : ''}
                          </p>
                        )}
                      </div>
                      <DomainBadge domain={trend.domain} />
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div
                className={cn(
                  'flex items-center gap-4 px-4 py-2 text-xs text-zinc-700',
                  hasQuery ? 'border-t border-zinc-800' : '',
                )}
              >
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="h-3 w-3" /> select
                </span>
                <span>
                  <kbd className="font-mono">esc</kbd> close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
