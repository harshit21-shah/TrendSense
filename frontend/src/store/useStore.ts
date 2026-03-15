import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage, Trend } from '../types'

interface AppState {
  // Filters
  activeDomain: string
  activeStage: string
  dateRange: string
  searchQuery: string
  setActiveDomain: (d: string) => void
  setActiveStage: (s: string) => void
  setDateRange: (r: string) => void
  setSearchQuery: (q: string) => void

  // Bookmarks
  bookmarks: Trend[]
  addBookmark: (t: Trend) => void
  removeBookmark: (id: string | number) => void
  isBookmarked: (id: string | number) => boolean

  // Chat
  chatMessages: ChatMessage[]
  sessionId: string
  addMessage: (m: ChatMessage) => void
  updateLastMessage: (content: string) => void
  clearChat: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeDomain: 'All',
      activeStage: 'All',
      dateRange: '7d',
      searchQuery: '',
      setActiveDomain: (d) => set({ activeDomain: d }),
      setActiveStage: (s) => set({ activeStage: s }),
      setDateRange: (r) => set({ dateRange: r }),
      setSearchQuery: (q) => set({ searchQuery: q }),

      bookmarks: [],
      addBookmark: (t) => set((s) => ({ bookmarks: [...s.bookmarks, t] })),
      removeBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),
      isBookmarked: (id) => get().bookmarks.some((b) => b.id === id),

      chatMessages: [],
      sessionId: crypto.randomUUID(),
      addMessage: (m) => set((s) => ({ chatMessages: [...s.chatMessages, m] })),
      updateLastMessage: (content) =>
        set((s) => {
          const msgs = [...s.chatMessages]
          if (msgs.length > 0) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content }
          return { chatMessages: msgs }
        }),
      clearChat: () => set({ chatMessages: [], sessionId: crypto.randomUUID() }),
    }),
    { name: 'trendsense-store', partialize: (s) => ({ bookmarks: s.bookmarks }) }
  )
)
