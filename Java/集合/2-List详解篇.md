# Java List 详解篇

> 深入 List 的每一种实现：底层结构是什么、扩容怎么做、性能差异从哪来、线程安全怎么选。

---

## 一、List 接口概览

`List` 是有序、可重复的集合，支持通过下标访问元素。

```
List<E>
├── ArrayList       数组实现，随机访问快
├── LinkedList      双向链表实现，头尾操作快
├── Vector          数组实现，线程安全（已过时）
└── CopyOnWriteArrayList  写时复制，线程安全
```

---

## 二、ArrayList

### 底层结构

ArrayList 底层是一个 **Object 数组**：

```java
// 源码（简化）
public class ArrayList<E> {
    transient Object[] elementData;  // 存储元素的数组
    private int size;                // 实际元素个数（不是数组长度）
}
```

```
elementData: [10, 20, 30, null, null, null, null, null, null, null]
                                ↑
                              size=3，后面是预留空间
```

### 初始容量

```java
// 无参构造：初始是空数组，第一次 add 时才分配容量 10
new ArrayList<>()

// 指定容量
new ArrayList<>(20)
```

### 扩容机制

这是 ArrayList 最核心的机制：

```java
// 每次扩容为原来的 1.5 倍
int newCapacity = oldCapacity + (oldCapacity >> 1);
// oldCapacity >> 1 等价于 oldCapacity / 2
```

**扩容过程：**

```
1. add() 时检查 size == elementData.length
2. 如果满了，触发 grow()
3. 计算新容量 = 旧容量 × 1.5
4. Arrays.copyOf() 创建新数组并复制数据
5. 旧数组等待 GC 回收
```

**扩容示例：**

```
初始容量: 10
第一次扩容: 10 → 15
第二次扩容: 15 → 22
第三次扩容: 22 → 33
```

**为什么不每次只加 1？**

如果每次 add 都扩容 1，那么 n 次 add 就需要 n 次数组复制，总复制量是 1+2+3+...+n = O(n²)。
1.5 倍扩容是均摊策略，n 次 add 的总复制量是 O(n)，均摊每次 O(1)。

### 性能特征

| 操作 | 复杂度 | 说明 |
|------|--------|------|
| `get(index)` | O(1) | 直接数组下标访问 |
| `add(e)`（尾部）| 均摊 O(1) | 偶尔触发扩容 |
| `add(index, e)`（中间）| O(n) | 后面的元素全部右移 |
| `remove(index)` | O(n) | 后面的元素全部左移 |
| `contains(o)` | O(n) | 线性扫描 |

### 常见问题

**Q：ArrayList 删除元素时为什么要从后往前遍历？**

```java
// 错误写法：正向遍历删除会跳过元素
for (int i = 0; i < list.size(); i++) {
    if (list.get(i).equals(target)) {
        list.remove(i); // 删除后后面元素左移，i++ 会跳过下一个
    }
}

// 正确写法 1：倒序遍历
for (int i = list.size() - 1; i >= 0; i--) {
    if (list.get(i).equals(target)) list.remove(i);
}

// 正确写法 2：Iterator
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().equals(target)) it.remove();
}

// 正确写法 3：Java 8+
list.removeIf(e -> e.equals(target));
```

**为什么 Iterator 和 removeIf 比倒序遍历更优？**

| 写法 | 问题 |
|------|------|
| 正向 for 循环 | 删除后元素左移，`i++` 跳过下一个元素，结果错误 |
| 倒序 for 循环 | 逻辑正确，但对 LinkedList 每次 `get(i)` 是 O(n)，整体 O(n²) |
| Iterator | 通用，ArrayList/LinkedList 均高效；`it.remove()` 直接操作当前节点，同时同步 `modCount`，不会触发 `ConcurrentModificationException` |
| removeIf | **最优**：底层用 BitSet 先标记所有待删元素，最后**一次性批量移位**，避免每删一个就移位一次的开销，时间复杂度 O(n) 且常数更小 |

> 增强 for 循环（for-each）本质是 Iterator，但不能调用 `it.remove()`，直接调用 `list.remove()` 会抛 `ConcurrentModificationException`，因为修改了 `modCount` 但迭代器未感知。

**Q：为什么 ArrayList 的 elementData 用 transient 修饰？**

`transient` 表示不参与默认序列化。ArrayList 自定义了 `writeObject`，只序列化 `size` 个有效元素，而不是整个数组（数组后面可能有大量 null 的预留空间），节省序列化空间。

---

## 三、LinkedList

### 底层结构

LinkedList 底层是**双向链表**，每个节点是一个 `Node` 对象：

```java
// 源码（简化）
private static class Node<E> {
    E item;
    Node<E> next;
    Node<E> prev;
}

public class LinkedList<E> {
    transient Node<E> first;  // 头节点
    transient Node<E> last;   // 尾节点
    transient int size;
}
```

```
first                                    last
  ↓                                        ↓
[null|10|→] ↔ [←|20|→] ↔ [←|30|→] ↔ [←|40|null]
```

### 性能特征

| 操作 | 复杂度 | 说明 |
|------|--------|------|
| `get(index)` | O(n) | 从头或尾遍历到目标位置 |
| `add(e)`（尾部）| O(1) | 直接操作 last 节点 |
| `addFirst(e)` | O(1) | 直接操作 first 节点 |
| `add(index, e)`（中间）| O(n) | 先遍历找位置，再修改指针 |
| `remove(index)` | O(n) | 先遍历找节点，再修改指针 |

**LinkedList 的 get(index) 有一个小优化：**

```java
// 源码：根据 index 决定从头还是从尾开始遍历
if (index < (size >> 1)) {
    // 从头遍历
} else {
    // 从尾遍历
}
```

即使如此，最坏情况仍是 O(n/2) = O(n)。

### LinkedList 真的比 ArrayList 快吗？

**常见误区：** "LinkedList 插入删除是 O(1)，比 ArrayList 快"

实际上：
- 如果是**尾部**操作，ArrayList 均摊 O(1)，LinkedList 也是 O(1)，差不多
- 如果是**中间**操作，LinkedList 需要先遍历找位置 O(n)，再修改指针 O(1)，总体还是 O(n)
- 由于 LinkedList 内存不连续，CPU 缓存命中率低，实际性能往往比 ArrayList 更差

**LinkedList 真正的优势：** 频繁在**头部**插入/删除，或者当作**双端队列（Deque）**使用。

### LinkedList 实现了 Deque 接口

```java
// LinkedList 可以当队列用
LinkedList<String> queue = new LinkedList<>();
queue.offer("a");   // 入队（尾部）
queue.poll();       // 出队（头部）

// 也可以当栈用
queue.push("a");    // 压栈（头部）
queue.pop();        // 弹栈（头部）
```

---

## 四、Vector

### 底层结构

和 ArrayList 一样，底层也是 Object 数组。

**与 ArrayList 的区别：**

| 特性 | ArrayList | Vector |
|------|-----------|--------|
| 线程安全 | 否 | 是（方法加 synchronized）|
| 扩容倍数 | 1.5 倍 | 2 倍（默认）|
| 性能 | 好 | 差（锁开销）|
| 状态 | 推荐使用 | 已过时 |

Vector 的每个方法都加了 `synchronized`，粒度太粗，性能差。现在需要线程安全的 List，推荐用 `CopyOnWriteArrayList`。

---

## 五、CopyOnWriteArrayList

### 核心思想：写时复制

```
读操作：直接读原数组，不加锁
写操作：复制一份新数组 → 在新数组上修改 → 替换引用
```

```java
// 源码（简化）
public boolean add(E e) {
    synchronized (lock) {
        Object[] elements = getArray();
        int len = elements.length;
        Object[] newElements = Arrays.copyOf(elements, len + 1); // 复制
        newElements[len] = e;                                     // 修改新数组
        setArray(newElements);                                    // 替换引用
        return true;
    }
}
```

### 特点

**优点：**
- 读操作完全无锁，读性能极高
- 迭代时不会抛 `ConcurrentModificationException`（迭代的是快照）

**缺点：**
- 每次写都要复制整个数组，写性能差，内存开销大
- 读到的数据可能不是最新的（弱一致性）

**适用场景：** 读多写少，比如配置列表、白名单、监听器列表。

---

## 六、各 List 对比总结

| 特性 | ArrayList | LinkedList | Vector | CopyOnWriteArrayList |
|------|-----------|------------|--------|----------------------|
| 底层结构 | 数组 | 双向链表 | 数组 | 数组（写时复制）|
| 随机访问 | O(1) | O(n) | O(1) | O(1) |
| 尾部插入 | 均摊 O(1) | O(1) | 均摊 O(1) | O(n)（复制）|
| 中间插入 | O(n) | O(n) | O(n) | O(n) |
| 线程安全 | 否 | 否 | 是 | 是 |
| null 元素 | 允许 | 允许 | 允许 | 允许 |
| 推荐程度 | ★★★★★ | ★★★ | ★（已过时）| ★★★★（读多写少）|

---

## 七、如何选择 List？

```
默认选 ArrayList
  ├── 需要频繁在头部插入/删除 → LinkedList（或 ArrayDeque）
  ├── 需要线程安全
  │     ├── 读多写少 → CopyOnWriteArrayList
  │     └── 读写均衡 → Collections.synchronizedList() 或手动加锁
  └── 已知大小 → new ArrayList<>(initialCapacity) 避免扩容
```

---

_上一篇：[1-集合总览篇](./1-集合总览篇.md)_
_下一篇：[3-Set详解篇](./3-Set详解篇.md)_
