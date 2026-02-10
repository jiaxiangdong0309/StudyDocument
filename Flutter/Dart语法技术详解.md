# Dart 语法技术详解

## 1. 基础语法

### 1.1 变量声明

```dart
// var - 类型推断
var name = 'John';
var age = 25;

// 显式类型声明
String city = 'Beijing';
int count = 10;
double price = 99.99;
bool isActive = true;

// dynamic - 动态类型
dynamic value = 'Hello';
value = 42; // 可以改变类型

// Object - 所有类型的基类
Object obj = 'Any type';

// final - 运行时常量（只能赋值一次）
final String country = 'China';
final timestamp = DateTime.now();

// const - 编译时常量
const double pi = 3.14159;
const List<int> numbers = [1, 2, 3];
```

### 1.2 空安全（Null Safety）

```dart
// 可空类型（Nullable）
String? nullableName;
int? nullableAge;

// 非空类型（Non-nullable）
String name = 'John'; // 必须初始化

// 空值检查
String? text;
print(text?.length); // 安全调用，返回 null
print(text ?? 'default'); // 空值合并运算符

// 空断言
String? value = 'Hello';
print(value!.length); // 断言 value 不为 null

// late 延迟初始化
late String description;
void init() {
  description = 'Initialized';
}
```

## 2. 数据类型

### 2.1 数字类型

```dart
// int - 整数
int integer = 42;
int hex = 0xDEADBEEF;

// double - 浮点数
double decimal = 3.14;
double exponent = 1.42e5;

// num - int 和 double 的父类
num value = 10;
value = 10.5;

// 数字操作
int a = 10, b = 3;
print(a + b);  // 13
print(a - b);  // 7
print(a * b);  // 30
print(a / b);  // 3.333...
print(a ~/ b); // 3 (整除)
print(a % b);  // 1 (取模)

// 类型转换
int.parse('42');
double.parse('3.14');
42.toString();
3.14.toStringAsFixed(2); // "3.14"
```

### 2.2 字符串

```dart
// 字符串声明
String single = 'Single quotes';
String double = "Double quotes";
String multiline = '''
Multiple
lines
''';

// 字符串插值
String name = 'John';
int age = 25;
print('Name: $name, Age: $age');
print('Next year: ${age + 1}');

// 字符串拼接
String full = 'Hello' + ' ' + 'World';
String adjacent = 'Hello' ' ' 'World'; // 相邻字符串自动拼接

// 原始字符串
String raw = r'C:\Users\name'; // 不转义

// 字符串方法
'hello'.toUpperCase();        // 'HELLO'
'HELLO'.toLowerCase();        // 'hello'
'  text  '.trim();           // 'text'
'hello'.contains('ell');     // true
'hello'.startsWith('he');    // true
'hello'.endsWith('lo');      // true
'hello'.substring(1, 4);     // 'ell'
'a,b,c'.split(',');          // ['a', 'b', 'c']
'hello'.replaceAll('l', 'L'); // 'heLLo'
```

### 2.3 布尔类型

```dart
bool isTrue = true;
bool isFalse = false;

// 逻辑运算
bool a = true, b = false;
print(a && b);  // false (与)
print(a || b);  // true (或)
print(!a);      // false (非)
```

### 2.4 列表（List）

```dart
// 列表声明
List<int> numbers = [1, 2, 3, 4, 5];
var names = ['Alice', 'Bob', 'Charlie'];
List<dynamic> mixed = [1, 'two', 3.0];

// 可增长列表
var list = [1, 2, 3];
list.add(4);
list.addAll([5, 6]);

// 固定长度列表
var fixed = List.filled(3, 0); // [0, 0, 0]

// 列表操作
list[0];              // 访问元素
list.length;          // 长度
list.isEmpty;         // 是否为空
list.isNotEmpty;      // 是否不为空
list.first;           // 第一个元素
list.last;            // 最后一个元素
list.add(7);          // 添加元素
list.insert(0, -1);   // 插入元素
list.remove(3);       // 删除指定元素
list.removeAt(0);     // 删除指定位置
list.clear();         // 清空
list.contains(2);     // 是否包含
list.indexOf(3);      // 查找索引

// 展开运算符
var list1 = [1, 2, 3];
var list2 = [0, ...list1, 4]; // [0, 1, 2, 3, 4]
var list3 = [0, ...?list1, 4]; // 空安全展开

// 集合 if 和 for
var nav = [
  'Home',
  if (isLoggedIn) 'Profile',
  if (isAdmin) 'Settings',
];

var listOfInts = [1, 2, 3];
var listOfStrings = [
  '#0',
  for (var i in listOfInts) '#$i'
]; // ['#0', '#1', '#2', '#3']
```

### 2.5 集合（Set）

```dart
// Set 声明（无序、不重复）
Set<int> numbers = {1, 2, 3, 4, 5};
var names = {'Alice', 'Bob', 'Charlie'};

// Set 操作
numbers.add(6);
numbers.addAll({7, 8});
numbers.remove(1);
numbers.contains(3);
numbers.length;

// 集合运算
var set1 = {1, 2, 3};
var set2 = {3, 4, 5};
set1.union(set2);        // {1, 2, 3, 4, 5}
set1.intersection(set2); // {3}
set1.difference(set2);   // {1, 2}
```

### 2.6 映射（Map）

```dart
// Map 声明
Map<String, int> ages = {
  'Alice': 25,
  'Bob': 30,
  'Charlie': 35,
};

var scores = {
  'math': 95,
  'english': 88,
};

// Map 操作
ages['Alice'];           // 访问值
ages['David'] = 28;      // 添加/更新
ages.remove('Bob');      // 删除
ages.containsKey('Alice'); // 是否包含键
ages.containsValue(25);  // 是否包含值
ages.keys;               // 所有键
ages.values;             // 所有值
ages.length;             // 长度
ages.isEmpty;            // 是否为空

// 遍历 Map
ages.forEach((key, value) {
  print('$key: $value');
});
```

### 2.7 Runes 和 Symbols

```dart
// Runes - Unicode 字符
var heart = '\u2665';
var laugh = '\u{1f600}'; // 😀
Runes input = Runes('\u2665 \u{1f605}');

// Symbols - 标识符
Symbol sym = #mySymbol;
```

## 3. 运算符

### 3.1 算术运算符

```dart
int a = 10, b = 3;
a + b;   // 13 加
a - b;   // 7  减
a * b;   // 30 乘
a / b;   // 3.333... 除
a ~/ b;  // 3  整除
a % b;   // 1  取模
-a;      // -10 取负

// 自增自减
var i = 0;
i++;     // 后置自增
++i;     // 前置自增
i--;     // 后置自减
--i;     // 前置自减
```

### 3.2 关系运算符

```dart
a == b;  // 相等
a != b;  // 不相等
a > b;   // 大于
a < b;   // 小于
a >= b;  // 大于等于
a <= b;  // 小于等于
```

### 3.3 类型测试运算符

```dart
var value = 'Hello';
value is String;     // true
value is! int;       // true
value as String;     // 类型转换
```

### 3.4 赋值运算符

```dart
var a = 10;
a = 5;    // 赋值
a += 5;   // a = a + 5
a -= 5;   // a = a - 5
a *= 5;   // a = a * 5
a ~/= 5;  // a = a ~/ 5
a ??= 5;  // 如果 a 为 null，则赋值
```

### 3.5 逻辑运算符

```dart
!expr;      // 逻辑非
expr1 && expr2;  // 逻辑与
expr1 || expr2;  // 逻辑或
```

### 3.6 位运算符

```dart
a & b;   // 按位与
a | b;   // 按位或
a ^ b;   // 按位异或
~a;      // 按位取反
a << 2;  // 左移
a >> 2;  // 右移
```

### 3.7 条件运算符

```dart
// 三元运算符
var result = condition ? expr1 : expr2;

// 空值合并
var value = nullableValue ?? defaultValue;
```

### 3.8 级联运算符

```dart
// 级联运算符 (..)
var paint = Paint()
  ..color = Colors.blue
  ..strokeWidth = 5.0
  ..style = PaintingStyle.stroke;

// 空安全级联 (?..)
querySelector('#button')
  ?..text = 'Click'
  ..onClick.listen((e) => print('Clicked'));
```

## 4. 控制流

### 4.1 条件语句

```dart
// if-else
if (condition) {
  // 代码
} else if (anotherCondition) {
  // 代码
} else {
  // 代码
}

// switch-case
switch (value) {
  case 1:
    print('One');
    break;
  case 2:
    print('Two');
    break;
  default:
    print('Other');
}

// switch 表达式（Dart 3.0+）
var result = switch (value) {
  1 => 'One',
  2 => 'Two',
  _ => 'Other',
};
```

### 4.2 循环语句

```dart
// for 循环
for (var i = 0; i < 5; i++) {
  print(i);
}

// for-in 循环
var list = [1, 2, 3];
for (var item in list) {
  print(item);
}

// forEach
list.forEach((item) {
  print(item);
});

// while 循环
var i = 0;
while (i < 5) {
  print(i);
  i++;
}

// do-while 循环
var j = 0;
do {
  print(j);
  j++;
} while (j < 5);

// break 和 continue
for (var i = 0; i < 10; i++) {
  if (i == 5) break;    // 跳出循环
  if (i % 2 == 0) continue; // 跳过本次循环
  print(i);
}
```

### 4.3 异常处理

```dart
// try-catch
try {
  var result = 10 ~/ 0;
} catch (e) {
  print('Error: $e');
}

// 捕获特定异常
try {
  // 代码
} on FormatException catch (e) {
  print('Format error: $e');
} on Exception catch (e) {
  print('Exception: $e');
} catch (e) {
  print('Unknown error: $e');
}

// finally
try {
  // 代码
} catch (e) {
  print('Error: $e');
} finally {
  print('Always executed');
}

// 抛出异常
throw FormatException('Invalid format');
throw 'Custom error message';

// 重新抛出
try {
  // 代码
} catch (e) {
  print('Logging error: $e');
  rethrow;
}
```

## 5. 函数

### 5.1 函数定义

```dart
// 基本函数
int add(int a, int b) {
  return a + b;
}

// 箭头函数（单表达式）
int multiply(int a, int b) => a * b;

// 无返回值
void printMessage(String msg) {
  print(msg);
}

// 可选位置参数
String greet(String name, [String? title]) {
  return title != null ? '$title $name' : name;
}

// 可选命名参数
void configure({String? host, int? port}) {
  print('Host: $host, Port: $port');
}

// 必需命名参数
void login({required String username, required String password}) {
  print('Login: $username');
}

// 默认参数值
void connect({String host = 'localhost', int port = 8080}) {
  print('Connecting to $host:$port');
}

// 混合参数
void process(String name, {int? age, String city = 'Beijing'}) {
  print('$name, $age, $city');
}
```

### 5.2 匿名函数

```dart
// 匿名函数
var list = [1, 2, 3];
list.forEach((item) {
  print(item);
});

// 箭头函数
list.map((item) => item * 2);

// 函数作为参数
void execute(Function callback) {
  callback();
}

execute(() => print('Executed'));
```

### 5.3 闭包

```dart
// 闭包
Function makeAdder(int addBy) {
  return (int i) => i + addBy;
}

var add2 = makeAdder(2);
print(add2(3)); // 5
```

### 5.4 高阶函数

```dart
// 函数作为返回值
Function multiplier(int factor) {
  return (int value) => value * factor;
}

// 函数作为参数
List<int> filter(List<int> list, bool Function(int) test) {
  return list.where(test).toList();
}

var numbers = [1, 2, 3, 4, 5];
var evens = filter(numbers, (n) => n % 2 == 0);
```

## 6. 类与对象

### 6.1 类定义

```dart
// 基本类
class Person {
  String name;
  int age;

  // 构造函数
  Person(this.name, this.age);

  // 方法
  void introduce() {
    print('I am $name, $age years old');
  }
}

// 使用类
var person = Person('John', 25);
person.introduce();
```

### 6.2 构造函数

```dart
class Point {
  double x, y;

  // 标准构造函数
  Point(this.x, this.y);

  // 命名构造函数
  Point.origin()
      : x = 0,
        y = 0;

  Point.fromJson(Map<String, double> json)
      : x = json['x']!,
        y = json['y']!;

  // 重定向构造函数
  Point.alongXAxis(double x) : this(x, 0);

  // 常量构造函数
  const Point.zero()
      : x = 0,
        y = 0;

  // 工厂构造函数
  factory Point.fromPolar(double r, double theta) {
    return Point(r * cos(theta), r * sin(theta));
  }
}
```

### 6.3 Getter 和 Setter

```dart
class Rectangle {
  double width, height;

  Rectangle(this.width, this.height);

  // Getter
  double get area => width * height;

  // Setter
  set area(double value) {
    width = sqrt(value);
    height = sqrt(value);
  }

  // 只读属性
  double get perimeter => 2 * (width + height);
}
```

### 6.4 继承

```dart
// 父类
class Animal {
  String name;

  Animal(this.name);

  void makeSound() {
    print('Some sound');
  }
}

// 子类
class Dog extends Animal {
  String breed;

  Dog(String name, this.breed) : super(name);

  @override
  void makeSound() {
    print('Woof!');
  }

  void fetch() {
    print('Fetching...');
  }
}
```

### 6.5 抽象类

```dart
// 抽象类
abstract class Shape {
  // 抽象方法
  double calculateArea();
  double calculatePerimeter();

  // 普通方法
  void display() {
    print('Area: ${calculateArea()}');
  }
}

// 实现抽象类
class Circle extends Shape {
  double radius;

  Circle(this.radius);

  @override
  double calculateArea() => pi * radius * radius;

  @override
  double calculatePerimeter() => 2 * pi * radius;
}
```

### 6.6 接口

```dart
// Dart 中每个类都隐式定义了一个接口
class Printable {
  void printData() {
    print('Printing...');
  }
}

// 实现接口
class Document implements Printable {
  @override
  void printData() {
    print('Printing document...');
  }
}

// 实现多个接口
class Report implements Printable, Comparable {
  @override
  void printData() {
    print('Printing report...');
  }

  @override
  int compareTo(other) => 0;
}
```

### 6.7 Mixin

```dart
// Mixin 定义
mixin Flyable {
  void fly() {
    print('Flying...');
  }
}

mixin Swimmable {
  void swim() {
    print('Swimming...');
  }
}

// 使用 Mixin
class Duck extends Animal with Flyable, Swimmable {
  Duck(String name) : super(name);
}

var duck = Duck('Donald');
duck.fly();
duck.swim();

// Mixin 约束
mixin Walkable on Animal {
  void walk() {
    print('$name is walking');
  }
}
```

### 6.8 扩展方法

```dart
// 扩展现有类
extension StringExtension on String {
  String capitalize() {
    return '${this[0].toUpperCase()}${substring(1)}';
  }

  bool get isEmail => contains('@');
}

// 使用扩展
var name = 'john';
print(name.capitalize()); // 'John'
print('test@example.com'.isEmail); // true
```

### 6.9 枚举

```dart
// 基本枚举
enum Color {
  red,
  green,
  blue,
}

// 使用枚举
var color = Color.red;
print(color.index); // 0
print(color.name);  // 'red'

// 增强枚举（Dart 2.17+）
enum Planet {
  mercury(3.7, 0.055),
  venus(8.87, 0.815),
  earth(9.81, 1.0);

  final double gravity;
  final double mass;

  const Planet(this.gravity, this.mass);

  void describe() {
    print('Gravity: $gravity, Mass: $mass');
  }
}

Planet.earth.describe();
```

## 7. 泛型

### 7.1 泛型类

```dart
// 泛型类
class Box<T> {
  T value;

  Box(this.value);

  T getValue() => value;
}

var intBox = Box<int>(42);
var stringBox = Box<String>('Hello');
```

### 7.2 泛型方法

```dart
// 泛型方法
T first<T>(List<T> list) {
  return list[0];
}

var firstInt = first<int>([1, 2, 3]);
var firstString = first(['a', 'b', 'c']);
```

### 7.3 泛型约束

```dart
// 约束泛型类型
class Cache<T extends Object> {
  final Map<String, T> _cache = {};

  void set(String key, T value) {
    _cache[key] = value;
  }

  T? get(String key) {
    return _cache[key];
  }
}
```

## 8. 异步编程

### 8.1 Future

```dart
// 创建 Future
Future<String> fetchData() {
  return Future.delayed(
    Duration(seconds: 2),
    () => 'Data loaded',
  );
}

// 使用 then
fetchData().then((data) {
  print(data);
}).catchError((error) {
  print('Error: $error');
});

// async/await
Future<void> loadData() async {
  try {
    var data = await fetchData();
    print(data);
  } catch (e) {
    print('Error: $e');
  }
}

// 并行执行
Future<void> loadMultiple() async {
  var results = await Future.wait([
    fetchData(),
    fetchData(),
    fetchData(),
  ]);
  print(results);
}
```

### 8.2 Stream

```dart
// 创建 Stream
Stream<int> countStream(int max) async* {
  for (var i = 1; i <= max; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}

// 监听 Stream
countStream(5).listen(
  (data) => print(data),
  onError: (error) => print('Error: $error'),
  onDone: () => print('Done'),
);

// async* 和 await for
Future<void> processStream() async {
  await for (var value in countStream(5)) {
    print('Received: $value');
  }
}

// Stream 转换
var stream = Stream.fromIterable([1, 2, 3, 4, 5]);
stream
    .where((n) => n % 2 == 0)
    .map((n) => n * 2)
    .listen(print);

// StreamController
var controller = StreamController<int>();
controller.stream.listen(print);
controller.add(1);
controller.add(2);
controller.close();
```

## 9. 库和导入

### 9.1 导入库

```dart
// 导入核心库
import 'dart:math';
import 'dart:async';
import 'dart:convert';

// 导入包
import 'package:flutter/material.dart';

// 导入文件
import 'utils/helper.dart';
import '../models/user.dart';

// 指定前缀
import 'package:lib1/lib1.dart' as lib1;
import 'package:lib2/lib2.dart' as lib2;

// 部分导入
import 'package:lib/lib.dart' show foo, bar;
import 'package:lib/lib.dart' hide baz;

// 延迟加载
import 'package:heavy_lib/heavy_lib.dart' deferred as heavy;

Future<void> loadHeavy() async {
  await heavy.loadLibrary();
  heavy.someFunction();
}
```

### 9.2 导出库

```dart
// lib/my_library.dart
library my_library;

export 'src/foo.dart';
export 'src/bar.dart' show Bar;
export 'src/baz.dart' hide Baz;
```

### 9.3 Part

```dart
// main.dart
part 'part1.dart';
part 'part2.dart';

// part1.dart
part of 'main.dart';

void function1() {
  // 代码
}
```

## 10. 元数据和注解

```dart
// 内置注解
@override
void method() {}

@deprecated
void oldMethod() {}

@Deprecated('Use newMethod instead')
void anotherOldMethod() {}

// 自定义注解
class Todo {
  final String who;
  final String what;

  const Todo(this.who, this.what);
}

@Todo('John', 'Implement this feature')
void someFunction() {}
```

## 11. 模式匹配（Dart 3.0+）

```dart
// Switch 表达式
String describe(int value) {
  return switch (value) {
    0 => 'zero',
    1 => 'one',
    2 => 'two',
    _ => 'many',
  };
}

// 解构
var (a, b) = (1, 2);
var [first, second, ...rest] = [1, 2, 3, 4, 5];
var {'name': name, 'age': age} = {'name': 'John', 'age': 25};

// If-case
if (value case [var first, var second]) {
  print('$first, $second');
}

// 记录类型（Records）
(int, String) record = (42, 'answer');
var (number, text) = record;

// 命名记录
({int id, String name}) user = (id: 1, name: 'John');
print(user.id);
print(user.name);
```

## 12. 常用技巧

### 12.1 类型判断和转换

```dart
var value = 'Hello';

// 类型判断
if (value is String) {
  print(value.length);
}

// 类型转换
var number = value as int; // 可能抛出异常
```

### 12.2 空安全技巧

```dart
String? nullable;

// 空值合并
var result = nullable ?? 'default';

// 空值赋值
nullable ??= 'value';

// 安全调用
var length = nullable?.length;

// 级联空安全
nullable
  ?..trim()
  ..toLowerCase();
```

### 12.3 集合操作

```dart
var list = [1, 2, 3, 4, 5];

// 常用方法
list.map((e) => e * 2);
list.where((e) => e % 2 == 0);
list.reduce((a, b) => a + b);
list.fold(0, (sum, e) => sum + e);
list.any((e) => e > 3);
list.every((e) => e > 0);
list.firstWhere((e) => e > 3);
list.take(3);
list.skip(2);
```

### 12.4 字符串处理

```dart
var text = 'Hello World';

text.split(' ');
text.replaceAll('World', 'Dart');
text.substring(0, 5);
text.contains('Hello');
text.startsWith('He');
text.endsWith('ld');
text.toLowerCase();
text.toUpperCase();
text.trim();
```

## 总结

Dart 是一门现代化的面向对象编程语言，具有以下特点：

1. **强类型系统**：支持类型推断和空安全
2. **面向对象**：类、继承、接口、Mixin
3. **函数式编程**：高阶函数、闭包、Lambda
4. **异步编程**：Future、Stream、async/await
5. **泛型支持**：类型安全的集合和方法
6. **现代语法**：模式匹配、记录类型、扩展方法

掌握这些语法特性，能够高效地使用 Dart 进行 Flutter 开发和其他应用开发。
