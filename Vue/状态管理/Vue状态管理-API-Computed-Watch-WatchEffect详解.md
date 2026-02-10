# Vue状态管理-API-Computed-Watch-WatchEffect详解

## 1. computed - 计算属性

### 1.1 基本概念
`computed` 是 Vue 中用于声明计算属性的 API。计算属性会基于它们的依赖进行缓存，只有在它的相关依赖发生改变时才会重新求值。

### 1.2 基本用法
```javascript
import { computed } from 'vue'

const fullName = computed(() => {
  return firstName.value + ' ' + lastName.value
})
```

### 1.3 带有 getter 和 setter 的计算属性
```javascript
const fullName = computed({
  get() {
    return firstName.value + ' ' + lastName.value
  },
  set(newValue) {
    const names = newValue.split(' ')
    firstName.value = names[0]
    lastName.value = names[1]
  }
})
```

### 1.4 主要特点
- **缓存性**: 只有当依赖变化时才重新计算
- **响应式**: 当依赖变化时，计算属性会自动更新
- **高效性**: 避免不必要的重复计算

## 2. watch - 侦听器

### 2.1 基本概念
`watch` 是 Vue 中用于观察和响应数据变化的 API。它允许我们执行副作用函数，当被观察的数据发生变化时触发。

### 2.2 基本用法
```javascript
import { watch } from 'vue'

// 侦听单个源
watch(source, (newValue, oldValue) => {
  console.log(`旧值: ${oldValue}, 新值: ${newValue}`)
})

// 侦听多个源
watch([source1, source2], ([newVal1, newVal2], [oldVal1, oldVal2]) => {
  console.log(`第一个值从 ${oldVal1} 变为 ${newVal1}`)
  console.log(`第二个值从 ${oldVal2} 变为 ${newVal2}`)
})
```

### 2.3 选项参数
```javascript
watch(
  source,
  callback,
  {
    immediate: true,  // 立即执行
    deep: true,       // 深度监听
    flush: 'post'     // 调度方式
  }
)
```

### 2.4 主要特点
- **立即执行**: 可通过 `immediate: true` 设置立即执行
- **深度监听**: 可通过 `deep: true` 监听对象深层变化
- **灵活调度**: 可控制执行时机（pre、post、sync）

## 3. watchEffect - 副作用侦听器

### 3.1 基本概念
`watchEffect` 会立即执行传入的函数，并响应式地追踪其依赖，并在依赖更改时重新运行该函数。

### 3.2 基本用法
```javascript
import { watchEffect } from 'vue'

watchEffect(() => {
  console.log(counter.value)
})
```

### 3.3 停止侦听
```javascript
const stop = watchEffect(() => {
  console.log(counter.value)
})

// 在需要时停止侦听
stop()
```

### 3.4 主要特点
- **自动追踪**: 自动追踪函数内部使用的响应式数据
- **立即执行**: 创建时立即执行一次
- **无需明确指定依赖**: 依赖关系由函数执行时确定

## 4. 三者对比与应用场景

| 特性 | computed | watch | watchEffect |
|------|----------|-------|-------------|
| 缓存 | ✅ | ❌ | ❌ |
| 立即执行 | ✅ | 可选 | ✅ |
| 返回值 | 有返回值 | 无返回值 | 返回停止函数 |
| 手动指定依赖 | ✅ | ✅ | ❌ |

### 4.1 使用场景
- **computed**: 用于需要根据其他响应式数据计算得出新值的情况
- **watch**: 用于需要在数据变化时执行异步操作或开销较大的操作
- **watchEffect**: 用于更简洁的副作用处理，特别是依赖关系不明确时

## 5. 相关API
`computed`、`watch`、`watchEffect`配合使用