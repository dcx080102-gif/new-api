# 研究发现：i18n 修复

## 根因1：刷新闪英文又变中文
- **文件**：`src/i18n/config.ts`
- **根因**：`fallbackLng: 'en'` + `detection.order: ['localStorage', 'navigator']`
- **流程**：页面加载→先用 en 渲染→检测到浏览器是 zh-CN→切回中文
- **修复**：`fallbackLng: 'zh'`

## 根因2：日语/俄语校验消息仍是中文
- **文件**：`src/features/auth/constants.ts` + `ja.json`/`ru.json`
- **根因**：
  1. ja.json/ru.json 缺少 Zod 消息翻译键（如 "Please enter your username or email"）
  2. i18next 回退到 fallbackLng (zh) 显示中文
  3. legacy const 别名在模块加载时烤死了中文消息
- **修复**：schema 改函数式 + 补全翻译 + 删 legacy 别名

## 根因3：消息下拉框不翻译
- **文件**：`src/stores/notification-store.ts` + `src/components/message-dropdown.tsx`
- **根因**：
  1. `getDefaultNotifications()` 硬编码中文 title/message
  2. 列表/详情直接显示 n.title/n.message，未过 t()
  3. formatTime/formatDate 硬编码中文
  4. 价格表头/更新列表/新模型示例硬编码中文
  5. 类型标签 "Price Update"/"System Update" 在 ja/ru 中无翻译
- **修复**：全部改为英文 key + t() 翻译 + 补全4语言翻译

## 根因4："Current Price" 中文显示为英文
- **文件**：`zh.json`
- **根因**：zh.json 中 "Current Price": "Current Price"（自映射未翻译）
- **修复**：改为 "Current Price": "现价"

## 根因5："Announcement" 类型标签缺失
- **文件**：所有语言文件
- **根因**：typeLabel 用 `t('Announcement')` 但4个语言文件均无此键
- **修复**：en/zh/ja/ru 全部添加
