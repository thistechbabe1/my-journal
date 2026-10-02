import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

export default function Toast({ id, message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3500); // Fades out in 3.5s

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const styles = {
    success: 'bg-card border-sharon-accent/40 text-foreground',
    warning: 'bg-card border-warning/40 text-foreground',
    error: 'bg-card border-danger/40 text-foreground',
    info: 'bg-card border-sharon-primary/40 text-foreground'
  };

  const icons = {
    success: <CheckCircle2 size={14} className="text-sharon-accent shrink-0" />,
    warning: <AlertTriangle size={14} className="text-warning shrink-0" />,
    error: <AlertCircle size={14} className="text-danger shrink-0" />,
    info: <Info size={14} className="text-sharon-primary shrink-0" />
  };

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm max-w-sm w-full animate-fade-in font-sans text-xs ${styles[type]}`}
    >
      {icons[type]}
      <span className="flex-1 font-medium ">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="text-sharon-muted hover:text-foreground transition-colors p-0.5 rounded cursor-pointer"
      >
        <X size={12} />
      </button>
    </div>
  );
}
