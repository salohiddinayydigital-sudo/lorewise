# Lorewise Canonical File Formats & Schemas

This document defines the single source of truth for all structured file formats within the Lorewise workspace.

---

## 1. Client Profile (`lorewise/clients/<slug>/client.md`)

```yaml
---
type: client
name: Demo Shop
slug: demo-shop
status: active
currency: USD
goal: {metric: purchases, target_cpa: 32.00}
economics: {aov: 58.00, gross_margin: 0.62, breakeven_cpa: 36.00, ltv: unknown}
budget_monthly: 24000
channels: [meta, google]
truth_order: [store, ga4, platform]
measured_gap: {meta_vs_store: 0.23, as_of: 2026-10-05}
attribution_lag_days: 7
review_day: monday
report_reader: founder, non-technical
summary: DTC skincare shop; goal is purchases under $32 CPA
updated: 2026-10-05
---
## Offers
- Hero Serum $58 (told, 2026-10-05)
- Bundle Offer $84 (told, 2026-10-05)

## Audiences
- Lookalike buyers 1-2% (tested winner)
- Broad 25-44 US (fatigued in W40)

## Constraints
- Max daily spend $800 across channels
- Breakeven CPA ceiling: $36.00

## Calendar
- Q4 Holiday promo planned for November 2026

## Voice
- Professional, concise, focus on blended ROAS and net contribution
```

---

## 2. Bets Registry (`lorewise/clients/<slug>/bets.md`)

Each bet is formatted as an append-only entry:

```markdown
## B-014 · open
made: 2026-09-28 · check_by: 2026-10-05
subject: ad set "Broad 25-44 v2"
if: pause it, move $60/day to "Lookalike buyers"
then: CPA of "Lookalike buyers" stays under $36 at the higher budget
win_if: CPA <= 36 with >= 30 purchases
because: frequency 4.8 [r9]; CTR -38% in 3 weeks [r10]
tests_lesson: L-019
applied: yes
confounds: []
result: held · actual CPA $34.10 with 41 purchases [r15@2026-10-05]
```

Fields:
- `id` (`B-xxx`) and state (`open`, `held`, `missed`, `inconclusive`, `void`)
- `made`: date established
- `check_by`: evaluation date (accounting for attribution lag)
- `subject`: target ad set, campaign, or creative
- `if`: concrete change action
- `then`: expected business outcome
- `win_if`: mathematical falsifiable threshold
- `because`: rationale citing receipt ids (`[r1]`, `[r2]`)
- `tests_lesson`: optional link to existing lesson (`L-xxx`)
- `applied`: verification status (`yes`, `no`, `partly`, `unknown`)
- `confounds`: array of external events (promo, out of stock, technical issue)
- `result`: final evaluation with actual receipts

---

## 3. Receipts Ledger (`lorewise/clients/<slug>/data/<date>/ledger.json`)

```json
{
  "period": {
    "from": "2026-09-28",
    "to": "2026-10-04"
  },
  "files": [
    {
      "id": "f1",
      "name": "meta.csv",
      "platform": "meta",
      "rows": 214,
      "sha256": "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a"
    }
  ],
  "facts": [
    {
      "id": "r3",
      "label": "Meta spend",
      "value": 5768.40,
      "unit": "USD",
      "kind": "quoted",
      "file": "f1",
      "column": "Amount spent (USD)",
      "rows": "2-214",
      "agg": "sum"
    },
    {
      "id": "r7",
      "label": "Meta CPA",
      "value": 27.21,
      "unit": "USD",
      "kind": "computed",
      "formula": "r3/r6"
    }
  ],
  "gaps": [
    "LTV: not in any file provided",
    "Store vs Meta attribution gap: 48 orders"
  ]
}
```

Fact Kinds:
- `quoted`: Directly summed or extracted from a specific file, column, and row range.
- `computed`: Deterministic mathematical combination of quoted facts.
- `told`: Explicitly stated by the client or operator, with timestamp.
- `seen`: Extracted from a screenshot image (subject to independent verification).

---

## 4. Client Journal (`lorewise/clients/<slug>/journal.md`)

Append-only record of strategic decisions, anomalies, and structural changes:
Format: `YYYY-MM-DD | decision or outcome | rationale or source`

```markdown
# Journal — Demo Shop

2026-09-28 | Paused Broad 25-44 v2 due to frequency fatigue (4.8); moved $60/day to Lookalikes | Bet B-014
2026-10-05 | Bet B-014 held with CPA $34.10; Lookalike scaling validated | Weekly report W40
```

---

## 5. Desk Pointer (`lorewise/desk.md`)

Maintains client roster, spend allocation, channel assignments, and inbox queues:

```markdown
# Lorewise Desk — Active Client Portfolio

| Client | Slug | Monthly Spend | Primary Channel | Secondary Channel | Due Bets | Inbox Files |
|---|---|---|---|---|---|---|
| Demo Shop | demo-shop | $24,000 | Meta | Google | 0 | 0 |
```

---

## 6. Playbook Lesson (`lorewise/playbook/lessons/L-xxx.md`)

```yaml
---
id: L-019
scope: client:demo-shop # or shared
tier: pattern # observation (1 win), pattern (>=3 in account), shared (N accounts), contested
claim: In broad skincare ad sets, frequency > 4.5 over 14 days correlates with steep CPA decay
applies_when:
  platform: meta
  objective: purchases
support:
  - {client: demo-shop, bet: B-014, date: 2026-10-05}
against: []
clients_seen: [demo-shop]
last_supported: 2026-10-05
summary: Ad set frequency above 4.5 in broad targeting causes CPA spike; budget shift to lookalike held.
---
# Lesson L-019

Broad targeting ad sets on Meta suffer severe diminishing returns once 14-day frequency exceeds 4.5.
Evidence shows reallocating budget to high-intent lookalike audiences restores efficiency.
```

---

## 7. Change Packet (`lorewise/clients/<slug>/changes/YYYY-MM-DD-<slug>.md`)

Human-executable instructions for making campaign adjustments safely:

```markdown
# Change Packet: 2026-10-05-demo-shop

**Target:** Meta Ads Manager &rarr; Sales_Conversions_Q3
**Action:** Pause ad set "Broad 25-44 v2"; increase daily budget on "Lookalike buyers" by $60.00/day.

| Step | Platform | Entity | Action | Value |
|---|---|---|---|---|
| 1 | Meta | Ad Set: Broad 25-44 v2 | Set Status | PAUSED |
| 2 | Meta | Ad Set: Lookalike buyers | Adjust Daily Budget | $120.00 &rarr; $180.00 |

**Expected Outcome:** Lookalike CPA remains under $36.00 with >= 30 purchases [B-014].
**Ceiling:** Max daily account spend must not exceed $800.00.
**Rollback:** Re-enable Broad 25-44 v2 at $60/day and reset Lookalike buyers to $120/day if CPA exceeds $40 over 48 hours.
```
