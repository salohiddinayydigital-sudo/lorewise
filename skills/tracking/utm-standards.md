# Multi-Channel UTM Parameter Standards & Governance

A strict convention for multi-channel campaign tagging to eliminate data fragmentation and ensure seamless reporting across GA4, CRM, and ad platforms.

---

## 1. Core Principles of UTM Governance

1. **Strict Lowercase Only:**
   - Analytics tools treat `Facebook`, `facebook`, and `fb` as three separate traffic sources. Always use lowercase.
2. **Hyphen Separators:**
   - Use hyphens (`-`) to separate words. Never use spaces, plus signs (`+`), or camelCase.
3. **No Redundant Parameters:**
   - Never encode personal identifiable information (PII) like customer emails or phone numbers in URLs.
4. **Parameter Persistence:**
   - Verify that web servers do not strip query parameters during trailing-slash 301 redirects (e.g. `domain.com/landing?utm=...` redirecting to `domain.com/landing/`).

---

## 2. Standard Parameter Definitions

| Parameter | Purpose | Permitted Values / Pattern | Examples |
|---|---|---|---|
| **`utm_source`** | The platform originating the click | `meta`, `google`, `telegram`, `tiktok`, `email` | `utm_source=meta` |
| **`utm_medium`** | The advertising channel or delivery medium | `cpc`, `paid-social`, `sponsored-msg`, `display` | `utm_medium=paid-social` |
| **`utm_campaign`** | Specific campaign name and objective | `<objective>-<funnel>-<campaign-name>` | `utm_campaign=sales-tofu-skincare-v1` |
| **`utm_content`** | Creative asset, visual hook, or format | `<ad-format>-<hook-id>-<asset-name>` | `utm_content=ugc-h01-founder-story` |
| **`utm_term`** | Targeted keyword or audience segment | `<audience-name>` or `<search-keyword>` | `utm_term=broad-25-44` |

---

## 3. Dynamic Platform URL Parameter Templates

Use platform dynamic macros to ensure accurate, automated tracking:

### Meta Ads URL Parameter String:
```text
utm_source=meta&utm_medium=paid-social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}
```

### Google Ads ValueTrack Parameter String:
```text
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}&matchtype={matchtype}&device={device}
```

### Telegram Ads Destination URL Pattern:
```text
https://t.me/YourBot?start=tg_{campaign_id}_{creative_id}
```

### TikTok Ads URL Parameter String:
```text
utm_source=tiktok&utm_medium=paid-social&utm_campaign=__CAMPAIGN_NAME__&utm_content=__CID_NAME__&utm_term=__AID_NAME__
```
