
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ThemeStyle } from '../types';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  theme: ThemeStyle;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, onClose, onConfirm, title, message, theme 
}) => {
  if (!isOpen) return null;

  const isDark = theme.id === 'cyberpunk' || theme.id === 'glass';
  
  const modalContainerStyle = theme.id === 'glass' 
    ? 'bg-gray-900/80 backdrop-blur-xl border border-white/20'
    : theme.id === 'cyberpunk'
      ? 'bg-slate-900 border-2 border-yellow-400 shadow-[0_0_50px_rgba(253,224,71,0.2)]'
      : 'bg-white';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in-down">
      <div className={`
        w-full max-w-sm flex flex-col transform transition-all scale-100
        ${modalContainerStyle}
        ${theme.cardRadius}
        ${theme.cardShadow}
        ${theme.fontFamily}
      `}>
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between shrink-0 ${theme.id === 'pixel' ? 'bg-yellow-400 border-b-4 border-black' : 'border-b border-gray-100/10'}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={theme.id === 'cyberpunk' ? 'text-yellow-400' : 'text-red-500'} size={24} />
            <h3 className={`text-lg font-bold ${theme.id === 'pixel' ? 'text-black' : theme.textPrimary}`}>
              {title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className={`${theme.id === 'pixel' ? 'text-black hover:bg-black hover:text-white' : theme.textMuted + ' hover:' + theme.textPrimary} transition-colors p-1`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className={`text-sm leading-relaxed ${theme.textSecondary}`}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className={`p-4 flex justify-end gap-3 border-t ${theme.id === 'glass' ? 'border-white/10' : 'border-gray-100/10'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-bold transition-all ${theme.buttonSecondary}`}
          >
            取消
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`
              px-6 py-2 text-sm font-bold transition-all text-white
              ${theme.id === 'pixel' ? 'bg-red-600 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)]' : 'bg-red-500 hover:bg-red-600 rounded-lg shadow-lg shadow-red-500/30'}
            `}
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;