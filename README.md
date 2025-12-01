# Droid-Switch

一款用于管理 Factory API Key 的桌面应用，支持多 Key 管理、额度查询、一键切换等功能。

## ✨ 功能特性

- 🔑 **多 Key 管理** - 支持添加、删除、批量导入 API Key
- 📊 **额度统计** - 实时查看总额度、已用额度、剩余额度
- 🔄 **一键切换** - 快速切换当前使用的 API Key，自动设置系统环境变量
- 📋 **生成卡密** - 一键复制 Key 信息，方便分享
- 🏷️ **卖出标识** - 标记已出售的 Key
- ⏰ **自动刷新** - 定时刷新所有 Key 的额度信息
- 📈 **排序筛选** - 按剩余额度、到期时间排序
- ⚙️ **MCP 配置** - 编辑 `~/.factory/mcp.json` 配置文件

## 🖼️ 界面预览

![Droid-Switch](./preview.png)

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Rust 1.70+
- 系统依赖：
  - **Windows**: Visual Studio Build Tools、WebView2
  - **macOS**: Xcode Command Line Tools
  - **Linux**: `libwebkit2gtk-4.1-dev build-essential libssl-dev libayatana-appindicator3-dev librsvg2-dev`

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run tauri dev
```

### 打包构建

```bash
npm run tauri build
```

打包产物位于 `src-tauri/target/release/bundle/` 目录：

- Windows: `.msi` / `.exe` 安装包
- macOS: `.dmg` / `.app`
- Linux: `.deb` / `.rpm` / `.AppImage`

## 📁 项目结构

```
droid-switch/
├── src/                    # 前端源码 (React + TypeScript)
│   ├── api/                # API 接口
│   ├── components/         # UI 组件
│   │   ├── AddKeyModal/    # 添加 Key 弹窗
│   │   ├── Header/         # 顶部导航
│   │   ├── KeyList/        # Key 列表
│   │   ├── MCPModal/       # MCP 配置弹窗
│   │   ├── RefreshSettings/# 刷新设置
│   │   ├── SortFilter/     # 排序筛选
│   │   ├── Statistics/     # 统计卡片
│   │   ├── common/         # 通用组件
│   │   └── icons/          # 图标组件
│   ├── styles/             # 样式文件
│   └── App.tsx             # 主应用
├── src-tauri/              # 后端源码 (Rust)
│   ├── src/lib.rs          # Tauri 命令
│   └── tauri.conf.json     # Tauri 配置
└── package.json
```

## 🔧 技术栈

- **前端**: React 19 + TypeScript + Vite
- **后端**: Tauri 2 + Rust
- **存储**: Tauri Store Plugin (本地持久化)
- **HTTP**: Tauri HTTP Plugin

## 📝 使用说明

### 添加 Key

1. 点击右上角 **+ 添加** 按钮
2. 支持单个添加或批量添加
3. 批量添加格式：
   - 仅 API Key: `fk-xxxxx`
   - 名称 + API Key: `主Key fk-xxxxx` 或 `主Key,fk-xxxxx`

### 切换 Key

点击 Key 卡片右侧的 **切换** 按钮，会自动设置系统环境变量 `FACTORY_API_KEY`

### 环境变量

- **Windows**: 自动设置用户级注册表环境变量
- **Linux/macOS**: 自动写入 `~/.zshrc` 或 `~/.bashrc`，需执行 `source` 或重开终端生效

## 📄 License

MIT License
