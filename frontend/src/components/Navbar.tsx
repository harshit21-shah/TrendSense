import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Search, RefreshCw, Zap, LayoutDashboard, Clock, FileText, MessageSquare, Bookmark, Activity } from 'lucide-react'
import { clsx } from 'clsx'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { triggerPipeline } from '../lib/api'
import { useStore } from '../store/useStore'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/timeline', label: 'Timeline', icon: Clock },
  { to: '/brief', label: 'Brief', icon: FileText },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/bookmarks', label: 'Saved', icon: Bookmark },
]

export function Navbar() {
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()
  const { setSearchQuery, bookmarks } = useStore()
  const qc = useQueryClient()

  const { mutate: runPipeline, isPending } = useMutation({
    mutationFn: triggerPipeline,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trends'] })
      setTimeout(() => qc.invalidateQueries({ queryKey: ['trends'] }), 5000)
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = search.trim()
    setSearchQuery(q)
    navigate('/')
    if (!q) setSearchOpen(false)
  }

  const handleSearchBlur = () => {
    // Delay so form submit fires before blur clears state
    setTimeout(() => {
      if (!search.trim()) setSearchOpen(false)
    }, 150)
  }

  const handleSearchClear = () => {
    setSearch('')
    setSearchQuery('')
    setSearchOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06]" style={{ background: 'rgba(5,7,13,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 shrink-0 mr-1">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">TrendSense</span>
        </NavLink>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-0.5 flex-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => clsx(
                'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute inset-0 rounded-lg" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }} />}
                  <Icon size={13} className={isActive ? 'text-indigo-400' : ''} />
                  <span className="relative">{label}</span>
                  {label === 'Saved' && bookmarks.length > 0 && (
                    <span className="relative ml-0.5 bg-indigo-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {bookmarks.length}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className={clsx('transition-all duration-300', searchOpen ? 'flex-1 max-w-sm' : 'w-auto')}>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => !search && setSearchOpen(false)}
              placeholder="Search trends..."
              className="w-full rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            />
          </div>
        </form>

        {/* Pipeline status + button */}
        <div className="flex items-center gap-2 shrink-0">
          {isPending && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-indigo-400">
              <Activity size={12} className="animate-pulse" />
              <span>Analyzing...</span>
            </div>
          )}
          <button
            onClick={() => runPipeline()}
            disabled={isPending}
            className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
          >
            <RefreshCw size={12} className={isPending ? 'animate-spin' : ''} />
            <span className="hidden sm:block">{isPending ? 'Running...' : 'Run Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex border-t border-white/[0.04]">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => clsx(
              'flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium flex-1 transition-colors',
              isActive ? 'text-indigo-400' : 'text-slate-600'
            )}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
