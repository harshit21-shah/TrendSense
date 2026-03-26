import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Trend, type ChatMessage } from '../types';

interface TrendState {
  selectedTrend: Trend | null;
  setSelectedTrend: (trend: Trend | null) => void;
  savedTrends: Trend[];
  saveTrend: (trend: Trend) => void;
  unsaveTrend: (trendId: number) => void;
  recentlyViewed: Trend[];
  addRecentlyViewed: (trend: Trend) => void;
  chatHistory: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  updateChatMessage: (id: string, content: string) => void;
  clearChatHistory: () => void;
}

export const useTrendStore = create<TrendState>()(
  persist(
    (set) => ({
      selectedTrend: null,
      setSelectedTrend: (trend) => set({ selectedTrend: trend }),
      savedTrends: [],
      saveTrend: (trend) => set((state) => ({ 
        savedTrends: [...state.savedTrends.filter(t => t.id !== trend.id), trend] 
      })),
      unsaveTrend: (trendId) => set((state) => ({ 
        savedTrends: state.savedTrends.filter(t => t.id !== trendId) 
      })),
      recentlyViewed: [],
      addRecentlyViewed: (trend) => set((state) => ({
        recentlyViewed: [trend, ...state.recentlyViewed.filter(t => t.id !== trend.id)].slice(0, 5)
      })),
      chatHistory: [],
      addChatMessage: (message) => set((state) => ({ 
        chatHistory: [...state.chatHistory, message] 
      })),
      updateChatMessage: (id, content) => set((state) => ({
        chatHistory: state.chatHistory.map((m) => 
          m.id === id ? { ...m, content: m.content + content } : m
        )
      })),
      clearChatHistory: () => set({ chatHistory: [] }),
    }),
    {
      name: 'trend-storage',
      partialize: (state) => ({ 
        savedTrends: state.savedTrends,
        recentlyViewed: state.recentlyViewed,
        chatHistory: state.chatHistory 
      }),
    }
  )
);
