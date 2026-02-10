# GetX 基础使用篇

## 技术演进：为什么需要 GetX？

### 历史痛点
在 GetX 出现前，Flutter 状态管理面临三大阵痛：
1. **Provider 的样板代码地狱**：需要 ChangeNotifier + MultiProvider + Consumer 三件套
2. **BLoC 的学习曲线陡峭**：Stream、Sink、Event、State 概念过于抽象
3. **路由管理的割裂感**：Navigator 需要 BuildContext，跨页面传参繁琐

**GetX 的破局之道**：用一个库解决状态管理、路由导航、依赖注入三大问题，且无需 BuildContext。

> **生活类比**：传统方案像"分散的家电遥控器"（每个功能一个遥控），GetX 是"智能家居中控屏"（一个面板控制全屋）。

---

## 核心概念

### 1. 响应式状态管理
GetX 提供两种响应式方案：

| 方案 | 适用场景 | 性能特点 |
|------|---------|---------|
| **简单状态管理** (GetBuilder) | 局部刷新、性能敏感场景 | 手动控制刷新，零开销 |
| **响应式状态管理** (Obx/GetX) | 复杂依赖、自动追踪场景 | 自动依赖收集，轻微开销 |

### 2. 在 Widget 树中的地位
```
MaterialApp (GetMaterialApp)
└── GetX/Obx (响应式监听节点)
    └── Controller (状态容器，独立于 Widget 树)
```

---

## 最佳实践示例

### 场景一：计数器（简单状态管理）

```dart
import 'package:get/get.dart';

// 1. 定义 Controller（状态容器）
class CounterController extends GetxController {
  int count = 0;

  void increment() {
    count++;
    update(); // 手动触发刷新，精准控制性能
  }
}

// 2. 在 Widget 中使用
class CounterPage extends StatelessWidget {
  const CounterPage({super.key});

  @override
  Widget build(BuildContext context) {
    // 依赖注入：首次访问时自动创建实例
    final controller = Get.put(CounterController());

    return Scaffold(
      body: Center(
        child: GetBuilder<CounterController>(
          builder: (c) => Text('点击次数: ${c.count}'), // 仅此处重建
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: controller.increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

**意图注释**：
- `Get.put()` 实现依赖注入，无需手动管理生命周期
- `GetBuilder` 只重建包裹的 Widget，避免全页面刷新
- `update()` 手动触发，适合性能敏感场景（如游戏计分）

---

### 场景二：购物车（响应式状态管理）

```dart
import 'package:get/get.dart';

// 商品模型
class Product {
  final String name;
  final double price;

  Product(this.name, this.price);
}

// Controller：使用 .obs 创建响应式变量
class CartController extends GetxController {
  // RxList：响应式列表，自动追踪增删改
  final items = <Product>[].obs;

  // RxDouble：响应式数值，自动计算总价
  double get totalPrice => items.fold(0, (sum, item) => sum + item.price);

  void addItem(Product product) {
    items.add(product); // 自动触发依赖此列表的 Widget 重建
  }

  void removeItem(int index) {
    items.removeAt(index);
  }
}

// UI 层
class CartPage extends StatelessWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = Get.find<CartController>(); // 获取已注入的实例

    return Scaffold(
      appBar: AppBar(
        title: Obx(() => Text('购物车 (${cart.items.length})')), // 自动监听 items 变化
      ),
      body: Obx(() {
        if (cart.items.isEmpty) {
          return const Center(child: Text('购物车为空'));
        }

        return ListView.builder(
          itemCount: cart.items.length,
          itemBuilder: (context, index) {
            final item = cart.items[index];
            return ListTile(
              title: Text(item.name),
              trailing: Text('¥${item.price}'),
              onTap: () => cart.removeItem(index),
            );
          },
        );
      }),
      bottomNavigationBar: Obx(() => Container(
        padding: const EdgeInsets.all(16),
        child: Text('总价: ¥${cart.totalPrice.toStringAsFixed(2)}'),
      )),
    );
  }
}
```

**意图注释**：
- `.obs` 将普通变量转为响应式变量（类似 Vue 的 ref）
- `Obx()` 自动追踪内部使用的响应式变量，无需手动指定依赖
- `Get.find()` 获取已注入的实例，实现跨页面状态共享

---

### 场景三：路由导航（无需 BuildContext）

```dart
// 1. 配置路由表
class AppRoutes {
  static const home = '/';
  static const detail = '/detail';
  static const profile = '/profile';
}

void main() {
  runApp(GetMaterialApp(
    initialRoute: AppRoutes.home,
    getPages: [
      GetPage(name: AppRoutes.home, page: () => const HomePage()),
      GetPage(
        name: AppRoutes.detail,
        page: () => const DetailPage(),
        transition: Transition.fadeIn, // 自定义转场动画
      ),
      GetPage(
        name: AppRoutes.profile,
        page: () => const ProfilePage(),
        binding: ProfileBinding(), // 页面级依赖注入
      ),
    ],
  ));
}

// 2. 页面跳转（无需 BuildContext）
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () {
                // 命名路由跳转
                Get.toNamed(AppRoutes.detail, arguments: {'id': 123});
              },
              child: const Text('查看详情'),
            ),
            ElevatedButton(
              onPressed: () async {
                // 等待返回结果
                final result = await Get.toNamed(AppRoutes.profile);
                if (result != null) {
                  Get.snackbar('提示', '用户已更新: $result');
                }
              },
              child: const Text('编辑资料'),
            ),
          ],
        ),
      ),
    );
  }
}

// 3. 接收参数
class DetailPage extends StatelessWidget {
  const DetailPage({super.key});

  @override
  Widget build(BuildContext context) {
    final args = Get.arguments as Map<String, dynamic>;
    final id = args['id'] as int;

    return Scaffold(
      appBar: AppBar(title: Text('详情页 #$id')),
      body: Center(
        child: ElevatedButton(
          onPressed: () => Get.back(result: '操作成功'), // 返回并传递结果
          child: const Text('返回'),
        ),
      ),
    );
  }
}

// 4. 页面级依赖注入
class ProfileBinding extends Bindings {
  @override
  void dependencies() {
    // 页面打开时创建，页面关闭时自动销毁
    Get.lazyPut(() => ProfileController());
  }
}
```

**意图注释**：
- `GetMaterialApp` 替换 `MaterialApp`，启用 GetX 路由系统
- `Get.toNamed()` 无需 BuildContext，可在任意位置调用（如 Controller 中）
- `Binding` 实现页面级依赖注入，避免全局污染

---

## 性能/避坑策略

### 性能优化 Checklist

#### 1. 减少不必要的 Rebuild
```dart
// ❌ 错误：整个页面都会重建
class BadExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final controller = Get.find<CounterController>();
    return Obx(() => Scaffold(
      body: Column(
        children: [
          Text('${controller.count}'), // 只有这里需要响应式
          const ExpensiveWidget(), // 但这个组件也会重建
        ],
      ),
    ));
  }
}

// ✅ 正确：精准控制刷新范围
class GoodExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final controller = Get.find<CounterController>();
    return Scaffold(
      body: Column(
        children: [
          Obx(() => Text('${controller.count}')), // 仅此处重建
          const ExpensiveWidget(), // 不受影响
        ],
      ),
    );
  }
}
```

#### 2. 使用 Workers 监听状态变化
```dart
class UserController extends GetxController {
  final username = ''.obs;

  @override
  void onInit() {
    super.onInit();

    // 每次变化都触发（类似 watch）
    ever(username, (value) => print('用户名变更: $value'));

    // 仅触发一次
    once(username, (value) => print('首次设置用户名: $value'));

    // 防抖：停止输入 1 秒后触发
    debounce(username, (value) => _searchUser(value), time: const Duration(seconds: 1));
  }

  void _searchUser(String name) {
    // 执行搜索逻辑
  }
}
```

### 常见错误避坑指南

#### 错误 1：忘记添加 .obs
```dart
// ❌ 错误：普通变量不会触发更新
class BadController extends GetxController {
  int count = 0; // 缺少 .obs
}

// ✅ 正确
class GoodController extends GetxController {
  final count = 0.obs; // 或使用 RxInt(0)
}
```

#### 错误 2：在 Obx 外部访问 .value
```dart
// ❌ 错误：无法建立依赖关系
Obx(() {
  final c = Get.find<CounterController>();
  final value = c.count.value; // 在外部解包
  return Text('$value');
})

// ✅ 正确：在 Obx 内部直接访问
Obx(() {
  final c = Get.find<CounterController>();
  return Text('${c.count.value}'); // 在内部解包
})
```

#### 错误 3：Controller 未注入就使用
```dart
// ❌ 错误：Get.find() 找不到实例会崩溃
class BadPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final controller = Get.find<MyController>(); // 未提前注入
    // ...
  }
}

// ✅ 正确：先注入再使用
void main() {
  Get.put(MyController()); // 全局注入
  runApp(MyApp());
}

// 或使用懒加载
class GoodPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final controller = Get.put(MyController()); // 首次访问时创建
    // ...
  }
}
```

#### 错误 4：内存泄漏（未释放资源）
```dart
class NetworkController extends GetxController {
  late StreamSubscription _subscription;

  @override
  void onInit() {
    super.onInit();
    _subscription = someStream.listen((data) {
      // 处理数据
    });
  }

  @override
  void onClose() {
    _subscription.cancel(); // 必须手动取消订阅
    super.onClose();
  }
}
```

---

## 多端差异警示

| 平台 | 注意事项 |
|------|---------|
| **Web** | `Get.back()` 不会触发浏览器后退按钮，需手动处理 URL 同步 |
| **iOS** | 侧滑返回手势与 `Get.back()` 可能冲突，需配置 `popGesture: false` |
| **桌面端** | 窗口关闭时需手动调用 `Get.delete()` 清理 Controller |

---

## 生态选型批判

### GetX vs 其他方案

| 方案 | 优势 | 劣势 | 替代成本 |
|------|------|------|---------|
| **Provider** | 官方推荐，生态成熟 | 样板代码多，需 BuildContext | 低（仅状态管理） |
| **BLoC** | 架构清晰，适合大型项目 | 学习曲线陡，代码量大 | 高（需重构架构） |
| **Riverpod** | 类型安全，编译时检查 | 概念抽象，社区较小 | 中（API 相似） |
| **GetX** | 一站式解决方案，上手快 | 过度封装，调试困难 | 中（路由需改造） |

### 维护性评估
- **GitHub Stars**: 10k+（活跃维护）
- **平台兼容性**: 全平台支持（含 Web/Desktop）
- **不用 GetX 的替代方案**：
  - 状态管理 → Provider + ChangeNotifier
  - 路由 → go_router（官方推荐）
  - 依赖注入 → get_it

---

## 面试通关（实战类）

### Q1：GetX 的响应式原理是什么？如何避免过度刷新？
**答案**：
1. **原理**：通过 Dart 的 Proxy 模式（GetxController）+ 观察者模式（Obx）实现
2. **避免过度刷新**：
   - 缩小 Obx 包裹范围，只包裹需要更新的 Widget
   - 使用 `GetBuilder` 替代 `Obx`，手动控制刷新时机
   - 利用 `RepaintBoundary` 隔离重绘区域

### Q2：Get.put() 和 Get.lazyPut() 的区别？何时使用？
**答案**：
- `Get.put()`：立即创建实例，适合全局单例（如网络服务）
- `Get.lazyPut()`：首次使用时创建，适合重量级对象（如数据库）
- **选择依据**：启动性能敏感 → lazyPut；需要预加载 → put

### Q3：如何在 GetX 中实现跨页面状态共享？
**答案**：
```dart
// 1. 全局注入 Controller
void main() {
  Get.put(GlobalUserController(), permanent: true); // permanent 防止自动销毁
  runApp(MyApp());
}

// 2. 任意页面获取
class PageA extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final user = Get.find<GlobalUserController>();
    return Obx(() => Text(user.name.value));
  }
}
```

### Q4：GetX 路由如何传递复杂对象？
**答案**：
```dart
// 方式 1：通过 arguments（推荐）
Get.toNamed('/detail', arguments: User(id: 1, name: 'Alice'));

// 方式 2：通过 parameters（仅支持 String）
Get.toNamed('/detail', parameters: {'id': '1', 'name': 'Alice'});

// 方式 3：通过全局 Controller（适合多页面共享）
Get.put(SelectedUserController()..setUser(user));
```

### Q5：如何测试使用 GetX 的代码？
**答案**：
```dart
void main() {
  setUp(() {
    Get.testMode = true; // 启用测试模式
  });

  tearDown(() {
    Get.reset(); // 清理所有注入的实例
  });

  test('计数器增加', () {
    final controller = CounterController();
    controller.increment();
    expect(controller.count, 1);
  });
}
```

---

## 总结

GetX 是 Flutter 生态中的"瑞士军刀"，适合快速开发和中小型项目。但在大型项目中，需警惕其过度封装带来的调试困难。核心原则：**用 GetX 的便利性，但保持对底层机制的理解**。
