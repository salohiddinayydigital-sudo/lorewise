# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

---

## Threat Model & Principles

Lorewise operates under Meta's **Rule of Two** design pattern for autonomous agent security:
An autonomous agent session should never concurrently hold untrusted external input, sensitive account access, and state modification privileges without explicit human approval.

1. **Read-Only By Design:**
   Lorewise is designed to ingest and audit campaign data without executing unsolicited write or mutation calls against advertising APIs.
2. **Untrusted Data Isolation:**
   Campaign exports (CSV, TSV, XLSX) and ad images are parsed within isolated subagent contexts with restricted tool access.
3. **Spend Guard Interception:**
   Mutating API calls through Model Context Protocol (MCP) servers (e.g. ad creation, budget updates, campaign activation) are intercepted by `guard.mjs`. Lorewise outputs actionable change packets for human verification instead.
4. **Zero Stored Credentials:**
   Lorewise does not request, store, or transmit ad account credentials, OAuth tokens, or API secrets.

---

## Reporting a Vulnerability

If you discover a security vulnerability or bypass in Lorewise:

1. **Do not create a public GitHub issue.**
2. Report the vulnerability privately via GitHub Security Advisories at:
   `https://github.com/salohiddinayydigital-sudo/lorewise/security/advisories/new`
3. Include detailed reproduction steps, environment details (OS, Node version, Claude Code version), and potential impact.

We aim to acknowledge reports within 48 hours and provide remediation updates promptly.
