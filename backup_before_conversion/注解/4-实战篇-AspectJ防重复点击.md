# 注解实战篇：AspectJ 实现防重复点击

> 这篇文档的目标不是让你"会用"，而是让你"理解它是怎么运行的"。

## 一、为什么需要防重复点击？

### 1.1 痛点场景

用户快速连续点击"提交订单"按钮：

```
点击1 → 发起请求1 → 服务器处理中...
点击2 → 发起请求2 → 服务器处理中...  ← 重复请求！
点击3 → 发起请求3 → 服务器处理中...  ← 又重复了！

结果：同一个订单被提交了3次 💀
```

### 1.2 传统解决方案的问题

```kotlin
// 方案1：每个方法都写判断
private var lastClickTime = 0L

fun onSubmitClick() {
    val now = System.currentTimeMillis()
    if (now - lastClickTime < 1000) return  // 每个方法都要写！
    lastClickTime = now
    
    submitOrder()
}

fun onPayClick() {
    val now = System.currentTimeMillis()
    if (now - lastClickTime < 1000) return  // 又是一遍！
    lastClickTime = now
    
    pay()
}

// 问题：50个按钮 = 50份重复代码
```

### 1.3 理想的解决方案

```kotlin
// 加个注解就完事
@SingleClick
fun onSubmitClick() {
    submitOrder()
}

@SingleClick(interval = 2000L)
fun onPayClick() {
    pay()
}

// 业务代码完全干净，防重复点击逻辑"不见了"
```

**问题是：这个"魔法"是怎么实现的？**

---

## 二、理解 AspectJ 的核心思想

### 2.1 一个比喻

想象你开了一家公司，有 50 个员工：

```
┌─────────────────────────────────────────────────────────────┐
│                    没有 AspectJ                              │
│                                                             │
│   员工A：工作 + 打卡 + 写日报                                │
│   员工B：工作 + 打卡 + 写日报                                │
│   员工C：工作 + 打卡 + 写日报                                │
│   ...                                                       │
│   每个人都要自己处理"非核心工作"                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    有了 AspectJ（前台 + 行政）               │
│                                                             │
│   前台：统一负责打卡                                         │
│   行政：统一负责日报提醒                                     │
│                                                             │
│   员工A：只管工作                                            │
│   员工B：只管工作                                            │
│   员工C：只管工作                                            │
│                                                             │
│   "横切关注点"被统一处理了                                   │
└─────────────────────────────────────────────────────────────┘
```

**AspectJ 就是那个"前台"和"行政"**——它把分散在各处的公共逻辑，集中到一个地方处理。

### 2.2 核心术语（只需理解这4个）

| 术语 | 大白话 | 对应我们的例子 |
|-----|--------|---------------|
| **Aspect（切面）** | 负责处理某类公共事务的"部门" | 负责防重复点击的逻辑模块 |
| **Pointcut（切入点）** | 在哪里拦截 | "所有标记了 @SingleClick 的方法" |
| **Advice（通知）** | 拦截后做什么 | "检查时间间隔，决定是否执行" |
| **Weaving（织入）** | 把切面代码插入目标代码 | 编译时自动改写字节码 |

### 2.3 AspectJ 的工作时机

```
┌─────────────────────────────────────────────────────────────────┐
│                    AspectJ 工作流程                              │
│                                                                 │
│   【你写的代码】              【AspectJ 切面】                    │
│                                                                 │
│   @SingleClick                @Aspect                           │
│   fun onClick() {             class SingleClickAspect {         │
│       doSomething()               @Around(...)                  │
│   }                               fun check() { ... }           │
│                               }                                 │
│         │                              │                        │
│         └──────────┬───────────────────┘                        │
│                    ↓                                            │
│            ┌──────────────┐                                     │
│            │ 编译时织入    │  ← AspectJ 编译器在这里"动手脚"     │
│            └──────────────┘                                     │
│                    ↓                                            │
│            ┌──────────────────────────────────┐                 │
│            │ 最终字节码（已经被改过了）         │                 │
│            │                                  │                 │
│            │ fun onClick() {                  │                 │
│            │     if (检查通过) {              │  ← 自动插入的！  │
│            │         doSomething()            │                 │
│            │     }                            │                 │
│            │ }                                │                 │
│            └──────────────────────────────────┘                 │
│                    ↓                                            │
│            【运行时】                                            │
│            调用 onClick() 时，自动执行检查逻辑                   │
└─────────────────────────────────────────────────────────────────┘
```

**关键理解**：
- AspectJ 在**编译时**就把检查代码"织入"到你的方法里了
- 运行时你调用的已经是**被修改过的代码**
- 你不需要手动调用任何东西，一切都是自动的

---

## 三、完整实战：从 0 到 1

### 3.1 项目结构

```
app/
├── build.gradle
└── src/main/java/com/example/demo/
    ├── annotation/
    │   └── SingleClick.kt          # 1. 定义注解
    ├── aspect/
    │   └── SingleClickAspect.kt    # 2. 定义切面
    └── ui/
        └── MainActivity.kt          # 3. 使用注解
```

### 3.2 Step 1：配置 AspectJ 环境

**项目根目录 build.gradle**：

```groovy
buildscript {
    repositories {
        mavenCentral()
    }
    dependencies {
        // AspectJ 插件（Android 专用）
        classpath 'io.github.aspect-plugin:aspectjx-plugin:1.0.6'
    }
}
```

**app/build.gradle**：

```groovy
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
    id 'io.github.aspect-plugin'  // 应用 AspectJ 插件
}

dependencies {
    // AspectJ 运行时库
    implementation 'org.aspectj:aspectjrt:1.9.19'
}
```

> 💡 **为什么需要插件？** 因为 AspectJ 需要在编译时修改字节码，普通的 Kotlin/Java 编译器做不到，需要 AspectJ 编译器介入。

### 3.3 Step 2：定义注解

```kotlin
package com.example.demo.annotation

/**
 * 防重复点击注解
 * 
 * 为什么用 RUNTIME？
 * 因为 AspectJ 的 @Around 需要在运行时读取注解的属性值（interval）
 */
@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
annotation class SingleClick(
    /**
     * 点击间隔时间（毫秒）
     * 在此时间内的重复点击会被拦截
     */
    val interval: Long = 1000L
)
```

**此时注解只是一个"标记"，还没有任何功能。**

### 3.4 Step 3：定义切面（核心！）

```kotlin
package com.example.demo.aspect

import android.util.Log
import com.example.demo.annotation.SingleClick
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.annotation.Pointcut

/**
 * 防重复点击切面
 * 
 * @Aspect 告诉 AspectJ：这个类是一个切面，里面定义了拦截规则和处理逻辑
 */
@Aspect
class SingleClickAspect {
    
    companion object {
        private const val TAG = "SingleClick"
    }
    
    /**
     * 记录每个方法的上次点击时间
     * Key: 方法的唯一标识（类名+方法名+参数）
     * Value: 上次点击的时间戳
     */
    private val lastClickTimeMap = mutableMapOf<String, Long>()
    
    /**
     * 定义切入点：在哪里拦截？
     * 
     * execution(@com.example.demo.annotation.SingleClick * *(..))
     * 翻译成人话：
     * - execution(...) : 在方法执行时
     * - @com.example.demo.annotation.SingleClick : 方法上有这个注解
     * - * : 任意返回值
     * - *(..) : 任意方法名，任意参数
     * 
     * 合起来：拦截所有标记了 @SingleClick 注解的方法
     */
    @Pointcut("execution(@com.example.demo.annotation.SingleClick * *(..))")
    fun singleClickPointcut() {
        // 这个方法体是空的，它只是用来定义切入点的"名字"
        // 后面的 @Around 会引用这个名字
    }
    
    /**
     * 环绕通知：拦截后做什么？
     * 
     * @Around 是最强大的通知类型，它可以：
     * 1. 在方法执行前做事（检查时间间隔）
     * 2. 决定是否执行原方法（放行 or 拦截）
     * 3. 在方法执行后做事（如果需要）
     * 
     * @param joinPoint 连接点，代表被拦截的那个方法
     * @param singleClick 注解实例，可以读取 interval 等属性
     */
    @Around("singleClickPointcut() && @annotation(singleClick)")
    fun aroundSingleClick(
        joinPoint: ProceedingJoinPoint,
        singleClick: SingleClick
    ): Any? {
        // 1. 获取方法的唯一标识
        val methodKey = joinPoint.signature.toLongString()
        
        // 2. 获取当前时间和上次点击时间
        val currentTime = System.currentTimeMillis()
        val lastClickTime = lastClickTimeMap[methodKey] ?: 0L
        
        // 3. 获取注解中配置的间隔时间
        val interval = singleClick.interval
        
        // 4. 判断是否在冷却期内
        val timeSinceLastClick = currentTime - lastClickTime
        
        return if (timeSinceLastClick > interval) {
            // 不在冷却期，允许执行
            Log.d(TAG, "✅ 允许点击: $methodKey")
            
            // 更新点击时间
            lastClickTimeMap[methodKey] = currentTime
            
            // 执行原方法！这一行是关键
            // proceed() 会调用被拦截的那个方法
            joinPoint.proceed()
        } else {
            // 在冷却期内，拦截
            val remainingTime = interval - timeSinceLastClick
            Log.d(TAG, "🚫 拦截重复点击: $methodKey, 还需等待 ${remainingTime}ms")
            
            // 返回 null，不执行原方法
            null
        }
    }
}
```

### 3.5 Step 4：使用注解

```kotlin
package com.example.demo.ui

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.demo.annotation.SingleClick
import com.example.demo.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityMainBinding
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // 正常绑定点击事件，没有任何防重复点击的代码！
        binding.btnSubmit.setOnClickListener { onSubmitClick() }
        binding.btnPay.setOnClickListener { onPayClick() }
        binding.btnNormal.setOnClickListener { onNormalClick() }
    }
    
    /**
     * 提交按钮：使用默认 1 秒间隔
     */
    @SingleClick
    fun onSubmitClick() {
        Toast.makeText(this, "提交订单", Toast.LENGTH_SHORT).show()
        // 实际业务逻辑...
    }
    
    /**
     * 支付按钮：使用 2 秒间隔（支付操作更敏感）
     */
    @SingleClick(interval = 2000L)
    fun onPayClick() {
        Toast.makeText(this, "发起支付", Toast.LENGTH_SHORT).show()
        // 实际业务逻辑...
    }
    
    /**
     * 普通按钮：没有注解，不受限制
     */
    fun onNormalClick() {
        Toast.makeText(this, "普通点击", Toast.LENGTH_SHORT).show()
    }
}
```

---

## 四、运行原理详解（重点！）

### 4.1 编译前 vs 编译后

让我们看看 AspectJ 在编译时做了什么：

**你写的代码（编译前）**：

```kotlin
@SingleClick
fun onSubmitClick() {
    Toast.makeText(this, "提交订单", Toast.LENGTH_SHORT).show()
}
```

**AspectJ 织入后（编译后的等效代码）**：

```kotlin
fun onSubmitClick() {
    // ↓↓↓ AspectJ 自动插入的代码 ↓↓↓
    val aspect = SingleClickAspect.aspectOf()
    val joinPoint = 创建JoinPoint对象(this, "onSubmitClick", 参数)
    val annotation = 获取SingleClick注解()
    
    val result = aspect.aroundSingleClick(joinPoint, annotation)
    // ↑↑↑ 如果检查不通过，这里就返回了，不会执行下面的代码 ↑↑↑
    
    // 只有 joinPoint.proceed() 被调用时，才会执行原来的代码
    if (result != null) {
        Toast.makeText(this, "提交订单", Toast.LENGTH_SHORT).show()
    }
}
```

### 4.2 运行时调用流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    运行时调用流程                                │
│                                                                 │
│   用户点击按钮                                                   │
│        ↓                                                        │
│   调用 onSubmitClick()                                          │
│        ↓                                                        │
│   ┌─────────────────────────────────────────┐                  │
│   │ AspectJ 织入的代码开始执行               │                  │
│   │                                         │                  │
│   │   1. 创建 JoinPoint 对象                │                  │
│   │   2. 获取 @SingleClick 注解             │                  │
│   │   3. 调用 aroundSingleClick()          │                  │
│   └─────────────────────────────────────────┘                  │
│        ↓                                                        │
│   ┌─────────────────────────────────────────┐                  │
│   │ aroundSingleClick() 内部逻辑            │                  │
│   │                                         │                  │
│   │   检查时间间隔                           │                  │
│   │        ↓                                │                  │
│   │   ┌─────────┐     ┌─────────┐          │                  │
│   │   │ 超过间隔 │     │ 未超过  │          │                  │
│   │   └────┬────┘     └────┬────┘          │                  │
│   │        ↓               ↓               │                  │
│   │   proceed()       return null          │                  │
│   │   执行原方法       不执行原方法          │                  │
│   └─────────────────────────────────────────┘                  │
│        ↓                                                        │
│   Toast 显示（或不显示）                                         │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 关键理解：joinPoint.proceed()

```kotlin
@Around("singleClickPointcut() && @annotation(singleClick)")
fun aroundSingleClick(joinPoint: ProceedingJoinPoint, ...): Any? {
    
    // 在这里，原方法还没有执行
    
    if (检查通过) {
        return joinPoint.proceed()  // ← 这一行才会执行原方法！
    } else {
        return null  // ← 不调用 proceed()，原方法就不会执行
    }
}
```

**`joinPoint.proceed()` 就是"遥控器"**：
- 调用它 → 原方法执行
- 不调用它 → 原方法被跳过

这就是 AspectJ 能"拦截"方法的原理。

---

## 五、运行效果验证

### 5.1 日志输出

快速点击"提交订单"按钮 5 次：

```
D/SingleClick: ✅ 允许点击: void MainActivity.onSubmitClick()
D/SingleClick: 🚫 拦截重复点击: void MainActivity.onSubmitClick(), 还需等待 856ms
D/SingleClick: 🚫 拦截重复点击: void MainActivity.onSubmitClick(), 还需等待 712ms
D/SingleClick: 🚫 拦截重复点击: void MainActivity.onSubmitClick(), 还需等待 589ms
D/SingleClick: 🚫 拦截重复点击: void MainActivity.onSubmitClick(), 还需等待 445ms
```

只有第一次点击有效，后续的被拦截了！

### 5.2 验证织入效果

你可以用 jadx 反编译 APK，查看生成的字节码：

```java
// 反编译后的 onSubmitClick 方法（简化）
public void onSubmitClick() {
    JoinPoint joinPoint = Factory.makeJP(...);
    SingleClickAspect.aspectOf().aroundSingleClick(joinPoint, ...);
}
```

可以看到，AspectJ 确实在编译时修改了你的代码。

---

## 六、进阶：理解 Pointcut 表达式

### 6.1 表达式语法

```
execution(@注解全路径 返回值 方法路径(参数))
```

### 6.2 常用示例

| 表达式 | 含义 |
|-------|------|
| `execution(* *(..))` | 所有方法 |
| `execution(* com.example..*(..))` | com.example 包下的所有方法 |
| `execution(* *..Activity.*(..))` | 所有 Activity 的方法 |
| `execution(@SingleClick * *(..))` | 标记了 @SingleClick 的方法 |
| `execution(* *.on*Click(..))` | 方法名匹配 on*Click 的方法 |

### 6.3 组合表达式

```kotlin
// 拦截 Activity 中所有标记了 @SingleClick 的 public 方法
@Pointcut("execution(@SingleClick public * *..Activity.*(..))")
fun activitySingleClick() {}
```

---

## 七、常见问题

### Q1：为什么我的切面没有生效？

**检查清单**：
1. ✅ AspectJ 插件是否正确配置？
2. ✅ 切面类是否有 `@Aspect` 注解？
3. ✅ Pointcut 表达式中的包路径是否正确？
4. ✅ 注解的 `@Retention` 是否是 `RUNTIME`？
5. ✅ Clean 后重新 Build？

### Q2：AspectJ 会影响性能吗？

- **编译时**：会增加编译时间（织入需要时间）
- **运行时**：几乎无影响（代码已经织入，和你手写的效果一样）

### Q3：能拦截第三方库的方法吗？

可以，只要 Pointcut 表达式能匹配到。但不建议这么做，可能导致意外问题。

### Q4：和 Kotlin 协程兼容吗？

兼容，但 suspend 函数的处理稍有不同，返回值可能是 `Object`（包含 continuation）。

---

## 八、总结

### 8.1 核心流程回顾

```
1. 定义注解 @SingleClick          → 只是标记，没有逻辑
2. 定义切面 @Aspect               → 写拦截规则和处理逻辑
3. 编译时 AspectJ 织入            → 自动修改字节码
4. 运行时自动拦截                 → 无需手动调用
```

### 8.2 为什么这么设计？

| 设计决策 | 原因 |
|---------|------|
| 编译时织入 | 运行时零开销，性能最优 |
| 注解标记 | 显式声明，一目了然 |
| 切面集中处理 | 逻辑不分散，易于维护 |
| Around 通知 | 最灵活，可以完全控制方法执行 |

### 8.3 适用场景

AspectJ 不仅能做防重复点击，还能做：

| 场景 | 注解名（建议） |
|-----|--------------|
| 登录检查 | `@RequireLogin` |
| 权限检查 | `@RequirePermission` |
| 埋点统计 | `@TrackEvent` |
| 性能监控 | `@TimeLog` |
| 缓存处理 | `@Cacheable` |
| 异常处理 | `@SafeCall` |

一套 AspectJ 基础设施，可以复用到多种场景！

---

_下一步：尝试自己实现一个 @RequireLogin 注解，检查用户是否登录，未登录自动跳转登录页。_
