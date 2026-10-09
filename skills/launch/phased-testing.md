# Phased Campaign Testing & Rollout Architecture

A disciplined methodology for testing, validating, and scaling paid advertising campaigns without inducing machine-learning chaos or budget bleed.

---

## 1. The 3-Phase Rollout Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: CREATIVE SANDBOX (15-25% Budget)                   │
│ Goal: Isolate winning creative hooks and messaging angles   │
│ Structure: 1 Campaign / 3-5 Ad Sets / Broad Targeting       │
│ Condition: 5-7 days untouched observation window           │
└──────────────────────────────┬──────────────────────────────┘
                               │
            Graduate assets with CPA <= Target CPA
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: AUDIENCE VALIDATION (25-35% Budget)                │
│ Goal: Match winning creative to highest-intent audiences   │
│ Structure: Lookalikes, Interest Stacks, Search Tiers        │
│ Condition: Accumulate >= 15 conversions per ad set          │
└──────────────────────────────┬──────────────────────────────┘
                               │
            Graduate pairings with stable efficiency
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: SCALING CONSOLIDATION (45-60% Budget)              │
│ Goal: Maximize conversion volume at target blended MER      │
│ Structure: Consolidated ASC / Broad CBO / Target ROAS PMax  │
│ Condition: Scale <= 20% every 48-72h; monitor lag window   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1: Creative Sandbox Rules

1. **Equalized Spend Distribution:** Ensure each test concept receives an equal opportunity to compete in the auction. Do not judge an ad set on $15 of spend when target CPA is $35.
2. **Untouched Observation Window:** Do not pause or adjust budgets within the first 72 hours. Algorithm optimization requires statistical data ingestion.
3. **Broad Targeting as the Litmus Test:** Test creatives on broad, unconstrained audiences. A truly winning ad creative acts as its own targeting mechanism by attracting the right customer through hook relevance.

---

## 3. Phase 2: Audience & Offer Validation

1. **Test Proven Assets Only:** Never introduce unvalidated creative concepts directly into audience testing. If an audience underperforms with an untested ad, you cannot distinguish whether the creative failed or the audience failed.
2. **Negative Keyword & Exclusion Hygiene:** Ensure cold audience tests exclude past 30-day website visitors and past 180-day purchasers to measure genuine net-new customer acquisition.

---

## 4. Phase 3: Scaling & The 20% Rule

1. **The 20% Vertical Scaling Limit:**
   - Ad platform bidding algorithms (Meta delivery graph, Google Smart Bidding) calibrate auction bids based on rolling conversion history.
   - Increasing an ad set budget by $> 20\%$ in a 48-hour window frequently forces the algorithm to re-enter the volatile "Learning Phase".
   - Scale vertically in steps of $15\%\text{--}20\%$ every 2–3 days once target CPA has held steady over the trailing 72 hours.
2. **Horizontal Scaling via Duplication:**
   - To deploy budget faster without resetting primary campaign learning, duplicate the winning ad set with a fresh budget allocation into a secondary testing cluster or complementary geographic region.
3. **Budget Consolidation:**
   - Avoid "budget fragmentation" where 20 ad sets each receive $10/day and none reach the ~50 conversions/week required to exit algorithmic learning. Consolidate into 2–4 high-liquidity campaigns.

---

## 5. Explicit Promote and Kill Rules

| Decision Event | Condition | Action Required |
|---|---|---|
| **Kill (No Conversions)** | Spend $> 2.0 \times \text{target CPA}$ with 0 conversions after attribution lag | **Pause ad set immediately.** Record as missed in `bets.md`. |
| **Kill (High CPC / Zero CTR)** | CTR $< 0.60\%$ and CPC $> 2.0 \times \text{account benchmark}$ after \$50 spend | **Pause ad set.** Hook failed to capture auction attention. |
| **Hold & Audit Landing Page** | Link CTR $> 2.5\%$ but Landing Page Conversion Rate $< 0.5\%$ | **Hold ad.** Ad is winning the click, but landing page or checkout has friction. |
| **Promote to Scaling** | Asset achieves $\ge 15$ conversions with $\text{CPA} \le 0.90 \times \text{target CPA}$ over 7 days | **Promote to Phase 3 scaling stack.** Record winning lesson. |
| **Rollback Trigger** | Blended account CPA exceeds breakeven threshold for 3 consecutive days | **Reduce budget by 20%** and revert to previous stable configuration. |
