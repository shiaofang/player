# RNMusic — React Native 音乐播放器

一款基于 Expo + React Native 构建的全功能音乐播放器应用，UI 风格参照 Apple Music，支持完整的播放控制、队列管理、搜索与曲库浏览。

---

## 预览截图

| 首页 | 全屏播放器 | 搜索 | 曲库 |
|------|-----------|------|------|
| 轮播 Banner、最近播放、专辑、播放列表 | 封面动画、进度拖拽、音量控制 | 实时搜索、分类浏览 | 歌单/专辑/艺人/歌曲四个视图 |

---

## 功能特性

### 播放控制
- 播放 / 暂停（乐观更新，零延迟响应）
- 上一首 / 下一首
- 进度条拖拽 Seek（拖拽期间不跳回，松手后精准跳转）
- 音量滑块实时调节
- 随机播放（Shuffle）
- 循环模式：不循环 → 列表循环 → 单曲循环，三档切换

### 播放器界面
- **Mini Player**：悬浮于底部 Tab 栏上方，显示封面、标题、进度条；左滑切换下一首，点击展开全屏
- **全屏播放器**：由底部上滑进入，下滑或点击关闭按钮退出；专辑封面随播放状态缩放动画；背景模糊渐变效果

### 曲库与浏览
- **首页**：时段问候语、精选 Banner、最近播放、新专辑、为你推荐歌单、热门榜单
- **搜索**：按曲名 / 艺人 / 专辑实时过滤；空状态显示分类卡片与精选专辑
- **曲库**：Playlists / Albums / Artists / Songs 四个 Tab，歌曲列表高亮正在播放项并显示动态音频指示条

### 音频引擎
- 基于 `expo-av` 实现音频加载、播放、暂停、Seek、音量控制
- 状态回调节流（500ms 间隔）减少不必要的 UI 刷新
- 支持 iOS 静音模式下继续播放，支持后台播放

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React Native 0.81 + Expo SDK 54 |
| 语言 | TypeScript 5.9 |
| UI 框架 | React 19 |
| 导航 | Expo Router 6（文件路由） |
| 音频 | expo-av 16 |
| 动画 | React Native Animated API |
| 手势 | PanResponder（下滑关闭、左滑切歌） |
| 视觉效果 | expo-blur、expo-linear-gradient |
| 图标 | @expo/vector-icons（Ionicons） |
| 进度/音量条 | @react-native-community/slider |
| 状态管理 | Zustand（全局播放器状态） |
| 安全区域 | react-native-safe-area-context |

---

## 项目结构

```
rnmusic/
├── app.json                       # Expo 配置
├── tsconfig.json
├── package.json
├── app/                           # Expo Router 路由层
│   ├── _layout.tsx                # 根布局：GestureHandler / SafeArea / 浮层管理
│   └── (tabs)/
│       ├── _layout.tsx            # Tab 栏样式与图标配置
│       ├── index.tsx              # 首页：Banner、各横向滚动列表、热门榜单
│       ├── search.tsx             # 搜索页：实时过滤 + 分类浏览
│       └── library.tsx            # 曲库页：四个 Tab 子视图
└── src/                           # 业务逻辑层
    ├── components/
    │   ├── MiniPlayer.tsx         # 悬浮迷你播放器（左滑切歌、点击展开）
    │   ├── NowPlayingScreen.tsx   # 全屏播放器：封面动画、Slider、控制栏
    │   ├── TrackItem.tsx          # 歌曲行组件（支持播放动画指示条）
    │   └── AlbumCard.tsx          # 封面卡片组件
    ├── store/
    │   └── playerStore.ts         # Zustand 全局播放器状态与音频控制逻辑
    ├── data/
    │   └── mockData.ts            # 歌曲、专辑、艺人、歌单、曲风 Mock 数据
    └── theme/
        └── colors.ts              # 全局颜色设计 Token
```

---

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9 或 yarn
- Expo Go（手机端预览）或 Android / iOS 模拟器

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
# 启动（扫码用 Expo Go 预览）
npm start

# 启动并直接在 Android 模拟器运行
npm run android

# 启动并直接在 iOS 模拟器运行（需要 macOS）
npm run ios
```

---

## 核心架构说明

### 播放器状态管理

全局状态由 `src/store/playerStore.ts` 通过 Zustand 管理，无需 Provider 包裹，任意组件直接用 `usePlayer()` 订阅所需状态。

音频实例（`soundRef`）和加载标记（`isInitialLoad`）作为模块级变量存在，不触发 React 重渲染：

```
playerStore.ts
  ├── soundRef         — expo-av Sound 实例（模块级变量）
  ├── isInitialLoad    — 首次加载标记（模块级变量）
  └── usePlayer        — Zustand store（驱动 UI 重渲染）
```

在异步回调中直接用 `usePlayer.getState()` / `usePlayer.setState()` 读写状态，天然避免了 React 闭包陈旧值问题。

### 导航与浮层结构

项目使用 Expo Router 文件路由，`app/_layout.tsx` 作为根布局负责浮层管理：

```
expo-router/entry
└── app/_layout.tsx（根布局 / GestureHandler / SafeArea）
    ├── app/(tabs)/_layout.tsx（Tab 栏配置）
    │   ├── app/(tabs)/index.tsx      — Home Tab
    │   ├── app/(tabs)/search.tsx     — Search Tab
    │   └── app/(tabs)/library.tsx    — Library Tab
    ├── MiniPlayer      — 当 currentTrack 存在且未全屏时显示
    └── NowPlayingScreen — 当 showNowPlaying 为 true 时覆盖全屏
```

`MiniPlayer` 和 `NowPlayingScreen` 不是路由页面，而是叠在 `<Slot />` 上方的条件渲染浮层。

### 进度条防抖方案

拖拽进度条期间，音频回调持续更新 `position` 会导致 Slider 跳回。解决方案：

1. `seekingRef.current = true` 时 Slider 使用本地 `seekValue`
2. `onSlidingStart` 将 `seekValue` 初始化为当前 `position`，避免拖拽起点跳零
3. `onSlidingComplete` 调用 `seekTo` 后重置 ref
4. `progressUpdateIntervalMillis: 500` 降低回调频率

---

## 数据说明

目前使用本地 Mock 数据（`src/data/mockData.ts`）：

- **音频**：来自 [SoundHelix](https://www.soundhelix.com/) 的免费示例 MP3（12 首）
- **封面图**：来自 [picsum.photos](https://picsum.photos/) 的随机图片
- 可替换为真实 API，只需修改 `TRACKS` 数组中每条记录的 `audioUrl` 和 `artwork` 字段

---

## 已知限制

- 暂无本地文件扫描，仅支持网络流媒体 URL
- 搜索为本地过滤，暂不对接远程搜索接口
- 播放列表、喜欢、添加等操作 UI 已呈现但暂未持久化
- 后台播放在 Expo Go 中受系统限制，打包为独立 App 后可完整支持
