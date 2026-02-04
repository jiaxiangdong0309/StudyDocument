# ClaudeCode 使用文档

## 概述
ClaudeCode v1.0.111 是一个强大的AI编程助手，具有文件读取、命令执行和文件编辑功能。它可以在当前目录中工作，并需要您的许可来运行命令和编辑文件。

## 使用模式

### 1. REPL模式（交互式会话）
```bash
claude
```
启动交互式会话，可以持续与AI对话。

### 2. 非交互式模式
```bash
claude -p "问题"
```
直接提问并获取答案，无需进入交互模式。

### 3. 帮助命令
```bash
claude -h
```
查看所有命令行选项。

## 常用任务

### 代码相关
- **询问代码工作原理**：`How does foo.py work?`
- **编辑文件**：`Update bar.ts to...`
- **修复错误**：`cargo build`
- **运行命令**：`/help`
- **执行bash命令**：`!ls`

## 交互式模式命令

### 目录和项目管理
- `/add-dir` - 添加新的工作目录
- `/init` - 初始化新的CLAUDE.md文件，包含代码库文档

### 代理和配置管理
- `/agents` - 管理代理配置
- `/config` - 打开配置面板
- `/model` - 设置Claude Code的AI模型
- `/output-style` - 设置输出样式
- `/output-style:new` - 创建自定义输出样式

### 任务和会话管理
- `/bashes` - 列出和管理后台任务
- `/clear` - 清除对话历史并释放上下文
- `/compact` - 清除对话历史但保留摘要
  - 可选：`/compact [摘要说明]`
- `/todos` - 列出当前待办事项
- `/resume` - 恢复对话

### 状态和监控
- `/context` - 可视化当前上下文使用情况（彩色网格）
- `/cost` - 显示当前会话的总成本和持续时间
- `/status` - 显示Claude Code状态（版本、模型、账户、API连接性、工具状态）
- `/statusline` - 设置Claude Code的状态行UI

### 账户和认证
- `/login` - 使用Anthropic账户登录
- `/logout` - 从Anthropic账户登出
- `/upgrade` - 升级到Max以获得更高的速率限制和更多Opus功能

### 集成和工具
- `/mcp` - 管理MCP服务器
- `/memory` - 编辑Claude内存文件
- `/hooks` - 管理工具事件的钩子配置
- `/ide` - 管理IDE集成并显示状态
- `/permissions` - 管理允许和拒绝工具权限规则

### GitHub集成
- `/install-github-app` - 为仓库设置Claude GitHub Actions
- `/pr-comments` - 从GitHub拉取请求获取评论
- `/review` - 审查拉取请求
- `/security-review` - 完成当前分支上待更改的安全审查

### 导出和反馈
- `/export` - 将当前对话导出到文件或剪贴板
- `/feedback` - 提交关于Claude Code的反馈

### 系统维护
- `/doctor` - 诊断和验证Claude Code安装和设置
- `/migrate-installer` - 从全局npm安装迁移到本地安装
- `/release-notes` - 查看发布说明
- `/terminal-setup` - 安装Shift+Enter键绑定用于换行
- `/vim` - 在Vim和普通编辑模式之间切换

### 会话控制
- `/exit` - 退出REPL

## 最佳实践

1. **代码审查**：始终审查Claude的响应，特别是在运行代码时
2. **权限管理**：Claude需要您的许可才能运行命令和编辑文件
3. **上下文管理**：使用`/context`监控上下文使用情况
4. **任务跟踪**：使用`/todos`管理待办事项
5. **成本控制**：使用`/cost`监控会话成本

## 注意事项

- Claude Code具有文件读取权限
- 需要明确许可才能运行命令和编辑文件
- 建议定期审查AI的响应
- 可以通过`/help`命令随时获取帮助

## 快速开始指南

### 1. 安装和设置
```bash
# 安装ClaudeCode
npm install -g claude-code

# 登录账户
claude
/login
```

### 2. 基本使用
```bash
# 启动交互式会话
claude

# 询问代码问题
How does this function work?

# 编辑文件
Update the login function to add error handling

# 运行命令
!npm install
```

### 3. 项目管理
```bash
# 初始化项目文档
/init

# 查看当前状态
/status

# 管理待办事项
/todos
```

## 故障排除

### 常见问题
1. **权限问题**：确保给予Claude Code必要的文件访问权限
2. **API连接**：使用`/status`检查API连接状态
3. **上下文超限**：使用`/compact`清理上下文或`/clear`重置会话

### 获取帮助
- 使用`/help`获取命令帮助
- 使用`/doctor`诊断安装问题
- 使用`/feedback`提交问题反馈

---

*本文档基于ClaudeCode v1.0.111版本编写，如有更新请参考官方文档。*
