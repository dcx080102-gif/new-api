# 发现与决策 — New API 前端

> 📅 最后更新：2026-06-09  
> 🎯 记录所有设计调研、技术决策、踩坑经验、参考灵感  
> ⚠️ 规则：每做 2 次浏览/搜索操作后，必须往这里记东西

---

## 一、当前状态评估（基线）

### 1.1 已实现的功能

根据 `src/routes/` 和 `src/features/` 的分析：

| 模块 | 状态 | 备注 |
|------|------|------|
| 🏠 首页 | ✅ 已有 | `features/home` |
| 📊 仪表盘 | ✅ 已有 | 分 section 展示 |
| 🔐 认证系统 | ✅ 已有 | 登录/注册/OAuth/忘记密码/验证码 |
| 🤖 模型列表 | ✅ 已有 | 按 section 分类 |
| 🔑 API Key 管理 | ✅ 已有 | 创建/复制/隐藏 |
| 🔌 渠道管理 | ✅ 已有 | 管理员功能 |
| 📋 用量日志 | ✅ 已有 | 分类展示 |
| 👥 用户管理 | ✅ 已有 | 表格+抽屉+批量操作 |
| 💳 钱包/充值 | ✅ 已有 | 多种支付方式 |
| 🎫 兑换码 | ✅ 已有 | 兑换功能 |
| 💬 AI 对话 | ✅ 已有 | `chat/$chatId` + playground |
| ⚙️ 系统设置 | ✅ 已有 | 7 个子模块（站点/认证/模型/计费/安全/内容/运维） |
| 🌐 国际化 | ✅ 已有 | 6 种语言 (zh/en/fr/ru/ja/vi) |
| 🌙 暗色模式 | ✅ 已有 | `next-themes` |
| 📱 定价页 | ✅ 已有 | 含模型详情 |
| 🏆 排行榜 | ✅ 已有 | |
| 📖 关于页 | ✅ 已有 | |
| ⚙️ 初始化向导 | ✅ 已有 | `/setup` |

### 1.2 技术债 / 待改进项

| 项 | 严重度 | 说明 |
|----|--------|------|
| Bun 未安装 | 🔴 高 | 当前环境 `bun` 不在 PATH，需先安装 |
| 移动端适配 | 🟡 中 | 部分表格和复杂表单在手机上体验待验证 |
| 加载状态统一 | 🟡 中 | 不是所有页面都有 Skeleton/Loading 状态 |
| 空状态统一 | 🟡 中 | 列表为空时的引导提示不统一 |
| 无障碍 | 🟢 低 | 尚未系统性地做过 a11y 审计 |
| 测试覆盖率 | 🟢 低 | 当前测试覆盖情况待评估 |

---

## 二、设计研究

### 2.1 竞品参考

> 以下平台是 New API 的同类产品或其 UI 值得参考的项目。

| 平台 | 值得学习的地方 | URL |
|------|--------------|-----|
| **OpenAI Platform** | Playground 交互设计、API Key 管理流程 | platform.openai.com |
| **Anthropic Console** | 简洁的 Workbench 设计、暗色主题 | console.anthropic.com |
| **Vercel** | 仪表盘布局、项目卡片设计 | vercel.com/dashboard |
| **Stripe Dashboard** | 数据可视化、支付流程、错误处理 | dashboard.stripe.com |
| **LobeHub** | AI 对话 UI、模型选择交互 | lobehub.com |
| **Cloudflare Dashboard** | 侧边栏导航、设置页组织 | dash.cloudflare.com |

### 2.2 设计灵感（Dribbble / 设计趋势）

| 灵感 | 参考点 | 是否采纳 |
|------|--------|---------|
| Dashboard 卡片式布局 | Stripe / Vercel 风格 | ✅ 当前方向 |
| 对话式 Playground | OpenAI Playground | ✅ 已有 |
| 渐变色 + 玻璃拟态 | 2024-2026 趋势 | ⚠️ 适量使用，不过度 |
| 骨架屏加载 (Skeleton) | 行业标准 | ✅ 计划统一 |

### 2.3 UI 组件参考

本项目组件风格参考 **shadcn/ui**（但不是直接用，而是基于 Base UI 自己实现）：
- 组件 API 风格参考 shadcn
- 视觉风格参考 Linear / Vercel（简洁、克制）
- 暗色模式参考 Tailwind CSS `dark:` 变量方案

---

## 三、技术决策记录

### 已有决策（来自 AGENTS.md）

| 决策 | 理由 |
|------|------|
| 用 Bun 而非 npm/yarn/pnpm | Bun 快 10-25x，原生支持 TypeScript |
| 用 Base UI 而非 Radix UI | 更底层、无样式预设、更灵活 |
| 用 TanStack Router 而非 React Router | 类型安全、文件系统路由、搜索参数校验 |
| 用 Rsbuild 而非 Vite | 构建更快（Rspack），与项目更契合 |
| 用 i18next 做国际化 | 生态成熟，支持 6 种语言 |
| 用 Zustand 做状态管理 | 轻量、无 boilerplate、Selector 防重渲染 |
| 用 Zod 做表单校验 | 类型安全、与 TS 深度集成 |

### 新增决策

| 决策 | 理由 | 日期 |
|------|------|------|
| 用 Hugeicons + Lucide 双图标库 | Hugeicons 覆盖全面，Lucide 作补充 | 已有 |
| 暗色模式用 CSS 变量 + Tailwind `dark:` | 比 JS 方案性能好 | 已有 |
| 大列表用 @tanstack/react-virtual | 100+ 条数据不卡 | 已有 |

---

## 四、约束条件

### 4.1 技术约束

| 约束 | 详情 |
|------|------|
| 浏览器兼容 | 现代浏览器（Chrome/Firefox/Safari/Edge 最近 2 个版本），不需要支持 IE |
| 包管理 | 必须用 Bun（AGENTS.md Rule 3） |
| TypeScript | 严格模式，避免 `any`（AGENTS.md 3.2） |
| i18n | 所有面向用户文案必须走 `t()`（AGENTS.md 3.1） |
| 类型检查 | 每次改动 TS/TSX 后跑 `bun run typecheck`（AGENTS.md 3.2） |

### 4.2 设计约束

| 约束 | 详情 |
|------|------|
| 品牌名 | new-api / QuantumNous 不可修改或删除（AGENTS.md Rule 5） |
| 许可证 | AGPL v3（前端代码也受影响） |
| 主题系统 | 必须支持亮色/暗色双模式 |
| 响应式 | 至少支持桌面 (1920px) + 平板 (768px) + 手机 (375px) |

### 4.3 环境约束

| 约束 | 详情 |
|------|------|
| 网络 | 中国国内环境，GitHub 直连被墙，需镜像 |
| 系统 | Windows 10，Git Bash (MSYS2) |
| 当前无 Bun | 需先安装 Bun |

---

## 五、问题与风险

### 已识别问题

| # | 问题 | 严重度 | 状态 | 解决方案 |
|---|------|--------|------|---------|
| 1 | Bun 未安装 | 🔴 高 | 待解决 | `powershell -c "irm bun.sh/install.ps1 \| iex"` |
| 2 | 国内网络，npm 包可能下载慢 | 🟡 中 | 待关注 | 可能需要配置 npm 镜像源 |
| 3 | 前端是否完整运行过？ | 🔴 高 | 待验证 | 装完 Bun 后跑 `bun install && bun run dev` |

---

## 六、资源链接

| 资源 | 链接 |
|------|------|
| New API 官方文档 | https://www.newapi.ai/zh/docs |
| New API GitHub (原仓库) | https://github.com/QuantumNous/new-api |
| New API AtomGit 镜像 | https://atomgit.com/QuantumNous/new-api.git |
| shadcn/ui 参考 | https://ui.shadcn.com |
| Base UI 文档 | https://base-ui.com/react |
| Tailwind CSS v4 | https://tailwindcss.com/docs |
| TanStack Router | https://tanstack.com/router |
| TanStack Query | https://tanstack.com/query |
| Recharts | https://recharts.org |
| Hugeicons | https://hugeicons.com |

---

> 📌 这个文件是"学习和发现的笔记本"——看到好的设计、遇到新的坑、做了技术决策，都往这里记。  
> 📎 配套文件：`task_plan.md`（任务计划）+ `progress.md`（进度日志）
