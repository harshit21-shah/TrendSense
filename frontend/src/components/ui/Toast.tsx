import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useAppStore, type Toast } from '../../store/useAppStore';
import { cn } from '../../lib/cn';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES: Record<Toast['type'], string> = {
  success: 'bg-emerald-950 text-emerald-100 ring-1 ring-emerald-800',
  error: 'bg-rose-950 text-rose-100 ring-1 ring-rose-800',
  info: 'bg-zinc-800 text-zinc-100 ring-1 ring-zinc-700',
  warning: 'bg-amber-950 text-amber-100 ring-1 ring-amber-800',
};

const ICON_STYLES: Record<Toast['type'], string> = {
  success: 'text-emerald-400',
  error: 'text-rose-400',
  info: 'text-blue-400',
  warning: 'text-amber-400',
};

function ToastItem({ toast }: { toast: Toast }) {
  const { dismissToast } = useAppStore();
  const Icon = ICONS[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-center gap-3 pl-3 pr-2 py-2.5 rounded-lg shadow-xl max-w-sm text-sm',
        STYLES[toast.type],
      )}
    >
      <Icon className={cn('shrink-0 h-4 w-4', ICON_STYLES[toast.type])} />
      <p className="flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => dismissToast(toast.id)}
        className="shrink-0 p-0.5 rounded opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

export function ToastManager() {
  const { toasts } = useAppStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
