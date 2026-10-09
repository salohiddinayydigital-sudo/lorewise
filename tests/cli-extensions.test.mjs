import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { auditCsv } from '../scripts/lib/csv.mjs';
import { initWorkspace, initClient } from '../scripts/lib/init.mjs';
import { generateDashboard, formatDashboardAscii } from '../scripts/lib/dashboard.mjs';

describe('CLI Extensions & Platform Audit', () => {
  const repoRoot = path.resolve(import.meta.dirname, '..');

  it('auditCsv correctly identifies Meta Ads and flags fatigue + non-additive columns', () => {
    const metaCsvPath = path.join(repoRoot, 'skills', 'start', 'demo', 'data', 'meta.csv');
    const res = auditCsv(metaCsvPath);

    assert.equal(res.platform, 'meta');
    assert.equal(res.hasTotalsRow, false);
    assert.ok(res.nonAdditiveColumns.length > 0);
    assert.ok(res.nonAdditiveColumns.some(c => c.toLowerCase().includes('frequency')));
    
    // Check that fatigue anomaly was detected on high frequency ad sets
    const fatigueAnomaly = res.anomalies.find(a => a.type === 'fatigue');
    assert.ok(fatigueAnomaly, 'Should flag creative fatigue on high frequency');
    assert.ok(res.metrics.totalSpend > 0);
    assert.ok(res.metrics.totalConversions > 0);
    assert.ok(res.metrics.blendedCpa > 0);
  });

  it('auditCsv detects Google Ads export and computes accurate blended CPA', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'google-audit-'));
    const csvPath = path.join(tmpDir, 'google.csv');
    const content = [
      'Campaign,Cost,Impr.,Clicks,Conversions,Cost / conv.',
      'Search_Brand,500.00,5000,450,50,10.00',
      'PMax_Shopping,1200.00,25000,800,40,30.00',
      'Total,1700.00,30000,1250,90,18.88'
    ].join('\n');
    fs.writeFileSync(csvPath, content, 'utf8');

    const res = auditCsv(csvPath);
    assert.equal(res.platform, 'google');
    assert.equal(res.hasTotalsRow, true);
    assert.equal(res.metrics.totalSpend, 1700.00);
    assert.equal(res.metrics.totalConversions, 90);
    assert.equal(res.metrics.blendedCpa, 18.89);

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('auditCsv detects Telegram Ads export and flags high CPM', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tg-audit-'));
    const csvPath = path.join(tmpDir, 'telegram.csv');
    const content = [
      'Channel,CPM,Views,Clicks,Budget spent,Joined channel',
      'Crypto_Daily,18.50,100000,1200,1850.00,320',
      'Tech_News,6.00,50000,400,300.00,80'
    ].join('\n');
    fs.writeFileSync(csvPath, content, 'utf8');

    const res = auditCsv(csvPath);
    assert.equal(res.platform, 'telegram');
    assert.equal(res.hasTotalsRow, false);
    const highCpm = res.anomalies.find(a => a.type === 'high_cpm');
    assert.ok(highCpm, 'Should flag CPM >= 15 on Telegram');

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('initClient creates complete client structure, profile.md, bets.csv, and updates desk.md', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'init-client-'));
    const res = initClient('alpha-brand', {
      name: 'Alpha Brand',
      budget: 8000,
      targetRoas: '3.20',
      targetCpa: '25.00',
      primaryChannel: 'Meta',
      secondaryChannel: 'Telegram',
      workspaceDir: tmpDir
    });

    assert.equal(res.slug, 'alpha-brand');
    assert.ok(fs.existsSync(res.profilePath));
    assert.ok(fs.existsSync(res.betsPath));
    assert.ok(fs.existsSync(path.join(res.clientDir, 'exports')));
    assert.ok(fs.existsSync(path.join(res.clientDir, 'briefs')));
    assert.ok(fs.existsSync(path.join(res.clientDir, 'reports')));

    const profileText = fs.readFileSync(res.profilePath, 'utf8');
    assert.ok(profileText.includes('client: "Alpha Brand"'));
    assert.ok(profileText.includes('monthly_budget: 8000'));
    assert.ok(profileText.includes('target_roas: 3.20'));

    const deskText = fs.readFileSync(path.join(tmpDir, 'lorewise', 'desk.md'), 'utf8');
    assert.ok(deskText.includes('| Alpha Brand | alpha-brand | $8,000 | Meta | Telegram | 0 | 0 |'));

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('generateDashboard and formatDashboardAscii render clean portfolio dashboard', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dash-test-'));
    
    // Init two clients
    initClient('brand-one', { name: 'Brand One', budget: 5000, workspaceDir: tmpDir });
    initClient('brand-two', { name: 'Brand Two', budget: 12000, workspaceDir: tmpDir });

    const data = generateDashboard(tmpDir, repoRoot);
    assert.equal(data.clients.length, 2);
    assert.equal(data.totalMonthlySpend, 17000);

    const ascii = formatDashboardAscii(data);
    assert.ok(ascii.includes('LOREWISE MEDIA BUYER DESK DASHBOARD'));
    assert.ok(ascii.includes('Brand One'));
    assert.ok(ascii.includes('Brand Two'));
    assert.ok(ascii.includes('Total Portfolio Monthly Budget: $17,000'));
    assert.ok(ascii.includes('Spend Guard:'));

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('runs lorewise.mjs init, dashboard, and diagnose via CLI subprocesses', () => {
    const cliPath = path.join(repoRoot, 'scripts', 'lorewise.mjs');
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-sub-'));

    // 1. Run init
    const initOut = execFileSync(process.execPath, [cliPath, 'init', 'test-store', '--name', 'Test Store'], {
      cwd: tmpDir,
      encoding: 'utf8'
    });
    assert.ok(initOut.includes('[Lorewise Initialized] Client "Test Store" (test-store) ready'));

    // 2. Run dashboard
    const dashOut = execFileSync(process.execPath, [cliPath, 'dashboard', tmpDir], {
      encoding: 'utf8'
    });
    assert.ok(dashOut.includes('Test Store'));
    assert.ok(dashOut.includes('test-store'));

    // 3. Run diagnose on CSV
    const csvPath = path.join(repoRoot, 'evals', 'fixtures', 'totals-trap.csv');
    const diagOut = execFileSync(process.execPath, [cliPath, 'diagnose', csvPath], {
      encoding: 'utf8'
    });
    assert.ok(diagOut.includes('Summary Totals row detected'));
    // 4. Run init --demo
    const demoOut = execFileSync(process.execPath, [cliPath, 'init', '--demo'], {
      cwd: tmpDir,
      encoding: 'utf8'
    });
    assert.ok(demoOut.includes('[Lorewise Demo Initialized] "Demo Shop" (demo-shop) ready'));

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
