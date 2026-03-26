import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ExternalLink, Bookmark, Share2, Info, Target, 
  TrendingUp, AlertTriangle, Download, FileText,
  BarChart2, Lightbulb, Shield, BookOpen, HelpCircle
} from 'lucide-react';
import { type Trend } from '../../types';
import { Badge } from '../ui/Badge';
import { TVSDisplay } from '../ui/TVSDisplay';
import { cn } from '../../utils/cn';
import { useTrendStore } from '../../store/useTrendStore';
import { useToastStore } from '../../store/useToastStore';

interface TrendDrawerProps {
  trend: Trend | null;
  onClose: () => void;
}

type Tab = 'overview' | 'investment' | 'opportunity' | 'risk' | 'sources';
type Period = '7d' | '30d' | '90d';

// Deterministic sparkline seeded by trend ID
const getSparklineData = (id: string | number, period: Period, positive: boolean) => {
  const seed = String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const count = period === '7d' ? 7 : period === '30d' ? 14 : 20;
  return Array.from({ length: count }, (_, i) => {
    const base = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;
    const trend = positive ? (i / count) * 20 : -(i / count) * 20;
    return Math.max(5, Math.min(95, 40 + base * 40 + trend));
  });
};

// SVG sparkline path
const buildPath = (data: number[], width: number, height: number) => {
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - minVal) / range) * (height - 8) - 4,
  }));
  return (
    points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cp1x = prev.x + (p.x - prev.x) / 2;
      return `${acc} C ${cp1x} ${prev.y}, ${cp1x} ${p.y}, ${p.x} ${p.y}`;
    }, '') + 
    ` L ${points[points.length-1].x} ${height} L 0 ${height} Z`
  );
};

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <FileText size={14} /> },
  { id: 'investment', label: 'Investment', icon: <Target size={14} /> },
  { id: 'opportunity', label: 'Opportunity', icon: <Lightbulb size={14} /> },
  { id: 'risk', label: 'Risk', icon: <Shield size={14} /> },
  { id: 'sources', label: 'Sources', icon: <BookOpen size={14} /> },
];

export const TrendDrawer: React.FC<TrendDrawerProps> = ({ trend, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [activePeriod, setActivePeriod] = useState<Period>('30d');
  const { addRecentlyViewed, savedTrends, saveTrend, unsaveTrend } = useTrendStore();
  const { addToast } = useToastStore();

  React.useEffect(() => {
    if (trend) {
      addRecentlyViewed(trend);
      setActiveTab('overview');
    }
  }, [trend, addRecentlyViewed]);

  // Keyboard: Esc closes drawer
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!trend) return null;

  const isSaved = savedTrends.some(t => t.id === trend.id);
  const isPositive = (trend.tvs_delta || 0) >= 0;
  const sparkData = getSparklineData(trend.id, activePeriod, isPositive);
  const lineColor = isPositive ? '#4ADE80' : '#F87171';

  const handleSave = () => {
    if (isSaved) {
      unsaveTrend(trend.id);
      addToast(`Removed "${trend.title}" from watchlist`, 'info');
    } else {
      saveTrend(trend);
      addToast(`Added "${trend.title}" to watchlist`, 'success');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `?trend=${trend.id}`);
    addToast('Trend link copied to clipboard', 'success');
  };

  const handleExportCSV = () => {
    const rows = [
      ['Field', 'Value'],
      ['Title', trend.title],
      ['Domain', trend.domain],
      ['Stage', trend.stage],
      ['TVS Score', String(trend.velocity_score)],
      ['TVS Delta', `${trend.tvs_delta}%`],
      ['Summary', trend.summary],
      ['Investment Thesis', trend.investment_thesis || ''],
      ['Product Opportunity', trend.product_opportunity || ''],
      ['Risk Assessment', trend.risk_assessment || ''],
      ['Sources', trend.source_citations.join(' | ')],
      ['First Seen', trend.first_seen_at],
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trendsense-${trend.title.replace(/\s+/g, '-').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Trend data exported to CSV', 'success');
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={`Trend intelligence: ${trend.title}`}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/60 backdrop-blur-sm pointer-events-auto"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-surface-raised border-l border-border/30 shadow-2xl pointer-events-auto flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/20 bg-surface-raised/90 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                aria-label="Close trend detail"
                className="p-2 -ml-2 text-text-muted hover:text-text-primary hover:bg-surface transition-colors rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <X size={18} strokeWidth={2} />
              </button>
              <span className="text-xs font-black uppercase tracking-widest text-text-muted/40">Trend Intelligence</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleSave}
                aria-label={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
                aria-pressed={isSaved}
                className={cn(
                  "p-2.5 rounded-xl transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  isSaved 
                    ? "bg-accent/10 border-accent/20 text-accent" 
                    : "text-text-muted hover:text-text-primary hover:bg-surface border-transparent"
                )}
              >
                <Bookmark size={17} fill={isSaved ? 'currentColor' : 'none'} strokeWidth={2} />
              </button>
              <button
                onClick={handleShare}
                aria-label="Copy trend link to clipboard"
                className="p-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface border border-transparent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Share2 size={17} strokeWidth={2} />
              </button>
              <button
                onClick={handleExportCSV}
                aria-label="Export trend data as CSV"
                className="p-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface border border-transparent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Download size={17} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto space-y-0 pb-24">
            
            {/* Hero: Title + Score + Sparkline */}
            <section className="p-6 pb-0 space-y-4">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      trend.stage?.toLowerCase() === 'emerging' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                      trend.stage?.toLowerCase() === 'rising' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                      trend.stage?.toLowerCase() === 'mainstream' ? 'text-purple-400 bg-purple-400/10 border-purple-400/20' :
                      'text-orange-400 bg-orange-400/10 border-orange-400/20'
                    )}>
                      {trend.stage}
                    </span>
                    <Badge variant="outline" size="sm" className="opacity-50">{trend.domain}</Badge>
                  </div>
                  <h1 className="text-3xl font-black tracking-tighter leading-tight text-text-primary">
                    {trend.title}
                  </h1>
                </div>
                <div className="shrink-0">
                  <TVSDisplay score={trend.velocity_score} delta={trend.tvs_delta} size="lg" />
                  <div className="flex items-center gap-1 mt-2 justify-center group relative cursor-help">
                    <HelpCircle size={10} className="text-text-muted/30" />
                    <span className="text-[9px] text-text-muted/30 font-bold uppercase tracking-wider">TVS</span>
                    <div
                      role="tooltip"
                      className="absolute bottom-5 right-0 w-56 p-3 rounded-2xl bg-surface-overlay border border-border/50 text-[10px] text-text-secondary leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-2xl pointer-events-none"
                    >
                      <strong className="text-text-primary block mb-1">Trend Velocity Score</strong>
                      Composite score (0–100) measuring signal frequency, source diversity, and momentum acceleration across monitored channels.
                    </div>
                  </div>
                </div>
              </div>

              {/* Momentum Chart */}
              <div className="rounded-2xl bg-surface/40 border border-border/10 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={13} className="text-text-muted/40" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted/40">Momentum</span>
                  </div>
                  <div className="flex items-center gap-1 bg-surface rounded-xl p-0.5 border border-border/20">
                    {(['7d','30d','90d'] as Period[]).map(p => (
                      <button
                        key={p}
                        onClick={() => setActivePeriod(p)}
                        aria-pressed={activePeriod === p}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                          activePeriod === p 
                            ? "bg-surface-overlay text-text-primary shadow" 
                            : "text-text-muted/40 hover:text-text-secondary"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <motion.svg
                  key={activePeriod}
                  viewBox="0 0 520 80"
                  className="w-full h-16"
                  aria-label={`Trend momentum over ${activePeriod}, ${isPositive ? 'rising' : 'declining'}`}
                  role="img"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <defs>
                    <linearGradient id={`grad-${isPositive}`} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={buildPath(sparkData, 520, 80)} fill={`url(#grad-${isPositive})`} />
                  <path
                    d={(() => {
                      const maxVal = Math.max(...sparkData);
                      const minVal = Math.min(...sparkData);
                      const range = maxVal - minVal || 1;
                      return sparkData.map((v, i) => {
                        const x = (i / (sparkData.length - 1)) * 520;
                        const y = 80 - ((v - minVal) / range) * 72 - 4;
                        if (i === 0) return `M ${x} ${y}`;
                        const prev = { x: ((i-1)/(sparkData.length-1))*520, y: 80-((sparkData[i-1]-minVal)/range)*72-4 };
                        const cp1x = prev.x + (x - prev.x) / 2;
                        return `C ${cp1x} ${prev.y}, ${cp1x} ${y}, ${x} ${y}`;
                      }).join(' ');
                    })()}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </div>
            </section>

            {/* Tabs */}
            <div className="px-6 pt-5">
              <div
                role="tablist"
                aria-label="Trend analysis sections"
                className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-surface/30 rounded-2xl p-1 border border-border/10"
              >
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`tab-panel-${tab.id}`}
                    id={`tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex-1 justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      activeTab === tab.id
                        ? "bg-surface-overlay text-text-primary shadow border border-border/20"
                        : "text-text-muted/50 hover:text-text-secondary"
                    )}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Panels */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                id={`tab-panel-${activeTab}`}
                role="tabpanel"
                aria-labelledby={`tab-${activeTab}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="px-6 pt-5 pb-4"
              >
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <p className="text-base text-text-secondary leading-relaxed font-medium italic border-l-2 border-accent/30 pl-5 py-1">
                      "{trend.summary}"
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Domain', value: trend.domain },
                        { label: 'Stage', value: trend.stage },
                        { label: 'TVS Score', value: String(trend.velocity_score) },
                        { label: 'Momentum', value: `${isPositive ? '+' : ''}${trend.tvs_delta}%`, positive: isPositive },
                      ].map(item => (
                        <div key={item.label} className="p-4 rounded-2xl bg-surface/30 border border-border/10">
                          <div className="text-[9px] text-text-muted/40 font-black uppercase tracking-widest mb-1">{item.label}</div>
                          <div className={cn(
                            "text-sm font-black",
                            item.positive === true ? "text-emerald-400" : item.positive === false ? "text-red-400" : "text-text-primary"
                          )}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'investment' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-accent/60">
                      <Target size={16} />
                      <h3 className="font-black text-xs uppercase tracking-widest">Investment Thesis</h3>
                    </div>
                    <div className="p-5 rounded-2xl bg-surface/30 border border-border/10">
                      <p className="text-base text-text-secondary leading-relaxed">
                        {trend.investment_thesis || "Intelligence analysts are currently finalizing the strategic thesis for this signal. Check back shortly for updated analysis."}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'opportunity' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-500/70">
                      <TrendingUp size={16} />
                      <h3 className="font-black text-xs uppercase tracking-widest">Product Opportunity</h3>
                    </div>
                    <div className="p-5 rounded-2xl bg-surface/30 border border-border/10">
                      <p className="text-base text-text-secondary leading-relaxed">
                        {trend.product_opportunity || "High-impact product applications are being mapped across relevant technology stacks."}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'risk' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-red-400/70">
                      <AlertTriangle size={16} />
                      <h3 className="font-black text-xs uppercase tracking-widest">Risk Assessment</h3>
                    </div>
                    <div className="p-5 rounded-2xl bg-surface/30 border border-red-500/10">
                      <p className="text-base text-text-secondary leading-relaxed">
                        {trend.risk_assessment || "Standard market risks apply. Detailed intelligence on specific barriers is pending analyst review."}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'sources' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-text-muted/40">
                      <Info size={14} />
                      <h3 className="font-black text-[10px] uppercase tracking-widest">Intelligence Sources</h3>
                      <span className="text-[9px] text-text-muted/30">({trend.source_citations.length})</span>
                    </div>
                    {trend.source_citations.length === 0 ? (
                      <p className="text-sm text-text-muted/40 py-4 text-center">No sources indexed for this signal yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {trend.source_citations.map((source, i) => {
                          let domain = source;
                          try { domain = new URL(source).hostname.replace(/^www\./, ''); } catch {}
                          return (
                            <a
                              key={i}
                              href={source}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface/50 hover:bg-surface border border-border/10 hover:border-accent/20 text-sm text-text-secondary hover:text-text-primary transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-5 h-5 rounded-lg bg-surface-overlay border border-border/20 flex items-center justify-center shrink-0">
                                  <span className="text-[9px] font-black text-text-muted/60">{i+1}</span>
                                </div>
                                <span className="truncate font-medium text-sm">{domain}</span>
                              </div>
                              <ExternalLink size={13} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2 text-accent" />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-border/20 bg-surface/50 backdrop-blur-md flex gap-3">
            <button
              onClick={handleSave}
              className={cn(
                "flex-1 font-bold py-3 rounded-xl transition-all active:scale-95 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                isSaved
                  ? "bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20"
                  : "bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20"
              )}
            >
              {isSaved ? 'Saved to Watchlist ✓' : 'Save to Watchlist'}
            </button>
            <button
              onClick={handleExportCSV}
              aria-label="Export trend data as CSV"
              className="px-5 py-3 bg-surface-overlay hover:bg-surface-raised border border-border/30 text-text-secondary hover:text-text-primary font-bold rounded-xl transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Download size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
