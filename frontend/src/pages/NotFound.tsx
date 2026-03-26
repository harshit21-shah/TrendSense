import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-8 max-w-lg">
        <div className="relative">
          <div className="text-[120px] font-black text-text-primary/5 leading-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-surface-raised border border-border/50 flex items-center justify-center">
              <AlertTriangle size={48} className="text-text-muted/40" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tight text-text-primary">
            Page Not Found
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed">
            The intelligence signal you're looking for doesn't exist or has been moved to a different location.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface-raised border border-border/50 text-text-secondary hover:text-text-primary hover:border-accent/40 transition-all font-bold text-sm"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-white hover:bg-accent/90 transition-all font-bold text-sm shadow-lg shadow-accent/20"
          >
            <Home size={16} />
            Dashboard
          </button>
        </div>

        <div className="pt-8 border-t border-border/10">
          <p className="text-xs text-text-muted/40 font-bold uppercase tracking-widest mb-4">
            Quick Links
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {[
              { label: 'Signals', path: '/' },
              { label: 'Shruti', path: '/chat' },
              { label: 'Daily Brief', path: '/brief' },
              { label: 'Watchlist', path: '/saved' },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="px-4 py-2 rounded-xl bg-surface/30 border border-border/10 hover:border-accent/20 text-xs font-bold text-text-secondary hover:text-text-primary transition-all"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
