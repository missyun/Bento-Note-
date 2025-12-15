
import React, { useRef, useState, useEffect } from 'react';
import { X, Save, Clock, Download, Upload, History, FileJson, AlertCircle, Eye, Type, Sidebar as SidebarIcon, Sun, Grid, Cloud, Server, Wifi, RefreshCw, CheckCircle2, AlertTriangle, HardDrive, FolderOpen } from 'lucide-react';
import { ThemeStyle, BackupInterval, WebDavConfig, BackupLocation } from '../types';
import { WebDavClient } from '../utils/webdav';
import { db } from '../utils/db';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  theme: ThemeStyle;
  backupInterval: BackupInterval;
  setBackupInterval: (interval: BackupInterval) => void;
  backupLocation: BackupLocation;
  setBackupLocation: (loc: BackupLocation) => void;
  localBackupPath: string;
  setLocalBackupPath: (path: string) => void;
  lastBackupTime: number | null;
  // New props
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  fontSize: 'text-sm' | 'text-base' | 'text-lg';
  setFontSize: (size: 'text-sm' | 'text-base' | 'text-lg') => void;
  showTimeWidget: boolean;
  setShowTimeWidget: (show: boolean) => void;
  gridColumns: number;
  setGridColumns: (cols: number) => void;
  // WebDAV Props
  webDavConfig: WebDavConfig;
  setWebDavConfig: (config: WebDavConfig) => void;
  currentUser: string;
  onConfirmAction: (title: string, message: string, action: () => void) => void;
  showToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, onExport, onImport, theme, 
  backupInterval, setBackupInterval, backupLocation, setBackupLocation, localBackupPath, setLocalBackupPath, lastBackupTime,
  showSidebar, setShowSidebar, fontSize, setFontSize,
  showTimeWidget, setShowTimeWidget,
  gridColumns, setGridColumns,
  webDavConfig, setWebDavConfig, currentUser, onConfirmAction, showToast
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // WebDAV Local State
  const [davUrl, setDavUrl] = useState(webDavConfig.url);
  const [davUser, setDavUser] = useState(webDavConfig.username);
  const [davPass, setDavPass] = useState(webDavConfig.password);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Check if running in Electron environment via Preload API
  const isElectron = !!window.electronAPI?.isElectron;

  useEffect(() => {
    if (isOpen) {
      setDavUrl(webDavConfig.url);
      setDavUser(webDavConfig.username);
      setDavPass(webDavConfig.password);
      setConnectionStatus('idle');
      setErrorMsg('');
    }
  }, [isOpen, webDavConfig]);

  if (!isOpen) return null;

  const isDark = theme.id === 'cyberpunk' || theme.id === 'glass';
  const containerBg = isDark ? 'bg-slate-900 border border-gray-700' : 'bg-white';
  const textMain = isDark ? 'text-white' : 'text-gray-900';
  const textSub = isDark ? 'text-gray-400' : 'text-gray-600';
  const sectionBg = isDark ? 'bg-black/30 border border-gray-700' : 'bg-gray-50 border border-gray-100';
  const inputClass = `w-full px-3 py-2 outline-none transition-all duration-300 ${theme.fontFamily} ${theme.inputBg} ${theme.inputBorder} ${theme.cardRadius}`;

  const SYNC_FILENAME = `bento_note_backup_${currentUser}.json`;

  const handleSaveConfig = () => {
    setWebDavConfig({ url: davUrl, username: davUser, password: davPass });
    // Implicitly saved to localStorage by App.tsx effect
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('idle');
    setErrorMsg('');
    try {
        const client = new WebDavClient({ url: davUrl, username: davUser, password: davPass });
        const success = await client.checkConnection();
        setConnectionStatus(success ? 'success' : 'error');
        if (success) {
            showToast('success', 'WebDAV 连接成功');
            handleSaveConfig();
        } else {
            setErrorMsg('连接测试未通过，请检查日志');
            showToast('error', '连接失败');
        }
    } catch (e: any) {
        setConnectionStatus('error');
        setErrorMsg(e.message || '未知错误');
        showToast('error', e.message || '连接异常');
    }
    setIsTesting(false);
  };

  const handleSelectLocalPath = async () => {
    if (!isElectron) {
      showToast('info', '网页版暂不支持选择目录，仅支持默认下载');
      return;
    }
    
    try {
      const path = await window.electronAPI?.openDirectory();
      if (path) {
        setLocalBackupPath(path);
      }
    } catch (e) {
      console.error(e);
      showToast('error', '无法打开目录选择器');
    }
  };

  const handleUploadToCloud = async () => {
    if (!davUrl) return showToast('error', '请先配置 WebDAV');
    setIsSyncing(true);
    
    try {
        const client = new WebDavClient({ url: davUrl, username: davUser, password: davPass });
        // 1. Conflict Check
        const cloudLastMod = await client.getFileLastModified(SYNC_FILENAME);
        const data = await db.getAllData(currentUser);
        
        const performUpload = async () => {
            const success = await client.uploadFile(SYNC_FILENAME, JSON.stringify(data));
            if (success) showToast('success', '备份已上传至云端');
            else showToast('error', '上传失败');
            setIsSyncing(false);
        };

        if (cloudLastMod) {
            if (cloudLastMod.getTime() > data.timestamp) {
                setIsSyncing(false);
                onConfirmAction(
                    '版本冲突警告',
                    `云端备份似乎比本地数据更新 (云端: ${cloudLastMod.toLocaleString()})。强制覆盖可能会丢失云端的修改。是否继续？`,
                    () => { setIsSyncing(true); performUpload(); }
                );
                return;
            }
        }
        
        await performUpload();

    } catch (e: any) {
        console.error(e);
        showToast('error', e.message || '操作异常');
        setIsSyncing(false);
    }
  };

  const handleRestoreFromCloud = async () => {
    if (!davUrl) return showToast('error', '请先配置 WebDAV');
    
    // Safety check first
    onConfirmAction(
        '恢复确认',
        '此操作将下载云端备份并【覆盖】当前本地所有数据。此操作不可逆。是否继续？',
        async () => {
            setIsSyncing(true);
            const client = new WebDavClient({ url: davUrl, username: davUser, password: davPass });
            try {
                const jsonStr = await client.downloadFile(SYNC_FILENAME);
                if (!jsonStr) {
                    showToast('error', '未找到云端备份文件');
                    setIsSyncing(false);
                    return;
                }
                const data = JSON.parse(jsonStr);
                if (data.notes && data.folders) {
                    await db.restoreData(data, currentUser);
                    showToast('success', '数据恢复成功，即将刷新...');
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    showToast('error', '备份文件格式无效');
                }
            } catch (e: any) {
                console.error(e);
                showToast('error', e.message || '恢复失败');
            }
            setIsSyncing(false);
        }
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-xl overflow-hidden transform transition-all flex flex-col max-h-[90vh] ${containerBg} ${theme.cardRadius} ${theme.cardShadow}`}>
        
        {/* Header */}
        <div className={`px-6 py-4 flex justify-between items-center ${isDark ? 'border-b border-gray-700' : 'bg-gray-50 border-b border-gray-100'}`}>
          <div className="flex items-baseline gap-2">
             <h2 className={`text-xl font-bold ${textMain}`}>系统设置</h2>
             <span className={`text-xs font-mono opacity-50 ${textMain}`}>v1.3.0</span>
          </div>
          <button onClick={onClose} className={`${textSub} hover:${textMain}`}>
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* Scheduled Backup Section */}
          <section>
             <div className="flex items-center gap-2 mb-4">
              <Clock size={20} className={theme.id === 'cyberpunk' ? 'text-yellow-400' : 'text-blue-500'} />
              <h3 className={`text-lg font-bold ${textMain}`}>定时自动备份</h3>
            </div>
            
            <div className={`rounded-xl p-5 space-y-6 ${sectionBg}`}>
              <div className="flex flex-col gap-4">
                 <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textSub}`}>自动备份频率</label>
                    <div className="relative">
                      <select 
                        value={backupInterval}
                        onChange={(e) => setBackupInterval(e.target.value as BackupInterval)}
                        className={`w-full px-3 py-2 outline-none appearance-none cursor-pointer ${theme.inputBg} ${theme.inputBorder} ${theme.cardRadius}`}
                      >
                        <option value="off">🚫 已关闭</option>
                        <option value="15m">⏱ 每 15 分钟</option>
                        <option value="1h">⏱ 每 1 小时</option>
                        <option value="6h">⏱ 每 6 小时</option>
                        <option value="12h">⏱ 每 12 小时</option>
                        <option value="24h">📅 每天</option>
                      </select>
                      <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${textSub}`}>▼</div>
                    </div>
                 </div>

                 {/* Backup Location Selector */}
                 <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${textSub}`}>备份存储位置</label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <button 
                            onClick={() => setBackupLocation('local')}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${backupLocation === 'local' ? (isDark ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-blue-500 bg-blue-50 text-blue-600') : (isDark ? 'border-gray-700 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50 text-gray-600')}`}
                        >
                            <HardDrive size={18} />
                            <span className="text-sm font-bold">本地存储</span>
                        </button>
                        <button 
                            onClick={() => setBackupLocation('webdav')}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${backupLocation === 'webdav' ? (isDark ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-blue-500 bg-blue-50 text-blue-600') : (isDark ? 'border-gray-700 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50 text-gray-600')}`}
                        >
                            <Cloud size={18} />
                            <span className="text-sm font-bold">WebDAV 云端</span>
                        </button>
                    </div>
                    
                    {/* Path Selector Logic */}
                    {backupLocation === 'local' && (
                        <div>
                           {isElectron ? (
                              <div className="flex gap-2">
                                 <input 
                                    type="text" 
                                    readOnly 
                                    value={localBackupPath || '未设置 (默认保存至文档)'} 
                                    className={`flex-1 px-3 py-2 text-xs truncate ${theme.inputBg} ${theme.inputBorder} rounded-lg opacity-80`}
                                 />
                                 <button 
                                    onClick={handleSelectLocalPath}
                                    className={`shrink-0 px-3 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${isDark ? 'border-gray-600 hover:bg-white/10' : 'border-gray-300 hover:bg-gray-100'} ${textSub}`}
                                 >
                                    <FolderOpen size={14} /> 修改目录
                                 </button>
                              </div>
                           ) : (
                              <p className={`text-[10px] mt-2 ${textSub} opacity-80 flex items-center gap-1`}>
                                 <Download size={10} /> 网页版受浏览器限制，自动备份将保存至默认下载目录。
                              </p>
                           )}
                        </div>
                    )}

                    {backupLocation === 'webdav' && (
                        <p className={`text-[10px] mt-2 ${textSub} opacity-80 flex items-center gap-1`}>
                           <Wifi size={10} /> 自动上传至下方配置的 WebDAV 服务器
                        </p>
                    )}
                 </div>
              </div>

              <div className={`flex items-start gap-2 text-xs ${textSub} pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                 <History size={14} className="mt-0.5" />
                 <span>上次备份时间: {lastBackupTime ? new Date(lastBackupTime).toLocaleString('zh-CN') : '暂无'}</span>
              </div>
            </div>
          </section>

          {/* WebDAV Config Section */}
          <section className={backupLocation === 'webdav' ? 'opacity-100' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all'}>
             <div className="flex items-center gap-2 mb-4">
               <Server size={20} className={theme.id === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-500'} />
               <h3 className={`text-lg font-bold ${textMain}`}>WebDAV 配置</h3>
             </div>

             <div className={`rounded-xl p-5 space-y-4 ${sectionBg}`}>
                <div className="space-y-3">
                   <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${textSub} flex items-center gap-1`}>
                         <Server size={12} /> 服务器地址
                      </label>
                      <input type="text" value={davUrl} onChange={e => setDavUrl(e.target.value)} placeholder="https://dav.example.com/remote.php/webdav/" className={inputClass} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${textSub}`}>账号</label>
                         <input type="text" value={davUser} onChange={e => setDavUser(e.target.value)} className={inputClass} />
                      </div>
                      <div>
                         <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${textSub}`}>密码</label>
                         <input type="password" value={davPass} onChange={e => setDavPass(e.target.value)} className={inputClass} />
                      </div>
                   </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                   <div className="flex flex-col gap-1 w-full">
                       <div className="flex items-center gap-2">
                          <button 
                             onClick={handleTestConnection}
                             disabled={isTesting}
                             className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${isDark ? 'border-gray-600 hover:bg-white/10' : 'border-gray-300 hover:bg-gray-100'} ${textSub}`}
                          >
                             {isTesting ? <RefreshCw size={12} className="animate-spin" /> : <Wifi size={12} />}
                             测试连接
                          </button>
                          {connectionStatus === 'success' && <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 size={12}/> 已连接</span>}
                          {connectionStatus === 'error' && <span className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12}/> 连接失败</span>}
                       </div>
                       {errorMsg && <div className="text-[10px] text-red-500 pl-1">{errorMsg}</div>}
                   </div>
                </div>

                <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                   <div className="grid grid-cols-2 gap-4">
                      <button 
                         onClick={handleUploadToCloud}
                         disabled={isSyncing}
                         className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all ${isDark ? 'border-blue-900/50 bg-blue-900/10 hover:bg-blue-900/20' : 'border-blue-100 bg-blue-50 hover:bg-blue-100'} group`}
                      >
                         <Upload size={24} className="text-blue-500 mb-2 group-hover:-translate-y-1 transition-transform" />
                         <span className={`text-sm font-bold ${textMain}`}>手动上传至云端</span>
                      </button>

                      <button 
                         onClick={handleRestoreFromCloud}
                         disabled={isSyncing}
                         className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all ${isDark ? 'border-orange-900/50 bg-orange-900/10 hover:bg-orange-900/20' : 'border-orange-100 bg-orange-50 hover:bg-orange-100'} group`}
                      >
                         <Download size={24} className="text-orange-500 mb-2 group-hover:-translate-y-1 transition-transform" />
                         <span className={`text-sm font-bold ${textMain}`}>从云端恢复</span>
                      </button>
                   </div>
                   {isSyncing && <div className="text-center text-xs text-blue-500 mt-2 animate-pulse">正在同步数据...</div>}
                </div>
             </div>
          </section>

          {/* Appearance Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
               <Eye size={20} className={theme.id === 'cyberpunk' ? 'text-pink-400' : 'text-purple-500'} />
               <h3 className={`text-lg font-bold ${textMain}`}>界面外观</h3>
            </div>
            
            <div className={`rounded-xl p-5 space-y-4 ${sectionBg}`}>
               {/* Sidebar Toggle */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <SidebarIcon size={16} className={textSub} />
                     <span className={`text-sm font-medium ${textMain}`}>显示侧边栏</span>
                  </div>
                  <button 
                    onClick={() => setShowSidebar(!showSidebar)}
                    className={`
                       w-12 h-6 rounded-full transition-colors relative
                       ${showSidebar ? 'bg-green-500' : 'bg-gray-300'}
                    `}
                  >
                     <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${showSidebar ? 'translate-x-6' : ''}`} />
                  </button>
               </div>

               {/* Time Widget Toggle */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Sun size={16} className={textSub} />
                     <span className={`text-sm font-medium ${textMain}`}>显示时间天气挂件</span>
                  </div>
                  <button 
                    onClick={() => setShowTimeWidget(!showTimeWidget)}
                    className={`
                       w-12 h-6 rounded-full transition-colors relative
                       ${showTimeWidget ? 'bg-green-500' : 'bg-gray-300'}
                    `}
                  >
                     <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${showTimeWidget ? 'translate-x-6' : ''}`} />
                  </button>
               </div>
               
               <div className={`h-px w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
               
               {/* Font Size */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Type size={16} className={textSub} />
                     <span className={`text-sm font-medium ${textMain}`}>字体大小</span>
                  </div>
                  <div className="flex bg-gray-200 rounded-lg p-1 gap-1">
                     <button onClick={() => setFontSize('text-sm')} className={`px-3 py-1 text-xs rounded-md transition-all ${fontSize === 'text-sm' ? 'bg-white shadow text-black font-bold' : 'text-gray-500 hover:text-gray-800'}`}>小</button>
                     <button onClick={() => setFontSize('text-base')} className={`px-3 py-1 text-xs rounded-md transition-all ${fontSize === 'text-base' ? 'bg-white shadow text-black font-bold' : 'text-gray-500 hover:text-gray-800'}`}>中</button>
                     <button onClick={() => setFontSize('text-lg')} className={`px-3 py-1 text-xs rounded-md transition-all ${fontSize === 'text-lg' ? 'bg-white shadow text-black font-bold' : 'text-gray-500 hover:text-gray-800'}`}>大</button>
                  </div>
               </div>

               {/* Grid Columns */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Grid size={16} className={textSub} />
                     <span className={`text-sm font-medium ${textMain}`}>便签横排个数</span>
                  </div>
                  <div className="flex bg-gray-200 rounded-lg p-1 gap-1">
                     {[2, 3, 4, 5, 6].map(cols => (
                        <button 
                           key={cols}
                           onClick={() => setGridColumns(cols)} 
                           className={`w-8 py-1 text-xs rounded-md transition-all ${gridColumns === cols ? 'bg-white shadow text-black font-bold' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                           {cols}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
          </section>

          {/* Manual Data Management */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileJson size={20} className={theme.id === 'cyberpunk' ? 'text-pink-500' : 'text-purple-500'} />
              <h3 className={`text-lg font-bold ${textMain}`}>手动文件管理</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Export Button */}
              <button 
                onClick={onExport}
                className={`
                  flex flex-col items-center justify-center gap-2 p-6 transition-all border-2 border-dashed
                  ${isDark ? 'border-gray-600 hover:bg-white/5 hover:border-gray-400' : 'border-gray-300 hover:bg-gray-50 hover:border-blue-400'}
                  ${theme.cardRadius}
                `}
              >
                <div className={`p-3 rounded-full ${theme.id === 'glass' ? 'bg-white/10' : 'bg-blue-50'}`}>
                  <Download size={24} className="text-blue-500" />
                </div>
                <div className="text-center">
                  <div className={`font-bold ${textMain}`}>导出本地数据</div>
                  <div className={`text-xs ${textSub}`}>保存为 .json 文件</div>
                </div>
              </button>

              {/* Import Button */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`
                  flex flex-col items-center justify-center gap-2 p-6 transition-all border-2 border-dashed cursor-pointer
                  ${isDark ? 'border-gray-600 hover:bg-white/5 hover:border-gray-400' : 'border-gray-300 hover:bg-gray-50 hover:border-green-400'}
                  ${theme.cardRadius}
                `}
              >
                 <div className={`p-3 rounded-full ${theme.id === 'glass' ? 'bg-white/10' : 'bg-green-50'}`}>
                  <Upload size={24} className="text-green-500" />
                </div>
                <div className="text-center">
                  <div className={`font-bold ${textMain}`}>导入本地数据</div>
                  <div className={`text-xs ${textSub}`}>支持 JSON 格式恢复</div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={e => {
                      if (e.target.files?.[0]) {
                          onImport(e.target.files[0]);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                      }
                  }} 
                  accept=".json"
                  className="hidden" 
                />
              </div>
            </div>
          </section>
        </div>

        <div className={`px-6 py-4 flex justify-end items-center border-t ${isDark ? 'border-gray-700' : 'border-gray-200 bg-gray-50'}`}>
          <button onClick={() => { handleSaveConfig(); onClose(); }} className={`flex items-center gap-2 px-8 py-2 text-sm font-medium ${theme.buttonPrimary}`}>
            <Save size={16} />
            保存配置
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
