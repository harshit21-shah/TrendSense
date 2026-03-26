import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global navigation shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case '1': e.preventDefault(); navigate('/'); break;
          case '2': e.preventDefault(); navigate('/chat'); break;
          case '3': e.preventDefault(); navigate('/brief'); break;
          case '4': e.preventDefault(); navigate('/timeline'); break;
          case '5': e.preventDefault(); navigate('/saved'); break;
        }
      }
      // Quick Search shortcut
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('focus-search'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-accent/30 selection:text-text-primary overflow-x-hidden">
      {/* Skip to main content — accessibility */}
      <a href="#main-content" className="skip-nav">Skip to main content</a>

      {/* Sidebar — Desktop only */}
      <div className="hidden lg:block" role="navigation" aria-label="Primary navigation">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main
          id="main-content"
          role="main"
          className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth min-h-0"
          tabIndex={-1}
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-5 md:py-6 w-full pb-24 lg:pb-12 h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation — replaces floating hamburger */}
      <MobileBottomNav />

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full opacity-50 animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-success/5 blur-[100px] rounded-full opacity-40 animate-pulse-slow" />
      </div>
    </div>
  );
};

export default Layout;
