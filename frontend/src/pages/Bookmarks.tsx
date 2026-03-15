import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Trash2, BookmarkX } from 'lucide-react'
import { TrendCard } from '../components/TrendCard'
import { useStore } from '../store/useStore'

export function Bookmarks() {
  const { bookmarks, removeBookmark } = useStore()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Saved Trends</h1>
          <p className="text-slate-600 text-sm">
            {bookmarks.length > 0
              ? `${bookmarks.length} trend${bookmarks.length !== 1 ? 's' : ''} saved`
              : 'Your bookmarked trends appear here'}
          </p>
        </div>
        {bookmarks.length > 0 && (
          <button onClick={() => bookmarks.forEach(b => removeBookmark(b.id))}
            className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <Trash2 size={12} /> Clear all
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-24 rounded-2xl" style={{ border: '1px dashed rgba(255,255,255,0.06)' }}>
          <BookmarkX size={44} style={{ color: '#1e293b' }} className="mx-auto mb-4" />
          <p className="text-slate-600 font-medium mb-1">No saved trends yet</p>
          <p className="text-slate-700 text-sm">Click the bookmark icon on any trend card to save it here</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {bookmarks.map((trend, i) => (
              <motion.div key={trend.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}>
                <TrendCard trend={trend} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
