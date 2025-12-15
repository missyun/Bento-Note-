
import React from 'react';
import { 
  LogOut, Settings, Layers, Folder as FolderIcon, 
  Briefcase, BookOpen, Lightbulb, User, FolderPlus, Trash2, X,
  LayoutDashboard, Edit2, History
} from 'lucide-react';
import { ThemeStyle, User as UserType, Folder } from '../types';
import { Sparkles } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import ThemeAvatar from './ThemeAvatar';

interface SidebarProps {
  user: UserType;
  folders: Folder[];
  activeFolderId: string;
  onSelectFolder: (id: string) => void;
  onCreateFolder: () => void;
  onDeleteFolder: (id: string) => void;
  onEditFolder: (folder: Folder) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  theme: ThemeStyle;
  isOpen: boolean;
  onCloseMobile: () => void;
  onReorder: (result: DropResult) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  user, folders, activeFolderId, onSelectFolder, onCreateFolder, onDeleteFolder, onEditFolder,
  onLogout, onOpenSettings, theme, isOpen, onCloseMobile, onReorder
}) => {
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container - Floating Island Style */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 transform transition-all duration-500 cubic-bezier(0.2, 0.8, 0.2, 1)
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${theme.sidebarBg} ${theme.sidebarBorder} ${theme.fontFamily}
        flex flex-col h-full lg:h-full
        lg:rounded-[2.5rem] lg:shadow-2xl
        overflow-hidden
      `}>
        
        {/* User Profile - Spatial Header */}
        <div className="p-8 pb-4 relative">
          <div className="flex items-center gap-4 mb-6">
            <ThemeAvatar username={user.username} seed={user.avatar} theme={theme} className="w-12 h-12" />
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-lg truncate ${theme.id === 'glass' ? 'text-white' : theme.textPrimary}`}>{user.username}</h3>
              <p className={`text-xs opacity-60 flex items-center gap-1 ${theme.id === 'glass' ? 'text-white' : theme.textMuted}`}>
                 <Sparkles size={10} /> 专业版
              </p>
            </div>
            <button onClick={onCloseMobile} className="lg:hidden p-2 rounded-full hover:bg-black/5">
               <X size={20} />
            </button>
          </div>
          
          <div className={`h-px w-full ${theme.id === 'glass' ? 'bg-white/10' : 'bg-gray-200'}`}></div>
        </div>

        {/* Navigation - Pill Shaped */}
        <div className="flex-1 overflow-y-auto px-6 space-y-2 custom-scrollbar">
           
           <div 
              className={`group flex items-center gap-4 px-5 py-4 cursor-pointer transition-all duration-300 font-bold ${
                activeFolderId === 'dashboard' ? `${theme.sidebarActiveItem} scale-100` : `${theme.sidebarText} ${theme.sidebarHoverItem} scale-95 hover:scale-100`
              }`}
              onClick={() => { onSelectFolder('dashboard'); onCloseMobile(); }}
           >
              <LayoutDashboard size={20} />
              <span>数据看板</span>
           </div>

           <div 
              className={`group flex items-center gap-4 px-5 py-4 cursor-pointer transition-all duration-300 font-bold ${
                activeFolderId === 'timeline' ? `${theme.sidebarActiveItem} scale-100` : `${theme.sidebarText} ${theme.sidebarHoverItem} scale-95 hover:scale-100`
              }`}
              onClick={() => { onSelectFolder('timeline'); onCloseMobile(); }}
           >
              <History size={20} />
              <span>时光机</span>
           </div>

           <div className={`mt-8 mb-4 px-5 text-xs font-bold uppercase tracking-widest opacity-50 ${theme.id === 'glass' ? 'text-white' : 'text-gray-900'}`}>
             知识库
           </div>
           
           <DragDropContext onDragEnd={onReorder} children={
             <Droppable droppableId="sidebar-folders" children={
               (provided) => (
                 <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                   {folders.map((folder, index) => {
                     const isActive = activeFolderId === folder.id;
                     return (
                       <React.Fragment key={folder.id}>
                         <Draggable draggableId={folder.id} index={index} children={
                           (provided, snapshot) => (
                             <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...(provided.dragHandleProps || {})}
                                style={provided.draggableProps.style}
                                className={`group relative flex items-center justify-between px-5 py-3.5 cursor-pointer transition-all duration-300 font-medium ${
                                  isActive ? `${theme.sidebarActiveItem} scale-100` : `${theme.sidebarText} ${theme.sidebarHoverItem} scale-95 hover:scale-100`
                                } ${snapshot.isDragging ? 'shadow-2xl z-50 scale-105' : ''}`}
                                onClick={() => { onSelectFolder(folder.id); onCloseMobile(); }}
                             >
                                <div className="flex items-center gap-4 overflow-hidden pointer-events-none">
                                   {/* Dynamic Icon */}
                                   {folder.name.includes('工作') ? <Briefcase size={18} /> : 
                                    folder.name.includes('生活') ? <User size={18} /> : 
                                    folder.name.includes('学习') ? <BookOpen size={18} /> :
                                    folder.name.includes('灵感') ? <Lightbulb size={18} /> :
                                    <FolderIcon size={18} />}
                                   <span className="truncate">{folder.name}</span>
                                </div>
                                
                                {!folder.isSystem && (
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); onEditFolder(folder); }} className="p-1.5 hover:bg-black/10 rounded-md">
                                      <Edit2 size={12} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }} className="p-1.5 hover:bg-red-500 hover:text-white rounded-md">
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                )}
                             </div>
                           )
                         } />
                       </React.Fragment>
                     );
                   })}
                   {provided.placeholder}
                 </div>
               )
             } />
           } />

           {/* Create Folder - Left Aligned to match list */}
           <button 
              onClick={onCreateFolder}
              className={`w-full mt-6 flex items-center justify-start gap-4 px-5 py-4 text-sm font-bold opacity-60 hover:opacity-100 border-2 border-dashed border-transparent hover:border-current rounded-2xl transition-all ${theme.sidebarText}`}
           >
              <FolderPlus size={18} /> 新建文件夹
           </button>
        </div>

        {/* Footer */}
        <div className="p-6 mt-auto space-y-3">
           <button onClick={onOpenSettings} className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-105 ${theme.sidebarText} ${theme.sidebarHoverItem}`}>
              <Settings size={18} /> 设置
           </button>
           <button onClick={onLogout} className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-105 text-red-500 hover:bg-red-50`}>
              <LogOut size={18} /> 退出
           </button>
           
           <div className={`text-[10px] text-center opacity-40 pt-2 ${theme.id === 'glass' ? 'text-white' : 'text-gray-500'}`}>
              Bento Note v1.1.0
           </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
