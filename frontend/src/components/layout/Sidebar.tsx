import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Clock,
  Bookmark,
  History,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTrendStore } from '../../store/useTrendStore';
import { useThemeStore } from '../../store/useThemeStore';

const SidebarItem = ({ 
  to, 
  icon: Icon, 
  label 
}: { 
  to: string; 
  icon: any; 
  label: string 
}) => (
  <NavLink
    to={to}
    aria-label={label}
    className={({ isActive }) => cn(
      "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      isActive 
        ? "text-accent bg-accent/10 border border-accent/20" 
        : "text-text-muted/40 hover:text-text-primary hover:bg-surface-raised border border-transparent"
    )}
  >
    {({ isActive }) => (
      <>
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="group-hover:scale-110 transition-transform duration-300" />
        
        {/* Tooltip */}
        <div
          role="tooltip"
          className="absolute left-14 px-3 py-2 rounded-xl bg-surface-overlay border border-border/50 text-[10px] font-black uppercase tracking-widest text-text-primary opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-2xl pointer-events-none"
        >
          {label}
        </div>

        {/* Active indicator */}
        {isActive && (
          <motion.div 
            layoutId="sidebar-active"
            className="absolute -left-4 w-1 h-6 bg-accent rounded-r-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
          />
        )}
      </>
    )}
  </NavLink>
);

export const Sidebar: React.FC = () => {
  const { recentlyViewed, setSelectedTrend } = useTrendStore();
  const { theme, setTheme } = useThemeStore();

  const themeOptions: Array<{ value: 'light' | 'dark' | 'system'; icon: React.ElementType; label: string }> = [
    { value: 'light',  icon: Sun,     label: 'Light mode'  },
    { value: 'dark',   icon: Moon,    label: 'Dark mode'   },
    { value: 'system', icon: Monitor, label: 'System theme' },
  ];
  const currentIdx = themeOptions.findIndex(o => o.value === theme);
  const next = themeOptions[(currentIdx + 1) % themeOptions.length];
  const ThemeIcon = themeOptions[currentIdx]?.icon ?? Monitor;

  return (
    <aside className="w-20 h-screen sticky top-0 bg-background border-r border-border/10 flex flex-col items-center py-8 z-50">
      <nav className="flex-1 w-full flex flex-col items-center gap-1">
        <SidebarItem to="/" icon={LayoutDashboard} label="Signals" />
        <SidebarItem to="/chat" icon={MessageSquare} label="Shruti" />
        <SidebarItem to="/brief" icon={Calendar} label="Daily Brief" />
        <SidebarItem to="/timeline" icon={Clock} label="Timeline" />
        <SidebarItem to="/saved" icon={Bookmark} label="Watchlist" />
        
        {recentlyViewed.length > 0 && (
          <div className="mt-2 flex flex-col items-center gap-1">
            <div className="h-px w-8 bg-border/10" />
            <div className="group relative">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl text-text-muted/20 hover:text-text-primary transition-colors cursor-default">
                <History size={20} />
              </div>
              
              {/* Recently Viewed Dropdown */}
              <div className="absolute left-14 top-0 w-64 p-4 rounded-3xl bg-surface-overlay border border-border/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] shadow-2xl space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted/40 px-2">Recently Viewed</h4>
                <div className="space-y-1">
                  {recentlyViewed.map(trend => (
                    <button
                      key={trend.id}
                      onClick={() => setSelectedTrend(trend)}
                      className="w-full text-left p-3 rounded-xl hover:bg-surface transition-all group/item"
                    >
                      <div className="text-xs font-black text-text-secondary group-hover/item:text-accent truncate">{trend.title}</div>
                      <div className="text-[9px] font-bold text-text-muted/40 uppercase tracking-tight">{trend.domain}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        {/* Theme toggle */}
        <button
          aria-label={`Switch to ${next.label}`}
          onClick={() => setTheme(next.value)}
          className="w-12 h-12 flex items-center justify-center rounded-2xl text-text-muted/40 hover:text-text-primary hover:bg-surface-raised transition-all group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ThemeIcon size={20} strokeWidth={2} />
          <div
            role="tooltip"
            className="absolute left-14 px-3 py-2 rounded-xl bg-surface-overlay border border-border/50 text-[10px] font-black uppercase tracking-widest text-text-primary opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-2xl pointer-events-none"
          >
            {themeOptions[currentIdx]?.label} → {next.label}
          </div>
        </button>
      </div>
    </aside>
  );
};
