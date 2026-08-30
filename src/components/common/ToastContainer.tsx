import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useHospital();

  if (!toasts || toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />
  };

  const bgStyles = {
    success: 'bg-emerald-50/95 border-emerald-300 text-emerald-950',
    warning: 'bg-amber-50/95 border-amber-300 text-amber-950',
    error: 'bg-rose-50/95 border-rose-300 text-rose-950',
    info: 'bg-blue-50/95 border-blue-300 text-blue-950'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto border shadow-xl rounded-2xl p-4 flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 ${
            bgStyles[toast.type] || bgStyles.info
          }`}
        >
          <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold leading-none mb-1">{toast.title}</h4>
            <p className="text-xs opacity-90 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
