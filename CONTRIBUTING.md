# Contributing to Lorewise

Thank you for your interest in contributing to Lorewise!

Lorewise is built with clean-room discipline to ensure that all code, skills, and prompts are original, maintainable, and legally clear.

---

## Clean-Room Rules

Every contributor must adhere strictly to these non-negotiable rules:

1. **No External Code Ingestion:** Do not copy or paraphrase prompts, skill markdown files, agent configurations, or code from external repositories. All contributions must be authored from first principles.
2. **Zero Sensitive Data:** Never include real client data, real account names, real API tokens, or non-synthetic numbers in pull requests, tests, or fixtures.
3. **Primary Source Citations:** For advertising platform rules or limits, always cite official documentation (Meta Business Help, Google Ads Help, GA4 Support).

---

## Development Setup

1. Clone your fork of the repository:
   ```bash
   git clone https://github.com/salohiddinayydigital-sudo/lorewise.git
   cd lorewise
   ```

2. Prerequisites:
   - Node.js >= 20.0.0
   - Claude Code CLI >= 2.1.280

3. Run the automated test suite:
   ```bash
   npm test
   ```

4. Validate the plugin manifests:
   ```bash
   npm run validate
   # Or: claude plugin validate --strict .
   ```

---

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New skill, agent, or capability
- `fix:` Bug fix in scripts, parsing, or validation
- `docs:` Documentation improvements
- `test:` Added or updated unit tests or evals
- `refactor:` Code restructuring without functional change

---

## Pull Request Checklist

Before submitting a PR:
- [ ] `npm test` passes without errors.
- [ ] `claude plugin validate --strict .` passes with zero warnings.
- [ ] No hardcoded paths, secret tokens, or forbidden external references.
- [ ] Any new feature includes corresponding unit tests or eval definitions.
