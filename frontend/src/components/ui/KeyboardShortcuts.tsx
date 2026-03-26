import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Command, Search, MessageSquare, Calendar, Bookmark, Hash, LayoutDashboard } from 'lucide-react';

export const KeyboardShortcuts: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') {
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('toggle-shortcuts', handleToggle);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-shortcuts', handleToggle);
    };
  }, []);

  const shortcuts = [
    { key: '⌘ + K', label: 'Search Intelligence', icon: <Search size={14} /> },
    { key: '?', label: 'Show Shortcuts', icon: <Hash size={14} /> },
    { key: 'G + S', label: 'Go to Signals', icon: <LayoutDashboard size={14} /> },
    { key: 'G + A', label: 'Chat with Shruti', icon: <MessageSquare size={14} /> },
    { key: 'G + B', label: 'Go to Daily Brief', icon: <Calendar size={14} /> },
    { key: 'G + W', label: 'Go to Watchlist', icon: <Bookmark size={14} /> },
    { key: 'Esc', label: 'Close Modals', icon: <X size={14} /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-surface-overlay border border-border/50 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-border/10 flex items-center justify-between bg-surface-raised/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <Command size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-text-primary tracking-tight">Keyboard Shortcuts</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/40">Master TrendSense Navigation</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-2xl hover:bg-surface transition-colors text-text-muted/40 hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 gap-3">
              {shortcuts.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface/50 transition-colors border border-transparent hover:border-border/10 group">
                  <div className="flex items-center gap-4">
                    <div className="text-text-muted/40 group-hover:text-accent transition-colors">
                      {s.icon}
                    </div>
                    <span className="text-sm font-bold text-text-secondary group-hover:text-text-primary transition-colors">{s.label}</span>
                  </div>
                  <kbd className="px-3 py-1 rounded-xl bg-surface-raised border border-border text-[10px] font-black font-mono text-text-primary shadow-lg">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="p-6 bg-surface-raised/30 border-t border-border/10 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/30">Press any key to dismiss</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
