import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Menu, X, Info, Search } from 'lucide-react';
import { SearchInput } from './SearchInput';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <>
      <header className="h-14 px-4 md:px-6 flex items-center justify-between border-b border-border/20 bg-background/95 backdrop-blur-xl sticky top-0 z-40 shadow-sm shadow-black/10">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-text-muted hover:text-text-primary transition-colors duration-150 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-raised"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-[380px] mx-4">
          <SearchInput />
        </div>

        {/* Mobile Search Trigger */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="sm:hidden p-2 text-text-muted hover:text-text-primary transition-colors duration-150 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-raised"
          aria-label="Search"
        >
          <Search size={16} />
        </button>

        {/* Logo/Brand on mobile */}
        <div className="sm:hidden flex-1 flex justify-center">
          <span className="text-accent font-black text-lg tracking-tight">TS</span>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2 ml-4">
          <button
            onClick={() => setShowAbout(true)}
            className="p-2 text-text-muted hover:text-text-primary transition-all duration-200 rounded-lg hover:bg-surface-raised hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center group relative"
            aria-label="About TrendSense"
          >
            <Info size={16} strokeWidth={2} />
            <span className="absolute top-full mt-2 px-3 py-1.5 rounded-lg bg-surface-overlay border border-border/50 text-[10px] font-bold text-text-primary opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap pointer-events-none shadow-xl">
              About
            </span>
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center gap-1">
          <button
            onClick={() => setShowAbout(true)}
            className="p-2 text-text-muted hover:text-text-primary transition-colors duration-150 w-9 h-9 flex items-center justify-center"
            aria-label="About"
          >
            <Info size={15} />
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden fixed left-0 top-14 bottom-0 w-64 bg-surface-raised border-r border-border/30 z-50 overflow-y-auto"
              >
                <div className="p-4 space-y-4">
                  <div className="sm:hidden">
                    <SearchInput />
                  </div>
                  <div className="space-y-1 pt-2">
                    <button
                      onClick={() => { setShowAbout(true); setIsMobileMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-surface transition-colors duration-150 text-sm font-medium text-text-secondary h-12 flex items-center gap-3"
                    >
                      <Info size={15} />
                      About TrendSense
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile Search Modal */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSearchOpen(false)}
                className="sm:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
              />
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.15 }}
                className="sm:hidden fixed top-0 left-0 right-0 z-[101] bg-surface-raised border-b border-border/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <SearchInput />
                  </div>
                  <button
                    onClick={() => setMobileSearchOpen(false)}
                    className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* About Modal — portaled to body to escape header stacking context */}
      {ReactDOM.createPortal(
        <AnimatePresence>
          {showAbout && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAbout(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
              >
                <div className="bg-surface-raised border border-border/50 rounded-modal shadow-2xl max-w-md w-full overflow-hidden pointer-events-auto">
                  <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <span className="text-accent font-black text-base tracking-tight">TS</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-extrabold text-text-primary tracking-tight leading-none">TrendSense</h2>
                        <p className="text-xs text-text-muted mt-0.5">v1.0 · Public Intelligence Platform</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAbout(false)}
                      className="p-2 text-text-muted hover:text-text-primary transition-colors duration-150 rounded-lg hover:bg-surface w-8 h-8 flex items-center justify-center"
                      aria-label="Close"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="px-6 pb-6 space-y-4">
                    <p className="text-sm text-text-secondary leading-relaxed">
                      An open intelligence platform that tracks high-velocity market signals across AI, Fintech, and Health domains — powered by a real-time LangGraph pipeline.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Live Pipeline', desc: 'LangGraph multi-agent' },
                        { label: 'RAG Chat', desc: 'ChromaDB + Groq LLM' },
                        { label: 'TVS Scoring', desc: 'Trend velocity signals' },
                        { label: 'No account', desc: 'Fully public data' },
                      ].map(({ label, desc }) => (
                        <div key={label} className="bg-surface border border-border/30 rounded-lg px-3 py-2.5">
                          <p className="text-xs font-semibold text-text-primary">{label}</p>
                          <p className="text-[11px] text-text-muted mt-0.5">{desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border/20 pt-4">
                      <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Stack</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['React', 'TypeScript', 'FastAPI', 'LangGraph', 'ChromaDB', 'PostgreSQL', 'Groq'].map(tech => (
                          <span key={tech} className="px-2 py-0.5 rounded-md bg-surface border border-border/40 text-[11px] text-text-secondary font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
