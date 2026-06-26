import re, json, os

base = r'C:\Users\lenovo\new-api-app\web\default'

# Extract all t() keys from faq.tsx
with open(os.path.join(base, 'src/features/home/components/sections/faq.tsx'), 'r', encoding='utf-8') as f:
    content = f.read()
pattern = re.compile(r"""t\((['"])((?:[^\\'"]|\\.)*?)\1\)""")
keys = set(m[1] for m in pattern.findall(content))
print('Keys found in faq.tsx:')
for k in sorted(keys):
    print(f'  {k}')

# Check en and zh
missing = {}
for lang in ['en', 'zh']:
    fp = os.path.join(base, f'src/i18n/locales/{lang}.json')
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    trans = data['translation']
    for k in keys:
        if k not in trans:
            missing.setdefault(k, []).append(lang)

if missing:
    print('\nMISSING keys:')
    for k, langs in missing.items():
        print(f'  [{k}] missing in: {langs}')
else:
    print('\nAll keys present in en+zh!')
