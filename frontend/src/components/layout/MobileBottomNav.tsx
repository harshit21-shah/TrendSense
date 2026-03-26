import React, { useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Calendar, Clock, Bookmark } from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { to: '/',         icon: LayoutDashboard, label: 'Signals',  ariaLabel: 'Navigate to Signals page'  },
  { to: '/chat',     icon: MessageSquare,   label: 'Shruti AI Analyst',   ariaLabel: 'Chat with Shruti'          },
  { to: '/brief',    icon: Calendar,        label: 'Brief',    ariaLabel: 'Navigate to Daily Brief page' },
  { to: '/timeline', icon: Clock,           label: 'Timeline', ariaLabel: 'Navigate to Timeline page' },
  { to: '/saved',    icon: Bookmark,        label: 'Saved',    ariaLabel: 'Navigate to Saved page'    },
];

export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Arrow key navigation between tabs
  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = e.key === 'ArrowRight'
        ? (currentIndex + 1) % navItems.length
        : (currentIndex - 1 + navItems.length) % navItems.length;
      navigate(navItems[next].to);
      // Focus the next nav item
      const navEl = document.querySelectorAll('[data-bottom-nav-item]')[next] as HTMLElement;
      navEl?.focus();
    }
    if (e.key === 'Home') { e.preventDefault(); navigate(navItems[0].to); }
    if (e.key === 'End')  { e.preventDefault(); navigate(navItems[navItems.length - 1].to); }
  }, [navigate]);

  // Tap active tab → scroll to top
  const handleActiveTabClick = useCallback((isActive: boolean) => {
    if (isActive) {
      const main = document.getElementById('main-content');
      main?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[80] bg-surface-raised/98 backdrop-blur-xl border-t border-border/50 shadow-[0_-2px_12px_rgba(0,0,0,0.12)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-1 h-16">
        {navItems.map(({ to, icon: Icon, label, ariaLabel }, index) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              data-bottom-nav-item
              aria-label={ariaLabel}
              aria-current={isActive ? 'page' : undefined}
              tabIndex={0}
              onClick={() => handleActiveTabClick(isActive)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl',
                'min-w-[56px] min-h-[52px] justify-center relative',
                'transition-all duration-200 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised',
                'active:scale-95',
                isActive ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
              )}
            >
              {/* Active top indicator bar */}
              <span
                className={cn(
                  'absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all duration-200 ease-out',
                  isActive ? 'w-8 bg-accent opacity-100 shadow-[0_2px_8px_rgba(99,102,241,0.3)]' : 'w-0 opacity-0'
                )}
                aria-hidden="true"
              />

              {/* Icon with subtle active background */}
              <span
                className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200',
                  isActive ? 'bg-accent/10' : 'bg-transparent'
                )}
                aria-hidden="true"
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="transition-all duration-200"
                />
              </span>

              {/* Label */}
              <span
                className={cn(
                  'text-[12px] font-semibold leading-none tracking-wide transition-colors duration-200',
                  isActive ? 'text-accent' : 'text-text-muted'
                )}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
