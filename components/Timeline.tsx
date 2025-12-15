import React, { useState, useMemo, useRef, useEffect } from 'react';
import Calendar from 'react-calendar';
import { Note, ThemeStyle } from '../types';
import { format, isSameDay, isToday, addDays, differenceInDays } from 'date-fns';
import { 
  Clock, Calendar as CalendarIcon, StickyNote, ChevronRight, 
  Lock, ShieldCheck, RotateCcw, Sparkles, Flame, RefreshCw, 
  History, Trophy, Zap, MapPin, Code, Image as ImageIcon
} from 'lucide-react';
import NoteCard from './NoteCard';

interface TimelineProps {
  notes: Note[];
  theme: ThemeStyle;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

// --- 1. THEME CONFIGURATION FACTORY ---
const getThemeConfig = (themeId: string) => {
  const isDark = ['glass', 'cyberpunk'].includes(themeId);
  
  const base = {
    container: 'bg-white rounded-2xl shadow-sm border border-gray-100',
    header: 'bg-gray-50/80 backdrop-blur-md border-b border-gray-100',
    item: 'bg-white hover:bg-gray-50 border border-gray-100 rounded-xl transition-all duration-300',
    connector: 'bg-gray-200',
    dot: 'bg-white border-2 border-blue-500',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-500',
    accent: 'text-blue-600',
    calendarTile: 'hover:bg-gray-100 rounded-lg text-gray-700',
    calendarActive: 'bg-blue-600 text-white shadow-md',
    heatmapLevel: ['bg-gray-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-600', 'bg-blue-800'],
    heatmapShape: 'rounded-sm',
  };

  switch (themeId) {
    case 'morandi':
      return {
        ...base,
        container: 'bg-white/40 backdrop-blur-xl border border-white/20 shadow-xl rounded-[24px]',
        header: 'bg-white/30 backdrop-blur-md border-b border-white/20 text-[#4A4E69]',
        item: 'bg-white/40 border border-white/30 hover:bg-white/60 hover:shadow-[0_8px_20px_rgba(74,78,105,0.08)] rounded-[20px] transition-all duration-300',
        connector: 'bg-[#9A8C98]/40',
        dot: 'bg-[#F2E9E4] border-2 border-[#9A8C98]',
        textPrimary: 'text-[#4A4E69]',
        textSecondary: 'text-[#9A8C98]',
        accent: 'text-[#4A4E69]',
        calendarTile: 'text-[#6D6875] hover:bg-white/50 rounded-[12px]',
        calendarActive: 'bg-[#9A8C98] text-white shadow-md rounded-[12px]',
        heatmapLevel: ['bg-white/30', 'bg-[#E8D5C4]', 'bg-[#D8E2DC]', 'bg-[#A8DADC]', 'bg-[#4A4E69]'],
        heatmapShape: 'rounded-full',
      };
    case 'cyberpunk':
      return {
        ...base,
        container: 'bg-black/80 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,255,255,0.1)] rounded-none clip-path-cyber',
        header: 'bg-black/90 border-b border-cyan-500/30 text-cyan-400',
        item: 'bg-black/60 border border-cyan-900/50 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.2)] rounded-none transition-all duration-200 group',
        connector: 'bg-cyan-900',
        dot: 'bg-black border border-cyan-400 shadow-[0_0_5px_cyan]',
        textPrimary: 'text-cyan-100',
        textSecondary: 'text-cyan-700',
        accent: 'text-yellow-400',
        calendarTile: 'text-cyan-600 hover:bg-cyan-900/30 hover:text-cyan-300 rounded-none',
        calendarActive: 'bg-cyan-600 text-black shadow-[0_0_10px_cyan] rounded-none font-bold',
        heatmapLevel: ['bg-cyan-900/20', 'bg-cyan-900/60', 'bg-cyan-700', 'bg-cyan-500', 'bg-yellow-400 shadow-[0_0_5px_yellow]'],
        heatmapShape: 'rounded-full',
      };
    case 'pixel':
      return {
        ...base,
        container: 'bg-white border-4 border-black shadow-[8px_8px_0_0_black] rounded-none',
        header: 'bg-yellow-300 border-b-4 border-black text-black',
        item: 'bg-white border-2 border-black shadow-[4px_4px_0_0_black] rounded-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-0',
        connector: 'bg-black border-l-2 border-dashed border-black w-1 bg-transparent',
        dot: 'bg-white border-2 border-black w-4 h-4 rounded-none',
        textPrimary: 'text-black font-mono font-bold',
        textSecondary: 'text-gray-600 font-mono',
        accent: 'text-red-600',
        calendarTile: 'text-black hover:bg-black hover:text-white rounded-none font-mono',
        calendarActive: 'bg-black text-white rounded-none',
        heatmapLevel: ['bg-gray-200', 'bg-gray-400', 'bg-gray-600', 'bg-gray-800', 'bg-black'],
        heatmapShape: 'rounded-none',
      };
    case 'glass':
      return {
        ...base,
        container: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2rem]',
        header: 'bg-white/5 border-b border-white/10 text-white',
        item: 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 rounded-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]',
        connector: 'bg-gradient-to-b from-white/20 to-transparent',
        dot: 'bg-white/20 border border-white/50 backdrop-blur-md',
        textPrimary: 'text-white',
        textSecondary: 'text-blue-200/60',
        accent: 'text-pink-300',
        calendarTile: 'text-white/70 hover:bg-white/10 rounded-xl',
        calendarActive: 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] rounded-xl font-bold',
        heatmapLevel: ['bg-white/5', 'bg-white/20', 'bg-white/40', 'bg-white/60', 'bg-white shadow-[0_0_10px_white]'],
        heatmapShape: 'rounded-sm',
      };
    case 'industrial':
        return {
            ...base,
            container: 'bg-[#F4F4F4] shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff] rounded-[16px] border-none',
            header: 'bg-[#E5E5E5] border-b border-gray-300 text-[#333]',
            item: 'bg-[#F4F4F4] shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] hover:shadow-[2px_2px_5px_#bebebe,-2px_-2px_5px_#ffffff] active:shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff] active:translate-y-[2px] rounded-[12px] border-none transition-all duration-200',
            connector: 'bg-gray-300',
            dot: 'bg-[#EA580C] border-2 border-[#F4F4F4] shadow-sm',
            textPrimary: 'text-[#222]',
            textSecondary: 'text-[#666]',
            accent: 'text-[#EA580C]',
            calendarTile: 'text-[#555] hover:bg-[#e0e0e0] rounded-md',
            calendarActive: 'bg-[#EA580C] text-white shadow-inner rounded-md',
            heatmapLevel: ['bg-[#e0e0e0]', 'bg-[#fed7aa]', 'bg-[#fdba74]', 'bg-[#fb923c]', 'bg-[#ea580c]'],
            heatmapShape: 'rounded-[2px]',
        }
    default: // ios / minimal / warm
      return base;
  }
};

// --- 2. ACTIVITY HEATMAP (GitHub Style) ---
const ActivityHeatmap: React.FC<{ notes: Note[], theme: ThemeStyle, config: any, onDateClick: (date: Date) => void }> = ({ notes, theme, config, onDateClick }) => {
  const weeksToDisplay = 17;
  const [hoveredData, setHoveredData] = useState<{ date: Date, count: number } | null>(null);
  
  const heatmapData = useMemo(() => {
    const today = new Date();
    const daysToSubtract = (weeksToDisplay * 7) + today.getDay();
    const startDate = addDays(today, -daysToSubtract + 1);

    const data: { date: Date, count: number, level: number }[] = [];
    const noteCounts: Record<string, number> = {};

    notes.forEach(note => {
      const key = format(note.createdAt, 'yyyy-MM-dd');
      noteCounts[key] = (noteCounts[key] || 0) + 1;
    });

    for (let i = 0; i < weeksToDisplay * 7; i++) {
      const currentDate = addDays(startDate, i);
      const key = format(currentDate, 'yyyy-MM-dd');
      const count = noteCounts[key] || 0;
      
      let level = 0;
      if (count > 0) level = 1;
      if (count > 2) level = 2;
      if (count > 4) level = 3;
      if (count > 6) level = 4;
      
      data.push({ date: currentDate, count, level });
    }
    return data;
  }, [notes]);

  const weeks = useMemo(() => {
    const cols = [];
    let currentWeek: typeof heatmapData = [];
    
    heatmapData.forEach((day, index) => {
       currentWeek.push(day);
       if (currentWeek.length === 7) {
          cols.push(currentWeek);
          currentWeek = [];
       }
    });
    if (currentWeek.length > 0) cols.push(currentWeek);
    return cols;
  }, [heatmapData]);

  return (
    <div className={`p-6 transition-all duration-500 mb-6 ${config.container}`}>
      <div className={`flex items-center justify-between mb-4 min-h-[1.5em]`}>
        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${config.textSecondary}`}>
          {theme.id === 'pixel' ? <Trophy size={14} /> : theme.id === 'cyberpunk' ? <Zap size={14} className="text-yellow-400" /> : <Flame size={14} />}
          <span>创作热力</span>
        </div>
        <div className={`text-[10px] ${config.textSecondary} transition-opacity duration-200 ${hoveredData ? 'opacity-100 font-bold' : 'opacity-50'}`}>
           {hoveredData 
             ? `${format(hoveredData.date, 'yyyy-MM-dd')} · ${hoveredData.count} 条记录`
             : '近 4 个月'
           }
        </div>
      </div>
      
      <div className="flex gap-1.5 overflow-x-auto pb-2 custom-scrollbar" onMouseLeave={() => setHoveredData(null)}>
        {weeks.map((week, wIndex) => (
          <div key={wIndex} className="flex flex-col gap-1.5 shrink-0">
            {week.map((day, dIndex) => (
              <div 
                key={dIndex}
                className={`
                  w-3 h-3 transition-all duration-300 relative group cursor-pointer
                  ${config.heatmapShape}
                  ${config.heatmapLevel[day.level]}
                  ${day.level > 0 ? 'hover:scale-125 z-10' : ''}
                `}
                onMouseEnter={() => setHoveredData({ date: day.date, count: day.count })}
                onClick={() => onDateClick(day.date)}
              />
            ))}
          </div>
        ))}
      </div>
      
      <div className={`flex items-center justify-end gap-2 mt-2 text-[10px] ${config.textSecondary}`}>
         <span>少</span>
         <div className={`w-2.5 h-2.5 ${config.heatmapLevel[0]} ${config.heatmapShape}`} />
         <div className={`w-2.5 h-2.5 ${config.heatmapLevel[2]} ${config.heatmapShape}`} />
         <div className={`w-2.5 h-2.5 ${config.heatmapLevel[4]} ${config.heatmapShape}`} />
         <span>多</span>
      </div>
    </div>
  );
};

// --- 3. TIME CAPSULE (Compact Banner Version) ---
interface TimeCapsuleProps {
  notes: Note[];
  theme: ThemeStyle;
  config: any;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const TimeCapsule: React.FC<TimeCapsuleProps> = ({ notes, theme, config, onView, onEdit, onDelete, onToggleComplete, onTogglePin }) => {
  const [capsuleNote, setCapsuleNote] = useState<Note | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const rollDice = () => {
     if (notes.length === 0) return;
     
     setIsSpinning(true);
     setTimeout(() => setIsSpinning(false), 600);

     const today = new Date();
     
     // Helper: Check if date matches MM-DD but not YYYY
     const isHistory = (n: Note) => {
        const d = new Date(n.createdAt);
        return d.getMonth() === today.getMonth() && d.getDate() === today.getDate() && d.getFullYear() !== today.getFullYear();
     };

     // Helper: Check if older than 14 days (Relaxed from 30 to ensure pool size)
     const isOld = (n: Note) => differenceInDays(today, new Date(n.createdAt)) > 14;

     const historyNotes = notes.filter(isHistory);
     const oldNotes = notes.filter(isOld);
     
     // 1. Determine the candidate pool
     let pool = notes; // Default to all

     // Prefer History if we have multiple options there
     if (historyNotes.length > 1) {
        pool = historyNotes;
     } 
     // Else prefer Old notes if we have enough for variety
     else if (oldNotes.length > 3) { 
        pool = oldNotes;
     }
     
     // 2. Ensure we pick a DIFFERENT note if possible
     let candidates = pool;
     if (capsuleNote) {
        // Try to filter out current note from the chosen pool
        const differentNotes = pool.filter(n => n.id !== capsuleNote.id);
        
        if (differentNotes.length > 0) {
           candidates = differentNotes;
        } else {
           // CRITICAL FIX: If the chosen pool (e.g. History) became too small (only contains the current note),
           // we MUST expand our search to ALL notes to ensure the user sees a change.
           const globalDifferent = notes.filter(n => n.id !== capsuleNote.id);
           if (globalDifferent.length > 0) {
              candidates = globalDifferent;
           }
           // If candidates is still empty here, it means the user literally only has 1 note total.
        }
     }

     if (candidates.length > 0) {
        const winner = candidates[Math.floor(Math.random() * candidates.length)];
        setCapsuleNote(winner);
     }
  };

  // Initialize once notes are loaded
  useEffect(() => {
     if (notes.length > 0 && !capsuleNote) {
        rollDice();
     }
  }, [notes.length]);

  if (!capsuleNote) return null;

  const isAnniversary = differenceInDays(new Date(), new Date(capsuleNote.createdAt)) > 365;
  const dateStr = format(capsuleNote.createdAt, 'yyyy-MM-dd');

  // Compact Style Generator based on Theme
  const getCapsuleStyle = (id: string) => {
    switch(id) {
        case 'pixel': return {
            wrapper: 'bg-white border-4 border-black shadow-[4px_4px_0_0_black] rounded-none hover:translate-y-1 hover:shadow-none',
            icon: 'bg-black text-white',
            text: 'text-black',
            btn: 'hover:bg-gray-200 rounded-none'
        };
        case 'cyberpunk': return {
            wrapper: 'bg-black/80 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.15)] rounded-none hover:border-yellow-400 group',
            icon: 'bg-cyan-900/30 text-cyan-400 border border-cyan-500',
            text: 'text-cyan-100',
            btn: 'text-cyan-400 hover:bg-cyan-900/50 rounded-none'
        };
        case 'glass': return {
            wrapper: 'bg-white/10 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/15',
            icon: 'bg-white/20 text-white',
            text: 'text-white',
            btn: 'text-white/70 hover:bg-white/20 hover:text-white'
        };
        case 'industrial': return {
            wrapper: 'bg-[#F4F4F4] shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff] rounded-xl hover:shadow-none hover:border hover:border-gray-300',
            icon: 'bg-[#EA580C] text-white',
            text: 'text-[#333]',
            btn: 'text-[#666] hover:text-[#333]'
        }
        // Default (iOS, Warm, Minimal, etc)
        default: return {
            wrapper: 'bg-white border border-gray-100 shadow-sm hover:shadow-md rounded-xl',
            icon: 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md shadow-purple-200',
            text: 'text-slate-700',
            btn: 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
        };
    }
  };

  const styles = getCapsuleStyle(theme.id);

  return (
    <div className="mb-8 animate-fade-in-down">
       <div 
         onClick={() => onView(capsuleNote!)}
         className={`relative overflow-hidden cursor-pointer group transition-all duration-300 ${styles.wrapper}`}
       >
          <div className="flex items-center justify-between p-4 gap-4">
             <div className="flex items-center gap-4 min-w-0">
                {/* Icon */}
                <div className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-transform duration-500 ${isSpinning ? 'rotate-180 scale-90' : 'group-hover:scale-110'} ${styles.icon}`}>
                   <Sparkles size={20} className={isSpinning ? 'animate-spin' : ''} />
                </div>
                
                {/* Text Info */}
                <div className="flex flex-col min-w-0">
                   <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider opacity-80 ${styles.text} ${theme.id === 'cyberpunk' ? 'text-yellow-400' : 'text-blue-500'}`}>
                         {isAnniversary ? '那年今日' : '时光胶囊'}
                      </span>
                      <span className={`text-[10px] opacity-60 ${styles.text}`}>
                         · {dateStr}
                      </span>
                   </div>
                   <h3 className={`font-bold text-sm truncate pr-2 ${styles.text}`}>
                      {capsuleNote.title}
                   </h3>
                </div>
             </div>

             {/* Refresh Action */}
             <button 
                onClick={(e) => { e.stopPropagation(); rollDice(); }}
                className={`p-2 rounded-full transition-all hover:rotate-180 active:scale-90 shrink-0 opacity-0 group-hover:opacity-100 ${styles.btn}`}
                title="换一张"
             >
                <RefreshCw size={16} />
             </button>
          </div>
          
          {/* Optional Gloss Effect for some themes */}
          {(theme.id === 'glass' || theme.id === 'ios') && (
             <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent pointer-events-none opacity-50" />
          )}
       </div>
    </div>
  );
};

// --- 4. TIMELINE ITEM (Horizontal Layout) ---
const TimelineItem: React.FC<{ 
  note: Note, 
  theme: ThemeStyle, 
  config: any, 
  onView: (note: Note) => void,
  onEdit: (note: Note) => void,
  onDelete: (id: string) => void,
  onToggleComplete: (id: string) => void,
  onTogglePin: (id: string) => void
}> = ({ note, theme, config, onView, onEdit, onDelete, onToggleComplete, onTogglePin }) => {
   
   return (
      <div className="flex gap-4 group mb-4 last:mb-0 relative">
         {/* 1. Time Column - Left Aligned, Bold */}
         <div className={`w-14 flex-shrink-0 text-right pt-3 font-bold font-mono text-lg opacity-80 leading-none ${config.textPrimary}`}>
            {format(note.createdAt, 'HH:mm')}
         </div>

         {/* 2. Axis - Center */}
         <div className="relative flex flex-col items-center w-6 flex-shrink-0">
            {/* Dot */}
            <div className={`w-3 h-3 rounded-full border-2 z-10 mt-3 transition-all duration-300
               ${theme.id === 'pixel' ? 'bg-black border-black' : 
                 theme.id === 'cyberpunk' ? 'bg-black border-cyan-400 shadow-[0_0_5px_cyan]' :
                 'bg-white border-blue-500 group-hover:scale-125 group-hover:bg-blue-500'}
            `}></div>
            {/* Connecting Line */}
            <div className={`w-0.5 bg-gray-200 absolute top-3 bottom-[-16px] z-0 group-last:hidden
               ${theme.id === 'cyberpunk' ? 'bg-cyan-900/30' : ''}
               ${theme.id === 'glass' ? 'bg-white/20' : ''}
            `}></div>
         </div>

         {/* 3. Card Content - Right */}
         <div className="flex-1 min-w-0 pb-4">
            <NoteCard 
                note={note}
                index={0}
                theme={theme}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleComplete={onToggleComplete}
                onTogglePin={onTogglePin}
                compact={true} // Enable compact mode
                className={`h-auto w-full shadow-sm hover:shadow-md transition-shadow !min-h-0 ${theme.id === 'pixel' ? 'hover:translate-x-1' : ''}`}
            />
         </div>
      </div>
   );
};

// --- 5. MAIN TIMELINE COMPONENT ---
const Timeline: React.FC<TimelineProps> = ({ notes, theme, onView, onEdit, onDelete, onToggleComplete, onTogglePin }) => {
  const config = getThemeConfig(theme.id);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const groupedNotes = useMemo(() => {
    const groups: Record<string, Note[]> = {};
    const sorted = [...notes].sort((a, b) => b.createdAt - a.createdAt);
    sorted.forEach(note => {
       const key = format(note.createdAt, 'yyyy-MM-dd');
       if (!groups[key]) groups[key] = [];
       groups[key].push(note);
    });
    return groups;
  }, [notes]);

  const datesWithNotes = Object.keys(groupedNotes);
  const activeDates = datesWithNotes.map(d => new Date(d));

  const handleDateClick = (date: Date) => {
     setSelectedDate(date);
     const key = format(date, 'yyyy-MM-dd');
     const el = document.getElementById(`group-${key}`);
     if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className={`h-full flex flex-col xl:flex-row overflow-hidden ${theme.fontFamily} bg-transparent`}>
       
       {/* LEFT PANEL: Control Deck */}
       <div className={`
          hidden xl:flex w-[380px] shrink-0 flex-col gap-6 p-6 border-r overflow-y-auto custom-scrollbar
          ${theme.id === 'glass' ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-white/50'}
          ${theme.id === 'pixel' ? 'border-black border-r-4 bg-yellow-50' : ''}
          ${theme.id === 'cyberpunk' ? 'bg-black/60 border-cyan-900/30' : ''}
          ${theme.id === 'morandi' ? 'bg-white/20 border-white/20' : ''}
       `}>
          {/* Calendar Widget */}
          <div className={`p-4 transition-all duration-300 ${config.container}`}>
             <div className={`flex items-center justify-between mb-4 pb-2 ${config.header}`}>
                <h2 className={`text-lg font-bold flex items-center gap-2 ${config.textPrimary}`}>
                   <CalendarIcon size={18} /> 日历视图
                </h2>
                <button 
                   onClick={() => handleDateClick(new Date())} 
                   className={`p-1.5 rounded-full hover:bg-black/5 transition-colors ${config.textSecondary}`}
                   title="Today"
                >
                   <RotateCcw size={14} />
                </button>
             </div>
             
             <Calendar 
                onChange={(val) => handleDateClick(val as Date)}
                value={selectedDate}
                className="w-full bg-transparent border-none font-inherit text-sm"
                tileClassName={({ date }) => {
                   const isActive = isSameDay(date, selectedDate);
                   const hasNotes = activeDates.some(d => isSameDay(d, date));
                   let cls = `relative overflow-visible transition-colors ${config.calendarTile} `;
                   if (isActive) cls += config.calendarActive;
                   else if (hasNotes) cls += " font-bold";
                   return cls;
                }}
                tileContent={({ date, view }) => {
                   if (view === 'month' && activeDates.some(d => isSameDay(d, date))) {
                      return <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${theme.id === 'pixel' ? 'bg-black' : 'bg-blue-500'}`}></div>
                   }
                   return null;
                }}
                prev2Label={null} next2Label={null}
                formatShortWeekday={(l, d) => ['日','一','二','三','四','五','六'][d.getDay()]}
             />
          </div>

          {/* Activity Heatmap */}
          <ActivityHeatmap notes={notes} theme={theme} config={config} onDateClick={handleDateClick} />
          
          <div className={`mt-auto text-[10px] text-center opacity-40 ${config.textSecondary}`}>
             时间是两地之间最遥远的距离。
          </div>
       </div>

       {/* RIGHT PANEL: Timeline Stream */}
       <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 relative scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-12 pb-32">
             
             <TimeCapsule 
                notes={notes} 
                theme={theme} 
                config={config} 
                onView={onView} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                onToggleComplete={onToggleComplete} 
                onTogglePin={onTogglePin} 
             />

             {datesWithNotes.length > 0 ? (
                datesWithNotes.map(dateKey => {
                   const dayNotes = groupedNotes[dateKey];
                   const dateObj = new Date(dateKey);
                   
                   return (
                      <div key={dateKey} id={`group-${dateKey}`} className="scroll-mt-24">
                         {/* Sticky Date Header */}
                         <div className={`sticky top-0 z-30 mb-8 py-3 px-6 flex items-center justify-between rounded-xl backdrop-blur-md shadow-sm transition-all ${config.container} ${theme.id === 'glass' ? 'bg-white/10' : 'bg-white/80'}`}>
                            <div className="flex items-baseline gap-2">
                               <div className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg ${theme.id === 'pixel' ? 'bg-black text-white' : 'bg-blue-600 text-white'}`}>
                                  <span className="text-xl font-bold leading-none">{format(dateObj, 'dd')}</span>
                                  <span className="text-[10px] font-bold uppercase leading-none mt-0.5">{new Intl.DateTimeFormat('zh-CN', { month: 'short' }).format(dateObj)}</span>
                               </div>
                               <div className="flex flex-col ml-2">
                                  <span className={`text-sm font-bold ${config.textPrimary}`}>{isToday(dateObj) ? '今天' : new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(dateObj)}</span>
                                  <span className={`text-xs opacity-50 ${config.textSecondary}`}>{format(dateObj, 'yyyy-MM-dd')} · {dayNotes.length} 条笔记</span>
                               </div>
                            </div>
                         </div>

                         {/* Items */}
                         <div className="relative px-2">
                            {dayNotes.map((note, idx) => (
                               <TimelineItem 
                                  key={note.id} 
                                  note={note} 
                                  theme={theme} 
                                  config={config} 
                                  onView={onView}
                                  onEdit={onEdit}
                                  onDelete={onDelete}
                                  onToggleComplete={onToggleComplete}
                                  onTogglePin={onTogglePin}
                               />
                            ))}
                         </div>
                      </div>
                   )
                })
             ) : (
                <div className="flex flex-col items-center justify-center h-[400px] opacity-50">
                   <div className={`p-6 rounded-full mb-4 ${config.container}`}>
                      <StickyNote size={32} className={config.textSecondary} />
                   </div>
                   <p className={config.textSecondary}>暂无时间记录，去写点什么吧...</p>
                </div>
             )}
             
             {/* Footer Marker */}
             <div className="flex justify-center py-8 opacity-20">
                <div className={`w-2 h-2 rounded-full ${config.textPrimary} bg-current`}></div>
             </div>
          </div>
       </div>

    </div>
  );
};

export default Timeline;