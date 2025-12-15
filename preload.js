
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  webdavRequest: (data) => ipcRenderer.invoke('webdav:request', data),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  isElectron: true
});
