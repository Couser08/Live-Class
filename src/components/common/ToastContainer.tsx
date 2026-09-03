import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
            warning: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />,
            info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-4 flex items-start gap-3 text-slate-800"
            >
              {icons[toast.type]}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900">{toast.title}</h4>
                {toast.description && (
                  <p className="text-xs text-slate-500 mt-0.5 break-all">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
