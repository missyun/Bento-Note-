
import React, { useMemo } from 'react';
import { ThemeStyle } from '../types';

interface ThemeAvatarProps {
  username: string;
  theme: ThemeStyle;
  className?: string;
  seed?: string;
}

const ThemeAvatar: React.FC<ThemeAvatarProps> = ({ username, theme, className = "w-12 h-12", seed: propSeed }) => {
  // 1. Generate a stable seed from username OR use provided propSeed
  const seed = useMemo(() => {
    const source = propSeed || username;
    let hash = 0;
    for (let i = 0; i < source.length; i++) {
      hash = source.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }, [username, propSeed]);

  // 2. China-friendly Name Logic: 
  // If Chinese, take the last character (like DingTalk/Alipay).
  // If English, take the first character (like Gmail).
  const displayChar = useMemo(() => {
    if (!username) return 'B'; // Fallback
    const lastChar = username.slice(-1);
    // Check if the last character is Chinese (roughly)
    if (/[\u4e00-\u9fa5]/.test(lastChar)) {
        return lastChar;
    }
    return username.charAt(0).toUpperCase();
  }, [username]);

  // Helper for consistent HSL colors based on seed
  const getColor = (offset: number = 0, sat: number = 70, light: number = 60) => {
    const hue = (seed % 360 + offset) % 360;
    return `hsl(${hue}, ${sat}%, ${light}%)`;
  };

  const renderContent = () => {
    switch (theme.id) {
      case 'pixel': {
        // 8-bit Blocky Avatar
        const baseColor = getColor(0, 80, 50);
        const altColor = getColor(180, 80, 50);
        const blocks = [];
        // Generate a 4x4 symmetrical pattern
        for (let i = 0; i < 16; i++) {
           const isActive = ((seed >> i) & 1) === 1; 
           blocks.push(
             <div 
               key={i} 
               className="w-full h-full"
               style={{ backgroundColor: isActive ? baseColor : (i % 3 === 0 ? 'white' : altColor) }}
             />
           );
        }
        return (
          <div className="w-full h-full border-2 border-black bg-white grid grid-cols-4 overflow-hidden rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]">
             {blocks}
          </div>
        );
      }

      case 'cyberpunk': {
        // High-tech Hex/Circuit
        return (
          <div className="w-full h-full bg-black border border-cyan-500/50 relative overflow-hidden flex items-center justify-center rounded-none shadow-[0_0_10px_rgba(6,182,212,0.3)]">
             <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:10px_10px]" />
             <div className="z-10 font-mono font-bold text-yellow-400 text-xl drop-shadow-[0_0_5px_rgba(253,224,71,0.8)] animate-pulse">
                {displayChar}
             </div>
             {/* Tech Decals */}
             <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-pink-500"></div>
             <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-pink-500"></div>
             <div className="absolute top-0 left-0 w-full h-px bg-cyan-500 animate-scanline opacity-50"></div>
          </div>
        );
      }

      case 'sketch': {
        // Hand-drawn scribble
        return (
          <div className="w-full h-full bg-white border-2 border-black rounded-[255px_15px_225px_15px/15px_225px_15px_255px] flex items-center justify-center relative overflow-hidden shadow-sm hover:rotate-3 transition-transform">
             <div className="absolute w-[150%] h-3 bg-yellow-200/50 rotate-12 top-2 -left-2 rounded-full"></div>
             <div className="absolute w-[150%] h-3 bg-blue-200/50 -rotate-12 bottom-2 -left-2 rounded-full"></div>
             <span className="font-hand font-bold text-xl z-10 text-black">{displayChar}</span>
          </div>
        );
      }

      case 'retro': {
        // Post Stamp / Seal style
        return (
          <div className="w-full h-full bg-[#f4ecd8] border-2 border-[#8b4513] border-double rounded-sm flex items-center justify-center relative shadow-inner">
             <div className="absolute inset-0.5 border border-[#8b4513] border-dashed rounded-sm opacity-30"></div>
             <span className="font-serif font-bold text-[#8b4513] text-lg z-10">{displayChar}</span>
          </div>
        );
      }

      case 'industrial': {
        // Mechanical Button / Knob
        return (
          <div className="w-full h-full rounded-full bg-[#E0E0E0] shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff] flex items-center justify-center relative">
             <div className="w-[65%] h-[65%] rounded-full bg-[#F4F4F4] shadow-[1px_1px_3px_#bebebe,-1px_-1px_3px_#ffffff] flex items-center justify-center">
                <span className="text-[#333] font-bold text-xs transform active:scale-95 transition-transform">{displayChar}</span>
             </div>
          </div>
        );
      }

      case 'warm': {
        // Soft Clay Blob
        const hue = (seed % 40) + 30; // Warm hues (30-70)
        return (
          <div 
            className="w-full h-full rounded-[16px] flex items-center justify-center text-white font-bold text-lg"
            style={{ 
              backgroundColor: `hsl(${hue}, 85%, 65%)`,
              boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.4), inset -2px -2px 6px rgba(0,0,0,0.1), 4px 4px 10px rgba(0,0,0,0.05)'
            }}
          >
             {displayChar}
          </div>
        );
      }

      case 'minimal': {
        // High Contrast B&W
        const isInverted = seed % 2 !== 0;
        return (
          <div className={`w-full h-full flex items-center justify-center border border-black rounded-full ${isInverted ? 'bg-black text-white' : 'bg-white text-black'}`}>
             <span className="font-bold text-lg">{displayChar}</span>
          </div>
        );
      }

      case 'morandi': {
         // Soft Pastel Split Circle
         return (
            <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center border border-white/50 shadow-sm">
               <div className="absolute top-0 left-0 w-full h-1/2" style={{ backgroundColor: getColor(0, 30, 85) }}></div>
               <div className="absolute bottom-0 left-0 w-full h-1/2" style={{ backgroundColor: getColor(180, 25, 75) }}></div>
               <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px]"></div>
               <span className="relative z-10 text-[#4A4E69] font-bold text-lg">{displayChar}</span>
            </div>
         );
      }

      case 'glass': {
         // Frosted Glass with "Inner Glow"
         const c1 = getColor(0, 80, 60);
         const c2 = getColor(90, 80, 60);
         return (
            <div className="w-full h-full rounded-2xl overflow-hidden relative flex items-center justify-center border border-white/20">
               <div className="absolute inset-0 bg-white/10 backdrop-blur-md"></div>
               {/* Generative Orbs behind glass */}
               <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-md opacity-80" style={{ backgroundColor: c1 }}></div>
               <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full blur-md opacity-80" style={{ backgroundColor: c2 }}></div>
               <span className="relative z-10 text-white font-bold text-lg drop-shadow-md">{displayChar}</span>
            </div>
         )
      }

      case 'ios':
      case 'flat':
      default: {
        // Modern Smooth Gradient (DingTalk Style but prettier)
        const c1 = getColor(0);
        const c2 = getColor(45);
        return (
          <div 
            className="w-full h-full rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-md"
            style={{ backgroundImage: `linear-gradient(135deg, ${c1}, ${c2})` }}
          >
            {displayChar}
          </div>
        );
      }
    }
  };

  return (
    <div className={`${className} shrink-0 transition-all duration-500 ease-in-out select-none`}>
       {renderContent()}
    </div>
  );
};

export default ThemeAvatar;
