import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Trash2 } from 'lucide-react'
import { TrendCard } from '../components/TrendCard'
import { useStore } from '../store/useStore'

export function Bookmarks() {
  const { bookmarks, removeBookmark } = useStore()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Saved Trends</h1>
          <p className="text-slate-500 text-sm">{bookmarks.length} bookmarked trend{bookmarks.length !== 1 ? 's' : ''}</p>
        </div>
        {bookmarks.length > 0 && (
          <button
            onClick={() => bookmarks.forEach((b) => removeBookmark(b.id))}
            className="flex items-center gap-1.5 text-slate-600 hover:text-red-400 text-xs transition-colors"
          >
            <Trash2 size={13} /> Clear all
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/[0.06] rounded-2xl">
          <Bookmark size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-600 mb-1">No saved trends yet.</p>
          <p className="text-slate-700 text-sm">Bookmark trends from the dashboard to save them here.</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {bookmarks.map((trend) => (
              <TrendCard key={trend.id} trend={trend} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
