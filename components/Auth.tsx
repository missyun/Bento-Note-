
import React, { useState, useEffect } from 'react';
import { ThemeStyle, ThemeId } from '../types';
import { User, ArrowRight, Command, Lock, Sparkles, Coffee, Terminal, Zap, Fingerprint, ShieldCheck } from 'lucide-react';
import { THEME_STYLES } from '../constants';

interface AuthProps {
  onLogin: (username: string) => void;
  currentThemeId: ThemeId;
}

const Auth: React.FC<AuthProps> = ({ onLogin, currentThemeId }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Visual only
  const [isLoading, setIsLoading] = useState(false);
  
  // Typewriter State
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const theme = THEME_STYLES[currentThemeId];
  const isDark = ['cyberpunk', 'glass'].includes(currentThemeId);

  // Reset state when theme changes
  useEffect(() => {
    setText('');
    setIsDeleting(false);
    setLoopNum(0);
    setTypingSpeed(150);
  }, [currentThemeId]);

  const getSlogans = (id: ThemeId): string[] => {
    switch (id) {
      case 'warm': return ['记录生活中的每一个温暖瞬间。', '让记忆如咖啡般醇厚。', '静谧时光，文字相伴。'];
      case 'cyberpunk': return ['唤醒你的数字记忆。WAKE UP.', 'SYSTEM_BREACH_DETECTED...', '追逐霓虹雨夜的幻梦。'];
      case 'pixel': return ['INSERT COIN TO START.', 'PLAYER ONE READY?', 'HIGH SCORE: 999999'];
      case 'glass': return ['通透如镜，思维无界。', 'Less is More.', '晶莹剔透的灵感。'];
      case 'retro': return ['重温旧时光的纸笔触感。', 'The Good Old Days.', '致敬 1980s。'];
      case 'isometric': return ['构建你的立体知识大厦。', '多维视角看世界。', '秩序与几何之美。'];
      case 'industrial': return ['BRAUN DESIGN PHILOSOPHY', 'LESS BUT BETTER', 'GOOD DESIGN IS HONEST'];
      case 'morandi': return ['探索色彩的诗意，感受宁静的美学。', '莫兰迪配色，优雅与宁静。', '在温柔的渐变中寻找灵感。'];
      default: return ['捕捉灵感，整理思绪。', '高效工作的第二大脑。', '让想法自由流动。'];
    }
  };

  // Human-like Typewriter Effect
  useEffect(() => {
    const slogans = getSlogans(currentThemeId);
    const i = loopNum % slogans.length;
    const fullText = slogans[i];

    const handleType = () => {
      const isFullText = text === fullText;
      const isDeletingState = isDeleting;

      setText(prev => isDeletingState 
        ? fullText.substring(0, prev.length - 1) 
        : fullText.substring(0, prev.length + 1)
      );

      // Determine speed for next tick
      let speed = 150;

      if (isDeletingState) {
        speed = 50; // Deleting is faster and constant
      } else {
        // Typing is slower and random (human-like)
        // Random between 100ms and 200ms
        speed = 100 + Math.random() * 100;
      }

      if (!isDeletingState && isFullText) {
        // Finished typing sentence, pause before deleting
        speed = 2000;
        setIsDeleting(true);
      } else if (isDeletingState && text === '') {
        // Finished deleting, pause before typing next
        setIsDeleting(false);
        setLoopNum(prev => prev + 1);
        speed = 500;
      } else if (isDeletingState && text.length === 1) {
         // Just about to finish deleting, speed up slightly
         speed = 50;
      }

      setTypingSpeed(speed);
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, currentThemeId, typingSpeed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoading(true);
      // Simulate API delay for better UX
      setTimeout(() => {
        onLogin(username.trim());
      }, 800);
    }
  };

  // --- Left Side Visuals ---
  const renderBrandVisual = () => {
    switch (currentThemeId) {
      case 'glass':
        return (
          <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900">
            <div className="absolute top-[20%] left-[20%] w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" />
            <div className="absolute top-[30%] right-[20%] w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-[20%] left-[30%] w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '4s' }} />
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-48 h-48 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-all duration-700">
                  <Sparkles size={64} className="text-white opacity-80" />
               </div>
            </div>
          </div>
        );
      case 'warm':
        return (
          <div className="relative w-full h-full bg-[#FDFBF7] flex items-center justify-center overflow-hidden">
             <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[#FDE047]/20 rounded-full animate-spin-slow" style={{ animationDuration: '60s' }} />
             <div className="z-10 flex flex-col items-center gap-6">
                <div className="w-32 h-32 bg-white rounded-full shadow-[0_20px_40px_rgba(253,224,71,0.3)] flex items-center justify-center animate-float">
                   <Coffee size={48} className="text-[#d97706]" />
                </div>
                <div className="w-24 h-4 bg-[#000]/5 rounded-[50%] blur-md mt-4 animate-pulse"></div>
             </div>
          </div>
        );
      case 'morandi':
        return (
           <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-[#E8D5C4] via-[#F3E9DC] to-[#A8DADC]">
              {/* Floating Pastel Orbs */}
              <div className="absolute top-[10%] right-[20%] w-64 h-64 bg-[#A8DADC] rounded-full filter blur-3xl opacity-60 animate-float" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-[20%] left-[10%] w-72 h-72 bg-[#E8D5C4] rounded-full filter blur-3xl opacity-60 animate-float" style={{animationDelay: '3s'}}></div>
              <div className="absolute top-[40%] left-[30%] w-48 h-48 bg-white rounded-full filter blur-2xl opacity-40 animate-float" style={{animationDelay: '5s'}}></div>
              
              {/* Central Glass Card */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-64 h-80 bg-white/30 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-xl flex flex-col items-center justify-center gap-4 animate-float p-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#E8D5C4] to-[#A8DADC] shadow-inner"></div>
                    <div className="w-full h-4 bg-white/40 rounded-full"></div>
                    <div className="w-2/3 h-4 bg-white/40 rounded-full"></div>
                 </div>
              </div>
           </div>
        );
      case 'cyberpunk':
        return (
          <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
             <div className="z-10 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-cyan-400 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div className="relative px-7 py-4 bg-black rounded-lg leading-none flex items-center divide-x divide-gray-600">
                  <span className="flex items-center space-x-5">
                    <Terminal className="text-pink-500 animate-pulse" size={48} />
                    <span className="pr-6 text-gray-100 font-mono text-2xl font-bold tracking-widest">SYSTEM_BREACH</span>
                  </span>
                </div>
             </div>
             <div className="absolute top-0 w-full h-2 bg-cyan-400 shadow-[0_0_20px_#22d3ee] animate-glitch"></div>
          </div>
        );
      case 'pixel':
        return (
          <div className="relative w-full h-full bg-yellow-400 flex items-center justify-center" style={{ backgroundImage: 'radial-gradient(#000 20%, transparent 20%)', backgroundSize: '10px 10px' }}>
             <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_0_#000]">
                <div className="flex gap-2 mb-4">
                   <div className="w-4 h-4 bg-red-500 border-2 border-black rounded-full"></div>
                   <div className="w-4 h-4 bg-yellow-500 border-2 border-black rounded-full"></div>
                   <div className="w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
                </div>
                <div className="font-mono font-bold text-4xl text-black text-center tracking-tighter">
                   HELLO<br/>WORLD
                </div>
             </div>
          </div>
        );
      case 'industrial':
        return (
          <div className="relative w-full h-full bg-[#E5E5E5] flex flex-col items-center justify-center">
             {/* 
                Recreating the Braun/Dieter Rams style controls with CSS-only neumorphism
             */}
             <div className="bg-[#F4F4F4] p-12 rounded-[20px] shadow-[10px_10px_20px_#bebebe,-10px_-10px_20px_#ffffff] flex flex-col items-center gap-10">
                
                {/* 1. The Trio Knobs (Orange, White, Black) */}
                <div className="flex gap-8">
                   {/* Orange Knob */}
                   <div className="w-16 h-16 rounded-full bg-[#F4F4F4] shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#EA580C] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)] flex items-center justify-center relative">
                         <div className="absolute top-1 w-1 h-3 bg-white rounded-full opacity-80"></div>
                      </div>
                   </div>
                   {/* White Knob */}
                   <div className="w-16 h-16 rounded-full bg-[#F4F4F4] shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#F9F9F9] shadow-[2px_2px_5px_#bebebe,-2px_-2px_5px_#ffffff] flex items-center justify-center relative">
                         <div className="absolute top-1 w-1 h-3 bg-gray-400 rounded-full"></div>
                      </div>
                   </div>
                   {/* Black Knob */}
                   <div className="w-16 h-16 rounded-full bg-[#F4F4F4] shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-[#27272A] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)] flex items-center justify-center relative">
                         <div className="absolute top-1 w-1 h-3 bg-white/50 rounded-full"></div>
                      </div>
                   </div>
                </div>

                {/* 2. Speaker Grille */}
                <div className="grid grid-cols-4 gap-2 opacity-30">
                   {[...Array(16)].map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#333] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]"></div>
                   ))}
                </div>

                {/* 3. Toggle Switches Panel */}
                <div className="flex gap-4 bg-[#EEEEEE] p-4 rounded-[12px] shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff]">
                   {[1, 2, 3].map((i) => (
                      <div key={i} className="w-10 h-16 rounded-full bg-[#F4F4F4] shadow-[2px_2px_5px_#bebebe,-2px_-2px_5px_#ffffff] relative flex justify-center p-1 cursor-pointer hover:bg-white transition-colors">
                         <div className={`w-8 h-8 rounded-full shadow-[1px_1px_3px_#bebebe,-1px_-1px_3px_#ffffff] absolute transition-all duration-300 flex items-center justify-center ${i === 2 ? 'bg-[#EA580C] bottom-1' : 'bg-[#F9F9F9] top-1'}`}>
                            {i === 2 && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                            {i !== 2 && <div className="w-1.5 h-1.5 bg-[#EA580C] rounded-full"></div>}
                         </div>
                      </div>
                   ))}
                </div>

             </div>
          </div>
        )
      default: // ios / minimal / others
        return (
          <div className="relative w-full h-full bg-gray-50 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 via-white to-purple-100" />
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white rounded-3xl shadow-2xl flex flex-col p-8 rotate-3 border border-gray-100">
                 <div className="w-12 h-12 bg-gray-100 rounded-xl mb-4" />
                 <div className="w-3/4 h-6 bg-gray-100 rounded-md mb-3" />
                 <div className="w-1/2 h-6 bg-gray-100 rounded-md mb-8" />
                 <div className="flex-1 bg-gray-50 rounded-xl border border-dashed border-gray-200" />
             </div>
             {/* Floating Elements */}
             <div className="absolute top-[20%] right-[10%] p-4 bg-white rounded-2xl shadow-xl animate-float delay-75">
                <ShieldCheck size={32} className="text-green-500" />
             </div>
             <div className="absolute bottom-[20%] left-[10%] p-4 bg-white rounded-2xl shadow-xl animate-float delay-150">
                <Zap size={32} className="text-yellow-500" />
             </div>
          </div>
        );
    }
  };

  const getInputClasses = (focused: boolean) => {
    // FIX: Changed px-4 to pl-12 pr-4 to prevent text from overlapping the left icon
    const base = `w-full pl-12 pr-4 py-3.5 outline-none transition-all duration-300 ${theme.fontFamily}`;
    
    if (currentThemeId === 'glass') {
      return `${base} bg-white/10 text-white placeholder-white/50 border border-white/20 rounded-xl ${focused ? 'bg-white/20 ring-2 ring-white/30' : ''}`;
    }
    if (currentThemeId === 'pixel') {
      return `${base} bg-white text-black border-4 border-black rounded-none ${focused ? 'bg-yellow-50' : ''}`;
    }
    if (currentThemeId === 'cyberpunk') {
      return `${base} bg-black border border-gray-700 text-cyan-400 rounded-none ${focused ? 'border-yellow-400 shadow-[0_0_10px_rgba(253,224,71,0.3)]' : ''}`;
    }
    if (currentThemeId === 'warm') {
      return `${base} bg-[#F9F7F0] text-[#463C33] border-2 border-transparent rounded-2xl ${focused ? 'bg-white border-[#FDE047] shadow-lg shadow-yellow-100' : ''}`;
    }
    if (currentThemeId === 'industrial') {
      return `${base} ${theme.inputBg} ${theme.inputBorder} ${focused ? 'shadow-[inset_3px_3px_6px_#cccccc,inset_-3px_-3px_6px_#ffffff]' : ''}`;
    }
    if (currentThemeId === 'morandi') {
      return `${base} bg-white/40 text-[#4A4E69] border border-white/40 rounded-2xl ${focused ? 'bg-white/70 ring-2 ring-[#9A8C98]/30' : ''}`;
    }
    // Default
    return `${base} bg-gray-50 text-gray-900 border border-gray-200 rounded-xl ${focused ? 'bg-white border-blue-500 ring-4 ring-blue-500/10 shadow-sm' : ''}`;
  };

  return (
    <div className={`min-h-screen flex ${theme.appBg} ${theme.fontFamily} overflow-hidden`}>
      
      {/* --- LEFT SIDE: BRAND VISUALS (Desktop Only) --- */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 text-white z-10 transition-colors duration-500">
         <div className="absolute inset-0 z-0">
            {renderBrandVisual()}
         </div>

         {/* Overlay Content */}
         <div className="relative z-10">
            <div className={`flex items-center gap-3 text-2xl font-bold ${currentThemeId === 'pixel' ? 'text-black' : currentThemeId === 'warm' || currentThemeId === 'industrial' ? 'text-[#333]' : 'text-gray-900'} ${isDark ? '!text-white' : ''} ${currentThemeId === 'morandi' ? '!text-[#4A4E69]' : ''}`}>
               <div className={`p-2 rounded-lg ${currentThemeId === 'pixel' ? 'bg-black text-white' : currentThemeId === 'warm' ? 'bg-[#FDE047]' : currentThemeId === 'industrial' ? 'bg-[#EA580C] text-white shadow-[2px_2px_5px_rgba(0,0,0,0.2)]' : currentThemeId === 'morandi' ? 'bg-[#9A8C98] text-white' : 'bg-blue-600 text-white'}`}>
                 <Command size={24} />
               </div>
               Bento Note
            </div>
         </div>

         <div className="relative z-10 max-w-md">
            <h2 className={`text-4xl font-bold mb-4 leading-tight min-h-[3em] ${currentThemeId === 'pixel' ? 'text-black' : currentThemeId === 'warm' || currentThemeId === 'industrial' ? 'text-[#333]' : 'text-gray-900'} ${isDark ? '!text-white' : ''} ${currentThemeId === 'morandi' ? '!text-[#4A4E69]' : ''}`}>
               {text}
               <span className={`${isDeleting ? 'opacity-100' : 'animate-pulse'}`}>|</span>
            </h2>
            <p className={`text-lg opacity-80 ${currentThemeId === 'pixel' ? 'text-black' : currentThemeId === 'warm' || currentThemeId === 'industrial' ? 'text-[#666]' : 'text-gray-600'} ${isDark ? '!text-gray-300' : ''} ${currentThemeId === 'morandi' ? '!text-[#6D6875]' : ''}`}>
               不仅仅是便签，更是你的第二大脑。随时随地，方寸之间，记录万象。
            </p>
         </div>

         <div className={`relative z-10 text-sm opacity-60 ${currentThemeId === 'pixel' ? 'text-black' : 'text-gray-500'} ${isDark ? '!text-gray-400' : ''} ${currentThemeId === 'morandi' ? '!text-[#9A8C98]' : ''}`}>
            © 2025 Bento Note Inc.
         </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative ${isDark ? 'bg-[#000]' : currentThemeId === 'industrial' ? 'bg-[#E5E5E5]' : currentThemeId === 'morandi' ? 'bg-white/80' : 'bg-white'}`}>
         {/* Mobile Branding (Visible only on small screens) */}
         <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2 font-bold text-xl">
            <div className={`p-2 rounded-lg bg-blue-600 text-white`}>
               <Command size={20} />
            </div>
            Bento Note
         </div>

         <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
               <h1 className={`text-3xl font-bold mb-2 ${theme.textPrimary}`}>欢迎回来</h1>
               <p className={`${theme.textSecondary}`}>请输入您的账户以继续</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               
               <div className="space-y-4">
                  <div className="space-y-1">
                     <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${theme.textSecondary}`}>用户名</label>
                     <div className="relative group">
                        <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${theme.textMuted} group-focus-within:${'text-blue-500'}`} size={18} />
                        <input 
                           type="text" 
                           value={username}
                           onChange={(e) => setUsername(e.target.value)}
                           className={getInputClasses(true)} // Always styled as focused-capable
                           placeholder="admin"
                        />
                     </div>
                  </div>

                  <div className="space-y-1">
                     <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${theme.textSecondary}`}>密码 (可选)</label>
                     <div className="relative group">
                        <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${theme.textMuted} group-focus-within:${'text-blue-500'}`} size={18} />
                        <input 
                           type="password" 
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className={getInputClasses(false)} 
                           placeholder="••••••••"
                        />
                     </div>
                  </div>
               </div>

               <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                     <div className={`w-4 h-4 rounded border flex items-center justify-center ${isDark ? 'border-gray-600 bg-white/5' : currentThemeId === 'industrial' ? 'bg-[#EEEEEE] shadow-[inset_1px_1px_2px_#bebebe] border-none' : 'border-gray-300 bg-gray-50'}`}>
                        <div className={`w-2 h-2 rounded-sm bg-blue-500 opacity-0`} /> 
                     </div>
                     <span className={`text-xs ${theme.textSecondary}`}>记住我</span>
                  </label>
                  {/* Disabled Forgot Password Link as requested */}
                  <a href="javascript:void(0)" className={`text-xs font-bold text-gray-400 cursor-default`}>忘记密码?</a>
               </div>

               <button 
                  type="submit"
                  disabled={isLoading}
                  className={`
                     w-full py-4 font-bold flex items-center justify-center gap-2 transition-all 
                     ${isLoading ? 'opacity-80 cursor-wait' : 'active:scale-[0.98] hover:shadow-xl'}
                     ${theme.buttonPrimary}
                     ${currentThemeId === 'pixel' ? 'border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]' : ''}
                     ${currentThemeId === 'warm' || currentThemeId === 'morandi' ? 'rounded-2xl' : ''}
                  `}
               >
                  {isLoading ? (
                     <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>正在进入...</span>
                     </>
                  ) : (
                     <>
                        开始使用 <ArrowRight size={20} />
                     </>
                  )}
               </button>

               <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                     <div className={`w-full border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                     <span className={`px-2 ${isDark ? 'bg-black text-gray-500' : currentThemeId === 'industrial' ? 'bg-[#E5E5E5] text-[#999]' : 'bg-white text-gray-400'}`}>
                        Or continue with
                     </span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <button type="button" className={`flex items-center justify-center py-2.5 border rounded-lg hover:bg-gray-50 transition-colors ${isDark ? 'border-gray-700 hover:bg-white/5 text-white' : currentThemeId === 'industrial' ? 'bg-[#F4F4F4] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] border-none text-[#333] active:shadow-inner' : 'border-gray-200 text-gray-700'}`}>
                     <Fingerprint size={20} />
                  </button>
                  <button type="button" className={`flex items-center justify-center py-2.5 border rounded-lg hover:bg-gray-50 transition-colors ${isDark ? 'border-gray-700 hover:bg-white/5 text-white' : currentThemeId === 'industrial' ? 'bg-[#F4F4F4] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] border-none text-[#333] active:shadow-inner' : 'border-gray-200 text-gray-700'}`}>
                     <ShieldCheck size={20} />
                  </button>
               </div>
            </form>
         </div>
      </div>
    </div>
  );
};

export default Auth;
