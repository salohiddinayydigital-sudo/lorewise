---
platform: meta
facts:
  - id: META-FACT-01
    claim: Meta default attribution window is 7-day click and 1-day view post-iOS 14.5.
    source: https://www.facebook.com/business/help/307044033322194
    checked: 2026-09-15
    expires: 2027-09-15
  - id: META-FACT-02
    claim: Learning phase requires approximately 50 conversion events per ad set within a 7-day period to exit learning limited.
    source: https://www.facebook.com/business/help/112167992830700
    checked: 2026-09-15
    expires: 2027-09-15
  - id: META-FACT-03
    claim: Frequency metric represents the average estimated number of times each unique person saw an ad over the selected date range.
    source: https://www.facebook.com/business/help/337150259747984
    checked: 2026-09-15
    expires: 2027-09-15
  - id: META-FACT-04
    claim: Advantage+ Shopping campaigns require at least one active conversion dataset and automatically allocate budget across creatives and audiences.
    source: https://www.facebook.com/business/help/527806509177579
    checked: 2026-09-15
    expires: 2027-09-15
  - id: META-FACT-05
    claim: Meta Conversions API (CAPI) deduplication requires identical event_name and event_id between browser pixel and server events.
    source: https://www.facebook.com/business/help/823677331451951
    checked: 2026-09-15
    expires: 2027-09-15
  - id: META-FACT-06
    claim: Meta attributes conversions to the date and time of ad impression or click rather than the timestamp of conversion purchase.
    source: https://www.facebook.com/business/help/422492657922238
    checked: 2026-09-15
    expires: 2027-09-15
  - id: META-FACT-07
    claim: Significant ad edits including budget modifications exceeding 20 percent or creative swaps reset ad set learning phase progress.
    source: https://www.facebook.com/business/help/316478108955072
    checked: 2026-09-15
    expires: 2027-09-15
---

# Meta Ads Platform Reference

Official reference rules and platform attribution mechanics for Meta Ads (Facebook & Instagram).

## Fact Index

### META-FACT-01: Default Conversion Attribution Window
- **Claim:** Meta default attribution window is 7-day click and 1-day view post-iOS 14.5.
- **Source:** [Meta Business Help Center](https://www.facebook.com/business/help/307044033322194)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### META-FACT-02: Learning Phase Conversion Volume
- **Claim:** Learning phase requires approximately 50 conversion events per ad set within a 7-day period to exit learning limited.
- **Source:** [Meta Business Help Center](https://www.facebook.com/business/help/112167992830700)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### META-FACT-03: Frequency Measurement Definition
- **Claim:** Frequency metric represents the average estimated number of times each unique person saw an ad over the selected date range.
- **Source:** [Meta Business Help Center](https://www.facebook.com/business/help/337150259747984)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### META-FACT-04: Advantage+ Shopping Campaign Constraints
- **Claim:** Advantage+ Shopping campaigns require at least one active conversion dataset and automatically allocate budget across creatives and audiences.
- **Source:** [Meta Business Help Center](https://www.facebook.com/business/help/527806509177579)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### META-FACT-05: Conversions API Event Deduplication
- **Claim:** Meta Conversions API (CAPI) deduplication requires identical event_name and event_id between browser pixel and server events.
- **Source:** [Meta Business Help Center](https://www.facebook.com/business/help/823677331451951)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### META-FACT-06: Impression & Click Attribution Timestamping
- **Claim:** Meta attributes conversions to the date and time of ad impression or click rather than the timestamp of conversion purchase.
- **Source:** [Meta Business Help Center](https://www.facebook.com/business/help/422492657922238)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### META-FACT-07: Learning Phase Reset Triggers
- **Claim:** Significant ad edits including budget modifications exceeding 20 percent or creative swaps reset ad set learning phase progress.
- **Source:** [Meta Business Help Center](https://www.facebook.com/business/help/316478108955072)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

---

## Strategic Architecture & Best Practices

### 1. Budget Architecture: CBO vs ABO
- **Advantage Campaign Budget (CBO):**
  * Recommended when scaling across 3 or more proven ad sets.
  * Allows Meta's auction liquidity algorithm to dynamically route spend to the lowest-cost conversion opportunities in real time.
  * Use minimum/maximum ad set spend limits sparingly; aggressive limits defeat algorithmic liquidity.
- **Ad Set Budget (ABO):**
  * Recommended for controlled creative testing or new audience isolation where each variant requires guaranteed minimum spend (e.g. testing 3 hook variations).

### 2. Bid Strategies & Auction Dynamics
- **Highest Volume (Default):**
  * Maximizes total conversions from the allocated budget. Ideal for cold prospecting and rapid discovery.
- **Cost Cap:**
  * Enforces an average CPA target across auctions. Protects profitability during volatile CPM spikes, but may underpace if the cap is set below market clearing price.
- **Minimum ROAS:**
  * Prioritizes order value over order volume; optimal for ecommerce catalogs with wide Average Order Value (AOV) ranges.

### 3. Audience Architecture & Exclusion Hygiene
- **Advantage+ Audience:**
  * Uses AI targeting starting from suggested audiences, expanding dynamically when lower CPA conversions are discovered.
  * Always enforce mandatory age, country, or location constraints inside **Audience Controls** (which cannot be expanded) rather than Audience Suggestions.
- **Exclusion Hygiene:**
  * Always exclude 180-day customer purchaser lists (via CAPI/pixel Custom Audiences) from cold prospecting campaigns to prevent wasting budget on existing buyers.

### 4. Creative Formats & Video Retention
- **Video Retention Standards (Reels & Stories):**
  * Vertical 9:16 aspect ratio (1080x1920 px) with captions in the safe zone.
  * Target 3-second Hook Rate $\ge 30\%$ and 15-second ThruPlay Hold Rate $\ge 30\%$.
- **Static & Carousel Formats:**
  * 1:1 (Feed) and 4:5 (Mobile Feed) high-contrast visuals paired with concise benefit copy ($\le 125$ chars).


## Campaign Structure Reference

- **ABO (Ad Set Budget Optimization)**: Manual control per ad set. Best for testing because it forces spend across all variations evenly.
- **CBO (Campaign Budget Optimization)**: Algorithm dynamically distributes budget to the top-performing ad sets. Best for scaling winners.
- **1-1-1 Structure**: 1 Campaign, 1 Ad Set, 1 Ad. Provides maximum signal clarity and isolates variables perfectly.
- **1-5-5 Structure**: 1 Campaign, 5 Ad Sets, 5 Ads each. Provides maximum test breadth to find winning combinations quickly.
- **ASC (Advantage Shopping Campaigns)**: Minimal targeting inputs, full algorithmic control. Requires broad appeal and strong pixel history.
- **Testing + Scaling Split**: Maintain a separate campaign strictly for testing (using ABO to force spend) and a separate campaign for scaling proven winners (using CBO to maximize efficiency).

## Learning Phase Rules

- **Volume Requirement**: ~50 optimization events per ad set per week are required for stable algorithm delivery.
- **Reset Triggers**: Major edits (budget changes >20%, altering audience, changing bid strategy, swapping creative) immediately reset the learning phase.
- **Consolidation**: Maximum 3-5 active ad sets per campaign to prevent signal fragmentation and budget dilution.
- **Patience**: Do not evaluate performance or pause ads during the learning phase (the first 50 events). Early data is volatile and non-predictive.

## Andromeda Algorithm Signals

- **Efficiency Signal**: ROAS/CPA performance tells the algorithm that the ad successfully converts the people it targets.
- **Scalability Signal**: Broad audience response (high engagement and click-through from diverse segments) tells the algorithm the ad can reach more people without exhausting the pool.
- **Scaling Walls**: These occur when efficiency is high but the scalability signal fails. The ad is profitable but only appeals to a tiny, exhausted pocket of users.
- **Creative IS Targeting**: In the Andromeda era, demographic targeting is obsolete. The creative dictates the audience. Avatar + Angle = Concept.
