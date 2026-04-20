# Java Map 详解篇

> Map 是 Java 中最常用的数据结构之一。本篇重点讲 HashMap 的底层原理、哈希碰撞的本质，以及各种 Map 的选型。

---

## 一、Map 接口概览

```
Map<K, V>
├── HashMap            哈希表，最常用
├── LinkedHashMap      哈希表 + 链表，保持插入顺序
├── TreeMap            红黑树，按 key 排序
├── Hashtable          线程安全（已过时）
└── ConcurrentHashMap  线程安全，推荐
```

---

## 二、HashMap

### 底层结构演进

**Java 7：数组 + 链表**

```
bucket 数组
index 0: → null
index 1: → [K1,V1] → [K2,V2] → null   ← 哈希碰撞，形成链表
index 2: → [K3,V3] → null
index 3: → null
...
```

**Java 8：数组 + 链表 + 红黑树**

当链表长度 ≥ 8 且数组长度 ≥ 64 时，链表转为红黑树，防止极端情况下退化为 O(n)：

```
index 1: → [红黑树]   ← 链表过长时转换，查找从 O(n) 变为 O(log n)
```

### 核心参数

```java
// 默认初始容量：16（必须是 2 的幂）
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // 16

// 默认负载因子：0.75
static final float DEFAULT_LOAD_FACTOR = 0.75f;

// 链表转红黑树的阈值
static final int TREEIFY_THRESHOLD = 8;

// 红黑树退化回链表的阈值
static final int UNTREEIFY_THRESHOLD = 6;

// 转红黑树时数组的最小长度
static final int MIN_TREEIFY_CAPACITY = 64;
```

**扩容触发条件：**

```
当前元素数量 > 容量 × 负载因子
例如：16 × 0.75 = 12，当元素超过 12 个时触发扩容
```

**扩容规则：** 每次扩容为原来的 **2 倍**。

### 哈希函数

HashMap 不直接用 `key.hashCode()`，而是做了一次**扰动处理**：

```java
// 源码
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

**为什么要扰动？**

`hashCode()` 是 32 位整数，但数组长度通常只有 16、32 这样的小值。直接取模（`hash % capacity`）只用到了低位，高位信息被浪费，容易碰撞。

将高 16 位异或到低 16 位，让高位也参与运算，分布更均匀。

**为什么容量必须是 2 的幂？**

```java
// 取模运算（慢）
index = hash % capacity

// 位运算（快，等价于取模，但要求 capacity 是 2 的幂）
index = hash & (capacity - 1)
```

`capacity` 是 2 的幂时，`capacity - 1` 的二进制全是 1，`&` 运算等价于取模，但速度快得多。

### 哈希碰撞

**什么是哈希碰撞？**

不同的 key 经过哈希函数计算后，得到了相同的数组下标：

```
key1 = "abc"  → hash = 96354 → index = 96354 & 15 = 2
key2 = "xyz"  → hash = 119193 → index = 119193 & 15 = 2  ← 碰撞！
```

**为什么不可避免？**

key 的种类是无限的（任意字符串），但数组下标是有限的（比如 16 个），根据鸽巢原理，碰撞必然存在。

**Java 如何处理碰撞？**

使用**链地址法（Separate Chaining）**：碰撞的元素挂在同一个 bucket 的链表上。

```
index 2: → [abc,v1] → [xyz,v2] → null
```

查找时：先定位 bucket，再遍历链表，用 equals 逐一比较 key。

**Java 8 的优化：** 链表长度超过 8 时转红黑树，查找从 O(n) 降为 O(log n)。

### put 流程

```
put(key, value)
    ↓
计算 hash(key)
    ↓
定位 bucket：index = hash & (capacity - 1)
    ↓
bucket 为空？
  ├── 是 → 直接插入新节点
  └── 否 → 遍历链表/红黑树
              ├── 找到相同 key（hash 相同 && equals 为 true）→ 覆盖 value
              └── 没找到 → 插入到链表尾部（Java 8）或头部（Java 7）
    ↓
检查是否需要扩容（size > threshold）
    ↓
检查链表是否需要转红黑树（length >= 8 && capacity >= 64）
```

### 扩容（rehash）

扩容时，所有元素需要重新计算位置（因为 capacity 变了，`hash & (capacity - 1)` 的结果会变）：

```java
// 扩容后，元素要么在原位置，要么在原位置 + 旧容量的位置
// 例如旧容量 16，扩容到 32：
// 原来在 index=5 的元素，扩容后要么还在 5，要么在 5+16=21
```

**Java 8 的优化：** 不需要重新计算 hash，只需判断 `hash & oldCapacity` 是 0 还是 1，决定新位置。

### null key 的处理

HashMap **允许一个 null key**，null key 的 hash 固定为 0，存在 bucket[0]：

```java
map.put(null, "value");  // 合法
map.get(null);           // 合法
```

### 线程不安全

HashMap 在多线程下会出现问题：

- **Java 7：** 多线程扩容时可能形成循环链表，导致 `get()` 死循环
- **Java 8：** 修复了死循环问题，但仍可能出现数据丢失（两个线程同时 put 到同一 bucket）

---

## 三、LinkedHashMap

### 底层实现

LinkedHashMap 继承自 HashMap，在其基础上额外维护了一条**双向链表**，记录所有节点的插入顺序（或访问顺序）：

```java
public class LinkedHashMap<K,V> extends HashMap<K,V> {
    transient LinkedHashMap.Entry<K,V> head;  // 链表头
    transient LinkedHashMap.Entry<K,V> tail;  // 链表尾
    final boolean accessOrder;  // false=插入顺序，true=访问顺序
}
```

### 两种顺序模式

```java
// 插入顺序（默认）
Map<String, Integer> map = new LinkedHashMap<>();

// 访问顺序（每次 get/put 会把节点移到链表尾部）
Map<String, Integer> lruMap = new LinkedHashMap<>(16, 0.75f, true);
```

**访问顺序 + 重写 removeEldestEntry = 手写 LRU 缓存：**

```java
Map<String, Integer> lruCache = new LinkedHashMap<>(16, 0.75f, true) {
    @Override
    protected boolean removeEldestEntry(Map.Entry<String, Integer> eldest) {
        return size() > 100;  // 超过 100 个时，自动删除最久未访问的
    }
};
```

---

## 四、TreeMap

### 底层实现

TreeMap 底层是**红黑树**，按 key 的自然顺序（或自定义 Comparator）排序。

```java
// 自然排序（key 需实现 Comparable）
TreeMap<String, Integer> map = new TreeMap<>();

// 自定义排序
TreeMap<String, Integer> map = new TreeMap<>(Comparator.reverseOrder());
```

### 特有方法

```java
TreeMap<Integer, String> map = new TreeMap<>();
map.put(1, "a"); map.put(3, "c"); map.put(5, "e");

map.firstKey();          // 1（最小 key）
map.lastKey();           // 5（最大 key）
map.floorKey(4);         // 3（≤4 的最大 key）
map.ceilingKey(4);       // 5（≥4 的最小 key）
map.headMap(3);          // {1=a}（key < 3 的部分）
map.tailMap(3);          // {3=c, 5=e}（key ≥ 3 的部分）
map.subMap(1, 4);        // {1=a, 3=c}（1 ≤ key < 4 的部分）
```

### null key

TreeMap **不允许 null key**（需要调用 compareTo，null 会抛 NPE），但允许 null value。

---

## 五、Hashtable

### 与 HashMap 的区别

| 特性 | HashMap | Hashtable |
|------|---------|-----------|
| 线程安全 | 否 | 是（方法加 synchronized）|
| null key | 允许（1个）| 不允许 |
| null value | 允许 | 不允许 |
| 初始容量 | 16 | 11 |
| 扩容 | 2 倍 | 2 倍 + 1 |
| 继承 | AbstractMap | Dictionary |
| 状态 | 推荐 | 已过时 |

Hashtable 的线程安全是通过给每个方法加 `synchronized` 实现的，粒度太粗，性能差。现在需要线程安全的 Map，推荐用 `ConcurrentHashMap`。

---

## 六、ConcurrentHashMap

### Java 7：分段锁（Segment）

将整个 Map 分成多个 Segment（默认 16 个），每个 Segment 是一个独立的小 HashMap，有自己的锁。

```
ConcurrentHashMap
├── Segment[0]  → 小 HashMap（有自己的 ReentrantLock）
├── Segment[1]  → 小 HashMap
├── ...
└── Segment[15] → 小 HashMap
```

不同 Segment 的操作可以并发，最多支持 16 个线程同时写。

### Java 8：CAS + synchronized

Java 8 放弃了 Segment，改用更细粒度的锁：

- **读操作：** 完全无锁（volatile 保证可见性）
- **写操作：**
  - bucket 为空时：用 CAS 插入，无锁
  - bucket 不为空时：只锁当前 bucket 的头节点（synchronized）

```
并发写不同 bucket → 完全并行，互不干扰
并发写同一 bucket → 只有一个线程能持有该 bucket 的锁
```

### 为什么不允许 null？

```java
map.put(null, "v");  // 抛 NullPointerException
map.get(null);       // 抛 NullPointerException
```

在多线程环境下，`map.get(key)` 返回 null 有两种可能：
1. key 不存在
2. key 存在但 value 是 null

单线程下可以用 `containsKey()` 区分，但多线程下两次操作之间可能有其他线程修改，无法保证一致性。禁止 null 可以避免这种歧义。

---

## 七、各 Map 对比总结

| 特性 | HashMap | LinkedHashMap | TreeMap | Hashtable | ConcurrentHashMap |
|------|---------|---------------|---------|-----------|-------------------|
| 底层结构 | 数组+链表+红黑树 | 同左+双向链表 | 红黑树 | 数组+链表 | 数组+链表+红黑树 |
| 遍历顺序 | 无序 | 插入/访问顺序 | key 排序 | 无序 | 无序 |
| null key | 允许（1个）| 允许（1个）| 不允许 | 不允许 | 不允许 |
| null value | 允许 | 允许 | 允许 | 不允许 | 不允许 |
| 线程安全 | 否 | 否 | 否 | 是（粗锁）| 是（细粒度）|
| 查找性能 | O(1) | O(1) | O(log n) | O(1) | O(1) |
| 推荐程度 | ★★★★★ | ★★★★ | ★★★★ | ★（已过时）| ★★★★★（并发）|

---

## 八、如何选择 Map？

```
默认选 HashMap
  ├── 需要保持插入顺序 → LinkedHashMap
  ├── 需要按 key 排序 → TreeMap
  ├── 需要 LRU 缓存 → LinkedHashMap（accessOrder=true）
  └── 需要线程安全 → ConcurrentHashMap（不要用 Hashtable）
```

---

## 九、常见面试问题

**Q：HashMap 的初始容量为什么是 16？**

16 是 2 的幂，满足位运算取模的要求，同时不太大不太小，是经验值。

**Q：负载因子为什么是 0.75？**

0.75 是空间和时间的折中：
- 太小（如 0.5）：频繁扩容，浪费内存
- 太大（如 1.0）：碰撞多，链表长，查找慢

**Q：HashMap 和 HashSet 的关系？**

HashSet 底层就是 HashMap，元素存在 key 上，value 是统一的占位对象 `PRESENT`。

**Q：HashMap 在 Java 8 做了哪些优化？**

1. 链表过长（≥8）时转红黑树，防止 O(n) 退化
2. 扩容时不再重新计算 hash，只判断高位是 0 还是 1
3. 插入改为尾插法（Java 7 是头插法，多线程扩容会形成环）

---

_上一篇：[3-Set详解篇](./3-Set详解篇.md)_
