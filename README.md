# Lorewise

> **Lorewise remembers every client, grades its own advice against next week's numbers, and shows you the row behind every figure.**

Lorewise is an open, client-aware Claude Code plugin for performance marketers and media buyers managing paid campaigns across Meta Ads, Google Ads, GA4, and ecommerce stores.

---

## Quick Start

### Installation

Inside Claude Code:

```bash
/plugin marketplace add salohiddinayydigital-sudo/lorewise
/plugin install lorewise@lorewise
```

### 3-Minute Interactive Demo

Try Lorewise immediately without entering personal credentials or sharing sensitive ad data:

```bash
/lorewise:start
```

Select **Demo Shop (synthetic)** to explore an 8-week multi-channel audit featuring Meta Ads, Google Ads, GA4, and Shopify order data. You will see an immediate sample report with verified source receipts and resolved hypothesis bets.

---

## Why Lorewise?

Most marketing AI assistants give generic, context-free advice without remembering past campaign results or verifying spreadsheet math. Lorewise solves this with three core disciplines:

### 1. Receipts (Zero Hallucinated Figures)
- **Deterministic Math:** Calculations are computed by deterministic local scripts rather than LLM text generation. Every metric points directly to its source file, column, and row ranges (`[r1]`, `[r2]`).
- **Non-Additive Metric Guard:** The math engine refuses to sum non-additive metrics such as reach, frequency, CTR, CPC, CPM, and ROAS. Ratios are always recomputed from constituent raw sums.
- **Explicit Gaps:** If data is missing, Lorewise flags it as `needs_input` rather than guessing.
- **Script-Stamped Receipts:** Final reports receive a machine audit stamp: *Receipts: 41 figures — 38 recomputed, 3 client-stated, 0 estimates.*

### 2. Bets (Self-Graded Recommendations)
- **Accountable Advice:** Every strategic recommendation is recorded as a formal bet in `bets.md` with explicit conditions: `if / then / because / win_if / check_by`.
- **Attribution Lag & Noise Bands:** Bets account for platform conversion lag windows and normal account variance before judging outcomes (`held`, `missed`, `inconclusive`, `void`).
- **Compounding Playbook:** Winning bets graduate through rigorous evidence tiers: `observation` → `pattern` (≥3 wins in account) → `seen in N accounts` → `contested`.

### 3. Desk (Weekly One-Command Cadence)
- **One Command Rhythm:** Run `/lorewise:week <client>` every review day.
- **Client Profiles:** Persistent memory in `lorewise/clients/<client>/client.md` retains target CPA, target ROAS, margins, attribution windows, and source-of-truth priority.
- **Change Packets:** Instead of auto-applying changes, Lorewise generates clear, human-executable action packets with rollback instructions.

---

## Only Three Concepts to Learn

1. **Client:** A business account with known margins, CPA ceilings, and conversion lag windows (`client.md`).
2. **Week:** A review cycle that ingests fresh export data, reconciles platform discrepancies, and checks pacing (`reports/YYYY-Www.md`).
3. **Bet:** A measurable hypothesis tested against next week's numbers (`bets.md`).

---

## Disclosure & Transparency

Lorewise is designed for complete local privacy and transparency:

- **Zero External Telemetry:** Lorewise scripts make **no outbound network requests**. All analysis, calculations, and evaluations run 100% locally on your machine.
- **Local File System Scope:** Lorewise only reads files within your project workspace and writes strictly to your project's `lorewise/` directory and user plugin cache data (`~/.claude/plugins/data/lorewise/`).
- **Scripts & Hooks:** Executes 2 lightweight, zero-dependency Node.js scripts (`scripts/lorewise.mjs` and `scripts/guard.mjs`) through 3 Claude Code hooks:
  - `SessionStart`: Displays a concise workspace briefing (desk status, pending bets, data freshness).
  - `PreToolUse`: Spend guard interceptor that blocks mutating advertising tools.
  - `PostToolUse`: Verification checker that flags unverified metric figures in written reports.
- **Read-Only by Design:** In v1, Lorewise operates strictly as a read-only advisor. It does not mutate or update live ad campaigns through external MCP connectors.

---

## Platform Support Matrix

| Harness / Environment | Support Level | Capabilities |
|---|---|---|
| **Claude Code CLI** | **Full** (Tier A) | Skills, Subagents, Hooks, Local Verification Scripts, Guard |
| **Claude.ai / Cowork** | **Skills Only** (Tier B) | Core interactive skills and playbooks (hooks and custom agents inactive) |
| **Codex / Gemini / Cursor** | **Portable Skills** (Tier C) | Skills compatible with open Agent Skills specification |

---

## Security & Hardening

Lorewise adheres to Meta's *Rule of Two* for agent security: an automated agent session should never combine untrusted inputs, sensitive account access, and state modification without human confirmation.

- **Isolated Analysis Subagents:** Large or untrusted CSV exports and images are analyzed in isolated read-only subagents (`analyst`, `creative-eye`) without write permissions or command execution.
- **Fail-Safe Spend Guard:** The `guard.mjs` hook intercepts MCP advertising tool invocations matching write/mutate tokens (`create`, `update`, `delete`, `pause`, `boost`, `set`) and rejects them with a safe change packet recommendation.

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
