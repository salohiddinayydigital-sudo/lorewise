# Lorewise Commands & Skills Quick Reference

A complete cheatsheet of all Lorewise skills, subagents, hooks, and operating workflows for performance marketers.

---

## The 8 Worker Skills

| Skill | Invocation | Typical Usage | Key Deliverables |
|---|---|---|---|
| **`start`** | `/lorewise:start [slug]` | Onboard a new client or launch the 3-minute synthetic demo | `client.md`, `desk.md`, initial scaffold |
| **`week`** | `/lorewise:week [slug]` | Execute the weekly review cycle, reconcile ad platforms, settle due bets | `reports/YYYY-Www.md`, settled bets, copy for client |
| **`plan`** | `/lorewise:plan <slug>` | Calculate budget pacing, unit economics, and draft change packets | `changes/YYYY-MM-DD-<slug>.md`, new bets in `bets.md` |
| **`diagnose`** | `/lorewise:diagnose <slug>` | Run the 20-check deterministic health audit against raw receipts | 20-check audit table with `[rX]` citations, coverage score |
| **`creative`** | `/lorewise:creative <slug>` | Inspect visual assets, hook rates, hold rates, and fatigue signals | `creative-card.md`, `video-card.md`, 5-scene briefs |
| **`learn`** | `/lorewise:learn [slug]` | Distill raw lessons into dated, sourced playbook notes | `playbook/notes/NOTE-*.md`, `lessons/L-*.md` |
| **`remember`** | `/lorewise:remember <slug>` | Inspect or update client targets, AOV, margins, or decision journals | `journal.md`, `client.md` target verification |
| **`check`** | `/lorewise:check` | Zero-model health check of expired claims, unsourced notes, and spend guard | Instant console health diagnosis (<50 ms) |

---

## The 3 Adversarial Subagents

Lorewise enforces strict separation of concerns via three specialized subagents:

### 1. `analyst` (`model: sonnet`, Read-Only)
- **Role:** Impartial diagnostic auditor.
- **Tools:** `[Read, Grep, Glob]`. Disallowed: `[Write, Edit, Bash]`.
- **Function:** Evaluates client performance against the 20-check framework (`diagnose/method.md`), computes coverage score, and outputs strictly four states (`pass`, `fail`, `unknown`, `not_applicable`).

### 2. `skeptic` (`model: inherit`, Read-Only)
- **Role:** Adversarial cross-examiner.
- **Tools:** `[Read, Grep, Glob]`. Disallowed: `[Write, Edit, Bash]`.
- **Function:** Pressure-tests weekly draft reports against `ledger.json` and store backends. Challenges unverified claims, premature scaling advice, and attribution leaps.

### 3. `creative-eye` (`model: sonnet`, Visual Inspector)
- **Role:** Creative asset and video retention specialist.
- **Tools:** `[Read]`. Disallowed: `[Write, Edit, Bash]`.
- **Function:** Visually inspects images and video storyboards. Extracts hook type, copy angles, text-to-image ratios, 3s hook rates, 15s hold rates, and isolates hook vs body fatigue.

---

## The 3 Deterministic Hooks

Lorewise guards your ad accounts, verifies your math, and keeps you briefed automatically:

| Hook Event | Script | Action | Latency |
|---|---|---|---|
| **`SessionStart`** | `scripts/lorewise.mjs hook brief` | Reads `desk.md` and displays portfolio status (clients, due bets, data freshness) | `<100 ms` |
| **`PreToolUse`** | `scripts/guard.mjs` | Intercepts 100% of mutating advertising tools (Meta, Google, Telegram) and exits with code 2 | `<150 ms` (p95) |
| **`PostToolUse`** | `scripts/lorewise.mjs hook verify` | Inspects generated reports and catches unverified metric claims missing `[rX]` tags | `<150 ms` |

---

## Weekly Media Buyer Operating Cadence

```text
MONDAY (Audit & Reconcile)
  1. Drop exports into inbox/ (Meta, Google, Telegram, Store Orders).
  2. Run /lorewise:week to inspect portfolio overview.
  3. Run /lorewise:week <slug> to generate reconciled weekly report.
  4. Settle open bets due today (mark held / missed / inconclusive).

WEDNESDAY (Creative & Retention Check)
  1. Run /lorewise:creative <slug> to detect ad fatigue (CTR decay > 20%, rolling freq > 4.0).
  2. Evaluate video hook rates (<20% = weak hook) and hold rates (<15% = weak body).
  3. Generate 5-scene video storyboard briefs for winning hooks.

FRIDAY (Pacing & Change Packets)
  1. Run /lorewise:plan <slug> to inspect MTD pacing against monthly budget.
  2. Formulate 1–3 new falsifiable bets with win_if conditions.
  3. Generate human-executable Change Packets in changes/ for weekend execution.
```

---

## Command Line Utilities (`lorewise` / `scripts/lorewise.mjs`)

You can run Lorewise commands directly from your terminal or CI environment:

```bash
# 1. Executive Portfolio Dashboard (terminal ASCII board)
node scripts/lorewise.mjs dashboard
# or with global binary: lorewise dashboard

# 2. Instant Client Workspace Scaffolding
node scripts/lorewise.mjs init client-slug --name "Brand Name" --budget 5000 --primary Meta --secondary Google

# 3. Intelligent Export Audit & Trap Scanner (auto-detects Meta, Google, Telegram)
node scripts/lorewise.mjs diagnose path/to/export.csv

# 4. Profile a CSV export (detect headers, delimiter, and summary totals row)
node scripts/lorewise.mjs profile path/to/export.csv

# 5. Run zero-model health inspection of playbook and spend guard
node scripts/lorewise.mjs check

# 6. Stamp a written report with exact receipt citations
node scripts/lorewise.mjs stamp report.md --ledger ledger.json

# 7. Test Spend Guard tool evaluation
echo '{"tool":"ads_create_campaign"}' | node scripts/guard.mjs  # Exits 2 (Blocked)
echo '{"tool":"ads_insights_performance_trend"}' | node scripts/guard.mjs  # Exits 0 (Allowed)
```
