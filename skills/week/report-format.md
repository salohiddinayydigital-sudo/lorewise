# Lorewise Weekly Report Format Specification

Every weekly audit report is written to:
`lorewise/clients/<slug>/reports/YYYY-Www.md`

---

## Required Structure

```markdown
# Weekly Review: <Client Name> (YYYY-Www)

**Period:** YYYY-MM-DD to YYYY-MM-DD · **Review Date:** YYYY-MM-DD
**Budget Pacing:** $<MTD_Spend> of $<Monthly_Budget> (<Pct>%) · Status: [On Pace | Over | Under]

---

## 1. Executive Summary
- Three concise sentences covering total spend, blended efficiency (CPA/ROAS), and key variance against targets.

## 2. What Changed This Week
- Platform spend and conversion movement vs prior week.
- Cross-channel reconciliation:
  * Meta Ads reported purchases [rX]
  * GA4 attributed key events [rY]
  * Store verified orders [rZ]
  * Attribution discrepancy breakdown (without averaging).

## 3. Why We Think It Changed
- Causal analysis tied directly to receipts.
- Entity-level performance (ad set fatigue, creative saturation, audience shifts).

## 4. Resolved Bets (Hypothesis Settlement)
- Evaluation of any bets with `check_by` falling in this review window.
- Status: `held` | `missed` | `inconclusive` | `void` with actual receipts cited.

## 5. Strategic Recommendations (Max 3 Bets)
- For each recommendation, formulate a structured bet:
  * **If:** Concrete action
  * **Then:** Expected outcome
  * **Win If:** Quantitative threshold
  * **Because:** Receipt evidence
  * Link to a corresponding Change Packet in `changes/`.

## 6. What We Cannot See (Gaps & Needs Input)
- Explicit list of missing metrics, unsupplied files, or untracked channels.

## 7. Verified Receipts Table
| ID | Label | Value | Kind | Source | Rows |
|---|---|---|---|---|---|
| r1 | Meta spend | $5,768.40 | quoted | meta.csv | 2-214 |
| r2 | Meta purchases | 212 | quoted | meta.csv | 2-214 |
| r3 | Store orders | 164 | quoted | store-orders.csv | 2-165 |

---

## 8. Copy for Client
[A clear, plain-language summary without receipt tags or internal jargon, formatted for direct copy-paste into email or Slack to the client founder.]
```
