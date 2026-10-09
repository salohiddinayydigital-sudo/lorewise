# Diagnostic Method & 20-Check Framework

Lorewise executes deterministic health and efficiency checks against raw receipts, client benchmarks, and econometric fundamentals.
Every check outputs strictly one of four states: `pass`, `fail`, `unknown`, or `not_applicable`.

---

## 1. Metric Coverage Rule

Before issuing an account diagnosis or health assessment, calculate the observational coverage score:

$$\text{Coverage} = \frac{\text{Count}(\text{pass}) + \text{Count}(\text{fail})}{\text{Total Applicable Checks}}$$

- **Pass / Fail:** Definitive determination backed by confirmed receipt facts `[rX]`.
- **Unknown:** Required file or metric was missing or not provided (`needs_input`).
- **Not Applicable:** Channel or feature is outside the client's current scope (e.g. client does not run Google Ads).

> [!IMPORTANT]
> **Coverage Gate (<60%):** If $\text{Coverage} < 0.60$, the system must decline overall performance grading and output:
> **"Insufficient data for diagnostic grading (<60% coverage). Additional exports or credentials required."**

---

## 2. The 20 Diagnostic Checks

### Domain A: Blended Economics (CHK-01 to CHK-05)

#### CHK-01: Blended CPA vs Target
- **Method:** Calculate $\text{Blended CPA} = \frac{\text{Total Paid Media Spend}}{\text{Total Backend Store Orders}}$. Compare against `target_cpa` in `client.md`.
- **Thresholds:**
  - `pass`: $\text{Blended CPA} \le \text{target\_cpa} \times 1.05$ (within 5% tolerance)
  - `fail`: $\text{Blended CPA} > \text{target\_cpa} \times 1.05$
  - `unknown`: Backend orders or media spend not provided
  - `not_applicable`: Client has no defined CPA target or lead-gen focus

#### CHK-02: Marketing Efficiency Ratio (MER) vs Target
- **Method:** Calculate $\text{MER} = \frac{\text{Total Backend Revenue}}{\text{Total Paid Media Spend}}$. Compare against `target_mer` in `client.md`.
- **Thresholds:**
  - `pass`: $\text{MER} \ge \text{target\_mer} \times 0.95$
  - `fail`: $\text{MER} < \text{target\_mer} \times 0.95$
  - `unknown`: Total store revenue is absent or unverified
  - `not_applicable`: Client does not evaluate revenue/MER

#### CHK-03: Monthly Budget Pacing
- **Method:** Compare Month-to-Date (MTD) spend against elapsed calendar day fraction of `monthly_budget`:
  $$\text{Expected Spend} = \text{monthly\_budget} \times \left(\frac{\text{Day of Month}}{\text{Days in Month}}\right)$$
- **Thresholds:**
  - `pass`: Actual spend is within $\pm 15\%$ of Expected Spend
  - `fail`: Actual spend is $> 15\%$ ahead (overpacing) or $> 20\%$ behind (underpacing)
  - `unknown`: MTD spend figures or monthly budget missing
  - `not_applicable`: No fixed monthly budget set

#### CHK-04: Cross-Channel Attribution Gap
- **Method:** Measure discrepancy between ad platform reported orders and backend store orders:
  $$\text{Discrepancy} = \frac{\sum \text{Platform Purchases} - \text{Store Orders}}{\text{Store Orders}}$$
- **Thresholds:**
  - `pass`: $\text{Discrepancy} \le 0.15$ ($\le 15\%$ attribution gap)
  - `fail`: $\text{Discrepancy} > 0.15$ (indicates platform overcounting, overlap, or view-through inflation)
  - `unknown`: Store backend order export missing
  - `not_applicable`: Only one single channel is active

#### CHK-05: Missing Revenue / Zero-Revenue Trap
- **Method:** Audit whether revenue columns exist and contain non-zero monetary values in order exports.
- **Thresholds:**
  - `pass`: Valid non-zero revenue reported for all attributed sales
  - `fail`: Orders recorded with \$0.00 revenue or missing transaction value
  - `unknown`: No order data available
  - `not_applicable`: Non-monetary lead-generation account

---

### Domain B: Meta Ads (CHK-06 to CHK-09)

#### CHK-06: Ad Set Frequency Fatigue
- **Method:** Inspect rolling 7-day or 14-day frequency across active top-spend ad sets.
- **Thresholds:**
  - `pass`: Frequency $\le 3.5$ for broad prospect ad sets; $\le 8.0$ for retargeting
  - `fail`: Frequency $> 4.0$ for broad prospect ad sets with declining CTR / rising CPA
  - `unknown`: Frequency metric absent from Meta export
  - `not_applicable`: Meta Ads not used by client

#### CHK-07: Creative Spend Skew / Concentration
- **Method:** Calculate spend of top-spending single ad relative to total ad set spend.
- **Thresholds:**
  - `pass`: Top ad receives $\le 70\%$ of ad set spend, allowing creative testing
  - `fail`: Top ad captures $> 85\%$ of spend while older than 45 days (creative starvation)
  - `unknown`: Ad-level breakdown missing
  - `not_applicable`: Fewer than 3 ads in the ad set

#### CHK-08: Learning Phase Conversion Volume
- **Method:** Sum total conversion events per active ad set over rolling 7 days against Meta benchmark.
- **Thresholds:**
  - `pass`: $\ge 50$ conversion events per ad set in 7 days
  - `fail`: $< 30$ conversion events per ad set in 7 days (trapped in Learning Limited)
  - `unknown`: Conversion counts per ad set missing
  - `not_applicable`: Traffic, awareness, or reach campaigns

#### CHK-09: Conversions API (CAPI) Deduplication
- **Method:** Verify presence of server-side CAPI events and `event_id` deduplication matching.
- **Thresholds:**
  - `pass`: CAPI event deduplication active with $> 90\%$ match rate
  - `fail`: Pixel only or duplicate un-deduplicated server fires
  - `unknown`: Technical telemetry export not provided
  - `not_applicable`: Client does not run web pixel

---

### Domain C: Google Ads (CHK-10 to CHK-13)

#### CHK-10: Search Lost Impression Share (Budget)
- **Method:** Check `Search Lost IS (budget)` across core conversion campaigns.
- **Thresholds:**
  - `pass`: Search Lost IS (budget) $\le 10\%$
  - `fail`: Search Lost IS (budget) $> 20\%$ (profitable campaigns constrained by budget)
  - `unknown`: Impression share columns omitted in export
  - `not_applicable`: Google Ads search campaigns not active

#### CHK-11: Search Lost Impression Share (Rank)
- **Method:** Check `Search Lost IS (rank)` across core conversion campaigns.
- **Thresholds:**
  - `pass`: Search Lost IS (rank) $\le 25\%$
  - `fail`: Search Lost IS (rank) $> 40\%$ (bidding or Quality Score deficiencies)
  - `unknown`: Competitive metrics omitted
  - `not_applicable`: Google Ads search campaigns not active

#### CHK-12: Brand vs Non-Brand Spend Cannibalization
- **Method:** Calculate branded search spend as a percentage of total Google Ads spend.
- **Thresholds:**
  - `pass`: Non-brand spend $\ge 60\%$ of Google search spend
  - `fail`: Brand spend $> 70\%$ of search budget without incremental incrementality testing
  - `unknown`: Campaign naming does not distinguish brand from generic
  - `not_applicable`: Brand search not run

#### CHK-13: Smart Bidding Conversion Sufficiency
- **Method:** Count 30-day conversion volume for tCPA or tROAS campaigns.
- **Thresholds:**
  - `pass`: $\ge 30$ conversions in rolling 30 days per bidding portfolio
  - `fail`: $< 15$ conversions (algorithmic bid instability risk)
  - `unknown`: 30-day conversion history unavailable
  - `not_applicable`: Manual CPC bidding utilized

---

### Domain D: GA4 & Analytics (CHK-14 to CHK-16)

#### CHK-14: Unassigned / Direct Traffic Spike
- **Method:** Calculate percentage of total landing sessions categorized as `Unassigned` or `Direct`.
- **Thresholds:**
  - `pass`: Unassigned + Direct sessions $\le 15\%$ of total paid landing traffic
  - `fail`: Unassigned + Direct sessions $> 25\%$ (indicates broken UTM tracking or lost referrer)
  - `unknown`: GA4 channel grouping export missing
  - `not_applicable`: GA4 not connected

#### CHK-15: Ad Click to Session Discrepancy
- **Method:** Compute ratio of GA4 paid sessions to ad platform reported clicks:
  $$\text{Landing Ratio} = \frac{\text{GA4 Paid Sessions}}{\text{Platform Ad Clicks}}$$
- **Thresholds:**
  - `pass`: $\text{Landing Ratio} \ge 0.80$ (at least 80% of clicks register as sessions)
  - `fail`: $\text{Landing Ratio} < 0.65$ (severe site speed, redirect, or tag firing drop-off)
  - `unknown`: Click or session exports missing
  - `not_applicable`: Offline or app-only promotions

#### CHK-16: Purchase Event Parameter Completeness
- **Method:** Verify presence of `value`, `currency`, and `items` array on GA4 purchase events.
- **Thresholds:**
  - `pass`: 100% of purchase events pass required monetary parameters
  - `fail`: Purchase events fire without currency or transaction value
  - `unknown`: Raw event parameter diagnostic missing
  - `not_applicable`: Non-ecommerce website

---

### Domain E: Tracking & Data Hygiene (CHK-17 to CHK-20)

#### CHK-17: UTM Parameter Consistency
- **Method:** Audit campaign URLs for lower-case consistency and standard `utm_source`, `utm_medium`, `utm_campaign`.
- **Thresholds:**
  - `pass`: Clean, consistent lower-case UTM tags across 100% of active ad links
  - `fail`: Mixed casing, missing `utm_medium`, or un-tagged ads
  - `unknown`: Destination URL reports unavailable
  - `not_applicable`: Telemetry tracking not in scope

#### CHK-18: Attribution Window Alignment
- **Method:** Compare platform reporting window (e.g. 7-day click) against client average sales cycle length.
- **Thresholds:**
  - `pass`: Reporting window covers $\ge 80\%$ of average time-to-purchase
  - `fail`: Reporting window truncates long consideration cycles ($> 14$ days)
  - `unknown`: Time-lag distribution not recorded in `client.md`
  - `not_applicable`: Instant impulse-buy goods (<1 day cycle)

#### CHK-19: Store Order Deduplication
- **Method:** Scan backend order identifiers for identical order IDs or transaction timestamps.
- **Thresholds:**
  - `pass`: 100% of order IDs are unique
  - `fail`: Duplicate order IDs detected in backend receipts
  - `unknown`: Order row level details missing
  - `not_applicable`: Aggregate report only

#### CHK-20: Conversion Lag Window Freshness
- **Method:** Check if audit evaluation date is older than client `attribution_lag_days` from `client.md`.
- **Thresholds:**
  - `pass`: Data reviewed outside conversion lag window ($\ge \text{lag days}$)
  - `fail`: Audit judging recent 1-3 days during active lag without flagging provisional status
  - `unknown`: Lag window not declared
  - `not_applicable`: Lag-free real-time backend
