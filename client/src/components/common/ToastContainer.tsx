import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore, type Toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';

const ToastIcon: React.FC<{ type: Toast['type'] }> = ({ type }) => {
  const iconProps = { size: 20 };
  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} className="text-success" />;
    case 'error':
      return <AlertCircle {...iconProps} className="text-error" />;
    case 'warning':
      return <AlertTriangle {...iconProps} className="text-warning" />;
    case 'info':
    default:
      return <Info {...iconProps} className="text-info" />;
  }
};

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToastStore();

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, removeToast]);

  return (
    <div
      className={cn(
        'alert flex items-center gap-3 rounded-lg shadow-lg',
        {
          'alert-success bg-success/10': toast.type === 'success',
          'alert-error bg-error/10': toast.type === 'error',
          'alert-warning bg-warning/10': toast.type === 'warning',
          'alert-info bg-info/10': toast.type === 'info',
        }
      )}
      role="alert"
    >
      <ToastIcon type={toast.type} />
      <div className="flex-1">
        <span
          className={cn('text-sm font-medium', {
            'text-success': toast.type === 'success',
            'text-error': toast.type === 'error',
            'text-warning': toast.type === 'warning',
            'text-info': toast.type === 'info',
          })}
        >
          {toast.message}
        </span>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="btn btn-ghost btn-sm"
        aria-label="Close toast"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
};

