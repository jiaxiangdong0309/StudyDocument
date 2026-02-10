# React + Vite 配置

## 1. 解决什么问题？
> 摆脱 Create React App 的束缚，获得极速的 React 开发体验和灵活的配置能力。

* **痛点**：CRA 启动慢、配置被锁定、eject 后难以维护
* **作用**：Vite 提供开箱即用的 React 支持，启动快、配置透明、生态丰富

## 2. 通俗理解

### 核心定义
React + Vite 是现代 React 项目的推荐技术栈。通过 `@vitejs/plugin-react` 插件，Vite 为 React 提供了 JSX 转换、Fast Refresh（快速刷新）等核心功能。

### 生活化比喻
如果说 CRA 是一个精装房（配置好但不能改），那 Vite 就是一个毛坯房 + 装修指南（灵活配置，想怎么装就怎么装）。虽然需要动手，但更能满足个性化需求。

## 3. 工作原理

```mermaid
graph TB
    subgraph "开发环境"
        A[.jsx/.tsx 文件] --> B[@vitejs/plugin-react]
        B --> C{转换引擎选择}
        C -->|开发环境| D[esbuild]
        C -->|生产构建| E[Babel/SWC]
        D --> F[Fast Refresh]
        E --> G[优化产物]
    end

    subgraph "Fast Refresh"
        H[代码修改] --> I[仅更新组件]
        I --> J[保持状态]
        J --> K[即时预览]
    end
```

## 4. 核心代码实战

### 4.1 项目初始化

```bash
# 创建 React + TypeScript 项目
npm create vite@latest my-react-app -- --template react-ts

cd my-react-app
npm install
npm run dev
```

**项目结构：**

```
my-react-app/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx        # 入口文件
│   └── vite-env.d.ts   # Vite 类型声明
├── index.html          # HTML 入口
├── vite.config.ts      # Vite 配置
├── tsconfig.json
├── tsconfig.node.json
└── package.json
```

### 4.2 基础配置

**vite.config.ts：**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react({
      // 使用 Babel 还是 SWC（更快）
      // 如果项目不需要特殊 Babel 插件，推荐 SWC
      // babel: { ... }  // Babel 配置
    })
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
    }
  },

  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
```

**tsconfig.json 路径别名：**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@pages/*": ["src/pages/*"],
      "@utils/*": ["src/utils/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 4.3 使用 SWC 替代 Babel（更快）

```bash
# 安装 SWC 版本的 React 插件
npm install -D @vitejs/plugin-react-swc
```

**vite.config.ts：**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],  // SWC 版本，构建更快
})
```

> **性能对比**：SWC 比 Babel 快 20-70 倍，推荐在不需要特殊 Babel 插件时使用。

### 4.4 React Router 集成

```bash
npm install react-router-dom
```

**router/index.tsx：**

```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from '@/components/Layout'

// 路由懒加载
const Home = lazy(() => import('@/pages/Home'))
const About = lazy(() => import('@/pages/About'))
const UserProfile = lazy(() => import('@/pages/user/Profile'))

// 加载中组件
const Loading = () => <div className="loading">Loading...</div>

// 懒加载包装器
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <LazyWrapper><Home /></LazyWrapper>
      },
      {
        path: 'about',
        element: <LazyWrapper><About /></LazyWrapper>
      },
      {
        path: 'user/:id',
        element: <LazyWrapper><UserProfile /></LazyWrapper>
      }
    ]
  }
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
```

### 4.5 状态管理集成（Zustand）

```bash
npm install zustand
```

**stores/useUserStore.ts：**

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UserInfo {
  id: string
  name: string
  email: string
}

interface UserState {
  user: UserInfo | null
  token: string
  isLoggedIn: boolean
  login: (user: UserInfo, token: string) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: '',
      isLoggedIn: false,

      login: (user, token) => set({
        user,
        token,
        isLoggedIn: true
      }),

      logout: () => set({
        user: null,
        token: '',
        isLoggedIn: false
      }),
    }),
    {
      name: 'user-storage',  // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),  // 只持久化 token
    }
  )
)
```

**组件中使用：**

```tsx
import { useUserStore } from '@/stores/useUserStore'

function UserMenu() {
  const { user, isLoggedIn, logout } = useUserStore()

  if (!isLoggedIn) {
    return <LoginButton />
  }

  return (
    <div className="user-menu">
      <span>欢迎，{user?.name}</span>
      <button onClick={logout}>退出</button>
    </div>
  )
}
```

### 4.6 自动导入配置

```bash
npm install -D unplugin-auto-import
```

**vite.config.ts：**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    react(),
    AutoImport({
      imports: [
        'react',
        'react-router-dom',
        {
          // 自定义导入
          'zustand': ['create'],
          '@/hooks/useRequest': ['useRequest'],
        }
      ],
      dts: 'src/auto-imports.d.ts',
      // 在 .tsx 文件中自动导入
      include: [/\.[tj]sx?$/],
    }),
  ],
})
```

**使用效果：**

```tsx
// 无需手动 import { useState, useEffect } from 'react'
// 无需手动 import { useNavigate } from 'react-router-dom'

function MyComponent() {
  const [count, setCount] = useState(0)  // 直接使用
  const navigate = useNavigate()  // 直接使用

  useEffect(() => {
    console.log('mounted')
  }, [])

  return <div>{count}</div>
}
```

### 4.7 环境变量配置

**.env.development：**

```bash
VITE_APP_TITLE=My React App (Dev)
VITE_API_URL=http://localhost:8080/api
VITE_ENABLE_MSW=true
```

**.env.production：**

```bash
VITE_APP_TITLE=My React App
VITE_API_URL=https://api.example.com
VITE_ENABLE_MSW=false
```

**src/vite-env.d.ts：**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
  readonly VITE_ENABLE_MSW: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 4.8 构建优化

```typescript
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),  // 自动分离 vendor
  ],

  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: false,  // 生产环境关闭 sourcemap

    // 手动分包
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['antd', '@ant-design/icons'],
        },
      },
    },

    // 设置 chunk 大小警告阈值
    chunkSizeWarningLimit: 500,
  },
})
```

## 5. 最佳实践

### 性能考虑
- **使用 SWC**：比 Babel 快得多，推荐默认使用
- **路由懒加载**：所有页面组件使用 `lazy()` + `Suspense`
- **合理分包**：框架库、UI 库、业务代码分开打包

### 注意事项
- **Fast Refresh 限制**：只对函数组件生效，修改 class 组件会整页刷新
- **hooks 规则**：Fast Refresh 要求组件只导出 React 组件
- **HMR 边界**：如果 HMR 失效，检查是否导出了非组件内容

### 边界情况
- **CSS-in-JS**：styled-components、emotion 等需要额外配置
- **SVG 组件化**：使用 `vite-plugin-svgr` 将 SVG 作为组件导入

## 6. 常见错误与解决方案

### 错误 1：Fast Refresh 不工作

```tsx
// ❌ 错误：同时导出组件和工具函数
export function MyComponent() { ... }
export const utils = { ... }  // 这会导致 Fast Refresh 失效

// ✅ 正确：组件文件只导出组件
// MyComponent.tsx
export function MyComponent() { ... }

// utils.ts（单独文件）
export const utils = { ... }
```

### 错误 2：导入图片类型报错

```typescript
// ❌ 错误：TypeScript 不认识图片导入
import logo from './logo.png'  // 报错

// ✅ 正确：在 vite-env.d.ts 添加类型声明
declare module '*.png' {
  const src: string
  export default src
}
declare module '*.svg' {
  const src: string
  export default src
}
```

### 错误 3：生产环境样式丢失

```typescript
// ❌ 错误：CSS-in-JS 库没有正确配置
// 某些 CSS-in-JS 库需要在 Vite 中特殊处理

// ✅ 正确：以 styled-components 为例
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-styled-components', { displayName: true }]
        ]
      }
    })
  ]
})
```

## 7. 扩展思考

### 进阶配置

**1. SVG 组件化：**

```bash
npm install -D vite-plugin-svgr
```

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
})
```

```tsx
// 使用方式
import Logo from './logo.svg?react'

function App() {
  return <Logo className="logo" />
}
```

**2. MSW (Mock Service Worker) 集成：**

```typescript
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

// main.tsx
async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MSW !== 'true') {
    return
  }
  const { worker } = await import('./mocks/browser')
  return worker.start()
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
```

### 相关资源
- [Vite React 官方指南](https://cn.vitejs.dev/guide/#trying-vite-online)
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)
- [Zustand 文档](https://docs.pmnd.rs/zustand)

---

_本文档将持续更新，添加更多 React + Vite 配置技巧_
