import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';

export default function Toast() {
  const { toast, hideToast } = useCalendar();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
  };

  const bgMap = {
    success: 'border-emerald-500/30 bg-emerald-950/80 text-emerald-100 shadow-emerald-900/20',
    error: 'border-rose-500/30 bg-rose-950/80 text-rose-100 shadow-rose-900/20',
    info: 'border-indigo-500/30 bg-indigo-950/80 text-indigo-100 shadow-indigo-900/20',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short transition-all duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-lg shadow-xl max-w-md ${
          bgMap[toast.type] || bgMap.info
        }`}
      >
        {iconMap[toast.type] || iconMap.info}
        <p className="text-sm font-medium pr-2">{toast.message}</p>
        <button
          onClick={hideToast}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
