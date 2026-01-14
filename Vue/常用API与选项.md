# Vue 常用 API 与选项（Vue Common APIs & Options）

## 什么是 Vue 常用 API 与选项？

### 定义

Vue 提供了一系列用于组件开发的选项和 API，包括 components、data、props、computed、methods、watch、emits、setup 等。这些选项和函数共同构成了 Vue 组件的核心开发模式。

### 通俗理解

可以把 Vue 组件想象成一个"智能家电"：

- data 是家电的内部状态
- props 是外部遥控器传来的参数
- methods 是家电的各种功能按钮
- computed 是自动调节的智能功能
- watch 是对状态变化的自动响应
- components 是家电的子模块
- emits 是家电对外发出的信号
- setup 是新一代智能中枢

## 核心特征/组成部分

- **声明式数据驱动**：data、props、computed 让视图与数据自动同步
- **响应式系统**：watch、computed 实现自动追踪和响应
- **模块化与复用**：components 支持组件嵌套与复用
- **灵活的事件机制**：methods、emits、watch 支持多样的交互
- **支持组合式 API**：setup 提供更灵活的逻辑组织方式

## 工作原理/实现方式

- **data**：定义组件的本地响应式状态，返回一个对象
- **props**：定义组件可接收的外部参数，支持类型校验和默认值
- **computed**：声明式计算属性，依赖变化时自动重新计算
- **methods**：定义组件的方法，供模板和事件调用
- **watch**：侦听数据变化，执行副作用逻辑
- **components**：注册和引用子组件，实现模块化开发
- **emits**：声明组件可触发的自定义事件
- **setup**：Vue 3 组合式 API 的入口，支持更灵活的逻辑复用

## 典型应用场景

- 构建复杂交互的单页应用（SPA）
- 组件化开发与复用
- 响应式数据驱动的动态界面
- 父子组件通信、事件分发
- 逻辑复用与组合

## 代码示例

### 1. 选项式 API 示例

```js
<template>
  <div>
    <h2>{{ title }}</h2>
    <p>计数：{{ count }}</p>
    <button @click="increment">加一</button>
    <child-component :msg="title" @custom-event="onChildEvent" />
  </div>
</template>
<script>
export default {
  name: "ParentComponent",
  components: {
    ChildComponent: () => import("./ChildComponent.vue"),
  },
  data() {
    return {
      title: "Hello Vue!",
      count: 0,
    };
  },
  props: {
    init: { type: Number, default: 0 },
  },
  computed: {
    double() {
      return this.count * 2;
    },
  },
  methods: {
    increment() {
      this.count++;
    },
    onChildEvent(payload) {
      console.log("收到子组件事件：", payload);
    },
  },
  watch: {
    count(newVal, oldVal) {
      console.log(`count 变化: ${oldVal} -> ${newVal}`);
    },
  },
};
</script>
```

### 2. 组合式 API（setup）示例

```js
<script setup>
import { ref, computed, watch } from "vue";
import ChildComponent from "./ChildComponent.vue";

const title = ref("Hello Vue!");
const count = ref(0);
const double = computed(() => count.value * 2);
function increment() {
  count.value++;
}
watch(count, (newVal, oldVal) => {
  console.log(`count 变化: ${oldVal} -> ${newVal}`);
});
function onChildEvent(payload) {
  console.log("收到子组件事件：", payload);
}
</script>
<template>
  <div>
    <h2>{{ title }}</h2>
    <p>计数：{{ count }}</p>
    <button @click="increment">加一</button>
    <ChildComponent :msg="title" @custom-event="onChildEvent" />
  </div>
</template>
```

### 3. emits 用法

```js
// 子组件 emits 声明
export default {
  emits: ["custom-event"],
  methods: {
    trigger() {
      this.$emit("custom-event", "hello from child");
    },
  },
};
```

## 优缺点分析

**优点：**

- 语法直观，易于上手
- 响应式强大，数据驱动视图
- 支持多种开发范式（选项式/组合式）
- 组件化、复用性高
- 生态丰富，文档完善

**缺点：**

- 过度嵌套时代码可读性下降
- 选项式与组合式混用需注意风格统一
- 某些高级用法有一定学习曲线

## 总结与扩展阅读

Vue 的常用 API 和选项为高效开发现代 Web 应用提供了强大支撑。建议根据项目复杂度和团队习惯选择合适的开发范式。

**扩展阅读：**

- [Vue 官方文档 - 选项式 API](https://cn.vuejs.org/guide/essentials/component-basics.html)
- [Vue 官方文档 - 组合式 API](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
- [Vue 组件通信](https://cn.vuejs.org/guide/components/events.html)

---

_本文档将持续更新，添加更多相关内容_
