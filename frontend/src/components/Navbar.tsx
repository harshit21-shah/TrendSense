import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Search, RefreshCw, Zap, LayoutDashboard, Clock, FileText, MessageSquare, Bookmark } from 'lucide-react'
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
  const navigate = useNavigate()
  const { setSearchQuery } = useStore()
  const qc = useQueryClient()

  const { mutate: runPipeline, isPending } = useMutation({
    mutationFn: triggerPipeline,
    onSuccess: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ['trends'] }), 2000)
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(search)
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#080b10]/90 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0 mr-2">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-tight hidden sm:block">TrendSense</span>
        </NavLink>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                )
              }
            >
              <Icon size={13} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xs ml-auto">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trends..."
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
            />
          </div>
        </form>

        {/* Run pipeline */}
        <button
          onClick={() => runPipeline()}
          disabled={isPending}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 shrink-0"
        >
          <RefreshCw size={12} className={isPending ? 'animate-spin' : ''} />
          <span className="hidden sm:block">{isPending ? 'Running...' : 'Run Pipeline'}</span>
        </button>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex border-t border-white/[0.04] overflow-x-auto">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-0.5 px-4 py-2 text-[10px] font-semibold whitespace-nowrap flex-1 transition-colors',
                isActive ? 'text-indigo-400 border-b border-indigo-500' : 'text-slate-600'
              )
            }
          >
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
