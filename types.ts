
export interface User {
  username: string;
  isAdmin: boolean;
  avatar?: string;
  lastLogin: number;
}

export interface Folder {
  id: string;
  name: string;
  icon: string; // lucide icon name
  isSystem?: boolean; // System folders cannot be deleted
  order?: number; // Sorting order
}

export type EditorType = 'plain' | 'markdown' | 'rich';

export interface Note {
  id: string;
  title: string;
  content: string; // Stores Markdown, Plain Text, or HTML (Rich Text)
  tags: string[];
  folderId: string; // Link to Folder
  isCompleted: boolean;
  isImportant: boolean;
  isPinned?: boolean; // New: Pin to top
  color: NoteColor; // Background color key (used subtly in some themes)
  createdAt: number;
  updatedAt: number;
  isLocked?: boolean; // New: Is the note locked
  password?: string; // New: Password for the note
  isMarkdown?: boolean; // Deprecated, kept for migration
  editorType?: EditorType; // New: 'plain' | 'markdown' | 'rich'
  reminderTime?: number; // New: Timestamp for reminder
}

export type NoteColor = 'white' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';

export type FilterType = 'all' | 'active' | 'completed' | 'important' | 'today';

export type SortOrder = 'desc' | 'asc';

export type ThemeId = 'ios' | 'glass' | 'pixel' | 'cyberpunk' | 'minimal' | 'sketch' | '3d' | 'retro' | 'flat' | 'isometric' | 'warm' | 'industrial' | 'morandi';

// New type for Backup settings
export type BackupInterval = 'off' | '15m' | '1h' | '6h' | '12h' | '24h';
export type BackupLocation = 'local' | 'webdav';

export interface WebDavConfig {
  url: string;
  username: string;
  password: string;
}

export interface ThemeStyle {
  id: ThemeId;
  name: string;
  description: string;
  // Global Styles
  appBg: string; // The main background of the app
  fontFamily: string; // Tailwind font class
  
  // Sidebar Styles (New)
  sidebarBg: string;
  sidebarBorder: string;
  sidebarText: string;
  sidebarActiveItem: string;
  sidebarHoverItem: string;

  // Card Styles
  cardBg: string; // Base background for cards
  cardBorder: string;
  cardShadow: string;
  cardRadius: string;
  cardHover: string; // Hover effects
  
  // Text Styles
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Component Styles
  buttonPrimary: string;
  buttonSecondary: string;
  inputBg: string;
  inputBorder: string;
  
  // Header Style (Now simplified or integrated)
  headerBg: string;
  headerText: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
