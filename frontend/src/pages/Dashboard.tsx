import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  SlidersHorizontal, 
  RefreshCw, 
  X, 
  BarChart3, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { getTrends, getDomains, getStages } from '../api';
import { TrendRow } from '../components/trends/TrendRow';
import { TrendDrawer } from '../components/trends/TrendDrawer';
import { TrendRowSkeleton, DashboardFiltersSkeleton } from '../components/ui/SkeletonLoader';
import { AdvancedFilters, type FilterState } from '../components/ui/AdvancedFilters';
import { useTrendStore } from '../store/useTrendStore';
import { useToastStore } from '../store/useToastStore';
import { useAutoSync } from '../hooks/useAutoSync';
import { cn } from '../utils/cn';

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedTrend, setSelectedTrend } = useTrendStore();
  const { addToast } = useToastStore();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    tvsRange: [0, 100],
    dateRange: null,
    momentumRange: [-100, 100],
    stages: [],
    domains: [],
  });

  // Initialize auto-sync
  const { 
    stats: syncStats, 
    manualSync, 
    minutesUntilSync,
    secondsUntilSync 
  } = useAutoSync({
    interval: 30 * 60 * 1000, // 30 minutes
    enableNotifications: true,
  });

  const activeDomains = useMemo(() => 
    searchParams.get('domains')?.split(',').filter(Boolean) || [], 
  [searchParams]);

  const activeStages = useMemo(() => 
    searchParams.get('stages')?.split(',').filter(Boolean) || [], 
  [searchParams]);

  const { data: trends, isLoading, isError, refetch } = useQuery({
    queryKey: ['trends', activeDomains, activeStages],
    queryFn: () => getTrends(
      activeDomains.length > 0 ? activeDomains : undefined, 
      activeStages.length > 0 ? activeStages : undefined
    ),
  });

  const { data: domains, isLoading: domainsLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: getDomains,
  });

  const { data: stages, isLoading: stagesLoading } = useQuery({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  const updateFilters = (key: 'domains' | 'stages', value: string) => {
    const current = key === 'domains' ? activeDomains : activeStages;
    let newValues: string[];
    
    if (current.includes(value)) {
      newValues = current.filter(v => v !== value);
    } else {
      newValues = [...current, value];
    }

    const newParams = new URLSearchParams(searchParams);
    if (newValues.length > 0) {
      newParams.set(key, newValues.join(','));
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleRefresh = async () => {
    setIsSyncing(true);
    try {
      await manualSync();
    } catch (e) {
      addToast('Failed to sync pipeline', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Format time until next sync
  const formatTimeUntilSync = () => {
    if (minutesUntilSync > 0) {
      return `${minutesUntilSync}m`;
    }
    return `${secondsUntilSync}s`;
  };

  return (
    <div className="space-y-2.5 pb-24">
      {/* Dashboard Header */}
      <header className="flex items-center justify-between py-1.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-accent font-mono text-[10px] font-bold uppercase tracking-[0.15em]">
            <RefreshCw size={9} strokeWidth={3} className="animate-spin-slow" />
            <span>Live Feed</span>
          </div>
          <span className="text-border/40">·</span>
          <h1 className="text-h3 font-extrabold tracking-tight text-text-primary">
            Market Signals
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Signal count */}
          <span className="hidden sm:flex items-center gap-1 text-sm font-bold text-text-muted">
            <BarChart3 size={12} strokeWidth={2.5} />
            {isLoading ? '—' : `${trends?.length ?? 0}`}
          </span>

          <button
            onClick={handleRefresh}
            disabled={isSyncing || syncStats.isSyncing}
            title="Sync intelligence pipeline"
            className={cn(
              "flex items-center gap-1.5 px-3 h-9 rounded-btn border border-border/50 transition-all duration-150 text-[11px] font-bold uppercase tracking-wider active:scale-95",
              isSyncing || syncStats.isSyncing
                ? "bg-surface-raised text-text-muted cursor-not-allowed opacity-50"
                : "bg-surface-raised text-text-secondary hover:bg-surface-overlay hover:border-accent/40 hover:text-text-primary"
            )}
          >
            {isSyncing || syncStats.isSyncing ? (
              <>
                <Loader2 size={11} strokeWidth={2.5} className="animate-spin text-accent" />
                <span className="hidden sm:inline">Syncing...</span>
              </>
            ) : (
              <>
                <RefreshCw size={11} strokeWidth={2.5} />
                <span className="hidden sm:inline">Sync</span>
                {syncStats.nextSyncTime && (
                  <span className="hidden md:inline text-[10px] text-text-muted ml-1">
                    {formatTimeUntilSync()}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </header>

      {/* Sticky Filters */}
      {domainsLoading || stagesLoading ? (
        <DashboardFiltersSkeleton />
      ) : (
        <div className="sticky top-14 bg-background/98 backdrop-blur-md z-30 py-2.5 border-b border-border/10">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Domains Filter */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => { const p = new URLSearchParams(searchParams); p.delete('domains'); setSearchParams(p); }}
                className={cn(
                  "filter-pill",
                  activeDomains.length === 0 ? "filter-pill-active" : "filter-pill-inactive"
                )}
              >
                All Domains
              </button>
              {domains?.map(domain => (
                <button
                  key={domain.name}
                  onClick={() => updateFilters('domains', domain.name)}
                  className={cn(
                    "filter-pill",
                    activeDomains.includes(domain.name) ? "filter-pill-active" : "filter-pill-inactive"
                  )}
                >
                  {domain.name}
                  <span className="opacity-40 font-mono text-[10px]">({domain.count})</span>
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-border/20 hidden sm:block" />

            {/* Stages Filter */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {stages?.map(stage => (
                <button
                  key={stage.name}
                  onClick={() => updateFilters('stages', stage.name)}
                  className={cn(
                    "filter-pill",
                    activeStages.includes(stage.name) ? "filter-pill-active" : "filter-pill-inactive"
                  )}
                >
                  {stage.name}
                  <span className="opacity-40 font-mono text-[10px]">({stage.count})</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {(activeDomains.length > 0 || activeStages.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 h-10 text-[11px] font-bold uppercase tracking-wider text-danger hover:bg-danger/5 rounded-btn transition-all duration-200 border border-transparent hover:border-danger/20 active:scale-95"
                >
                  <X size={11} strokeWidth={3} />
                  <span>Clear</span>
                </button>
              )}
              <button
                onClick={() => setShowAdvancedFilters(true)}
                className="filter-pill filter-pill-inactive"
              >
                <SlidersHorizontal size={12} strokeWidth={2.5} />
                <span>Advanced</span>
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          <AnimatePresence>
            {(activeDomains.length > 0 || activeStages.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-wrap gap-1.5 pt-2"
              >
                {activeDomains.map(d => (
                  <div key={d} className="flex items-center gap-1.5 px-2.5 py-1 rounded-badge bg-accent/5 border border-accent/20 text-[10px] font-bold uppercase tracking-wider text-accent">
                    {d}
                    <button onClick={() => updateFilters('domains', d)} className="hover:text-text-primary transition-colors" aria-label={`Remove ${d} filter`}>
                      <X size={8} strokeWidth={3} />
                    </button>
                  </div>
                ))}
                {activeStages.map(s => (
                  <div key={s} className="flex items-center gap-1.5 px-2.5 py-1 rounded-badge bg-surface-raised border border-border/50 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    {s}
                    <button onClick={() => updateFilters('stages', s)} className="hover:text-text-primary transition-colors" aria-label={`Remove ${s} filter`}>
                      <X size={8} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Content Area */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => <TrendRowSkeleton key={i} index={i} />)}
          </div>
        ) : isError ? (
          <div className="p-16 text-center bg-surface-raised rounded-2xl border border-danger/20 space-y-5 shadow-xl">
            <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto text-danger">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-text-primary tracking-tight">Intelligence Feed Interrupted</h3>
              <p className="text-text-secondary max-w-md mx-auto text-sm">We encountered an error while retrieving market signals. This may be due to a temporary connection issue.</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-text-primary text-background rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-black/20"
            >
              Reconnect Pipeline
            </button>
          </div>
        ) : trends && trends.length > 0 ? (
          <div className="space-y-2.5">
            {trends.map((trend, index) => (
              <TrendRow 
                key={trend.id} 
                trend={trend} 
                index={index}
                onClick={setSelectedTrend}
              />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-surface-raised rounded-2xl border border-border/50 space-y-6 shadow-xl">
            <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto text-text-muted/20 border border-border/50">
              <Filter size={32} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-text-primary tracking-tight">No Matching Signals</h3>
              <p className="text-text-secondary/60 max-w-sm mx-auto text-sm">Your current filter configuration returned zero results. Try broadening your parameters.</p>
            </div>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-surface text-text-primary border border-border/50 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-surface-overlay transition-all"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Trend Detail Drawer */}
      <TrendDrawer 
        trend={selectedTrend} 
        onClose={() => setSelectedTrend(null)} 
      />

      {/* Advanced Filters Panel */}
      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        currentFilters={advancedFilters}
        onApply={(filters) => {
          setAdvancedFilters(filters);
          addToast('Advanced filters applied', 'success');
        }}
      />
    </div>
  );
};

export default Dashboard;
