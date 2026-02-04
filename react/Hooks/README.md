# React Hooks 学习指南

> 本主题全面讲解 React Hooks 的使用方法、原理和最佳实践。

---

## 📚 文档导航

| 文档 | 内容概要 | 适合人群 |
|------|----------|----------|
| **[1-基础篇](./1-基础篇.md)** | useState、useEffect、useRef 等基础 Hooks 的使用 | 初学者、需要快速上手 |
| **[2-进阶篇](./2-进阶篇.md)** | useReducer、自定义Hooks、性能优化Hooks、React 18新特性 | 有基础、追求最佳实践 |
| **[3-源码篇](./3-源码篇.md)** | Hooks 原理、Fiber 架构、调用顺序机制 | 想深入理解原理 |

---

## 🎯 核心问题速查

### 基础篇

<details>
<summary><strong>1. useState 为什么不能直接修改 state？</strong></summary>

```typescript
// ❌ 错误：直接修改
const [user, setUser] = useState({ name: 'Tom' });
user.name = 'Jerry'; // 不会触发重渲染！

// ✅ 正确：创建新对象
setUser({ ...user, name: 'Jerry' });
```

**原因**：React 通过**引用比较**判断 state 是否变化。直接修改不会改变引用，React 认为没变化就不会重渲染。
</details>

<details>
<summary><strong>2. useEffect 的依赖数组怎么写？</strong></summary>

| 依赖数组 | 执行时机 | 常见用途 |
|----------|----------|----------|
| `[]` | 只在挂载时执行一次 | 初始化数据请求、订阅 |
| `[a, b]` | 挂载 + a 或 b 变化时执行 | 根据状态重新请求数据 |
| 不传 | 每次渲染后都执行 | 几乎不用（会造成性能问题） |

</details>

<details>
<summary><strong>3. useRef 和 useState 的区别？</strong></summary>

| 特性 | useState | useRef |
|------|----------|--------|
| 修改后是否触发渲染 | ✅ 会 | ❌ 不会 |
| 获取最新值 | 可能有闭包陷阱 | 总能拿到最新值 |
| 典型用途 | UI 状态 | DOM 引用、定时器 ID、记录上次值 |

</details>

### 进阶篇

<details>
<summary><strong>4. 什么时候用 useReducer 代替 useState？</strong></summary>

**适合 useReducer 的场景**：
- 多个相关状态（如表单的多个字段）
- 下一个状态依赖上一个状态
- 复杂的状态更新逻辑（如购物车增删改）
- 需要把更新逻辑传给子组件（传 dispatch 而不是多个 setState）

</details>

<details>
<summary><strong>5. useMemo 和 useCallback 什么时候用？</strong></summary>

**不要过早优化！只在以下场景使用**：

| Hook | 用途 | 典型场景 |
|------|------|----------|
| `useMemo` | 缓存计算结果 | 复杂计算、避免子组件无效渲染 |
| `useCallback` | 缓存函数引用 | 传给用了 memo 的子组件、作为 useEffect 依赖 |

**误用案例**：简单计算用 useMemo 反而更慢（Hook 本身也有开销）。

</details>

<details>
<summary><strong>6. 自定义 Hooks 的命名和规则？</strong></summary>

**规则**：
1. 名字必须以 `use` 开头（如 `useAuth`、`useFetch`）
2. 可以调用其他 Hooks
3. 必须遵守 Hooks 规则（不能在条件/循环里调用）

**典型场景**：
- 复用状态逻辑（如表单验证、数据请求）
- 封装副作用（如 localStorage、订阅）
- 抽象业务逻辑（如权限判断、主题切换）

</details>

### 源码篇

<details>
<summary><strong>7. 为什么 Hooks 不能写在条件判断里？</strong></summary>

**原因**：React 通过**调用顺序**来识别每个 Hook。

```typescript
// ❌ 错误
if (condition) {
  useState(0); // 条件变了，调用顺序就乱了
}

// ✅ 正确
const [count, setCount] = useState(0);
if (condition) {
  // 在这里用 count
}
```

React 内部用**链表**存储 Hooks，按顺序读取。条件调用会导致前后不一致。

</details>

<details>
<summary><strong>8. React 18 的 useTransition 解决什么问题?</strong></summary>

**问题**：输入框打字时，同步更新大列表会卡顿。

**解决**：把「大列表更新」标记为**低优先级**，让「输入响应」先执行。

```typescript
const [isPending, startTransition] = useTransition();

const handleChange = (e) => {
  setInputValue(e.target.value); // 高优先级
  startTransition(() => {
    setSearchResults(filterHugeList(e.target.value)); // 低优先级
  });
};
```

</details>

---

## 🗺️ 学习建议

### 推荐顺序
1. **基础篇**（必学）：先掌握 `useState`、`useEffect`、`useRef`，能写基本功能
2. **进阶篇**（按需）：遇到复杂状态学 `useReducer`，需要优化再学 `useMemo`
3. **源码篇**（选学）：准备面试或想深入理解原理时阅读

### 实践建议
- **不要背 API**：边看文档边写小 Demo，多敲几遍就记住了
- **别过度优化**：`useMemo`/`useCallback` 不是越多越好，只在有性能问题时用
- **多写自定义 Hooks**：这是复用逻辑的最佳实践，比高阶组件和 Render Props 更直观

### 和 Android 对比（帮助理解）

| React Hooks | Android 对比 | 说明 |
|-------------|--------------|------|
| `useState` | `LiveData` / `StateFlow` | 响应式数据 |
| `useEffect` | `onCreate` / `onResume` 等生命周期 | 副作用管理 |
| `useRef` | `findViewById` | 获取实例引用 |
| `useCallback` | 避免匿名内部类创建新实例 | 稳定引用 |
| 自定义 Hooks | ViewModel 的公共方法 | 逻辑复用 |

---

## 🔗 相关主题

- **[组件基础](../Component/README.md)**：Hooks 是在函数组件里用的
- **[状态管理](../StateManagement/README.md)**：何时该用全局状态管理代替 useState
- **[性能优化](../Performance/README.md)**：详细讲解 memo、useMemo、useCallback 的配合

---

## ❓ 常见问题

**Q：类组件还需要学吗？**
A：不建议。现在 React 官方推荐函数组件 + Hooks，类组件主要用于维护老项目。

**Q：为什么我的 useEffect 执行了两次？**
A：React 18 开发模式下会**故意**执行两次，帮你发现副作用问题。生产环境只执行一次。

**Q：自定义 Hooks 和普通函数有什么区别？**
A：自定义 Hooks 能调用其他 Hooks，普通函数不行。如果只是数据处理，用普通函数就行。

---

_如有疑问或发现错误，欢迎提 Issue！本文档持续更新中..._
