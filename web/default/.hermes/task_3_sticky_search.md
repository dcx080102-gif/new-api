# 任务 3：搜索栏 + 快捷标签合一 + sticky 粘顶

项目路径：C:\Users\lenovo\new-api-app\web\default\
技术栈：React 19 + TypeScript + Tailwind CSS + i18next
参照设计：https://ofox.ai/zh/models 的搜索栏区域
运行：cd web/default && bun run dev
改完跑：bun run typecheck

---

## 改 index.tsx

文件：src/features/pricing/index.tsx

### 目标
把搜索框、快捷标签、模型计数合并在一个统一的 sticky 容器里，往下滚动时粘在导航栏下方不动。

### 改动 1：搜索+标签+计数合一框架

在现有的 `{/* Search bar */}` 和 `{/* Quick filter pills */}` 区域，改为：

```tsx
{/* ── Unified search + quick filter bar (sticky) ── */}
<div className='sticky top-[72px] z-20 -mx-2 px-2 pt-2 pb-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
  <div className='rounded-xl border bg-card p-3 shadow-sm'>
    {/* Row 1: Search + count */}
    <div className='flex items-center gap-3'>
      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
        onClear={clearSearch}
        placeholder={t('搜索模型名称、供应商、端点或标签...')}
        className='flex-1'
      />
      <p className='text-muted-foreground shrink-0 text-xs sm:text-sm whitespace-nowrap'>
        {t('{{count}} 个模型', { count: filteredModels.length })}
      </p>
    </div>
    {/* Row 2: Quick filter pills */}
    <div className='mt-2.5'>
      <QuickFilterPills
        value={quickFilter}
        onChange={setQuickFilter}
      />
    </div>
  </div>
</div>
```

### 改动 2：删除独立元素

1. 删除原来独立的 `{/* Search bar */}` 块（SearchBar 已移入框架）
2. 删除原来独立的 `{/* Quick filter pills */}` 块（已移入框架）
3. 删除原来独立的 `{/* Model count indicator */}`（计数已移入框架第一行右侧）

### 改动 3：CtaBanner 移到卡片下方或删除

当前 CtaBanner 在搜索框下方。改成放到模型卡片列表**下方**（作为 footer），或如果不想显示就直接注释掉。

### 改动 4：左侧 sidebar sticky top 调整

原 sidebar 的 `sticky top-24` 改成跟搜索框架对齐，试 `sticky top-[72px]`（72px 是顶部导航栏高度，与搜索框架一致）。

### 改动 5：调整页面 padding

原页面上方的大标题和描述保留不动：
```tsx
<header className='mx-auto mb-8 max-w-3xl pt-5 text-center sm:mb-10 sm:pt-10'>
  <h1>模型广场</h1>
  ...
</header>
```

搜索框架紧接在 header 下方。

### 整体布局确认

```
┌─ 导航栏 (固定) ────────────────────────────────┐
├─ Header: 标题 + 描述 ──────────────────────────┤
├─ Sticky 搜索框架 ──────────────────────────────┤  ← scroll 时粘在导航栏下
│  [搜索框················]  25 个模型            │
│  [热门] [优惠] [Claude Code] [Codex]            │
├─ 左侧 sidebar │ 右侧 模型卡片列表 ──────────────┤
│  筛选器       │  [卡片1]                        │
│  模态        │  [卡片2]                        │
│  协议        │  [卡片3]                        │
│  系列        │  ...                            │
│  供应商      │                                  │
│  上下文滑块  │                                  │
│  能力特性    │                                  │
└────────────────────────────────────────────────┘
```

### 注意事项
- 搜索框架的 `top-[72px]` 值可能需要根据实际导航栏高度微调（当前导航栏大约 64-72px）
- `bg-background/95 backdrop-blur` 确保滚动时下方内容不会透出
- sticky 在移动端也要工作（mobile first）
- QuickFilterPills 组件不需要改，只需要传入正确的 value/onChange prop
- 用 i18n 的 t() 包裹文案 `"{{count}} 个模型"`

---

## 完成检查
- cd web/default && bun run typecheck 无报错
- 滚动页面时搜索框架粘在导航栏下方
- 左侧 sidebar filter 在可视区域内正常显示
- 移动端 responsive 不崩
