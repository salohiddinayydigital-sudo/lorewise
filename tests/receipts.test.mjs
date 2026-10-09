import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { profileCsv, auditCsv } from '../scripts/lib/csv.mjs';
import { buildLedger, isNonAdditiveColumn } from '../scripts/lib/ledger.mjs';
import { stampReport } from '../scripts/lib/stamp.mjs';
import { findUnverifiedMetrics } from '../scripts/lib/verify.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const LOREWISE_CLI = path.join(REPO_ROOT, 'scripts', 'lorewise.mjs');
const DEMO_DIR = path.join(REPO_ROOT, 'skills', 'start', 'demo');

describe('Receipts Engine — CSV Profiler', () => {
  it('correctly profiles delimiter, header, and totals row', () => {
    const metaPath = path.join(DEMO_DIR, 'data', 'meta.csv');
    const profile = profileCsv(metaPath);

    assert.strictEqual(profile.delimiter, ',');
    assert.ok(profile.headers.includes('Amount spent (USD)'));
    assert.ok(profile.headers.includes('Purchases'));
    assert.ok(profile.dataRowCount > 0);
  });

  it('detects summary Totals row at the bottom of exports', () => {
    const totalsTrapPath = path.join(REPO_ROOT, 'evals', 'fixtures', 'totals-trap.csv');
    const profile = profileCsv(totalsTrapPath);

    assert.strictEqual(profile.hasTotalsRow, true, 'Must detect summary Totals row');
  });

  it('handles international currency symbols and European comma formatting in auditCsv and profileCsv', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'euro-test-'));
    try {
      const euroCsvPath = path.join(tmpDir, 'euro.csv');
      const csvContent = [
        'Campaign name,Amount spent,Link clicks,Purchases',
        'Euro Campaign 1,"1250,50 €",450,25',
        'Euro Campaign 2,"2300,75 €",800,40'
      ].join('\n');
      fs.writeFileSync(euroCsvPath, csvContent, 'utf8');

      const audit = auditCsv(euroCsvPath);
      assert.strictEqual(audit.platform, 'meta');
      assert.strictEqual(audit.metrics.totalConversions, 65);
      assert.ok(audit.metrics.totalSpend > 3500);
      assert.ok(audit.metrics.blendedCpa > 0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('Receipts Engine — Non-Additive Metric Guard', () => {
  it('flags non-additive column names', () => {
    assert.strictEqual(isNonAdditiveColumn('Reach'), true);
    assert.strictEqual(isNonAdditiveColumn('Frequency'), true);
    assert.strictEqual(isNonAdditiveColumn('CTR'), true);
    assert.strictEqual(isNonAdditiveColumn('ROAS'), true);
    assert.strictEqual(isNonAdditiveColumn('Cost per Purchase (USD)'), true);
    assert.strictEqual(isNonAdditiveColumn('Amount spent (USD)'), false);
    assert.strictEqual(isNonAdditiveColumn('Purchases'), false);
  });

  it('refuses to sum reach across rows', () => {
    const req = {
      files: [{ id: 'f1', path: path.join(REPO_ROOT, 'evals', 'fixtures', 'weekly-reach.csv') }],
      queries: [
        { id: 'r1', file: 'f1', column: 'Reach', agg: 'sum' }
      ]
    };

    assert.throws(
      () => buildLedger(req),
      /Non-additive guard violation/
    );
  });
});

describe('Receipts Engine — Deterministic Math & Totals Trap', () => {
  it('computes sums exact to the penny and avoids double-counting totals row', () => {
    const req = {
      files: [{ id: 'f1', path: path.join(REPO_ROOT, 'evals', 'fixtures', 'totals-trap.csv') }],
      queries: [
        { id: 'r1', label: 'True Total Spend', file: 'f1', column: 'Spend', agg: 'sum' }
      ]
    };

    const ledger = buildLedger(req);
    const spendFact = ledger.facts.find(f => f.id === 'r1');

    // Totals trap fixture has: Brand $1000, Retargeting $500, Totals $1500.
    // The sum across campaigns must be exactly $1,500.00, NOT $3,000.00!
    assert.strictEqual(spendFact.value, 1500.00);
  });

  it('computes formula ratios with precision', () => {
    const req = {
      files: [{ id: 'f1', path: path.join(DEMO_DIR, 'data', 'meta.csv') }],
      queries: [
        { id: 'r3', label: 'Spend', file: 'f1', column: 'Amount spent (USD)', agg: 'sum' },
        { id: 'r6', label: 'Purchases', file: 'f1', column: 'Purchases', agg: 'sum' },
        { id: 'r7', label: 'CPA', formula: 'r3/r6' }
      ]
    };

    const ledger = buildLedger(req);
    const spend = ledger.facts.find(f => f.id === 'r3').value;
    const purchases = ledger.facts.find(f => f.id === 'r6').value;
    const cpa = ledger.facts.find(f => f.id === 'r7').value;

    assert.strictEqual(spend, 5768.40);
    assert.strictEqual(purchases, 212);
    assert.strictEqual(cpa, 27.21);
  });
});

describe('Receipts Engine — Stamp Verification', () => {
  it('stamps reports with exact counts of recomputed and stated figures', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lorewise-stamp-'));
    try {
      const reportPath = path.join(tmpDir, 'test-report.md');
      const ledgerPath = path.join(DEMO_DIR, 'ledger.json');

      const initialReport = `# Weekly Review\n\nWe spent $5,768.40 [r3] and generated 212 purchases [r6]. Store recorded 164 orders [r12].\n`;
      fs.writeFileSync(reportPath, initialReport, 'utf8');

      const stampRes = stampReport(reportPath, ledgerPath);
      assert.strictEqual(stampRes.totalFigures, 3);
      assert.strictEqual(stampRes.recomputedCount, 3);

      const stampedContent = fs.readFileSync(reportPath, 'utf8');
      assert.ok(stampedContent.includes('*Receipts: 3 figures — 3 recomputed, 0 client-stated, 0 estimates.*'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('tracks unknown receipt IDs cited in report that are missing from ledger', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lorewise-stamp-unknown-'));
    try {
      const reportPath = path.join(tmpDir, 'test-report-unknown.md');
      const ledgerPath = path.join(DEMO_DIR, 'ledger.json');

      const initialReport = `# Weekly Review\n\nWe spent $5,768.40 [r3] and mystery metric was 99 [r999].\n`;
      fs.writeFileSync(reportPath, initialReport, 'utf8');

      const stampRes = stampReport(reportPath, ledgerPath);
      assert.strictEqual(stampRes.totalFigures, 2);
      assert.strictEqual(stampRes.recomputedCount, 1);
      assert.strictEqual(stampRes.unknownCount, 1);
      assert.deepStrictEqual(stampRes.unknownIds, ['r999']);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('Receipts Engine — PostToolUse Verify & False Alarm Immunity', () => {
  it('catches unsourced metric claims without receipt tags', () => {
    const badText = `We spent $4,200.00 and gained 95 purchases at a CPA of $44.20.`;
    const unverified = findUnverifiedMetrics(badText);
    assert.ok(unverified.length >= 2, 'Must catch unsourced figures');
  });

  it('ignores dates, section headers, labeled estimates, and lines with [rX] tags', () => {
    const cleanText = [
      `# 1. Weekly Performance for 2026-W41`,
      `Review period: 2026-09-28 to 2026-10-04.`,
      `We spent $5,768.40 [r3] and generated 212 purchases [r6].`,
      `Estimated holiday surge: $10,000.00 (estimate).`,
      `LTV: unknown.`,
      `| Metric | Spend | Purchases |`,
      `| Total | $5,768.40 | 212 |`
    ].join('\n');

    const unverified = findUnverifiedMetrics(cleanText);
    assert.strictEqual(unverified.length, 0, 'Must have zero false alarms on properly sourced content');
  });
});

describe('Receipts Engine — CLI End-to-End', () => {
  it('runs lorewise.mjs profile via CLI', () => {
    const metaPath = path.join(DEMO_DIR, 'data', 'meta.csv');
    const res = spawnSync(process.execPath, [LOREWISE_CLI, 'profile', metaPath], { encoding: 'utf8' });
    assert.strictEqual(res.status, 0);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.delimiter, ',');
  });

  it('runs lorewise.mjs hook verify via CLI and exits 2 on unsourced report', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lorewise-hook-'));
    try {
      const reportsDir = path.join(tmpDir, 'clients', 'acme', 'reports');
      fs.mkdirSync(reportsDir, { recursive: true });
      const reportFile = path.join(reportsDir, '2026-W41.md');
      fs.writeFileSync(reportFile, 'Campaign C-1 spent $4,500.00 without any receipt tag.', 'utf8');

      const payload = JSON.stringify({ path: reportFile });
      const res = spawnSync(process.execPath, [LOREWISE_CLI, 'hook', 'verify'], {
        input: payload,
        encoding: 'utf8'
      });

      assert.strictEqual(res.status, 2, 'Must exit with code 2 to send feedback to Claude');
      assert.ok(res.stderr.includes('Lorewise Receipts Notice'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('runs lorewise.mjs diagnose via CLI', () => {
    const res = spawnSync(process.execPath, [LOREWISE_CLI, 'diagnose', DEMO_DIR], { encoding: 'utf8' });
    assert.strictEqual(res.status, 0);
    assert.ok(res.stdout.includes('Lorewise Automated Diagnostic Engine'));
    assert.ok(res.stdout.includes('Diagnostic audit ready'));
  });
});

