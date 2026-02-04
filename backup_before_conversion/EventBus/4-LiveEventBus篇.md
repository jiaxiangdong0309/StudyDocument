# LiveEventBus 深度解析

## 技术演进：为什么 EventBus 还不够？

### 传统 EventBus 的痛点

EventBus 虽然好用，但在 Android 架构演进中暴露出几个问题：

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EventBus 的历史包袱                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  痛点 1：生命周期不感知                                                       │
│  ┌─────────────┐       ┌─────────────┐                                      │
│  │  Activity   │ ──→   │  EventBus   │  ← Activity 销毁了，EventBus 不知道   │
│  │  (已销毁)   │ ←──   │   (还在发)   │  ← 内存泄漏 / 崩溃风险                │
│  └─────────────┘       └─────────────┘                                      │
│                                                                             │
│  痛点 2：手动注册/反注册                                                      │
│  onStart() → register()   ← 忘了写？内存泄漏                                 │
│  onStop() → unregister()  ← 忘了写？崩溃                                     │
│                                                                             │
│  痛点 3：不支持跨进程                                                         │
│  进程 A ──×──→ 进程 B    ← 需要借助其他方案（AIDL、广播等）                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### LiveData 带来的启发

Google 在 Jetpack 中推出 LiveData，它天生具备：
- **生命周期感知**：自动在合适的时机通知观察者
- **自动取消订阅**：Observer 跟随 LifecycleOwner 销毁而自动解绑
- **数据持有者**：始终持有最新数据，新订阅者可立即获得

**灵魂发问**：能不能把 LiveData 改造成事件总线？

答案就是 **LiveEventBus**！

## 什么是 LiveEventBus？

### 一句话定义

LiveEventBus = LiveData + 事件总线思想 + 跨进程能力

### 通俗理解

如果把 EventBus 比作公司的公告板，那么 LiveEventBus 就是**智能公告板**：

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      智能公告板 vs 传统公告板                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  传统公告板（EventBus）：                                                     │
│  - 贴公告后，已离职的员工还能收到（内存泄漏）                                   │
│  - 员工需要主动来看/走时撕掉便签（手动注册/反注册）                              │
│  - 只能本大楼看到（不支持跨进程）                                              │
│                                                                             │
│  智能公告板（LiveEventBus）：                                                 │
│  - 自动识别员工在不在工位，在才推送（生命周期感知）                              │
│  - 员工离职自动取消订阅（自动取消）                                            │
│  - 支持分公司同步（跨进程/跨 APP）                                            │
│  - 新员工入职能看到最新公告（Sticky 消息）                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 核心特性

### 特性对比表

| 特性 | EventBus | RxBus | LiveEventBus |
|-----|----------|-------|--------------|
| 生命周期感知 | ❌ | ❌ | ✅ |
| 自动取消订阅 | ❌ | ❌ | ✅ |
| Sticky 消息 | ✅ | ✅ | ✅ |
| 延迟发送 | ❌ | ❌ | ✅ |
| 有序接收 | ✅ | ❌ | ✅ |
| 跨进程通信 | ❌ | ❌ | ✅ |
| 跨 APP 通信 | ❌ | ❌ | ✅ |
| 线程切换 | ✅ | ✅ | ❌（依赖 LiveData 主线程回调） |
| 反射依赖 | ✅ | ❌ | ❌ |
| AndroidX 支持 | ✅ | ✅ | ✅ |

### 核心优势

1. **生命周期感知**：告别 `register()` / `unregister()` 的烦恼
2. **零配置使用**：不需要在 Application 初始化，开箱即用
3. **跨进程能力**：内置跨进程、跨 APP 通信支持
4. **Sticky 消息**：订阅者可以收到订阅前发送的消息
5. **延迟发送**：支持指定延迟时间发送消息

## 快速上手

### 添加依赖

```kotlin
// AndroidX 版本（推荐）
implementation("io.github.jeremyliao:live-event-bus-x:1.8.0")

// 非 AndroidX 版本
implementation("io.github.jeremyliao:live-event-bus:1.8.0")
```

### 基础用法

#### 1. 订阅消息（生命周期感知模式）

```kotlin
// 在 Activity/Fragment 中订阅
// 特点：自动跟随生命周期，onDestroy 时自动取消订阅
LiveEventBus
    .get<String>("avatar_changed")  // 指定事件 key 和类型
    .observe(this) { newAvatarUrl ->
        // this 是 LifecycleOwner（Activity/Fragment）
        // 只在 STARTED 之后才会收到消息
        avatarImageView.load(newAvatarUrl)
    }
```

#### 2. 订阅消息（Forever 模式）

```kotlin
// 不受生命周期限制，需要手动取消订阅
// 适用场景：Service、Application 等非 LifecycleOwner
private val avatarObserver = Observer<String> { newUrl ->
    updateAllAvatars(newUrl)
}

// 订阅
LiveEventBus
    .get<String>("avatar_changed")
    .observeForever(avatarObserver)

// 取消订阅（必须手动调用！）
LiveEventBus
    .get<String>("avatar_changed")
    .removeObserver(avatarObserver)
```

#### 3. 发送消息

```kotlin
// 方式一：直接发送（不定义事件类型）
LiveEventBus
    .get<String>("avatar_changed")
    .post("https://xxx.com/new_avatar.jpg")

// 方式二：使用事件类（推荐，类型更安全）
data class AvatarChangedEvent(val newUrl: String, val userId: Long)

LiveEventBus
    .get(AvatarChangedEvent::class.java)
    .post(AvatarChangedEvent("https://xxx.com/new_avatar.jpg", 12345))
```

### 与 EventBus 对比

```kotlin
// ==================== EventBus 的写法 ====================
class MainActivity : AppCompatActivity() {
    
    override fun onStart() {
        super.onStart()
        EventBus.getDefault().register(this)  // 必须手动注册
    }
    
    override fun onStop() {
        super.onStop()
        EventBus.getDefault().unregister(this)  // 必须手动反注册
    }
    
    @Subscribe(threadMode = ThreadMode.MAIN)
    fun onAvatarChanged(event: AvatarChangedEvent) {
        // 处理事件
    }
}

// ==================== LiveEventBus 的写法 ====================
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 一行搞定，自动管理生命周期！
        LiveEventBus
            .get(AvatarChangedEvent::class.java)
            .observe(this) { event ->
                // 处理事件
            }
    }
    // 不需要 onStart/onStop，不需要 register/unregister
}
```

## 进阶用法

### 1. Sticky 消息（粘性消息）

```kotlin
// 场景：先发送消息，后订阅的观察者也能收到

// 发送消息（此时还没有订阅者）
LiveEventBus
    .get<String>("user_login")
    .post("张三")

// 稍后：新页面订阅，使用 observeSticky 可以收到之前发送的消息
LiveEventBus
    .get<String>("user_login")
    .observeSticky(this) { userName ->
        // 能收到 "张三"！
        showWelcome(userName)
    }
```

**Sticky 消息的典型场景**：
- 登录状态通知：后打开的页面需要知道当前登录用户
- 配置变更：新页面需要获取最新配置
- 数据预加载：页面打开前数据已准备好

### 2. 延迟发送

```kotlin
// 延迟 2 秒发送
LiveEventBus
    .get<String>("delayed_message")
    .postDelay("Hello after 2s", 2000)

// 带生命周期的延迟发送（推荐）
// 如果 sender 销毁了，消息不会发送，避免内存泄漏
LiveEventBus
    .get<String>("delayed_message")
    .postDelay(this, "Hello after 2s", 2000)
```

### 3. 有序发送

```kotlin
// 确保消息按发送顺序被接收
// 适用场景：消息有先后依赖关系
LiveEventBus
    .get<String>("ordered_message")
    .postOrderly("第一条消息")

LiveEventBus
    .get<String>("ordered_message")
    .postOrderly("第二条消息")  // 一定在第一条之后被处理
```

### 4. 跨进程通信

```kotlin
// 在进程 A 中发送
LiveEventBus
    .get<String>("cross_process_event")
    .postAcrossProcess("来自进程 A 的消息")

// 在进程 B 中订阅（正常订阅即可）
LiveEventBus
    .get<String>("cross_process_event")
    .observe(this) { message ->
        // 能收到进程 A 发送的消息
    }
```

**跨进程支持的数据类型**：
- 基本类型：Int、Long、Float、Double、Boolean、String
- Serializable 对象
- Parcelable 对象
- Bean 对象（需要配置 GsonProcessor）

### 5. 跨 APP 通信

```kotlin
// 在 APP A 中发送
LiveEventBus
    .get<String>("cross_app_event")
    .postAcrossApp("来自 APP A 的消息")

// 在 APP B 中订阅
LiveEventBus
    .get<String>("cross_app_event")
    .observe(this) { message ->
        // 能收到 APP A 发送的消息
    }
```

## 配置选项

```kotlin
// 在 Application.onCreate() 中配置（可选）
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        LiveEventBus
            .config()
            // 配置 Observer 接收消息的模式
            // true（默认）：整个生命周期都能收到消息
            // false：只在 STARTED 之后才能收到
            .lifecycleObserverAlwaysActive(true)
            // 没有 Observer 时是否自动清除 LiveEvent 以释放内存
            .autoClear(false)
    }
}
```

## 实现原理

### 核心架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LiveEventBus 架构图                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                        ┌──────────────────────┐                             │
│                        │    LiveEventBus      │                             │
│                        │   （单例，入口类）     │                             │
│                        └──────────┬───────────┘                             │
│                                   │                                         │
│                        ┌──────────▼───────────┐                             │
│                        │   LiveEventBusCore   │                             │
│                        │   （核心实现类）       │                             │
│                        └──────────┬───────────┘                             │
│                                   │                                         │
│           ┌───────────────────────┼───────────────────────┐                 │
│           │                       │                       │                 │
│  ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐         │
│  │  Observable<T>  │    │  Observable<T>  │    │  Observable<T>  │         │
│  │   (key: "a")    │    │   (key: "b")    │    │ (key: class)    │         │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘         │
│           │                      │                      │                   │
│  ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐         │
│  │  ExternalLive   │    │  ExternalLive   │    │  ExternalLive   │         │
│  │     Data        │    │     Data        │    │     Data        │         │
│  │ (扩展的LiveData) │    │ (扩展的LiveData) │    │ (扩展的LiveData) │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 为什么不直接用 LiveData？

原生 LiveData 作为事件总线有一个问题：**订阅时会收到上一次的数据**。

```kotlin
// LiveData 的 "数据倒灌" 问题
val liveData = MutableLiveData<String>()
liveData.value = "旧数据"

// 新订阅者会立即收到 "旧数据"，但我们可能只想收到新消息！
liveData.observe(this) { data ->
    // 这里会收到 "旧数据"
}
```

**LiveEventBus 的解决方案**：通过版本号控制

```kotlin
// 简化的原理示意
class ExternalLiveData<T> : MutableLiveData<T>() {
    private var version = START_VERSION  // 数据版本
    
    override fun setValue(value: T) {
        version++  // 每次设值，版本+1
        super.setValue(value)
    }
    
    override fun observe(owner: LifecycleOwner, observer: Observer<T>) {
        // 包装 Observer，记录订阅时的版本
        val wrapper = ObserverWrapper(observer, version)
        super.observe(owner, wrapper)
    }
    
    inner class ObserverWrapper(
        private val observer: Observer<T>,
        private val observerVersion: Int  // 记录订阅时的版本
    ) : Observer<T> {
        override fun onChanged(t: T) {
            // 只有版本大于订阅时的版本，才通知
            // 这样就过滤掉了订阅前的数据
            if (version > observerVersion) {
                observer.onChanged(t)
            }
        }
    }
}
```

### 跨进程实现原理

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      跨进程通信原理                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   进程 A                                   进程 B                           │
│  ┌─────────────┐                         ┌─────────────┐                    │
│  │ LiveEvent   │                         │ LiveEvent   │                    │
│  │    Bus      │                         │    Bus      │                    │
│  └──────┬──────┘                         └──────┬──────┘                    │
│         │                                       │                           │
│         │ postAcrossProcess()                   │                           │
│         ▼                                       │                           │
│  ┌─────────────┐    Broadcast/Intent     ┌──────▼──────┐                    │
│  │   IPC       │ ───────────────────→    │   IPC       │                    │
│  │  Processor  │                         │  Receiver   │                    │
│  └─────────────┘                         └──────┬──────┘                    │
│                                                 │                           │
│                                          ┌──────▼──────┐                    │
│                                          │ 本地 post() │                    │
│                                          └─────────────┘                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

内部使用广播机制实现跨进程通信，数据通过 Processor 序列化后传输。

## 最佳实践

### 1. 事件定义规范

```kotlin
// ❌ 不推荐：使用字符串 key，容易写错
LiveEventBus.get<String>("user_login")

// ✅ 推荐：使用常量 key
object EventKeys {
    const val USER_LOGIN = "user_login"
    const val AVATAR_CHANGED = "avatar_changed"
}
LiveEventBus.get<String>(EventKeys.USER_LOGIN)

// ✅ 更推荐：使用事件类，类型安全
data class UserLoginEvent(val userId: Long, val userName: String)
LiveEventBus.get(UserLoginEvent::class.java)
```

### 2. 封装统一的事件管理器

```kotlin
/**
 * 统一的事件管理器
 * 好处：
 * 1. 事件定义集中管理
 * 2. 类型安全
 * 3. 支持 IDE 自动补全
 */
object AppEventBus {
    
    // 用户相关事件
    object User {
        private const val KEY_LOGIN = "event_user_login"
        private const val KEY_LOGOUT = "event_user_logout"
        
        fun postLogin(userId: Long, userName: String) {
            LiveEventBus
                .get<UserLoginEvent>(KEY_LOGIN)
                .post(UserLoginEvent(userId, userName))
        }
        
        fun observeLogin(owner: LifecycleOwner, observer: (UserLoginEvent) -> Unit) {
            LiveEventBus
                .get<UserLoginEvent>(KEY_LOGIN)
                .observe(owner, observer)
        }
    }
    
    // 配置相关事件
    object Config {
        fun postThemeChanged(isDark: Boolean) {
            LiveEventBus
                .get<Boolean>("event_theme_changed")
                .post(isDark)
        }
        
        fun observeThemeChanged(owner: LifecycleOwner, observer: (Boolean) -> Unit) {
            LiveEventBus
                .get<Boolean>("event_theme_changed")
                .observe(owner, observer)
        }
    }
}

// 使用示例
// 发送
AppEventBus.User.postLogin(12345, "张三")

// 订阅
AppEventBus.User.observeLogin(this) { event ->
    showWelcome(event.userName)
}
```

### 3. 避免滥用

```kotlin
// ❌ 不适合用 LiveEventBus 的场景
// 1. 同一个页面内的组件通信 → 用 ViewModel + LiveData
// 2. 一次性回调 → 用 callback 或协程
// 3. 需要返回值的通信 → 不适合事件总线

// ✅ 适合用 LiveEventBus 的场景
// 1. 跨页面/跨模块的解耦通信
// 2. 全局事件广播（登录、登出、配置变更）
// 3. 跨进程通信
```

## 常见问题

### 1. 收不到消息？

```kotlin
// 排查步骤：
// 1. 检查 key 是否一致
LiveEventBus.get<String>("key_a").post("msg")  // 发送
LiveEventBus.get<String>("key_b").observe(...)  // key 不一致！

// 2. 检查泛型类型是否一致
LiveEventBus.get<String>("key").post("msg")
LiveEventBus.get<Int>("key").observe(...)  // 类型不一致！

// 3. 使用 Console 调试
val info = LiveEventBus.get<String>("key").getInfo()
Log.d("DEBUG", info)  // 查看 Observer 数量、版本等信息
```

### 2. 收到重复消息？

```kotlin
// 原因：重复注册了 Observer
// 检查：是否在 onResume/onStart 等会多次调用的地方订阅

// ❌ 错误写法
override fun onResume() {
    super.onResume()
    LiveEventBus.get<String>("key").observe(this) { ... }  // 每次 onResume 都会注册新的！
}

// ✅ 正确写法：在 onCreate 中订阅
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    LiveEventBus.get<String>("key").observe(this) { ... }
}
```

### 3. 传递泛型类型（List、Map）？

```kotlin
// 方式一：类型擦除后手动转换
LiveEventBus
    .get("key", List::class.java)
    .observe(this) { list ->
        val stringList = list as List<String>
    }

// 方式二：封装事件类（推荐）
data class UserListEvent(val users: List<User>)

LiveEventBus
    .get(UserListEvent::class.java)
    .observe(this) { event ->
        val users: List<User> = event.users  // 类型安全
    }
```

## 与其他方案对比

### LiveEventBus vs EventBus vs Flow

| 维度 | EventBus | LiveEventBus | SharedFlow |
|-----|----------|--------------|------------|
| **学习成本** | 低 | 低 | 中（需要理解协程） |
| **生命周期感知** | ❌ 手动管理 | ✅ 自动管理 | ✅ 配合 lifecycleScope |
| **跨进程** | ❌ | ✅ 内置支持 | ❌ 需要额外实现 |
| **背压处理** | ❌ | ❌ | ✅ 可配置策略 |
| **线程切换** | ✅ @Subscribe 注解 | ❌ 固定主线程 | ✅ flowOn |
| **类型安全** | 中（运行时检查） | 中（运行时检查） | 高（编译时检查） |
| **适用场景** | 传统项目 | Jetpack 项目 | 协程项目 |

### 选择建议

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        如何选择事件总线方案？                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  问：项目是否使用 Jetpack/MVVM 架构？                                         │
│       │                                                                     │
│       ├── 是 ──→ LiveEventBus 或 SharedFlow                                 │
│       │              │                                                      │
│       │              ├── 需要跨进程？ ──→ LiveEventBus                       │
│       │              └── 全协程项目？ ──→ SharedFlow                         │
│       │                                                                     │
│       └── 否（传统 MVP/MVC） ──→ EventBus                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 总结

### LiveEventBus 核心优势

1. **生命周期感知**：基于 LiveData，自动管理订阅，告别内存泄漏
2. **零配置**：不需要初始化，开箱即用
3. **跨进程**：内置跨进程、跨 APP 通信支持
4. **Sticky 消息**：支持粘性消息，新订阅者可获取历史消息
5. **延迟发送**：支持延迟发送和有序发送

### 适用场景

- Jetpack / MVVM 架构项目
- 需要跨进程/跨 APP 通信
- 希望简化事件总线的生命周期管理
- 需要 Sticky 消息支持

### 不适用场景

- 需要精细的线程控制（LiveEventBus 回调固定在主线程）
- 需要背压处理的高频事件
- 纯协程项目（可考虑 SharedFlow）

---

## 面试题

### 基础题

**Q1：LiveEventBus 相比 EventBus 有什么优势？**

**答**：主要有三个优势：
1. **生命周期感知**：基于 LiveData 实现，Observer 会随着 LifecycleOwner 的销毁自动解绑，不需要手动 register/unregister
2. **跨进程支持**：内置了跨进程、跨 APP 通信能力，EventBus 不支持
3. **Sticky 消息增强**：支持新订阅者接收订阅前发送的消息

**Q2：LiveEventBus 是如何解决 LiveData 数据倒灌问题的？**

**答**：通过版本号机制。每次 setValue 时版本号+1，Observer 注册时记录当前版本号。只有数据版本大于 Observer 的版本时才通知，这样就过滤掉了订阅前的旧数据。

### 进阶题

**Q3：LiveEventBus 的跨进程通信是如何实现的？**

**答**：内部使用广播机制。发送跨进程消息时，数据通过 Processor（如 GsonProcessor）序列化，然后通过广播发送。接收端收到广播后反序列化，再调用本地 post() 分发给 Observer。

**Q4：什么场景下应该用 LiveEventBus，什么场景下应该用 SharedFlow？**

**答**：
- **LiveEventBus**：需要跨进程通信、项目不使用协程、希望开箱即用
- **SharedFlow**：全协程项目、需要背压处理、需要精细的线程控制

---
_本文档将持续更新，添加更多相关内容_
