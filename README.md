
# 🍱 Bento Note (方寸便签)

> **你的第二大脑，极简高效的个人知识库。**  
> 融合 Bento 网格布局与 Spatial UI 设计，支持多种沉浸式主题，完全本地化存储，安全可控。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Electron](https://img.shields.io/badge/Electron-31.0-47848F?logo=electron)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?logo=vite)

## ✨ 核心亮点

### 🎨 极致的 UI/UX 设计
*   **Bento Grid 布局**：像便当盒一样整洁、直观的信息展示。
*   **10+ 沉浸式主题**：
    *   🌫️ **Glass (毛玻璃)**：通透的高级感。
    *   👾 **Cyberpunk (赛博朋克)**：霓虹故障风。
    *   🕹️ **Pixel (像素复古)**：8-bit 怀旧风格。
    *   🎨 **Morandi (莫兰迪)**：温柔静谧的色彩。
    *   📝 **Sketch (手绘)**、🏭 **Industrial (工业风)** 等。
*   **Spatial UI**：细腻的微交互、3D 视差悬停效果与流畅的过渡动画。

### 🚀 桌面端原生体验
*   **边缘吸附隐藏**：类似 QQ/旺旺的贴边隐藏功能。将窗口拖至屏幕顶部边缘即可自动收起，鼠标划过顶部自动唤出，极大节省桌面空间。
*   **完全离线可用**：所有资源（字体、图标、样式）均已本地化，无网络环境也能完美运行。

### 📝 强大的编辑与管理
*   **多模式编辑器**：
    *   Markdown：适合技术文档与结构化写作（支持代码高亮）。
    *   富文本 (Rich Text)：所见即所得。
    *   纯文本：极速记录。
*   **隐私安全**：支持单条便签密码锁定/加密，敏感信息不泄露。
*   **多维管理**：文件夹分类、标签系统、置顶、星标重要事项。
*   **提醒事项**：内置定时提醒功能。

### 📊 数据可视化与同步
*   **时光机 (Timeline)**：以时间轴形式回顾你的创作历程。
*   **数据看板 (Dashboard)**：GitHub 风格的热力图、任务完成率仪表盘。
*   **WebDAV 同步**：支持配置 WebDAV（如坚果云、NAS），实现跨设备数据云备份与恢复。
*   **本地备份**：一键导出/导入 JSON 数据格式。

## 🛠️ 技术栈

*   **Runtime**: [Electron](https://www.electronjs.org/)
*   **Frontend**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Database**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (via `idb` wrapper)
*   **Components**: 
    *   `react-quill` (富文本)
    *   `react-markdown` (Markdown)
    *   `react-calendar` (日历)
    *   `lucide-react` (图标)
    *   `react-syntax-highlighter` (代码高亮)

## 💻 本地运行指南

确保你的电脑已安装 [Node.js](https://nodejs.org/) (建议 v18+)。

1.  **克隆仓库**
    ```bash
    git clone https://github.com/your-username/bento-note.git
    cd bento-note
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **启动开发环境**
    ```bash
    npm run dev
    # 这将同时启动 Vite 开发服务器和 Electron 窗口
    ```

## 📦 打包构建

本项目支持构建为 Windows (exe/nsis) 和 macOS (dmg) 应用。

1.  **构建生产包**
    ```bash
    npm run dist
    ```

2.  **输出目录**
    构建完成后，安装包将位于 `release` 目录下。
    *   Windows: `release/Bento Note Setup 1.1.0.exe`
    *   Unpacked: `release/win-unpacked/`

## 📂 项目结构

```
bento-note/
├── dist/                # Vite 构建出的前端静态资源 (构建后生成)
├── release/             # Electron 打包输出目录 (构建后生成)
├── public/              # 静态资源 (图标等)
├── src/                 # React 源代码
│   ├── components/      # UI 组件 (Card, Modal, Sidebar...)
│   ├── utils/           # 工具类 (DB, WebDAV...)
│   ├── App.tsx          # 主应用入口
│   ├── main.tsx         # React 挂载点
│   ├── index.css        # Tailwind 指令与全局样式
│   └── constants.ts     # 静态配置 (主题定义等)
├── main.js              # Electron 主进程 (窗口管理、贴边隐藏逻辑)
├── preload.js           # Electron 预加载脚本 (IPC 通信)
├── index.html           # 应用入口 HTML
├── package.json         # 依赖配置
└── tailwind.config.js   # Tailwind 配置
```

## 🤝 贡献

欢迎提交 Issue 或 Pull Request！无论是修复 Bug、新增主题还是优化功能，我们都非常期待你的参与。

## 📄 许可证

[MIT](./LICENSE) License © 2025 Bento Note
