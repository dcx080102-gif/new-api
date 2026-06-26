import json
import os

base = r'C:\Users\lenovo\new-api-app\web\default\src\i18n\locales'

faq_keys = {
    "FAQ": {"en": "FAQ", "zh": "\u5e38\u89c1\u95ee\u9898"},
    "Still have questions?": {"en": "Still have questions?", "zh": "\u8fd8\u6709\u7591\u95ee\uff1f"},
    "Common questions and answers about otter Link": {"en": "Common questions and answers about otter Link", "zh": "\u5173\u4e8e otter Link \u7684\u5e38\u89c1\u95ee\u9898\u548c\u89e3\u7b54"},
    "What's the difference between otter Link and official APIs?": {"en": "What's the difference between otter Link and official APIs?", "zh": "otter Link \u548c\u5b98\u65b9 API \u6709\u4ec0\u4e48\u533a\u522b\uff1f"},
    "With otter Link, you don't need an overseas credit card, don't need to deal with network restrictions, and don't need to register with multiple providers separately. One API key, one base_url, recharge via Alipay/WeChat \u2014 you get access to the world's best AI models. We handle all the infrastructure headaches for you.": {"en": "With otter Link, you don't need an overseas credit card, don't need to deal with network restrictions, and don't need to register with multiple providers separately. One API key, one base_url, recharge via Alipay/WeChat \u2014 you get access to the world's best AI models. We handle all the infrastructure headaches for you.", "zh": "\u4f7f\u7528 otter Link\uff0c\u4f60\u4e0d\u9700\u8981\u6d77\u5916\u4fe1\u7528\u5361\u3001\u4e0d\u9700\u8981\u641e\u5b9a\u7f51\u7edc\u9650\u5236\u3001\u4e0d\u9700\u8981\u5206\u522b\u5bf9\u63a5\u591a\u4e2a\u5382\u5546\u3002\u4e00\u4e2aAPI Key\u3001\u4e00\u884cbase_url\u3001\u652f\u4ed8\u5b9d\u5fae\u4fe1\u5c31\u80fd\u5145\u503c\uff0c\u76f4\u63a5\u8c03\u7528\u5168\u7403\u6700\u597d\u7684AI\u6a21\u578b\u3002\u6211\u4eec\u5e2e\u4f60\u89e3\u51b3\u4e86\u6240\u6709\u57fa\u7840\u8bbe\u65bd\u95ee\u9898\u3002"},
    "Are the models genuine? Will outputs be degraded?": {"en": "Are the models genuine? Will outputs be degraded?", "zh": "\u6a21\u578b\u662f\u6b63\u7248\u5417\uff1f\u4f1a\u4e0d\u4f1a\u63ba\u6c34\u964d\u667a\uff1f"},
    "Every upstream channel we connect goes through individual verification \u2014 model identity checks, output quality comparison, and knowledge cutoff validation. We commit to no model swapping, no output degradation, and no impersonation. See our documentation for the full verification methodology.": {"en": "Every upstream channel we connect goes through individual verification \u2014 model identity checks, output quality comparison, and knowledge cutoff validation. We commit to no model swapping, no output degradation, and no impersonation. See our documentation for the full verification methodology.", "zh": "\u6211\u4eec\u63a5\u5165\u7684\u6bcf\u6761\u4e0a\u6e38\u6e20\u9053\u90fd\u7ecf\u8fc7\u9010\u4e00\u9a8c\u8bc1\u2014\u2014\u5305\u62ec\u6a21\u578b\u8eab\u4efd\u68c0\u6d4b\u3001\u8f93\u51fa\u8d28\u91cf\u5bf9\u6bd4\u3001\u77e5\u8bc6\u622a\u6b62\u9a8c\u8bc1\u3002\u6211\u4eec\u627f\u8bfa\u4e0d\u63ba\u6c34\u3001\u4e0d\u5192\u5145\u3001\u4e0d\u964d\u667a\u3002\u5177\u4f53\u9a8c\u8bc1\u65b9\u6cd5\u8bf7\u67e5\u770b\u6587\u6863\u3002"},
    "Is my data safe? Do you store my requests?": {"en": "Is my data safe? Do you store my requests?", "zh": "\u6211\u7684\u6570\u636e\u5b89\u5168\u5417\uff1f\u4f60\u4eec\u4f1a\u5b58\u6211\u7684\u8bf7\u6c42\u5417\uff1f"},
    "Full end-to-end HTTPS encryption. Requests are never logged, never used for training, and never leave our infrastructure boundary. We are a pure conduit \u2014 your data passes through, it does not stay.": {"en": "Full end-to-end HTTPS encryption. Requests are never logged, never used for training, and never leave our infrastructure boundary. We are a pure conduit \u2014 your data passes through, it does not stay.", "zh": "\u5168\u94fe\u8defHTTPS\u52a0\u5bc6\u4f20\u8f93\u3002\u8bf7\u6c42\u6570\u636e\u4e0d\u8bb0\u5f55\u3001\u4e0d\u7528\u4e8e\u8bad\u7ec3\u3001\u4e0d\u51fa\u5883\u3002\u6211\u4eec\u53ea\u662f\u7ba1\u9053\u2014\u2014\u4f60\u7684\u6570\u636e\u6d41\u8fc7\uff0c\u4e0d\u4f1a\u505c\u7559\u3002"},
    "Why are your prices lower than official?": {"en": "Why are your prices lower than official?", "zh": "\u4e3a\u4ec0\u4e48\u4ef7\u683c\u6bd4\u5b98\u65b9\u4fbf\u5b9c\uff1f"},
    "We reduce costs through enterprise bulk purchasing and channel optimization. Upstream is 1:1 top-up \u2014 we don't add markup on resale. Our profit comes from volume, not from padding the unit price.": {"en": "We reduce costs through enterprise bulk purchasing and channel optimization. Upstream is 1:1 top-up \u2014 we don't add markup on resale. Our profit comes from volume, not from padding the unit price.", "zh": "\u6211\u4eec\u901a\u8fc7\u4f01\u4e1a\u6279\u91cf\u91c7\u8d2d\u548c\u6e20\u9053\u4f18\u5316\u964d\u4f4e\u6210\u672c\u3002\u4e0a\u6e38\u662f1:1\u5145\u503c\uff0c\u6211\u4eec\u4e0d\u52a0\u4ef7\u8f6c\u552e\u3002\u6211\u4eec\u8d5a\u7684\u662f'\u91cf'\u7684\u94b1\uff0c\u4e0d\u662f'\u5dee\u4ef7'\u7684\u94b1\u3002"},
    "Will my balance expire?": {"en": "Will my balance expire?", "zh": "\u5145\u503c\u7684\u94b1\u4f1a\u8fc7\u671f\u5417\uff1f"},
    "No. Your balance never expires. Top up as much or as little as you need, with no forced subscription.": {"en": "No. Your balance never expires. Top up as much or as little as you need, with no forced subscription.", "zh": "\u4e0d\u4f1a\u3002\u4f59\u989d\u6c38\u4e45\u6709\u6548\uff0c\u7528\u591a\u5c11\u5145\u591a\u5c11\uff0c\u6ca1\u6709\u5f3a\u5236\u8ba2\u9605\u3002"},
    "What payment methods do you support?": {"en": "What payment methods do you support?", "zh": "\u652f\u6301\u54ea\u4e9b\u652f\u4ed8\u65b9\u5f0f\uff1f"},
    "We currently support WeChat Pay and Alipay. More payment methods are being added over time.": {"en": "We currently support WeChat Pay and Alipay. More payment methods are being added over time.", "zh": "\u76ee\u524d\u652f\u6301\u5fae\u4fe1\u652f\u4ed8\u548c\u652f\u4ed8\u5b9d\uff0c\u66f4\u591a\u652f\u4ed8\u65b9\u5f0f\u6301\u7eed\u66f4\u65b0\u4e2d\u3002"},
}

for lang in ['en', 'zh']:
    filepath = os.path.join(base, f'{lang}.json')
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    trans = data['translation']
    added = 0
    for key, val in faq_keys.items():
        if key not in trans:
            trans[key] = val[lang]
            added += 1

    data['translation'] = dict(sorted(trans.items(), key=lambda x: x[0].lower()))

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

    print(f'{lang}.json: added {added} keys, total {len(trans)} keys')

print('Done!')
