import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

/**
 * Hook to trigger toast notifications.
 * Usage: const toast = useToast();
 *        toast.success('Resume uploaded');
 *        toast.error('Upload failed');
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const TOAST_DURATION = 4000;
let toastIdCounter = 0;

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const styleMap = {
  success: 'border-success/30 bg-success-muted',
  error: 'border-error/30 bg-error-muted',
  info: 'border-primary/30 bg-primary-muted',
};

const iconColorMap = {
  success: 'text-success',
  error: 'text-error',
  info: 'text-primary',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => removeToast(id), TOAST_DURATION);
    return id;
  }, [removeToast]);

  const api = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast Container */}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const Icon = iconMap[toast.type] || Info;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg ${styleMap[toast.type] || styleMap.info}`}
                role="alert"
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColorMap[toast.type] || iconColorMap.info}`} />
                <p className="flex-1 text-sm text-text-main font-medium">
                  {toast.message}
                </p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 rounded-lg text-text-subtle hover:text-text-main hover:bg-surface-100 transition-colors cursor-pointer"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export default ToastContext;
