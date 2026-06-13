// Locale updater script — adds missing translation keys for docs & about pages
import { readFileSync, writeFileSync } from 'fs'

const localesDir = 'src/i18n/locales'

// All new translation keys needed (English key -> English value for en.json)
const newKeys = [
  // docs page — Hero
  'Documentation',
  'Developer Documentation',
  'Quickly integrate AI capabilities into your application. Compatible with OpenAI SDK — no code changes needed, just swap the API address.',

  // docs page — sidebar
  'Table of Contents',

  // docs page — section numbers
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',

  // docs page — Quick Start
  'Quick Start',
  'Just three steps to start calling AI models:',
  'Register Account',
  'Go to the registration page to create an account and verify your email',
  'Get API Key',
  'Create an API Key in the console and keep it safe',
  'Call API',
  'Send your first request using the example code below',

  // docs page — API Key Management
  'API Key Management',
  'API Key is the sole credential for accessing this platform. Please keep it safe and never share it with others.',
  'After logging in, go to Console → API Keys',
  `Click "New Key", set name, quota limit, and expiration`,
  'The full key is displayed only once after creation, please copy and save it immediately',
  'You can configure IP whitelist for the Key to restrict access sources',
  'Rotate keys regularly to reduce the risk of exposure',
  '⚠️ Security Notice: ',
  'A Key is equivalent to your account password. Anyone holding the Key can call the API and consume quota on your behalf.',

  // docs page — API Calls
  'API Calls',
  'This platform is compatible with the OpenAI API format. You can directly use the official OpenAI SDK.',
  'Base URL',
  'Include the API Key in the request header:',
  'cURL Example',
  'Python Example',
  'JavaScript Example',

  // docs page — Model List
  'Model List',
  'This platform brings together 40+ mainstream AI models, covering chat, image generation, video, and more. For available models and real-time pricing, please check the ',
  ' page.',
  'Multimodal flagship model',
  'Strong in coding and reasoning',
  'Ultra-fast response, high concurrency',
  'Cost-effective domestic model',
  'Alibaba Tongyi',
  'Leading Chinese language understanding',
  'AI image generation',

  // docs page — Billing
  'This platform adopts a prepaid pay-as-you-go model — transparent, flexible, with no hidden fees.',
  'Billing Unit',
  'Charged by Token (input + output)',
  'Different models have different unit prices',
  'Real-time deduction, auto-disable when balance is insufficient',
  'Top-up Methods',
  'Supports Stripe / EasyPay',
  'Top-up credited instantly',
  'Balance does not support withdrawal or refund',
  'For detailed pricing, please check the ',

  // docs page — FAQ (questions & answers)
  'How do I get an API Key?',
  `After logging in, go to "Console → API Keys" and click "New Key" to create one.`,
  'Which models are supported?',
  'We support GPT-4o, Claude, Gemini, DeepSeek, Qwen and 40+ other models. See the Pricing page for the full list.',
  'What if my API call fails?',
  'Check whether the Key is correct, the balance is sufficient, and the network is working. If the problem persists, please contact customer service.',
  'Is the OpenAI SDK supported?',
  `Fully compatible. Simply change the base_url to this platform's address — no code changes needed.`,
  'How do I top up?',
  `Go to "Console → Wallet", select the amount and payment method to complete the top-up.`,
  'Is my data secure?',
  'All data transmission uses TLS encryption. We do not log complete conversation content. See the Privacy Policy for details.',

  // docs page — Support
  'Technical Support',
  `Having issues? We're here to help:`,
  'Email Support: ',
  'Live Chat: Submit via the platform support channel after logging in',
  'Submit an Issue',

  // docs page — footer
  'Section {{num}}',
  'Start building your AI application today!',
  'If you have any questions, feel free to ',
  'contact us',
  '.',
  'Back to Top',

  // about page — Hero
  'One API, Unlock Infinite AI Possibilities',
  'DVLS is an AI API aggregation gateway that provides unified access to 40+ mainstream AI models, enabling developers to manage and call all models from one place — no more switching between platforms.',

  // about page — Stats
  'Developers Trust',
  'AI Models Connected',
  'Daily Requests',

  // about page — Core Capabilities
  'Core Capabilities',
  'The ultimate API experience built for developers',
  '99.9% Uptime',
  'Multi-node failover, always online',
  'Blazing Fast',
  'Avg latency <80ms, silky smooth',
  'Enterprise Security',
  'Data encryption & isolation, SOC 2 compliant',
  'Transparent Billing',
  'Pay only what you use, no hidden fees',

  // about page — Tech Architecture
  'Tech Architecture',
  'Modern tech stack, stable and reliable',
  'Backend',
  'Go high-performance service',
  'RESTful API design',
  'JWT auth · Multi-tenant isolation',
  'Frontend',
  'Infrastructure',
  'Docker containerized deployment',
  'Multi-node load balancing',

  // about page — Acknowledgments
  'Acknowledgments',
  'This project is based on ',
  '(© 2023 JustSong), further developed and maintained by the ',
  'team. Thanks to all open source contributors.',
  'GitHub Repository',
  'AGPL v3.0 Open Source License',

  // about page — Contact & Footer
  'Contact Us',
  'Based on',
  'Licensed under AGPL v3.0',
]

// Translation data: key -> { zh, zhTW, ja, ru, fr, vi }
const translations: Record<string, { zh: string; zhTW: string; ja: string; ru: string; fr: string; vi: string }> = {
  // Hero
  'Documentation': { zh: '文档', zhTW: '文件', ja: 'ドキュメント', ru: 'Документация', fr: 'Documentation', vi: 'Tài liệu' },
  'Developer Documentation': { zh: '开发者文档', zhTW: '開發者文件', ja: '開発者ドキュメント', ru: 'Документация для разработчиков', fr: 'Documentation développeur', vi: 'Tài liệu nhà phát triển' },
  'Quickly integrate AI capabilities into your application. Compatible with OpenAI SDK — no code changes needed, just swap the API address.': {
    zh: '快速集成 AI 能力到您的应用中。兼容 OpenAI SDK，无需修改代码，只需更换 API 地址。',
    zhTW: '快速整合 AI 能力到您的應用中。相容 OpenAI SDK，無需修改程式碼，只需更換 API 位址。',
    ja: 'アプリケーションにAI機能を迅速に統合。OpenAI SDK互換 — コード変更不要、APIアドレスを切り替えるだけ。',
    ru: 'Быстро интегрируйте ИИ в ваше приложение. Совместимо с OpenAI SDK — без изменений кода, просто смените API-адрес.',
    fr: 'Intégrez rapidement l\'IA dans votre application. Compatible avec le SDK OpenAI — aucun changement de code, changez simplement l\'adresse API.',
    vi: 'Tích hợp nhanh chóng khả năng AI vào ứng dụng của bạn. Tương thích với OpenAI SDK — không cần thay đổi mã, chỉ cần thay đổi địa chỉ API.',
  },

  // Sidebar
  'Table of Contents': { zh: '目录', zhTW: '目錄', ja: '目次', ru: 'Содержание', fr: 'Table des matières', vi: 'Mục lục' },

  // Section numbers
  'I': { zh: '一', zhTW: '一', ja: '一', ru: 'I', fr: 'I', vi: 'I' },
  'II': { zh: '二', zhTW: '二', ja: '二', ru: 'II', fr: 'II', vi: 'II' },
  'III': { zh: '三', zhTW: '三', ja: '三', ru: 'III', fr: 'III', vi: 'III' },
  'IV': { zh: '四', zhTW: '四', ja: '四', ru: 'IV', fr: 'IV', vi: 'IV' },
  'V': { zh: '五', zhTW: '五', ja: '五', ru: 'V', fr: 'V', vi: 'V' },
  'VI': { zh: '六', zhTW: '六', ja: '六', ru: 'VI', fr: 'VI', vi: 'VI' },
  'VII': { zh: '七', zhTW: '七', ja: '七', ru: 'VII', fr: 'VII', vi: 'VII' },

  // Quick Start
  'Quick Start': { zh: '快速开始', zhTW: '快速開始', ja: 'クイックスタート', ru: 'Быстрый старт', fr: 'Démarrage rapide', vi: 'Bắt đầu nhanh' },
  'Just three steps to start calling AI models:': { zh: '只需三步，即可开始调用 AI 模型：', zhTW: '只需三步，即可開始呼叫 AI 模型：', ja: 'たった3ステップでAIモデルの呼び出しを開始：', ru: 'Всего три шага, чтобы начать вызывать ИИ-модели:', fr: 'Trois étapes pour commencer à appeler des modèles IA :', vi: 'Chỉ ba bước để bắt đầu gọi các mô hình AI:' },
  'Register Account': { zh: '注册账户', zhTW: '註冊帳戶', ja: 'アカウント登録', ru: 'Регистрация аккаунта', fr: 'Créer un compte', vi: 'Đăng ký tài khoản' },
  'Go to the registration page to create an account and verify your email': { zh: '前往注册页创建账户，完成邮箱验证', zhTW: '前往註冊頁建立帳戶，完成電子郵件驗證', ja: '登録ページでアカウントを作成し、メール認証を完了', ru: 'Перейдите на страницу регистрации, создайте аккаунт и подтвердите email', fr: 'Allez à la page d\'inscription pour créer un compte et vérifier votre email', vi: 'Đến trang đăng ký để tạo tài khoản và xác minh email' },
  'Get API Key': { zh: '获取 Key', zhTW: '取得 Key', ja: 'APIキーを取得', ru: 'Получить API Key', fr: 'Obtenir une clé API', vi: 'Lấy API Key' },
  'Create an API Key in the console and keep it safe': { zh: '在控制台中创建 API Key 并妥善保存', zhTW: '在控制台中建立 API Key 並妥善儲存', ja: 'コンソールでAPIキーを作成し、安全に保管', ru: 'Создайте API Key в консоли и сохраните его', fr: 'Créez une clé API dans la console et conservez-la en sécurité', vi: 'Tạo API Key trong bảng điều khiển và lưu giữ an toàn' },
  'Call API': { zh: '调用 API', zhTW: '呼叫 API', ja: 'APIを呼び出す', ru: 'Вызов API', fr: 'Appeler l\'API', vi: 'Gọi API' },
  'Send your first request using the example code below': { zh: '使用下方示例代码发送第一个请求', zhTW: '使用下方範例程式碼發送第一個請求', ja: '以下のサンプルコードで最初のリクエストを送信', ru: 'Отправьте первый запрос, используя пример кода ниже', fr: 'Envoyez votre première requête avec l\'exemple de code ci-dessous', vi: 'Gửi yêu cầu đầu tiên bằng mã mẫu bên dưới' },

  // API Key Management
  'API Key Management': { zh: 'API Key 管理', zhTW: 'API Key 管理', ja: 'APIキー管理', ru: 'Управление API Key', fr: 'Gestion des clés API', vi: 'Quản lý API Key' },
  'API Key is the sole credential for accessing this platform. Please keep it safe and never share it with others.': {
    zh: 'API Key 是调用本平台服务的唯一凭证。请妥善保管，不要泄露给他人。',
    zhTW: 'API Key 是呼叫本平台服務的唯一憑證。請妥善保管，不要洩露給他人。',
    ja: 'APIキーは本プラットフォームにアクセスするための唯一の認証情報です。安全に保管し、他人と共有しないでください。',
    ru: 'API Key — единственное средство доступа к платформе. Храните его в безопасности и никому не передавайте.',
    fr: 'La clé API est le seul identifiant pour accéder à cette plateforme. Gardez-la en sécurité et ne la partagez jamais.',
    vi: 'API Key là thông tin xác thực duy nhất để truy cập nền tảng này. Vui lòng giữ an toàn và không chia sẻ với người khác.',
  },
  'After logging in, go to Console → API Keys': { zh: '登录后进入控制台 → API Keys 页面', zhTW: '登入後進入控制台 → API Keys 頁面', ja: 'ログイン後、コンソール → API Keys へ', ru: 'После входа перейдите в Консоль → API Keys', fr: 'Après connexion, allez dans Console → Clés API', vi: 'Sau khi đăng nhập, vào Bảng điều khiển → API Keys' },
  `Click "New Key", set name, quota limit, and expiration`: { zh: '点击「新建 Key」，设置名称、额度上限、有效期', zhTW: '點擊「新建 Key」，設定名稱、額度上限、有效期限', ja: '「新規キー」をクリックし、名前・クォータ制限・有効期限を設定', ru: 'Нажмите «Новый ключ», задайте имя, лимит и срок действия', fr: 'Cliquez sur « Nouvelle clé », définissez le nom, le quota et l\'expiration', vi: 'Nhấp "New Key", đặt tên, giới hạn hạn ngạch và thời hạn' },
  'The full key is displayed only once after creation, please copy and save it immediately': { zh: 'Key 创建后仅显示一次完整密钥，请立即复制保存', zhTW: 'Key 建立後僅顯示一次完整密鑰，請立即複製儲存', ja: 'キー作成後、完全なキーは一度だけ表示されます。すぐにコピーして保存してください', ru: 'Полный ключ показывается только один раз после создания — скопируйте и сохраните его сразу', fr: 'La clé complète n\'est affichée qu\'une fois après création, copiez-la et enregistrez-la immédiatement', vi: 'Khóa đầy đủ chỉ hiển thị một lần sau khi tạo, vui lòng sao chép và lưu ngay' },
  'You can configure IP whitelist for the Key to restrict access sources': { zh: '可为 Key 配置 IP 白名单，限制调用来源', zhTW: '可為 Key 設定 IP 白名單，限制呼叫來源', ja: 'キーにIPホワイトリストを設定してアクセス元を制限できます', ru: 'Можно настроить IP-белый список для ключа, чтобы ограничить источники доступа', fr: 'Vous pouvez configurer une liste blanche IP pour restreindre les sources d\'accès', vi: 'Có thể cấu hình danh sách trắng IP cho Key để hạn chế nguồn truy cập' },
  'Rotate keys regularly to reduce the risk of exposure': { zh: '建议定期轮换 Key，降低泄露风险', zhTW: '建議定期輪換 Key，降低洩露風險', ja: '定期的なキーのローテーションで漏洩リスクを低減', ru: 'Регулярно меняйте ключи для снижения риска утечки', fr: 'Alternez régulièrement les clés pour réduire le risque d\'exposition', vi: 'Xoay vòng khóa thường xuyên để giảm nguy cơ lộ' },
  '⚠️ Security Notice: ': { zh: '⚠️ 安全提醒：', zhTW: '⚠️ 安全提醒：', ja: '⚠️ セキュリティ注意事項：', ru: '⚠️ Предупреждение безопасности: ', fr: '⚠️ Avis de sécurité : ', vi: '⚠️ Lưu ý bảo mật: ' },
  'A Key is equivalent to your account password. Anyone holding the Key can call the API and consume quota on your behalf.': {
    zh: 'Key 相当于您的账户密码。任何持有该 Key 的人都可以代表您调用 API 并消耗额度。',
    zhTW: 'Key 相當於您的帳戶密碼。任何持有該 Key 的人都可以代表您呼叫 API 並消耗額度。',
    ja: 'キーはアカウントパスワードと同等です。キーを持つ誰もがあなたの代理でAPIを呼び出し、クォータを消費できます。',
    ru: 'Ключ равносилен паролю от вашего аккаунта. Любой, у кого есть ключ, может вызывать API и расходовать квоту от вашего имени.',
    fr: 'Une clé équivaut à votre mot de passe. Toute personne détenant la clé peut appeler l\'API et consommer votre quota.',
    vi: 'Key tương đương với mật khẩu tài khoản của bạn. Bất kỳ ai có Key đều có thể gọi API và tiêu thụ hạn ngạch thay bạn.',
  },

  // API Calls
  'API Calls': { zh: '接口调用', zhTW: '介面呼叫', ja: 'API呼び出し', ru: 'Вызовы API', fr: 'Appels API', vi: 'Gọi API' },
  'This platform is compatible with the OpenAI API format. You can directly use the official OpenAI SDK.': {
    zh: '本平台兼容 OpenAI API 格式，可直接使用 OpenAI 官方 SDK。',
    zhTW: '本平台相容 OpenAI API 格式，可直接使用 OpenAI 官方 SDK。',
    ja: '本プラットフォームはOpenAI API形式と互換性があり、OpenAI公式SDKを直接使用できます。',
    ru: 'Платформа совместима с форматом OpenAI API. Можно напрямую использовать официальный SDK OpenAI.',
    fr: 'Cette plateforme est compatible avec le format API OpenAI. Vous pouvez utiliser directement le SDK officiel OpenAI.',
    vi: 'Nền tảng này tương thích với định dạng OpenAI API. Bạn có thể sử dụng trực tiếp SDK chính thức của OpenAI.',
  },
  'Base URL': { zh: '基础地址', zhTW: '基礎位址', ja: 'ベースURL', ru: 'Базовый URL', fr: 'URL de base', vi: 'URL cơ sở' },
  'Include the API Key in the request header:': { zh: '在请求头中携带 API Key：', zhTW: '在請求標頭中攜帶 API Key：', ja: 'リクエストヘッダーにAPIキーを含める：', ru: 'Укажите API Key в заголовке запроса:', fr: 'Incluez la clé API dans l\'en-tête de la requête :', vi: 'Bao gồm API Key trong tiêu đề yêu cầu:' },
  'cURL Example': { zh: 'cURL 示例', zhTW: 'cURL 範例', ja: 'cURL 例', ru: 'Пример cURL', fr: 'Exemple cURL', vi: 'Ví dụ cURL' },
  'Python Example': { zh: 'Python 示例', zhTW: 'Python 範例', ja: 'Python 例', ru: 'Пример Python', fr: 'Exemple Python', vi: 'Ví dụ Python' },
  'JavaScript Example': { zh: 'JavaScript 示例', zhTW: 'JavaScript 範例', ja: 'JavaScript 例', ru: 'Пример JavaScript', fr: 'Exemple JavaScript', vi: 'Ví dụ JavaScript' },

  // Model List
  'Model List': { zh: '模型列表', zhTW: '模型列表', ja: 'モデル一覧', ru: 'Список моделей', fr: 'Liste des modèles', vi: 'Danh sách mô hình' },
  'This platform brings together 40+ mainstream AI models, covering chat, image generation, video, and more. For available models and real-time pricing, please check the ': {
    zh: '本平台汇聚 40+ 主流 AI 模型，涵盖对话、绘画、视频等多个领域。具体可用模型及实时价格请查看',
    zhTW: '本平台匯聚 40+ 主流 AI 模型，涵蓋對話、繪畫、影片等多個領域。具體可用模型及即時價格請查看',
    ja: '本プラットフォームは40以上の主要AIモデルを集約し、チャット・画像生成・動画などに対応。利用可能なモデルとリアルタイム価格については',
    ru: 'Платформа объединяет 40+ популярных ИИ-моделей: чат, генерация изображений, видео и др. Доступные модели и цены смотрите на',
    fr: 'Cette plateforme rassemble plus de 40 modèles IA : chat, génération d\'images, vidéo et plus. Pour les modèles disponibles et les prix, consultez la',
    vi: 'Nền tảng này tập hợp hơn 40 mô hình AI chính thống, bao gồm trò chuyện, tạo hình ảnh, video và hơn thế nữa. Để biết các mô hình có sẵn và giá theo thời gian thực, vui lòng kiểm tra',
  },
  ' page.': { zh: '页面。', zhTW: '頁面。', ja: 'ページをご覧ください。', ru: 'страницу.', fr: 'page.', vi: 'trang.' },
  'Multimodal flagship model': { zh: '多模态旗舰模型', zhTW: '多模態旗艦模型', ja: 'マルチモーダルフラッグシップモデル', ru: 'Мультимодальная флагманская модель', fr: 'Modèle multimodal phare', vi: 'Mô hình đa phương thức hàng đầu' },
  'Strong in coding and reasoning': { zh: '编程与推理强项', zhTW: '程式設計與推理強項', ja: 'コーディングと推論に強い', ru: 'Сильный в программировании и логике', fr: 'Excellent en programmation et raisonnement', vi: 'Mạnh về lập trình và suy luận' },
  'Ultra-fast response, high concurrency': { zh: '极速响应，高并发', zhTW: '極速回應，高併發', ja: '超高速応答、高同時実行', ru: 'Сверхбыстрый отклик, высокая конкурентность', fr: 'Réponse ultra-rapide, haute concurrence', vi: 'Phản hồi cực nhanh, đồng thời cao' },
  'Cost-effective domestic model': { zh: '高性价比国产模型', zhTW: '高性價比國產模型', ja: 'コストパフォーマンスに優れた国産モデル', ru: 'Экономичная отечественная модель', fr: 'Modèle national à bon rapport qualité-prix', vi: 'Mô hình nội địa hiệu quả về chi phí' },
  'Alibaba Tongyi': { zh: '阿里通义', zhTW: '阿里通義', ja: 'Alibaba Tongyi', ru: 'Alibaba Tongyi', fr: 'Alibaba Tongyi', vi: 'Alibaba Tongyi' },
  'Leading Chinese language understanding': { zh: '中文理解力领先', zhTW: '中文理解力領先', ja: '中国語理解力でリード', ru: 'Лучшее понимание китайского языка', fr: 'Compréhension du chinois de premier plan', vi: 'Hiểu tiếng Trung hàng đầu' },
  'AI image generation': { zh: 'AI 图像生成', zhTW: 'AI 圖像生成', ja: 'AI画像生成', ru: 'Генерация изображений ИИ', fr: 'Génération d\'images IA', vi: 'Tạo hình ảnh AI' },

  // Billing
  'This platform adopts a prepaid pay-as-you-go model — transparent, flexible, with no hidden fees.': {
    zh: '本平台采用预付费按量计费模式，透明、灵活、无隐藏费用。',
    zhTW: '本平台採用預付費按量計費模式，透明、靈活、無隱藏費用。',
    ja: '本プラットフォームはプリペイド従量課金モデルを採用 — 透明で柔軟、隠れた費用なし。',
    ru: 'Платформа использует предоплатную модель pay-as-you-go — прозрачно, гибко, без скрытых платежей.',
    fr: 'Cette plateforme utilise un modèle de paiement à l\'usage prépayé — transparent, flexible, sans frais cachés.',
    vi: 'Nền tảng này áp dụng mô hình trả trước theo mức sử dụng — minh bạch, linh hoạt, không phí ẩn.',
  },
  'Billing Unit': { zh: '计费单位', zhTW: '計費單位', ja: '課金単位', ru: 'Единица расчёта', fr: 'Unité de facturation', vi: 'Đơn vị thanh toán' },
  'Charged by Token (input + output)': { zh: '按 Token 计费（输入 + 输出）', zhTW: '按 Token 計費（輸入 + 輸出）', ja: 'トークン単位で課金（入力＋出力）', ru: 'Оплата за токены (ввод + вывод)', fr: 'Facturé par Token (entrée + sortie)', vi: 'Tính phí theo Token (đầu vào + đầu ra)' },
  'Different models have different unit prices': { zh: '不同模型单价不同', zhTW: '不同模型單價不同', ja: 'モデルごとに単価が異なります', ru: 'Разные модели — разные цены', fr: 'Différents modèles ont des prix unitaires différents', vi: 'Các mô hình khác nhau có đơn giá khác nhau' },
  'Real-time deduction, auto-disable when balance is insufficient': { zh: '实时扣费，余额不足自动停用', zhTW: '即時扣費，餘額不足自動停用', ja: 'リアルタイム課金、残高不足時は自動停止', ru: 'Списание в реальном времени, авто-отключение при нехватке средств', fr: 'Déduction en temps réel, désactivation automatique si solde insuffisant', vi: 'Khấu trừ theo thời gian thực, tự động vô hiệu khi số dư không đủ' },
  'Top-up Methods': { zh: '充值方式', zhTW: '儲值方式', ja: 'チャージ方法', ru: 'Способы пополнения', fr: 'Modes de recharge', vi: 'Phương thức nạp tiền' },
  'Supports Stripe / EasyPay': { zh: '支持 Stripe / 易支付', zhTW: '支援 Stripe / 易支付', ja: 'Stripe / EasyPay 対応', ru: 'Поддержка Stripe / EasyPay', fr: 'Prend en charge Stripe / EasyPay', vi: 'Hỗ trợ Stripe / EasyPay' },
  'Top-up credited instantly': { zh: '充值即时到账', zhTW: '儲值即時到帳', ja: 'チャージは即時反映', ru: 'Мгновенное зачисление', fr: 'Recharge créditée instantanément', vi: 'Nạp tiền được ghi có ngay lập tức' },
  'Balance does not support withdrawal or refund': { zh: '余额不支持提现退款', zhTW: '餘額不支援提現退款', ja: '残高の引き出し・返金は不可', ru: 'Баланс не подлежит выводу или возврату', fr: 'Le solde ne prend pas en charge le retrait ou le remboursement', vi: 'Số dư không hỗ trợ rút tiền hoặc hoàn lại' },
  'For detailed pricing, please check the ': { zh: '详细价格请查看', zhTW: '詳細價格請查看', ja: '詳細な価格については', ru: 'Подробные цены смотрите на', fr: 'Pour les prix détaillés, consultez la', vi: 'Để biết giá chi tiết, vui lòng kiểm tra' },

  // FAQ
  'How do I get an API Key?': { zh: '如何获取 API Key？', zhTW: '如何取得 API Key？', ja: 'APIキーの取得方法は？', ru: 'Как получить API Key?', fr: 'Comment obtenir une clé API ?', vi: 'Làm thế nào để lấy API Key?' },
  `After logging in, go to "Console → API Keys" and click "New Key" to create one.`: { zh: '登录后进入「控制台 → API Keys」，点击「新建 Key」即可创建。', zhTW: '登入後進入「控制台 → API Keys」，點擊「新建 Key」即可建立。', ja: 'ログイン後「コンソール → API Keys」に移動し、「新規キー」をクリックして作成。', ru: 'После входа перейдите в «Консоль → API Keys» и нажмите «Новый ключ».', fr: 'Après connexion, allez dans « Console → Clés API » et cliquez sur « Nouvelle clé ».', vi: 'Sau khi đăng nhập, vào "Bảng điều khiển → API Keys" và nhấp "New Key" để tạo.' },
  'Which models are supported?': { zh: '支持哪些模型？', zhTW: '支援哪些模型？', ja: '対応モデルは？', ru: 'Какие модели поддерживаются?', fr: 'Quels modèles sont pris en charge ?', vi: 'Những mô hình nào được hỗ trợ?' },
  'We support GPT-4o, Claude, Gemini, DeepSeek, Qwen and 40+ other models. See the Pricing page for the full list.': {
    zh: '支持 GPT-4o、Claude、Gemini、DeepSeek、Qwen 等 40+ 模型。完整列表见定价页面。',
    zhTW: '支援 GPT-4o、Claude、Gemini、DeepSeek、Qwen 等 40+ 模型。完整列表見定價頁面。',
    ja: 'GPT-4o、Claude、Gemini、DeepSeek、Qwen など40以上のモデルをサポート。全リストは価格ページで。',
    ru: 'Поддерживаются GPT-4o, Claude, Gemini, DeepSeek, Qwen и 40+ других моделей. Полный список на странице цен.',
    fr: 'Nous prenons en charge GPT-4o, Claude, Gemini, DeepSeek, Qwen et plus de 40 autres modèles. Voir la page des prix pour la liste complète.',
    vi: 'Chúng tôi hỗ trợ GPT-4o, Claude, Gemini, DeepSeek, Qwen và hơn 40 mô hình khác. Xem trang Giá để biết danh sách đầy đủ.',
  },
  'What if my API call fails?': { zh: 'API 调用失败怎么办？', zhTW: 'API 呼叫失敗怎麼辦？', ja: 'API呼び出しが失敗したら？', ru: 'Что делать, если вызов API не удался?', fr: 'Que faire si mon appel API échoue ?', vi: 'Nếu cuộc gọi API của tôi thất bại thì sao?' },
  'Check whether the Key is correct, the balance is sufficient, and the network is working. If the problem persists, please contact customer service.': {
    zh: '检查 Key 是否正确、余额是否充足、网络是否正常。如仍有问题，请联系客服。',
    zhTW: '檢查 Key 是否正確、餘額是否充足、網路是否正常。如仍有問題，請聯絡客服。',
    ja: 'キーが正しいか、残高が十分か、ネットワークが正常かを確認。問題が続く場合はカスタマーサービスへ。',
    ru: 'Проверьте правильность ключа, достаточно ли средств и работает ли сеть. Если проблема не решена, обратитесь в поддержку.',
    fr: 'Vérifiez que la clé est correcte, le solde suffisant et le réseau fonctionnel. Si le problème persiste, contactez le service client.',
    vi: 'Kiểm tra xem Key có đúng không, số dư có đủ không và mạng có hoạt động không. Nếu vẫn có vấn đề, vui lòng liên hệ dịch vụ khách hàng.',
  },
  'Is the OpenAI SDK supported?': { zh: '是否支持 OpenAI SDK？', zhTW: '是否支援 OpenAI SDK？', ja: 'OpenAI SDKに対応していますか？', ru: 'Поддерживается ли OpenAI SDK?', fr: 'Le SDK OpenAI est-il pris en charge ?', vi: 'SDK OpenAI có được hỗ trợ không?' },
  `Fully compatible. Simply change the base_url to this platform's address — no code changes needed.`: {
    zh: '完全兼容。只需将 base_url 改为本平台地址即可，无需修改代码。',
    zhTW: '完全相容。只需將 base_url 改為本平台位址即可，無需修改程式碼。',
    ja: '完全互換。base_urlを本プラットフォームのアドレスに変更するだけ — コード変更不要。',
    ru: 'Полностью совместимо. Просто измените base_url на адрес платформы — код менять не нужно.',
    fr: 'Entièrement compatible. Changez simplement le base_url par l\'adresse de cette plateforme — aucun changement de code requis.',
    vi: 'Hoàn toàn tương thích. Chỉ cần thay đổi base_url thành địa chỉ của nền tảng này — không cần thay đổi mã.',
  },
  'How do I top up?': { zh: '如何充值？', zhTW: '如何儲值？', ja: 'チャージ方法は？', ru: 'Как пополнить баланс?', fr: 'Comment recharger ?', vi: 'Làm thế nào để nạp tiền?' },
  `Go to "Console → Wallet", select the amount and payment method to complete the top-up.`: { zh: '进入「控制台 → 钱包」，选择充值金额和支付方式即可完成充值。', zhTW: '進入「控制台 → 錢包」，選擇儲值金額和支付方式即可完成儲值。', ja: '「コンソール → ウォレット」に移動し、金額と支払い方法を選択してチャージ完了。', ru: 'Зайдите в «Консоль → Кошелёк», выберите сумму и способ оплаты.', fr: 'Allez dans « Console → Portefeuille », sélectionnez le montant et le mode de paiement.', vi: 'Vào "Bảng điều khiển → Ví", chọn số tiền và phương thức thanh toán để hoàn tất nạp tiền.' },
  'Is my data secure?': { zh: '数据安全吗？', zhTW: '資料安全嗎？', ja: 'データは安全ですか？', ru: 'Мои данные в безопасности?', fr: 'Mes données sont-elles sécurisées ?', vi: 'Dữ liệu của tôi có an toàn không?' },
  'All data transmission uses TLS encryption. We do not log complete conversation content. See the Privacy Policy for details.': {
    zh: '所有数据传输均使用 TLS 加密。我们不会记录完整对话内容。详见隐私政策。',
    zhTW: '所有資料傳輸均使用 TLS 加密。我們不會記錄完整對話內容。詳見隱私政策。',
    ja: 'すべてのデータ通信はTLS暗号化を使用。完全な会話内容は記録しません。詳細はプライバシーポリシーをご覧ください。',
    ru: 'Вся передача данных использует TLS-шифрование. Мы не записываем полное содержание разговоров. Подробнее в Политике конфиденциальности.',
    fr: 'Toutes les transmissions utilisent le chiffrement TLS. Nous n\'enregistrons pas le contenu complet des conversations. Voir la Politique de confidentialité.',
    vi: 'Tất cả truyền dữ liệu sử dụng mã hóa TLS. Chúng tôi không ghi lại nội dung hội thoại đầy đủ. Xem Chính sách Bảo mật để biết chi tiết.',
  },

  // Technical Support
  'Technical Support': { zh: '技术支持', zhTW: '技術支援', ja: 'テクニカルサポート', ru: 'Техподдержка', fr: 'Support technique', vi: 'Hỗ trợ kỹ thuật' },
  `Having issues? We're here to help:`: { zh: '遇到问题？我们随时提供帮助：', zhTW: '遇到問題？我們隨時提供幫助：', ja: '問題がありますか？サポートいたします：', ru: 'Возникли проблемы? Мы готовы помочь:', fr: 'Des problèmes ? Nous sommes là pour vous aider :', vi: 'Gặp vấn đề? Chúng tôi sẵn sàng giúp đỡ:' },
  'Email Support: ': { zh: '邮件支持：', zhTW: '郵件支援：', ja: 'メールサポート：', ru: 'Поддержка по email: ', fr: 'Support email : ', vi: 'Hỗ trợ email: ' },
  'Live Chat: Submit via the platform support channel after logging in': { zh: '在线客服：登录后通过平台客服渠道提交', zhTW: '線上客服：登入後透過平台客服渠道提交', ja: 'ライブチャット：ログイン後、プラットフォームのサポートチャネルから送信', ru: 'Онлайн-чат: отправьте через канал поддержки платформы после входа', fr: 'Chat en direct : soumettez via le canal d\'assistance après connexion', vi: 'Trò chuyện trực tiếp: Gửi qua kênh hỗ trợ nền tảng sau khi đăng nhập' },
  'Submit an Issue': { zh: '提交 Issue', zhTW: '提交 Issue', ja: 'Issueを送信', ru: 'Создать Issue', fr: 'Soumettre un ticket', vi: 'Gửi Issue' },

  // CTA / Footer
  'Section {{num}}': { zh: '第{{num}}节', zhTW: '第{{num}}節', ja: '第{{num}}節', ru: 'Раздел {{num}}', fr: 'Section {{num}}', vi: 'Mục {{num}}' },
  'Start building your AI application today!': { zh: '开始构建您的 AI 应用吧！', zhTW: '開始構建您的 AI 應用吧！', ja: '今すぐAIアプリケーションの構築を始めましょう！', ru: 'Начните создавать своё ИИ-приложение уже сегодня!', fr: 'Commencez à construire votre application IA dès aujourd\'hui !', vi: 'Bắt đầu xây dựng ứng dụng AI của bạn ngay hôm nay!' },
  'If you have any questions, feel free to ': { zh: '如有疑问，请随时', zhTW: '如有疑問，請隨時', ja: 'ご質問がある場合は、お気軽に', ru: 'Если у вас есть вопросы, обращайтесь — ', fr: 'Si vous avez des questions, n\'hésitez pas à ', vi: 'Nếu bạn có bất kỳ câu hỏi nào, vui lòng' },
  'contact us': { zh: '联系我们', zhTW: '聯絡我們', ja: 'お問い合わせ', ru: 'связаться с нами', fr: 'nous contacter', vi: 'liên hệ với chúng tôi' },
  '.': { zh: '。', zhTW: '。', ja: '。', ru: '.', fr: '.', vi: '.' },
  'Back to Top': { zh: '回到顶部', zhTW: '回到頂部', ja: 'トップに戻る', ru: 'Наверх', fr: 'Retour en haut', vi: 'Quay lại đầu trang' },

  // about page — Hero
  'One API, Unlock Infinite AI Possibilities': { zh: '一个 API，开启 AI 无限可能', zhTW: '一個 API，開啟 AI 無限可能', ja: 'ひとつのAPI、AIの無限の可能性を開く', ru: 'Один API — безграничные возможности ИИ', fr: 'Une API, des possibilités IA infinies', vi: 'Một API, Mở khóa Khả năng AI Vô hạn' },
  'DVLS is an AI API aggregation gateway that provides unified access to 40+ mainstream AI models, enabling developers to manage and call all models from one place — no more switching between platforms.': {
    zh: 'DVLS 是一个 AI API 聚合网关，通过统一接口接入 40+ 主流 AI 模型，让开发者一站式管理和调用，告别多平台切换的繁琐。',
    zhTW: 'DVLS 是一個 AI API 聚合網關，透過統一介面接入 40+ 主流 AI 模型，讓開發者一站式管理和呼叫，告別多平台切換的繁瑣。',
    ja: 'DVLS はAI API集約ゲートウェイで、40以上の主要AIモデルに統一インターフェースでアクセスし、開発者が一元的に管理・呼び出しできます。',
    ru: 'DVLS — это агрегирующий AI API шлюз с унифицированным доступом к 40+ ИИ-моделям для управления и вызова из одного места.',
    fr: 'DVLS est une passerelle d\'agrégation d\'API IA offrant un accès unifié à plus de 40 modèles IA, permettant aux développeurs de tout gérer depuis un seul endroit.',
    vi: 'DVLS là cổng tổng hợp API AI cung cấp quyền truy cập thống nhất vào hơn 40 mô hình AI chính thống, cho phép nhà phát triển quản lý và gọi tất cả từ một nơi.',
  },

  // Stats
  'Developers Trust': { zh: '开发者信赖', zhTW: '開發者信賴', ja: '開発者からの信頼', ru: 'Доверие разработчиков', fr: 'Développeurs satisfaits', vi: 'Nhà phát triển tin dùng' },
  'AI Models Connected': { zh: 'AI 模型接入', zhTW: 'AI 模型接入', ja: 'AIモデル接続', ru: 'Подключено ИИ-моделей', fr: 'Modèles IA connectés', vi: 'Mô hình AI đã kết nối' },
  'Daily Requests': { zh: '日处理请求', zhTW: '日處理請求', ja: '日次リクエスト', ru: 'Запросов в день', fr: 'Requêtes par jour', vi: 'Yêu cầu hàng ngày' },

  // Core Capabilities
  'Core Capabilities': { zh: '核心能力', zhTW: '核心能力', ja: 'コア機能', ru: 'Ключевые возможности', fr: 'Fonctionnalités clés', vi: 'Năng lực cốt lõi' },
  'The ultimate API experience built for developers': { zh: '为开发者打造的极致 API 体验', zhTW: '為開發者打造的極致 API 體驗', ja: '開発者のために構築された究極のAPI体験', ru: 'Превосходный API-опыт для разработчиков', fr: 'L\'expérience API ultime conçue pour les développeurs', vi: 'Trải nghiệm API tối ưu được xây dựng cho nhà phát triển' },
  '99.9% Uptime': { zh: '99.9% 在线率', zhTW: '99.9% 線上率', ja: '99.9% 稼働率', ru: '99.9% Аптайм', fr: '99,9 % de disponibilité', vi: '99.9% Thời gian hoạt động' },
  'Multi-node failover, always online': { zh: '多节点容灾，服务永不掉线', zhTW: '多節點容災，服務永不掉線', ja: 'マルチノード冗長化で常時オンライン', ru: 'Многоузловое резервирование, всегда онлайн', fr: 'Basculement multi-nœuds, toujours en ligne', vi: 'Chuyển đổi dự phòng đa nút, luôn trực tuyến' },
  'Blazing Fast': { zh: '极速响应', zhTW: '極速回應', ja: '超高速応答', ru: 'Молниеносная скорость', fr: 'Ultra rapide', vi: 'Tốc độ nhanh vượt trội' },
  'Avg latency <80ms, silky smooth': { zh: '平均延迟低于 80ms，丝滑体验', zhTW: '平均延遲低於 80ms，絲滑體驗', ja: '平均レイテンシー80ms未満の滑らかな体験', ru: 'Средняя задержка <80 мс, плавная работа', fr: 'Latence moyenne <80 ms, fluidité soyeuse', vi: 'Độ trễ trung bình <80ms, mượt mà' },
  'Enterprise Security': { zh: '企业级安全', zhTW: '企業級安全', ja: 'エンタープライズセキュリティ', ru: 'Корпоративная безопасность', fr: 'Sécurité enterprise', vi: 'Bảo mật cấp doanh nghiệp' },
  'Data encryption & isolation, SOC 2 compliant': { zh: '数据加密隔离，SOC 2 合规', zhTW: '資料加密隔離，SOC 2 合規', ja: 'データ暗号化・分離、SOC 2準拠', ru: 'Шифрование и изоляция данных, SOC 2', fr: 'Chiffrement et isolation des données, conforme SOC 2', vi: 'Mã hóa & cách ly dữ liệu, tuân thủ SOC 2' },
  'Transparent Billing': { zh: '透明计费', zhTW: '透明計費', ja: '透明な課金', ru: 'Прозрачный биллинг', fr: 'Facturation transparente', vi: 'Thanh toán minh bạch' },
  'Pay only what you use, no hidden fees': { zh: '用多少付多少，无隐藏费用', zhTW: '用多少付多少，無隱藏費用', ja: '使った分だけ、隠れた費用なし', ru: 'Платите только за использование, без скрытых платежей', fr: 'Payez uniquement ce que vous utilisez, sans frais cachés', vi: 'Chỉ trả cho những gì bạn dùng, không phí ẩn' },

  // Tech Architecture
  'Tech Architecture': { zh: '技术架构', zhTW: '技術架構', ja: '技術アーキテクチャ', ru: 'Техническая архитектура', fr: 'Architecture technique', vi: 'Kiến trúc công nghệ' },
  'Modern tech stack, stable and reliable': { zh: '现代化的技术选型，稳定可靠', zhTW: '現代化的技術選型，穩定可靠', ja: 'モダンな技術スタック、安定かつ信頼性', ru: 'Современный стек, стабильно и надёжно', fr: 'Stack technique moderne, stable et fiable', vi: 'Stack công nghệ hiện đại, ổn định và đáng tin cậy' },
  'Backend': { zh: '后端', zhTW: '後端', ja: 'バックエンド', ru: 'Бэкенд', fr: 'Backend', vi: 'Backend' },
  'Go high-performance service': { zh: 'Go 语言高性能服务', zhTW: 'Go 語言高效能服務', ja: 'Go言語による高性能サービス', ru: 'Высокопроизводительный сервис на Go', fr: 'Service haute performance en Go', vi: 'Dịch vụ hiệu suất cao bằng Go' },
  'RESTful API design': { zh: 'RESTful API 设计', zhTW: 'RESTful API 設計', ja: 'RESTful API 設計', ru: 'RESTful API дизайн', fr: 'Conception d\'API RESTful', vi: 'Thiết kế API RESTful' },
  'JWT auth · Multi-tenant isolation': { zh: 'JWT 鉴权 · 多租户隔离', zhTW: 'JWT 鑑權 · 多租戶隔離', ja: 'JWT認証 · マルチテナント分離', ru: 'JWT-аутентификация · Мультитенантная изоляция', fr: 'Auth JWT · Isolation multi-tenant', vi: 'Xác thực JWT · Cách ly đa người thuê' },
  'Frontend': { zh: '前端', zhTW: '前端', ja: 'フロントエンド', ru: 'Фронтенд', fr: 'Frontend', vi: 'Frontend' },
  'Infrastructure': { zh: '基础设施', zhTW: '基礎設施', ja: 'インフラストラクチャ', ru: 'Инфраструктура', fr: 'Infrastructure', vi: 'Cơ sở hạ tầng' },
  'Docker containerized deployment': { zh: 'Docker 容器化部署', zhTW: 'Docker 容器化部署', ja: 'Dockerコンテナデプロイ', ru: 'Контейнеризация Docker', fr: 'Déploiement conteneurisé Docker', vi: 'Triển khai container Docker' },
  'Multi-node load balancing': { zh: '多节点负载均衡', zhTW: '多節點負載均衡', ja: 'マルチノードロードバランシング', ru: 'Многоузловая балансировка нагрузки', fr: 'Équilibrage de charge multi-nœuds', vi: 'Cân bằng tải đa nút' },

  // Acknowledgments
  'Acknowledgments': { zh: '致谢', zhTW: '致謝', ja: '謝辞', ru: 'Благодарности', fr: 'Remerciements', vi: 'Lời cảm ơn' },
  'This project is based on ': { zh: '本项目基于', zhTW: '本專案基於', ja: '本プロジェクトは', ru: 'Этот проект основан на ', fr: 'Ce projet est basé sur ', vi: 'Dự án này dựa trên ' },
  '(© 2023 JustSong), further developed and maintained by the ': { zh: '（© 2023 JustSong）二次开发，由', zhTW: '（© 2023 JustSong）二次開發，由', ja: '（© 2023 JustSong）をベースに、', ru: '(© 2023 JustSong), доработан и поддерживается командой ', fr: '(© 2023 JustSong), développé et maintenu par l\'équipe ', vi: '(© 2023 JustSong), phát triển thêm và duy trì bởi ' },
  'team. Thanks to all open source contributors.': { zh: '团队维护。感谢所有开源贡献者的付出。', zhTW: '團隊維護。感謝所有開源貢獻者的付出。', ja: 'チームが開発・保守。すべてのオープンソース貢献者に感謝します。', ru: 'Благодарим всех контрибьюторов открытого кода.', fr: 'Merci à tous les contributeurs open source.', vi: 'Cảm ơn tất cả những người đóng góp mã nguồn mở.' },
  'GitHub Repository': { zh: 'GitHub 仓库', zhTW: 'GitHub 倉庫', ja: 'GitHub リポジトリ', ru: 'GitHub Репозиторий', fr: 'Dépôt GitHub', vi: 'Kho GitHub' },
  'AGPL v3.0 Open Source License': { zh: 'AGPL v3.0 开源协议', zhTW: 'AGPL v3.0 開源協議', ja: 'AGPL v3.0 オープンソースライセンス', ru: 'Лицензия AGPL v3.0', fr: 'Licence open source AGPL v3.0', vi: 'Giấy phép Mã nguồn mở AGPL v3.0' },

  // Contact & Footer
  'Contact Us': { zh: '联系我们', zhTW: '聯絡我們', ja: 'お問い合わせ', ru: 'Свяжитесь с нами', fr: 'Contactez-nous', vi: 'Liên hệ với chúng tôi' },
  'Based on': { zh: '基于', zhTW: '基於', ja: 'に基づく', ru: 'На основе', fr: 'Basé sur', vi: 'Dựa trên' },
  'Licensed under AGPL v3.0': { zh: '基于 AGPL v3.0 协议开源', zhTW: '基於 AGPL v3.0 協議開源', ja: 'AGPL v3.0ライセンス下で提供', ru: 'Лицензировано под AGPL v3.0', fr: 'Sous licence AGPL v3.0', vi: 'Được cấp phép theo AGPL v3.0' },
}

function main() {
  const langs = ['en', 'zh', 'zh-TW', 'ja', 'ru', 'fr', 'vi']
  const fieldMap: Record<string, string> = { zh: 'zh', 'zh-TW': 'zhTW', ja: 'ja', ru: 'ru', fr: 'fr', vi: 'vi' }

  for (const lang of langs) {
    const path = `${localesDir}/${lang}.json`
    const raw = readFileSync(path, 'utf-8')
    const json = JSON.parse(raw)
    let added = 0

    for (const key of newKeys) {
      if (json.translation[key] === undefined) {
        if (lang === 'en') {
          json.translation[key] = key
        } else {
          const tr = translations[key]
          if (tr) {
            const field = fieldMap[lang]
            json.translation[key] = tr[field] || key
          } else {
            json.translation[key] = key // fallback to English
          }
        }
        added++
      }
    }

    // Write back with proper indentation
    const out = JSON.stringify(json, null, 2) + '\n'
    writeFileSync(path, out, 'utf-8')
    console.log(`${lang}.json: added ${added} keys (total: ${Object.keys(json.translation).length})`)
  }
}

main()
