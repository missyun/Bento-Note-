
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Note, Folder, ThemeStyle } from '../types';
import { CheckCircle, Activity, Zap, TrendingUp, Clock, Calendar, ArrowRight, User, Folder as FolderIcon, BarChart2, PieChart as PieIcon, CloudRain, Sun, Cloud, Wind } from 'lucide-react';

interface DashboardProps {
  notes: Note[];
  folders: Folder[];
  theme: ThemeStyle;
  showTimeWidget: boolean;
}

const CountUp: React.FC<{ end: number; duration?: number; className?: string }> = ({ end, duration = 1500, className }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return <span className={className}>{count}</span>;
};

const WaveChart: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden opacity-30 pointer-events-none">
       <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
         <path fill={color} fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
       </svg>
    </div>
  )
}

// --- High Fidelity Analog Clock (Braun Style) ---
const AnalogClock: React.FC<{ theme: ThemeStyle }> = ({ theme }) => {
  const [date, setDate] = useState(new Date());
  const requestRef = useRef<number | undefined>(undefined);

  const animate = () => {
    setDate(new Date());
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const seconds = date.getSeconds() + date.getMilliseconds() / 1000;
  const minutes = date.getMinutes() + seconds / 60;
  const hours = date.getHours() % 12 + minutes / 60;

  // Theme Adaptations
  const isPixel = theme.id === 'pixel';
  const isCyberpunk = theme.id === 'cyberpunk';
  const isGlass = theme.id === 'glass';
  const isRetro = theme.id === 'retro';
  const isWarm = theme.id === 'warm';
  const isIndustrial = theme.id === 'industrial';
  
  // Default Style (Clean/Braun/iOS/Warm/Industrial)
  // Industrial reuses the default because it's exactly the Braun style we want.
  let style = {
    bg: '#f4f4f5', // Soft gray/white plastic
    border: 'none',
    shadow: 'inset 2px 2px 5px rgba(255,255,255,0.8), inset -2px -2px 5px rgba(0,0,0,0.05)',
    faceBg: '#f4f4f5',
    faceShadow: '5px 5px 10px rgba(0,0,0,0.05), -5px -5px 10px rgba(255,255,255,0.8)', // Convex or Concave
    tickMain: '#18181b', // Zinc 900
    tickSub: '#a1a1aa', // Zinc 400
    handMain: '#18181b',
    handSec: '#f97316', // Orange-500
    text: '#52525b',
    dot: '#e4e4e7', // Zinc 200
  };

  if (isCyberpunk) {
    style = {
      bg: '#000000',
      border: '1px solid #333',
      shadow: '0 0 20px rgba(6,182,212,0.1)',
      faceBg: '#09090b',
      faceShadow: 'inset 0 0 30px rgba(0,0,0,0.8)',
      tickMain: '#22d3ee', // Cyan
      tickSub: '#334155',
      handMain: '#e2e8f0',
      handSec: '#f472b6', // Pink
      text: '#94a3b8',
      dot: '#1e293b',
    };
  } else if (isGlass) {
    style = {
      bg: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      shadow: '0 8px 32px rgba(0,0,0,0.1)',
      faceBg: 'transparent',
      faceShadow: 'inset 0 0 20px rgba(255,255,255,0.05)',
      tickMain: '#ffffff',
      tickSub: 'rgba(255,255,255,0.3)',
      handMain: '#ffffff',
      handSec: '#fbbf24', // Amber
      text: 'rgba(255,255,255,0.6)',
      dot: 'rgba(255,255,255,0.1)',
    };
  } else if (isPixel) {
    style = {
      bg: '#ffffff',
      border: '4px solid black',
      shadow: '4px 4px 0px black',
      faceBg: '#ffffff',
      faceShadow: 'none',
      tickMain: '#000000',
      tickSub: '#000000',
      handMain: '#000000',
      handSec: '#000000',
      text: '#000000',
      dot: '#000000',
    };
  } else if (isRetro) {
    style = {
      bg: '#EAE0D5',
      border: '2px solid #5E503F',
      shadow: '4px 4px 0 #5E503F',
      faceBg: '#F4F1EA',
      faceShadow: 'inset 2px 2px 5px rgba(94,80,63,0.1)',
      tickMain: '#22333B',
      tickSub: '#9E8E7E',
      handMain: '#22333B',
      handSec: '#C84B31', // Rusty Red
      text: '#5E503F',
      dot: '#C6AC8F',
    };
  } else if (isWarm) {
    style = {
      bg: '#FDFBF7',
      border: 'none',
      shadow: '8px 8px 16px rgba(214,210,196,0.6), -8px -8px 16px rgba(255,255,255,0.8)',
      faceBg: '#FDFBF7',
      faceShadow: 'inset 4px 4px 8px rgba(214,210,196,0.6), inset -4px -4px 8px rgba(255,255,255,0.8)',
      tickMain: '#5D4037',
      tickSub: '#D4CCC0',
      handMain: '#5D4037',
      handSec: '#D4A373',
      text: '#8A817C',
      dot: '#EBE5D5',
    }
  } else if (isIndustrial) {
    style = {
      bg: '#F4F4F4',
      border: 'none',
      shadow: '6px 6px 12px #c5c5c5, -6px -6px 12px #ffffff',
      faceBg: '#F4F4F4',
      faceShadow: 'inset 2px 2px 5px #bebebe, inset -2px -2px 5px #ffffff',
      tickMain: '#222222',
      tickSub: '#666666',
      handMain: '#222222',
      handSec: '#EA580C',
      text: '#444444',
      dot: '#D4D4D4',
    }
  }

  const renderTicks = () => {
    return [...Array(60)].map((_, i) => {
      const isMain = i % 5 === 0;
      const length = isMain ? 12 : 6;
      const width = isMain ? (isPixel ? 3 : 2.5) : (isPixel ? 1 : 1.5);
      const color = isMain ? style.tickMain : style.tickSub;
      
      return (
        <line
          key={i}
          x1="100" y1={15} // Padding from edge
          x2="100" y2={15 + length}
          transform={`rotate(${i * 6} 100 100)`}
          stroke={color}
          strokeWidth={width}
          strokeLinecap={isPixel ? "square" : "round"}
        />
      );
    });
  };

  return (
    <div className={`w-full h-full flex items-center justify-center relative overflow-hidden transition-all duration-300`}
      style={{
        background: style.bg,
        border: style.border,
        boxShadow: style.shadow,
        borderRadius: isPixel ? '0' : '2.5rem'
      }}
    >
      {/* Decorative Details (Braun Style) */}
      
      {/* Speaker Holes - Top Right */}
      <div className="absolute top-6 right-6 grid grid-cols-3 gap-[3px] opacity-40">
         {[...Array(9)].map((_,i) => (
           <div key={i} className={`w-[3px] h-[3px] rounded-full`} style={{backgroundColor: style.tickMain}}></div>
         ))}
      </div>

      {/* Sensor/Button - Top Left */}
      <div className="absolute top-6 left-6 w-3 h-3 rounded-full opacity-30 shadow-inner" style={{backgroundColor: style.dot}}></div>

      {/* Bottom Arrows */}
      <div className="absolute bottom-5 left-5 opacity-20">
         <ArrowRight size={16} className="transform rotate-180" color={style.text} />
      </div>
      <div className="absolute bottom-5 right-5 opacity-20">
         <ArrowRight size={16} color={style.text} />
      </div>

      {/* Clock Face */}
      <div className={`relative w-[85%] h-[85%] rounded-full`}
        style={{
          background: style.faceBg,
          boxShadow: style.faceShadow,
          border: isPixel ? '2px solid black' : undefined
        }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm">
           {/* Ticks */}
           {renderTicks()}

           {/* Brand Logo */}
           <text x="100" y="75" textAnchor="middle" fill={style.text} fontSize="7" fontWeight="bold" letterSpacing="1" style={{fontFamily: isPixel ? 'monospace' : 'Arial, sans-serif'}}>
              SMART
           </text>
           <text x="100" y="83" textAnchor="middle" fill={style.text} fontSize="4" fontWeight="normal" opacity="0.6">
              In React
           </text>

           {/* Date/Status Text */}
           <text x="100" y="135" textAnchor="middle" fill={style.text} fontSize="8" fontWeight="600" letterSpacing="0.5">
              {date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase()}
           </text>

           {/* Numbers (12, 3, 6, 9) - Optional, minimal style usually skips them or has small ones */}
           <text x="100" y="45" textAnchor="middle" fill={style.tickMain} fontSize="12" fontWeight="600" style={{fontFamily: 'Arial'}}>12</text>
           <text x="165" y="104" textAnchor="middle" fill={style.tickMain} fontSize="12" fontWeight="600" style={{fontFamily: 'Arial'}}>3</text>
           <text x="100" y="165" textAnchor="middle" fill={style.tickMain} fontSize="12" fontWeight="600" style={{fontFamily: 'Arial'}}>6</text>
           <text x="35" y="104" textAnchor="middle" fill={style.tickMain} fontSize="12" fontWeight="600" style={{fontFamily: 'Arial'}}>9</text>

           {/* Hour Hand */}
           <line
             x1="100" y1="100" x2="100" y2="60"
             stroke={style.handMain}
             strokeWidth={isPixel ? 5 : 4}
             strokeLinecap={isPixel ? "square" : "round"}
             transform={`rotate(${hours * 30} 100 100)`}
           />

           {/* Minute Hand */}
           <line
             x1="100" y1="100" x2="100" y2="40"
             stroke={style.handMain}
             strokeWidth={isPixel ? 4 : 3}
             strokeLinecap={isPixel ? "square" : "round"}
             transform={`rotate(${minutes * 6} 100 100)`}
           />

           {/* Second Hand (Orange) */}
           <g transform={`rotate(${seconds * 6} 100 100)`}>
              {/* Tail */}
              <line x1="100" y1="100" x2="100" y2="115" stroke={style.handSec} strokeWidth={isPixel ? 2 : 1.5} />
              {/* Body */}
              <line x1="100" y1="100" x2="100" y2="35" stroke={style.handSec} strokeWidth={isPixel ? 2 : 1.5} />
              {/* Counterbalance Circle */}
              {!isPixel && <circle cx="100" cy="100" r="3" fill={style.bg} stroke={style.handSec} strokeWidth="1.5" />}
              {/* Pixel Center */}
              {isPixel && <rect x="98" y="98" width="4" height="4" fill={style.handSec} />}
           </g>

           {/* Center Pin */}
           {!isPixel && <circle cx="100" cy="100" r="1.5" fill={style.handMain} />}
        </svg>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ notes, folders, theme, showTimeWidget }) => {
  const totalNotes = notes.length;
  const completedNotes = notes.filter(n => n.isCompleted).length;
  const importantNotes = notes.filter(n => n.isImportant).length;
  const completionRate = totalNotes === 0 ? 0 : Math.round((completedNotes / totalNotes) * 100);
  const recentNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    setTimeout(() => setAnimatedProgress(completionRate), 300);
  }, [completionRate]);

  const isGlass = theme.id === 'glass';
  const isPixel = theme.id === 'pixel';
  const isCyberpunk = theme.id === 'cyberpunk';
  const isIndustrial = theme.id === 'industrial';
  
  // Bento Grid Card Style Generator - Deep Adaptation
  const getBentoStyle = () => {
     if (isPixel) return 'bg-white border-4 border-black shadow-[8px_8px_0_0_#000] rounded-none';
     if (theme.id === 'warm') return 'bg-[#FDFBF7] shadow-[4px_4px_20px_rgba(214,210,196,0.5),-4px_-4px_20px_rgba(255,255,255,0.8)] rounded-[2rem] border-none';
     
     // Cyberpunk Neon - make Opaque
     if (isCyberpunk) return 'bg-[#0a0a0a] border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.15)] rounded-none clip-path-cyber';
     
     if (isGlass) return 'bg-white/5 border border-white/10 shadow-xl rounded-[2rem] backdrop-blur-md';

     // Industrial: Soft plastic with diffuse shadow
     if (isIndustrial) return 'bg-[#F4F4F4] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] rounded-[16px] border-none';
     
     // Default iOS/Clean
     return 'bg-white shadow-lg shadow-gray-200/50 rounded-[2rem] border-none';
  };

  const getAccentColor = () => {
      if (isPixel) return '#FFDE59';
      if (isCyberpunk) return '#F472B6';
      if (isIndustrial) return '#EA580C'; // Industrial Orange
      return '#3B82F6';
  };

  return (
    <div className={`p-8 max-w-[1600px] mx-auto w-full animate-fade-in-up pb-32 ${theme.fontFamily}`}>
      
      {/* Bento Grid Layout: 2x2 for Big Stats, 1x2 for Lists, 1x1 for Small Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* NEW: ANALOG CLOCK (2x2) - Replaces Time Widget & Hero Stat somewhat or just takes a prominent spot */}
        {showTimeWidget && (
           <div className={`col-span-1 md:col-span-2 xl:col-span-2 row-span-2 p-8 ${getBentoStyle()} flex items-center justify-center`}>
              <div className="w-[320px] h-[320px] max-w-full aspect-square">
                 <AnalogClock theme={theme} />
              </div>
           </div>
        )}

        {/* 1. HERO STAT CARD (2x1) */}
        <div className={`col-span-1 md:col-span-2 xl:col-span-2 p-8 relative overflow-hidden group flex flex-col justify-between ${getBentoStyle()}`}>
           <div className="relative z-10 flex justify-between items-end">
              <div>
                <div className={`flex items-center gap-3 mb-2 opacity-70 ${isPixel ? 'font-bold' : ''}`}>
                   <Activity size={20} />
                   <span className="text-xs font-bold uppercase tracking-widest">知识总量</span>
                </div>
                <div className={`text-6xl font-black tracking-tighter ${theme.textPrimary}`}>
                   <CountUp end={totalNotes} />
                </div>
              </div>
              
              {/* Activity Bar */}
              <div className="flex flex-col items-end">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 mb-2 ${isPixel ? 'bg-black text-white' : 'bg-black/5'}`}>
                    <TrendingUp size={14} /> +12%
                 </span>
                 {isPixel ? (
                    <div className="flex gap-1 h-3">
                      {[...Array(5)].map((_, i) => (
                          <div key={i} className={`w-3 border-2 border-black ${i < 4 ? 'bg-black' : 'bg-white'}`}></div>
                      ))}
                    </div>
                 ) : (
                    <div className={`flex gap-1 h-2 w-24 rounded-full overflow-hidden ${isIndustrial ? 'bg-[#e0e0e0] shadow-[inset_1px_1px_2px_#bebebe]' : 'bg-black/5'}`}>
                       <div className={`w-[60%] rounded-full`} style={{backgroundColor: getAccentColor()}}></div>
                       <div className={`w-[30%] rounded-full opacity-50`} style={{backgroundColor: getAccentColor()}}></div>
                       <div className={`w-[10%] rounded-full opacity-20`} style={{backgroundColor: getAccentColor()}}></div>
                    </div>
                 )}
              </div>
           </div>
           {!isPixel && <WaveChart color={getAccentColor()} />}
        </div>

        {/* IMPORTANT (1x1) */}
        <div 
          className={`
            col-span-1 p-6 flex flex-col justify-between group ${getBentoStyle()} 
            ${isPixel ? 'bg-yellow-400' : (isGlass || isCyberpunk || theme.id === 'warm' || isIndustrial) ? '' : 'bg-gradient-to-br from-orange-400 to-red-500 text-white border-none'}
          `}
        >
           <div className="flex justify-between items-start">
              <div className={`p-2.5 backdrop-blur-sm rounded-xl ${isPixel ? 'bg-white border-2 border-black' : isGlass ? 'bg-white/10' : (theme.id === 'warm' || isIndustrial) ? 'bg-black/5 text-zinc-800' : 'bg-white/20'}`}>
                 <Zap size={20} className={isPixel ? 'text-black' : isGlass ? 'text-orange-400' : (theme.id === 'warm' || isIndustrial) ? theme.textPrimary : 'text-white'} />
              </div>
              <ArrowRight className={`opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 ${isPixel ? 'text-black' : isGlass ? theme.textPrimary : (theme.id === 'warm' || isIndustrial) ? theme.textPrimary : 'text-white'}`} size={18} />
           </div>
           <div>
              <div className={`text-3xl font-black mb-1 ${isPixel || isGlass || isCyberpunk || theme.id === 'warm' || isIndustrial ? theme.textPrimary : 'text-white'}`}><CountUp end={importantNotes} /></div>
              <div className={`text-[10px] font-bold uppercase opacity-80 ${isPixel || isGlass || isCyberpunk || theme.id === 'warm' || isIndustrial ? theme.textSecondary : 'text-white'}`}>重要事项</div>
           </div>
        </div>

        {/* COMPLETION GAUGE (1x1) */}
        <div className={`col-span-1 row-span-1 p-6 flex flex-col items-center justify-center relative overflow-hidden ${getBentoStyle()}`}>
           <h3 className={`text-[10px] font-bold uppercase tracking-widest opacity-60 absolute top-4 left-4 ${theme.textPrimary}`}>效率</h3>
           
           {/* Theme Adapted Gauge - Small version */}
           <div className="relative w-24 h-24 mt-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className={`opacity-10 ${theme.textSecondary}`} />
                <circle 
                  cx="50%" cy="50%" r="45%" 
                  stroke={getAccentColor()} 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={283} 
                  strokeDashoffset={283 - (283 * animatedProgress) / 100} 
                  strokeLinecap="round" 
                  className={`transition-all duration-1000 ease-out drop-shadow-lg`} 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className={`text-xl font-black ${theme.textPrimary}`}>{completionRate}%</span>
              </div>
           </div>
           
           <div className="mt-2 text-center">
              <div className={`text-xs opacity-50 ${theme.textSecondary}`}>{completedNotes} 已完成</div>
           </div>
        </div>

        {/* 5. TIMELINE (Span Full Width Bottom) */}
        <div className={`col-span-1 md:col-span-2 xl:col-span-4 p-8 ${getBentoStyle()}`}>
            <div className={`flex items-center gap-3 mb-6 opacity-70 ${theme.textPrimary}`}>
               <Clock size={18} />
               <span className="text-xs font-bold uppercase tracking-widest">最近更新</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {recentNotes.map((note) => (
                  <div 
                    key={note.id} 
                    className={`
                      p-4 rounded-xl transition-all cursor-pointer hover:scale-[1.02] 
                      ${isPixel ? 'bg-white border-2 border-black shadow-[4px_4px_0_0_black]' : (isGlass) ? 'bg-white/10 hover:bg-white/20 border border-white/5' : (isCyberpunk) ? 'bg-[#111] border border-cyan-900/30 hover:border-cyan-500/50' : isIndustrial ? 'bg-[#F4F4F4] shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff]' : 'bg-gray-50 hover:bg-white hover:shadow-md'}
                    `}
                  >
                     <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${isPixel ? 'bg-black' : ''}`} style={{backgroundColor: isPixel ? undefined : getAccentColor()}}></div>
                        <span className={`text-xs opacity-50 font-mono ${theme.textSecondary}`}>
                           {/* Fixed Contrast Issue in Recent Updates */}
                           <span className={theme.id === 'glass' || theme.id === 'cyberpunk' ? 'text-gray-300' : 'text-gray-500'}>
                              {new Date(note.updatedAt).toLocaleDateString()}
                           </span>
                        </span>
                     </div>
                     <div className={`font-bold truncate ${theme.textPrimary}`}>{note.title}</div>
                  </div>
               ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
