# Video Creative Card & Retention Specification

A Video Creative Card catalogs video-specific retention metrics, timeline breakdowns, audio formatting, hook classifications, and isolated fatigue signals.

---

## 1. Specification Schema

Stored in `lorewise/clients/<slug>/creative/cards/video-<id>.md` or embedded within creative audit reports:

```yaml
---
id: VCR-<slug>-<asset_id>
client: <slug>
asset_file: <relative_path_to_video_or_storyboard>
platform: meta | tiktok | youtube
format: 9:16_reel_story | 1:1_feed | 16:9_landscape
duration_seconds: <number>
video_metrics:
  spend: <amount_usd> # [rX]
  impressions: <count> # [rX]
  video_plays_3s: <count> # [rX]
  thruplays_15s: <count> # [rX]
  video_plays_100p: <count> # [rX]
  average_watch_time_sec: <seconds> # [rX]
  hook_rate_percent: <3s_plays / impressions * 100> # [rX]
  hold_rate_percent: <thruplays / 3s_plays * 100> # [rX]
  cpa: <amount_usd> # [rX]
hook_classification:
  hook_type: pattern_interrupt | problem_agitate | curiosity_gap | before_after | ugc_reaction | product_demo
  audio_style: direct_talking_head | voiceover_narrative | trending_sound | sound_effects_captioned
  caption_style: dynamic_word_by_word | standard_subtitles | minimal_overlay
fatigue_diagnosis:
  fatigue_type: none | hook_fatigue | body_fatigue | audience_fatigue
  recommended_action: scale | iterate_opening_hook | rewrite_body_pacing | rotate_audience | pause
---

# Video Creative Card: <id>

### Retention Funnel Analysis
- **Hook Rate (0–3s):** Percentage of users stopped in the feed.
  * $> 30\%$: Strong hook.
  * $20\% - 30\%$: Moderate hook.
  * $< 20\%$: Weak hook requiring headline or opening visual iteration.
- **Hold Rate (3–15s):** Percentage of hooked users who consumed the core argument.
  * $> 30\%$: High engagement.
  * $< 15\%$: Severe drop-off during problem or demonstration scene.
- **Completion Rate:** Percentage watching through to the final call to action.

### Timeline Storyboard Breakdown
| Timestamp | Scene Purpose | Visual Element | Audio / Voiceover Track | On-Screen Text Overlay |
|---|---|---|---|---|
| **00:00–00:03** | Hook / Stop Scroll | Immediate problem depiction | "Stop wasting money on..." | Bold contrast hook |
| **00:03–00:08** | Problem Agitation | Close-up of frustration | Explains root barrier cause | "Why standard creams fail" |
| **00:08–00:16** | Product Demo | Dropper application & texture | Texture feel & absorption | "Locks in hydration 24h" |
| **00:16–00:23** | Proof & Authority | Before/After skin scan | Dermatologist review quote | Verified 5-star badge |
| **00:23–00:30** | Offer & CTA | Product hero bundle shot | "Shop the link for 20% off" | "Shop Now — Free Shipping" |

### Fatigue Root-Cause Diagnosis
1. **Hook Fatigue:** Hook rate has declined by $> 20\%$ over the past 14 days, while hold rate remains steady.
   - *Prescription:* Keep scenes 2 through 5 intact; test 3 fresh 3-second opening hook variants (cuts creative production cost by 80%).
2. **Body Fatigue:** Hook rate remains healthy, but hold rate has collapsed by $> 25\%$.
   - *Prescription:* Retain the opening hook; tighten pacing between seconds 3 and 10 or replace the middle demonstration.
3. **Audience Fatigue:** Both hook and hold rates are stable, but frequency $> 4.5$ and CPA has escalated $> 30\%$.
   - *Prescription:* Expand audience boundaries, test Lookalikes, or rotate ad sets.
```

---

## 2. Reference Example: VCR-demo-shop-vid-01

```yaml
---
id: VCR-demo-shop-vid-01
client: demo-shop
asset_file: creative/vid-01-barrier-repair.mp4
platform: meta
format: 9:16_reel_story
duration_seconds: 28
video_metrics:
  spend: 1450.00
  impressions: 48000
  video_plays_3s: 16800
  thruplays_15s: 5880
  video_plays_100p: 2160
  average_watch_time_sec: 8.4
  hook_rate_percent: 35.0
  hold_rate_percent: 35.0
  cpa: 33.72
hook_classification:
  hook_type: problem_agitate
  audio_style: direct_talking_head
  caption_style: dynamic_word_by_word
fatigue_diagnosis:
  fatigue_type: none
  recommended_action: scale
---

# Video Creative Card: VCR-demo-shop-vid-01

### Performance Summary
- **Hook Efficiency:** Exceptional 35.0% 3-second hook rate; direct question format successfully interrupts feed scrolling.
- **Hold Retention:** Strong 35.0% ThruPlay hold rate through the 15-second product demonstration scene.
- **CPA:** $33.72 beating the account target of $35.00 [r14].
- **Next Action:** Scale budget allocation +$80/day via change packet.
```
