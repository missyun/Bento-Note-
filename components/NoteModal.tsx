
import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Eye, Image as ImageIcon, Lock, Unlock, ArrowRight, FileText, Sparkles, Calendar as CalendarIcon, Tag, FolderOpen, MoreHorizontal, Maximize2, Minimize2, Pin, Edit2, Terminal, Coffee, AlertCircle, Type, Code, Bell, Clock, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import ReactQuill from 'react-quill';
import Calendar from 'react-calendar';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format, addMinutes, isSameDay } from 'date-fns';
import { Note, NoteColor, ThemeStyle, Folder, EditorType } from '../types';
import { NOTE_COLOR_TINTS } from '../constants';
import LazyImage from './LazyImage';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData: Note | null;
  folders: Folder[];
  currentFolderId: string;
  theme: ThemeStyle;
  initialMode: 'view' | 'edit';
}

const COLOR_OPTIONS: { key: NoteColor; label: string; bg: string; ring: string }[] = [
  { key: 'white', label: '默认', bg: 'bg-white', ring: 'ring-gray-300' },
  { key: 'red', label: '红色', bg: 'bg-red-500', ring: 'ring-red-400' },
  { key: 'orange', label: '橙色', bg: 'bg-orange-500', ring: 'ring-orange-400' },
  { key: 'yellow', label: '黄色', bg: 'bg-yellow-400', ring: 'ring-yellow-400' },
  { key: 'green', label: '绿色', bg: 'bg-green-500', ring: 'ring-green-400' },
  { key: 'blue', label: '蓝色', bg: 'bg-blue-500', ring: 'ring-blue-400' },
  { key: 'purple', label: '紫色', bg: 'bg-purple-500', ring: 'ring-purple-400' },
  { key: 'pink', label: '粉色', bg: 'bg-pink-500', ring: 'ring-pink-400' },
];

const NoteModal: React.FC<NoteModalProps> = ({ 
  isOpen, onClose, onSave, initialData, folders, currentFolderId, theme, initialMode
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [folderId, setFolderId] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState<NoteColor>('white');
  const [editorType, setEditorType] = useState<EditorType>('markdown');
  
  // Reminder State (using Date object now for better control)
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Lock State
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [unlockError, setUnlockError] = useState(false);

  // UI State
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      if (initialData) {
        if (initialData.isLocked) {
           setIsUnlocked(false);
           setIsLocked(true);
           setPassword(initialData.password || '');
        } else {
           populateForm(initialData);
           setIsUnlocked(true);
           setIsLocked(false);
           setPassword('');
        }
      } else {
        resetForm();
        setIsUnlocked(true);
        setFolderId(currentFolderId === 'all' || currentFolderId === 'timeline' ? (folders.find(f => !f.isSystem)?.id || 'personal') : currentFolderId);
      }
    }
  }, [initialData, isOpen, currentFolderId, folders, initialMode]);

  const populateForm = (data: Note) => {
      setTitle(data.title);
      setContent(data.content);
      setTags(data.tags.join(', '));
      setIsImportant(data.isImportant);
      setIsPinned(!!data.isPinned);
      setColor(data.color);
      setFolderId(data.folderId || 'all');
      setIsLocked(!!data.isLocked);
      setPassword(data.password || '');
      
      if (data.reminderTime) {
        setReminderDate(new Date(data.reminderTime));
      } else {
        setReminderDate(null);
      }
      
      if (data.editorType) {
        setEditorType(data.editorType);
      } else {
        setEditorType(data.isMarkdown === false ? 'plain' : 'markdown');
      }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTags('');
    setIsImportant(false);
    setIsPinned(false);
    setColor('white');
    setEditorType('markdown');
    setShowImageInput(false);
    setImageUrl('');
    setIsLocked(false);
    setPassword('');
    setInputPassword('');
    setUnlockError(false);
    setReminderDate(null);
    setShowDatePicker(false);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData && inputPassword === initialData.password) {
      setIsUnlocked(true);
      populateForm(initialData);
      setUnlockError(false);
      setInputPassword('');
    } else {
      setUnlockError(true);
    }
  };

  const handleSubmit = () => {
    const tagsArray = tags.split(/[,，]/).map(t => t.trim()).filter(t => t);
    
    onSave({
      title: title.trim() || '无标题便签',
      content,
      tags: tagsArray,
      folderId,
      isImportant,
      isPinned,
      color,
      isCompleted: initialData ? initialData.isCompleted : false,
      isLocked,
      password: isLocked ? password : undefined,
      editorType: editorType,
      isMarkdown: editorType === 'markdown', 
      reminderTime: reminderDate ? reminderDate.getTime() : undefined
    });
    onClose();
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (editorType === 'rich') return; 
    
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = items[i].getAsFile();
        if (!blob) continue;

        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          if (base64) {
             const imageText = editorType === 'markdown' 
                ? `\n![Pasted Image](${base64})\n` 
                : ` [图片: 已插入] `;
             
             if (textareaRef.current) {
                const start = textareaRef.current.selectionStart;
                const end = textareaRef.current.selectionEnd;
                const newContent = content.substring(0, start) + imageText + content.substring(end);
                setContent(newContent);
                setTimeout(() => {
                   if(textareaRef.current) {
                      textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + imageText.length;
                   }
                }, 0);
             } else {
                setContent(prev => prev + imageText);
             }
          }
        };
        reader.readAsDataURL(blob);
      }
    }
  };

  const handleInsertImage = () => {
    if (imageUrl) {
      const imageMarkdown = editorType === 'markdown' ? `\n![Image](${imageUrl})\n` : `\n${imageUrl}\n`;
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
        setContent(newContent);
      } else {
        setContent(prev => prev + imageMarkdown);
      }
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const getSyntaxStyle = () => {
    switch (theme.id) {
      case 'cyberpunk':
      case 'glass':
      case 'pixel':
      case 'retro':
        return vscDarkPlus;
      default:
        return prism;
    }
  };

  const getImageStyle = () => {
    switch (theme.id) {
      case 'pixel': return 'border-2 border-black rounded-none shadow-[4px_4px_0_0_rgba(0,0,0,1)]';
      case 'cyberpunk': return 'border border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,255,0.2)] rounded-none opacity-90';
      case 'glass': return 'border border-white/20 shadow-lg rounded-xl';
      case 'sketch': return 'border-2 border-gray-700 rounded-[2px] shadow-sm rotate-1 p-1 bg-white';
      case 'retro': return 'border-4 border-double border-[#8b4513] sepia-[.3] rounded-sm';
      default: return 'rounded-xl border border-gray-200/50';
    }
  };

  const getErrorMessage = () => {
    switch (theme.id) {
      case 'cyberpunk': return '> ACCESS_DENIED //';
      case 'pixel': return '[ ERROR ]';
      case 'retro': return 'Error: Invalid Key';
      default: return '密码错误';
    }
  };

  // --- Custom Date Picker Component ---
  const CustomDateTimePicker = () => {
    // Init temp date for picker
    const [pickerDate, setPickerDate] = useState<Date>(reminderDate || new Date());
    const [pickerTime, setPickerTime] = useState(format(reminderDate || new Date(), 'HH:mm'));

    useEffect(() => {
        // Request notification permission when opening the picker
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    const handleConfirm = () => {
       const [hours, minutes] = pickerTime.split(':').map(Number);
       const newDate = new Date(pickerDate);
       newDate.setHours(hours);
       newDate.setMinutes(minutes);
       setReminderDate(newDate);
       setShowDatePicker(false);
    };

    const handleClear = () => {
        setReminderDate(null);
        setShowDatePicker(false);
    };

    // Styles based on theme
    const isDark = theme.id === 'glass' || theme.id === 'cyberpunk';
    const containerClasses = `
       ${theme.id === 'glass' ? 'bg-gray-900/90 backdrop-blur-2xl border border-white/20 text-white' : ''}
       ${theme.id === 'pixel' ? 'bg-white border-4 border-black shadow-[8px_8px_0_0_black] rounded-none font-mono' : ''}
       ${theme.id === 'cyberpunk' ? 'bg-black border border-cyan-500 shadow-[0_0_20px_cyan] text-cyan-400 rounded-none font-mono' : ''}
       ${theme.id === 'warm' ? 'bg-[#FDFBF7] border border-[#EBE5D5] shadow-xl rounded-2xl text-[#5D4037]' : ''}
       ${theme.id === 'industrial' ? 'bg-[#F4F4F4] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] border border-white/50 text-[#333] rounded-xl' : ''}
       ${theme.id === 'morandi' ? 'bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl text-[#4A4E69]' : ''}
       ${!['glass', 'pixel', 'cyberpunk', 'warm', 'industrial', 'morandi'].includes(theme.id) ? 'bg-white shadow-2xl rounded-2xl border border-gray-100 text-gray-800' : ''}
    `;

    const buttonClasses = `
       ${theme.id === 'pixel' ? 'border-2 border-black bg-white hover:bg-black hover:text-white rounded-none shadow-[2px_2px_0_0_black]' : ''}
       ${theme.id === 'cyberpunk' ? 'bg-cyan-900/20 border border-cyan-500 hover:bg-cyan-500 hover:text-black rounded-none' : ''}
       ${theme.id === 'glass' ? 'bg-white/10 hover:bg-white/20 rounded-lg' : ''}
       ${theme.id === 'industrial' ? 'shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff] active:shadow-inner bg-[#F4F4F4] rounded-lg' : ''}
       ${!['pixel', 'cyberpunk', 'glass', 'industrial'].includes(theme.id) ? 'bg-gray-100 hover:bg-gray-200 rounded-lg' : ''}
    `;

    const activeTileClass = theme.id === 'pixel' ? 'bg-black text-white !important' 
        : theme.id === 'cyberpunk' ? 'bg-cyan-600 text-black shadow-[0_0_10px_cyan] !important'
        : theme.id === 'industrial' ? 'bg-[#EA580C] text-white !important'
        : 'bg-blue-600 text-white !important';

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in-up" onClick={() => setShowDatePicker(false)}>
            <div className={`w-full max-w-sm p-6 flex flex-col gap-6 ${containerClasses}`} onClick={e => e.stopPropagation()}>
                {/* Header: Time Selection */}
                <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${theme.id === 'pixel' ? 'uppercase' : ''}`}>
                        <Clock size={20} />
                        {theme.id === 'cyberpunk' ? 'SET_TIMER' : '设置提醒时间'}
                    </h3>
                    <div className={`relative group ${theme.id === 'industrial' ? 'p-1 bg-[#eeeeee] rounded-md shadow-inner' : ''}`}>
                        <input 
                            type="time" 
                            value={pickerTime} 
                            onChange={(e) => setPickerTime(e.target.value)}
                            className={`
                                text-2xl font-bold bg-transparent outline-none cursor-pointer text-center w-28
                                ${theme.id === 'cyberpunk' ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(253,224,71,0.8)]' : ''}
                                ${theme.id === 'pixel' ? 'font-mono' : ''}
                            `} 
                        />
                        {/* Custom underline for styling */}
                        <div className={`h-0.5 w-full bg-current opacity-20 group-hover:opacity-100 transition-opacity`}></div>
                    </div>
                </div>

                {/* Calendar Body */}
                <div className={`
                    p-2 rounded-xl
                    ${theme.id === 'glass' ? 'bg-black/20' : ''}
                    ${theme.id === 'warm' ? 'bg-[#F9F7F0]' : ''}
                    ${theme.id === 'industrial' ? 'shadow-inner bg-[#eeeeee]' : ''}
                    ${!['glass', 'warm', 'industrial', 'pixel', 'cyberpunk'].includes(theme.id) ? 'bg-gray-50' : ''}
                `}>
                    <style>{`
                        .react-calendar__tile--active { ${activeTileClass} }
                        .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background-color: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}; }
                        .react-calendar__navigation button:enabled:hover { background-color: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}; }
                        .react-calendar__month-view__days__day--weekend { color: ${theme.id === 'cyberpunk' ? '#f472b6' : '#ef4444'}; opacity: 0.8; }
                        .react-calendar__tile--now { background: transparent; color: ${theme.id === 'cyberpunk' ? '#facc15' : 'currentColor'}; font-weight: bold; border: 1px solid currentColor; }
                    `}</style>
                    <Calendar 
                        onChange={(val) => setPickerDate(val as Date)} 
                        value={pickerDate}
                        className={`w-full bg-transparent border-none font-inherit text-sm ${theme.id === 'pixel' ? 'font-mono' : ''}`}
                        prevLabel={<ChevronLeft size={16} />}
                        nextLabel={<ChevronRight size={16} />}
                        next2Label={null}
                        prev2Label={null}
                        formatShortWeekday={(locale, date) => ['S','M','T','W','T','F','S'][date.getDay()]}
                    />
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-2">
                    <button onClick={handleClear} className={`px-4 py-2 text-xs font-bold opacity-60 hover:opacity-100 flex items-center gap-1 hover:text-red-500 transition-colors`}>
                        <Trash2 size={14} /> 清除
                    </button>
                    <div className="flex gap-3">
                        <button onClick={() => setShowDatePicker(false)} className={`px-5 py-2 text-sm font-bold transition-all ${buttonClasses}`}>
                            取消
                        </button>
                        <button onClick={handleConfirm} className={`px-6 py-2 text-sm font-bold transition-all text-white shadow-lg active:scale-95 ${theme.buttonPrimary} ${theme.id === 'pixel' ? 'rounded-none' : ''}`}>
                            确定
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  if (!isOpen) return null;

  const isDark = theme.id === 'cyberpunk' || theme.id === 'glass';
  const isWarm = theme.id === 'warm';

  // --- 1. LOCKED VIEW ---
  if (isLocked && !isUnlocked) {
     const editorContainerClasses = `
      ${theme.id === 'glass' ? 'bg-gray-900/60 backdrop-blur-2xl border border-white/10' : ''}
      ${theme.id === 'cyberpunk' ? 'bg-black border border-yellow-400 shadow-[0_0_40px_rgba(253,224,71,0.2)]' : ''}
      ${isWarm ? 'bg-[#FDFBF7] shadow-2xl' : ''}
      ${theme.id === 'pixel' ? 'bg-white border-4 border-black shadow-[12px_12px_0_0_black]' : ''}
      ${!isDark && !isWarm && theme.id !== 'pixel' ? 'bg-white shadow-2xl' : ''}
    `;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
        <div className={`w-full max-w-sm p-8 rounded-2xl flex flex-col items-center gap-6 ${editorContainerClasses} ${theme.fontFamily}`}>
           <div className={`p-4 rounded-full transition-colors duration-300 ${unlockError ? 'bg-red-100' : isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
              {unlockError ? <AlertCircle size={40} className="text-red-500 animate-pulse" /> : <Lock size={40} className={isDark ? 'text-white' : 'text-gray-600'} />}
           </div>
           <div className="text-center">
             <h2 className={`text-xl font-bold mb-1 ${theme.textPrimary}`}>{unlockError && theme.id === 'cyberpunk' ? 'SYSTEM_ALERT' : '内容已加密'}</h2>
             <p className={`text-sm h-5 transition-colors duration-300 ${unlockError ? 'text-red-500 font-bold' : theme.textSecondary}`}>{unlockError ? getErrorMessage() : '请输入密码解锁此便签'}</p>
           </div>
           <form onSubmit={handleUnlock} className="w-full space-y-4">
              <input type="password" value={inputPassword} onChange={(e) => { setInputPassword(e.target.value); setUnlockError(false); }} placeholder={unlockError ? "重新输入" : "输入密码"} autoFocus className={`w-full px-4 py-3 text-center outline-none rounded-xl transition-all duration-200 ${isDark ? 'bg-white/5 border border-white/10 text-white focus:border-white/30' : 'bg-white border border-gray-200 text-gray-900 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10'} ${unlockError ? 'ring-2 ring-red-500/50 border-red-500 animate-shake bg-red-50' : ''} ${theme.id === 'pixel' ? 'rounded-none border-4 border-black' : ''} ${theme.id === 'cyberpunk' && unlockError ? 'border-red-500 shadow-[0_0_10px_red] text-red-500 placeholder-red-500' : ''}`} />
              <button type="submit" className={`w-full py-3 font-bold rounded-xl active:scale-95 transition-transform ${theme.buttonPrimary} ${theme.id === 'pixel' ? 'rounded-none' : ''} ${unlockError ? 'bg-red-500 hover:bg-red-600 border-red-600' : ''}`}>{unlockError ? '重试' : '解锁'}</button>
           </form>
           <button onClick={onClose} className={`text-sm hover:underline ${theme.textMuted}`}>取消</button>
        </div>
      </div>
    );
  }

  // --- 2. VIEW MODE ---
  if (mode === 'view') {
     const getViewContainerStyles = () => {
       switch(theme.id) {
          case 'sketch': return 'bg-[#faf9f6] text-gray-800 rounded-[2px] shadow-xl border-2 border-gray-300 font-hand rotate-[0.5deg] max-w-3xl overflow-visible';
          case 'pixel': return 'bg-white text-black font-mono border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] rounded-none max-w-4xl';
          case 'cyberpunk': return 'bg-black/95 text-cyan-400 font-mono border border-cyan-500/50 shadow-[0_0_40px_rgba(0,255,255,0.15)] rounded-none clip-path-cyber max-w-5xl';
          case 'retro': return 'bg-[#f4ecd8] text-[#5c4033] font-serif border-4 border-double border-[#8b4513] shadow-[0_10px_30px_rgba(139,69,19,0.2)] rounded-sm max-w-3xl';
          case 'glass': return 'bg-gray-900/40 backdrop-blur-2xl text-white font-sans border border-white/10 shadow-2xl rounded-[2.5rem] max-w-4xl';
          case 'warm': return 'bg-[#FDFBF7] text-[#463C33] font-sans border-none shadow-[0_20px_50px_rgba(138,129,124,0.15)] rounded-[2.5rem] max-w-4xl';
          default: return 'bg-white text-gray-900 font-sans shadow-2xl rounded-[2rem] max-w-4xl';
       }
    };

    return (
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 transition-all ${theme.id === 'glass' ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/50 backdrop-blur-[2px]'}`} onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} className={`w-full flex flex-col overflow-hidden relative max-h-[90vh] min-h-[50vh] ${getViewContainerStyles()} animate-spring-up`}>
          <div className={`px-8 py-6 shrink-0 flex items-start justify-between relative z-10 ${theme.id === 'pixel' ? 'pt-6' : ''}`}>
             <div className="flex-1 pr-8">
               <div className={`flex items-center gap-2 mb-4 text-xs font-bold tracking-wider uppercase opacity-60`}>
                  <FolderOpen size={12} />
                  <span>{folders.find(f => f.id === folderId)?.name}</span>
                  <span className="opacity-50">|</span>
                  <CalendarIcon size={12} />
                  <span>{new Date(initialData?.updatedAt || Date.now()).toLocaleDateString()}</span>
                  {reminderDate && (
                    <>
                      <span className="opacity-50">|</span>
                      <Bell size={12} className="text-blue-500" />
                      <span className="text-blue-500">{reminderDate.toLocaleString()}</span>
                    </>
                  )}
               </div>
               <h1 className={`text-3xl md:text-5xl font-bold leading-tight ${theme.id === 'sketch' ? 'font-hand text-4xl' : ''}`}>{title}</h1>
               <div className="flex flex-wrap gap-2 mt-4">
                  {tags.split(/[,，]/).filter(t=>t).map(tag => (
                     <span key={tag} className={`px-2 py-0.5 text-xs font-bold rounded-full ${theme.id === 'pixel' ? 'bg-black text-white rounded-none' : ''} ${theme.id === 'cyberpunk' ? 'bg-pink-500/20 text-pink-500 border border-pink-500/50' : ''} ${theme.id === 'retro' ? 'bg-[#e6dcc3] text-[#5c4033] border border-[#8b4513]/30' : ''} ${!['pixel', 'cyberpunk', 'retro'].includes(theme.id) ? (isDark ? 'bg-white/10' : 'bg-gray-100 text-gray-600') : ''}`}>#{tag}</span>
                  ))}
               </div>
             </div>
             <button onClick={onClose} className={`p-2 rounded-full transition-transform hover:rotate-90 ${theme.id === 'pixel' ? 'bg-red-600 text-white rounded-none border-2 border-black shadow-[2px_2px_0_0_black]' : ''} ${theme.id === 'sketch' ? 'hover:bg-gray-100' : ''} ${!['pixel', 'sketch'].includes(theme.id) ? (isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-500') : ''}`}><X size={20} /></button>
          </div>

          <div className={`flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar relative z-10 ${theme.id === 'sketch' ? 'leading-loose' : ''}`}>
             <div className={`prose max-w-none ${isDark ? 'prose-invert' : 'prose-gray'} ${theme.id === 'sketch' ? 'font-hand text-xl' : ''} ${theme.id === 'pixel' ? 'font-mono text-sm' : ''} ${theme.id === 'retro' ? 'font-serif text-lg text-[#4a3b2a]' : ''}`}>
                {editorType === 'markdown' ? (
                  <ReactMarkdown remarkPlugins={[remarkBreaks]} components={{
                      a: ({node, ...props}) => <a {...props} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" />,
                      img: ({node, src, alt, ...props}) => <LazyImage src={src} alt={alt} className={`w-full my-6 ${getImageStyle()}`} />,
                      code: ({node, inline, className, children, ...props}: any) => {
                         const match = /language-(\w+)/.exec(className || '');
                         return !inline && match ? (
                           <div className={`rounded-lg overflow-hidden my-6 shadow-md ${theme.id === 'pixel' ? 'rounded-none border-2 border-black' : ''}`}>
                            <SyntaxHighlighter style={getSyntaxStyle()} language={match[1]} PreTag="div" {...props}>{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
                           </div>
                         ) : (<code className={`px-1.5 py-0.5 rounded text-sm ${isDark ? 'bg-white/10 text-pink-300' : 'bg-gray-100 text-pink-600'} ${theme.id === 'retro' ? 'bg-[#e6dcc3] text-[#5c4033]' : ''}`} {...props}>{children}</code>)
                       }
                    }}>
                    {content}
                  </ReactMarkdown>
                ) : editorType === 'rich' ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
                )}
             </div>
          </div>

          <div className="absolute bottom-8 right-8 z-30">
             <button onClick={() => setMode('edit')} className={`flex items-center gap-2 px-6 py-4 font-bold transition-all hover:scale-105 active:scale-95 ${theme.id === 'pixel' ? 'bg-black text-white border-2 border-white shadow-[4px_4px_0_0_rgba(255,255,255,1)] rounded-none' : ''} ${theme.id === 'cyberpunk' ? 'bg-yellow-400 text-black border border-black shadow-[0_0_20px_rgba(253,224,71,0.5)] rounded-none uppercase tracking-widest' : ''} ${theme.id === 'sketch' ? 'bg-white text-black border-2 border-black rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-md' : ''} ${theme.id === 'retro' ? 'bg-[#cc5500] text-[#f0e6d2] border-2 border-[#8b4513] rounded-sm uppercase tracking-widest' : ''} ${!['pixel', 'cyberpunk', 'sketch', 'retro'].includes(theme.id) ? 'rounded-full shadow-2xl text-white bg-gradient-to-r from-blue-500 to-purple-600' : ''}`}>
                <Edit2 size={theme.id === 'pixel' ? 16 : 20} />
                <span>编辑</span>
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. EDIT MODE ---
  const editorContainerClasses = `
    ${theme.id === 'glass' ? 'bg-gray-900/60 backdrop-blur-2xl border border-white/10' : ''}
    ${theme.id === 'cyberpunk' ? 'bg-black border border-yellow-400 shadow-[0_0_40px_rgba(253,224,71,0.2)]' : ''}
    ${isWarm ? 'bg-[#FDFBF7] shadow-2xl' : ''}
    ${theme.id === 'pixel' ? 'bg-white border-4 border-black shadow-[12px_12px_0_0_black]' : ''}
    ${!isDark && !isWarm && theme.id !== 'pixel' ? 'bg-white shadow-2xl' : ''}
  `;
  const sidebarClasses = `
    ${theme.id === 'glass' ? 'bg-black/20 border-l border-white/5' : ''}
    ${isWarm ? 'bg-[#F9F7F0] border-l border-[#EBE5D5]' : ''}
    ${theme.id === 'pixel' ? 'bg-gray-100 border-l-4 border-black' : ''}
    ${!isDark && !isWarm && theme.id !== 'pixel' ? 'bg-gray-50 border-l border-gray-100' : ''}
  `;
  const editorTextClass = isDark ? 'text-gray-100' : 'text-gray-800';
  const placeholderClass = isDark ? 'placeholder-gray-600' : 'placeholder-gray-400';

  return (
    <>
    {/* RENDER CUSTOM DATE PICKER MODAL IF OPEN */}
    {showDatePicker && <CustomDateTimePicker />}

    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-2 md:p-6 transition-all">
      <div className={`w-full max-w-6xl h-[95vh] md:h-[85vh] flex flex-col md:flex-row overflow-hidden rounded-xl md:rounded-2xl shadow-2xl relative ${editorContainerClasses} ${theme.fontFamily} ${theme.id === 'pixel' ? 'rounded-none' : ''} animate-pop`}>
        
        {/* LEFT COLUMN: EDITOR */}
        <div className="flex-1 flex flex-col h-full min-w-0 relative">
          
          {/* Editor Header / Toolbar */}
          <div className={`px-6 md:px-8 py-4 flex items-center justify-between shrink-0 ${theme.id === 'pixel' ? 'border-b-4 border-black bg-yellow-400' : ''}`}>
             <div className="flex items-center gap-2">
                <button type="button" onClick={() => setEditorType('plain')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${editorType === 'plain' ? (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600') : (isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500')} ${theme.id === 'pixel' ? 'rounded-none border-2 border-black bg-white text-black' : ''}`}>
                   <FileText size={12} /> 纯文本
                </button>
                <button type="button" onClick={() => setEditorType('markdown')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${editorType === 'markdown' ? (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600') : (isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500')} ${theme.id === 'pixel' ? 'rounded-none border-2 border-black bg-white text-black' : ''}`}>
                   <Code size={12} /> Markdown
                </button>
                <button type="button" onClick={() => setEditorType('rich')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${editorType === 'rich' ? (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600') : (isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500')} ${theme.id === 'pixel' ? 'rounded-none border-2 border-black bg-white text-black' : ''}`}>
                   <Type size={12} /> 富文本
                </button>
             </div>
             <button onClick={handleSubmit} className="md:hidden text-sm font-bold text-blue-600">保存</button>
          </div>

          <div className="px-6 md:px-8 pt-2 shrink-0">
             <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="无标题便签" className={`w-full text-3xl md:text-4xl font-bold bg-transparent outline-none ${editorTextClass} ${placeholderClass}`} />
          </div>

          <div className="flex-1 flex flex-col p-6 md:px-8 md:py-4 overflow-hidden relative">
             {showImageInput && editorType === 'markdown' && (
                <div className={`absolute top-2 left-8 right-8 z-20 flex gap-2 p-2 rounded-lg shadow-lg ${isDark ? 'bg-[#222] border border-[#333]' : 'bg-white border border-gray-200'}`}>
                   <input autoFocus type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="输入图片 URL..." className={`flex-1 bg-transparent outline-none text-sm px-2 ${editorTextClass}`} onKeyDown={(e) => e.key === 'Enter' && handleInsertImage()} />
                   <button onClick={handleInsertImage} className="text-xs font-bold px-3 bg-blue-500 text-white rounded">确认</button>
                   <button onClick={() => setShowImageInput(false)} className="p-1 hover:bg-gray-500/20 rounded"><X size={14}/></button>
                </div>
             )}

             {editorType === 'rich' ? (
                <div className={`h-full overflow-hidden flex flex-col ${isDark ? 'quill-dark' : ''}`}>
                  <style>{`
                    .quill { height: 100%; display: flex; flex-direction: column; }
                    .ql-container { flex: 1; overflow-y: auto; font-family: inherit; font-size: 1.125rem; }
                    .ql-toolbar { border-color: ${isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'} !important; }
                    .ql-picker-label { color: ${isDark ? '#e5e7eb' : '#374151'} !important; }
                    .ql-stroke { stroke: ${isDark ? '#e5e7eb' : '#374151'} !important; }
                    .ql-fill { fill: ${isDark ? '#e5e7eb' : '#374151'} !important; }
                    .ql-editor { color: ${isDark ? '#e5e7eb' : '#1f2937'}; }
                  `}</style>
                  <ReactQuill 
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{'list': 'ordered'}, {'list': 'bullet'}],
                        ['link', 'image', 'code-block'],
                        ['clean']
                      ]
                    }}
                  />
                </div>
             ) : (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handlePaste}
                  placeholder={editorType === 'markdown' ? "支持 Markdown 语法与图片粘贴..." : "在此输入纯文本..."}
                  className={`w-full h-full resize-none outline-none bg-transparent text-lg leading-relaxed custom-scrollbar ${editorType === 'markdown' ? 'font-mono' : 'font-sans'} ${editorTextClass} ${placeholderClass}`}
                />
             )}

             {editorType === 'markdown' && (
               <button onClick={() => setShowImageInput(!showImageInput)} className={`absolute bottom-6 right-8 p-3 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`} title="插入图片链接">
                 <ImageIcon size={20} />
               </button>
             )}
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        {/* FIX: Ensure sidebar is strictly flex-col with scrollable middle and fixed footer to prevent clipping on small screens */}
        <div className={`w-full md:w-80 shrink-0 flex flex-col h-full ${sidebarClasses}`}>
           <div className="hidden md:flex justify-end p-4 shrink-0">
              <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-500'} ${theme.id === 'pixel' ? 'rounded-none border-2 border-black hover:bg-black hover:text-white' : ''}`}><X size={24} /></button>
           </div>
           
           {/* SCROLLABLE CONTENT */}
           <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                 <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${theme.textSecondary}`}><FolderOpen size={14} /> 存储位置</label>
                 <div className="relative">
                    <select value={folderId} onChange={(e) => setFolderId(e.target.value)} className={`w-full appearance-none outline-none p-3 rounded-xl cursor-pointer text-sm font-medium transition-all ${isDark ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' : 'bg-white border border-gray-200 text-gray-800 hover:border-blue-300'} ${theme.id === 'pixel' ? 'rounded-none border-2 border-black' : ''}`}>
                       {folders.filter(f => !f.isSystem).map(f => (<option key={f.id} value={f.id}>{f.name}</option>))}
                       <option value="all" disabled>默认文件夹</option>
                    </select>
                 </div>
              </div>
              <div className="space-y-3">
                 <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${theme.textSecondary}`}><Tag size={14} /> 标签</label>
                 <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="例如: 工作, 计划" className={`w-full p-3 rounded-xl outline-none text-sm transition-all ${isDark ? 'bg-white/5 border border-white/10 text-white focus:border-white/30' : 'bg-white border border-gray-200 text-gray-800 focus:border-blue-300'} ${theme.id === 'pixel' ? 'rounded-none border-2 border-black' : ''}`} />
              </div>
              
              {/* REDESIGNED REMINDER WIDGET */}
              <div className="space-y-3">
                  <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${theme.textSecondary}`}><Bell size={14} /> 提醒事项</label>
                  <button 
                    onClick={() => setShowDatePicker(true)}
                    className={`
                        w-full p-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between
                        ${isDark 
                            ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' 
                            : 'bg-white border border-gray-200 text-gray-800 hover:border-blue-300 hover:bg-gray-50'
                        } 
                        ${theme.id === 'pixel' ? 'rounded-none border-2 border-black' : ''}
                        ${theme.id === 'industrial' ? 'bg-[#EEEEEE] shadow-[inset_1px_1px_2px_#bebebe,inset_-1px_-1px_2px_#ffffff] border-none' : ''}
                        ${reminderDate ? (theme.id === 'cyberpunk' ? 'text-yellow-400 border-yellow-400' : 'text-blue-600 border-blue-200 bg-blue-50') : ''}
                    `} 
                  >
                      <span className="flex items-center gap-2">
                          {reminderDate ? <Clock size={16} /> : <CalendarIcon size={16} className="opacity-50" />}
                          {reminderDate ? format(reminderDate, 'MM/dd HH:mm') : <span className="opacity-50">设置提醒...</span>}
                      </span>
                      {reminderDate && <span className="text-[10px] font-bold uppercase opacity-60">EDIT</span>}
                  </button>
              </div>

              <div className="space-y-3">
                 <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${theme.textSecondary}`}><Check size={14} /> 标记颜色</label>
                 <div className="grid grid-cols-4 gap-3">
                    {COLOR_OPTIONS.map(opt => (
                       <button key={opt.key} type="button" onClick={() => setColor(opt.key)} className={`h-8 w-full rounded-lg transition-all relative flex items-center justify-center ${opt.bg} ${color === opt.key ? `ring-2 ring-offset-2 ${opt.ring} scale-110 z-10` : 'opacity-70 hover:opacity-100 hover:scale-105'} ${isDark ? 'ring-offset-black' : ''} ${theme.id === 'pixel' ? 'rounded-none border-2 border-black' : ''}`}>
                         {color === opt.key && <Check size={14} className={opt.key === 'white' ? 'text-black' : 'text-white'} />}
                       </button>
                    ))}
                 </div>
              </div>
              <div className={`space-y-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                 <label className="flex items-center justify-between cursor-pointer group">
                    <span className={`text-sm font-medium ${theme.textPrimary}`}>置顶便签</span>
                    <div className={`relative w-11 h-6 rounded-full transition-colors ${isPinned ? 'bg-blue-500' : (isDark ? 'bg-white/20' : 'bg-gray-300')} ${theme.id === 'pixel' ? 'rounded-none' : ''}`}>
                       <input type="checkbox" checked={isPinned} onChange={e => setIsPinned(e.target.checked)} className="hidden" />
                       <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${isPinned ? 'translate-x-5' : ''} ${theme.id === 'pixel' ? 'rounded-none' : ''}`} />
                    </div>
                 </label>
                 <label className="flex items-center justify-between cursor-pointer group">
                    <span className={`text-sm font-medium ${theme.textPrimary}`}>标记为重要</span>
                    <div className={`relative w-11 h-6 rounded-full transition-colors ${isImportant ? 'bg-orange-500' : (isDark ? 'bg-white/20' : 'bg-gray-300')} ${theme.id === 'pixel' ? 'rounded-none' : ''}`}>
                       <input type="checkbox" checked={isImportant} onChange={e => setIsImportant(e.target.checked)} className="hidden" />
                       <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${isImportant ? 'translate-x-5' : ''} ${theme.id === 'pixel' ? 'rounded-none' : ''}`} />
                    </div>
                 </label>
                 <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex flex-col"><span className={`text-sm font-medium ${theme.textPrimary}`}>密码保护</span></div>
                    <div className={`relative w-11 h-6 rounded-full transition-colors ${isLocked ? 'bg-blue-500' : (isDark ? 'bg-white/20' : 'bg-gray-300')} ${theme.id === 'pixel' ? 'rounded-none' : ''}`}>
                       <input type="checkbox" checked={isLocked} onChange={e => { setIsLocked(e.target.checked); if(!e.target.checked) setPassword(''); }} className="hidden" />
                       <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${isLocked ? 'translate-x-5' : ''} ${theme.id === 'pixel' ? 'rounded-none' : ''}`} />
                    </div>
                 </label>
                 {isLocked && (
                    <div className="animate-fade-in-down">
                       <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="设置访问密码..." className={`w-full p-2 text-sm border-b outline-none bg-transparent ${isDark ? 'border-white/30 text-white' : 'border-gray-300 text-black'}`} />
                    </div>
                 )}
              </div>
           </div>
           
           {/* FIXED FOOTER */}
           <div className={`p-6 mt-auto shrink-0 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} grid grid-cols-2 gap-3`}>
              <button onClick={onClose} className={`py-3 rounded-xl text-sm font-bold transition-all ${theme.buttonSecondary} ${theme.id === 'pixel' ? 'rounded-none' : ''}`}>取消</button>
              <button onClick={handleSubmit} className={`py-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 ${theme.buttonPrimary} ${theme.id === 'pixel' ? 'rounded-none' : ''}`}>{initialData ? '保存修改' : '创建便签'}</button>
           </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default NoteModal;
