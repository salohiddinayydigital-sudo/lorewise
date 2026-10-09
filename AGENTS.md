# AGENTS.md — Contributor and Agent Guidelines for Lorewise

This file defines the engineering contract for AI agents and human contributors working on the Lorewise codebase.

---

## 1. Project Mission & Identity

Lorewise is an open Claude Code plugin and Agent Skills package for media buyers and performance marketers.
It maintains client memory, grades its recommendations against subsequent performance data, and enforces verifiable receipts for all reported metrics.

---

## 2. Clean-Room Engineering Rules

Contributors and agents modifying Lorewise MUST adhere strictly to the following clean-room standards:

1. **Zero External Code Copying:**
   - Never copy prompts, skills, agent definitions, or code from external repositories (including legacy systems or unauthorized forks).
   - Every file in this repository is written from first principles.

2. **No Real Client or Secret Data:**
   - Never commit API keys, personal access tokens, client credentials, client names, or proprietary business figures into this repository.
   - All sample and test datasets must be synthetically generated using deterministic test generators (`tests/gen-demo.mjs`).

3. **No Unexplained Magic Constants:**
   - Any threshold or rule (e.g. attribution lag, sample size minimums) must document its rationale or cite primary documentation (Meta Business Help, Google Ads Help, GA4 Documentation).

---

## 3. Core Architectural Invariants

1. **Receipts Discipline:**
   - Every metric reported in analysis must be backed by a receipt identifier referencing a source file, column, and row index or an explicit formula.
   - Non-additive metrics (reach, frequency, CTR, CPC, CPM, ROAS) must **never** be summed across rows. Ratios must be recalculated from raw additive components (spend, impressions, clicks, conversions).
   - Unstated or missing figures must be declared as `needs_input`, never hallucinated or approximated without clear labelling.

2. **Bets & Lessons Discipline:**
   - Actionable recommendations must be formulated as falsifiable hypotheses in `bets.md`.
   - Evaluation accounts for platform attribution lag windows and account-specific noise bands.
   - Lessons graduate through distinct confidence tiers (`observation`, `pattern`, `seen in N accounts`, `contested`).

3. **Read-Only Safety & Spend Guard:**
   - In automated operations, advertising connectors are treated as read-only.
   - Mutating calls (`create`, `update`, `delete`, `pause`, `boost`, `set`) are blocked by the spend guard.
   - System outputs human-executable change packets with rollback steps.

4. **Zero External Runtime Dependencies:**
   - All bundled utility scripts under `scripts/` must run in vanilla Node.js (>=20) without requiring external npm packages.

---

## 4. Coding Standards

- **Language:** Code comments, docs, skill instructions, and agent system prompts are written in clear, concise English.
- **Manifests:** Keep `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` validated under `claude plugin validate --strict .`.
- **Testing:** Add deterministic unit tests under `tests/` using Node.js native test runner (`node:test`, `node:assert`).
