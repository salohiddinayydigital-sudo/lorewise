# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-09

### Added
- Core plugin manifest (`.claude-plugin/plugin.json`) and marketplace definition (`.claude-plugin/marketplace.json`).
- Contributor and agent contract (`AGENTS.md`) enforcing clean-room architecture, verifiable receipts, and non-additive metric rules.
- Security policy (`SECURITY.md`) detailing read-only spend guard and Meta's Rule of Two implementation.
- Repository structure, clean-room contribution guidelines (`CONTRIBUTING.md`), and Contributor Covenant (`CODE_OF_CONDUCT.md`).
- Multi-platform GitHub Actions CI matrix workflow testing across Ubuntu, Windows, and macOS.
- Structural test suite (`tests/structure.test.mjs`) verifying size limits, file boundaries, and clean-room string hygiene.
