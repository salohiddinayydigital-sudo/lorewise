# Change Packet Specification

Because Lorewise is read-only and never mutates external advertising accounts directly, every recommended campaign adjustment is packaged as a human-executable **Change Packet**.

---

## Required File Location
`lorewise/clients/<slug>/changes/YYYY-MM-DD-<slug>.md`

---

## Change Packet Structure

```markdown
# Change Packet: YYYY-MM-DD-<slug>

**Target Entity:** Platform &rarr; Campaign Name &rarr; Ad Set / Ad
**Change Intent:** Pause fatigued ad set / scale winning audience / launch new creative test
**Associated Bet:** Link to bet ID in `bets.md` (e.g., `B-014`)

---

## 1. Concrete Execution Steps

| Step | Platform | Target Entity | Setting | Current Value | Target Value |
|---|---|---|---|---|---|
| 1 | Meta | Ad Set: Broad 25-44 v2 | Status | ACTIVE | PAUSED |
| 2 | Meta | Ad Set: Lookalike buyers | Daily Budget | $120.00 | $180.00 |

## 2. Guardrails & Ceilings
- **Account Daily Ceiling:** Max account spend must not exceed $800.00/day.
- **Minimum Volume:** Allow 30 purchases before evaluating efficiency.

## 3. Expected Effect
- Reallocating budget to Lookalikes is expected to maintain CPA <= $36.00 based on historical performance [r15].

## 4. Rollback Trigger & Protocol
- **Trigger:** If Lookalike CPA exceeds $40.00 over 48 hours with >= 15 purchases.
- **Rollback Action:** Reset Lookalike daily budget to $120.00 and re-enable Broad 25-44 v2.
```
