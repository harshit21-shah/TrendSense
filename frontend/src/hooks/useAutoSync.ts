/**
 * Auto-Sync Hook for TrendSense Intelligence Pipeline
 * Automatically syncs data every 30 minutes with smart retry logic
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '../store/useToastStore';

interface AutoSyncConfig {
  interval: number; // milliseconds
  retryAttempts: number;
  retryDelay: number;
  enableNotifications: boolean;
  pauseWhenHidden: boolean;
}

interface SyncStats {
  lastSyncTime: number | null;
  nextSyncTime: number | null;
  isSyncing: boolean;
  syncCount: number;
  failureCount: number;
  lastError: string | null;
}

const DEFAULT_CONFIG: AutoSyncConfig = {
  interval: 30 * 60 * 1000, // 30 minutes
  retryAttempts: 3,
  retryDelay: 5000, // 5 seconds
  enableNotifications: true,
  pauseWhenHidden: true,
};

export const useAutoSync = (config: Partial<AutoSyncConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  
  const [stats, setStats] = useState<SyncStats>({
    lastSyncTime: null,
    nextSyncTime: null,
    isSyncing: false,
    syncCount: 0,
    failureCount: 0,
    lastError: null,
  });

  const syncTimerRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);

  // Trigger pipeline sync
  const triggerPipelineSync = useCallback(async (attempt = 1): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/run-pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'running') {
        // Pipeline already running, consider it a success
        return true;
      }

      return data.status === 'started';
    } catch (error) {
      if (attempt < finalConfig.retryAttempts) {
        console.log(`⚠️ Sync retry ${attempt}/${finalConfig.retryAttempts}`);
        await new Promise(resolve => setTimeout(resolve, finalConfig.retryDelay));
        return triggerPipelineSync(attempt + 1);
      }
      throw error;
    }
  }, [finalConfig.retryAttempts, finalConfig.retryDelay]);

  // Main sync function
  const syncPipeline = useCallback(async (isManual = false) => {
    if (stats.isSyncing) {
      console.log('⏳ Sync already in progress, skipping...');
      return;
    }

    setStats(prev => ({ ...prev, isSyncing: true, lastError: null }));
    const syncStartTime = Date.now();

    try {
      console.log(`🔄 ${isManual ? 'Manual' : 'Auto'} sync triggered...`);

      // Trigger backend pipeline
      await triggerPipelineSync();

      // Wait a moment for pipeline to process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Invalidate queries to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: ['trends'] });
      await queryClient.invalidateQueries({ queryKey: ['domains'] });
      await queryClient.invalidateQueries({ queryKey: ['stages'] });

      const now = Date.now();
      setStats(prev => ({
        ...prev,
        lastSyncTime: now,
        nextSyncTime: now + finalConfig.interval,
        isSyncing: false,
        syncCount: prev.syncCount + 1,
        lastError: null,
      }));

      if (finalConfig.enableNotifications && isManual) {
        addToast('Intelligence pipeline synced successfully', 'success');
      }

      console.log(`✅ Sync complete (${Date.now() - syncStartTime}ms)`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Sync failed:', errorMessage);

      setStats(prev => ({
        ...prev,
        isSyncing: false,
        failureCount: prev.failureCount + 1,
        lastError: errorMessage,
      }));

      if (finalConfig.enableNotifications) {
        addToast('Failed to sync intelligence pipeline', 'error');
      }
    }
  }, [stats.isSyncing, finalConfig.interval, finalConfig.enableNotifications, queryClient, addToast, triggerPipelineSync]);

  // Start auto-sync timer
  const startAutoSync = useCallback(() => {
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current);
    }

    syncTimerRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        syncPipeline(false);
      }
    }, finalConfig.interval);

    console.log(`✅ Auto-sync enabled: Every ${finalConfig.interval / 60000} minutes`);
  }, [finalConfig.interval, syncPipeline]);

  // Stop auto-sync timer
  const stopAutoSync = useCallback(() => {
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current);
      syncTimerRef.current = null;
      console.log('⏹️ Auto-sync stopped');
    }
  }, []);

  // Pause auto-sync (keeps timer but skips execution)
  const pauseAutoSync = useCallback(() => {
    isPausedRef.current = true;
    console.log('⏸️ Auto-sync paused');
  }, []);

  // Resume auto-sync
  const resumeAutoSync = useCallback(() => {
    isPausedRef.current = false;
    console.log('▶️ Auto-sync resumed');
  }, []);

  // Manual sync trigger
  const manualSync = useCallback(() => {
    return syncPipeline(true);
  }, [syncPipeline]);

  // Initialize auto-sync on mount
  useEffect(() => {
    console.log('🚀 Initializing auto-sync pipeline...');

    // Initial sync
    syncPipeline(false);

    // Start recurring sync
    startAutoSync();

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (finalConfig.pauseWhenHidden) {
        if (document.hidden) {
          pauseAutoSync();
        } else {
          resumeAutoSync();
          // Sync when user returns if it's been a while
          if (stats.lastSyncTime && Date.now() - stats.lastSyncTime > finalConfig.interval) {
            syncPipeline(false);
          }
        }
      }
    };

    // Handle online/offline
    const handleOnline = () => {
      console.log('📡 Connection restored - syncing now');
      syncPipeline(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    // Cleanup
    return () => {
      stopAutoSync();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, []); // Only run once on mount

  // Calculate time until next sync
  const timeUntilNextSync = stats.nextSyncTime 
    ? Math.max(0, stats.nextSyncTime - Date.now())
    : 0;

  const minutesUntilSync = Math.floor(timeUntilNextSync / 60000);
  const secondsUntilSync = Math.floor((timeUntilNextSync % 60000) / 1000);

  return {
    stats,
    manualSync,
    pauseAutoSync,
    resumeAutoSync,
    stopAutoSync,
    timeUntilNextSync,
    minutesUntilSync,
    secondsUntilSync,
    isAutoSyncEnabled: syncTimerRef.current !== null,
  };
};
