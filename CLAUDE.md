# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个个人技术学习笔记项目，使用React构建的单页应用程序。该项目展示了各种技术的学习笔记，包括Android、Java、Flutter、Vue和AI等领域。此项目最初是作为VitePress文档网站开始的，但已在最近的提交中改为常规React项目。

## 项目结构

- `src/`: 主要源代码目录
  - `components/`: React组件 (Header, Sidebar, ContentDisplay)
  - `pages/`: 页面组件 (Home, AndroidPage, JavaPage, FlutterPage, VuePage, AIPage)
  - `docu/`: 存储实际的学习资料文档（按技术分类）
  - `styles/`: 样式文件

## 开发命令

以下是在此代码库中进行开发的常用命令：

- `npm run dev` 或 `yarn dev`: 启动开发服务器，默认端口3000
- `npm run build` 或 `yarn build`: 构建生产版本
- `npm run serve` 或 `yarn serve`: 预览生产构建
- `npm test` 或 `yarn test`: 运行测试（注意：当前未配置任何测试）

## 项目架构

- 使用React和React Router实现单页应用程序(SPA)
- 使用React Markdown库渲染学习资料的Markdown内容
- 内容目前在src/components/ContentDisplay.jsx中以模拟数据形式硬编码
- 路由结构包括主页以及Android、Java、Flutter、Vue和AI等技术专题页面
- 样式使用外部CSS文件实现

## 文件说明

学习资料主要存储在`src/docu/`目录下，按技术类别组织。虽然这些文档存在于文件系统中，但当前应用程序通过模拟数据提供内容。若需连接真实文档，需要修改`ContentDisplay.jsx`组件以从文件系统读取和显示实际的文档内容。

## 重要注意事项

- 当前的ContentDisplay.jsx组件使用模拟数据来展示内容，而非直接从src/docu/目录读取真实文档
- 如果要实现从文件系统动态加载文档的功能，需要修改`ContentDisplay.jsx`组件以集成实际的文档文件
- 项目缺少测试配置，需要扩展测试套件以提高代码质量保证

## 规则文档

当你需要为特定技术领域编写或整理知识点文档时，必须首先查看`.cursor/rules/`目录下的对应规则文档：

- **Android 相关**：参考 `.cursor/rules/android.mdc`
- **Java 相关**：参考 `.cursor/rules/java.mdc`
- **AI 相关**：参考 `.cursor/rules/ai.mdc`
- **React 相关**：参考 `.cursor/rules/react.mdc`
- **Vue 相关**：参考 `.cursor/rules/vue.mdc`
- **通用规则**：参考 `.cursor/rules/common.mdc`

这些规则文档详细说明了每个技术领域的写作规范、内容结构、示例代码风格等要求。在开始编写任何知识点文档之前，必须先阅读对应的规则文档，以确保内容符合项目要求和质量标准。