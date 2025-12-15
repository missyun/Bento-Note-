
import React, { useState, useRef, MouseEvent } from 'react';
import { Check, Edit2, Trash2, Clock, Star, Lock, CheckCircle, Pin, PinOff, Copy, CheckCheck, Zap, Bell, CheckSquare, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format } from 'date-fns';
import { Note, ThemeStyle } from '../types';
import { NOTE_COLOR_TINTS } from '../constants';
import LazyImage from './LazyImage';

interface NoteCardProps {
  note: Note;
  index: number;
  theme: ThemeStyle;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onTogglePin?: (id: string) => void;
  className?: string; // New prop for custom class overrides
  compact?: boolean; // New prop for compact display in timeline
  // Selection Props
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

// Sub-component for Code Block with Copy functionality
const CodeBlock = ({ language, value, isDark, themeId }: { language: string, value: string, isDark: boolean, themeId: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isPixel = themeId === 'pixel';
  const isRetro = themeId === 'retro';

  return (
    <div className={`
      relative group my-3 overflow-hidden text-xs rounded-md
      ${isPixel ? 'border-2 border-black bg-white' : 
        isRetro ? 'border-2 border-[#8b4513] bg-[#fdf5e6]' :
        'border border-black/5 dark:border-white/10 shadow-sm'}
    `} onClick={(e) => e.stopPropagation()}>
      {/* Window Controls / Header */}
      {!isPixel && (
        <div className={`flex items-center justify-between px-3 py-1.5 ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'} border-b ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
           <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
           </div>
           <div className="text-[10px] opacity-60 font-mono uppercase font-bold tracking-wider">{language || 'code'}</div>
        </div>
      )}

      {/* Copy Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); handleCopy(); }}
        className={`
          absolute z-20 p-1.5 transition-all cursor-pointer
          ${isPixel 
             ? 'top-0 right-0 bg-black text-white hover:bg-gray-800' 
             : 'top-1.5 right-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50'}
          ${!isPixel && 'opacity-0 group-hover:opacity-100'}
        `}
        title="复制代码"
      >
        {isCopied ? <CheckCheck size={14} className="text-green-500" /> : <Copy size={14} />}
      </button>

      {/* Code Content */}
      <div className={`max-h-52 overflow-hidden relative`}>
        <SyntaxHighlighter
          style={isDark || isPixel ? vscDarkPlus : prism}
          language={language || 'text'}
          PreTag="div"
          customStyle={{ margin: 0, padding: '1rem', fontSize: '0.85rem', background: isPixel || isRetro ? 'transparent' : undefined }}
          codeTagProps={{ style: { fontFamily: 'monospace' } }}
        >
          {value}
        </SyntaxHighlighter>
        {/* Gradient Fade for long code */}
        <div className={`absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t ${isDark ? 'from-[#1e1e1e]' : 'from-white'} to-transparent pointer-events-none`}></div>
      </div>
    </div>
  );
};

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, index, theme, onView, onEdit, onDelete, onToggleComplete, onTogglePin, 
  className = '', compact = false,
  isSelectionMode = false, isSelected = false, onSelect
}) => {
  // State for 3D Parallax effect
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  // State for Deleting Animation
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State for Completion Pop Animation
  const [isPopping, setIsPopping] = useState(false);

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');

      return `${year}-${month}-${day} ${hour}:${minute}`;
    } catch (e) {
      return '';
    }
  };

  const getShortDate = (timestamp: number) => {
     try {
        const date = new Date(timestamp);
        return `${date.getFullYear()}.${(date.getMonth()+1).toString().padStart(2,'0')}.${date.getDate().toString().padStart(2,'0')}`;
     } catch (e) { return 'DATE'; }
  };

  // --- 3D Parallax Logic ---
  const enable3D = ['ios', 'glass', 'cyberpunk', 'isometric', 'warm', 'morandi'].includes(theme.id) && !compact;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enable3D || !cardRef.current || note.isCompleted || isSelectionMode) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    if (enable3D && !note.isCompleted && !isSelectionMode) setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (enable3D) {
      setIsHovering(false);
      setRotation({ x: 0, y: 0 });
    }
  };

  // --- Animation Handlers ---
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(note.id);
    }, 300);
  };

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 300);
    onToggleComplete(note.id);
  };
  
  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTogglePin) onTogglePin(note.id);
  }

  const handleCardClick = () => {
    if (isSelectionMode && onSelect) {
      onSelect(note.id);
    } else {
      onView(note);
    }
  };

  // --- Styles Logic ---
  const isDark = theme.id === 'glass' || theme.id === 'cyberpunk';
  const isMinimal = theme.id === 'minimal';
  const hasColor = note.color !== 'white';

  const cardBackground = (isMinimal && !isHovering) ? 'bg-white' : (!isDark && hasColor) 
    ? NOTE_COLOR_TINTS[note.color] 
    : theme.cardBg;

  const getImageStyle = () => {
    switch (theme.id) {
      case 'pixel': return 'border-2 border-black rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]';
      case 'cyberpunk': return 'border border-cyan-500/50 shadow-[0_0_5px_rgba(0,255,255,0.2)] rounded-none opacity-90 hover:opacity-100';
      case 'glass': return 'border border-white/20 shadow-lg rounded-xl';
      case 'sketch': return 'border-2 border-black rounded-[255px_15px_225px_15px/15px_225px_15px_255px] p-1 bg-white';
      case 'retro': return 'border-4 border-double border-[#8b4513] rounded-sm sepia-[.3]';
      case 'isometric': return 'border-2 border-black shadow-[4px_4px_0px_black] rounded-md';
      case '3d': return 'rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)] p-1 bg-white/50';
      case 'warm': return 'rounded-[2rem] shadow-[inset_4px_4px_10px_rgba(255,255,255,0.5),inset_-4px_-4px_10px_rgba(0,0,0,0.05),8px_8px_20px_rgba(0,0,0,0.05)] border-none';
      case 'industrial': return 'rounded-[12px] shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff] border-none bg-[#F4F4F4]';
      case 'minimal': return 'border border-black rounded-none filter grayscale contrast-125';
      case 'morandi': return 'rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white/50';
      default: return 'rounded-xl border border-gray-200/50';
    }
  };

  const getPinColor = () => {
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];
    const index = note.id.charCodeAt(note.id.length - 1) % colors.length;
    return colors[index];
  };
  const pinColor = getPinColor();

  const renderStamp = () => {
    if (!note.isCompleted) return null;
    const dateStr = getShortDate(note.updatedAt);

    switch(theme.id) {
      case 'sketch':
        return (
          <div className="absolute bottom-6 right-6 transform -rotate-12 opacity-90 pointer-events-none select-none z-0 mix-blend-multiply">
            <div className="border-4 border-red-600 rounded-full w-28 h-28 flex flex-col items-center justify-center p-2 text-red-600 font-hand" style={{maskImage: 'url(https://www.transparenttextures.com/patterns/dust.png)'}}>
              <div className="border border-red-600 rounded-full w-full h-full flex flex-col items-center justify-center border-dashed">
                 <span className="text-sm font-bold border-b-2 border-red-600 pb-1 mb-1 tracking-widest">APPROVED</span>
                 <span className="text-xs font-bold">{dateStr}</span>
              </div>
            </div>
          </div>
        );
      case 'cyberpunk':
        return (
           <div className="absolute bottom-6 right-6 transform rotate-6 opacity-90 pointer-events-none select-none z-0">
              <div className="border-2 border-red-500 p-2 text-red-500 font-mono font-bold tracking-widest text-xl bg-black/80 shadow-[0_0_15px_red] animate-pulse">
                 [ TERMINATED ]
              </div>
           </div>
        );
      case 'pixel':
         return (
           <div className="absolute bottom-6 right-6 opacity-100 pointer-events-none select-none z-0">
              <div className="bg-black text-white p-2 font-mono text-sm border-4 border-gray-400 shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]">
                 MISSION<br/>COMPLETE
              </div>
           </div>
         );
      case 'minimal':
          return (
             <div className="absolute top-0 right-0 p-2 bg-black text-white text-[10px] font-bold uppercase pointer-events-none z-10">
                COMPLETED
             </div>
          );
      case 'morandi':
          return (
             <div className="absolute bottom-0 right-0 p-4 opacity-30 pointer-events-none">
                <CheckCircle size={80} className="text-[#A8DADC]" />
             </div>
          );
      default: 
        return (
          <div className="absolute bottom-[-10px] right-[-10px] z-0 pointer-events-none transition-transform duration-500 opacity-20 rotate-[-15deg]">
             <CheckCircle size={120} className="text-green-600" />
          </div>
        );
    }
  };

  const renderLockedContent = () => {
     return (
          <div className={`flex flex-col items-center justify-center h-24 select-none ${theme.id === 'pixel' ? 'bg-gray-100 border-4 border-black' : theme.id === 'minimal' ? 'border border-black bg-gray-50' : theme.id === 'industrial' ? 'shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff] bg-[#EEEEEE] rounded-lg' : 'bg-gray-100/50 rounded-xl border border-gray-200'} ${theme.id === 'morandi' ? 'bg-white/40 border border-white/50 text-[#6D6875]' : ''}`}>
             <Lock size={20} className="text-gray-400 mb-2" />
             <div className="text-gray-400 text-xs font-bold">已加密内容</div>
             <div className="text-gray-400 text-[10px] mt-1">点击解锁查看</div>
          </div>
        );
  };

  const renderContent = () => {
    if (note.isLocked) return renderLockedContent();

    if (note.editorType === 'rich') {
      return (
        <div 
          className={`rich-text-preview ${theme.fontFamily}`}
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      );
    }

    if (note.editorType === 'markdown' || note.isMarkdown) {
      return (
        <div className="markdown-preview">
          <ReactMarkdown
            remarkPlugins={[remarkBreaks]}
            components={{
              a: ({node, ...props}) => (
                <span className="text-blue-500 underline pointer-events-none">Link</span>
              ),
              img: ({node, src, alt, ...props}) => (
                <div className="my-2" onClick={(e) => e.stopPropagation()}>
                  <LazyImage 
                    src={src} 
                    alt={alt}
                    className={`w-full max-h-32 object-cover ${getImageStyle()}`}
                  />
                </div>
              ),
              p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />,
              code: ({node, inline, className, children, ...props}: any) => {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <CodeBlock 
                    language={match[1]} 
                    value={String(children).replace(/\n$/, '')} 
                    isDark={isDark} 
                    themeId={theme.id}
                  />
                ) : (
                  <code className={`
                    px-1 py-0.5 text-xs rounded font-mono
                    ${theme.id === 'pixel' ? 'bg-gray-200 text-black border border-black rounded-none font-bold' : ''}
                    ${theme.id === 'minimal' ? 'bg-black text-white border border-black rounded-none' : ''}
                    ${theme.id === 'retro' ? 'bg-[#e6dcc3] text-[#5c4033] border border-[#8b4513] rounded-sm' : ''}
                    ${theme.id === 'glass' ? 'bg-white/20' : ''} 
                    ${!['pixel', 'retro', 'glass', 'minimal'].includes(theme.id) ? 'bg-gray-100 dark:bg-gray-800' : ''}
                  `} {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {note.content}
          </ReactMarkdown>
        </div>
      );
    }

    return (
      <div className="whitespace-pre-wrap font-sans text-sm">{note.content}</div>
    );
  };

  const isPhysicalTheme = ['sketch', 'retro', 'industrial', 'pixel'].includes(theme.id);
  const showExternalPin = note.isPinned && isPhysicalTheme;
  const showInternalPin = note.isPinned && !isPhysicalTheme;
  const isExpired = note.reminderTime && note.reminderTime < Date.now();

  // If compact mode is on, we ensure h-auto is used via overriding classes
  const containerHeightClass = className && className.includes('h-') ? '' : 'h-full';

  return (
    <div
      style={{ 
        animationDelay: `${index * 0.05}s`,
        opacity: isDeleting ? 0 : 1,
        transform: isDeleting ? 'scale(0.95) translateY(10px)' : 'scale(1) translateY(0)',
        pointerEvents: isDeleting ? 'none' : 'auto'
      }}
      className={`animate-fade-in-up transition-all duration-300 ease-in-out relative ${containerHeightClass} ${className}`}
    >
      {renderStamp()}

      {/* Checkbox for Selection Mode */}
      {isSelectionMode && (
         <div className="absolute top-4 right-4 z-50 pointer-events-none">
            {isSelected ? (
                <div className={`
                    w-6 h-6 flex items-center justify-center rounded-md
                    ${theme.id === 'pixel' ? 'bg-black border-2 border-black text-white rounded-none' : 'bg-blue-500 text-white'}
                `}>
                    <Check size={16} />
                </div>
            ) : (
                <div className={`
                    w-6 h-6 rounded-md border-2
                    ${theme.id === 'pixel' ? 'border-black bg-white rounded-none' : 'border-gray-300 bg-white/50'}
                `}></div>
            )}
         </div>
      )}

      {showExternalPin && !compact && (
         <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-30 pointer-events-none">
             {theme.id === 'sketch' ? (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 fill-red-600 drop-shadow-md">
                  <path d="M12 17v5" stroke="black" />
                  <path d="M9 10.9V17h6v-6.1" stroke="black" fill="#e5e5e5" />
                  <circle cx="12" cy="7" r="4" stroke="black" fill="#dc2626" />
                </svg>
             ) : theme.id === 'pixel' ? (
                 <div className="bg-black text-white p-1 border-2 border-white shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] text-[10px] font-mono" style={{backgroundColor: pinColor}}>PIN</div>
             ) : (
                <div className="relative group">
                   <div className="absolute top-3 left-1 w-3 h-3 bg-black/20 rounded-full blur-[2px] transform skew-x-12"></div>
                   <Pin size={24} color="#333" fill={pinColor} className="transform -rotate-12 drop-shadow-sm text-gray-700" strokeWidth={1.5} />
                </div>
             )}
         </div>
      )}

      {theme.id === 'sketch' && !note.isPinned && !compact && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none drop-shadow-md">
           <div className="w-16 h-4 bg-yellow-100/80 rotate-2 border border-yellow-200/50 shadow-sm"></div>
        </div>
      )}

      <div 
        className="h-full transition-transform duration-150 active:scale-[0.98]"
        onClick={handleCardClick}
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ 
            transform: isHovering 
              ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.02, 1.02, 1.02) translateY(-8px)`
              : 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1) translateY(0)',
          }}
          className={`
            group flex flex-col relative overflow-hidden h-full
            ${compact ? 'p-5 min-h-0' : 'p-6 min-h-[200px]'}
            transition-all duration-500 ease-out cursor-pointer
            ${theme.cardRadius} ${theme.fontFamily}
            ${theme.id === 'sketch' ? 'pt-8' : ''} 
            ${isDeleting && theme.id === 'cyberpunk' ? 'animate-glitch' : ''}
            ${note.isCompleted 
              ? `opacity-70 hover:opacity-90 ${theme.id === 'pixel' ? 'bg-gray-200 border-4 border-gray-400 grayscale' : theme.id === 'cyberpunk' ? 'bg-black/20 border border-gray-800 grayscale-[0.8]' : theme.id === 'minimal' ? 'bg-gray-100 border border-gray-300 grayscale opacity-50' : 'bg-gray-50 border border-transparent grayscale-[0.5]'}` 
              : `${cardBackground} ${theme.cardBorder} ${theme.cardShadow} ${theme.cardHover}`
            }
            ${theme.id === 'industrial' ? 'bg-[#F4F4F4] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] hover:shadow-[3px_3px_6px_#bebebe,-3px_-3px_6px_#ffffff] hover:translate-y-[1px] active:shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff]' : ''}
            ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2 scale-[0.98]' : ''}
          `}
        >
          
          {(note.isLocked || note.isImportant || showInternalPin || note.reminderTime) && !note.isCompleted && (
             <div className="flex flex-wrap items-center gap-2 mb-3 relative z-10 pr-6">
                {showInternalPin && (
                   <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                      ${theme.id === 'cyberpunk' ? 'border border-cyan-500 text-cyan-400 bg-cyan-950/30 shadow-[0_0_5px_cyan]' : ''}
                      ${theme.id === 'minimal' ? 'bg-black text-white border border-black' : ''}
                      ${theme.id === 'glass' ? 'bg-white/20 text-white backdrop-blur-md' : ''}
                      ${theme.id === 'morandi' ? 'bg-[#A8DADC]/30 text-[#4A4E69]' : ''}
                      ${!['cyberpunk', 'minimal', 'glass', 'morandi'].includes(theme.id) ? 'bg-blue-100 text-blue-600' : ''}
                   `}>
                      <Pin size={10} className="fill-current" />
                      <span>置顶</span>
                   </div>
                )}
                {note.isLocked && (
                   <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                      ${theme.id === 'cyberpunk' ? 'border border-red-500 text-red-500 bg-red-950/30 animate-pulse' : ''}
                      ${theme.id === 'pixel' ? 'bg-red-600 text-white border border-black' : ''}
                      ${theme.id === 'minimal' ? 'bg-gray-200 text-black border border-black' : ''}
                      ${theme.id === 'glass' ? 'bg-red-500/20 text-red-100 backdrop-blur-md' : ''}
                      ${theme.id === 'morandi' ? 'bg-[#C9ADA7]/30 text-[#6D6875]' : ''}
                      ${!['cyberpunk', 'pixel', 'minimal', 'glass', 'morandi'].includes(theme.id) ? 'bg-red-100 text-red-600' : ''}
                   `}>
                      <Lock size={10} />
                      <span>加密</span>
                   </div>
                )}
                {note.isImportant && (
                   <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                      ${theme.id === 'cyberpunk' ? 'border border-yellow-400 text-yellow-400 bg-yellow-950/30' : ''}
                      ${theme.id === 'pixel' ? 'bg-yellow-400 text-black border border-black' : ''}
                      ${theme.id === 'minimal' ? 'border border-black text-black' : ''}
                      ${theme.id === 'glass' ? 'bg-yellow-500/20 text-yellow-100 backdrop-blur-md' : ''}
                      ${theme.id === 'morandi' ? 'bg-[#F2E9E4] text-[#9A8C98]' : ''}
                      ${!['cyberpunk', 'pixel', 'minimal', 'glass', 'morandi'].includes(theme.id) ? 'bg-orange-100 text-orange-600' : ''}
                   `}>
                      <Zap size={10} className="fill-current" />
                      <span>重要</span>
                   </div>
                )}
                {note.reminderTime && (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                      ${isExpired 
                         ? (theme.id === 'pixel' ? 'bg-red-500 text-white border border-black' : 'bg-red-100 text-red-600') 
                         : (theme.id === 'pixel' ? 'bg-blue-300 text-black border border-black' : 'bg-blue-100 text-blue-600')}
                    `}>
                        <Bell size={10} />
                        <span>{isExpired ? '已过期' : format(new Date(note.reminderTime), 'MM/dd HH:mm')}</span>
                    </div>
                )}
             </div>
          )}

          <div className="mb-2 pr-2 relative z-10">
            <h3 className={`
              text-lg font-bold leading-snug line-clamp-2 
              ${theme.textPrimary} 
            `}>
              {/* Wrapped in span for proper strikethrough length */}
              <span className={`strikethrough-anim ${note.isCompleted ? 'strikethrough-active text-gray-500' : ''}`}>
                 {note.title}
              </span>
            </h3>
          </div>

          <div className={`flex-grow mb-2 relative overflow-hidden z-10 ${theme.textSecondary}`}>
            <div className={`line-clamp-[4] break-words`}>
               {renderContent()}
            </div>
          </div>

          <div className={`mt-auto pt-4 flex flex-col gap-3 border-t z-10 
             ${theme.id === 'glass' || theme.id === 'cyberpunk' ? 'border-white/10' : 
               theme.id === 'minimal' ? 'border-black' :
               theme.id === 'sketch' || theme.id === 'isometric' ? 'border-black' : 
               theme.id === 'retro' ? 'border-[#8b4513]/20' : 
               theme.id === 'morandi' ? 'border-white/30' :
               'border-black/5'}
          `}>
            
            {(note.tags.length > 0) && (
             <div className="flex flex-wrap gap-1.5 relative z-10">
              {note.tags.slice(0, 3).map(tag => (
                <span key={tag} className={`
                  px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold truncate max-w-[80px]
                  ${theme.id === 'pixel' ? 'bg-black text-white' : ''}
                  ${theme.id === 'cyberpunk' ? 'border border-pink-500/50 text-pink-500 bg-pink-500/10' : ''}
                  ${theme.id === 'ios' ? 'bg-gray-100 text-gray-500 rounded-md' : ''}
                  ${theme.id === 'glass' ? 'bg-white/10 text-white/80 border border-white/10 rounded-md' : ''}
                  ${theme.id === 'warm' ? 'bg-[#EBE5D5] text-[#8A817C] rounded-md' : ''}
                  ${theme.id === 'industrial' ? 'bg-[#EEEEEE] text-[#666] shadow-[inset_1px_1px_2px_#bebebe,inset_-1px_-1px_2px_#ffffff] rounded-sm' : ''}
                  ${theme.id === 'minimal' ? 'bg-white text-black border border-black rounded-none hover:bg-black hover:text-white transition-colors' : ''}
                  ${theme.id === 'morandi' ? 'bg-white/50 text-[#6D6875] border border-white/40' : ''}
                  ${!['pixel', 'cyberpunk', 'ios', 'glass', 'warm', 'industrial', 'minimal', 'morandi'].includes(theme.id) ? 'bg-gray-100 text-gray-600 rounded-md' : ''}
                `}>
                  #{tag}
                </span>
              ))}
              {note.tags.length > 3 && (
                 <span className="text-[10px] opacity-50 self-center">+{note.tags.length - 3}</span>
              )}
             </div>
            )}

            {!compact && !isSelectionMode && (
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 text-[10px] ${theme.textMuted}`}>
                  <Clock size={12} />
                  {formatDate(note.createdAt)}
                </div>

                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                  {onTogglePin && (
                      <button
                        onClick={handlePinClick}
                        className={`p-1.5 transition-all hover:scale-110 active:scale-95 ${theme.id === 'minimal' ? 'hover:bg-black hover:text-white' : 'hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded'}`}
                        title={note.isPinned ? "取消置顶" : "置顶便签"}
                      >
                        {note.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                      </button>
                  )}
                  <button
                    onClick={handleCompleteClick}
                    className={`p-1.5 transition-all hover:scale-110 active:scale-95 ${theme.id === 'minimal' ? 'hover:bg-black hover:text-white' : 'hover:bg-green-50 text-gray-400 hover:text-green-500 rounded'}`}
                    title={note.isCompleted ? "标记为未完成" : "标记为完成"}
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(note); }}
                    className={`p-1.5 transition-all hover:scale-110 active:scale-95 ${theme.id === 'minimal' ? 'hover:bg-black hover:text-white' : 'hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded'}`}
                    title="编辑"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className={`p-1.5 transition-all hover:scale-110 active:scale-95 ${theme.id === 'minimal' ? 'hover:bg-black hover:text-white' : 'hover:bg-red-50 text-gray-400 hover:text-red-500 rounded'}`}
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
