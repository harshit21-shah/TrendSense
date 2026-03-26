import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Command, Keyboard } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['G', 'H'], description: 'Go to Dashboard', category: 'Navigation' },
  { keys: ['G', 'C'], description: 'Go to Chat', category: 'Navigation' },
  { keys: ['G', 'B'], description: 'Go to Brief', category: 'Navigation' },
  { keys: ['G', 'T'], description: 'Go to Timeline', category: 'Navigation' },
  { keys: ['G', 'S'], description: 'Go to Saved', category: 'Navigation' },
  
  // Actions
  { keys: ['/'], description: 'Focus Search', category: 'Actions' },
  { keys: ['⌘', 'K'], description: 'Quick Search', category: 'Actions' },
  { keys: ['R'], description: 'Refresh Data', category: 'Actions' },
  { keys: ['N'], description: 'New Chat', category: 'Actions' },
  { keys: ['Esc'], description: 'Close Modal/Drawer', category: 'Actions' },
  
  // Trend Actions
  { keys: ['B'], description: 'Bookmark Trend', category: 'Trends' },
  { keys: ['Enter'], description: 'Open Trend Details', category: 'Trends' },
  { keys: ['↑', '↓'], description: 'Navigate Trends', category: 'Trends' },
  { keys: ['S'], description: 'Share Trend', category: 'Trends' },
  
  // General
  { keys: ['?'], description: 'Show Shortcuts', category: 'General' },
  { keys: ['⌘', ','], description: 'Open Settings', category: 'General' },
];

export const KeyboardShortcutsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Toggle with "?"
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        // Don't trigger if typing in input/textarea
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomEvent = () => {
      setIsOpen(prev => !prev);
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('toggle-shortcuts', handleCustomEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('toggle-shortcuts', handleCustomEvent);
    };
  }, [isOpen]);

  const categories = [...new Set(shortcuts.map(s => s.category))];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl max-h-[90vh] bg-surface-raised border border-border/50 rounded-3xl shadow-2xl z-[101] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-border/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Keyboard size={24} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-sm text-text-muted/60">Navigate faster with these shortcuts</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-2xl text-text-muted hover:text-text-primary hover:bg-surface transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close shortcuts modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {categories.map(category => (
                <div key={category}>
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-muted/40 mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {shortcuts
                      .filter(s => s.category === category)
                      .map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-2xl bg-surface/50 border border-border/5 hover:bg-surface-overlay transition-all"
                        >
                          <span className="text-sm font-medium text-text-secondary">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-2">
                            {shortcut.keys.map((key, keyIndex) => (
                              <React.Fragment key={keyIndex}>
                                <kbd className="px-3 py-1.5 rounded-lg bg-background border border-border/50 text-xs font-black font-mono text-text-primary shadow-sm min-w-[32px] text-center">
                                  {key}
                                </kbd>
                                {keyIndex < shortcut.keys.length - 1 && (
                                  <span className="text-text-muted/40 text-xs font-bold">+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 border-t border-border/10 bg-surface/30">
              <div className="flex items-center justify-center gap-2 text-xs text-text-muted/60">
                <span>Press</span>
                <kbd className="px-2 py-1 rounded bg-background border border-border/50 font-mono font-bold">
                  ?
                </kbd>
                <span>to toggle this panel</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
