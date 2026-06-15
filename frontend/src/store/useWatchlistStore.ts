import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchlistState {
  watchlistIds: number[];
  addToWatchlist: (id: number) => void;
  removeFromWatchlist: (id: number) => void;
  toggleWatchlist: (id: number) => void;
  isInWatchlist: (id: number) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlistIds: [],

      addToWatchlist: (id) =>
        set((s) => ({
          watchlistIds: s.watchlistIds.includes(id) ? s.watchlistIds : [...s.watchlistIds, id],
        })),

      removeFromWatchlist: (id) =>
        set((s) => ({ watchlistIds: s.watchlistIds.filter((w) => w !== id) })),

      toggleWatchlist: (id) =>
        set((s) => ({
          watchlistIds: s.watchlistIds.includes(id)
            ? s.watchlistIds.filter((w) => w !== id)
            : [...s.watchlistIds, id],
        })),

      isInWatchlist: (id) => get().watchlistIds.includes(id),
    }),
    { name: 'trendsense-watchlist' },
  ),
);
