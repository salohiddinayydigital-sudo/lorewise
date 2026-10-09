---
platform: telegram
facts:
  - id: TG-FACT-01
    claim: Telegram Ads operates on a competitive CPM auction model where advertisers bid for every 1,000 sponsored message impressions delivered across public channels.
    source: https://promote.telegram.org/guidelines
    checked: 2026-09-15
    expires: 2027-09-15
  - id: TG-FACT-02
    claim: Sponsored messages appear in public channels with over 1,000 subscribers and link directly to public channels, Telegram bots, Mini Apps, or external websites.
    source: https://promote.telegram.org/guidelines
    checked: 2026-09-15
    expires: 2027-09-15
  - id: TG-FACT-03
    claim: External website destinations in Telegram Ads require valid landing page protocols and must utilize UTM tracking parameters for cross-platform attribution.
    source: https://promote.telegram.org/
    checked: 2026-09-15
    expires: 2027-09-15
  - id: TG-FACT-04
    claim: Granular targeting allows selecting specific public channel handles, topic categories, language, and country filters alongside negative channel exclusion lists.
    source: https://promote.telegram.org/
    checked: 2026-09-15
    expires: 2027-09-15
---

# Telegram Ads Platform Reference

Official reference rules, bidding models, sponsored message constraints, and attribution mechanics for Telegram Ads.

## Fact Index

### TG-FACT-01: CPM Auction Model
- **Claim:** Telegram Ads operates on a competitive CPM auction model where advertisers bid for every 1,000 sponsored message impressions delivered across public channels.
- **Source:** [Telegram Ad Platform Guidelines](https://promote.telegram.org/guidelines)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### TG-FACT-02: Public Channel Serving & Destination Scope
- **Claim:** Sponsored messages appear in public channels with over 1,000 subscribers and link directly to public channels, Telegram bots, Mini Apps, or external websites.
- **Source:** [Telegram Ad Platform Guidelines](https://promote.telegram.org/guidelines)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### TG-FACT-03: External URL & UTM Tracking Hygiene
- **Claim:** External website destinations in Telegram Ads require valid landing page protocols and must utilize UTM tracking parameters for cross-platform attribution.
- **Source:** [Telegram Ad Platform](https://promote.telegram.org/)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### TG-FACT-04: Channel Handle & Category Targeting
- **Claim:** Granular targeting allows selecting specific public channel handles, topic categories, language, and country filters alongside negative channel exclusion lists.
- **Source:** [Telegram Ad Platform](https://promote.telegram.org/)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

---

## Strategic Measurement & Benchmarks

1. **Core Efficiency Metrics:**
   - **CPM (Cost Per Mille):** Raw auction price per 1,000 impressions.
   - **CTR (Click-Through Rate):** $\frac{\text{Clicks}}{\text{Impressions}} \times 100$. (Benchmark: $0.8\% - 2.5\%$).
   - **Cost Per Join (CPJ / CPS):** $\frac{\text{Spend}}{\text{Channel Joins}}$. Primary metric for audience building.
   - **Cost Per Bot Start (CPS):** $\frac{\text{Spend}}{\text{Bot Activations}}$. Key conversion metric for Telegram funnel automation.
   - **Cost Per Click (CPC):** $\frac{\text{Spend}}{\text{External Clicks}}$. Key metric for web/store traffic.

2. **Attribution & Reconciled Gaps:**
   - External web traffic from Telegram Ads must carry `utm_source=telegram&utm_medium=ads&utm_campaign=<id>`.
   - In-app conversions (Channel Joins or Bot Starts) must be reconciled with Telegram native dashboard exports; they never register inside Google Analytics without webhook telemetry.

---

## Strategic Architecture & Best Practices

### 1. Sponsored Message Format & Editorial Guidelines
- **Character Constraint:**
  * Maximum 160 characters of text per sponsored message. Every word must carry high information density.
- **Editorial Policies & Moderation:**
  * **Capitalization:** No words written in all capitals (ALL CAPS) except recognized acronyms.
  * **Links & Formatting:** No URL shorteners (e.g. bit.ly, tinyurl); link directly to approved domains or official Telegram entities (`t.me/...`).
  * **Sensationalism & Emojis:** No clickbait claims ("Secret method", "Make $10k today"); maintain neutral, objective, and informative phrasing. Emojis must be used minimally ($\le 1$) and without visual distraction.
- **Destination Types:**
  * **Public Channel:** Best for subscriber growth and long-term audience building.
  * **Telegram Bot (`t.me/bot?start=<ref>`):** Best for lead generation, automated onboarding, and immediate conversational sales funnels.
  * **Telegram Mini App:** Best for in-app ecommerce, Web3 integrations, and frictionless transactions without browser exit.
  * **External Website:** Direct landing page with compulsory UTM parameters.

### 2. Targeting Architecture & Placement Selection
- **Target Specific Channels:**
  * Select high-affinity public channels ($\ge 1,000$ subscribers) where target buyers actively consume content.
  * Monitor channel CPMs: if CPM spikes $> 30\%$ without CTR increase, audience has saturated.
- **Target Topics & Categories:**
  * Broad category targeting (e.g. Business & Finance, Technology, Marketing & PR).
  * Pair topic targeting with country and language filters to prevent untargeted impression waste.
- **Negative Channel Exclusions:**
  * Maintain an active exclusion list of irrelevant channels, spam channels, and competitor channels where sponsored messages should never appear.

### 3. Bot Funnel & Lead Economics
- **Bot Attribution Payload:**
  * Use deep linking parameters (e.g. `t.me/example_bot?start=tgads_c1`) to attribute `/start` commands directly to specific ad campaigns.
- **Cost Per Qualified Lead (CPQL):**
  * Measure funnel conversion beyond the initial `/start`:
    $$\text{CPQL} = \frac{\text{Telegram Ad Spend}}{\text{Completed Bot Onboardings}}$$
  * Track drop-off between Bot Start $\to$ Phone/Email capture $\to$ Purchase.

