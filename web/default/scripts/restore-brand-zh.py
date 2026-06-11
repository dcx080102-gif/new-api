import json

# Chinese keys should have Chinese values
ZH_VALUES = {
    "服务运行中": "服务运行中",
    "一个 API": "一个 API",
    "开启 AI 无限可能": "开启 AI 无限可能",
    "汇聚 40+ AI 大模型，统一接入、统一计费、统一管理": "汇聚 40+ AI 大模型，统一接入、统一计费、统一管理",
    "99.9% 在线率": "99.9% 在线率",
    "多节点容灾，服务永不掉线": "多节点容灾，服务永不掉线",
    "极速响应": "极速响应",
    "平均延迟低于 80ms，丝滑体验": "平均延迟低于 80ms，丝滑体验",
    "企业级安全": "企业级安全",
    "数据加密隔离，SOC 2 合规": "数据加密隔离，SOC 2 合规",
    "透明计费": "透明计费",
    "用多少付多少，无隐藏费用": "用多少付多少，无隐藏费用",
    "开发者信赖": "开发者信赖",
    "AI 模型接入": "AI 模型接入",
    "日处理请求": "日处理请求",
}

with open('src/i18n/locales/zh.json', encoding='utf-8') as f:
    zh = json.load(f)

zh_trans = zh['translation']
for key, value in ZH_VALUES.items():
    if key in zh_trans:
        zh_trans[key] = value

with open('src/i18n/locales/zh.json', 'w', encoding='utf-8') as f:
    json.dump(zh, f, indent=2, ensure_ascii=False)
    f.write('\n')

print('Restored Chinese values')
