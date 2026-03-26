import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrendStore } from '../store/useTrendStore';
import { TrendRow } from '../components/trends/TrendRow';
import { TrendDrawer } from '../components/trends/TrendDrawer';
import { TrendRowSkeleton } from '../components/ui/SkeletonLoader';
import { Bookmark, Info, ArrowRight } from 'lucide-react';

const Saved: React.FC = () => {
  const { savedTrends, selectedTrend, setSelectedTrend } = useTrendStore();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <div className="flex items-center gap-1.5 text-accent font-mono text-[10px] uppercase tracking-[0.15em]">
          <Bookmark size={10} strokeWidth={2.5} fill="currentColor" />
          <span>Bookmarked Intelligence</span>
        </div>
        <h1 className="text-h3 font-extrabold tracking-tight text-text-primary">
          Saved
        </h1>
        <div className="flex items-start gap-1.5 max-w-2xl">
          <Info size={13} className="text-blue-400/60 mt-0.5 shrink-0" />
          <p className="text-text-secondary text-sm leading-relaxed">
            Bookmarks are stored locally in your browser. Cross-device sync coming soon.
          </p>
        </div>
      </header>

      <div className="space-y-2.5">
        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => <TrendRowSkeleton key={i} index={i} />)}
          </div>
        ) : savedTrends.length > 0 ? (
          <div className="space-y-2.5 pb-20">
            {savedTrends.map((trend, index) => (
              <TrendRow
                key={trend.id}
                trend={trend}
                index={index}
                onClick={setSelectedTrend}
              />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-surface rounded-card border border-border/50 space-y-5">
            <div className="w-16 h-16 bg-surface-raised rounded-2xl flex items-center justify-center mx-auto text-text-muted/40 border border-border/30">
              <Bookmark size={28} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-text-primary tracking-tight">No Bookmarked Trends</h3>
              <p className="text-text-secondary/70 max-w-xs mx-auto text-[15px] leading-relaxed">
                Bookmark signals to build your feed
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-accent text-white rounded-lg text-sm font-bold hover:bg-accent/90 transition-all duration-200 active:scale-95 shadow-lg shadow-accent/20 group"
            >
              Browse Signals
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>

      <TrendDrawer
        trend={selectedTrend}
        onClose={() => setSelectedTrend(null)}
      />
    </div>
  );
};

export default Saved;
