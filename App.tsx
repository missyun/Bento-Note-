
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Plus, Settings, Palette, StickyNote, Grid, CheckSquare, 
  Star, Menu, Download, RefreshCw, CheckCircle2, Trash2, Archive, X, Check, Pin
} from 'lucide-react';
import { Note, FilterType, SortOrder, ThemeId, ToastMessage, BackupInterval, User, Folder, WebDavConfig, BackupLocation } from './types';
import { THEME_STYLES, DEFAULT_FOLDERS } from './constants';
import NoteCard from './components/NoteCard';
import NoteModal from './components/NoteModal';
import SettingsModal from './components/SettingsModal';
import FolderModal from './components/FolderModal';
import ConfirmModal from './components/ConfirmModal';
import Toast from './components/Toast';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Timeline from './components/Timeline';
import { db } from './utils/db'; 
import { WebDavClient } from './utils/webdav';
import { DropResult } from '@hello-pangea/dnd';

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 30 High Quality Chinese Demo Data Items Covering All Scenarios
const getInitialDemoData = (defaultFolderId: string): Note[] => {
    const now = Date.now();
    const day = 86400000;
    const hour = 3600000;
    const pid = 'personal'; const wid = 'work'; const sid = 'study'; const iid = 'ideas';
    
    return [
      // 1. Image Examples (New Request)
      { id: 'img1', title: '桌面搭建灵感 (图)', content: '最近想改造一下书桌，收集了一些极简风格灵感。\n\n![Desk Setup](https://images.unsplash.com/photo-1486946255434-2466348c2166?q=80&w=800&auto=format&fit=crop)\n\n**关键元素：**\n1. 升降桌 (胡桃木色)\n2. 屏幕挂灯\n3. 人体工学椅', tags: ['图片', '灵感', '桌面'], folderId: iid, isCompleted: false, isImportant: false, isPinned: true, color: 'white', createdAt: now - 2 * hour, updatedAt: now - 2 * hour, editorType: 'markdown' },
      { id: 'img2', title: '旅行回忆：冰岛', content: '世界的尽头，黑沙滩与极光。\n\n![Iceland](https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=800&auto=format&fit=crop)\n\n下次一定要带长焦镜头去。', tags: ['图片', '旅行', '摄影'], folderId: pid, isCompleted: false, isImportant: true, isPinned: false, color: 'blue', createdAt: now - 5 * day, updatedAt: now - 5 * day, editorType: 'markdown' },
      
      // Work - High Priority
      { id: 'n1', title: 'Q4 季度营销策划案', content: '# Q4 营销目标 🚀\n\n1. **用户增长**: 目标新增用户 50k\n2. **转化率**: 提升至 3.5%\n\n## 执行策略\n- [ ] 社交媒体广告投放\n- [ ] KOL 合作推广\n- [ ] 圣诞节特别活动\n\n| 渠道 | 预算 | 预期转化 |\n|---|---|---|\n| 抖音 | 50w | 2% |\n| 小红书 | 30w | 1.5% |', tags: ['工作', '策划', '重要'], folderId: wid, isCompleted: false, isImportant: true, isPinned: true, color: 'blue', createdAt: now, updatedAt: now, editorType: 'markdown' },
      { id: 'n2', title: '周一早会记录', content: '1. 上周数据复盘：DAU 增长 5%\n2. 产品部同步新版本功能\n3. 设计部周三前出 UI 稿\n\n> 下周重点：**双十一预热活动**', tags: ['工作', '会议'], folderId: wid, isCompleted: true, isImportant: false, isPinned: false, color: 'white', createdAt: now - day, updatedAt: now - day, editorType: 'markdown' },
      { id: 'n3', title: '前端架构优化方案', content: '```javascript\n// 优化前的组件渲染\nconst HeavyComponent = () => {\n  // ...heavy logic\n};\n\n// 优化方案：使用 React.memo 和 lazy loading\nconst OptimizedComponent = React.memo(() => {\n  return <LazyLoadedContent />;\n});\n```\n\n需要评估引入 Recoil 状态管理的可行性。', tags: ['工作', '代码', '技术'], folderId: wid, isCompleted: false, isImportant: true, isPinned: false, color: 'purple', createdAt: now - 2 * day, updatedAt: now - 2 * day, editorType: 'markdown' },
      
      // Personal - Life & Privacy
      { id: 'n4', title: '银行卡密码备份 (已加密)', content: '招商银行: 123456\n建设银行: 888888\n\n保险箱密码: 992211', tags: ['生活', '隐私'], folderId: pid, isCompleted: false, isImportant: true, isPinned: true, color: 'red', createdAt: now - hour, updatedAt: now - hour, isLocked: true, password: '1234', editorType: 'plain' },
      { id: 'n5', title: '周末超市采购清单', content: '- [x] 牛奶 2 盒\n- [ ] 全麦面包\n- [ ] 鸡蛋\n- [ ] 咖啡豆 (深度烘焙)\n- [ ] 洗衣液', tags: ['生活', '购物'], folderId: pid, isCompleted: false, isImportant: false, isPinned: false, color: 'yellow', createdAt: now - 3 * hour, updatedAt: now - 3 * hour, editorType: 'markdown' },
      { id: 'n6', title: '健身计划 - 第 2 阶段', content: '周一：胸肌 + 三头\n周三：背部 + 二头\n周五：腿部 + 肩部\n周日：有氧 5km', tags: ['生活', '健康'], folderId: pid, isCompleted: false, isImportant: false, isPinned: true, color: 'green', createdAt: now - 5 * day, updatedAt: now - 5 * day, editorType: 'plain' },
      
      // Study - Notes & Reading
      { id: 'n7', title: '《纳瓦尔宝典》读书笔记', content: '### 财富与幸福\n\n1. **财富是你在睡觉时也能赚钱的资产**。\n2. **依靠复利**：无论是财富、人际关系还是知识。\n3. **特殊知识**：无法通过培训获得的知识。\n\n> "读你能读懂的书，直到你爱上读书。"', tags: ['学习', '读书'], folderId: sid, isCompleted: false, isImportant: true, isPinned: false, color: 'orange', createdAt: now - 10 * day, updatedAt: now - 10 * day, editorType: 'markdown' },
      { id: 'n8', title: 'Rust 语言基础 - 所有权', content: '所有权规则：\n1. Rust 中的每一个值都有一个被称为其 **所有者**（owner）的变量。\n2. 值在任一时刻有且只有一个所有者。\n3. 当所有者（变量）离开作用域，这个值将被丢弃。', tags: ['学习', '编程', 'Rust'], folderId: sid, isCompleted: false, isImportant: false, isPinned: false, color: 'white', createdAt: now - 12 * day, updatedAt: now - 12 * day, editorType: 'plain' },
      
      // Ideas - Creative
      { id: 'n9', title: 'App 灵感：AI 宠物生成器', content: '用户输入描述，生成独一无二的 3D 宠物。\n可以互动、喂养。\n结合 AR 技术，在现实中查看。', tags: ['灵感', 'AI'], folderId: iid, isCompleted: false, isImportant: false, isPinned: false, color: 'pink', createdAt: now - 15 * day, updatedAt: now - 15 * day, editorType: 'plain' },
      
      // More random data to fill space
      { id: 'n10', title: '旅行清单：日本京都', content: '清水寺\n伏见稻荷大社\n金阁寺\n岚山小火车', tags: ['生活', '旅行'], folderId: pid, isCompleted: true, isImportant: false, isPinned: false, color: 'blue', createdAt: now - 20 * day, updatedAt: now - 20 * day, editorType: 'markdown' },
      { id: 'n11', title: '常用的 Linux 命令', content: '`ls -la`\n`chmod 777`\n`ps aux | grep node`\n`tar -xvf file.tar.gz`', tags: ['技术', '备忘'], folderId: wid, isCompleted: false, isImportant: false, isPinned: false, color: 'white', createdAt: now - 25 * day, updatedAt: now - 25 * day, editorType: 'markdown' },
      { id: 'n12', title: '待办事项：车辆保养', content: '更换机油\n检查刹车片\n清洗空调滤芯', tags: ['生活', '待办'], folderId: pid, isCompleted: false, isImportant: true, isPinned: false, color: 'red', createdAt: now - 2 * hour, updatedAt: now - 2 * hour, editorType: 'plain' },
      { id: 'n13', title: '食谱：红烧肉', content: '五花肉切块，焯水。\n炒糖色，加入肉块翻炒。\n加入生抽、老抽、料酒、八角、桂皮。\n加水炖煮 1 小时。', tags: ['生活', '美食'], folderId: pid, isCompleted: false, isImportant: false, isPinned: false, color: 'orange', createdAt: now - 8 * day, updatedAt: now - 8 * day, editorType: 'markdown' },
      { id: 'n14', title: '项目 A 进度汇报', content: '目前进度 80%，预计下周五上线。', tags: ['工作'], folderId: wid, isCompleted: false, isImportant: false, isPinned: false, color: 'white', createdAt: now - 3 * day, updatedAt: now - 3 * day, editorType: 'plain' },
      { id: 'n15', title: '英语单词打卡 Day 15', content: 'Ubiquitous - 无处不在的\nEphemeral - 短暂的\nSerendipity - 意外发现珍宝的运气', tags: ['学习', '英语'], folderId: sid, isCompleted: true, isImportant: false, isPinned: false, color: 'green', createdAt: now - 1 * day, updatedAt: now - 1 * day, editorType: 'markdown' },
      { id: 'n16', title: 'Design System 规范 v2.0', content: 'Primary Color: #3B82F6\nSecondary Color: #10B981\nFont: Inter, sans-serif', tags: ['工作', '设计'], folderId: wid, isCompleted: false, isImportant: true, isPinned: false, color: 'purple', createdAt: now - 6 * day, updatedAt: now - 6 * day, editorType: 'plain' },
      { id: 'n17', title: '电影清单', content: '- [ ] 星际穿越\n- [ ] 盗梦空间\n- [x] 奥本海默', tags: ['生活', '娱乐'], folderId: pid, isCompleted: false, isImportant: false, isPinned: false, color: 'yellow', createdAt: now - 30 * day, updatedAt: now - 30 * day, editorType: 'markdown' },
      { id: 'n18', title: 'LeetCode 每日一题', content: '题目：两数之和\n思路：使用哈希表存储已遍历的数值和索引。', tags: ['学习', '算法'], folderId: sid, isCompleted: true, isImportant: false, isPinned: false, color: 'white', createdAt: now - 4 * day, updatedAt: now - 4 * day, editorType: 'markdown' },
      { id: 'n19', title: '新房装修灵感', content: '北欧极简风格，大量使用原木色。\n客厅不要电视，改用投影仪。\n开放式厨房。', tags: ['生活', '装修'], folderId: pid, isCompleted: false, isImportant: false, isPinned: false, color: 'white', createdAt: now - 40 * day, updatedAt: now - 40 * day, editorType: 'plain' },
      { id: 'n20', title: 'Bug 修复记录 #3421', content: '原因：空指针异常。\n修复：添加了 Optional 链式调用。', tags: ['工作', 'Bug'], folderId: wid, isCompleted: true, isImportant: false, isPinned: false, color: 'red', createdAt: now - 2 * day, updatedAt: now - 2 * day, editorType: 'plain' },
      { id: 'n21', title: '年度体检预约', content: '时间：下周六上午 8:00\n地点：爱康国宾\n注意事项：空腹', tags: ['生活', '健康'], folderId: pid, isCompleted: false, isImportant: true, isPinned: false, color: 'white', createdAt: now - 5 * hour, updatedAt: now - 5 * hour, editorType: 'plain' },
      { id: 'n22', title: 'React Hooks 最佳实践', content: '1. 不要在循环、条件或嵌套函数中调用 Hooks。\n2. 总是从 React 函数的顶层调用 Hooks。', tags: ['学习', 'React'], folderId: sid, isCompleted: false, isImportant: false, isPinned: false, color: 'blue', createdAt: now - 18 * day, updatedAt: now - 18 * day, editorType: 'markdown' },
      { id: 'n23', title: '送给女朋友的礼物', content: '项链？\n拍立得相机？\n手写信？', tags: ['生活', '礼物'], folderId: pid, isCompleted: false, isImportant: true, isPinned: false, color: 'pink', createdAt: now - 7 * day, updatedAt: now - 7 * day, editorType: 'plain' },
      { id: 'n24', title: '服务器迁移计划', content: '1. 备份数据库\n2. 停止旧服务\n3. 迁移数据\n4. 启动新服务\n5. DNS 解析切换', tags: ['工作', '运维'], folderId: wid, isCompleted: false, isImportant: true, isPinned: false, color: 'white', createdAt: now - 9 * day, updatedAt: now - 9 * day, editorType: 'markdown' },
      { id: 'n25', title: '冥想 10 分钟', content: '关注呼吸，放松身心。', tags: ['生活', '健康'], folderId: pid, isCompleted: true, isImportant: false, isPinned: false, color: 'green', createdAt: now - 1 * hour, updatedAt: now - 1 * hour, editorType: 'plain' },
      { id: 'n26', title: 'Typescript 高级类型', content: 'Partial, Pick, Omit, Record...', tags: ['学习', 'TS'], folderId: sid, isCompleted: false, isImportant: false, isPinned: false, color: 'blue', createdAt: now - 22 * day, updatedAt: now - 22 * day, editorType: 'plain' },
      { id: 'n27', title: '咖啡豆评测', content: '埃塞俄比亚耶加雪菲：果酸明亮，花香浓郁。\n苏门答腊曼特宁：口感醇厚，草药味。', tags: ['生活', '爱好'], folderId: pid, isCompleted: false, isImportant: false, isPinned: false, color: 'orange', createdAt: now - 14 * day, updatedAt: now - 14 * day, editorType: 'markdown' },
      { id: 'n28', title: 'Obsidian 插件推荐', content: '1. Dataview\n2. Excalidraw\n3. Templater', tags: ['工具', '效率'], folderId: iid, isCompleted: false, isImportant: false, isPinned: false, color: 'purple', createdAt: now - 11 * day, updatedAt: now - 11 * day, editorType: 'markdown' },
      { id: 'n29', title: '创业点子：垂直领域的 Notion', content: '专门针对律师或医生的知识管理工具。', tags: ['灵感', '创业'], folderId: iid, isCompleted: false, isImportant: false, isPinned: false, color: 'white', createdAt: now - 28 * day, updatedAt: now - 28 * day, editorType: 'plain' },
      { id: 'n30', title: '今日心情', content: '天气晴朗，心情不错。', tags: ['生活', '日记'], folderId: pid, isCompleted: true, isImportant: false, isPinned: false, color: 'yellow', createdAt: now, updatedAt: now, editorType: 'plain' }
    ];
};

const App: React.FC = () => {
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smart_notes_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // --- App Global State ---
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem('smart_notes_theme_id') as ThemeId) || 'ios';
  });
  
  // New Settings State
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [fontSize, setFontSize] = useState<'text-sm' | 'text-base' | 'text-lg'>('text-base');
  const [showTimeWidget, setShowTimeWidget] = useState(true);
  const [gridColumns, setGridColumns] = useState<number>(4);

  // WebDAV Config State
  const [webDavConfig, setWebDavConfig] = useState<WebDavConfig>(() => {
    const saved = localStorage.getItem('smart_notes_webdav');
    return saved ? JSON.parse(saved) : { url: '', username: '', password: '' };
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // --- Data State ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>(DEFAULT_FOLDERS);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- UI State ---
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Scroll & Header UI State ---
  const [showSearchHeader, setShowSearchHeader] = useState(true);
  const lastScrollY = useRef(0);
  
  // Modals
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Confirm Modal State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const [backupInterval, setBackupInterval] = useState<BackupInterval>('off');
  const [backupLocation, setBackupLocation] = useState<BackupLocation>(() => {
    return (localStorage.getItem('smart_notes_backup_location') as BackupLocation) || 'webdav';
  });
  // New: Local Backup Path State
  const [localBackupPath, setLocalBackupPath] = useState<string>(() => {
    return localStorage.getItem('smart_notes_local_backup_path') || '';
  });

  const [lastBackupTime, setLastBackupTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('smart_notes_last_backup');
    return saved ? parseInt(saved, 10) : null;
  });

  // --- Batch Operation State ---
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());

  // --- Reminder Tracking ---
  const notifiedReminders = useRef(new Set<string>());

  const theme = THEME_STYLES[currentThemeId];
  
  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('smart_notes_webdav', JSON.stringify(webDavConfig));
  }, [webDavConfig]);

  useEffect(() => {
    localStorage.setItem('smart_notes_backup_location', backupLocation);
  }, [backupLocation]);

  useEffect(() => {
    localStorage.setItem('smart_notes_local_backup_path', localBackupPath);
  }, [localBackupPath]);

  useEffect(() => {
    if (lastBackupTime) {
      localStorage.setItem('smart_notes_last_backup', lastBackupTime.toString());
    }
  }, [lastBackupTime]);

  // --- EXPORT FUNCTION ---
  const handleExportData = async () => {
    if (!currentUser) return;
    try {
      const data = await db.getAllData(currentUser.username);
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bento_note_backup_${currentUser.username}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('success', '本地备份已下载');
    } catch (e) {
      console.error(e);
      showToast('error', '导出失败');
    }
  };

  const handleImportData = async (file: File) => {
    if (!currentUser) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.notes && data.folders) {
        await db.importData(data.notes, data.folders, currentUser.username);
        // Reload data
        const notes = await db.getNotes(currentUser.username);
        const folders = await db.getFolders(currentUser.username);
        setNotes(notes);
        setFolders(folders.length > 0 ? folders : DEFAULT_FOLDERS);
        showToast('success', '数据导入成功');
        setIsSettingsModalOpen(false);
      } else {
        showToast('error', '无效的备份文件');
      }
    } catch (e) {
      console.error(e);
      showToast('error', '导入失败');
    }
  };

  // --- AUTO BACKUP LOGIC ---
  useEffect(() => {
    if (backupInterval === 'off' || !currentUser) return;

    const performAutoBackup = async () => {
      const now = Date.now();
      let intervalMs = 0;
      switch (backupInterval) {
        case '15m': intervalMs = 15 * 60 * 1000; break;
        case '1h': intervalMs = 60 * 60 * 1000; break;
        case '6h': intervalMs = 6 * 60 * 60 * 1000; break;
        case '12h': intervalMs = 12 * 60 * 60 * 1000; break;
        case '24h': intervalMs = 24 * 60 * 60 * 1000; break;
        default: return;
      }

      if (!lastBackupTime || (now - lastBackupTime > intervalMs)) {
        console.log('触发自动备份...', backupLocation);
        
        try {
          const data = await db.getAllData(currentUser.username);
          const jsonStr = JSON.stringify(data, null, 2);
          const filename = `bento_note_auto_backup_${currentUser.username}.json`;

          if (backupLocation === 'webdav') {
             // WebDAV Upload Logic
             if (!webDavConfig.url) {
                console.warn('Auto backup skipped: WebDAV not configured');
                return;
             }
             const client = new WebDavClient(webDavConfig);
             const isConnected = await client.checkConnection();
             
             if (isConnected) {
                const success = await client.uploadFile(filename, jsonStr);
                if (success) {
                   setLastBackupTime(now);
                   showToast('success', '自动备份成功 (WebDAV)');
                } else {
                   console.warn('自动备份上传失败');
                }
             } else {
                console.warn('自动备份失败: WebDAV 无法连接');
             }
          } else {
             // Local Backup Logic
             
             // Check if we are in Electron and have a path set
             if ((window as any).require && localBackupPath) {
                try {
                   const fs = (window as any).require('fs');
                   const path = (window as any).require('path');
                   const fullPath = path.join(localBackupPath, filename);
                   fs.writeFileSync(fullPath, jsonStr);
                   setLastBackupTime(now);
                   showToast('success', `自动备份已保存至: ${fullPath}`);
                } catch (err) {
                   console.error('Electron file write failed:', err);
                   // Fallback to download if file write fails? 
                   // No, better to just log it, as popup might be annoying.
                   showToast('error', '自动备份写入失败，请检查目录权限');
                }
             } else {
                // Browser Fallback: Trigger Download
                // Note: Modern browsers often block automatic downloads without user interaction.
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setLastBackupTime(now);
                showToast('success', '自动备份已下载');
             }
          }
        } catch (error) {
          console.error('Auto backup error:', error);
        }
      }
    };

    // Check every minute
    const timer = setInterval(performAutoBackup, 60 * 1000);
    // Initial check after mount (delayed slightly to ensure DB is ready)
    const initTimer = setTimeout(performAutoBackup, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(initTimer);
    };
  }, [backupInterval, backupLocation, webDavConfig, currentUser, lastBackupTime, localBackupPath]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setEditingNote(null);
        setModalMode('edit');
        setIsNoteModalOpen(true);
      }
      if (e.key === 'Escape') {
        setIsNoteModalOpen(false);
        setIsFolderModalOpen(false);
        setIsSettingsModalOpen(false);
        setConfirmState(prev => Object.assign({}, prev, { isOpen: false }));
        setIsThemeMenuOpen(false);
        setIsSelectionMode(false);
        setSelectedNoteIds(new Set());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check Reminders Effect (Improved)
  useEffect(() => {
    if (!("Notification" in window)) return;
    
    // Increased frequency to 5s for better precision
    const interval = setInterval(() => {
       const now = Date.now();
       notes.forEach(note => {
          // Check if time is valid and within the last 60 seconds
          if (note.reminderTime && note.reminderTime <= now && note.reminderTime > now - 60000) {
             
             // Check if already notified for this specific reminder instance
             const notificationKey = `${note.id}-${note.reminderTime}`;
             if (notifiedReminders.current.has(notificationKey)) {
                return;
             }

             // Fire Notification
             if (Notification.permission === "granted") {
                new Notification("Bento Note 提醒", {
                   body: note.title,
                   icon: '/icon.png' 
                });
             }
             showToast('info', `提醒: ${note.title}`);
             
             // Mark as notified so it doesn't fire again in the next loop tick
             notifiedReminders.current.add(notificationKey);
          }
       });
    }, 5000); 
    
    return () => clearInterval(interval);
  }, [notes]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Data Loading
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      setIsLoading(true);
      try {
        const userId = currentUser.username;
        let loadedNotes: Note[] = await db.getNotes(userId);
        let loadedFolders: Folder[] = await db.getFolders(userId);

        if (loadedNotes.length === 0 && loadedFolders.length === 0) {
            const demoNotes = getInitialDemoData('personal');
            const demoFolders = DEFAULT_FOLDERS;
            await db.importData(demoNotes, demoFolders, userId);
            loadedNotes = demoNotes;
            loadedFolders = demoFolders;
        }
        loadedFolders.sort((a, b) => (a.order || 0) - (b.order || 0));
        setNotes(loadedNotes);
        setFolders(loadedFolders.length > 0 ? loadedFolders : DEFAULT_FOLDERS);
      } catch(e) { console.error(e); }
      setIsLoading(false);
    };
    loadData();
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('smart_notes_theme_id', currentThemeId);
  }, [currentThemeId]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('smart_notes_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('smart_notes_current_user');
    }
  }, [currentUser]);
  
  const filteredNotes = useMemo(() => {
    let result = notes;
    if (activeFolderId !== 'all' && activeFolderId !== 'dashboard' && activeFolderId !== 'timeline') {
      result = result.filter(n => n.folderId === activeFolderId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(q) || 
        (!n.isLocked && n.content.toLowerCase().includes(q)) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    switch (filter) {
      case 'active': result = result.filter(n => !n.isCompleted); break;
      case 'completed': result = result.filter(n => n.isCompleted); break;
      case 'important': result = result.filter(n => n.isImportant); break;
      case 'today': result = result.filter(n => new Date(n.createdAt) >= today); break;
    }
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return sortOrder === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
    });
  }, [notes, searchQuery, filter, sortOrder, activeFolderId]);

  // --- Handlers ---
  const handleLogin = (username: string) => {
    // Generate a random seed for the avatar to ensure variety
    const avatarSeed = Math.random().toString(36).substring(7);
    setCurrentUser({ 
      username, 
      isAdmin: username === 'admin', 
      lastLogin: Date.now(),
      avatar: avatarSeed 
    });
  };
  const handleLogout = () => { setCurrentUser(null); setNotes([]); setFolders(DEFAULT_FOLDERS); };
  const showToast = (type: any, msg: string) => setToast({ id: Date.now().toString(), type, message: msg });
  
  // Batch Operations Logic
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedNoteIds(new Set());
  };

  const toggleNoteSelection = (id: string) => {
    const newSet = new Set(selectedNoteIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedNoteIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedNoteIds.size === filteredNotes.length) {
      setSelectedNoteIds(new Set());
    } else {
      setSelectedNoteIds(new Set(filteredNotes.map(n => n.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (!currentUser || selectedNoteIds.size === 0) return;
    setConfirmState({
      isOpen: true,
      title: '批量删除',
      message: `确定要删除选中的 ${selectedNoteIds.size} 个便签吗？`,
      onConfirm: async () => {
        for (const id of selectedNoteIds) {
          await db.deleteNote(id);
        }
        setNotes(prev => prev.filter(n => !selectedNoteIds.has(n.id)));
        setSelectedNoteIds(new Set());
        setIsSelectionMode(false);
        showToast('success', '已批量删除');
      }
    });
  };

  const handleBatchComplete = async () => {
    if (!currentUser || selectedNoteIds.size === 0) return;
    const updates = notes.filter(n => selectedNoteIds.has(n.id)).map(n => ({ ...n, isCompleted: !n.isCompleted }));
    for (const note of updates) {
       await db.saveNote(note, currentUser.username);
    }
    setNotes(prev => prev.map(n => selectedNoteIds.has(n.id) ? { ...n, isCompleted: !n.isCompleted } : n));
    setSelectedNoteIds(new Set());
    setIsSelectionMode(false);
    showToast('success', '批量状态已更新');
  };

  const handleBatchImportant = async () => {
     if (!currentUser || selectedNoteIds.size === 0) return;
     // Toggle based on first item logic
     const firstNote = notes.find(n => selectedNoteIds.has(n.id));
     if (!firstNote) return;
     const newValue = !firstNote.isImportant;
     
     const updates = notes.filter(n => selectedNoteIds.has(n.id)).map(n => ({ ...n, isImportant: newValue }));
     for (const note of updates) {
        await db.saveNote(note, currentUser.username);
     }
     setNotes(prev => prev.map(n => selectedNoteIds.has(n.id) ? { ...n, isImportant: newValue } : n));
     setSelectedNoteIds(new Set());
     setIsSelectionMode(false);
     showToast('success', '批量标记已更新');
  };

  const handleBatchPin = async () => {
     if (!currentUser || selectedNoteIds.size === 0) return;
     // Toggle based on first item logic
     const firstNote = notes.find(n => selectedNoteIds.has(n.id));
     if (!firstNote) return;
     const newValue = !firstNote.isPinned;
     
     const updates = notes.filter(n => selectedNoteIds.has(n.id)).map(n => ({ ...n, isPinned: newValue }));
     for (const note of updates) {
        await db.saveNote(note, currentUser.username);
     }
     setNotes(prev => prev.map(n => selectedNoteIds.has(n.id) ? { ...n, isPinned: newValue } : n));
     setSelectedNoteIds(new Set());
     setIsSelectionMode(false);
     showToast('success', '批量置顶已更新');
  };

  // ... (Existing handlers)
  const handleSaveNewFolder = async (name: string, icon: string) => {
      if (!currentUser) return;
      const maxOrder = folders.length > 0 ? Math.max(...folders.map(f => f.order || 0)) : -1;
      const newFolder: Folder = { id: generateId(), name, icon, order: maxOrder + 1 };
      
      const folderToEdit = editingFolder; 
      if (folderToEdit) {
         const currentFolder: Folder = folderToEdit;
         await db.saveFolder(Object.assign({}, currentFolder, { name, icon }), currentUser.username);
         setFolders(prev => prev.map(f => f.id === currentFolder.id ? Object.assign({}, f, { name, icon }) : f));
      } else {
         await db.saveFolder(newFolder, currentUser.username);
         setFolders(prev => [...prev, newFolder]);
      }
      setIsFolderModalOpen(false);
  };
  
  const performDeleteFolder = async (id: string) => {
      if(!currentUser) return;
      await db.deleteFolder(id);
      setFolders(prev => prev.filter(f => f.id !== id));
      if (activeFolderId === id) setActiveFolderId('all');
  };

  const handleReorderFolders = async (result: DropResult) => {
    if (!result.destination || !currentUser) return;
    const items = [...folders];
    const [reorderedItem] = items.splice(result.source.index, 1);
    if (!reorderedItem) return;
    items.splice(result.destination.index, 0, reorderedItem);
    const updatedFolders = items.map((folder, index) => Object.assign({}, folder, { order: index }));
    setFolders(updatedFolders);
    for (const f of updatedFolders) {
       await db.saveFolder(f, currentUser.username);
    }
  };

  const handleAddNote = async (data: any) => {
      if(!currentUser) return;
      const newNote = Object.assign({}, data, { id: generateId(), createdAt: Date.now(), updatedAt: Date.now() });
      await db.saveNote(newNote, currentUser.username);
      setNotes(prev => [newNote, ...prev]);
  };
  const handleUpdateNote = async (data: any) => {
      if(!currentUser || !editingNote) return;
      const currentNote: Note = editingNote;
      const updated = Object.assign({}, currentNote, data, { updatedAt: Date.now() });
      await db.saveNote(updated, currentUser.username);
      setNotes(prev => prev.map(n => n.id === currentNote.id ? updated : n));
  };
  const handleDeleteNote = async (id: string) => {
      await db.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
  };
  const handleToggleComplete = async (id: string) => {
      if(!currentUser) return;
      const target = notes.find(n => n.id === id);
      if(target) {
          const updated = Object.assign({}, target, { isCompleted: !target.isCompleted });
          await db.saveNote(updated, currentUser.username);
          setNotes(prev => prev.map(n => n.id === id ? updated : n));
      }
  };
   const handleTogglePin = async (id: string) => {
      if(!currentUser) return;
      const target = notes.find(n => n.id === id);
      if(target) {
          const updated = Object.assign({}, target, { isPinned: !target.isPinned });
          await db.saveNote(updated, currentUser.username);
          setNotes(prev => prev.map(n => n.id === id ? updated : n));
      }
  };

  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setShowSearchHeader(false);
    } else {
      setShowSearchHeader(true);
    }
    lastScrollY.current = currentScrollY;
  };

  const getGridClass = (cols: number) => {
    switch(cols) {
      case 2: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3';
      case 5: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
      case 6: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'; 
    }
  };

  if (!currentUser) return <Auth onLogin={handleLogin} currentThemeId={currentThemeId} />;

  return (
    <div className={`
      h-screen w-full flex flex-col lg:flex-row overflow-hidden relative 
      ${theme.appBg} ${theme.fontFamily} ${fontSize}
      lg:p-6 lg:gap-6
      transition-colors duration-500
    `}>
      <div className="bg-noise"></div>

      {currentThemeId === 'glass' && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600 rounded-full blur-[150px] opacity-40 animate-mesh"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600 rounded-full blur-[150px] opacity-40 animate-mesh animation-delay-2000"></div>
        </div>
      )}
      {currentThemeId === 'warm' && (
        <div className="fixed inset-0 z-0 pointer-events-none">
           <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-[#E6C6A0]/20 to-transparent"></div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden shrink-0 px-4 py-3 flex items-center justify-between z-50 relative">
         <button onClick={() => setIsMobileMenuOpen(true)} className={`p-2 rounded-lg ${theme.id === 'glass' ? 'bg-white/10 text-white' : 'bg-white/50 text-gray-800'}`}>
             <Menu size={24} />
         </button>
         <h1 className={`font-bold ${theme.headerText}`}>Bento Note</h1>
         <div className="w-8"></div>
      </div>

      {/* Sidebar */}
      <div className={`
         fixed lg:static inset-y-0 left-0 z-50 transform transition-all duration-500 cubic-bezier(0.2, 0.8, 0.2, 1)
         ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
         ${isSidebarVisible ? 'lg:w-80 lg:opacity-100' : 'lg:w-0 lg:opacity-0 lg:overflow-hidden'}
         flex-shrink-0
      `}>
          <Sidebar 
            user={currentUser}
            folders={folders}
            activeFolderId={activeFolderId}
            onSelectFolder={setActiveFolderId}
            onCreateFolder={() => { setEditingFolder(null); setIsFolderModalOpen(true); }}
            onDeleteFolder={(id) => setConfirmState({ isOpen: true, title: '删除', message: '确认删除？', onConfirm: () => performDeleteFolder(id) })}
            onEditFolder={(f) => { setEditingFolder(f); setIsFolderModalOpen(true); }}
            onLogout={handleLogout}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            theme={theme}
            isOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            onReorder={handleReorderFolders}
          />
      </div>

      {/* Main Content */}
      <main className={`
        flex-1 flex flex-col h-full overflow-hidden relative z-10 
        lg:rounded-[2.5rem]
        transition-all duration-300
        ${theme.id === 'glass' ? 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl' : ''}
        ${theme.id === 'ios' ? 'bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl' : ''}
        ${theme.id === 'warm' ? 'bg-[#FDFBF7] shadow-[inset_0_0_60px_rgba(214,210,196,0.2)] border border-[#EBE5D5]' : ''}
        ${theme.id === 'pixel' ? 'bg-transparent' : ''} 
        ${theme.id === 'cyberpunk' ? 'bg-black/40 backdrop-blur-md border border-white/5' : ''}
        ${theme.id === 'retro' ? 'bg-[#EAE0D5]/90 border border-[#5E503F]/20' : ''}
        ${theme.id === 'sketch' ? 'bg-white/90 border border-black/5' : ''}
        ${theme.id === 'industrial' ? 'bg-[#E5E5E5]/80 border border-white/20' : ''}
        ${!['glass','ios','warm','pixel','cyberpunk','retro','sketch','industrial'].includes(theme.id) ? 'bg-white/80 backdrop-blur-md shadow-xl' : ''}
      `}>
        
        <header className={`px-8 py-6 flex items-center justify-between shrink-0 transition-all duration-300 ${!showSearchHeader ? 'shadow-sm z-20 bg-white/5 backdrop-blur-sm' : ''}`}>
           <div className="flex items-center gap-4">
              <h1 className={`text-2xl font-bold ${theme.headerText} flex items-center gap-2`}>
                 {activeFolderId === 'dashboard' ? '数据看板' : activeFolderId === 'timeline' ? '时光机' : (folders.find(f => f.id === activeFolderId)?.name || '全部便签')}
                 {activeFolderId !== 'dashboard' && activeFolderId !== 'timeline' && <span className="opacity-40 text-sm font-normal">({filteredNotes.length})</span>}
                 {isLoading && <RefreshCw className="animate-spin ml-2" size={16} />}
              </h1>
           </div>
           
           <div className="flex items-center gap-4">
              {deferredPrompt && (
                <button onClick={() => { deferredPrompt.prompt(); setDeferredPrompt(null); }} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold rounded-full hover:scale-105 transition-transform">
                   <Download size={14} /> Install App
                </button>
              )}
              <div className="relative flex items-center gap-2">
                
                {/* Batch Selection Button */}
                {activeFolderId !== 'dashboard' && activeFolderId !== 'timeline' && (
                    <button 
                        onClick={toggleSelectionMode} 
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-bold shadow-sm
                            ${isSelectionMode 
                                ? 'bg-blue-600 text-white' 
                                : theme.buttonSecondary}
                        `}
                    >
                        {isSelectionMode ? <Check size={18} /> : <CheckSquare size={18} />}
                        <span className="hidden sm:inline">{isSelectionMode ? '完成选择' : '批量管理'}</span>
                    </button>
                )}

                <button 
                  onClick={() => setIsSettingsModalOpen(true)} 
                  className={`flex items-center justify-center p-2 rounded-full transition-all hover:rotate-90 ${theme.buttonSecondary}`}
                  title="设置"
                >
                   <Settings size={20} />
                </button>

                <button onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all hover:scale-105 rounded-full ${theme.buttonSecondary}`}>
                  <Palette size={18} />
                  <span className="hidden sm:inline">主题</span>
                </button>
                {isThemeMenuOpen && (
                  <>
                     <div className="fixed inset-0 z-50" onClick={() => setIsThemeMenuOpen(false)}></div>
                     <div 
                        className={`fixed right-8 top-24 w-64 p-3 z-[100] animate-fade-in-down grid grid-cols-1 gap-1 ${theme.id === 'glass' ? 'bg-black/90 backdrop-blur-xl border border-white/20' : 'bg-white shadow-2xl border border-gray-100'} ${theme.cardRadius} overflow-y-auto max-h-[60vh]`}
                        style={{boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'}}
                     >
                        {Object.values(THEME_STYLES).map((t) => (
                        <button key={t.id} onClick={() => { setCurrentThemeId(t.id as ThemeId); setIsThemeMenuOpen(false); }} className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-all rounded-xl ${currentThemeId === t.id ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                           <span>{t.name}</span>
                           {currentThemeId === t.id && <div className="w-2 h-2 rounded-full bg-green-400"></div>}
                        </button>
                        ))}
                     </div>
                  </>
                )}
              </div>
           </div>
        </header>

        {activeFolderId === 'dashboard' ? (
           <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
             <Dashboard notes={notes} folders={folders} theme={theme} showTimeWidget={showTimeWidget} />
           </div>
        ) : activeFolderId === 'timeline' ? (
           <Timeline 
              notes={notes} 
              theme={theme}
              onView={(n) => { setEditingNote(n); setModalMode('view'); setIsNoteModalOpen(true); }}
              onEdit={(n) => { setEditingNote(n); setModalMode('edit'); setIsNoteModalOpen(true); }} 
              onDelete={handleDeleteNote} 
              onToggleComplete={handleToggleComplete} 
              onTogglePin={handleTogglePin} 
           />
        ) : (
           <>
              <div className={`shrink-0 transition-all duration-500 ease-in-out overflow-hidden px-8 ${showSearchHeader ? 'max-h-60 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                     <div className="relative flex-1 group">
                        <Search className={`absolute left-5 top-1/2 transform -translate-y-1/2 ${theme.textMuted}`} size={20} />
                        <input type="text" placeholder="搜索知识库..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-12 pr-6 py-4 outline-none transition-all shadow-sm ${theme.inputBg} ${theme.inputBorder} ${theme.cardRadius}`} />
                     </div>
                     <button onClick={() => { setEditingNote(null); setModalMode('edit'); setIsNoteModalOpen(true); }} className={`flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all whitespace-nowrap ${theme.buttonPrimary}`}>
                        <Plus size={20} /> 新建便签
                     </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                       {[ { id: 'all', label: '全部', icon: Grid }, { id: 'active', label: '待办', icon: StickyNote }, { id: 'completed', label: '已归档', icon: CheckSquare }, { id: 'important', label: '星标', icon: Star }].map(f => {
                          const Icon = f.icon;
                          const isActive = filter === f.id;
                          return (
                            <button key={f.id} onClick={() => setFilter(f.id as FilterType)} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all rounded-full ${isActive ? 'bg-black text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                              <Icon size={14} /> {f.label}
                            </button>
                          )
                        })}
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto px-8 pt-6 pb-24 custom-scrollbar" onScroll={handleContentScroll}>
                  <div className={`grid gap-6 items-start ${getGridClass(gridColumns)}`}>
                    {filteredNotes.map((note, index) => (
                        <NoteCard 
                          key={note.id}
                          note={note} 
                          index={index} 
                          theme={theme} 
                          onView={(n) => { setEditingNote(n); setModalMode('view'); setIsNoteModalOpen(true); }}
                          onEdit={(n) => { setEditingNote(n); setModalMode('edit'); setIsNoteModalOpen(true); }} 
                          onDelete={handleDeleteNote} 
                          onToggleComplete={handleToggleComplete} 
                          onTogglePin={handleTogglePin}
                          // Selection props
                          isSelectionMode={isSelectionMode}
                          isSelected={selectedNoteIds.has(note.id)}
                          onSelect={toggleNoteSelection}
                        />
                    ))}
                    
                    {filteredNotes.length === 0 && !isLoading && (
                      <div className="col-span-full flex flex-col items-center justify-center py-32 opacity-50">
                          <div className={`p-8 rounded-full mb-6 ${theme.id === 'glass' ? 'bg-white/10' : 'bg-gray-100'}`}>
                            <StickyNote size={64} className="opacity-30" />
                          </div>
                          <p className="text-lg font-medium opacity-60">暂无内容</p>
                      </div>
                    )}
                  </div>
              </div>
              
              {/* Floating Action Button for New Note - Fallback when header is hidden */}
              <button
                onClick={() => { setEditingNote(null); setModalMode('edit'); setIsNoteModalOpen(true); }}
                className={`
                    fixed bottom-8 right-8 p-4 rounded-full shadow-2xl transition-all duration-300 z-40
                    ${!showSearchHeader || window.innerWidth < 768 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
                    ${theme.buttonPrimary}
                `}
                title="新建便签"
              >
                <Plus size={24} />
              </button>
           </>
        )}

        {/* ALWAYS VISIBLE BATCH ACTION BAR when in Selection Mode */}
        {isSelectionMode && (
             <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[60] animate-spring-up w-[90%] max-w-md">
                 <div className={`
                     flex items-center justify-between p-2 rounded-2xl shadow-2xl backdrop-blur-xl border
                     ${theme.id === 'glass' ? 'bg-gray-900/90 border-white/20' : 'bg-white/95 border-gray-200'}
                     ${theme.id === 'pixel' ? 'rounded-none border-4 border-black bg-white shadow-[4px_4px_0_0_black]' : ''}
                 `}>
                     <button onClick={handleSelectAll} className={`px-4 py-2 text-xs font-bold ${theme.id === 'glass' ? 'text-white' : 'text-gray-700'}`}>
                        {selectedNoteIds.size === filteredNotes.length && filteredNotes.length > 0 ? '取消全选' : '全选'}
                     </button>

                     <div className={`px-2 font-bold text-sm ${theme.id === 'glass' ? 'text-white' : 'text-gray-900'}`}>
                         已选 {selectedNoteIds.size} 项
                     </div>
                     
                     <div className="flex gap-1">
                        <button 
                            onClick={handleBatchComplete} 
                            disabled={selectedNoteIds.size === 0}
                            className={`p-3 rounded-xl transition-colors ${selectedNoteIds.size === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-green-50 hover:text-green-600'} ${theme.id === 'pixel' ? 'rounded-none' : ''} text-gray-500`} 
                            title="批量完成"
                        >
                            <CheckCircle2 size={20} />
                        </button>
                        <button 
                            onClick={handleBatchImportant}
                            disabled={selectedNoteIds.size === 0} 
                            className={`p-3 rounded-xl transition-colors ${selectedNoteIds.size === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-yellow-50 hover:text-yellow-500'} ${theme.id === 'pixel' ? 'rounded-none' : ''} text-gray-500`}
                            title="批量标星"
                        >
                            <Star size={20} />
                        </button>
                        <button 
                            onClick={handleBatchPin}
                            disabled={selectedNoteIds.size === 0} 
                            className={`p-3 rounded-xl transition-colors ${selectedNoteIds.size === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-50 hover:text-blue-500'} ${theme.id === 'pixel' ? 'rounded-none' : ''} text-gray-500`}
                            title="批量置顶"
                        >
                            <Pin size={20} />
                        </button>
                        <button 
                            onClick={handleBatchDelete}
                            disabled={selectedNoteIds.size === 0} 
                            className={`p-3 rounded-xl transition-colors ${selectedNoteIds.size === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-red-50 hover:text-red-500'} ${theme.id === 'pixel' ? 'rounded-none' : ''} text-gray-500`}
                            title="批量删除"
                        >
                            <Trash2 size={20} />
                        </button>
                     </div>
                 </div>
             </div>
        )}

      </main>

      {/* Modals */}
      <NoteModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} onSave={editingNote ? handleUpdateNote : handleAddNote} initialData={editingNote} folders={folders} currentFolderId={activeFolderId} theme={theme} initialMode={modalMode} />
      <FolderModal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} onSave={handleSaveNewFolder} theme={theme} initialData={editingFolder} />
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        onExport={handleExportData} 
        onImport={(file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
               const content = e.target?.result as string;
               try {
                  const data = JSON.parse(content);
                  handleImportData(file); 
               } catch (err) {}
            };
            reader.readAsText(file);
        }} 
        theme={theme} 
        backupInterval={backupInterval} 
        setBackupInterval={setBackupInterval} 
        backupLocation={backupLocation}
        setBackupLocation={setBackupLocation}
        localBackupPath={localBackupPath}
        setLocalBackupPath={setLocalBackupPath}
        lastBackupTime={lastBackupTime}
        showSidebar={isSidebarVisible}
        setShowSidebar={setIsSidebarVisible}
        fontSize={fontSize}
        setFontSize={setFontSize}
        showTimeWidget={showTimeWidget}
        setShowTimeWidget={setShowTimeWidget}
        gridColumns={gridColumns}
        setGridColumns={setGridColumns}
        // WebDAV Props
        webDavConfig={webDavConfig}
        setWebDavConfig={setWebDavConfig}
        currentUser={currentUser?.username || 'user'}
        onConfirmAction={(title, msg, action) => setConfirmState({ isOpen: true, title, message: msg, onConfirm: action })}
        showToast={showToast}
      />
      <ConfirmModal isOpen={confirmState.isOpen} onClose={() => setConfirmState(prev => Object.assign({}, prev, { isOpen: false }))} onConfirm={confirmState.onConfirm} title={confirmState.title} message={confirmState.message} theme={theme} />
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;
