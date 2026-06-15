import { NavLink, useLocation } from 'react-router-dom';
import { BarChart2, FileText, MessageSquare, Bookmark, Radio } from 'lucide-react';
import { TrendSenseLogo } from '../ui/TrendSenseLogo';
import { cn } from '../../lib/cn';
import { useHealth } from '../../hooks/useHealth';
import { useWatchlistStore } from '../../store/useWatchlistStore';

const NAV_ITEMS = [
  { to: '/', icon: BarChart2, label: 'Trends', exact: true },
  { to: '/brief', icon: FileText, label: 'Brief', exact: false },
  { to: '/chat', icon: MessageSquare, label: 'Ava', exact: false },
  { to: '/watchlist', icon: Bookmark, label: 'Watchlist', exact: false },
  { to: '/sources', icon: Radio, label: 'Sources', exact: false },
];

export function Sidebar() {
  const { data: health } = useHealth();
  const { watchlistIds } = useWatchlistStore();
  const location = useLocation();

  const isOk = health?.status === 'ok';
  const isDegraded = health?.status === 'degraded';

  return (
    <nav className="flex flex-col w-48 h-full bg-zinc-950 border-r border-zinc-800/40 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 h-[52px] px-3.5 border-b border-zinc-800/40 shrink-0">
        <TrendSenseLogo size={26} />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-zinc-100 tracking-tight leading-none">TrendSense</p>
          <p className="text-[10px] text-zinc-700 leading-none mt-1 tracking-wide font-medium uppercase">
            Signal Desk
          </p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 px-1.5 pt-2 pb-1 space-y-px overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => {
          const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={cn(
                'group flex items-center gap-2.5 h-8 px-2.5 rounded-md text-[13px] transition-colors',
                isActive
                  ? 'bg-zinc-800/80 text-zinc-100 font-medium'
                  : 'text-zinc-600 hover:text-zinc-200 hover:bg-zinc-900/80',
              )}
            >
              <Icon
                className={cn(
                  'h-3.5 w-3.5 shrink-0 transition-colors',
                  isActive ? 'text-violet-400' : 'text-zinc-700 group-hover:text-zinc-400',
                )}
              />
              <span className="flex-1">{label}</span>
              {label === 'Watchlist' && watchlistIds.length > 0 && (
                <span className="text-[10px] bg-zinc-800 text-zinc-400 rounded-full min-w-[18px] h-[18px] flex items-center justify-center tabular-nums font-medium px-1">
                  {watchlistIds.length > 99 ? '99+' : watchlistIds.length}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* System health */}
      <div className="px-3.5 pb-3 pt-2 border-t border-zinc-800/40">
        <div className="flex items-center gap-2 text-[11px]">
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full shrink-0',
              isOk
                ? 'bg-emerald-500'
                : isDegraded
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-zinc-700',
            )}
          />
          <span className={cn('truncate', isOk ? 'text-zinc-600' : isDegraded ? 'text-amber-600' : 'text-zinc-700')}>
            {isOk
              ? 'All systems normal'
              : isDegraded
                ? 'System degraded'
                : health === undefined
                  ? 'Connecting…'
                  : 'Backend offline'}
          </span>
        </div>
      </div>
    </nav>
  );
}
