import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Settings, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

interface Notification {
  id: string;
  type: 'trend' | 'alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const NotificationsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'trend',
      title: 'New High-Velocity Signal',
      message: 'Agentic AI momentum increased by 18.4% in the last 24 hours',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      type: 'alert',
      title: 'Watchlist Alert',
      message: 'Bio-Computing TVS score crossed your threshold of 85',
      timestamp: '5 hours ago',
      read: false,
    },
    {
      id: '3',
      type: 'system',
      title: 'Pipeline Sync Complete',
      message: 'Intelligence pipeline successfully processed 1,247 new signals',
      timestamp: '1 day ago',
      read: true,
    },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-text-muted/40 hover:text-text-primary transition-colors relative group"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell size={16} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-3 w-96 bg-surface-overlay border border-border/50 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-text-primary">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-text-muted/60 mt-0.5">{unreadCount} unread</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-bold text-accent hover:text-accent/80 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="p-1.5 text-text-muted/40 hover:text-danger transition-colors rounded-lg hover:bg-danger/5"
                    aria-label="Clear all notifications"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-surface-raised flex items-center justify-center mx-auto">
                    <Bell size={24} className="text-text-muted/40" />
                  </div>
                  <p className="text-sm text-text-secondary">No notifications</p>
                  <p className="text-xs text-text-muted/60">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 border-b border-border/10 hover:bg-surface/30 transition-colors group relative",
                      !notification.read && "bg-accent/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 shrink-0",
                        !notification.read ? "bg-accent" : "bg-transparent"
                      )} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-text-primary mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-text-muted/40 font-mono">
                          {notification.timestamp}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1.5 text-text-muted/40 hover:text-accent transition-colors rounded-lg hover:bg-accent/5"
                            aria-label="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1.5 text-text-muted/40 hover:text-danger transition-colors rounded-lg hover:bg-danger/5"
                          aria-label="Delete notification"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border/20 bg-surface-raised/50">
                <button className="w-full text-xs font-bold text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-2 py-2">
                  <Settings size={12} />
                  Notification Settings
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
