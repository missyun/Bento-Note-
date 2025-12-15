
const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
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
    frame: true, // 保持边框
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

  // --- 贴边隐藏逻辑 (Top Edge Auto-Hide) ---
  let isHidden = false;
  const EDGE_THRESHOLD = 5; // 距离顶部多少像素触发吸附
  const SHOW_OFFSET = 0;    // 显示时的 Y 坐标
  const HIDE_OFFSET_VISIBLE = 4; // 隐藏后露出的像素高度（方便鼠标划过唤醒）

  const dockInterval = setInterval(() => {
    try {
      if (!win || win.isDestroyed()) return;
      if (win.isMaximized() || win.isFullScreen()) return; // 全屏或最大化时不生效

      const bounds = win.getBounds();
      const cursor = screen.getCursorScreenPoint();
      
      // 判断鼠标是否在窗口的水平范围内 (X轴)
      const isHorizontallyAligned = cursor.x >= bounds.x && cursor.x <= bounds.x + bounds.width;

      if (isHidden) {
        // [唤醒逻辑]
        // 如果窗口是隐藏的，检测鼠标是否碰到了屏幕顶端边缘 (y < 10) 且在水平范围内
        if (isHorizontallyAligned && cursor.y <= 10) {
           win.setPosition(bounds.x, SHOW_OFFSET, true);
           isHidden = false;
           win.setAlwaysOnTop(true);
        }
      } else {
        // [隐藏逻辑]
        // 1. 判断窗口当前是否贴在顶部 (y 接近 0)
        const isDockedAtTop = bounds.y <= EDGE_THRESHOLD;

        if (isDockedAtTop) {
           // 2. 判断鼠标是否完全离开了窗口区域
           const isVerticallyInside = cursor.y >= bounds.y && cursor.y <= bounds.y + bounds.height;
           
           // 如果鼠标既不在X范围内，也不在Y范围内，说明移开了
           if (!isHorizontallyAligned || !isVerticallyInside) {
              // 计算隐藏位置：负的窗口高度 + 露出的微小边缘
              const hideY = -bounds.height + HIDE_OFFSET_VISIBLE;
              win.setPosition(bounds.x, hideY, true);
              isHidden = true;
              win.setAlwaysOnTop(true); // 保持置顶以便鼠标能划到那条边
           }
        } else {
           // 如果用户把窗口拖离了顶部，重置隐藏状态
           isHidden = false;
        }
      }
    } catch (error) {
      console.error('Docking logic error:', error);
    }
  }, 150); // 150ms 检测频率，比之前的更灵敏一点

  // 清理定时器
  win.on('closed', () => {
    clearInterval(dockInterval);
  });
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
