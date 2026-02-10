# Vue 响应式 API：Computed、Watch、WatchEffect 详解

## 概述

Vue 3 提供了多种响应式 API 来处理数据变化和副作用。`computed`、`watch` 和 `watchEffect` 是三个核心的响应式 API，它们各有不同的用途和特点。理解它们的区别和使用场景对于编写高效的 Vue 应用至关重要。

## Computed（计算属性）

### 定义与作用

`computed` 用于声明响应式的计算值，它会根据其依赖的响应式数据进行缓存。只有当它的依赖发生改变时，计算属性才会重新计算。

### 语法

```javascript
import { computed } from 'vue'

// 基本语法
const computedValue = computed(() => {
  // 返回计算后的值
})

// 可读可写计算属性
const writableComputed = computed({
  get: () => {
    // 返回计算后的值
  },
  set: (value) => {
    // 设置逻辑
  }
})
```

### 使用示例

```javascript
import { ref, computed } from 'vue'

export default {
  setup() {
    const firstName = ref('John')
    const lastName = ref('Doe')

    // 计算属性 - 全名
    const fullName = computed(() => {
      return `${firstName.value} ${lastName.value}`
    })

    // 可读可写计算属性
    const fullNameWritable = computed({
      get: () => {
        return `${firstName.value} ${lastName.value}`
      },
      set: (value) => {
        const names = value.split(' ')
        firstName.value = names[0]
        lastName.value = names[1]
      }
    })

    return {
      firstName,
      lastName,
      fullName,
      fullNameWritable
    }
  }
}
```

### 特点

1. **缓存性**：计算属性会缓存结果，只有在依赖项发生变化时才重新计算
2. **延迟计算**：计算属性是懒执行的，只有在被访问时才会进行计算
3. **只读默认**：默认情况下计算属性是只读的，除非明确提供 getter 和 setter

### 使用场景

- 根据现有响应式数据派生新数据
- 对列表进行过滤或排序
- 需要缓存复杂计算结果的场景

## Watch（监听器）

### 定义与作用

`watch` 允许我们执行副作用，当被监听的数据源发生变化时执行回调函数。它提供了更精确的控制，可以指定具体的监听目标。

### 语法

```javascript
import { watch } from 'vue'

// 监听单个数据源
watch(source, callback, options?)

// 监听多个数据源
watch([source1, source2], callback, options?)
```

### 使用示例

```javascript
import { ref, watch } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const name = ref('')
    const age = ref(18)

    // 监听单个 ref
    watch(count, (newCount, oldCount) => {
      console.log(`Count changed from ${oldCount} to ${newCount}`)
    })

    // 监听多个数据源
    watch([name, age], ([newName, newAge], [oldName, oldAge]) => {
      console.log(`Name: ${oldName} -> ${newName}, Age: ${oldAge} -> ${newAge}`)
    })

    // 监听 getter 函数
    watch(
      () => name.value + age.value,
      (newVal, oldVal) => {
        console.log(`Combined value changed: ${oldVal} -> ${newVal}`)
      }
    )

    // 深度监听对象
    const user = ref({ name: 'John', profile: { age: 30 } })
    watch(
      user,
      (newUser, oldUser) => {
        console.log('User changed:', newUser, oldUser)
      },
      { deep: true }
    )

    return {
      count,
      name,
      age,
      user
    }
  }
}
```

### Options 参数

| 选项 | 描述 |
|------|------|
| `immediate: true` | 立即触发回调，在监听器创建时立即执行 |
| `deep: true` | 深度监听对象变化 |
| `flush: 'pre'\|'post'\|'sync'` | 控制回调执行时机 |
| `onTrack` | 调试：依赖收集时调用 |
| `onTrigger` | 调试：依赖更新时调用 |

### 特点

1. **精确监听**：可以精确指定监听的数据源
2. **异步执行**：默认在组件更新前执行
3. **可控性强**：提供更多配置选项，如 immediate、deep 等

### 使用场景

- 需要在数据变化时执行副作用操作
- 异步操作（如 API 调用）
- 数据持久化
- 通知或日志记录

## WatchEffect（副作用监听器）

### 定义与作用

`watchEffect` 会立即执行传入的函数，并响应式地追踪其依赖，并在依赖更新时重新执行该函数。它会自动追踪函数内部使用的响应式数据。

### 语法

```javascript
import { watchEffect } from 'vue'

watchEffect(effectFunction, options?)
```

### 使用示例

```javascript
import { ref, watchEffect } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const url = ref('/api/data')

    // 自动追踪依赖
    watchEffect(async () => {
      const response = await fetch(`${url.value}?count=${count.value}`)
      const data = await response.json()
      console.log(data)
    })

    // 手动停止监听
    let cancelWatch = null
    const startWatch = () => {
      cancelWatch = watchEffect(() => {
        console.log('Count is:', count.value)
      })
    }

    const stopWatch = () => {
      if (cancelWatch) {
        cancelWatch() // 停止监听
      }
    }

    return {
      count,
      url,
      startWatch,
      stopWatch
    }
  }
}
```

### Options 参数

| 选项 | 描述 |
|------|------|
| `flush: 'pre'\|'post'\|'sync'` | 控制回调执行时机 |
| `onTrack` | 调试：依赖收集时调用 |
| `onTrigger` | 调试：依赖更新时调用 |

### 特点

1. **自动依赖追踪**：自动追踪函数内部使用的响应式数据
2. **立即执行**：创建时立即执行一次
3. **简洁性**：代码更简洁，无需手动指定依赖

### 使用场景

- 执行有副作用的响应式计算
- API 调用
- DOM 操作
- 简单的状态同步

## Computed vs Watch vs WatchEffect 对比

| 特性 | Computed | Watch | WatchEffect |
|------|----------|-------|-------------|
| **缓存** | ✅ 有缓存 | ❌ 无缓存 | ❌ 无缓存 |
| **返回值** | 计算后的值 | 清理函数 | 清理函数 |
| **依赖指定** | 自动推导 | 手动指定 | 自动推导 |
| **执行时机** | 懒执行，按需计算 | 变化时执行 | 立即执行，变化时再次执行 |
| **副作用** | 不适合副作用 | 适合副作用 | 适合副作用 |
| **性能** | 高（有缓存） | 中 | 中 |
| **调试友好** | ✅ | ✅ | ✅ |

## 使用建议

### 何时使用 Computed？

- 当你需要根据其他响应式数据派生出新数据时
- 需要缓存复杂计算结果时
- 在模板中使用，且需要保持数据一致性时
- 输出是一个稳定的值，而不是副作用

### 何时使用 Watch？

- 当你需要在数据变化时执行副作用时
- 需要访问侦听状态变化前后的值时
- 需要精确控制监听哪些数据时
- 执行异步操作时

### 何时使用 WatchEffect？

- 当你的副作用函数中同时包含了同步和异步状态时
- 当你想要避免手动维护依赖列表时
- 代码逻辑较为简单直接时
- 执行一次性设置操作时

## 最佳实践

### 1. 合理选择 API

```javascript
// ❌ 错误：在 computed 中执行副作用
const badExample = computed(() => {
  apiCall() // 不应该在 computed 中有副作用
  return value
})

// ✅ 正确：在 watch 或 watchEffect 中执行副作用
watch(source, () => {
  apiCall() // 在 watch 中执行副作用
})
```

### 2. 避免过度监听

```javascript
// ❌ 错误：不必要的深度监听可能影响性能
watch(obj, callback, { deep: true })

// ✅ 正确：只监听需要的部分
watch(() => obj.property, callback)
```

### 3. 适当清理监听器

```javascript
import { watchEffect, onUnmounted } from 'vue'

export default {
  setup() {
    const stopWatch = watchEffect(() => {
      // 监听逻辑
    })

    // 组件卸载时清理
    onUnmounted(() => {
      stopWatch()
    })
  }
}
```

### 4. 利用 computed 缓存

```javascript
// ✅ 利用 computed 缓存复杂计算
const expensiveResult = computed(() => {
  return performExpensiveOperation(largeArray.value)
})
```

## 常见陷阱与注意事项

### 1. WatchEffect 的无限循环

```javascript
// ❌ 可能导致无限循环
const count = ref(0)
watchEffect(() => {
  count.value++ // 修改了正在监听的值
})
```

### 2. 深度监听的性能影响

```javascript
// 大型嵌套对象的深度监听可能影响性能
const bigObject = ref({})
watch(bigObject, callback, { deep: true }) // 考虑是否真的需要深度监听
```

### 3. 异步操作中的竞态条件

```javascript
// 需要注意处理异步请求的竞态条件
watch(query, async (newQuery) => {
  const id = ++requestId
  const result = await fetchData(newQuery)
  if (id === requestId) { // 检查是否是最新的请求
    data.value = result
  }
})
```

## 总结

`computed`、`watch` 和 `watchEffect` 是 Vue 3 响应式系统的核心 API，每种都有其特定的用途：

- **computed**：用于派生数据，具有缓存特性
- **watch**：用于监听特定数据源的变化并执行副作用
- **watchEffect**：用于自动追踪依赖并执行副作用

正确选择和使用这些 API 能够让你的应用更加高效、可维护。