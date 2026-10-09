---
platform: google-ads
facts:
  - id: GADS-FACT-01
    claim: Smart Bidding strategies utilize auction-time bidding to tailor bids dynamically for every individual user auction.
    source: https://support.google.com/google-ads/answer/7065882
    checked: 2026-09-15
    expires: 2027-09-15
  - id: GADS-FACT-02
    claim: Search Lost Impression Share (budget) estimates the percentage of eligible auction impressions missed due to insufficient campaign budget.
    source: https://support.google.com/google-ads/answer/2497703
    checked: 2026-09-15
    expires: 2027-09-15
  - id: GADS-FACT-03
    claim: Search Lost Impression Share (rank) measures the percentage of impressions missed due to Ad Rank based on bids and Quality Score.
    source: https://support.google.com/google-ads/answer/2497703
    checked: 2026-09-15
    expires: 2027-09-15
  - id: GADS-FACT-04
    claim: Performance Max campaigns serve cross-network inventory across Search, YouTube, Display, Discover, Gmail, and Maps from a single asset group.
    source: https://support.google.com/google-ads/answer/10724817
    checked: 2026-09-15
    expires: 2027-09-15
  - id: GADS-FACT-05
    claim: Google Ads conversion reporting logs conversions on the date of the interaction click rather than the conversion event date.
    source: https://support.google.com/google-ads/answer/2375438
    checked: 2026-09-15
    expires: 2027-09-15
  - id: GADS-FACT-06
    claim: Enhanced Conversions uses first-party hashed customer data via SHA-256 to supplement conversion tracking when third-party cookies are unavailable.
    source: https://support.google.com/google-ads/answer/9888656
    checked: 2026-09-15
    expires: 2027-09-15
  - id: GADS-FACT-07
    claim: Auto-apply recommendations in Google Ads execute keyword additions, bid modifications, and targeting changes automatically if enabled.
    source: https://support.google.com/google-ads/answer/10276342
    checked: 2026-09-15
    expires: 2027-09-15
---

# Google Ads Platform Reference

Official reference rules and platform mechanics for Google Ads Search, Shopping, and Performance Max.

## Fact Index

### GADS-FACT-01: Smart Bidding Auction-Time Calculation
- **Claim:** Smart Bidding strategies utilize auction-time bidding to tailor bids dynamically for every individual user auction.
- **Source:** [Google Ads Help](https://support.google.com/google-ads/answer/7065882)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### GADS-FACT-02: Search Lost Impression Share (Budget)
- **Claim:** Search Lost Impression Share (budget) estimates the percentage of eligible auction impressions missed due to insufficient campaign budget.
- **Source:** [Google Ads Help](https://support.google.com/google-ads/answer/2497703)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### GADS-FACT-03: Search Lost Impression Share (Rank)
- **Claim:** Search Lost Impression Share (rank) measures the percentage of impressions missed due to Ad Rank based on bids and Quality Score.
- **Source:** [Google Ads Help](https://support.google.com/google-ads/answer/2497703)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### GADS-FACT-04: Performance Max Cross-Network Scope
- **Claim:** Performance Max campaigns serve cross-network inventory across Search, YouTube, Display, Discover, Gmail, and Maps from a single asset group.
- **Source:** [Google Ads Help](https://support.google.com/google-ads/answer/10724817)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### GADS-FACT-05: Conversion Click-Date Attribution Lag
- **Claim:** Google Ads conversion reporting logs conversions on the date of the interaction click rather than the conversion event date.
- **Source:** [Google Ads Help](https://support.google.com/google-ads/answer/2375438)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### GADS-FACT-06: Enhanced Conversions Privacy Hashing
- **Claim:** Enhanced Conversions uses first-party hashed customer data via SHA-256 to supplement conversion tracking when third-party cookies are unavailable.
- **Source:** [Google Ads Help](https://support.google.com/google-ads/answer/9888656)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### GADS-FACT-07: Auto-Apply Recommendation Autonomy
- **Claim:** Auto-apply recommendations in Google Ads execute keyword additions, bid modifications, and targeting changes automatically if enabled.
- **Source:** [Google Ads Help](https://support.google.com/google-ads/answer/10276342)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

---

## Strategic Architecture & Best Practices

### 1. Smart Bidding & Portfolio Management
- **Target CPA (tCPA):**
  * Recommended when scaling conversion volume with a fixed acquisition margin.
  * Minimum volume: require at least 30 conversions per month in the campaign or portfolio bid strategy to ensure algorithm stability.
  * During bid adjustments, do not change tCPA by more than 15–20% at a time to prevent resetting learning status.
- **Target ROAS (tROAS):**
  * Recommended for ecommerce with dynamic order values. Enforces return on ad spend targets while dynamically bidding higher on high-intent search queries.
- **Maximize Conversions / Maximize Conversion Value:**
  * Use without target caps during initial 14-day launch periods to rapidly gather conversion baseline volume.

### 2. Campaign Architecture & Search Match Types
- **Brand vs Non-Brand Isolation:**
  * Strictly isolate Brand search queries into dedicated campaigns with explicit target CPA / impression share bidding.
  * Add negative brand keywords across generic Non-Brand campaigns to prevent cannibalization and falsely inflated ROAS reporting.
- **Search Match Types:**
  * **Exact Match (`[keyword]`):** Core high-intent query control and anchor conversion volume.
  * **Phrase Match (`"keyword"`):** Moderate intent query expansion.
  * **Broad Match (`keyword`):** Deploy only in conjunction with Smart Bidding (tCPA/tROAS) and aggressive negative keyword lists to prevent search query drift.

### 3. Performance Max (PMax) Asset Group Hygiene
- **Asset Coverage:**
  * Supply full asset variety: 15 headlines, 5 long headlines, 5 descriptions, minimum 5 landscape images (1.91:1), 5 square images (1:1), 1 portrait image (4:5), and at least 1 vertical (9:16) video asset.
- **Asset Grading Audit:**
  * Regularly inspect Google's asset rating (Best, Good, Low).
  * Systematically replace "Low" rated visual and headline assets every 14 to 21 days with fresh creative briefs.
- **Audience Signals & Brand Exclusions:**
  * Provide first-party Customer Match lists (purchasers, high-LTV buyers) and custom search intent segments as audience signals.
  * Implement account-level brand exclusions on PMax to prevent the campaign from cannibalizing existing brand search volume.

### 4. Search Terms Report & Negative Keyword Architecture
- **Search Terms Waste Audit:**
  * Audit ratio of matching search query spend to total broad match spend; flag unmonitored generic search terms draining $> 15\%$ budget.
  * Maintain centralized account-level negative keyword lists for competitor brands, low-intent terms ("free", "diy", "jobs", "login"), and non-serviced locations.

