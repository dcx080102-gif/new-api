import json

with open('src/i18n/locales/_extras/zh.extras.json', encoding='utf-8') as f:
    extras = json.load(f)

with open('src/i18n/locales/en.json', encoding='utf-8') as f:
    en = json.load(f)

en_trans = en['translation']
added = 0
for key_path, zh_value in extras.items():
    parts = key_path.split('.')
    if len(parts) == 2 and parts[0] == 'translation':
        key = parts[1]
        if key not in en_trans:
            en_trans[key] = key
            added += 1

with open('src/i18n/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en, f, indent=2, ensure_ascii=False)
    f.write('\n')

print(f'Added {added} new keys to en.json')
