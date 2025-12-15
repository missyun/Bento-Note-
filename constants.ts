
import { ThemeStyle, NoteColor, Folder } from './types';

export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'all', name: '全部便签', icon: 'Layers', isSystem: true, order: 0 },
  { id: 'personal', name: '个人生活', icon: 'User', order: 1 },
  { id: 'work', name: '工作任务', icon: 'Briefcase', order: 2 },
  { id: 'study', name: '学习笔记', icon: 'BookOpen', order: 3 },
  { id: 'ideas', name: '灵感创意', icon: 'Lightbulb', order: 4 },
];

// 2025 Trend: Spatial UI & Bento Grids
export const THEME_STYLES: Record<string, ThemeStyle> = {
  ios: {
    id: 'ios',
    name: 'Clean Air',
    description: '现代空气感，纯净，高透',
    appBg: 'bg-[#F2F4F8]', 
    fontFamily: 'font-sans',
    
    sidebarBg: 'bg-white/80 backdrop-blur-xl',
    sidebarBorder: 'border-none',
    sidebarText: 'text-slate-600 font-medium',
    sidebarActiveItem: 'bg-black text-white shadow-lg shadow-black/10 rounded-[1.2rem]',
    sidebarHoverItem: 'hover:bg-white hover:shadow-sm rounded-[1.2rem]',

    cardBg: 'bg-white',
    cardBorder: 'border-none',
    cardShadow: 'shadow-[0_4px_20px_rgba(0,0,0,0.03)]',
    cardRadius: 'rounded-[1.5rem]',
    cardHover: 'hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out',
    
    textPrimary: 'text-slate-900 tracking-tight',
    textSecondary: 'text-slate-500',
    textMuted: 'text-slate-400',
    buttonPrimary: 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20 rounded-2xl',
    buttonSecondary: 'bg-white text-slate-700 hover:bg-slate-50 shadow-sm rounded-2xl',
    inputBg: 'bg-white',
    inputBorder: 'border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-black/10 rounded-2xl',
    headerBg: 'bg-transparent',
    headerText: 'text-slate-900',
  },
  morandi: {
    id: 'morandi',
    name: 'Morandi Mist',
    description: '莫兰迪渐变，静谧诗意',
    // Matches the reference image: Warm Beige (#E8D5C4) to Soft Teal (#A8DADC)
    appBg: 'bg-gradient-to-br from-[#E8D5C4] via-[#F3E9DC] to-[#A8DADC]', 
    fontFamily: 'font-sans tracking-wide',

    sidebarBg: 'bg-white/40 backdrop-blur-2xl border-r border-white/30',
    sidebarBorder: 'border-white/20',
    sidebarText: 'text-[#6D6875] font-medium', // Muted Gray-Purple
    sidebarActiveItem: 'bg-white/70 text-[#4A4E69] shadow-[0_4px_16px_rgba(74,78,105,0.1)] rounded-[1.2rem] backdrop-blur-md',
    sidebarHoverItem: 'hover:bg-white/40 rounded-[1.2rem]',

    cardBg: 'bg-white/50 backdrop-blur-xl', // Frosted glass
    cardBorder: 'border border-white/40',
    cardShadow: 'shadow-[0_8px_32px_rgba(31,38,135,0.05)]',
    cardRadius: 'rounded-[1.8rem]',
    cardHover: 'hover:bg-white/70 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(74,78,105,0.1)] transition-all duration-500 ease-out',

    textPrimary: 'text-[#4A4E69]', // Deep Muted Purple/Blue
    textSecondary: 'text-[#9A8C98]', // Muted Mauve
    textMuted: 'text-[#C9ADA7]', // Pale Pinkish Gray

    buttonPrimary: 'bg-gradient-to-r from-[#9A8C98] to-[#4A4E69] text-white shadow-lg shadow-[#4A4E69]/20 rounded-2xl border border-white/20',
    buttonSecondary: 'bg-white/50 text-[#4A4E69] hover:bg-white/80 shadow-sm rounded-2xl border border-white/40',
    inputBg: 'bg-white/40',
    inputBorder: 'border border-white/40 focus:bg-white/60 focus:ring-2 focus:ring-[#9A8C98]/30 rounded-2xl text-[#4A4E69]',
    headerBg: 'bg-transparent',
    headerText: 'text-[#4A4E69]',
  },
  glass: {
    id: 'glass',
    name: 'Spatial Glass',
    description: '空间感磨砂，深度场，流光',
    appBg: 'bg-[#0f172a]', 
    fontFamily: 'font-sans',

    sidebarBg: 'bg-white/5 backdrop-blur-2xl border border-white/10',
    sidebarBorder: 'border-none',
    sidebarText: 'text-white/70',
    sidebarActiveItem: 'bg-white/10 text-white border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-[1.5rem]',
    sidebarHoverItem: 'hover:bg-white/5 rounded-[1.5rem]',

    cardBg: 'bg-white/5 backdrop-blur-xl',
    cardBorder: 'border border-white/10',
    cardShadow: 'shadow-2xl shadow-black/20',
    cardRadius: 'rounded-[2rem]',
    cardHover: 'hover:bg-white/10 hover:border-white/30 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300',
    
    textPrimary: 'text-white drop-shadow-md',
    textSecondary: 'text-blue-200/80',
    textMuted: 'text-blue-200/40',
    buttonPrimary: 'bg-white/90 text-slate-900 hover:bg-white shadow-[0_0_25px_rgba(255,255,255,0.3)] rounded-2xl font-bold',
    buttonSecondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-2xl',
    inputBg: 'bg-black/20',
    inputBorder: 'border border-white/10 focus:border-white/30 rounded-2xl text-white',
    headerBg: 'bg-transparent',
    headerText: 'text-white',
  },
  warm: {
    id: 'warm',
    name: 'Clay Soft',
    description: '黏土质感，柔和阴影，舒适',
    appBg: 'bg-[#F2EFE9]', 
    fontFamily: 'font-sans',

    sidebarBg: 'bg-[#FDFBF7]',
    sidebarBorder: 'border-none',
    sidebarText: 'text-[#8A817C] font-medium',
    sidebarActiveItem: 'bg-[#E6C6A0] text-[#5D4037] shadow-[4px_4px_12px_rgba(214,210,196,0.6),-4px_-4px_12px_rgba(255,255,255,0.8)] rounded-[1.5rem]',
    sidebarHoverItem: 'hover:bg-[#F5F2EB] rounded-[1.5rem]',

    cardBg: 'bg-[#FDFBF7]',
    cardBorder: 'border-none',
    cardShadow: 'shadow-[8px_8px_20px_rgba(214,210,196,0.6),-8px_-8px_20px_rgba(255,255,255,0.8)]',
    cardRadius: 'rounded-[2.5rem]',
    cardHover: 'hover:-translate-y-2 hover:shadow-[12px_12px_30px_rgba(214,210,196,0.7),-10px_-10px_30px_rgba(255,255,255,0.9)] transition-all duration-300 ease-out',
    
    textPrimary: 'text-[#5D4037]',
    textSecondary: 'text-[#9C8C74]',
    textMuted: 'text-[#D4CCC0]',
    buttonPrimary: 'bg-[#D4A373] text-white hover:bg-[#C59265] shadow-[6px_6px_15px_rgba(212,163,115,0.4)] rounded-[1.5rem] font-bold',
    buttonSecondary: 'bg-[#FDFBF7] text-[#8A817C] shadow-[4px_4px_10px_rgba(214,210,196,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)] rounded-[1.5rem]',
    inputBg: 'bg-[#F5F2EB]',
    inputBorder: 'border-none shadow-[inset_3px_3px_6px_rgba(214,210,196,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] rounded-[1.5rem]',
    headerBg: 'bg-transparent',
    headerText: 'text-[#5D4037]',
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial',
    description: 'Dieter Rams 风格，实体交互，秩序',
    appBg: 'bg-[#E0E0E0]', // Darker base for better contrast
    fontFamily: 'font-sans tracking-tight',

    sidebarBg: 'bg-[#EFEFEF] shadow-[inset_-1px_0_0_rgba(0,0,0,0.05),8px_0_15px_rgba(0,0,0,0.03)]',
    sidebarBorder: 'border-none',
    sidebarText: 'text-[#444] font-medium',
    sidebarActiveItem: 'bg-[#EFEFEF] text-black shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff] rounded-[10px]',
    sidebarHoverItem: 'hover:bg-[#EAEAEA] rounded-[10px]',

    // Convex card (Raised)
    cardBg: 'bg-[#EFEFEF]', 
    cardBorder: 'border-t border-white/50', // Subtle highlight edge
    cardShadow: 'shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff]', 
    cardRadius: 'rounded-[12px]',
    cardHover: 'hover:-translate-y-[2px] hover:shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] transition-all duration-300',
    
    textPrimary: 'text-[#222222]',
    textSecondary: 'text-[#666666]',
    textMuted: 'text-[#999999]',
    
    // Convex Orange Button
    buttonPrimary: 'bg-[#EA580C] text-white shadow-[4px_4px_8px_rgba(0,0,0,0.2),-2px_-2px_4px_rgba(255,255,255,0.2)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)] active:translate-y-[1px] rounded-full font-medium',
    
    // Convex White Button
    buttonSecondary: 'bg-[#EFEFEF] text-[#333] shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] rounded-lg border border-transparent',
    
    // Concave Input (Recessed)
    inputBg: 'bg-[#EFEFEF]',
    inputBorder: 'shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff] border-none rounded-lg focus:shadow-[inset_3px_3px_6px_#cccccc,inset_-3px_-3px_6px_#ffffff] text-[#333]',
    
    headerBg: 'bg-transparent',
    headerText: 'text-[#222]',
  },
  pixel: {
    id: 'pixel',
    name: 'Neo Retro',
    description: '8-Bit 像素，孟菲斯色，强边框',
    appBg: 'bg-[#FFDE59]', // Vibrant Yellow
    fontFamily: 'font-mono',

    sidebarBg: 'bg-white border-4 border-black shadow-[8px_8px_0_0_#000]',
    sidebarBorder: 'border-none',
    sidebarText: 'text-black font-bold',
    sidebarActiveItem: 'bg-black text-white translate-x-1 translate-y-1 shadow-none',
    sidebarHoverItem: 'hover:bg-blue-200',

    cardBg: 'bg-white',
    cardBorder: 'border-4 border-black',
    cardShadow: 'shadow-[8px_8px_0_0_#000]',
    cardRadius: 'rounded-none',
    cardHover: 'hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0_0_#000] transition-all duration-100 bg-yellow-50',
    
    textPrimary: 'text-black font-black uppercase',
    textSecondary: 'text-gray-800 font-bold',
    textMuted: 'text-gray-500',
    buttonPrimary: 'bg-[#FF5757] text-white border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] rounded-none',
    buttonSecondary: 'bg-white text-black border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] rounded-none',
    inputBg: 'bg-white',
    inputBorder: 'border-4 border-black focus:bg-[#CBF3F0] rounded-none',
    headerBg: 'bg-transparent',
    headerText: 'text-black text-shadow-pixel',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Night City',
    description: '赛博朋克，故障风，全息投影',
    appBg: 'bg-[#050510]',
    fontFamily: 'font-mono',

    sidebarBg: 'bg-black/90 border border-pink-500/50 backdrop-blur-md shadow-[0_0_30px_rgba(236,72,153,0.15)]',
    sidebarBorder: 'border-none',
    sidebarText: 'text-cyan-600',
    sidebarActiveItem: 'bg-pink-500/20 text-pink-500 border border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)] clip-path-slant',
    sidebarHoverItem: 'hover:text-cyan-400 hover:bg-cyan-900/20',

    cardBg: 'bg-black/80',
    cardBorder: 'border border-cyan-500/30 border-l-[4px] border-l-yellow-400',
    cardShadow: 'shadow-[0_0_15px_rgba(0,255,255,0.05)]',
    cardRadius: 'rounded-none clip-path-cyber',
    cardHover: 'hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:border-cyan-400 hover:-translate-y-2 transition-all duration-200',
    
    textPrimary: 'text-yellow-400 font-bold tracking-widest',
    textSecondary: 'text-cyan-400',
    textMuted: 'text-slate-600',
    buttonPrimary: 'bg-cyan-500 text-black font-bold uppercase hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] clip-path-slant',
    buttonSecondary: 'bg-transparent text-pink-500 border border-pink-500 hover:bg-pink-900/30 clip-path-slant',
    inputBg: 'bg-black',
    inputBorder: 'border border-cyan-500/50 focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(253,224,71,0.5)] rounded-none',
    headerBg: 'bg-transparent',
    headerText: 'text-pink-500',
  },
  sketch: {
    id: 'sketch',
    name: 'Paper Sketch',
    description: '手绘草稿，涂鸦，纸张感',
    appBg: 'bg-[#F7F5F0]', // Paper
    fontFamily: 'font-hand font-bold tracking-wide',

    sidebarBg: 'bg-white border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.1)]',
    sidebarBorder: 'border-none',
    sidebarText: 'text-gray-600',
    sidebarActiveItem: 'bg-[#FFD166] text-black border-2 border-black rounded-[255px_15px_225px_15px/15px_225px_15px_255px] -rotate-1 shadow-[2px_2px_0_0_#000]',
    sidebarHoverItem: 'hover:bg-gray-100 rounded-[255px_15px_225px_15px/15px_225px_15px_255px]',

    cardBg: 'bg-white',
    cardBorder: 'border-2 border-black',
    cardShadow: 'shadow-[3px_3px_0_rgba(0,0,0,0.1)]',
    cardRadius: 'rounded-[255px_15px_225px_15px/15px_225px_15px_255px]',
    cardHover: 'hover:-translate-y-2 hover:rotate-1 hover:shadow-[6px_6px_0_rgba(0,0,0,0.15)] transition-all duration-200',
    
    textPrimary: 'text-black',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-400',
    buttonPrimary: 'bg-black text-white border-2 border-transparent hover:bg-white hover:text-black hover:border-black rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-md',
    buttonSecondary: 'bg-white text-black border-2 border-black hover:bg-gray-50 rounded-[255px_15px_225px_15px/15px_225px_15px_255px]',
    inputBg: 'bg-transparent',
    inputBorder: 'border-b-2 border-black border-dashed rounded-none focus:border-solid',
    headerBg: 'bg-transparent',
    headerText: 'text-black',
  },
  retro: {
    id: 'retro',
    name: '1980s Post',
    description: '复古海报，纹理，暖调',
    appBg: 'bg-[#EAE0D5]',
    fontFamily: 'font-serif',

    sidebarBg: 'bg-[#EAE0D5] border-2 border-[#5E503F] shadow-[6px_6px_0_#5E503F]',
    sidebarBorder: 'border-none',
    sidebarText: 'text-[#5E503F]',
    sidebarActiveItem: 'bg-[#C6AC8F] text-[#22333B] border border-[#22333B]',
    sidebarHoverItem: 'hover:bg-[#D6CCC2]',

    cardBg: 'bg-[#F4F1EA]',
    cardBorder: 'border-2 border-[#5E503F]',
    cardShadow: 'shadow-[4px_4px_0_#5E503F]',
    cardRadius: 'rounded-sm',
    cardHover: 'hover:-translate-y-2 hover:shadow-[8px_8px_0_#5E503F] transition-all duration-200',
    
    textPrimary: 'text-[#22333B] font-bold',
    textSecondary: 'text-[#5E503F]',
    textMuted: 'text-[#9E8E7E]',
    buttonPrimary: 'bg-[#22333B] text-[#EAE0D5] border-2 border-transparent hover:bg-[#0A0908] uppercase tracking-widest',
    buttonSecondary: 'bg-transparent text-[#22333B] border-2 border-[#22333B] hover:bg-[#C6AC8F]',
    inputBg: 'bg-[#F4F1EA]',
    inputBorder: 'border-2 border-[#5E503F] focus:bg-white rounded-sm',
    headerBg: 'bg-transparent',
    headerText: 'text-[#22333B]',
  },
  flat: { id: 'flat', name: 'Super Flat', description: '扁平化', appBg: 'bg-gray-100', fontFamily: 'font-sans', sidebarBg: 'bg-white', sidebarBorder: 'border-none', sidebarText: 'text-gray-600', sidebarActiveItem: 'bg-blue-600 text-white rounded-lg', sidebarHoverItem: 'hover:bg-gray-100', cardBg: 'bg-white', cardBorder: 'border-none', cardShadow: 'shadow-sm', cardRadius: 'rounded-xl', cardHover: 'hover:shadow-md hover:-translate-y-2 transition-all', textPrimary: 'text-gray-900', textSecondary: 'text-gray-600', textMuted: 'text-gray-400', buttonPrimary: 'bg-blue-600 text-white rounded-lg', buttonSecondary: 'bg-gray-200 text-gray-800 rounded-lg', inputBg: 'bg-gray-50', inputBorder: 'border-transparent focus:bg-white', headerBg: 'bg-transparent', headerText: 'text-gray-900' },
  minimal: { id: 'minimal', name: 'Minimal', description: '极简', appBg: 'bg-white', fontFamily: 'font-sans', sidebarBg: 'bg-white border-r', sidebarBorder: 'border-gray-100', sidebarText: 'text-gray-900', sidebarActiveItem: 'font-bold underline', sidebarHoverItem: 'hover:underline', cardBg: 'bg-white', cardBorder: 'border border-gray-200', cardShadow: 'shadow-none', cardRadius: 'rounded-none', cardHover: 'hover:border-black hover:-translate-y-2 transition-all', textPrimary: 'text-black', textSecondary: 'text-gray-600', textMuted: 'text-gray-400', buttonPrimary: 'bg-black text-white rounded-none', buttonSecondary: 'border border-black text-black rounded-none', inputBg: 'bg-white', inputBorder: 'border-b border-gray-200 rounded-none', headerBg: 'bg-white', headerText: 'text-black' },
  '3d': { id: '3d', name: 'Clay 3D', description: '3D 软萌', appBg: 'bg-[#E0E5EC]', fontFamily: 'font-sans', sidebarBg: 'bg-[#E0E5EC] shadow-[9px_9px_16px_rgb(163,177,198),-9px_-9px_16px_rgba(255,255,255,0.5)]', sidebarBorder: 'border-none', sidebarText: 'text-gray-600', sidebarActiveItem: 'text-blue-600 shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] rounded-xl', sidebarHoverItem: 'hover:bg-white/40', cardBg: 'bg-[#E0E5EC]', cardBorder: 'border-none', cardShadow: 'shadow-[9px_9px_16px_rgb(163,177,198),-9px_-9px_16px_rgba(255,255,255,0.5)]', cardRadius: 'rounded-[20px]', cardHover: 'hover:translate-y-[-4px] hover:shadow-[12px_12px_20px_rgb(163,177,198),-12px_-12px_20px_rgba(255,255,255,0.5)] transition-all', textPrimary: 'text-gray-700', textSecondary: 'text-gray-500', textMuted: 'text-gray-400', buttonPrimary: 'bg-[#E0E5EC] text-blue-600 shadow-[6px_6px_10px_#a3b1c6,-6px_-6px_10px_#ffffff] rounded-xl active:shadow-[inset_6px_6px_10px_#a3b1c6,inset_-6px_-6px_10px_#ffffff]', buttonSecondary: 'bg-[#E0E5EC] text-gray-600 shadow-[6px_6px_10px_#a3b1c6,-6px_-6px_10px_#ffffff] rounded-xl', inputBg: 'bg-[#E0E5EC]', inputBorder: 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] rounded-xl border-none', headerBg: 'bg-transparent', headerText: 'text-gray-700' },
  isometric: { id: 'isometric', name: 'Isometric', description: '等距', appBg: 'bg-blue-50', fontFamily: 'font-sans', sidebarBg: 'bg-white border-r border-b border-black', sidebarBorder: 'border-black', sidebarText: 'text-black', sidebarActiveItem: 'bg-purple-200 border-2 border-black shadow-[4px_4px_0_0_#000]', sidebarHoverItem: 'hover:bg-purple-50', cardBg: 'bg-white', cardBorder: 'border-2 border-black', cardShadow: 'shadow-[6px_6px_0_0_#000]', cardRadius: 'rounded-lg', cardHover: 'hover:-translate-y-2 hover:shadow-[10px_10px_0_0_#000] transition-all', textPrimary: 'text-black font-bold', textSecondary: 'text-gray-700', textMuted: 'text-gray-500', buttonPrimary: 'bg-pink-300 text-black border-2 border-black shadow-[4px_4px_0_0_#000]', buttonSecondary: 'bg-white text-black border-2 border-black shadow-[4px_4px_0_0_#000]', inputBg: 'bg-white', inputBorder: 'border-2 border-black shadow-[4px_4px_0_0_#000]', headerBg: 'bg-transparent', headerText: 'text-black' }
};

export const NOTE_COLOR_TINTS: Record<NoteColor, string> = {
  white: '',
  red: 'bg-red-50/50',
  orange: 'bg-orange-50/50',
  yellow: 'bg-yellow-50/50',
  green: 'bg-green-50/50',
  blue: 'bg-blue-50/50',
  purple: 'bg-purple-50/50',
  pink: 'bg-pink-50/50',
};
