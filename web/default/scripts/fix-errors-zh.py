import json

TRANSLATIONS = {
    "Unauthorized Access": "未授权访问",
    "Please log in with the appropriate credentials": "请使用正确的凭据登录",
    "to access this resource.": "以访问此资源。",
    "You don't have necessary permission": "您没有必要的权限",
    "to view this resource.": "以查看此资源。",
    "Oops! Something went wrong": "哎呀！出了点问题",
    "Too many requests": "请求过于频繁",
    "Please wait a moment before trying again.": "请稍等片刻后再试。",
    "Please try again later.": "请稍后再试。",
    "We apologize for the inconvenience.": "抱歉给您带来不便。",
    "If this keeps happening, please report it on GitHub Issues.": "如果此问题持续发生，请在 GitHub Issues 上报告。",
    "Report an issue": "报告问题",
}

with open('src/i18n/locales/zh.json', encoding='utf-8') as f:
    zh = json.load(f)

zh_trans = zh['translation']
updated = 0
for key, value in TRANSLATIONS.items():
    if key in zh_trans:
        zh_trans[key] = value
        updated += 1

with open('src/i18n/locales/zh.json', 'w', encoding='utf-8') as f:
    json.dump(zh, f, indent=2, ensure_ascii=False)
    f.write('\n')

print(f'Updated {updated} keys')
