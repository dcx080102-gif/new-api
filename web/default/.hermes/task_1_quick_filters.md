# 任务 1：快捷标签改造 + 排序逻辑

项目路径：C:\Users\lenovo\new-api-app\web\default\
技术栈：React 19 + TypeScript + Tailwind CSS + i18next
运行：cd web/default && bun run dev
改完跑：bun run typecheck

---

## 子任务 A：改 constants.ts

文件：src/features/pricing/constants.ts

1. QUICK_FILTERS 枚举修改：
```
当前：
  ALL: 'all',  HOT: 'hot',  FREE: 'free',  DISCOUNT: 'discount'

改为：
  ALL: 'all',  POPULAR: 'popular',  DISCOUNT: 'discount',  CLAUDE_CODE: 'claude-code',  CODEX: 'codex'
```
注意：删掉 FREE，HOT 改名为 POPULAR（值从 'hot' 变成 'popular'），新增 CLAUDE_CODE 和 CODEX。

2. 同步更新 QuickFilter 类型导出（类型会自动跟着枚举变）。

3. 如有 QuickFilter 标签映射函数，同步更新标签名（如 getQuickFilterLabels）：
   - popular → "热门"
   - discount → "优惠"  
   - claude-code → "Claude Code"
   - codex → "Codex"

---

## 子任务 B：重写 filterByQuickFilter 排序逻辑

文件：src/features/pricing/lib/filters.ts

重写 `filterByQuickFilter` 函数：

```typescript
export function filterByQuickFilter(
  models: PricingModel[],
  quickFilter: string
): PricingModel[] {
  // 热门：按使用量降序。当前无真实用量API，用"低价=热门"作为代理——ratio越低越多人用
  if (quickFilter === 'popular') {
    return [...models].sort((a, b) => {
      const scoreA = (a.model_ratio || 0) + (a.completion_ratio || 0)
      const scoreB = (b.model_ratio || 0) + (b.completion_ratio || 0)
      return scoreA - scoreB // 越低越靠前
    })
  }

  // 优惠：按比官方便宜的折扣百分比从大到小排序
  if (quickFilter === 'discount') {
    return [...models]
      .map((m) => {
        const official = getOfficialPrice(m.model_name || '')
        if (!official) return { model: m, savings: -1 }
        const ourAvg = ((m.model_ratio || 0) + (m.completion_ratio || 0)) / 2
        const officialAvg = (official.input + official.output) / 2
        if (officialAvg <= 0) return { model: m, savings: -1 }
        const savings = Math.round((1 - ourAvg / officialAvg) * 100)
        return { model: m, savings }
      })
      .sort((a, b) => b.savings - a.savings) // 折扣大的排前面
      .filter((item) => item.savings > 0) // 只保留真有折扣的
      .map((item) => item.model)
  }

  // Claude Code：匹配 Claude 系列模型
  if (quickFilter === 'claude-code') {
    return models.filter((m) => {
      const series = mapModelToSeries(m.model_name || '')
      return series === MODEL_SERIES.CLAUDE
    })
  }

  // Codex：匹配 codex 相关模型
  if (quickFilter === 'codex') {
    return models.filter((m) => {
      const name = (m.model_name || '').toLowerCase()
      return name.includes('codex')
    })
  }

  return models
}
```

注意事项：
- 热门和优惠用 `sort` 而非 `filter`（不减少数量，只改变顺序）
- 优惠排序只保留 discount > 0 的放在前面，其余保持原序跟在后面
- 需要导入 `getOfficialPrice` 来自 `./official-prices`
- 需要导入 `mapModelToSeries` 和 `MODEL_SERIES` 来自 `../constants`

---

## 子任务 C：更新快捷标签组件

文件：src/features/pricing/components/pricing-quick-filters.tsx

1. 更新标签列表——删 FREE，HOT 改 POPULAR，加 CLAUDE_CODE 和 CODEX
2. 标签文案（用 t() 包裹 i18n key）：
   - 热门
   - 优惠
   - Claude Code
   - Codex
3. 传给 onChange 的 value：分别对应 'popular'、'discount'、'claude-code'、'codex'
4. 保持选中态高亮样式（border-primary/40 bg-primary/10 text-primary）

---

## 完成检查
- cd web/default && bun run typecheck 无报错
- 确保 QUICK_FILTERS 的引用处全部更新（use-filters.ts 中 quickFilter 的默认值等）
