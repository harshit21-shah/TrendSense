import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore, type ToastType } from '../../store/useToastStore';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const ToastIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case 'success': return <CheckCircle size={18} className="text-success" />;
    case 'error': return <XCircle size={18} className="text-danger" />;
    case 'info': return <Info size={18} className="text-blue-400" />;
  }
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className={cn(
              "pointer-events-auto min-w-[320px] max-w-md p-5 rounded-3xl bg-surface-overlay border border-border/50 shadow-2xl flex items-start gap-4 backdrop-blur-xl",
              toast.type === 'success' && "border-success/20 bg-success/5",
              toast.type === 'error' && "border-danger/20 bg-danger/5",
              toast.type === 'info' && "border-blue-400/20 bg-blue-400/5"
            )}
          >
            <div className="mt-0.5">
              <ToastIcon type={toast.type} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-text-primary leading-tight">
                {toast.message}
              </p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-text-muted/40 hover:text-text-primary transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
