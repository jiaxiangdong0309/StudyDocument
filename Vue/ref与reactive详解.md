# ref() 与 reactive() 详解（Vue Composition API）

## 什么是 ref() 和 reactive()？

### 定义

- **ref()**：Vue 3 组合式 API 提供的响应式引用类型，用于创建包含基本类型或对象的响应式数据。返回一个带有 .value 属性的响应式对象。
- **reactive()**：Vue 3 组合式 API 提供的响应式对象转换器，用于将一个普通对象转换为深层响应式对象。

英文原文：ref, reactive

### 通俗理解

- ref() 就像一个"响应式盒子"，无论放进去的是数字、字符串还是对象，都需要通过 .value 取出和赋值。
- reactive() 就像给一个普通对象加上"自动侦测器"，对象的每个属性变化都能被 Vue 追踪并驱动视图更新。

## 核心特征/组成部分

- **响应式**：两者都能让数据变化自动驱动视图更新
- **ref()**：适合基本类型、单值、DOM 引用，也可包裹对象
- **reactive()**：适合复杂对象、数组、嵌套结构
- **深层追踪**：reactive() 会递归处理所有嵌套属性
- **解包机制**：模板中自动解包 ref，无需 .value
- **与 watch、computed 等 API 深度集成**

## 工作原理/实现方式

- **ref()**：内部通过 Object.defineProperty 或 Proxy 实现，.value 属性的 get/set 会触发依赖收集和更新。
- **reactive()**：基于 Proxy 深度递归代理对象的所有属性，任何属性的读写都能被 Vue 追踪。
- **响应式依赖收集**：依赖于 Vue 的响应式系统，自动追踪依赖并在数据变化时通知视图或副作用函数。
- **ref 对象包裹**：基本类型必须用 ref，reactive 只能用于对象。

## 典型应用场景

- 组件内部状态管理（如计数器、表单数据、复杂对象）
- 组合式 API 下的响应式数据声明
- 需要响应式引用 DOM 元素（如 input、canvas 等）
- 复杂嵌套数据结构的响应式处理
- 与 watch、computed、provide/inject 等 API 配合

## 进阶用法

### 1. ref() 包裹对象与 reactive 的区别

```js
const obj1 = ref({ a: 1 });
const obj2 = reactive({ a: 1 });
obj1.value.a = 2; // 需要 .value
obj2.a = 2; // 直接赋值
```

- ref 包裹对象时，只有 .value 的引用是响应式，属性本身不是深层代理。
- reactive 返回的对象是深层响应式，所有属性都可直接响应。

### 2. toRefs() 与 toRef()

- **toRefs()**：将 reactive 对象的每个属性转为 ref，便于解构和传递。
- **toRef()**：将 reactive 对象的某个属性转为 ref。

```js
import { reactive, toRefs, toRef } from "vue";
const state = reactive({ a: 1, b: 2 });
const { a, b } = toRefs(state);
const aRef = toRef(state, "a");
```

### 3. shallowRef、shallowReactive

- **shallowRef()**：只对 .value 本身做响应式，内部对象不递归
- **shallowReactive()**：只对对象的第一层做响应式

### 4. ref 绑定 DOM 元素

```vue
<template>
  <input ref="inputEl" />
</template>
<script setup>
import { ref, onMounted } from "vue";
const inputEl = ref(null);
onMounted(() => {
  inputEl.value.focus();
});
</script>
```

### 5. reactive 与数组

```js
const arr = reactive([1, 2, 3]);
arr.push(4); // 视图自动更新
```

### 6. reactive 与 Map/Set

- reactive 也可用于 Map、Set，但有部分限制，详见官方文档。

## 常见陷阱与注意事项

- ref() 包裹对象时，属性不是深层响应式，推荐用 reactive
- reactive 不能直接包裹 ref 对象，否则 ref 会被"解包"丢失响应性
- reactive 只能用于对象，不能用于基本类型
- 解构 reactive 对象属性会失去响应性，需配合 toRefs
- ref 在模板中可直接用，无需 .value，但在 JS 代码中必须 .value
- 不要在 reactive 对象中嵌套 reactive 或 ref，避免响应性丢失或混乱

## 代码示例

### 1. ref 基本用法

```js
import { ref } from "vue";
const count = ref(0);
count.value++;
```

### 2. reactive 基本用法

```js
import { reactive } from "vue";
const state = reactive({ name: "张三", age: 18 });
state.age++;
```

### 3. ref 与 reactive 配合

```js
import { ref, reactive } from "vue";
const user = reactive({ name: "张三", age: 18 });
const inputRef = ref(null);
```

### 4. toRefs 解构 reactive

```js
import { reactive, toRefs } from "vue";
const state = reactive({ a: 1, b: 2 });
const { a, b } = toRefs(state);
```

## 优缺点分析

**优点：**

- 响应式系统强大，自动追踪依赖
- 语法灵活，适合多种场景
- 支持深层对象、数组、Map/Set 等
- 与 Vue 生态 API 深度集成

**缺点：**

- ref/ reactive 混用需理解响应性细节
- reactive 不能用于基本类型
- ref 包裹对象不是深层响应式，易混淆
- 解构 reactive 属性需配合 toRefs，否则丢失响应性

## 总结与扩展阅读

ref() 和 reactive() 是 Vue 3 组合式 API 响应式系统的核心。理解两者的区别和适用场景，有助于编写高效、健壮的响应式代码。

**扩展阅读：**

- [Vue 官方文档 - 响应式基础](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [ref vs reactive 深度解析](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#ref-vs-reactive)
- [Vue 3 响应式原理揭秘](https://vuejs.org/guide/extras/reactivity-in-depth.html)

---

_本文档将持续更新，添加更多相关内容_
