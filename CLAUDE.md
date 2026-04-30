# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目性质

这是一个私人技术知识库，以 Markdown 格式记录 Android、React、Vue、Flutter、Java、CSS、Vite、AI 等领域的学习笔记。所有内容均为中文文档，**不是可编译的软件项目**，没有 build/test/lint 流程。

## 文档结构体系

知识库按技术领域分目录，各领域有固定的文档分层规范：

| 技术领域 | 文档体系 | 核心文件模式 |
|---------|---------|------------|
| Android | 三级：基础篇 / 进阶篇 / 源码篇 | `1-基础篇.md` / `2-进阶篇.md` / `3-源码篇.md` |
| Java | 三级+实战：基础篇 / 进阶篇 / 源码篇 / 实战篇 | `1-基础篇.md` / `2-进阶篇.md` / `3-源码篇.md` / `4-实战篇-xxx.md` |
| React | 两级：基础篇 / 进阶篇 | `1-基础篇.md` / `2-进阶篇.md` |
| Flutter | 双文档：基础使用篇 / 原理讲解篇 | `xxx基础使用篇.md` / `xxx原理篇.md` 或 `性能优化.md` |
| Vue | 原子化：一个文档一个知识点 | 按知识点命名，如 `Vue插槽-Slots详解.md` |
| AI | 概念导向 | 按主题命名 |

各领域通常有一个 `README.md` 作为导航，包含学习路线、知识图谱和文档索引。

## 写作规范

### 通用原则

- **大白话 + 生活类比**：用日常例子解释复杂概念，避免堆砌术语。
- **代码自洽**：示例中用到的类必须给出定义或说明来源，禁止出现未定义的 `MyObserver`、`handleClick` 等。
- **注释讲意图**：注释解释「为什么这样写」，而非「这是什么语法」。
- **图表优先**：流程图、时序图优先使用 Mermaid，抓主干忽略细节。
- **源码轻量**：源码分析最多贴 20-40 行核心代码，重设计思想而非逐行注释。

### 各领域特定规范

**Android / Java**
- 视角：Android 专家级深度，兼顾广度。
- 语言：Kotlin 优先，必要时提供 Java 对照。源码默认基于 JDK 17 和 Android 14 (API 34)。
- 六维度覆盖：技术演进、设计哲学、横向对比、实战经验、边界认知、源码洞察。
- Java 必须关联 Android 应用场景（如集合要对比 ArrayMap/SparseArray）。
- 答案格式：**先说结论 → 再说原理 → 最后用 Android 实例佐证**。

**React**
- 视角：中级工程师，注重实用性和快速掌握。
- 语言：TypeScript + Hooks（函数组件），禁止 Class 组件。
- 四维度覆盖：是什么、什么时候用、如何使用、常见问题。
- 使用真实 Web 业务场景（如用户列表分页、表单验证），禁止孤立的 `const [count, setCount]` 式示例。
- 答案格式：**先说怎么做 → 简单说明为什么**。

**Vue**
- 默认基于 Vue 3 (Script Setup)。
- 原子化原则：一个文档只讲一个核心知识点，代码块每块不超过 40 行。
- 必须包含：解决什么问题、通俗理解（含生活比喻）、工作原理（Mermaid 流程图）、核心代码实战、最佳实践、常见错误。

**Flutter**
- 视角：专家级，兼具工业级实战经验与引擎级原理洞察。
- 语言：Dart 3.x（Records、Pattern matching、Sealed classes）。
- 布局必须体现 **"Constraints down, Sizes up, Parent sets position"**。
- 基础篇涉及交互时必须用 Mermaid 展示状态流转图：`用户操作 -> 状态变更 -> Widget 重建`。
- 原理篇必须涉及 Widget/Element/RenderObject 三棵树中至少两棵的交互。
- 引入第三方库时需评估维护频率、平台兼容性和替代成本。

**AI**
- 注重概念关联，不需要代码示例。
- 重点关注技术发展趋势和伦理社会影响。

### 质量自检清单

写完后检查：
- [ ] 代码示例自洽？用到的类都有定义或来源说明。
- [ ] 关键代码有注释解释「为什么」？
- [ ] 源码不超过 40 行？流程图抓主干？
- [ ] 有没有说清「为什么这么设计」和边界认知？
- [ ] 是否使用了过时的 API？（React 禁止 Class 组件；Android 禁止 AsyncTask/Loader；Flutter 禁止 FlatButton 等废弃组件）

## 参考文件

各领域详细规则见 `.cursor/rules/` 目录：
- [`.cursor/rules/project.mdc`](.cursor/rules/project.mdc) — 项目整体规则
- [`.cursor/rules/common.mdc`](.cursor/rules/common.mdc) — 通用基础规则
- [`.cursor/rules/android.mdc`](.cursor/rules/android.mdc) — Android 规则
- [`.cursor/rules/java.mdc`](.cursor/rules/java.mdc) — Java 规则
- [`.cursor/rules/react.mdc`](.cursor/rules/react.mdc) — React 规则
- [`.cursor/rules/vue.mdc`](.cursor/rules/vue.mdc) — Vue 规则
- [`.cursor/rules/flutter.mdc`](.cursor/rules/flutter.mdc) — Flutter 规则
- [`.cursor/rules/ai.mdc`](.cursor/rules/ai.mdc) — AI 规则
