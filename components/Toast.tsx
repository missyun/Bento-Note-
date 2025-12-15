
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-white border-l-4 border-green-500',
    error: 'bg-white border-l-4 border-red-500',
    info: 'bg-white border-l-4 border-blue-500'
  };

  return (
    <div className={`fixed top-4 right-4 z-[100] flex items-center p-4 rounded shadow-lg min-w-[300px] animate-slide-in-right ${bgColors[toast.type]}`}>
      <div className="mr-3">
        {icons[toast.type]}
      </div>
      <div className="flex-1 text-sm font-medium text-gray-800">
        {toast.message}
      </div>
      <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;