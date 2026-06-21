# 任务 2：模型卡片改全宽长矩形

项目路径：C:\Users\lenovo\new-api-app\web\default\
技术栈：React 19 + TypeScript + Tailwind CSS + i18next
参照设计：https://ofox.ai/zh/models 的卡片风格
运行：cd web/default && bun run dev
改完跑：bun run typecheck

---

## 子任务 A：重写 model-card.tsx

文件：src/features/pricing/components/model-card.tsx

### 设计目标
将方形网格卡片改为全宽水平长矩形卡片，类似 OfoxAI 模型的每行布局。

### 具体布局（从左到右）

```
┌─────────────────────────────────────────────────────────────────────┐
│ [图标] 模型名  [协议标签]    model_id  [📋复制]    发布日期         │
│         上下文128K  最大输出16K  知识截止2025.06                      │
│         输入 ¥0.5/M  ·  输出 ¥2.0/M  ·  缓存读取 ¥0.1/M           │
│         [Vision] [Function] [Reasoning] [Cache]  [+2 more]          │
└─────────────────────────────────────────────────────────────────────┘
```

### 实现细节

1. 最外层：`w-full rounded-xl border bg-card p-4 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5`

2. 第一行（flex items-center gap-3 flex-wrap）：
   - 左侧：供应商图标 `size-8 rounded-lg` + 模型显示名 `font-semibold text-base`（用 normalizeModelName）
   - 协议标签 badge（PROTOCOL_COLORS 样式，shrink-0）
   - 右侧 spacer `flex-1`
   - 最右：发布日期 `text-[11px] text-muted-foreground/50`

3. 第二行（flex items-center gap-2 text-xs text-muted-foreground mt-2）：
   - 模型 ID monospace code + 复制按钮（保持原逻辑，用 modelName 复制原名）
   - spacer
   - 上下文：`{t('Context')} {formatTokenCount(上下文)}`
   - 分隔 `·`
   - 最大输出：`{t('Max Output')} {formatTokenCount(最大输出)}`
   - 分隔 `·`
   - 知识截止：`{t('Knowledge cutoff')} {formatYearMonth(知识截止)}`

4. 第三行（flex items-baseline gap-x-3 text-sm mt-2）：
   - 价格行：输入 $X/M · 输出 $X/M（保留原 price 逻辑）
   - 如有缓存价格，追加显示

5. 第四行（flex flex-wrap gap-1 mt-2）：
   - 能力标签（capability tags），保留原逻辑

6. 能力标签行下面如果有 overflow，显示 `+N more`

7. 移除原 Grid 相关的 Tailwind 类，移除竖排布局

8. 保留：
   - `useMemo` 计算 metadata、protocol
   - `handleCopy` 复制原名（modelName，非 displayName）
   - 点击逻辑 `props.onClick`
   - 键盘事件处理

---

## 子任务 B：改 model-card-grid.tsx

文件：src/features/pricing/components/model-card-grid.tsx

1. 把 `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` 改成 `flex flex-col gap-3`
2. 删除分页逻辑（page、pageSize、totalPages、currentPage、setPage）
3. 删除底部分页导航（previous/next 按钮和页码文字）
4. 直接 `.map()` 渲染所有模型
5. 保留 `models.length === 0` 时返回 null

---

## 完成检查
- cd web/default && bun run typecheck 无报错
- 所有文案通过 t() 走 i18n
- 复制按钮复制的是原始 model_name（如 openai/gpt-4.1），显示用的是 normalizeModelName
