# 快速上手：创建第一个 Vite 项目 (Getting Started)

## 1. 解决什么问题？

> **一句话直击核心**：帮助开发者在几秒钟内搭建一个现代化的前端项目脚手架。

* **痛点**：传统项目初始化需要手动配置大量构建工具、处理各种依赖关系
* **作用**：Vite 提供开箱即用的项目模板，一行命令即可创建完整的开发环境

---

## 2. 通俗理解

### 核心定义

`npm create vite` 是 Vite 官方提供的项目脚手架工具，它可以快速生成包含最佳实践配置的项目模板，支持多种框架（Vue、React、Svelte 等）和变体（JavaScript、TypeScript）。

### 生活化比喻

**创建 Vite 项目就像去宜家买家具**：
- 不需要自己砍树、加工木材
- 选择你喜欢的款式（框架模板）
- 拿回家按说明书组装（npm install）
- 直接就能用（npm run dev）

---

## 3. 工作原理

```
┌─────────────────────────────────────────────────────────────────┐
│                 Vite 项目创建流程                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  npm create vite@latest                                         │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────┐                                           │
│  │  选择项目名称    │                                           │
│  └────────┬────────┘                                           │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │  选择框架模板    │  Vue / React / Svelte / Vanilla...       │
│  └────────┬────────┘                                           │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │  选择语言变体    │  JavaScript / TypeScript                  │
│  └────────┬────────┘                                           │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │  生成项目文件    │  -> npm install -> npm run dev            │
│  └─────────────────┘                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. 核心代码实战

### 场景一：交互式创建项目（推荐新手）

```bash
# 使用 npm
npm create vite@latest

# 使用 yarn
yarn create vite

# 使用 pnpm
pnpm create vite
```

执行后会出现交互式选项：

```
? Project name: › my-vite-app
? Select a framework: › - Use arrow-keys. Return to submit.
❯   Vanilla
    Vue
    React
    Preact
    Lit
    Svelte
    Solid
    Qwik
    Others
? Select a variant: › - Use arrow-keys. Return to submit.
❯   TypeScript
    JavaScript
    Customize with create-vue
```

### 场景二：一行命令创建指定模板项目

```bash
# 创建 Vue + TypeScript 项目
npm create vite@latest my-vue-app -- --template vue-ts

# 创建 React + TypeScript 项目
npm create vite@latest my-react-app -- --template react-ts

# 创建 Vue + JavaScript 项目
npm create vite@latest my-vue-app -- --template vue

# 创建纯 JavaScript 项目
npm create vite@latest my-app -- --template vanilla
```

### 场景三：完整的项目初始化流程

```bash
# 1. 创建项目
npm create vite@latest my-project -- --template vue-ts

# 2. 进入项目目录
cd my-project

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev

# 控制台输出：
#   VITE v5.x.x  ready in 300 ms
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: use --host to expose
```

---

## 5. 可用的官方模板

| 模板名称 | 框架 | 语言 | 命令 |
|---------|-----|------|-----|
| `vanilla` | 原生 JS | JavaScript | `--template vanilla` |
| `vanilla-ts` | 原生 JS | TypeScript | `--template vanilla-ts` |
| `vue` | Vue 3 | JavaScript | `--template vue` |
| `vue-ts` | Vue 3 | TypeScript | `--template vue-ts` |
| `react` | React | JavaScript | `--template react` |
| `react-ts` | React | TypeScript | `--template react-ts` |
| `react-swc` | React | JavaScript + SWC | `--template react-swc` |
| `react-swc-ts` | React | TypeScript + SWC | `--template react-swc-ts` |
| `preact` | Preact | JavaScript | `--template preact` |
| `preact-ts` | Preact | TypeScript | `--template preact-ts` |
| `lit` | Lit | JavaScript | `--template lit` |
| `lit-ts` | Lit | TypeScript | `--template lit-ts` |
| `svelte` | Svelte | JavaScript | `--template svelte` |
| `svelte-ts` | Svelte | TypeScript | `--template svelte-ts` |
| `solid` | Solid | JavaScript | `--template solid` |
| `solid-ts` | Solid | TypeScript | `--template solid-ts` |
| `qwik` | Qwik | JavaScript | `--template qwik` |
| `qwik-ts` | Qwik | TypeScript | `--template qwik-ts` |

---

## 6. 常用 npm scripts 命令

创建项目后，`package.json` 中会包含以下脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 命令详解

| 命令 | 作用 | 使用场景 |
|-----|------|---------|
| `npm run dev` | 启动开发服务器 | 日常开发，支持 HMR |
| `npm run build` | 构建生产版本 | 打包上线前执行 |
| `npm run preview` | 预览生产构建 | 本地测试打包结果 |

### 常用命令行参数

```bash
# 指定端口
npm run dev -- --port 3000

# 打开浏览器
npm run dev -- --open

# 暴露到局域网
npm run dev -- --host

# 指定配置文件
npm run dev -- --config my-config.js

# 组合使用
npm run dev -- --port 3000 --open --host
```

---

## 7. 最佳实践

### 项目命名规范

```bash
# ✅ 推荐：小写字母 + 连字符
npm create vite@latest my-awesome-app

# ❌ 避免：大写字母、空格、特殊字符
npm create vite@latest "My App"
npm create vite@latest MyAwesomeApp
```

### 版本管理建议

```bash
# 初始化 git 仓库（Vite 不会自动创建）
cd my-project
git init
git add .
git commit -m "Initial commit with Vite"
```

### Node.js 版本要求

```bash
# Vite 5.x 需要 Node.js 18+ 或 20+
node -v  # 检查版本

# 推荐使用 nvm 管理 Node 版本
nvm install 20
nvm use 20
```

---

## 8. 常见问题与解决方案

### Q1：`npm create vite` 和 `npm init vite` 有什么区别？

**回答**：没有区别，`npm create` 是 `npm init` 的别名，两者完全等效。

### Q2：为什么要用 `@latest`？

```bash
# 推荐：始终使用最新版本
npm create vite@latest

# 不推荐：可能使用缓存的旧版本
npm create vite
```

**原因**：npm 会缓存 create-vite 包，加上 `@latest` 可以确保使用最新版本。

### Q3：`--` 的作用是什么？

```bash
npm create vite@latest my-app -- --template vue-ts
#                              ^^
#                              这两个横线
```

**原因**：`--` 是 npm 的参数分隔符，表示后面的参数传递给 create-vite，而不是 npm 本身。

### Q4：创建项目时报错 `EACCES permission denied`

```bash
# 解决方案 1：使用 npx（推荐）
npx create-vite@latest my-app

# 解决方案 2：修复 npm 权限
sudo chown -R $USER ~/.npm
```

### Q5：如何在现有项目中添加 Vite？

```bash
# 1. 安装 Vite
npm install -D vite

# 2. 创建 vite.config.js
# 3. 修改 package.json scripts
# 4. 调整项目结构（index.html 放到根目录）
```

---

## 9. 扩展思考

### 社区模板

除了官方模板，还可以使用社区模板：

```bash
# 使用 GitHub 模板
npx degit user/project my-project

# 常用社区模板
npx degit antfu/vitesse my-project      # Vue 3 最佳实践
npx degit bluwy/create-vite-extra my-project  # 更多模板选择
```

### 与其他脚手架对比

| 脚手架 | 框架 | 特点 |
|-------|------|-----|
| `create-vite` | 多框架 | 轻量、快速、灵活 |
| `create-vue` | Vue | Vue 官方，更多 Vue 生态选项 |
| `create-react-app` | React | React 官方，但已不再推荐 |
| `create-next-app` | React/Next.js | 全栈框架 |
| `create-nuxt-app` | Vue/Nuxt | 全栈框架 |

### 下一步学习

- 熟悉 Vite 项目的目录结构
- 了解 `vite.config.js` 的配置选项
- 学习 Vite 的开发服务器特性

---

_本文档将持续更新，添加更多相关内容_
