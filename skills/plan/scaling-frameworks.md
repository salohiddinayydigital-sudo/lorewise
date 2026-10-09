# Budget Scaling Frameworks & Learning Phase Protection

A reference guide for scaling advertising budgets safely, protecting machine-learning optimization stability, and managing vertical versus horizontal budget growth.

---

## 1. The 20% Budget Scaling Rule

Machine-learning bidding algorithms (Meta delivery graph, Google Smart Bidding) optimize delivery using rolling conversion distributions.

### The Problem: Learning Phase Reset
- When an active campaign or ad set experiences a sudden budget increase of $> 20\%$, the bidding model's variance estimates become invalid.
- The platform often resets the ad set into the volatile **"Learning Phase"** (or "Learning / Bid Strategy Learning").
- During this reset, CPMs can spike by $30\%\text{--}50\%$ and conversion efficiency frequently destabilizes for 3 to 7 days.

### The Protocol: Controlled Vertical Increments
1. **Pacing Interval:** Increase budget by a maximum of $15\%\text{--}20\%$ every 48 to 72 hours.
2. **Attribution Maturity Check:** Never increase budget until performance from the previous increment has matured past the client's documented `attribution_lag_days`.
3. **Efficiency Stability:** Confirm that 7-day CPA is $\le \text{Target CPA}$ and that conversion volume meets minimum sample size ($\ge 30$ conversions/week) before the next increment.

---

## 2. Vertical vs. Horizontal Scaling

When scaling ad spend, media buyers choose between increasing budget on existing campaigns (vertical) or diversifying across new targeting/creative vectors (horizontal).

| Dimension | Vertical Scaling | Horizontal Scaling |
|---|---|---|
| **Mechanism** | Increase daily budget on existing winning ad sets by $\le 20\%$. | Duplicate winning creative into new audiences, lookalikes, or launch fresh messaging hooks. |
| **Speed** | Controlled and gradual (takes 2–3 weeks to double spend). | Rapid (can double overall spend immediately across new entities). |
| **Fatigue Risk** | High. Accelerates audience saturation and increases frequency quickly. | Low. Disperses impressions across fresh, unreached audience pools. |
| **Algorithm Impact** | Risk of learning reset if stepped too aggressively. | Zero impact on existing campaigns; each new entity learns independently. |
| **Best Used When** | Broad targeting or Advantage+ with large audience liquidity. | Niche targeting, restricted geography, or high frequency ($> 3.5$). |

---

## 3. Budget Fragmentation vs. Consolidation

### The Trap: Over-Segmentation
- Spreading \$3,000/month across 15 different ad sets allocates only \$6.60/day per ad set.
- If target CPA is \$30, each ad set receives a conversion only once every 4.5 days.
- **Result:** Zero ad sets reach the ~50 conversions/week required to exit algorithmic learning, resulting in permanently elevated CPMs and volatile performance.

### The Solution: Liquidity Consolidation
- Consolidate budget into 2 to 4 high-volume campaigns:
  1. **Prospecting Scale Campaign (CBO / Advantage+):** 60% of budget.
  2. **Creative Sandbox (Testing):** 25% of budget.
  3. **High-Intent Search / Retargeting:** 15% of budget.
- Each campaign achieves sufficient conversion density to optimize auction bidding effectively.

---

## 4. Automated Kill and Rollback Ladders

| Stage | Trigger Condition | Operator Action |
|---|---|---|
| **Warning** | Daily CPA $> 1.25 \times \text{target CPA}$ for 2 consecutive days | Flag in weekly review; inspect hook fatigue and site speed. |
| **Ceiling Breach** | Daily CPA $> 1.50 \times \text{target CPA}$ over 3 days | Reduce scaling campaign budget by 20% to previous baseline. |
| **Emergency Kill** | Spend $> 2.0 \times \text{target CPA}$ with zero conversions | Immediately pause offending ad set; issue change packet. |
