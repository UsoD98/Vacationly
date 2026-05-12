import React, { useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { type Toast, useToastStore } from '@/stores/toastStore';
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
        'bg-opacity-100 alert flex items-center gap-3 rounded-lg text-primary-50 shadow-lg',
        {
          'alert-success': toast.type === 'success',
          'alert-error': toast.type === 'error',
          'alert-warning': toast.type === 'warning',
          'alert-info': toast.type === 'info',
        },
      )}
      role="alert"
    >
      <ToastIcon type={toast.type} />
      <div className="flex-1">
        <span className="text-sm font-medium text-primary-50">
          {toast.message}
        </span>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="btn text-primary-50 btn-ghost btn-sm"
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
    <div className="pointer-events-none fixed top-16 left-1/2 z-50 flex w-full -translate-x-1/2 flex-col gap-2 lg:w-1/2">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
};
