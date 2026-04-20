# Java Set 详解篇

> Set 的核心特性是"不重复"。搞清楚每种 Set 的去重依据、底层实现、null 支持情况，以及重写 equals/hashCode 的必要性。

---

## 一、Set 接口概览

```
Set<E>
├── HashSet         哈希表实现，无序，最常用
├── LinkedHashSet   哈希表 + 链表，保持插入顺序
└── TreeSet         红黑树实现，自然排序
```

Set 的核心约定：**同一个集合中不能有两个"相等"的元素**。

但"相等"的判断依据，不同的 Set 实现是不同的。

---

## 二、HashSet

### 底层实现

HashSet 底层就是一个 **HashMap**，元素存在 HashMap 的 key 上，value 统一是一个占位对象：

```java
// 源码
public class HashSet<E> {
    private transient HashMap<E, Object> map;
    private static final Object PRESENT = new Object(); // 统一的占位 value

    public boolean add(E e) {
        return map.put(e, PRESENT) == null;
    }

    public boolean contains(Object o) {
        return map.containsKey(o);
    }
}
```

所以 HashSet 的所有特性，本质上都是 HashMap key 的特性。

### 去重原理

HashSet 判断两个元素是否"相同"，分两步：

```
1. 先比较 hashCode()
   → 如果 hashCode 不同，直接认为不同（不会再比较 equals）
   → 如果 hashCode 相同，进入第 2 步

2. 再比较 equals()
   → equals 返回 true → 认为是同一个元素，不插入
   → equals 返回 false → 认为不同（哈希碰撞），插入到链表/红黑树
```

```
add("hello") → hashCode=99162322 → 映射到 bucket[5] → bucket[5] 为空 → 插入
add("hello") → hashCode=99162322 → 映射到 bucket[5] → equals("hello") = true → 不插入（去重）
add("world") → hashCode=113318802 → 映射到 bucket[3] → 插入
```

### 重写 equals 必须重写 hashCode

这是 Java 中最重要的约定之一：

**如果两个对象 equals 返回 true，它们的 hashCode 必须相同。**

```java
// 错误示例：只重写 equals，不重写 hashCode
class User {
    String name;

    @Override
    public boolean equals(Object o) {
        return this.name.equals(((User) o).name);
    }
    // 没有重写 hashCode，使用 Object 默认的（基于内存地址）
}

User u1 = new User("Alice");
User u2 = new User("Alice");

u1.equals(u2);  // true（我们认为相等）
u1.hashCode() == u2.hashCode();  // false！（内存地址不同）

Set<User> set = new HashSet<>();
set.add(u1);
set.add(u2);
set.size();  // 2！！没有去重，因为 hashCode 不同，直接放到不同 bucket
```

**正确做法：**

```java
class User {
    String name;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User)) return false;
        return Objects.equals(name, ((User) o).name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);  // 基于 name 计算 hashCode
    }
}
```

### null 支持

HashSet **允许存一个 null**：

```java
Set<String> set = new HashSet<>();
set.add(null);  // 允许
set.add(null);  // 第二次 add null，去重，不会插入
set.size();     // 1
```

null 的 hashCode 被特殊处理为 0，存在 bucket[0]。

### 特点总结

- 无序（遍历顺序与插入顺序无关）
- 允许 null（最多一个）
- 查找/插入/删除平均 O(1)
- 线程不安全

---

## 三、LinkedHashSet

### 底层实现

LinkedHashSet 底层是 **LinkedHashMap**（HashMap + 双向链表）。

在 HashMap 的基础上，额外维护了一条贯穿所有节点的双向链表，记录插入顺序：

```
HashMap 的 bucket 数组（决定存储位置）
    +
双向链表（记录插入顺序）：head → [A] ↔ [C] ↔ [B] ↔ [D] → tail
```

### 与 HashSet 的区别

| 特性 | HashSet | LinkedHashSet |
|------|---------|---------------|
| 底层 | HashMap | LinkedHashMap |
| 遍历顺序 | 无序 | 按插入顺序 |
| 性能 | 略快 | 略慢（维护链表）|
| 内存 | 略少 | 略多（链表指针）|

### 去重原理

与 HashSet 完全相同，依赖 hashCode + equals。

### null 支持

允许存一个 null，与 HashSet 相同。

### 使用场景

需要去重，同时需要保持插入顺序时使用：

```java
Set<String> set = new LinkedHashSet<>();
set.add("banana");
set.add("apple");
set.add("cherry");
set.add("apple");  // 重复，不插入

// 遍历顺序：banana → apple → cherry（插入顺序）
```

---

## 四、TreeSet

### 底层实现

TreeSet 底层是 **TreeMap**（红黑树）。元素存在 TreeMap 的 key 上。

```java
public class TreeSet<E> {
    private transient NavigableMap<E, Object> m;
    private static final Object PRESENT = new Object();
}
```

### 去重原理

TreeSet 的去重依据**不是 hashCode/equals，而是 compareTo（或 Comparator）**：

```
compareTo 返回 0 → 认为是同一个元素 → 不插入（去重）
compareTo 不为 0 → 认为不同 → 插入
```

```java
TreeSet<String> set = new TreeSet<>();
set.add("banana");
set.add("apple");
set.add("cherry");

// 遍历顺序：apple → banana → cherry（字典序）
```

### 自定义排序

```java
// 方式 1：元素实现 Comparable 接口
class Student implements Comparable<Student> {
    int age;

    @Override
    public int compareTo(Student other) {
        return this.age - other.age;  // 按年龄升序
    }
}

// 方式 2：创建 TreeSet 时传入 Comparator
TreeSet<Student> set = new TreeSet<>(
    Comparator.comparingInt(s -> s.age)
);
```

### null 支持

TreeSet **不允许 null**：

```java
TreeSet<String> set = new TreeSet<>();
set.add(null);  // 抛出 NullPointerException
```

原因：插入时需要调用 `compareTo()`，null 无法比较，会抛 NPE。

### 特点总结

- 有序（按自然排序或自定义 Comparator）
- 不允许 null
- 查找/插入/删除 O(log n)
- 线程不安全
- 支持范围查询：`headSet()`、`tailSet()`、`subSet()`

---

## 五、三种 Set 的去重依据对比

| Set | 去重依据 | 判断方法 |
|-----|----------|----------|
| HashSet | hashCode + equals | `hashCode()` 相同且 `equals()` 为 true |
| LinkedHashSet | hashCode + equals | 同上 |
| TreeSet | 比较结果为 0 | `compareTo()` 或 `Comparator.compare()` 返回 0 |

**注意：** TreeSet 中，即使两个对象 equals 为 true，只要 compareTo 不为 0，就会被认为是不同元素，都会被插入。反之，compareTo 为 0 的两个对象，即使 equals 为 false，也会被认为重复而去重。

---

## 六、null 支持速查

| Set | 允许 null | 说明 |
|-----|-----------|------|
| HashSet | 是（最多 1 个）| null 的 hashCode 为 0 |
| LinkedHashSet | 是（最多 1 个）| 同上 |
| TreeSet | 否 | compareTo(null) 抛 NPE |

---

## 七、各 Set 对比总结

| 特性 | HashSet | LinkedHashSet | TreeSet |
|------|---------|---------------|---------|
| 底层结构 | HashMap | LinkedHashMap | TreeMap（红黑树）|
| 遍历顺序 | 无序 | 插入顺序 | 排序顺序 |
| 去重依据 | hashCode + equals | hashCode + equals | compareTo |
| null 支持 | 是 | 是 | 否 |
| 查找性能 | O(1) | O(1) | O(log n) |
| 线程安全 | 否 | 否 | 否 |
| 适用场景 | 普通去重 | 去重 + 保持顺序 | 去重 + 排序 |

---

## 八、如何选择 Set？

```
默认选 HashSet（性能最好）
  ├── 需要保持插入顺序 → LinkedHashSet
  ├── 需要排序 → TreeSet
  └── 需要线程安全 → Collections.synchronizedSet() 或 ConcurrentHashMap.newKeySet()
```

---

_上一篇：[2-List详解篇](./2-List详解篇.md)_
_下一篇：[4-Map详解篇](./4-Map详解篇.md)_
