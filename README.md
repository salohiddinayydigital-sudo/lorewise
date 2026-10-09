# Lorewise

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://github.com/salohiddinayydigital-sudo/lorewise/actions"><img src="https://img.shields.io/badge/CI-100%25%20passing-brightgreen.svg" alt="CI Status" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D20.0.0-informational.svg" alt="Node.js" /></a>
  <a href="docs/support-matrix.md"><img src="https://img.shields.io/badge/platforms-Ubuntu%20%7C%20macOS%20%7C%20Windows-blueviolet.svg" alt="Platforms" /></a>
  <a href="https://github.com/salohiddinayydigital-sudo/lorewise/releases"><img src="https://img.shields.io/badge/release-v1.0.0-success.svg" alt="Release" /></a>
</p>

> **Lorewise remembers every client, grades its own advice against next week's numbers, and shows you the row behind every figure.**

Lorewise is an open, client-aware Claude Code plugin and agent skills framework for performance marketers and media buyers managing paid campaigns across Meta Ads Manager, Google Ads, Telegram Ads, GA4, and ecommerce stores.

---

## Quick Start

### 1-Click Automated Setup

#### Windows (PowerShell):
```powershell
irm https://raw.githubusercontent.com/salohiddinayydigital-sudo/lorewise/main/install.ps1 | iex
```

#### macOS / Linux (Terminal):
```bash
curl -fsSL https://raw.githubusercontent.com/salohiddinayydigital-sudo/lorewise/main/install.sh | bash
```

### Native Claude Code Plugin Install

Inside Claude Code:

```bash
/plugin marketplace add salohiddinayydigital-sudo/lorewise
/plugin install lorewise@lorewise
```

---

## Documentation & Guides

| Guide | Description |
|---|---|
| **[COMMANDS-QUICK-REF.md](COMMANDS-QUICK-REF.md)** | Media buyer cheatsheet: 8 skills, 3 subagents, and weekly audit cadence |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Resolving totals row traps, attribution gaps, and non-additive metrics |
| **[docs/how-it-works.md](docs/how-it-works.md)** | Deep architectural walkthrough of the receipts engine and math foundations |
| **[docs/support-matrix.md](docs/support-matrix.md)** | Environment and operating system compatibility matrix |
| **[AGENTS.md](AGENTS.md)** | Engineering invariants, clean-room rules, and contributor guidelines |

---

### 3-Minute Interactive Demo


Experience Lorewise immediately without connecting ad accounts, sharing API keys, or risking real budgets:

```bash
/lorewise:start
```

Select **Demo Shop (synthetic)** to load an 8-week multi-channel audit package. You will instantly inspect a reconciled weekly report with planted attribution anomalies (a 48-order gap between Meta and store backend), a fatigued ad set, and a resolved budget reallocation bet.

---

## Why Lorewise? (The Difference)

| Capability | Generic AI Assistant | Legacy Scripts / Chatbots | Lorewise |
|---|---|---|---|
| **Metrics & Math** | Hallucinates plausible totals; repeats CSV totals row errors | Basic sum scripts without formula verification | **Deterministic Receipts Engine:** Penny-exact math citing exact source files and row ranges `[rX]` |
| **Metric Integrity** | Sums reach, CTR, frequency, and ROAS across campaigns | Ignores non-additive metric rules | **Non-Additive Guard:** Algorithmic refusal to sum non-additive metrics; recomputes from raw sums |
| **Account Safety** | May attempt direct destructive changes if given tool access | Unrestricted mutating API calls | **Deterministic Spend Guard:** PreToolUse hook blocking 100% of write/mutate tools in <150 ms |
| **Advice Accountability** | Gives confident advice, forgets next session | Untracked chat recommendations | **Falsifiable Bets (`bets.md`):** Advice graded as `held` or `missed` against next week's numbers |
| **Attribution Lag** | Evaluates recent days prematurely | Blind to platform reporting delays | **Lag-Aware Auditing:** Enforces conversion lag windows and account-specific noise bands |
| **Knowledge Evolution** | Timeless static models with stale platform assumptions | Outdated static markdown wikis | **Dated Knowledge Base:** Platform claims expire automatically; CI warns on stale facts |

---

## How It Works: The 7-Step Compounding Loop

```
[ Raw CSV Exports in Inbox ]
            |
            v
   ( 1. Ingest & Profile )   --> Delimiter, header & totals row detection
            |
            v
   ( 2. Compile Receipts )   --> ledger.json with [rX] fact citations
            |
            v
   ( 3. Reconcile Sources )  --> Meta vs Google vs Telegram vs GA4 vs Store Backend
            |
            v
   ( 4. Diagnostic Audit )   --> 20 checks across 4 states (pass/fail/unknown/na)
            |
            v
   ( 5. Settle Due Bets )    --> Evaluate held/missed outside lag window
            |
            v
   ( 6. Draft Weekly Plan )  --> Next week's bets + change packets
            |
            v
   ( 7. Adversarial QA )     --> Skeptic audit + Receipts stamp
            |
            v
[ reports/YYYY-Wxx.md & Clean Client Summary ]
```

Detailed architectural walkthrough: [docs/how-it-works.md](docs/how-it-works.md).

---

## Complete Capabilities: Skills & Subagents

### Worker Skills (8 Skills)
1. **`/lorewise:start`** — Rapid workspace initialization, client interview, and synthetic demo account generator.
2. **`/lorewise:week`** — Weekly review cycle, cross-channel reconciliation, and report compiler.
3. **`/lorewise:plan`** — Budget pacing calculations, margin math, and human-executable change packets.
4. **`/lorewise:diagnose`** — 20-check deterministic health and attribution audit with coverage gating (<60% coverage rule).
5. **`/lorewise:creative`** — Ad asset inspection, visual hook cataloging, fatigue detection, and brief generator.
6. **`/lorewise:learn`** — Raw knowledge distillation into structured, dated playbook notes with mandatory source attribution.
7. **`/lorewise:remember`** — Client memory formats and append-only decision journals.
8. **`/lorewise:check`** — Fast zero-model health inspection of brain data rot, expired facts, and spend guard status.

### Subagents (3 Adversarial Agents)
- **`agents/analyst.md`** — Read-only diagnostic analyst evaluating data against the 20-check framework (`model: sonnet`).
- **`agents/skeptic.md`** — Adversarial auditor testing weekly draft claims against `ledger.json` to catch attribution leaps (`model: inherit`).
- **`agents/creative-eye.md`** — Visual creative inspection subagent extracting design hierarchy, hooks, and fatigue signals (`model: sonnet`).

---

## Disclosure & Complete Transparency

Lorewise is engineered with strict local-first privacy:

- **Zero External Telemetry:** Lorewise scripts make **no outbound network requests**. All calculations, profiling, and evaluations run 100% locally on your machine.
- **Local File System Scope:** Lorewise only reads files within your project workspace and writes strictly to your project's `lorewise/` directory and user plugin cache data (`~/.claude/plugins/data/lorewise/`).
- **Lightweight Zero-Dependency Engine:** Runs standard ECMAScript modules via Node.js (`scripts/lorewise.mjs` and `scripts/guard.mjs`) through 3 Claude Code hooks:
  - `SessionStart`: Fast workspace briefing (desk status, pending bets, data freshness) in <100 ms.
  - `PreToolUse`: Spend guard interceptor that blocks mutating advertising tools.
  - `PostToolUse`: Verification checker that flags unverified metric figures in written reports.
- **Read-Only by Design:** In v1, Lorewise operates strictly as an advisory intelligence layer. It never mutates live campaigns autonomously.

---

## Platform Support Matrix

Detailed platform and OS breakdown: [docs/support-matrix.md](docs/support-matrix.md).

| Harness / Environment | Support Level | Capabilities |
|---|---|---|
| **Claude Code CLI** | **Full (Tier 1)** | Skills, Subagents, Hooks, Local Verification Scripts, Spend Guard |
| **Claude Desktop / Cowork** | **Skills Only (Tier 2)** | Interactive skills and playbooks (zero-runtime mode; hooks and custom agents inactive) |
| **claude.ai Web** | **Skills Only (Tier 2)** | Interactive skills and playbooks (zero-runtime mode) |
| **Codex / Gemini / Cursor** | **Portable (Tier 3)** | Portable skills via `npx skills add` |

---

## Security & Hardening

Lorewise adheres to Meta's *Rule of Two* for agent security: an automated agent session should never combine untrusted inputs, sensitive account access, and state modification without human confirmation.

- **Isolated Analysis Subagents:** Untrusted CSV exports and images are analyzed in isolated read-only subagents (`analyst`, `creative-eye`) without write permissions or shell execution.
- **Fail-Safe Spend Guard:** The `guard.mjs` hook intercepts MCP advertising tool invocations matching write/mutate tokens (`create`, `update`, `delete`, `pause`, `boost`, `set`) and rejects them with a safe change packet recommendation.
- **Passive Data Boundary:** All CSV cells, ad names, and external notes are treated strictly as passive data strings. Embedded instructions or prompt injection attempts are quoted and never executed.

---

## Configuration

Configure options via Claude Code `/config` or during plugin setup:

| Option | Values | Default | Purpose |
|---|---|---|---|
| `hook_mode` | `on`, `guard-only`, `off` | `on` | Controls hook activation (briefing, spend guard, verification). |
| `spend_guard` | `block`, `off` | `block` | Intercepts mutating advertising tool calls. |

---

## Ideas That Shaped Lorewise

Lorewise builds upon influential ideas from the open AI and developer community:

- **Andrej Karpathy's LLM-wiki concept:** Clean separation between raw immutable sources and distilled living playbooks.
- **obra's Superpowers:** Small, composable skills tested via rigorous ablation and deterministic checks.
- **Compound Engineering / ECC:** Continuous compounding of project-specific lessons over time.
- **Early marketing audit prototypes:** Pioneering exploration of advertising audits within Claude.

---

## License

[MIT License](LICENSE) &copy; 2026 salohiddinayydigital-sudo and Lorewise contributors.
