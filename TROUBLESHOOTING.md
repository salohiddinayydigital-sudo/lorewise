# Lorewise Troubleshooting & Playbook Guide

Solutions to common performance marketing data traps, attribution discrepancies, and tool errors.

---

## 1. The Totals Row Trap (Double-Counted Spend)

### The Issue
Advertising platform CSV exports (Meta Ads Manager, Google Ads, Shopify Analytics) frequently include a bottom summary row labeled **"Totals"**, **"Total Results"**, or **"Summary"**. Generic scripts or naive AI prompts often sum every row in the file, effectively doubling the reported spend and cutting the reported CPA in half.

### Lorewise Defense
- `scripts/lib/csv.mjs` automatically profiles the bottom 3 rows of every ingested CSV.
- If a row is identified as a totals row, Lorewise uses the declared totals directly OR sums individual campaign rows—**never both**.
- Verify your file locally:
  ```bash
  node scripts/lorewise.mjs profile path/to/export.csv
  ```
  Look for `"hasTotalsRow": true` in the output.

---

## 2. Non-Additive Metrics Violation

### The Issue
You cannot sum the following metrics across rows or date ranges:
- **Reach:** People overlap across days and campaigns. Summing reach double-counts individuals.
- **Frequency:** Frequency is $\text{Impressions} / \text{Reach}$, not the sum of ad set frequencies.
- **CTR (Click-Through Rate):** Must be calculated from $\frac{\sum \text{Clicks}}{\sum \text{Impressions}} \times 100$.
- **CPC / CPM:** Must be computed from total spend divided by total clicks or impressions.
- **ROAS:** Must be computed from $\frac{\sum \text{Revenue}}{\sum \text{Spend}}$.

### Lorewise Defense
- `scripts/lib/csv.mjs` contains a strict `NON_ADDITIVE_METRICS` dictionary.
- If an agent or report attempts to sum reach across rows, Lorewise throws an explicit integrity error and recomputes the metric from raw additive foundations.

---

## 3. Cross-Channel Attribution Gaps (e.g., Meta 120 vs Store 71)

### The Issue
Meta Ads Manager reports 120 purchases, GA4 reports 84 key events, and your Shopify backend reports only 71 paid orders. Which figure is correct?

### How Lorewise Handles It
1. **Never Take an Average:** A mathematical average of 120 and 71 has zero real-world meaning.
2. **Side-by-Side Presentation:** Every weekly report presents all sources with exact receipt tags:
   - Meta Ads: 120 purchases `[r1]` (includes 1-day view-through and 7-day click-through).
   - GA4: 84 conversions `[r2]` (last non-direct click model).
   - Shopify: 71 paid orders `[r3]` (bank-settled cash receipts).
3. **Attribution Discrepancy Breakdown:** Explains the 49-order gap (view-through conversions where Meta showed an ad but the user converted via email, organic search, or retargeting).

---

## 4. Spend Guard Blocks a Tool Call (Exit Code 2)

### The Issue
During a session, an automated tool call is blocked with the message:
> `Lorewise Spend Guard Block: Attempted mutating tool call "ads_create_campaign". Lorewise operates strictly in read-only mode.`

### Why This Happens
- Lorewise enforces Meta's *Rule of Two* for AI safety: an autonomous agent session should never modify live campaign budgets or active entities without explicit human confirmation.
- The `guard.mjs` PreToolUse hook intercepts 100% of mutating tools matching write tokens (`create`, `update`, `delete`, `pause`, `boost`, `set`).

### The Recommended Workflow
1. Let Lorewise formulate the recommendation as a **Change Packet** in `changes/YYYY-MM-DD-<slug>.md`.
2. Review the step-by-step target values and rollback triggers.
3. Manually apply the changes in Ads Manager or execute via an explicit operator action.
4. *Configuration Override:* If you explicitly want to allow mutating tools, set `spend_guard: off` in your Claude Code `/config`.

---

## 5. "Insufficient Data for Diagnostic Grading (<60% Coverage)"

### The Issue
Running `/lorewise:diagnose <slug>` returns:
> `Insufficient data for diagnostic grading (<60% coverage). Additional exports or credentials required.`

### Why This Happens
Lorewise refuses to guess account health when key telemetry is absent. A diagnostic verdict requires evaluating at least 60% of applicable checks in `method.md`:
$$\text{Coverage} = \frac{\text{pass} + \text{fail}}{\text{total applicable checks}}$$

### How to Fix
Supply the missing export files in `lorewise/clients/<slug>/data/<date>/`:
- If Google Ads checks are `unknown`: supply `google-ads.csv`.
- If GA4 checks are `unknown`: supply `ga4.csv`.
- If store order checks are `unknown`: supply `store-orders.csv`.

---

## 6. The Zero-Revenue / Missing Revenue Trap

### The Issue
An export contains order counts or conversions, but the total revenue column is missing or populated with `$0.00`.

### Lorewise Defense
- Lorewise will **never hallucinate ROAS** from an assumed AOV unless explicitly labeled as an estimate.
- Missing revenue is recorded as `needs_input`.
- Check `CHK-05` in `diagnose/method.md`.

---

## 7. Conversion Lag & Premature Pacing Judgments

### The Issue
Recent 24–72 hour performance appears below target CPA, causing an operator to prematurely pause profitable campaigns.

### Lorewise Defense
- Platform conversion reporting lags by up to 7 days (especially under SKAdNetwork or delayed attribution windows).
- Lorewise inspects `attribution_lag_days` from `client.md`. Any data within the lag window is stamped as `provisional` and excluded from bet settlements.
