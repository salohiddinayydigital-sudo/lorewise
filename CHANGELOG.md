# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-09

### Added
- Initial production release of Lorewise: the media buyer's compounding second brain.
- Eight core operator skills: `start`, `week`, `plan`, `remember`, `diagnose`, `creative`, `learn`, and `check`.
- Three adversarial subagents: `analyst` (diagnostic auditor), `skeptic` (independent draft reviewer), and `creative-eye` (visual inspection).
- Deterministic Receipts Engine (`scripts/lorewise.mjs`): penny-exact arithmetic, CSV profiler, non-additive metric guard, and automated report stamping.
- Deterministic Spend Guard (`scripts/guard.mjs`): sub-150ms PreToolUse hook interceptor blocking 100% of mutating advertising tools.
- Verification & Briefing Hooks: PostToolUse receipt verification feedback and SessionStart instant desk briefing.
- Falsifiable Bets Framework: bet settlement outside conversion lag windows with noise band tolerance and auto-derived lesson tiers.
- 20-check diagnostic framework with four-state evaluation and 60% observational coverage gate.
- 31 verified platform reference claims across Meta, Google Ads, GA4, Blended Economics, and Tracking Hygiene.
- Zero-dependency synthetic demo generator (`tests/gen-demo.mjs`) seeding an 8-week multi-channel store package.
- 12-case comprehensive evaluation suite with automated regex and LLM graders.
- Complete documentation: `docs/how-it-works.md`, `docs/support-matrix.md`, and comprehensive `README.md`.

## [0.1.0] - 2026-10-09

### Added
- Core plugin manifest (`.claude-plugin/plugin.json`) and marketplace definition (`.claude-plugin/marketplace.json`).
- Contributor and agent contract (`AGENTS.md`) enforcing clean-room architecture, verifiable receipts, and non-additive metric rules.
- Security policy (`SECURITY.md`) detailing read-only spend guard and Meta's Rule of Two implementation.
- Repository structure, clean-room contribution guidelines (`CONTRIBUTING.md`), and Contributor Covenant (`CODE_OF_CONDUCT.md`).
- Multi-platform GitHub Actions CI matrix workflow testing across Ubuntu, Windows, and macOS.
- Structural test suite (`tests/structure.test.mjs`) verifying size limits, file boundaries, and clean-room string hygiene.
