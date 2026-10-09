# Creative Card Format Specification

A Creative Card catalogs an individual creative asset's visual attributes, messaging angle, and audited performance figures.

---

## 1. Specification Schema

Each creative card is stored in `lorewise/clients/<slug>/creative/cards/<ad_id>.md` or rendered within weekly reports:

```yaml
---
id: CR-<slug>-<asset_id>
client: <slug>
asset_file: <relative_path_to_image_or_video>
platform: meta | google | tiktok
format: static_image | carousel | ugc_video | motion_graphic
visual_hook: problem_first | product_hero | testimonial | comparison | lifestyle
copy_angle: pain_relief | social_proof | price_anchored | founder_story | curiosity
cta_text: Shop Now | Learn More | Claim Offer | Order Today
status: testing | scaling | fatigued | underperforming
metrics:
  spend: <amount_usd> # [rX]
  impressions: <count> # [rX]
  clicks: <count> # [rX]
  ctr_percent: <percentage> # [rX]
  purchases: <count> # [rX]
  cpa: <amount_usd> # [rX]
  roas: <ratio_or_null> # [rX]
fatigue_indicators:
  frequency: <rolling_frequency> # [rX]
  ctr_trend: rising | stable | decaying
  cpa_trend: improving | stable | degrading
recommendation: scale | iterate_hook | replace_copy | pause
---

# Creative Card: <CR-ID>

### Visual & Messaging Breakdown
- **Headline / Hook:** Core visual focus in first 3 seconds or primary headline.
- **Copy Angle:** Underlying customer desire or objection targeted.
- **Visual Composition:** Layout, contrast, color dominance, and text-to-image balance.

### Performance Summary & Receipts
- **Spend & Conversions:** Key metrics citing verified receipt IDs.
- **Fatigue Verdict:** Rationale for assigned status.
- **Next Action:** Clear next step (e.g. iterate opening visual, expand budget).
```

---

## 2. Status Determination Rules

1. `testing`: Spend $< \$300$ or impressions $< 10,000$; insufficient volume to confirm efficiency.
2. `scaling`: CPA $\le$ target CPA, frequency $< 3.5$, positive conversion volume.
3. `fatigued`: Frequency $> 4.0$ with 7-day CTR decay $> 15\%$ and CPA increase $> 20\%$.
4. `underperforming`: Spent $> 3\times$ target CPA without generating verified purchases.

---

## 3. Demo Account Reference Cards

### Example: CR-demo-shop-ad-01 (Fatigued Broad Asset)

```yaml
---
id: CR-demo-shop-ad-01
client: demo-shop
asset_file: creative/ad-01.png
platform: meta
format: static_image
visual_hook: product_hero
copy_angle: pain_relief
cta_text: Shop Now
status: fatigued
metrics:
  spend: 1840.50
  impressions: 48500
  clicks: 436
  ctr_percent: 0.90
  purchases: 38
  cpa: 48.43
  roas: null
fatigue_indicators:
  frequency: 4.80
  ctr_trend: decaying
  cpa_trend: degrading
recommendation: pause
---

# Creative Card: CR-demo-shop-ad-01

### Visual & Messaging Breakdown
- **Headline / Hook:** "Hydration That Actually Lasts All Day"
- **Copy Angle:** Addresses chronic dry skin fatigue.
- **Visual Composition:** High-contrast bottle shot against neutral beige backdrop with minimal text overlay.

### Performance Summary
- **Frequency Fatigue:** Rolling frequency reached 4.80 on Broad 25-44 audience.
- **Efficiency Decay:** CPA decayed to $48.43 vs $35.00 account target.
- **Verdict:** Paused in favor of fresh Lookalike creative variants.
```

### Example: CR-demo-shop-ad-02 (Winning Lookalike Asset)

```yaml
---
id: CR-demo-shop-ad-02
client: demo-shop
asset_file: creative/ad-02.png
platform: meta
format: static_image
visual_hook: testimonial
copy_angle: social_proof
cta_text: Shop Now
status: scaling
metrics:
  spend: 1398.10
  impressions: 46200
  clicks: 740
  ctr_percent: 1.60
  purchases: 41
  cpa: 34.10
  roas: null
fatigue_indicators:
  frequency: 2.10
  ctr_trend: stable
  cpa_trend: improving
recommendation: scale
---

# Creative Card: CR-demo-shop-ad-02

### Visual & Messaging Breakdown
- **Headline / Hook:** "My Dermatologist Asked What I Was Using"
- **Copy Angle:** Authority and third-party peer validation.
- **Visual Composition:** UGC selfie format with verified customer review badge.

### Performance Summary
- **Efficiency:** CPA at $34.10 beating $36.00 bet target [B-014].
- **Fatigue Check:** Healthy frequency at 2.10; CTR strong at 1.60%.
- **Verdict:** Scale budget by +$60/day via change packet.
```
