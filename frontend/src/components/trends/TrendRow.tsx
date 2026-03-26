import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Bookmark,
  Share2,
  PlusCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { type Trend } from '../../types';
import { useTrendStore } from '../../store/useTrendStore';
import { useToastStore } from '../../store/useToastStore';
import { cn } from '../../utils/cn';
import { formatRelativeDate } from '../../utils/date';
import { ExpandableText } from '../ui/ExpandableText';

interface TrendRowProps {
  trend: Trend;
  onClick: (trend: Trend) => void;
  index: number;
}

const STAGE_CLASSES: Record<string, string> = {
  emerging:   'text-success bg-success/10 border-success/20',
  rising:     'text-blue-400 bg-blue-400/10 border-blue-400/20',
  mainstream: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  fading:     'text-orange-400 bg-orange-400/10 border-orange-400/20',
};

export const TrendRow: React.FC<TrendRowProps> = ({ trend, onClick, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { savedTrends, saveTrend, unsaveTrend } = useTrendStore();
  const { addToast } = useToastStore();

  const isSaved = savedTrends.some(t => t.id === trend.id);
  const isPositive = (trend.tvs_delta || 0) > 0;

  const isNew = useMemo(() => {
    const trendDate = new Date(trend.first_seen_at);
    const now = new Date();
    return (now.getTime() - trendDate.getTime()) / (1000 * 60 * 60) <= 24;
  }, [trend.first_seen_at]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      unsaveTrend(trend.id);
      addToast(`Removed ${trend.title} from watchlist`, 'info');
    } else {
      saveTrend(trend);
      addToast(`Added ${trend.title} to watchlist`, 'success');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + `?trend=${trend.id}`);
    addToast('Trend link copied to clipboard', 'success');
  };

  const handleAddToBrief = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToast('Added to briefing queue', 'info');
  };

  const stageKey = trend.stage.toLowerCase();
  const stageClass = STAGE_CLASSES[stageKey] ?? 'text-text-muted bg-surface-raised border-border/50';

  // Deterministic sparkline
  const sparklineData = useMemo(() => {
    const seed = String(trend.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array.from({ length: 12 }, (_, i) => {
      const base = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;
      const direction = isPositive ? (i / 12) * 25 : -(i / 12) * 25;
      return Math.max(5, Math.min(95, 38 + base * 35 + direction));
    });
  }, [trend.id, isPositive]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.025 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "signal-card group flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 relative overflow-hidden transition-all duration-200 cursor-pointer",
        isHovered && "bg-surface-raised border-accent/20 shadow-lg shadow-black/10 -translate-y-0.5"
      )}
      onClick={() => onClick(trend)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(trend); } }}
      aria-label={`View details for ${trend.title}`}
    >
      {/* Left accent bar — always 3px, visible on hover */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-200",
        isHovered ? "opacity-100" : "opacity-0",
        isPositive ? "bg-success shadow-[2px_0_8px_rgba(34,197,94,0.3)]" : "bg-danger shadow-[2px_0_8px_rgba(239,68,68,0.3)]"
      )} />

      {/* Score & Trajectory */}
      <div className="flex items-center md:flex-col gap-3 md:gap-1 w-full md:w-auto md:min-w-[56px] shrink-0">
        <div className="relative group/tvs">
          <span
            title="Trend Velocity Score (0–100)"
            className={cn(
              "text-[32px] font-bold font-mono tracking-tighter leading-none cursor-help transition-colors",
              trend.velocity_score >= 90 ? "text-success" :
              trend.velocity_score >= 70 ? "text-blue-400" :
              trend.velocity_score >= 50 ? "text-yellow-400" :
              "text-text-primary"
            )}
          >
            {trend.velocity_score}
          </span>
          {/* TVS Tooltip */}
          <div
            role="tooltip"
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 rounded-xl bg-surface-overlay border border-border/50 text-xs text-text-secondary leading-relaxed opacity-0 invisible group-hover/tvs:opacity-100 group-hover/tvs:visible transition-all z-20 shadow-2xl pointer-events-none"
          >
            <strong className="text-text-primary block mb-1">Trend Velocity Score (TVS)</strong>
            Measures trend acceleration (0-100) based on social engagement, source diversity, and momentum.
            <div className="mt-2 pt-2 border-t border-border/30 space-y-1 text-[10px]">
              <div className="flex justify-between"><span className="text-success">90-100:</span> <span>Very High</span></div>
              <div className="flex justify-between"><span className="text-blue-400">70-89:</span> <span>High</span></div>
              <div className="flex justify-between"><span className="text-yellow-400">50-69:</span> <span>Medium</span></div>
              <div className="flex justify-between"><span className="text-text-muted">0-49:</span> <span>Low</span></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isPositive
            ? <TrendingUp size={11} className="text-success" />
            : <TrendingDown size={11} className="text-danger" />}
          <span className={cn("text-[11px] font-bold font-mono", isPositive ? "text-success" : "text-danger")}>
            {isPositive ? '+' : ''}{trend.tvs_delta}%
          </span>
        </div>

        {/* Sparkline — desktop only */}
        <div className="hidden md:flex items-end gap-[1.5px] h-8 mt-1.5">
          {sparklineData.map((val, i) => (
            <div
              key={i}
              className={cn(
                "w-[2.5px] rounded-full transition-all duration-300",
                isHovered ? "bg-accent/60" : "bg-accent/20"
              )}
              style={{ height: `${val}%` }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isNew && (
            <span className="px-1.5 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider bg-accent/10 border border-accent/20 text-accent">
              New
            </span>
          )}
          <span 
            className={cn("px-1.5 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider border cursor-help relative group/stage", stageClass)}
            title={`${trend.stage} stage trend`}
          >
            {trend.stage}
            {/* Stage Tooltip */}
            <div
              role="tooltip"
              className="absolute left-0 top-full mt-1 w-56 p-2.5 rounded-lg bg-surface-overlay border border-border/50 text-[10px] text-text-secondary leading-relaxed opacity-0 invisible group-hover/stage:opacity-100 group-hover/stage:visible transition-all z-20 shadow-2xl pointer-events-none"
            >
              <strong className="text-text-primary block mb-0.5">{trend.stage}</strong>
              {stageKey === 'emerging' && 'Early-stage signals with high risk/reward potential'}
              {stageKey === 'rising' && 'Growing momentum with increasing adoption'}
              {stageKey === 'mainstream' && 'Established trends with broad awareness'}
              {stageKey === 'fading' && 'Declining interest, potential pivot opportunity'}
            </div>
          </span>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{trend.domain}</span>
          <span className="text-[10px] text-text-muted/50">{formatRelativeDate(trend.first_seen_at)}</span>
        </div>

        <h3 className="text-sm font-semibold text-text-primary tracking-tight group-hover:text-accent transition-colors duration-150 line-clamp-1 leading-snug">
          {trend.title}
        </h3>

        <ExpandableText text={trend.summary} maxLines={isHovered ? 2 : 1} />
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-border/10 pt-2 md:pt-0 w-full md:w-auto justify-end shrink-0">
        {/* Bookmark — always visible */}
        <button
          onClick={handleSave}
          className={cn(
            "p-2 rounded-card transition-all duration-150 border w-9 h-9 flex items-center justify-center min-w-[36px]",
            isSaved
              ? "bg-accent/10 border-accent/20 text-accent"
              : "bg-surface/50 border-border/30 text-text-muted hover:text-text-primary hover:bg-surface-raised hover:border-border/50"
          )}
          title={isSaved ? "Remove from Watchlist" : "Add to Watchlist"}
          aria-label={isSaved ? "Remove from Watchlist" : "Add to Watchlist"}
          aria-pressed={isSaved}
        >
          <Bookmark size={13} fill={isSaved ? "currentColor" : "none"} strokeWidth={2.5} />
        </button>

        {/* Share — mobile always, desktop on hover */}
        <button
          onClick={handleShare}
          className="md:hidden p-2 rounded-card bg-surface border border-border/50 text-text-muted hover:text-text-primary hover:bg-surface-raised transition-all duration-150 w-9 h-9 flex items-center justify-center"
          title="Copy Link"
          aria-label="Copy Link"
        >
          <Share2 size={13} strokeWidth={2.5} />
        </button>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="hidden md:flex items-center gap-2"
            >
              <button
                onClick={handleAddToBrief}
                className="p-2 rounded-card bg-surface border border-border/50 text-text-muted hover:text-text-primary hover:bg-surface-raised transition-all duration-150 w-9 h-9 flex items-center justify-center"
                title="Add to Intelligence Brief"
                aria-label="Add to Intelligence Brief"
              >
                <PlusCircle size={13} strokeWidth={2.5} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-card bg-surface border border-border/50 text-text-muted hover:text-text-primary hover:bg-surface-raised transition-all duration-150 w-9 h-9 flex items-center justify-center"
                title="Copy Link"
                aria-label="Copy Link"
              >
                <Share2 size={13} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hidden md:block text-text-muted/20 group-hover:text-accent transition-all transform group-hover:translate-x-0.5">
          <ChevronRight size={18} strokeWidth={2.5} />
        </div>
      </div>
    </motion.div>
  );
};
