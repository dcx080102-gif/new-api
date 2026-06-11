import json

with open('src/i18n/locales/en.json', encoding='utf-8') as f:
    en = json.load(f)
trans = en['translation']

# Fix known bad
if trans.get('Password') == '***':
    trans['Password'] = 'Password'
    print('Fixed: Password *** → Password')

# Scan for other *** values
bad = [(k, v) for k, v in trans.items() if v == '***']
if bad:
    print(f'Found {len(bad)} other *** values:')
    for k, v in bad[:30]:
        print(f'  {k}')
        trans[k] = k  # fix
else:
    print('No other *** values found')

with open('src/i18n/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en, f, indent=2, ensure_ascii=False)
    f.write('\n')
print('Done')
