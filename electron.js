
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

// 允许自签名证书 (Node.js Fetch)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 屏蔽生产环境下的安全警告
if (process.env.NODE_ENV === 'production') {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
}

// 忽略 Chromium 证书错误
app.commandLine.appendSwitch('ignore-certificate-errors');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    autoHideMenuBar: true, 
    webPreferences: {
      nodeIntegration: false, // 推荐关闭
      contextIsolation: true, // 推荐开启
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'public/icon.ico')
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

ipcMain.handle('dialog:openDirectory', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory']
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0];
  }
});

// WebDAV 请求代理 (Node.js Environment)
ipcMain.handle('webdav:request', async (event, { url, method, headers, body }) => {
  try {
    const fetchOptions = {
      method,
      headers,
      body: body || undefined,
      duplex: body ? 'half' : undefined
    };

    const response = await fetch(url, fetchOptions);
    
    const text = await response.text();
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      text: text
    };
  } catch (error) {
    console.error('WebDAV Proxy Error:', error);
    return {
      error: error.message || 'Network Error'
    };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
