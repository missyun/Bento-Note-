
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Note, Folder, User } from '../types';

interface SmartNotesDB extends DBSchema {
  notes: {
    key: string;
    value: Note & { userId: string };
    indexes: { 'by-user': string };
  };
  folders: {
    key: string;
    value: Folder & { userId: string };
    indexes: { 'by-user': string };
  };
}

const DB_NAME = 'SmartNotesDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<SmartNotesDB>>;

export const initDB = () => {
  dbPromise = openDB<SmartNotesDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('notes')) {
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
        noteStore.createIndex('by-user', 'userId');
      }
      if (!db.objectStoreNames.contains('folders')) {
        const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
        folderStore.createIndex('by-user', 'userId');
      }
    },
  });
  return dbPromise;
};

export const db = {
  async getNotes(userId: string) {
    const db = await initDB();
    return db.getAllFromIndex('notes', 'by-user', userId);
  },
  async saveNote(note: Note, userId: string) {
    const db = await initDB();
    return db.put('notes', { ...note, userId });
  },
  async deleteNote(id: string) {
    const db = await initDB();
    return db.delete('notes', id);
  },
  async getFolders(userId: string) {
    const db = await initDB();
    return db.getAllFromIndex('folders', 'by-user', userId);
  },
  async saveFolder(folder: Folder, userId: string) {
    const db = await initDB();
    return db.put('folders', { ...folder, userId });
  },
  async deleteFolder(id: string) {
    const db = await initDB();
    return db.delete('folders', id);
  },
  async importData(notes: Note[], folders: Folder[], userId: string) {
    const db = await initDB();
    const tx = db.transaction(['notes', 'folders'], 'readwrite');
    await Promise.all([
      ...notes.map(n => tx.objectStore('notes').put({ ...n, userId })),
      ...folders.map(f => tx.objectStore('folders').put({ ...f, userId }))
    ]);
    await tx.done;
  },
  // Get all data for a user to pack into JSON
  async getAllData(userId: string) {
    const db = await initDB();
    const notes = await db.getAllFromIndex('notes', 'by-user', userId);
    const folders = await db.getAllFromIndex('folders', 'by-user', userId);
    return { notes, folders, timestamp: Date.now(), version: '1.1.0' };
  },
  // Nuke existing data for user and replace (Restore mode)
  async restoreData(data: { notes: Note[], folders: Folder[] }, userId: string) {
    const db = await initDB();
    const tx = db.transaction(['notes', 'folders'], 'readwrite');
    
    // 1. Delete existing data for this user
    // Note: IDB doesn't support "delete by index" easily, so we iterate. 
    // For a local app, this performance is acceptable.
    const existingNotesKeys = await tx.objectStore('notes').index('by-user').getAllKeys(userId);
    const existingFoldersKeys = await tx.objectStore('folders').index('by-user').getAllKeys(userId);
    
    await Promise.all([
        ...existingNotesKeys.map(k => tx.objectStore('notes').delete(k)),
        ...existingFoldersKeys.map(k => tx.objectStore('folders').delete(k))
    ]);

    // 2. Insert new data
    await Promise.all([
      ...data.notes.map(n => tx.objectStore('notes').put({ ...n, userId })),
      ...data.folders.map(f => tx.objectStore('folders').put({ ...f, userId }))
    ]);
    
    await tx.done;
  }
};
