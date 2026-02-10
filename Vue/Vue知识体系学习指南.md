# Vue.js 知识体系学习指南

## 目录
1. [基础知识](#基础知识)
2. [生命周期](#生命周期)
3. [状态管理](#状态管理)
4. [组件通信方式](#组件通信方式)
5. [响应式原理](#响应式原理)
6. [其他重要知识点](#其他重要知识点)
7. [学习建议路径](#学习建议路径)

## 基础知识

### 模板语法
- **插值**：`{{ }}` 用于文本插值
- **指令**：
  - `v-bind`：动态绑定属性
  - `v-model`：双向数据绑定
  - `v-if`/`v-else`/`v-else-if`：条件渲染
  - `v-for`：列表渲染
  - `v-on`：事件绑定
  - `v-show`：条件显示
  - `v-text`、`v-html`：文本和HTML渲染

### 计算属性与侦听器
- **computed**：基于响应式依赖进行缓存的计算属性
- **methods**：每次调用都会执行函数，无缓存
- **watch**：观察特定数据变化并执行副作用操作
- **getter/setter**：在computed中定义可写的计算属性

### Class与Style绑定
- **Class绑定**：支持对象语法、数组语法
- **Style绑定**：支持对象语法、数组语法
- **动态绑定**：通过数据动态切换样式

### 条件渲染
- **v-if**：真正移除/插入DOM元素，适合条件不频繁切换
- **v-show**：只是切换display样式，适合频繁切换

### 列表渲染
- **v-for**：遍历数组、对象、数字
- **key的作用**：帮助Vue跟踪元素身份，提高渲染性能

## 生命周期

### 选项式API生命周期钩子
- **创建阶段**：
  - `beforeCreate`：实例初始化之后，数据观测和事件配置之前
  - `created`：实例创建完成，数据观测、属性和方法的运算已完成
- **挂载阶段**：
  - `beforeMount`：挂载开始之前被调用
  - `mounted`：实例挂载完成后调用，此时DOM已生成
- **更新阶段**：
  - `beforeUpdate`：数据更新时调用，发生在虚拟DOM打补丁之前
  - `updated`：数据更新导致虚拟DOM重新渲染和打补丁后调用
- **卸载阶段**：
  - `beforeUnmount`：卸载组件实例之前调用
  - `unmounted`：卸载组件实例后调用

### 组合式API生命周期钩子
- `onBeforeMount`：挂载前
- `onMounted`：挂载后
- `onBeforeUpdate`：更新前
- `onUpdated`：更新后
- `onBeforeUnmount`：卸载前
- `onUnmounted`：卸载后

### 组件销毁
- 正确清理定时器、取消网络请求、移除事件监听器等资源

## 状态管理

### Props
- 父子组件间的数据传递
- 单向数据流
- Prop验证：type, required, default, validator

### Event emit
- 子组件向父组件传递消息
- `$emit`触发自定义事件
- `.once`修饰符

### Vuex（状态管理库）
- **State**：存储应用的状态数据
- **Getter**：从state派生出一些状态，类似computed
- **Mutation**：同步更改state的方法
- **Action**：提交mutation，可以包含异步操作
- **Module**：模块化管理复杂应用状态

### Pinia（推荐的状态管理库）
- **Store定义**：使用`defineStore`创建store
- **Actions**：业务逻辑方法
- **Getters**：计算属性，类似store的computed
- **State管理**：响应式状态
- **Store组合**：多个store的组合使用

### Provide/Inject
- 跨层级组件通信
- 祖先组件通过provide提供数据
- 后代组件通过inject注入数据

## 组件通信方式

### Props
- 父组件向子组件传递数据
- 单向数据流，保证数据流向清晰

### $emit
- 子组件向父组件发送消息
- 自定义事件触发机制

### v-model
- 实现组件的双向绑定
- 语法糖形式

### $refs/$parent/$children
- 直接访问组件实例
- $refs获取指定元素或组件实例
- $parent访问父实例
- $children访问子实例数组

### Event Bus
- 创建中央事件总线实现组件间通信
- 适用于兄弟组件或非直系关系组件

### Provide/Inject
- 依赖注入模式
- 适用于祖孙多层级通信

### Slots
- **普通插槽**：基础插槽功能
- **具名插槽**：`v-slot:name`命名插槽
- **作用域插槽**：子组件向父组件传递数据

## 响应式原理

### 数据劫持
- **Vue 2**：使用`Object.defineProperty`劫持数据属性的getter/setter
- **Vue 3**：使用ES6的`Proxy`代理整个对象

### 依赖收集
- **Watcher**：观察者对象，观察数据变化
- **Dep**：依赖收集器，管理所有相关的Watcher
- 收集依赖：getter执行时将当前Watcher加入Dep
- 派发更新：setter执行时通知Dep中所有Watcher更新

### 异步更新队列
- **$nextTick**：在下次DOM更新循环结束之后执行延迟回调
- 批量更新：将同一事件循环内的数据变更批量处理

### Reactivity API
- **ref**：为基本类型创建响应式引用
- **reactive**：创建深层响应式对象
- **toRefs**：将响应式对象转换为普通对象，每个属性都是ref
- **computed**：创建计算属性
- **watch**：监听响应式数据变化

### 响应式系统设计
- 如何实现响应式数据
- 响应式对象和普通对象的区别
- 深响应式和浅响应式的差异

## 其他重要知识点

### 路由管理（Vue Router）
- **路由配置**：定义路由规则
- **嵌套路由**：实现路由的嵌套关系
- **路由守卫**：
  - 全局前置守卫：`beforeEach`
  - 路由独享守卫：`beforeEnter`
  - 组件内守卫：`beforeRouteEnter`、`beforeRouteUpdate`、`beforeRouteLeave`
- **编程式导航**：使用router.push/replace/go等方法
- **路由参数**：params、query参数处理
- **命名路由**：通过name字段跳转路由

### 过渡动画（Transition）
- **单元素/组件过渡**：`<transition>`包装单个元素
- **列表过渡**：`<transition-group>`处理列表
- **状态过渡**：数值状态变化的动画
- **钩子函数**：v-enter、v-enter-active、v-leave、v-leave-active
- **自定义过渡类名**：enter-from-class、enter-active-class等

### 自定义指令
- 全局注册：`app.directive`
- 局部注册：components选项中定义
- 钩子函数：bind、inserted、update、componentUpdated、unbind
- 使用场景：表单聚焦、元素拖拽等

### 混入（Mixins）
- 代码复用机制
- 选项合并策略
- 注意事项：命名冲突、数据来源不清

### Teleport（传送门）
- 将组件内容渲染到DOM树的任意位置
- 解决模态框、弹窗等层级问题

### Suspense（实验性）
- 处理异步组件加载状态
- loading状态和错误状态的处理

### 性能优化
- **虚拟滚动**：长列表优化
- **懒加载**：按需加载组件
- **keep-alive缓存**：缓存组件实例
- **防抖节流**：优化高频事件处理
- **组件分割**：代码分割和懒加载
- **事件优化**：避免不必要的重新渲染

### TypeScript集成
- 类型声明
- Composition API类型支持
- Props类型定义
- 插件类型声明

### 构建工具
- **Vite**：快速的前端构建工具
- **Vue CLI**：官方脚手架工具
- 构建配置和优化

### 单元测试
- **Jest**：JavaScript测试框架
- **Vue Test Utils**：Vue组件测试工具
- 组件测试策略

## 学习建议路径

1. **基础语法** → 2. **组件化** → 3. **生命周期** → 4. **组件通信** → 5. **状态管理** → 6. **路由管理** → 7. **进阶特性** → 8. **性能优化**

按照此路径学习，可以循序渐进地掌握Vue.js的完整技能体系，逐步提升开发能力。