import json

TRANSLATIONS = {
    "服务运行中": {
        "en": "Services Running",
        "ja": "サービス稼働中",
        "ru": "Сервисы работают",
    },
    "一个 API": {
        "en": "One API",
        "ja": "ひとつのAPI",
        "ru": "Один API",
    },
    "开启 AI 无限可能": {
        "en": "Unlock Infinite AI Possibilities",
        "ja": "AIの無限の可能性を開く",
        "ru": "Откройте безграничные возможности ИИ",
    },
    "汇聚 40+ AI 大模型，统一接入、统一计费、统一管理": {
        "en": "40+ AI models, unified access, billing & management",
        "ja": "40以上のAIモデルを統合、統一アクセス・課金・管理",
        "ru": "40+ ИИ-моделей, единый доступ, биллинг и управление",
    },
    "99.9% 在线率": {
        "en": "99.9% Uptime",
        "ja": "99.9%の稼働率",
        "ru": "99.9% время безотказной работы",
    },
    "多节点容灾，服务永不掉线": {
        "en": "Multi-node failover, always online",
        "ja": "マルチノード冗長化、常時オンライン",
        "ru": "Многоузловое резервирование, всегда онлайн",
    },
    "极速响应": {
        "en": "Lightning Fast",
        "ja": "超高速応答",
        "ru": "Молниеносный отклик",
    },
    "平均延迟低于 80ms，丝滑体验": {
        "en": "Avg latency &lt;80ms, silky smooth",
        "ja": "平均遅延80ms未満、シルクのような滑らかさ",
        "ru": "Средняя задержка &lt;80мс, плавная работа",
    },
    "企业级安全": {
        "en": "Enterprise Security",
        "ja": "エンタープライズセキュリティ",
        "ru": "Корпоративная безопасность",
    },
    "数据加密隔离，SOC 2 合规": {
        "en": "Data encryption & isolation, SOC 2 compliant",
        "ja": "データ暗号化・分離、SOC 2準拠",
        "ru": "Шифрование и изоляция данных, соответствие SOC 2",
    },
    "透明计费": {
        "en": "Transparent Billing",
        "ja": "透明な課金",
        "ru": "Прозрачный биллинг",
    },
    "用多少付多少，无隐藏费用": {
        "en": "Pay-as-you-go, no hidden fees",
        "ja": "使った分だけ、隠れた費用なし",
        "ru": "Платите за использование, без скрытых платежей",
    },
    "开发者信赖": {
        "en": "Trusted by Developers",
        "ja": "開発者から信頼",
        "ru": "Доверяют разработчики",
    },
    "AI 模型接入": {
        "en": "AI Models Integrated",
        "ja": "AIモデル接続",
        "ru": "Подключено ИИ-моделей",
    },
    "日处理请求": {
        "en": "Daily Requests",
        "ja": "日次リクエスト",
        "ru": "Запросов в день",
    },
}

LOCALE_FILES = {
    "en": "src/i18n/locales/en.json",
    "ja": "src/i18n/locales/ja.json",
    "ru": "src/i18n/locales/ru.json",
}

for lang, path in LOCALE_FILES.items():
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    trans = data['translation']
    added = 0
    for key, translations in TRANSLATIONS.items():
        if key not in trans:
            trans[key] = translations[lang]
            added += 1
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')
    print(f'{lang}: added {added} new keys')
