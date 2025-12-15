
import React, { useState, useEffect } from 'react';
import { 
  X, FolderPlus, FolderPen,
  Star, Heart, Music, Video, Code, Coffee, Gamepad, ShoppingCart, 
  Archive, Zap, Flag, Bell, Home, Mountain, Sun, Camera, Headphones, 
  Database, Terminal, Cpu, Gift, MapPin, Truck, Wifi, Folder
} from 'lucide-react';
import { ThemeStyle, Folder as FolderType } from '../types';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, icon: string) => void;
  theme: ThemeStyle;
  initialData?: FolderType | null;
}

const ICONS = [
  { name: 'Folder', Icon: Folder },
  { name: 'Star', Icon: Star },
  { name: 'Heart', Icon: Heart },
  { name: 'Home', Icon: Home },
  { name: 'Code', Icon: Code },
  { name: 'Music', Icon: Music },
  { name: 'Video', Icon: Video },
  { name: 'Gamepad', Icon: Gamepad },
  { name: 'Coffee', Icon: Coffee },
  { name: 'ShoppingCart', Icon: ShoppingCart },
  { name: 'Archive', Icon: Archive },
  { name: 'Zap', Icon: Zap },
  { name: 'Flag', Icon: Flag },
  { name: 'Bell', Icon: Bell },
  { name: 'Mountain', Icon: Mountain },
  { name: 'Sun', Icon: Sun },
  { name: 'Camera', Icon: Camera },
  { name: 'Headphones', Icon: Headphones },
  { name: 'Database', Icon: Database },
  { name: 'Terminal', Icon: Terminal },
  { name: 'Cpu', Icon: Cpu },
  { name: 'Gift', Icon: Gift },
  { name: 'MapPin', Icon: MapPin },
  { name: 'Wifi', Icon: Wifi },
];

const FolderModal: React.FC<FolderModalProps> = ({ isOpen, onClose, onSave, theme, initialData }) => {
  const [folderName, setFolderName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Folder');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFolderName(initialData.name);
        setSelectedIcon(initialData.icon);
      } else {
        setFolderName('');
        setSelectedIcon('Folder');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onSave(folderName.trim(), selectedIcon);
      if (!initialData) {
        setFolderName('');
        setSelectedIcon('Folder');
      }
      onClose();
    }
  };

  const isDark = theme.id === 'cyberpunk' || theme.id === 'glass';
  const modalContainerStyle = theme.id === 'glass' 
    ? 'bg-gray-900/80 backdrop-blur-xl border border-white/20'
    : theme.id === 'cyberpunk'
      ? 'bg-slate-900 border-2 border-yellow-400 shadow-[0_0_50px_rgba(253,224,71,0.2)]'
      : 'bg-white';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className={`
        w-full max-w-md flex flex-col transform transition-all scale-100
        ${modalContainerStyle}
        ${theme.cardRadius}
        ${theme.cardShadow}
        ${theme.fontFamily}
        max-h-[90vh]
      `}>
        {/* Header */}
        <div className={`px-6 py-4 flex justify-between items-center shrink-0 ${theme.id === 'pixel' ? 'border-b-4 border-black bg-yellow-400' : 'border-b border-gray-100/10'}`}>
          <h2 className={`text-lg font-bold flex items-center gap-2 ${theme.id === 'pixel' ? 'text-black' : theme.textPrimary}`}>
            {initialData ? <FolderPen size={20} /> : <FolderPlus size={20} />} 
            {initialData ? '编辑文件夹' : '新建文件夹'}
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className={`${theme.id === 'pixel' ? 'text-black hover:bg-black hover:text-white p-1' : theme.textMuted + ' hover:' + theme.textPrimary} transition-colors`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col overflow-hidden">
          <div className="overflow-y-auto custom-scrollbar pr-2">
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.textSecondary}`}>
              文件夹名称
            </label>
            <input
              type="text"
              autoFocus
              required
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className={`w-full px-4 py-3 outline-none transition-all mb-6 ${theme.inputBg} ${theme.inputBorder} ${theme.cardRadius}`}
              placeholder="例如: 财务报表"
            />

            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.textSecondary}`}>
              选择图标
            </label>
            <div className={`grid grid-cols-6 gap-2 mb-6 ${theme.id === 'glass' ? 'bg-black/20' : 'bg-gray-50'} p-3 rounded-lg border ${theme.id === 'glass' ? 'border-white/10' : 'border-gray-100'}`}>
              {ICONS.map(({ name, Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedIcon(name)}
                  className={`
                    p-2 flex items-center justify-center rounded-md transition-all
                    ${selectedIcon === name 
                      ? (theme.id === 'pixel' ? 'bg-black text-white ring-2 ring-black ring-offset-2' : theme.id === 'cyberpunk' ? 'bg-yellow-400 text-black shadow-[0_0_10px_rgba(253,224,71,0.5)]' : 'bg-blue-100 text-blue-600 ring-2 ring-blue-500 ring-offset-2')
                      : (theme.id === 'glass' ? 'text-white/60 hover:bg-white/10 hover:text-white' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800')
                    }
                  `}
                  title={name}
                >
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-bold transition-all ${theme.buttonSecondary}`}
            >
              取消
            </button>
            <button
              type="submit"
              className={`px-6 py-2 text-sm font-bold transition-all ${theme.buttonPrimary}`}
            >
              {initialData ? '保存修改' : '立即创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FolderModal;