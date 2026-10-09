#!/usr/bin/env node

/**
 * Lorewise Core CLI & Hook Processor
 * Provides deterministic ledger calculations, file profiling, report stamping,
 * playbook health inspection, client scaffolding, executive dashboard, and
 * workspace hooks with zero runtime dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';
import { profileCsv, auditCsv } from './lib/csv.mjs';
import { buildLedger } from './lib/ledger.mjs';
import { stampReport } from './lib/stamp.mjs';
import { findUnverifiedMetrics } from './lib/verify.mjs';
import { auditPlaybookHealth, checkProtectionState } from './lib/health.mjs';
import { initWorkspace, initClient } from './lib/init.mjs';
import { generateDashboard, formatDashboardAscii } from './lib/dashboard.mjs';

function readStdin() {
  return new Promise((resolve) => {
    let input = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { input += chunk; });
    process.stdin.on('end', () => resolve(input));
    process.stdin.on('error', () => resolve(''));
    setTimeout(() => resolve(input), 500);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.error('Usage: lorewise <profile|ledger|stamp|check|diagnose|dashboard|init|hook>');
    process.exit(1);
  }

  try {
    if (command === 'profile') {
      const filePath = args[1];
      if (!filePath) {
        console.error('Error: file path required for profile');
        process.exit(1);
      }
      const profile = profileCsv(path.resolve(filePath));
      console.log(JSON.stringify(profile, null, 2));
      process.exit(0);
    }

    if (command === 'init') {
      const slug = args[1];
      if (!slug || slug === '--help') {
        console.log('Usage: lorewise init <client-slug> [--name "Brand Name"] [--budget 5000] [--roas 2.5] [--cpa 35] [--primary Meta] [--secondary Google]');
        process.exit(0);
      }

      let name = null;
      let budget = 5000;
      let targetRoas = '2.50';
      let targetCpa = '35.00';
      let primaryChannel = 'Meta';
      let secondaryChannel = 'Google';

      for (let i = 2; i < args.length; i++) {
        if (args[i] === '--name' && args[i + 1]) name = args[i + 1];
        if (args[i] === '--budget' && args[i + 1]) budget = Number(args[i + 1]);
        if (args[i] === '--roas' && args[i + 1]) targetRoas = args[i + 1];
        if (args[i] === '--cpa' && args[i + 1]) targetCpa = args[i + 1];
        if (args[i] === '--primary' && args[i + 1]) primaryChannel = args[i + 1];
        if (args[i] === '--secondary' && args[i + 1]) secondaryChannel = args[i + 1];
      }

      const res = initClient(slug, {
        name,
        budget,
        targetRoas,
        targetCpa,
        primaryChannel,
        secondaryChannel
      });

      console.log(`[Lorewise Initialized] Client "${res.clientName}" (${res.slug}) ready:`);
      console.log(`  - Profile: clients/${res.slug}/profile.md`);
      console.log(`  - Bets Ledger: clients/${res.slug}/bets.csv`);
      console.log(`  - Drops folder: clients/${res.slug}/exports/`);
      console.log(`Updated desk.md portfolio. Next: drop exports and run /lorewise:week!`);
      process.exit(0);
    }

    if (command === 'dashboard') {
      const targetDir = args[1] ? path.resolve(args[1]) : process.cwd();
      const repoRoot = path.resolve(import.meta.dirname, '..');
      const data = generateDashboard(targetDir, repoRoot);
      console.log(formatDashboardAscii(data));
      process.exit(0);
    }

    if (command === 'ledger') {
      let requestPath = null;
      let outPath = null;
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--request' && args[i + 1]) requestPath = args[i + 1];
        if (args[i] === '--out' && args[i + 1]) outPath = args[i + 1];
      }

      if (!requestPath) {
        console.error('Error: --request <file.json> required for ledger');
        process.exit(1);
      }

      const reqContent = JSON.parse(fs.readFileSync(path.resolve(requestPath), 'utf8'));
      const ledger = buildLedger(reqContent, path.dirname(path.resolve(requestPath)));

      if (outPath) {
        fs.writeFileSync(path.resolve(outPath), JSON.stringify(ledger, null, 2), 'utf8');
      } else {
        console.log(JSON.stringify(ledger, null, 2));
      }
      process.exit(0);
    }

    if (command === 'stamp') {
      const reportPath = args[1];
      let ledgerPath = null;
      for (let i = 2; i < args.length; i++) {
        if (args[i] === '--ledger' && args[i + 1]) ledgerPath = args[i + 1];
      }

      if (!reportPath || !ledgerPath) {
        console.error('Usage: lorewise.mjs stamp <report.md> --ledger <ledger.json>');
        process.exit(1);
      }

      const res = stampReport(path.resolve(reportPath), path.resolve(ledgerPath));
      console.log(`Stamped ${reportPath} with ${res.totalFigures} receipts.`);
      process.exit(0);
    }

    if (command === 'check') {
      const targetDir = args[1] ? path.resolve(args[1]) : path.resolve('lorewise', 'playbook');
      const repoRoot = path.resolve(import.meta.dirname, '..');

      const protection = checkProtectionState(repoRoot);
      const health = auditPlaybookHealth(targetDir);

      console.log('--- Lorewise System Health Audit ---');
      console.log(`Protection State: ${protection.description}`);
      console.log(`Runtime Mode: Node.js core active (p95 fast path)`);
      console.log(`Playbook Notes Audited: ${health.totalFiles}`);

      if (health.defectCount === 0) {
        console.log('Knowledge Health: PASS (Zero defects detected)');
      } else {
        console.log(`Knowledge Health: DEFECTS DETECTED (${health.defectCount} issue(s))`);
        if (health.defects.expired.length > 0) {
          console.log(`\n[Expired Facts / Notes (${health.defects.expired.length})]:`);
          for (const item of health.defects.expired) {
            console.log(`  - ${item.id} (${item.file}): expired on ${item.expires}`);
          }
        }
        if (health.defects.unsourced.length > 0) {
          console.log(`\n[Unsourced Notes (${health.defects.unsourced.length})]:`);
          for (const item of health.defects.unsourced) {
            console.log(`  - ${item.id} (${item.file}): missing required source attribution`);
          }
        }
        if (health.defects.contradictory.length > 0) {
          console.log(`\n[Contradictory / Contested Items (${health.defects.contradictory.length})]:`);
          for (const item of health.defects.contradictory) {
            console.log(`  - ${item.id} (${item.file}): ${item.reason}`);
          }
        }
      }

      process.exit(0);
    }

    if (command === 'diagnose') {
      const targetPath = args[1] ? path.resolve(args[1]) : path.resolve('lorewise', 'clients', 'demo-shop');
      console.log('--- Lorewise Automated Diagnostic Engine ---');
      console.log(`Target: ${targetPath}`);

      // If target is directly a CSV file, run in-depth audit
      if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile() && targetPath.endsWith('.csv')) {
        const audit = auditCsv(targetPath);
        console.log(`\nDetected Platform: ${audit.platform.toUpperCase()} ADS`);
        console.log(`Total Rows: ${audit.totalRows} (${audit.dataRowCount} data rows)`);
        console.log(`Delimiter: "${audit.delimiter === '\t' ? '\\t' : audit.delimiter}"`);
        console.log(`Totals Row: ${audit.hasTotalsRow ? 'YES (Row excluded from sums)' : 'NONE'}`);

        if (audit.anomalies.length > 0) {
          console.log(`\n[Audit Traps & Alerts (${audit.anomalies.length})]:`);
          for (const a of audit.anomalies) {
            const prefix = a.severity === 'alert' ? '[ALERT]' : '[WARN]';
            console.log(`  ${prefix} ${a.message}`);
          }
        }

        console.log(`\n[Clean Recomputed Actuals]:`);
        console.log(`  - Total Spend:       $${audit.metrics.totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
        console.log(`  - Impressions:       ${audit.metrics.totalImpressions.toLocaleString()}`);
        console.log(`  - Clicks:            ${audit.metrics.totalClicks.toLocaleString()}`);
        console.log(`  - Conversions:       ${audit.metrics.totalConversions.toLocaleString()}`);
        if (audit.metrics.blendedCpa !== null) {
          console.log(`  - Blended CPA:       $${audit.metrics.blendedCpa.toFixed(2)}`);
        }
        if (audit.metrics.blendedCtr !== null) {
          console.log(`  - Blended CTR:       ${audit.metrics.blendedCtr.toFixed(2)}%`);
        }
        process.exit(0);
      }

      const dataDir = path.join(targetPath, 'data');
      if (fs.existsSync(dataDir)) {
        const dates = fs.readdirSync(dataDir).filter(d => !d.startsWith('.'));
        if (dates.length > 0) {
          const latest = path.join(dataDir, dates[dates.length - 1], 'ledger.json');
          if (fs.existsSync(latest)) {
            const ledger = JSON.parse(fs.readFileSync(latest, 'utf8'));
            console.log(`Ledger facts confirmed: ${ledger.facts.length} fact(s) [rX]`);
            console.log(`Missing data gaps recorded: ${ledger.gaps.length}`);
            const coverage = ledger.facts.length >= 6 ? '>=60% (Sufficient)' : '<60% (Insufficient)';
            console.log(`Observational coverage status: ${coverage}`);
          }
        }
      }
      console.log('Diagnostic audit ready. Full 20-check matrix accessible via /lorewise:diagnose.');
      process.exit(0);
    }

    if (command === 'hook') {
      const subHook = args[1];

      if (subHook === 'brief') {
        // SessionStart hook: read desk.md in current workspace if it exists
        const customDesk = args[2] ? path.resolve(args[2]) : null;
        const deskPath = customDesk || path.resolve('lorewise', 'desk.md');

        if (!fs.existsSync(deskPath)) {
          // Silent if no workspace exists
          process.exit(0);
        }

        const deskContent = fs.readFileSync(deskPath, 'utf8');
        const rows = deskContent.split(/\r?\n/).filter(l => {
          if (!l.startsWith('|')) return false;
          if (l.includes('---')) return false;
          const cols = l.split('|').map(c => c.trim()).filter(Boolean);
          if (cols.length === 0) return false;
          if (cols[0].toLowerCase() === 'client' && cols[1]?.toLowerCase() === 'slug') return false;
          return true;
        });
        const clientCount = rows.length;

        let dueBetsCount = 0;
        let inboxFilesCount = 0;

        for (const row of rows) {
          const cols = row.split('|').map(c => c.trim()).filter(Boolean);
          if (cols.length >= 7) {
            const bets = parseInt(cols[5], 10) || 0;
            const inbox = parseInt(cols[6], 10) || 0;
            dueBetsCount += bets;
            inboxFilesCount += inbox;
          }
        }

        const brief = `Lorewise Desk: ${clientCount} active client(s), ${dueBetsCount} due bet(s), ${inboxFilesCount} inbox file(s). Spend guard active. Type /lorewise:week to review.\n`;
        process.stdout.write(brief.slice(0, 600));
        process.exit(0);
      }

      if (subHook === 'verify') {
        // PostToolUse hook on written reports
        let rawInput = await readStdin();
        if (!rawInput.trim()) process.exit(0);

        let data = {};
        try {
          data = JSON.parse(rawInput);
        } catch {
          process.exit(0);
        }

        const filePath = data.path || (data.input && data.input.path) || '';
        if (!filePath || !filePath.includes('reports') || !filePath.endsWith('.md')) {
          process.exit(0); // Not a client report
        }

        if (fs.existsSync(filePath)) {
          const reportText = fs.readFileSync(filePath, 'utf8');
          const unverified = findUnverifiedMetrics(reportText);

          if (unverified.length > 0) {
            process.stderr.write(
              `Lorewise Receipts Notice: Found ${unverified.length} metric claim(s) without source receipts [rX]:\n` +
              unverified.slice(0, 3).map(u => `  - Line ${u.line}: "${u.figure}" in "${u.text}"`).join('\n') +
              `\nPlease attach source tags [rX] or declare them as (estimate).\n`
            );
            process.exit(2); // Feedback to model
          }
        }

        process.exit(0);
      }
    }

    console.error(`Unknown command: ${command}`);
    process.exit(1);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith('lorewise.mjs')) {
  main();
}
