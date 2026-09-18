# 翠魂·四会 | Jade Soul Sihui

## 项目简介
一个专注于四会玉器文化的沉浸式展示与交流平台。包含动态时间轴体验、3D玉器博物馆、AI智能鉴玉、AI试戴、玉石论坛等核心模块，旨在用现代技术传播传统玉文化。

---

## 技术栈
- **前端**：React 19 + TypeScript + TailwindCSS + Framer Motion + React Three Fiber
- **后端**：Node.js + Express + SQLite3
- **AI集成**：阿里云通义千问（图像识别、对话）、火山引擎即梦4.0（AI试戴图生图）
- **开发工具**：Vite + concurrently

---

## 项目结构
```
project-root/
├── index.html                # 入口HTML
├── index.tsx                 # 应用入口（渲染App）
├── src/
│   ├── App.tsx               # 主应用组件（路由/页面切换）
│   ├── api/                  # 后端接口封装
│   │   └── index.js
│   ├── components/           # 可复用UI组件
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── HistorySection.tsx
│   │   ├── MarketSection.tsx
│   │   ├── GallerySection.tsx
│   │   ├── KnowledgeSection.tsx
│   │   ├── CraftSection.tsx
│   │   ├── JadeAnalyzer.tsx
│   │   ├── JadeChat.tsx
│   │   ├── Footer.tsx
│   │   ├── ScrollProgressBar.tsx
│   │   ├── AITryonSection.tsx
│   │   ├── ForumSection.tsx
│   │   ├── PostDetailView.tsx
│   │   └── 3d/
│   │       └── JadeMuseumCanvas.tsx
│   ├── pages/                # 独立页面级组件
│   │   ├── MuseumPage.tsx    # 3D博物馆
│   │   ├── LoginPage.tsx     # 登录页
│   │   ├── RegisterPage.tsx  # 注册页
│   │   ├── CreatePostPage.tsx# 发帖页
│   │   ├── EditPostPage.tsx  # 编辑帖子页
│   │   ├── UserProfile.tsx   # 个人资料页
│   │   └── TryOnPage.tsx     # AI试戴页（独立版，已内嵌至首页）
│   ├── types/                # TypeScript类型定义
│   │   └── index.ts
│   └── utils/                # 工具函数
│       └── gemini.ts         # 千问API封装（仍保留文件名，实际调用后端）
├── server/                   # 后端服务
│   ├── app.js                # Express主文件
│   ├── db.js                 # SQLite数据库连接与初始化
│   ├── uploads/              # 上传图片存储目录
│   ├── seed.js               # 假数据生成脚本
│   └── package.json
└── README.md
```

---

## 模块说明

### 1. 前端核心模块

#### `App.tsx`
- 全局状态管理：`pageView`控制当前显示页面（home/museum/login/register/create/edit/profile）
- 导航栏始终显示，根据页面不同渲染对应内容
- 滚动监听、回到顶部按钮、论坛区块滚动偏移

#### 组件层 (`components/`)
- **Navbar**：固定导航栏，高亮当前区块，处理页面滚动（首页/论坛/AI试戴等区块）
- **HeroSection**：首页首屏，带时间轴滑动、动态背景、手电筒效果
- **HistorySection**：横向滑动时间轴，展示四会十二时辰
- **MarketSection**：四大市场切换卡片，带详情模态框（模态框位置基于按钮动态定位）
- **GallerySection**：名玉赏析，3D模型+文字介绍，可进入博物馆
- **KnowledgeSection**：种水阶梯知识卡 + ABC货说明
- **CraftSection**：四会工艺介绍 + 对比滑块（原石 vs 成品）
- **JadeAnalyzer**：AI鉴玉双标签页（深度鉴定/快速识别），上传图片调用后端千问API
- **JadeChat**：悬浮聊天机器人，调用后端千问API回答问题
- **Footer**：页脚信息
- **AITryonSection**：AI试戴区块（内嵌首页），上传人物和玉石图片，调用火山引擎即梦4.0生成佩戴效果图
- **ForumSection**：论坛区块（内嵌首页），瀑布流帖子列表、详情、评论、点赞、编辑、删除功能
- **PostDetailView**：独立帖子详情视图，用于从编辑页返回时直接显示
- **3d/JadeMuseumCanvas**：封装React Three Fiber画布，加载GLB模型，支持旋转/缩放

#### 页面层 (`pages/`)
- **MuseumPage**：3D博物馆，左右分栏（主画布 + 文物缩略图列表），点击切换模型
- **LoginPage / RegisterPage**：独立登录/注册表单，样式与主站一致
- **CreatePostPage**：发帖表单（标题、内容、多图上传），成功后返回论坛区块
- **EditPostPage**：编辑帖子（标题、内容、图片增删），支持删除帖子
- **UserProfile**：个人资料设置页（修改头像、用户名、密码）
- **TryOnPage**：独立AI试戴页面（已内嵌，可保留但未使用）

#### 工具与类型
- **utils/gemini.ts**：封装千问API调用（深度鉴定、快速识别），实际请求转发到后端 `/api/analyze` 和 `/api/identify`
- **types/index.ts**：全局类型 `PageView`（页面枚举）及其他共享接口

---

### 2. 后端服务 (`server/`)

#### `app.js`
- Express服务器，端口3001
- 中间件：cors、express.json、静态文件`/uploads`
- 路由：
  - **认证**：`/api/register`（注册）、`/api/login`（登录）、`/api/me`（获取当前用户）、`/api/user/profile`（获取/更新用户资料）
  - **帖子**：`GET /api/posts`（分页列表）、`GET /api/posts/:id`（详情）、`POST /api/posts`（发帖）、`PUT /api/posts/:id`（更新帖子）、`DELETE /api/posts/:id`（删除帖子）
  - **评论**：`POST /api/posts/:id/comments`（发表评论）、`DELETE /api/comments/:id`（删除评论）
  - **点赞**：`POST /api/posts/:id/like`（点赞/取消点赞）
  - **AI功能**：
    - `POST /api/analyze`：玉石鉴定（自然光+透光图，调用千问）
    - `POST /api/identify`：快速识别（单图，调用千问）
    - `POST /api/chat`：聊天机器人（调用千问）
    - `POST /api/tryon`：AI试戴（上传人物和玉石图片，调用火山引擎即梦4.0生成效果图）
  - **图片上传**：使用 `multer` 处理，存储于 `uploads/` 目录

#### `db.js`
- 初始化SQLite数据库`forum.db`
- 建表：users、posts、post_images、comments、likes
- 导出数据库连接对象

#### 数据表结构
```sql
users: id, username, password_hash, avatar, created_at
posts: id, title, content, user_id, created_at, updated_at, likes
post_images: id, post_id, image_url
comments: id, post_id, user_id, content, created_at
likes: id, user_id, post_id, created_at
```

---

## 环境变量

### 前端
在项目根目录创建`.env`文件：
```
VITE_API_BASE_URL=/api   # 生产环境使用相对路径，开发环境可设置代理
```

### 后端
在`server/`目录下创建`.env`：
```
PORT=3001
JWT_SECRET=你的JWT密钥
DASHSCOPE_API_KEY=你的阿里云百炼API Key
VOLCANO_AK=你的火山引擎AccessKey
VOLCANO_SK=你的火山引擎SecretKey
IMGBB_API_KEY=你的imgbb API Key（用于AI试戴图床上传）
```

---

## 如何运行

### 1. 安装依赖
```bash
# 根目录（前端）
npm install

# 进入server目录（后端）
cd server
npm install
```

### 2. 配置API密钥
- 获取阿里云百炼API Key，填入`.env`的`DASHSCOPE_API_KEY`
- 获取火山引擎AK/SK，填入`VOLCANO_AK`和`VOLCANO_SK`
- 可选：获取imgbb API Key用于AI试戴图片临时上传

### 3. 启动开发服务器
```bash
# 根目录（同时启动前后端）
npm run dev
```
- 前端：http://localhost:3000
- 后端：http://localhost:3001

### 4. 构建生产版本
```bash
npm run build
```

### 5. 部署到服务器（Nginx + PM2）
- 将构建后的`dist`目录上传至服务器网站根目录
- 配置Nginx反向代理，将`/api`请求转发到后端`http://127.0.0.1:3001`
- 使用PM2启动后端：`pm2 start app.js --name jade-api`

---

## 关键功能说明

### AI鉴玉 (`JadeAnalyzer`)
- 两种模式：深度鉴定（自然光+透光照）和快速识别（单张照片）
- 后端调用阿里云千问视觉模型（`qwen3.5-plus`），返回Markdown格式报告
- 包含种水、颜色、瑕疵、工艺、综合评价五个维度

### AI试戴 (`AITryonSection`)
- 上传人物照片和玉石照片，可选提示词
- 后端将图片上传至imgbb获取公网URL，提交火山引擎即梦4.0异步任务
- 轮询结果，返回生成的佩戴效果图（Base64），前端展示并可下载

### 论坛系统
- 用户认证（JWT）保护发帖、评论、点赞、编辑、删除接口
- 帖子支持多图上传，存储于`server/uploads/`
- 瀑布流布局（Grid实现），初始加载8条，滚动加载4条，带骨架屏动画
- 帖子详情页支持点赞、评论、删除评论、编辑帖子（含图片增删）、删除帖子
- 个人资料页可修改头像、用户名、密码
- 登录状态全局管理，未登录时发帖/评论/点赞会跳转登录页

### 3D博物馆 (`MuseumPage`)
- 使用React Three Fiber加载GLB模型文件
- 支持拖拽旋转、缩放、自动慢速旋转
- 模型与描述图片一一对应，点击缩略图切换

### 动态时间轴 (`HistorySection`)
- 模拟四会一天的不同时段（鬼市、早市、雕刻、成品、直播）
- 横向滑动卡片，背景图+渐变文字

---

## 注意事项
- 首次运行时，SQLite数据库会自动创建并建表，无需手动操作
- 图片上传默认限制9张/次，可通过`upload.array('images', 9)`调整
- 前端所有API请求已封装在`src/api/index.js`，生产环境`API_BASE`应设为`/api`（配合Nginx代理）
- 项目已拆分模块，便于维护和扩展
- AI试戴功能依赖外部API（imgbb、火山引擎），请确保网络通畅且密钥有效

---

欢迎AI同学快速上手！如有疑问，请参考各文件内详细注释。