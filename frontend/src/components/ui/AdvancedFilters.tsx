import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, Calendar, TrendingUp, Filter } from 'lucide-react';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export interface FilterState {
  tvsRange: [number, number];
  dateRange: { start: string; end: string } | null;
  momentumRange: [number, number];
  stages: string[];
  domains: string[];
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  isOpen,
  onClose,
  onApply,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      tvsRange: [0, 100],
      dateRange: null,
      momentumRange: [-100, 100],
      stages: [],
      domains: [],
    };
    setFilters(resetFilters);
    onApply(resetFilters);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.2 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-surface-raised border-l border-border/50 shadow-2xl z-[101] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <SlidersHorizontal size={20} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary tracking-tight">
                    Advanced Filters
                  </h2>
                  <p className="text-sm text-text-muted">Fine-tune your search</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface transition-all duration-150 min-w-[48px] min-h-[48px] flex items-center justify-center"
                aria-label="Close filters"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* TVS Score Range */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <TrendingUp size={16} className="text-accent" />
                <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">
                  Velocity Score (TVS)
                </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Min: {filters.tvsRange[0]}</span>
                    <span>Max: {filters.tvsRange[1]}</span>
                  </div>
                  <div className="flex gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.tvsRange[0]}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          tvsRange: [parseInt(e.target.value), filters.tvsRange[1]],
                        })
                      }
                      className="flex-1 accent-accent"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.tvsRange[1]}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          tvsRange: [filters.tvsRange[0], parseInt(e.target.value)],
                        })
                      }
                      className="flex-1 accent-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-accent" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">
                    Date Range
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-muted mb-2 block">From</label>
                    <input
                      type="date"
                      value={filters.dateRange?.start || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          dateRange: {
                            start: e.target.value,
                            end: filters.dateRange?.end || '',
                          },
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border/50 text-sm text-text-primary focus:outline-none focus:border-accent/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted mb-2 block">To</label>
                    <input
                      type="date"
                      value={filters.dateRange?.end || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          dateRange: {
                            start: filters.dateRange?.start || '',
                            end: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-surface border border-border/50 text-sm text-text-primary focus:outline-none focus:border-accent/40"
                    />
                  </div>
                </div>
              </div>

              {/* Momentum Range */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Filter size={16} className="text-accent" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">
                    Momentum Delta
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Min: {filters.momentumRange[0]}%</span>
                    <span>Max: {filters.momentumRange[1]}%</span>
                  </div>
                  <div className="flex gap-4">
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={filters.momentumRange[0]}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          momentumRange: [parseInt(e.target.value), filters.momentumRange[1]],
                        })
                      }
                      className="flex-1 accent-accent"
                    />
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={filters.momentumRange[1]}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          momentumRange: [filters.momentumRange[0], parseInt(e.target.value)],
                        })
                      }
                      className="flex-1 accent-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">
                  Quick Presets
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        tvsRange: [70, 100],
                        stages: ['Emerging', 'Rising'],
                      })
                    }
                    className="p-4 rounded-xl bg-surface border border-border/50 hover:border-accent/40 hover:bg-surface-overlay transition-all text-left"
                  >
                    <div className="text-sm font-bold text-text-primary">High Velocity</div>
                    <div className="text-xs text-text-muted/60">TVS 70-100</div>
                  </button>
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        momentumRange: [10, 100],
                      })
                    }
                    className="p-4 rounded-xl bg-surface border border-border/50 hover:border-accent/40 hover:bg-surface-overlay transition-all text-left"
                  >
                    <div className="text-sm font-bold text-text-primary">Rising Fast</div>
                    <div className="text-xs text-text-muted/60">Momentum +10%</div>
                  </button>
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        stages: ['Emerging'],
                      })
                    }
                    className="p-4 rounded-xl bg-surface border border-border/50 hover:border-accent/40 hover:bg-surface-overlay transition-all text-left"
                  >
                    <div className="text-sm font-bold text-text-primary">Early Stage</div>
                    <div className="text-xs text-text-muted/60">Emerging only</div>
                  </button>
                  <button
                    onClick={() =>
                      setFilters({
                        ...filters,
                        momentumRange: [-100, -10],
                      })
                    }
                    className="p-4 rounded-xl bg-surface border border-border/50 hover:border-accent/40 hover:bg-surface-overlay transition-all text-left"
                  >
                    <div className="text-sm font-bold text-text-primary">Declining</div>
                    <div className="text-xs text-text-muted/60">Momentum -10%</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border/10 bg-surface/30 flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 px-6 py-3.5 rounded-xl border border-border/50 text-sm font-black uppercase tracking-widest text-text-secondary hover:bg-surface-raised transition-all duration-150 min-h-[48px]"
              >
                Reset
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-6 py-3.5 rounded-xl bg-accent text-white text-sm font-black uppercase tracking-widest hover:bg-accent/90 transition-all duration-150 shadow-lg shadow-accent/20 min-h-[48px]"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
