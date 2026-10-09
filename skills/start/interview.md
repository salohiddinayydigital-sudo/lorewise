# Client Onboarding Interview Guide

When onboarding a new client in Lorewise, ask the following 7 questions sequentially.
Each question can be skipped by the user; any skipped field defaults to `unknown`.

---

## The 7 Intake Questions

### 1. Client Identity & Slug
- **Question:** What is the client's business name and preferred folder slug (e.g., `Acme Skin`, `acme-skin`)?
- **Default:** Derived from business name in kebab-case.

### 2. Primary Goal & Efficiency Target
- **Question:** What is the primary conversion event (e.g., purchases, leads) and target CPA or target ROAS ceiling?
- **Default:** `{metric: purchases, target_cpa: unknown}`.

### 3. Unit Economics
- **Question:** What is the Average Order Value (AOV), gross margin percentage, and breakeven CPA? (If LTV is unknown, leave it blank).
- **Default:** `{aov: unknown, gross_margin: unknown, breakeven_cpa: unknown, ltv: unknown}`.

### 4. Monthly Ad Budget
- **Question:** What is the approved monthly ad spend across all channels?
- **Default:** `unknown`.

### 5. Channels & Platforms
- **Question:** Which advertising channels are active (e.g., Meta Ads, Google Ads, TikTok, Pinterest)?
- **Default:** `[meta]`.

### 6. Truth Order (Attribution Hierarchy)
- **Question:** When platform and store figures disagree, which source takes precedence? (Standard: `[store, ga4, platform]`).
- **Default:** `[store, ga4, platform]`.

### 7. Attribution Lag & Cadence
- **Question:** How many days does conversion attribution typically lag (e.g., 7 days for 7-day click attribution), and which day of the week is your review day?
- **Default:** `attribution_lag_days: 7`, `review_day: monday`.

---

## Scaffold Output

After completing the interview, write the profile to:
`lorewise/clients/<slug>/client.md`

Initialize the companion tracking files:
- `lorewise/clients/<slug>/journal.md` (Format: `YYYY-MM-DD | decision/outcome | reason/source`)
- `lorewise/clients/<slug>/bets.md` (Empty bets registry)
- `lorewise/clients/<slug>/data/<date>/` (Empty intake folder)
- `lorewise/clients/<slug>/reports/` (Reports destination)
- `lorewise/desk.md` (Update client roster)
