# Flow 学习指南

## 概述

Flow 是 Kotlin 协程库中的**响应式流**实现，用于处理异步数据流。它是 Google 官方推荐的 LiveData 替代方案，也是 RxJava 在 Kotlin 世界的最佳替代品。

## 为什么要学 Flow？

| 痛点 | Flow 的解决方案 |
|-----|----------------|
| LiveData 操作符太少 | Flow 提供丰富的操作符（map、filter、flatMap...） |
| RxJava 学习曲线陡峭 | Flow 语法简洁，像写同步代码 |
| 回调地狱难维护 | Flow 链式调用，代码清晰 |
| 数据库变化难监听 | Room 原生支持 Flow |
| 状态管理混乱 | StateFlow/SharedFlow 完美适配 MVVM |

## 学习路线

```
┌─────────────────────────────────────────────────────────────────┐
│                        Flow 学习路线                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  基础篇（1-2天）                                                 │
│  ├── Flow 是什么？冷流 vs 热流                                   │
│  ├── 创建 Flow：flow{}、flowOf、asFlow                          │
│  ├── 收集 Flow：collect、collectLatest                          │
│  └── 基础操作符：map、filter、take                               │
│                                                                 │
│  进阶篇（2-3天）                                                 │
│  ├── StateFlow：UI 状态管理利器                                  │
│  ├── SharedFlow：事件分发神器                                    │
│  ├── 高级操作符：flatMapLatest、combine、zip                     │
│  ├── 背压与缓冲：buffer、conflate                               │
│  ├── 异常处理：catch、retry                                     │
│  └── 生命周期安全收集：repeatOnLifecycle                         │
│                                                                 │
│  源码篇（1-2天）                                                 │
│  ├── Flow 的本质：挂起函数 + 状态机                              │
│  ├── 操作符链实现原理                                           │
│  ├── StateFlow/SharedFlow 源码设计                              │
│  └── 与协程的协作机制                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 重要程度

| 知识点 | 重要度 | 说明 |
|-------|-------|------|
| 冷流 vs 热流 | ⭐⭐⭐⭐⭐ | 理解 Flow 的核心前提 |
| StateFlow | ⭐⭐⭐⭐⭐ | 现代 Android 状态管理标配 |
| SharedFlow | ⭐⭐⭐⭐⭐ | 事件处理的最佳实践 |
| 基础操作符 | ⭐⭐⭐⭐⭐ | 日常开发必用 |
| collect 与生命周期 | ⭐⭐⭐⭐⭐ | 避免内存泄漏的关键 |
| flatMapLatest | ⭐⭐⭐⭐ | 搜索防抖等场景必用 |
| combine/zip | ⭐⭐⭐⭐ | 多数据源合并 |
| 背压处理 | ⭐⭐⭐ | 高频数据场景需要 |
| callbackFlow | ⭐⭐⭐ | 回调转 Flow |
| Flow 源码原理 | ⭐⭐⭐ | 深入理解，面试加分 |

## 核心问题预览

### 基础篇

1. Flow 和 LiveData 有什么区别？什么场景用哪个？
2. 什么是冷流？什么是热流？Flow 是哪种？
3. collect 和 collectLatest 有什么区别？
4. flowOn 和 withContext 有什么区别？

### 进阶篇

1. StateFlow 和 SharedFlow 有什么区别？分别适合什么场景？
2. 如何在 Activity/Fragment 中安全地收集 Flow？
3. flatMapLatest、flatMapConcat、flatMapMerge 有什么区别？
4. Flow 的背压是如何处理的？buffer 和 conflate 有什么区别？

### 源码篇

1. Flow 的 collect 是如何实现的？
2. 操作符链是如何工作的？
3. StateFlow 为什么能防止重复发射相同值？
4. SharedFlow 的 replay 和 extraBufferCapacity 是如何实现的？

## 文档目录

| 文档 | 内容 | 适合人群 |
|-----|------|---------|
| [1-基础篇](./1-基础篇.md) | Flow 概念、创建、收集、基础操作符 | 入门者 |
| [2-进阶篇](./2-进阶篇.md) | StateFlow、SharedFlow、高级操作符、最佳实践 | 有一定基础 |
| [3-源码篇](./3-源码篇.md) | Flow 原理、操作符实现、设计哲学 | 想深入理解 |

## 依赖配置

```kotlin
// build.gradle.kts (Module)
dependencies {
    // 协程核心库（包含 Flow）
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    // Android 协程支持
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // Lifecycle 扩展（提供 repeatOnLifecycle）
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
}
```

## 快速上手

```kotlin
// 1. 创建 Flow
fun countDown(): Flow<Int> = flow {
    for (i in 5 downTo 1) {
        emit(i)        // 发射数据
        delay(1000)    // 每秒发射一次
    }
}

// 2. 收集 Flow
lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        countDown().collect { value ->
            textView.text = "倒计时: $value"
        }
    }
}

// 3. 使用操作符
countDown()
    .map { "倒计时: $it 秒" }     // 转换
    .filter { it > 0 }            // 过滤
    .onEach { Log.d("Flow", it) } // 副作用
    .collect { updateUI(it) }     // 收集
```

---

_开始学习：[1-基础篇](./1-基础篇.md)_
