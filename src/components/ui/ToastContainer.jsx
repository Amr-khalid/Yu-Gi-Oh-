'use client';
import { AnimatePresence, motion } from 'framer-motion';
import useUIStore from '@/store/useUIStore';
import { FiCheck, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

const ICONS = {
  success: { icon: FiCheck, color: '#22c55e' },
  error: { icon: FiX, color: '#ef4444' },
  warning: { icon: FiAlertTriangle, color: '#f59e0b' },
  info: { icon: FiInfo, color: '#06b6d4' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const { icon: Icon, color } = ICONS[toast.type] || ICONS.info;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.8 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl glass border border-white/10 min-w-[220px] max-w-[320px] shadow-2xl"
              style={{ borderLeft: `3px solid ${color}` }}
            >
              <Icon style={{ color, flexShrink: 0 }} className="text-lg" />
              <p className="text-sm text-white/90 flex-1 font-medium">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/40 hover:text-white transition-colors flex-shrink-0"
              >
                <FiX />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
