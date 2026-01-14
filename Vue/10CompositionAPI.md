# Composition API

## 什么是 Composition API？

### 定义

Composition API 是 Vue 3 引入的一套全新组件逻辑组织方式，通过函数式的 API（如 setup、ref、reactive、computed、watch 等）实现更灵活的逻辑复用和组合。英文原文：Composition API。

### 通俗理解

可以把 Composition API 想象成"乐高积木"：你可以把不同的功能逻辑像积木一样自由组合，拼装出复杂的组件。

## 核心特征/组成部分

- setup 函数作为组件入口
- 响应式 API（ref、reactive、computed、watch）
- 逻辑复用（自定义 hooks）
- 更好地支持 TypeScript
- 代码组织更灵活、可组合

## 工作原理/实现方式

- 组件在 setup 阶段初始化响应式数据和方法
- 通过组合式 API 组织和复用逻辑
- 支持与选项式 API 混用

## 典型应用场景

- 复杂组件的逻辑拆分与复用
- 跨组件/模块的业务逻辑共享
- TypeScript 项目开发

## 代码示例

### 1. 基本用法

```vue
<script setup>
import { ref, computed } from "vue";
const count = ref(0);
const double = computed(() => count.value * 2);
</script>
<template>
  <button @click="count++">加一</button>
  <div>当前：{{ count }}，双倍：{{ double }}</div>
</template>
```

### 2. 自定义 Hook

```js
// useMouse.js
import { ref, onMounted, onUnmounted } from "vue";
export function useMouse() {
  const x = ref(0),
    y = ref(0);
  function update(e) {
    x.value = e.pageX;
    y.value = e.pageY;
  }
  onMounted(() => window.addEventListener("mousemove", update));
  onUnmounted(() => window.removeEventListener("mousemove", update));
  return { x, y };
}
```

```vue
<script setup>
import { useMouse } from "./useMouse";
const { x, y } = useMouse();
</script>
<template>
  <div>鼠标坐标：{{ x }}, {{ y }}</div>
</template>
```

## 优缺点分析

**优点：**

- 逻辑复用性强，代码更灵活
- 更好支持 TypeScript
- 便于大型项目的组织和维护

**缺点：**

- 初学者理解有门槛
- 代码风格与 Vue 2 差异较大，迁移需适应

## 总结与扩展阅读

Composition API 是 Vue 3 的核心创新，建议在新项目中优先采用。

- [Vue 官方文档 - Composition API](https://cn.vuejs.org/guide/extras/composition-api-faq.html)

---

_本文档将持续更新，添加更多相关内容_
