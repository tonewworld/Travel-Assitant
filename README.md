#旅游规划小助手

# 旅游规划助手（Travel Assistant）

本项目是一个基于 Web 的“大模型小助手”系统示例，实现以下功能模块：

- 自然语言交互模块
- 旅游攻略生成模块（结合高德地图数据接口预留）
- 用户界面模块（响应式，适配 PC / 移动端）
- 结果导出模块（PDF / 图片 / 文本）

## 一、项目结构

```text
Travel-Assitant/
  frontend/   // 前端 Web 应用（Vite + React + TS）
  backend/    // 后端 API 服务（Node + Express + TS）
```

## 二、快速启动

### 1. 启动后端

```bash
cd backend
npm install
npm run dev
```

默认监听 `http://localhost:3000`。

如需配置高德 / 大模型密钥，请编辑：

```ts
backend/src/config/config.ts
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

默认访问 `http://localhost:5173`（具体以 Vite 控制台输出为准）。

## 三、功能说明

### 1. 自然语言交互模块

- `/api/chat` 接口
- 支持多轮对话、上下文记忆（后端保存当前会话消息列表）
- 记录用户偏好（出行方式、预算、口味、行程节奏等），保存在内存（可扩展为数据库）

### 2. 旅游攻略生成模块

- `/api/itinerary/generate` 接口
- 结合：
  - 用户自然语言需求
  - 用户偏好（偏向美食、打卡、深度游等）
  - 行程天数、出发城市、目的地等参数
- 返回结构化攻略（天数安排、景点、交通、餐饮等）并以结构化 JSON 表达
- 预留高德地图 MCP 接口调用（路径规划、POI 检索等）

### 3. 用户界面模块

- 响应式布局，支持 PC 和移动端
- 模块：
  - 聊天窗口（ChatPanel）
  - 偏好设置（PreferencePanel）
  - 攻略展示（ItineraryView）
  - 导出区域（ExportPanel）
  - 示例输入（ExampleInput）

### 4. 结果导出模块

- 前端实现三种导出方式：
  - 导出为文本（复制 / 下载 .txt）
  - 导出为图片（使用 `html2canvas` 截取攻略区域）
  - 导出为 PDF（使用 `jspdf` 将图片插入 PDF）

## 四、后续接入建议

1. **大模型服务接入**

   - 在 `backend/src/services/llmService.ts` 里替换 `mock` 实现，调用你选用的大模型 API
   - 根据模型接口调整 `buildPromptForItinerary` 等提示词（prompt）
2. **高德地图 MCP / Web 服务接入**

   - 在 `backend/src/services/amapService.ts` 中配置 `AMAP_API_KEY`
   - 根据高德文档实现：
     - 路线规划（驾车 / 公交换乘 / 步行）
     - POI 搜索（景点、餐厅、酒店）
   - 在 `itinerary` 生成逻辑中，调用这些函数获取更真实的数据
3. **持久化与用户系统（可选）**

   - 当前会话/偏好信息存内存
   - 可扩展为数据库（MySQL / PostgreSQL / MongoDB）
   - 增加简单登录后，支持多用户会话管理
