import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const Toast: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-[#6A9FB5]" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-black bg-opacity-80 backdrop-blur-lg border border-white border-opacity-20 rounded-lg p-4 max-w-sm shadow-lg animate-in slide-in-from-right duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getIcon(toast.type)}
              <span className="text-white font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast;