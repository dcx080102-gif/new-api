# 进度日志：i18n 修复

## 会话：2026-06-11

### 阶段1：诊断
- ✅ 确认 fallbackLng: 'en' 导致闪屏
- ✅ 确认 ja.json/ru.json 缺少 Zod 消息键
- ✅ 确认 notification-store.ts 硬编码中文
- ✅ 确认 message-dropdown.tsx 多处硬编码中文未过 t()
- ✅ 确认 zh.json "Current Price"→"Current Price" 未翻译
- ✅ 确认 "Announcement" 键全部缺失

### 阶段2：修复 Zod 校验
- ✅ constants.ts: 引入 `import { t } from 'i18next'`，schema 改函数式
- ✅ 删除 legacy const 别名（loginFormSchema 等）
- ✅ 导出 LoginFormValues 等类型别名
- ✅ auth/index.ts 重导出改 use create*Schema
- ✅ user-auth-form.tsx: useMemo([i18n.language]) + useEffect re-validate
- ✅ sign-up-form.tsx: 同上
- ✅ forgot-password-form.tsx: 同上 + 补 useMemo import
- ✅ otp-form.tsx: 同上
- ⚠️ forgot-password-form 出现重复 useTranslation 和 useCountdown 断尾，已修复

### 阶段3：修复消息下拉框
- ✅ notification-store.ts: 默认通知改英文 key
- ✅ notification-store.ts: localStorage key 换为 dvl_notifications_v2
- ✅ message-dropdown.tsx: title/message 全过 t()
- ✅ message-dropdown.tsx: formatTime/formatDate 改接 t 参数
- ✅ message-dropdown.tsx: 价格详情/更新内容/新模型示例全部 t()
- ✅ message-dropdown.tsx: 零中文字符残留
- ⚠️ 更新列表4条示例文案忘记 t()，第二轮补全

### 阶段4：翻译补全
- ✅ 第1轮：Zod 消息键 + 消息栏标签 → en/zh 各 +~12
- ✅ 第2轮：ja/ru 补 Zod 消息键各 +5
- ✅ 第3轮：ja/ru 补消息栏键各 +8
- ✅ 第4轮：更新示例4条全部4语言
- ✅ 第5轮：通知标题/内容6条全部4语言
- ✅ 第6轮：类型标签修正（Price Update, System Update, Announcement, Current Price）

### 阶段5：测试
- 🔄 中文：品牌区/校验/消息列表/详情 ✅
- 🔄 英语：校验消息 "Please enter your username or email" ✅
- ⬜ 日语：待用户测试
- ⬜ 俄语：待用户测试
- ✅ Git commit: 4fc2050f

## 修改统计
- 13 个文件
- zh.json: +15 条翻译
- en.json: +22 条翻译
- ja.json: +28 条翻译
- ru.json: +28 条翻译
