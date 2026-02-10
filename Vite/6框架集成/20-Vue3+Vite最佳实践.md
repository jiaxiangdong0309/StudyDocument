# Vue 3 + Vite 最佳实践

## 1. 解决什么问题？
> 让 Vue 3 项目开发体验达到极致：秒级启动、毫秒级热更新、开箱即用的生态集成。

* **痛点**：Vue CLI 基于 Webpack，启动慢、HMR 慢，配置复杂
* **作用**：Vite 原生支持 Vue 3，提供极速开发体验和简洁的配置方式

## 2. 通俗理解

### 核心定义
Vue 3 + Vite 是 Vue 官方推荐的开发组合。Vite 由 Vue 作者尤雨溪开发，与 Vue 3 天然契合，提供最佳的开发体验和构建性能。

### 生活化比喻
如果说 Vue 3 是一辆跑车，那 Vite 就是专为它设计的引擎。虽然其他引擎（Webpack）也能用，但专属引擎能让这辆跑车发挥最大性能。

## 3. 工作原理

```mermaid
graph TB
    subgraph "开发环境"
        A[.vue 文件] --> B[@vitejs/plugin-vue]
        B --> C[SFC 编译]
        C --> D[template 编译]
        C --> E[script 编译]
        C --> F[style 编译]
        D --> G[渲染函数]
        E --> H[ES Modules]
        F --> I[CSS 注入]
    end

    subgraph "生产构建"
        J[源代码] --> K[Rollup 打包]
        K --> L[Tree Shaking]
        L --> M[代码分割]
        M --> N[优化产物]
    end
```

## 4. 核心代码实战

### 4.1 项目初始化与基础配置

```bash
# 创建 Vue 3 + TypeScript 项目
npm create vite@latest my-vue-app -- --template vue-ts

cd my-vue-app
npm install
npm run dev
```

**vite.config.ts 基础配置：**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),  // 路径别名
      '@components': resolve(__dirname, 'src/components'),
      '@views': resolve(__dirname, 'src/views'),
    }
  },

  server: {
    port: 3000,
    open: true,  // 自动打开浏览器
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### 4.2 Vue Router 集成与路由懒加载

```bash
npm install vue-router@4
```

**router/index.ts：**

```typescript
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@views/Home.vue')  // 路由懒加载
  },
  {
    path: '/user',
    name: 'User',
    // 带有 webpackChunkName 注释可以自定义 chunk 名称
    component: () => import(/* webpackChunkName: "user" */ '@views/User.vue'),
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@views/user/Profile.vue')
      }
    ]
  },
  {
    path: '/admin',
    name: 'Admin',
    // 路由级别的代码分割，生成独立 chunk
    component: () => import('@views/Admin.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
```

### 4.3 Pinia 状态管理集成

```bash
npm install pinia
```

**stores/user.ts：**

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 推荐使用 setup 风格，与 Composition API 一致
export const useUserStore = defineStore('user', () => {
  // state
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>('')

  // getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name ?? '游客')

  // actions
  async function login(credentials: LoginParams) {
    const res = await loginApi(credentials)
    token.value = res.token
    userInfo.value = res.userInfo
    // 持久化到 localStorage
    localStorage.setItem('token', res.token)
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  // 初始化时恢复状态
  function initFromStorage() {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
    }
  }

  return { userInfo, token, isLoggedIn, userName, login, logout, initFromStorage }
})
```

**main.ts 集成：**

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
```

### 4.4 组件自动导入配置

```bash
npm install -D unplugin-vue-components unplugin-auto-import
```

**vite.config.ts：**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),

    // 自动导入 Vue 相关函数，如 ref, reactive, computed 等
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',  // 生成类型声明
      resolvers: [ElementPlusResolver()],
    }),

    // 自动导入组件
    Components({
      dirs: ['src/components'],  // 自动扫描的目录
      extensions: ['vue'],
      dts: 'src/components.d.ts',
      resolvers: [
        ElementPlusResolver(),  // Element Plus 组件自动导入
      ],
    }),
  ],
})
```

**使用效果 - 无需手动导入：**

```vue
<script setup lang="ts">
// 无需 import { ref, computed } from 'vue'
// 无需 import { useRouter } from 'vue-router'
// 无需 import { ElButton } from 'element-plus'

const count = ref(0)  // 直接使用
const router = useRouter()  // 直接使用
const doubled = computed(() => count.value * 2)
</script>

<template>
  <!-- 无需导入 ElButton -->
  <el-button @click="count++">{{ count }}</el-button>
</template>
```

### 4.5 环境变量与多环境配置

**.env.development：**

```bash
# 开发环境
VITE_APP_TITLE=My App (Dev)
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ENABLE_MOCK=true
```

**.env.production：**

```bash
# 生产环境
VITE_APP_TITLE=My App
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_MOCK=false
```

**类型声明 env.d.ts：**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

**使用环境变量：**

```typescript
// 在代码中使用
const apiUrl = import.meta.env.VITE_API_BASE_URL
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
```

### 4.6 构建优化配置

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  build: {
    target: 'es2015',  // 兼容性目标
    outDir: 'dist',
    assetsDir: 'assets',

    // 启用 CSS 代码分割
    cssCodeSplit: true,

    // 生产环境移除 console
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    // 分包策略
    rollupOptions: {
      output: {
        // 入口文件名
        entryFileNames: 'js/[name]-[hash].js',
        // chunk 文件名
        chunkFileNames: 'js/[name]-[hash].js',
        // 资源文件名
        assetFileNames: '[ext]/[name]-[hash].[ext]',

        // 手动分包
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
        },
      },
    },
  },
})
```

## 5. 最佳实践

### 性能考虑
- **路由懒加载**：所有路由组件都使用动态导入
- **组件按需导入**：使用 unplugin 插件避免全量引入 UI 库
- **合理分包**：将框架代码和业务代码分离，充分利用浏览器缓存

### 注意事项
- **路径别名同步**：`vite.config.ts` 和 `tsconfig.json` 中的别名需要保持一致
- **环境变量前缀**：必须以 `VITE_` 开头才能在客户端代码中访问
- **SSR 兼容**：如果需要 SSR，避免在模块顶层使用 `window`/`document`

### 边界情况
- **大型项目首次启动**：依赖预构建可能需要较长时间，使用 `optimizeDeps.include` 预先声明
- **动态路由**：使用 `import.meta.glob` 实现文件系统路由

## 6. 常见错误与解决方案

### 错误 1：路径别名不生效

```typescript
// ❌ 错误：只在 vite.config.ts 配置
// tsconfig.json 中没有对应配置，IDE 报错

// ✅ 正确：两边都要配置
// vite.config.ts
resolve: {
  alias: { '@': resolve(__dirname, 'src') }
}

// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

### 错误 2：Vue 组件 HMR 失效

```vue
<!-- ❌ 错误：组件没有定义 name，HMR 可能异常 -->
<script setup lang="ts">
// ...
</script>

<!-- ✅ 正确：使用 defineOptions 定义组件名 -->
<script setup lang="ts">
defineOptions({
  name: 'MyComponent'
})
</script>
```

### 错误 3：打包后白屏

```typescript
// ❌ 错误：base 路径配置不正确
export default defineConfig({
  base: '/'  // 部署到子目录时会白屏
})

// ✅ 正确：根据部署路径配置
export default defineConfig({
  base: '/my-app/'  // 部署到 https://example.com/my-app/
})
```

## 7. 扩展思考

### 进阶配置

**1. Vue DevTools 配置：**

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,  // 启用 defineModel
        propsDestructure: true,  // 启用 props 解构
      },
    }),
  ],

  // 生产环境禁用 devtools
  define: {
    __VUE_PROD_DEVTOOLS__: false,
  },
})
```

**2. 文件系统路由（类似 Nuxt）：**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'

export default defineConfig({
  plugins: [
    vue(),
    Pages({
      dirs: 'src/pages',  // 页面目录
      extensions: ['vue'],
    }),
    Layouts({
      layoutsDirs: 'src/layouts',
    }),
  ],
})
```

### 相关资源
- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vite 官方文档](https://cn.vitejs.dev/)
- [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components)
- [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)

---

_本文档将持续更新，添加更多 Vue 3 + Vite 最佳实践内容_
