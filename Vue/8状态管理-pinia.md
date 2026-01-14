# Pinia（Pinia）

## 什么是 Pinia？

### 定义

Pinia 是 Vue 官方推荐的新一代状态管理库，专为 Vue 3 设计，提供更轻量、类型友好、模块化的全局状态管理方案。
英文原文：Pinia

### 通俗理解

可以把 Pinia 理解为"全局数据仓库"，就像一个超市的货架，所有组件都可以方便地取用和更新货物（数据），而且货架管理更灵活、简单。

## 核心特征/组成部分

- **极简 API**：使用和学习成本低，API 直观易懂
- **模块化**：每个 Store 独立，天然支持拆分和组合
- **类型推导友好**：对 TypeScript 支持极佳
- **响应式**：基于 Vue 3 响应式系统，数据变化自动驱动视图更新
- **插件机制**：支持扩展功能，如持久化、日志等
- **Devtools 支持**：集成 Vue Devtools，调试体验好

## 工作原理/实现方式

- Pinia 通过 `defineStore` 定义 Store，每个 Store 就是一个独立的全局状态模块。
- Store 内部包含 state（数据）、getter（计算属性）、action（方法）。
- 组件通过 `useStore` 访问和操作 Store，实现数据共享和逻辑复用。
- 所有 Store 都是响应式的，数据变化会自动反映到所有使用它的组件。

## 典型应用场景

- 多组件间共享用户信息、购物车、权限等全局数据
- 跨页面数据同步
- 复杂业务流程的状态流转
- 替代 Vuex，适用于中大型 Vue 3 项目

## 代码示例

### 1. 安装与注册

```bash
npm install pinia
```

在 main.js 中注册：

```js
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

const app = createApp(App);
app.use(createPinia());
app.mount("#app");
```

### 2. 定义 Store

```js
// stores/counter.js
import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", {
  state: () => ({ count: 0 }),
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++;
    },
  },
});
```

### 3. 组件中使用

```vue
<script setup>
import { useCounterStore } from "@/stores/counter";
const counter = useCounterStore();
</script>
<template>
  <div>计数：{{ counter.count }}</div>
  <div>双倍：{{ counter.doubleCount }}</div>
  <button @click="counter.increment">加一</button>
</template>
```

### 4. 多 Store 模块

```js
// stores/user.js
import { defineStore } from "pinia";
export const useUserStore = defineStore("user", {
  state: () => ({ name: "张三", age: 18 }),
  actions: {
    setName(name) {
      this.name = name;
    },
  },
});
```

---

## 进阶用法

### 1. 持久化插件使用

Pinia 支持通过插件实现状态持久化，如 pinia-plugin-persistedstate：

```bash
npm install pinia-plugin-persistedstate
```

在 main.js 注册插件：

```js
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
```

在 store 中开启持久化：

```js
export const useCounterStore = defineStore("counter", {
  state: () => ({ count: 0 }),
  persist: true,
});
```

### 2. 组合式 store（setup store）

Pinia 支持用 setup 语法定义 store，获得更灵活的逻辑复用：

```js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
export const useSetupStore = defineStore("setup", () => {
  const count = ref(0);
  const double = computed(() => count.value * 2);
  function increment() {
    count.value++;
  }
  return { count, double, increment };
});
```

### 3. Store 间依赖与调用

一个 store 可以在 action 中访问其他 store：

```js
import { useUserStore } from "./user";
export const useCounterStore = defineStore("counter", {
  actions: {
    printUserName() {
      const userStore = useUserStore();
      console.log(userStore.name);
    },
  },
});
```

### 4. 重置 store 状态

可以通过 `$reset()` 方法重置 state 到初始值（仅对象式 store 支持）：

```js
const counter = useCounterStore();
counter.$reset();
```

### 5. SSR 支持

Pinia 天然支持服务端渲染（SSR），只需在服务端和客户端都创建 pinia 实例并注入即可，具体可参考[官方文档](https://pinia.vuejs.org/zh/ssr/)。

---

## 优缺点分析

**优点：**

- 语法简洁，学习成本低
- 类型推导优秀，TS 友好
- 支持模块化，易于维护
- 响应式强，性能好
- 插件和 Devtools 支持完善

**缺点：**

- 仅支持 Vue 3，不兼容 Vue 2
- 生态相对 Vuex 略小，部分高级插件较少
- 对于极其简单的小项目，可能无需全局状态管理

## 总结与扩展阅读

Pinia 是 Vue 3 时代的主流状态管理方案，推荐在新项目中优先使用。它以极简、类型安全和模块化为核心优势，极大提升了开发体验。

**扩展阅读：**

- [Pinia 官方文档](https://pinia.vuejs.org/zh/)
- [Pinia vs Vuex 对比](https://pinia.vuejs.org/zh/cookbook/comparison-vuex.html)
- [Vue 3 官方文档](https://cn.vuejs.org/)

---

_本文档将持续更新，添加更多相关内容_
