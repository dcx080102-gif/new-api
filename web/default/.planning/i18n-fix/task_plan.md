# 任务计划：登录页 i18n 全面修复

## 目标
修复登录页语言切换的3个核心bug：刷新闪屏、Zod校验消息不随语言变、消息下拉框硬编码中文

## 当前阶段
阶段 5（全部完成）

## 各阶段

### 阶段 1：诊断（complete）
- [x] 复现"刷新闪英文又变中文" — 根因：fallbackLng: 'en'
- [x] 复现"日语/俄语校验消息仍是中文" — 根因：ja.json/ru.json 缺少翻译键
- [x] 复现"消息栏内容不翻译" — 根因：notification-store 硬编码中文 + message-dropdown title/message 未走 t()
- **状态：** complete

### 阶段 2：修复 Zod 校验消息（complete）
- [x] constants.ts: schema 改为函数式 create*Schema()，用 import { t } from 'i18next'
- [x] 删掉 legacy const 别名（模块加载时烤死语言）
- [x] 4个表单文件加 useMemo([i18n.language]) + useEffect 重新校验
- [x] auth/index.ts 导出改用 create*Schema
- **状态：** complete

### 阶段 3：修复消息下拉框（complete）
- [x] notification-store.ts: 默认通知标题/内容改为英文 key
- [x] notification-store.ts: 换用 _v2 存储键避免旧中文缓存
- [x] message-dropdown.tsx: n.title/n.message → t(n.title)/t(n.message)
- [x] message-dropdown.tsx: selectedNotification.title/message → t()
- [x] message-dropdown.tsx: formatTime/formatDate 改接 t 参数
- [x] message-dropdown.tsx: 价格表头/更新列表/新模型示例全部走 t()
- [x] message-dropdown.tsx: 零中文残留 ✅
- **状态：** complete

### 阶段 4：翻译补全（complete）
- [x] zh.json: +15 条（校验消息+消息栏+Current Price→现价+Announcement）
- [x] en.json: +22 条
- [x] ja.json: +28 条（含校验消息+消息栏+Price Update→価格更新+System Update→システム更新+Announcement→お知らせ）
- [x] ru.json: +28 条
- **状态：** complete

### 阶段 5：测试与交付（complete）
- [x] 品牌区「一个 API 开启 AI 无限可能」4语言正确
- [x] Zod校验消息 4语言正确（zh/en/ja/ru）
- [x] 消息列表 4语言正确
- [x] 消息详情 4语言正确
- [x] Git commit: 4fc2050f
- **状态：** complete

## 已做决策
| 决策 | 理由 |
|------|------|
| fallbackLng 改为 'zh' | 中文用户占多数，避免刷新闪英文 |
| Zod schema 用函数式而非静态 const | 切语言后需重新获取 t() 翻译 |
| 通知存储换 _v2 键 | 旧 localStorage 存的是中文，必须强制刷新 |
| 品牌区 key 用中文原文 | 项目历史惯例，已有完整翻译 |

## 修改文件（13个）
- `src/i18n/config.ts`
- `src/features/auth/constants.ts`
- `src/features/auth/index.ts`
- `src/features/auth/sign-in/components/user-auth-form.tsx`
- `src/features/auth/sign-up/components/sign-up-form.tsx`
- `src/features/auth/forgot-password/components/forgot-password-form.tsx`
- `src/features/auth/otp/components/otp-form.tsx`
- `src/components/message-dropdown.tsx`
- `src/stores/notification-store.ts`
- `src/i18n/locales/en.json`
- `src/i18n/locales/zh.json`
- `src/i18n/locales/ja.json`
- `src/i18n/locales/ru.json`

## 备注
- Git commit: 4fc2050f（基于 d09776a3）
