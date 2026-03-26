import React, { useState, useRef, useEffect } from 'react';
import { User, CreditCard, HelpCircle, LogOut, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../../store/useToastStore';

export const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToastStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 pl-2 group"
        aria-label="User profile menu"
      >
        <div className="w-8 h-8 rounded-full bg-surface-raised border border-border/50 flex items-center justify-center overflow-hidden group-hover:border-accent/40 transition-colors">
          <User size={14} className="text-text-muted/60" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary group-hover:text-text-primary transition-colors">
            Analyst 01
          </span>
          <span className="text-[9px] font-bold text-text-muted/40 uppercase tracking-tight">
            Tier 1 Access
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-3 w-72 bg-surface-overlay border border-border/50 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden z-50"
          >
            {/* Profile Header */}
            <div className="p-6 border-b border-border/20 bg-gradient-to-br from-accent/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-surface-raised border-2 border-accent/20 flex items-center justify-center">
                  <User size={24} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-base font-black text-text-primary">Analyst 01</h3>
                  <p className="text-xs text-text-muted/60 mt-0.5">analyst@trendsense.ai</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 border border-accent/20">
                      <Zap size={10} className="text-accent" fill="currentColor" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-accent">
                        Tier 1
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={() => {
                  addToast('Profile settings coming soon', 'info');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-surface/50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-surface-raised flex items-center justify-center text-text-muted/60 group-hover:text-accent group-hover:bg-accent/10 transition-all">
                  <User size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                    Profile Settings
                  </div>
                  <div className="text-xs text-text-muted/60">Manage your account</div>
                </div>
              </button>

              <button
                onClick={() => {
                  addToast('Subscription management coming soon', 'info');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-surface/50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-surface-raised flex items-center justify-center text-text-muted/60 group-hover:text-accent group-hover:bg-accent/10 transition-all">
                  <CreditCard size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                    Subscription
                  </div>
                  <div className="text-xs text-text-muted/60">Upgrade to Pro</div>
                </div>
              </button>

              <button
                onClick={() => {
                  addToast('Security settings coming soon', 'info');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-surface/50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-surface-raised flex items-center justify-center text-text-muted/60 group-hover:text-accent group-hover:bg-accent/10 transition-all">
                  <Shield size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                    Security
                  </div>
                  <div className="text-xs text-text-muted/60">Password & 2FA</div>
                </div>
              </button>

              <button
                onClick={() => {
                  addToast('Help center coming soon', 'info');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-surface/50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-surface-raised flex items-center justify-center text-text-muted/60 group-hover:text-accent group-hover:bg-accent/10 transition-all">
                  <HelpCircle size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                    Help & Support
                  </div>
                  <div className="text-xs text-text-muted/60">Get assistance</div>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-border/20 bg-surface-raised/50">
              <button
                onClick={() => {
                  addToast('Signing out...', 'info');
                  setIsOpen(false);
                  // Implement actual logout logic here
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-danger/5 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-surface-raised flex items-center justify-center text-text-muted/60 group-hover:text-danger transition-all">
                  <LogOut size={16} />
                </div>
                <span className="text-sm font-medium text-text-secondary group-hover:text-danger transition-colors">
                  Sign Out
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
