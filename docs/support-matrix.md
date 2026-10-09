# Platform Support & Compatibility Matrix

Lorewise is designed to operate seamlessly across different AI agent environments, with graduated capability levels depending on runtime hook and agent isolation support.

---

## 1. Environment Support Matrix

| Environment | Status | Skills | Agents | Spend Guard (Hook) | Receipts Hook | Zero-Runtime Fallback |
|---|---|---|---|---|---|---|
| **Claude Code CLI** | **Tier 1 (Official / Full)** | Supported | Supported | Supported | Supported | Supported |
| **Claude Desktop / Cowork** | **Tier 2 (Skills Only)** | Supported | Unsupported* | Unsupported* | Unsupported* | Supported |
| **claude.ai Web** | **Tier 2 (Skills Only)** | Supported | Unsupported* | Unsupported* | Unsupported* | Supported |
| **Other Tools (`npx skills`)** | **Tier 3 (Community / Untested)** | Portable | Unsupported | Unsupported | Unsupported | Supported |

*\*Note for Claude Desktop & claude.ai: These environments do not execute PreToolUse/PostToolUse command hooks or launch isolated subagents (`agents/*.md`). Lorewise operates in zero-runtime mode in these environments, relying on markdown skills and prompt discipline.*

---

## 2. Operating System & Node Matrix

Continuous Integration (CI) validates Lorewise on every pull request against the following matrix:

| Operating System | Node.js 20.x | Node.js 22.x | Node.js 24.x | Zero-Runtime (No Node) |
|---|---|---|---|---|
| **Ubuntu Linux** | Verified (CI) | Verified (CI) | Verified | Supported |
| **macOS** | Verified (CI) | Verified (CI) | Verified | Supported |
| **Windows** | Verified (CI) | Verified (CI) | Verified (CI) | Supported |

---

## 3. Fallback Modes

### Full Mode (Node.js + Claude Code)
- PreToolUse hook blocks mutating advertising tools in under 150 ms.
- PostToolUse verify hook catches missing receipt citations in written reports.
- `scripts/lorewise.mjs` provides penny-exact arithmetic, CSV profiling, and automated report stamping.
- Subagents (`analyst`, `skeptic`, `creative-eye`) execute isolated subtasks.

### Zero-Runtime Mode (No Node.js or Scripts)
- If Node.js is absent, Lorewise functions purely via native LLM prompt instructions in `skills/`.
- Every worker skill contains the identical 12-line rules block enforcing receipt citations, non-additive metric protection, four-state audits, and read-only discipline.
- Reports cite raw line numbers from ingested CSVs.
