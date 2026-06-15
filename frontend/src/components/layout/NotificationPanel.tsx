import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCheck, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNotifications, useMarkRead, useMarkAllRead } from '../../hooks/useNotifications';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/cn';
import { timeAgo } from '../../lib/utils';
import type { Notification } from '../../types';

const NOTIF_ICONS: Record<string, ReactNode> = {
  trend: <TrendingUp className="h-4 w-4 text-violet-400" />,
  alert: <AlertCircle className="h-4 w-4 text-amber-400" />,
  system: <Info className="h-4 w-4 text-blue-400" />,
};

function NotifItem({
  notif,
  onMarkRead,
}: {
  notif: Notification;
  onMarkRead: (id: string) => void;
}) {
  return (
    <button
      onClick={() => !notif.read && onMarkRead(notif.id)}
      className={cn(
        'w-full text-left px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors',
        !notif.read && 'bg-zinc-900/50',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5">
          {NOTIF_ICONS[notif.type] ?? NOTIF_ICONS.system}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p
              className={cn(
                'text-sm font-medium truncate',
                notif.read ? 'text-zinc-400' : 'text-zinc-100',
              )}
            >
              {notif.title}
            </p>
            {!notif.read && (
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-violet-500 mt-1" />
            )}
          </div>
          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{notif.message}</p>
          <p className="text-xs text-zinc-700 mt-1">{timeAgo(notif.timestamp)}</p>
        </div>
      </div>
    </button>
  );
}

export function NotificationPanel() {
  const { notificationPanelOpen, setNotificationPanelOpen } = useAppStore();

  useEffect(() => {
    if (!notificationPanelOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNotificationPanelOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [notificationPanelOpen, setNotificationPanelOpen]);
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {notificationPanelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-30 bg-black/25"
            onClick={() => setNotificationPanelOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-80 z-40 bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 h-14">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-100">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-violet-600 text-white text-[10px] font-bold rounded-full px-1.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead.mutate()}
                    className="flex items-center gap-1 h-6 px-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>All read</span>
                  </button>
                )}
                <button
                  onClick={() => setNotificationPanelOpen(false)}
                  className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-600 p-8">
                  <Bell className="h-8 w-8 opacity-30" />
                  <p className="text-sm text-center leading-relaxed">
                    No notifications yet. Run the pipeline to start getting trend alerts.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <NotifItem key={n.id} notif={n} onMarkRead={(id) => markRead.mutate(id)} />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
