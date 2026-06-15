import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

const MAX_TOASTS = 5;

// Timer registry — tracked outside Zustand to enable proper cleanup
const _toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

interface AppState {
  selectedTrendId: number | null;
  drawerOpen: boolean;
  notificationPanelOpen: boolean;
  searchOpen: boolean;
  toasts: Toast[];

  selectTrend: (id: number | null) => void;
  closeDrawer: () => void;
  setNotificationPanelOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedTrendId: null,
  drawerOpen: false,
  notificationPanelOpen: false,
  searchOpen: false,
  toasts: [],

  selectTrend: (id) => set({ selectedTrendId: id, drawerOpen: id != null }),
  closeDrawer: () => set({ drawerOpen: false, selectedTrendId: null }),

  setNotificationPanelOpen: (open) =>
    set((s) => ({ notificationPanelOpen: open, searchOpen: open ? false : s.searchOpen })),

  setSearchOpen: (open) =>
    set((s) => ({ searchOpen: open, notificationPanelOpen: open ? false : s.notificationPanelOpen })),

  addToast: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    set((s) => {
      const next = [...s.toasts, { ...toast, id }];

      // If we would exceed the cap, evict the oldest and clear their timers
      if (next.length > MAX_TOASTS) {
        const evicted = next.splice(0, next.length - MAX_TOASTS);
        for (const e of evicted) {
          const t = _toastTimers.get(e.id);
          if (t) { clearTimeout(t); _toastTimers.delete(e.id); }
        }
      }

      return { toasts: next };
    });

    // Schedule auto-dismiss
    const timer = setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      _toastTimers.delete(id);
    }, toast.duration ?? 4000);

    _toastTimers.set(id, timer);
  },

  dismissToast: (id) => {
    const t = _toastTimers.get(id);
    if (t) { clearTimeout(t); _toastTimers.delete(id); }
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
