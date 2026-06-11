import json

# Load extras (original Chinese translations)
with open('src/i18n/locales/_extras/zh.extras.json', encoding='utf-8') as f:
    extras = json.load(f)

# Load current zh.json
with open('src/i18n/locales/zh.json', encoding='utf-8') as f:
    zh = json.load(f)

zh_trans = zh['translation']
restored = 0
for key_path, zh_value in extras.items():
    parts = key_path.split('.')
    if len(parts) == 2 and parts[0] == 'translation':
        key = parts[1]
        if key in zh_trans:
            zh_trans[key] = zh_value
            restored += 1

with open('src/i18n/locales/zh.json', 'w', encoding='utf-8') as f:
    json.dump(zh, f, indent=2, ensure_ascii=False)
    f.write('\n')

print(f'Restored {restored} Chinese translations from extras')
