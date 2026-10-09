# Weekly Bets & Hypothesis Design Guide

In Lorewise, recommendations are never vague advice—they are recorded as falsifiable bets in `bets.md`.

---

## The Rules of a Good Bet

1. **Specific Subject:**
   - Always target a concrete entity (e.g. ad set `"Broad 25-44 v2"` or creative `"C-003 UGC Video"`).
   - Never bet on global account blended CPA, because concurrent changes will confound the measurement.

2. **Pre-Stated `win_if` Threshold:**
   - Define exact numerical success criteria with a minimum sample size.
   - *Example:* `CPA <= 36.00 with >= 30 purchases`

3. **Maximum 3 Bets Per Week:**
   - Limiting changes prevents account destabilization and isolating variables.

4. **Attribution Lag Window:**
   - Do not settle a bet until the client's `attribution_lag_days` has passed.
   - Conversions take time to populate in platform reporting.

5. **Noise Band Awareness:**
   - If performance change is within normal weekly variance (+/- 5%), mark the bet as `inconclusive`.

---

## Settlement States

- `held`: The `win_if` condition was met with sufficient volume outside the lag window.
- `missed`: The action was executed but failed to achieve the target threshold.
- `inconclusive`: Unclear result due to external promo, low volume, or noise.
- `void`: Action was never executed (`applied: no`), or 30 days passed without data.

---

## Playbook Graduation

When a bet settles as `held`:
1. Check if an existing lesson (`L-xxx`) is linked.
2. If yes, increment its support count.
3. If no, create an `observation` tier lesson in `lorewise/playbook/lessons/`.
4. After 3 consistent wins in the same account, promote to `pattern`.
