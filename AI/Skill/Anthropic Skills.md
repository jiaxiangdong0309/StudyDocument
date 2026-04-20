# Anthropic Skills

# Anthropic Skills: 核心原理与官方能力解析

### 1. 官方定义与愿景

**Anthropic 官方定义**：Skills 是由**指令、脚本和资源**组成的结构化文件夹，Claude 可以动态加载这些文件夹，以提升其在特定、复杂任务上的表现。

*   **愿景**：通过 Skills，Claude 能够以**可重复、标准化**的方式完成特定领域任务（如财务建模、品牌合规文档生成等），将 AI 从“通用助手”转变为“领域专家”。
    

### 2. Anthropic 提供的官方 Skills 矩阵

目前 Anthropic 在其产品矩阵（如 Claude.ai）中已内置了多项强大的生产力技能，展示了 Skills 架构的上限：

*   **办公套件增强**：
    
    *   **Excel/Word/PPT/PDF**：原生支持专业级的文档生成、排版与数据操纵。
        
*   **金融专业技能 (Financial Services Skills)**：
    
    *   **DCF 建模**：自动构建折现现金流模型，含 WACC 计算与敏感性分析。
        
    *   **可比性分析**：生成同行基准表，提取估值倍数。
        
    *   **尽职调查数据包**：自动将杂乱的数据室文档处理为结构化数据。
        
*   **行业应用**：支持根据公司品牌指南自动生成合规性文档，或遵循特定 SOP 分析数据。
    

### 3. Claude Code 中的 Skills 实战

在 **Claude Code (CLI)** 环境下，Skills 的价值在于“代码即能力”：

*   **自定义扩展**：开发者可以在 `.claude/skills/` 下定义私有技能（如：特定框架的重构逻辑、公司内部 API 的调用封装）。
    
*   **渐进式披露与沙盒执行**：这是 Skills 架构的核心护城河。
    
    *   **分级加载**：仅在需要时加载指令和资源，极致节省上下文 Token。
        
    *   **物理隔离**：所有脚本默认在沙盒中运行，AI 上下文仅保留**执行结果**，而非脚本过程，确保安全且高效。
        

### 4. 工程化与目录规范

1.  **存放位置**：通常位于 `.claude/skills/` 文件夹下。每个子目录即为一个独立 Skill，必须包含 `SKILL.md`。
    
2.  **Git 驱动的工作流**：
    

*   **配置即代码**：Skills 随代码库一同提交（git commit），不同分支可以拥有不同版本的 AI 技能，实现 AI 能力的版本化。
    

1.  **描述工程 (Description Engineering)**：元数据中的 `description` 是技能发现的唯一索引。必须包含明确的场景关键词，以便 AI 精准命中。
    

### 5. 三层结构组成

1.  **元数据 (Frontmatter)**：位于 `SKILL.md` 顶部，定义 `name` 和 `description`。
    
2.  **正文 (Instructions)**：核心 Prompt 逻辑，定义 SOP。
    
3.  **资源 (Resources)**：目录下的辅助脚本和配置文件（如 `.py`, `.sh`, `.json`）。
    

### 6. 技术对比：Skills vs. 其他

| 维度 | Skills | MCP (Model Context Protocol) | Subagents |
| --- | --- | --- | --- |
| **Token 效率** | **极高**。按需加载，未匹配时不占空间。 | **中低**。通常全量注入 JSON Schema。 | **波动**。取决于历史深度。 |
| **定位** | **领域专家**。基于文件的、私有的能力定义。 | **连接器**。标准化的工具与数据连接协议。 | **执行实例**。AI 自生成的任务逻辑。 |
| **核心优势** | 零配置、版本化、低 Token 消耗 | 跨系统连接、生态通用 | 灵活处理多步复杂任务 |

### 7. 开发建议

*   **原子化**：每个 Skill 只专注解决一个特定领域的问题。
    
*   **路径自包含**：Skill 内部引用的脚本和资源应使用相对路径，确保在不同环境下的一致性。
    
*   **跨平台优先 Python**：为了团队协作的一致性，资源脚本建议优先使用 Python 编写。
    

### 8. 官方案例拆解：`frontend-design`

官方提供的这个 Skill 是“能力补全”与“节省 Token”的教科书级案例：

*   **能力补全**：通过内置 `screenshot.py`（基于 Playwright），赋予了 Claude “视觉校验”能力。AI 在修改 UI 后会自动运行截图，并根据图片反馈调整布局，实现了“代码-渲染-纠错”的自动化闭环。
    
*   **上下文剥离**：复杂的浏览器渲染日志被截断在沙盒内，AI 仅获取关键的视觉反馈，确保了在复杂 UI 开发中仍能保持长期的上下文清晰。
    
*   **工程约束**：在 `SKILL.md` 中强制了 Tailwind + Accessibility 的组合策略，确保生成的代码不仅仅是“能跑”，而是符合生产标准。
    

### 9. 总结

Skills 的本质是**将“项目规范”转化为“AI 的本能”**。

*   如果你需要跨系统调数或连接外部工具，选 **MCP**；
    
*   如果你需要 AI 深度参与项目开发、遵循特定架构规范、且对 Token 成本高度敏感，**Skills** 是目前唯一的选型。
    

### 10. 资源与社区 (Resources)

*   **官方文档**：[Anthropic Help - 什么是技能？](https://support.claude.com/zh-CN/articles/12512176-%E4%BB%80%E4%B9%88%E6%98%AF%E6%8A%80%E8%83%BD)
    
*   **社区 Skills 集合**：
    
    *   [claudeskill.top](https://www.claudeskill.top/)：集合了大量高质量的 Claude Skills 资源。
        
    *   [claudeskills.org](https://www.claudeskills.org/zh/)：Agent Skills 学习案例与可复用资源库。
        
    *   [Official Frontend Design Skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design)：文中拆解的官方前端设计技能。