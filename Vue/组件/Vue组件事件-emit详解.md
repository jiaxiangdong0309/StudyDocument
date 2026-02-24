# Vue 组件事件 (Component Events / Emit)

## 1. 解决什么问题？
> 让子组件能"通知"父组件发生了什么事，实现子传父的通信。

* **痛点**：子组件里用户点了按钮、提交了表单，父组件怎么知道？子组件不能直接修改父组件的数据
* **作用**：通过 `emit` 机制，子组件发出自定义事件，父组件监听并响应，完成"子 → 父"通信

## 2. 通俗理解
### 核心定义
子组件通过 `emit('事件名', 数据)` 向父组件发射事件，父组件用 `@事件名="处理函数"` 监听并处理。

### 生活化比喻
就像餐厅的**呼叫铃**：
- 顾客（子组件）按下铃（emit），可以附带信息："加一份米饭"（传参）
- 服务员（父组件）听到铃声（@事件），来到桌前处理请求
- 顾客不需要知道服务员怎么处理，只管按铃就行

## 3. 工作原理

```mermaid
flowchart LR
    A[子组件] -->|"emit('update', newData)"| B[Vue 事件系统]
    B -->|触发| C["父组件 @update='handler'"]
    C --> D[执行 handler(newData)]
```

## 4. 核心代码实战

### 业务场景：搜索框组件，输入后通知父组件执行搜索

### Vue 3 写法

```vue
<!-- SearchBox.vue 子组件 -->
<script setup>
import { ref } from 'vue'

// 声明组件会发出哪些事件
const emit = defineEmits(['search', 'clear'])

const keyword = ref('')

const handleSearch = () => {
  if (!keyword.value.trim()) return
  emit('search', keyword.value)  // 发射事件 + 携带数据
}

const handleClear = () => {
  keyword.value = ''
  emit('clear')  // 发射无参数事件
}
</script>

<template>
  <div class="search-box">
    <input v-model="keyword" placeholder="搜索商品..." />
    <button @click="handleSearch">搜索</button>
    <button @click="handleClear">清空</button>
  </div>
</template>
```

```vue
<!-- 父组件使用 -->
<script setup>
import SearchBox from './SearchBox.vue'

const onSearch = (keyword) => {
  console.log('搜索关键词：', keyword)
  // 调用 API 搜索...
}

const onClear = () => {
  console.log('搜索已清空')
}
</script>

<template>
  <SearchBox @search="onSearch" @clear="onClear" />
</template>
```

### Vue 3 写法 — TypeScript 事件校验

```vue
<script setup lang="ts">
// 带类型校验的事件声明
const emit = defineEmits<{
  search: [keyword: string]        // 声明参数类型
  clear: []                         // 无参数
  update: [id: number, value: string]  // 多参数
}>()
</script>
```

### Vue 2 对比

```javascript
export default {
  methods: {
    handleSearch() {
      this.$emit('search', this.keyword)  // Vue 2 用 this.$emit
    }
  }
}
// 父组件同样用 @search="onSearch" 监听
```

## 5. 最佳实践

* **性能考虑**：emit 本身很轻量，无性能顾虑。但避免在高频事件（如 scroll）中无节制 emit，建议加防抖
* **注意事项**：
  - 事件名推荐 `camelCase` 声明，模板中用 `kebab-case` 监听（`@my-event`）
  - 一定要用 `defineEmits` 显式声明，方便代码可读和 IDE 提示
  - emit 的数据建议是简单值或普通对象，不要传整个组件实例
* **边界情况**：如果父组件没有监听某个事件，emit 调用不会报错，只是静默无响应

## 6. 常见错误与解决方案

| 错误现象 | 原因 | 解决方案 |
|---------|------|---------|
| 父组件监听不到事件 | 事件名拼写不一致 | 检查 emit 和 @监听的名称是否匹配 |
| 收不到参数 | `emit('search')` 忘记传第二个参数 | `emit('search', keyword)` |
| 想直接修改父组件数据 | 违反单向数据流 | 用 emit 通知父组件，由父组件自己改 |
| 控制台警告 emitted but not declared | 没有 `defineEmits` 声明 | 添加 `defineEmits(['事件名'])` |

## 7. 扩展思考

* **v-model 语法糖**：`v-model` 本质上就是 props + emit 的组合，详见 v-model 文档
* **事件校验**：`defineEmits` 可以传入校验函数，在 emit 前验证参数合法性
* **多层级通信**：如果需要跨越多层组件传递事件，考虑用 `provide/inject` 或状态管理，避免逐层 emit

---
_本文档将持续更新，添加更多相关内容_
