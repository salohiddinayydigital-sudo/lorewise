#!/usr/bin/env node

/**
 * Lorewise Core CLI & Hook Processor
 * Provides deterministic ledger calculations, file profiling, report stamping,
 * and workspace hooks with zero runtime dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';
import { profileCsv } from './lib/csv.mjs';
import { buildLedger } from './lib/ledger.mjs';
import { stampReport } from './lib/stamp.mjs';
import { findUnverifiedMetrics } from './lib/verify.mjs';

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
    console.error('Usage: lorewise.mjs <profile|ledger|stamp|hook>');
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

    if (command === 'hook') {
      const subHook = args[1];

      if (subHook === 'brief') {
        // SessionStart hook: read desk.md in current workspace if it exists
        const deskPath = path.resolve('lorewise', 'desk.md');
        if (!fs.existsSync(deskPath)) {
          // Silent if no workspace exists
          process.exit(0);
        }

        const deskContent = fs.readFileSync(deskPath, 'utf8');
        const lines = deskContent.split(/\r?\n/).filter(l => l.startsWith('|') && !l.includes('---') && !l.includes('Client'));
        const clientCount = lines.length;

        const brief = `Lorewise Desk: ${clientCount} active client(s). Type /lorewise:week to view portfolio or run review.\n`;
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
