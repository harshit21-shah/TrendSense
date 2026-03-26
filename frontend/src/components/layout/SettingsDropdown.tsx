import React, { useState, useRef, useEffect } from 'react';
import { Settings, Bell, Key, Shield, HelpCircle, LogOut, User, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../../store/useToastStore';

export const SettingsDropdown: React.FC = () => {
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

  const menuItems = [
    {
      icon: User,
      label: 'Account Settings',
      action: () => addToast('Account settings coming soon', 'info'),
    },
    {
      icon: Bell,
      label: 'Notification Preferences',
      action: () => addToast('Notification preferences coming soon', 'info'),
    },
    {
      icon: Palette,
      label: 'Appearance',
      action: () => addToast('Theme customization coming soon', 'info'),
    },
    {
      icon: Key,
      label: 'API Keys',
      action: () => addToast('API key management coming soon', 'info'),
    },
    {
      icon: Shield,
      label: 'Privacy & Security',
      action: () => addToast('Privacy settings coming soon', 'info'),
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      action: () => addToast('Help center coming soon', 'info'),
    },
  ];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-text-muted/40 hover:text-text-primary transition-colors"
        aria-label="Settings"
      >
        <Settings size={16} strokeWidth={2} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-3 w-64 bg-surface-overlay border border-border/50 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/20">
              <h3 className="text-sm font-black text-text-primary">Settings</h3>
              <p className="text-xs text-text-muted/60 mt-0.5">Manage your preferences</p>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-surface/50 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-xl bg-surface-raised flex items-center justify-center text-text-muted/60 group-hover:text-accent group-hover:bg-accent/10 transition-all">
                    <item.icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-border/20 bg-surface-raised/50">
              <button
                onClick={() => {
                  addToast('Logout functionality coming soon', 'info');
                  setIsOpen(false);
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
