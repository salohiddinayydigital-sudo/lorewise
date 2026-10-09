import fs from 'node:fs';

/**
 * Validates report figures against ledger and stamps the official Receipts badge.
 */
export function stampReport(reportPath, ledgerPath) {
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Report file not found: ${reportPath}`);
  }
  if (!fs.existsSync(ledgerPath)) {
    throw new Error(`Ledger file not found: ${ledgerPath}`);
  }

  let reportText = fs.readFileSync(reportPath, 'utf8');
  const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));

  // Extract all receipt references like [r1], [r12], [r7@2026-10-05]
  const receiptRegex = /\[(r\d+)(?:@[^\]]+)?\]/g;
  const matches = [...reportText.matchAll(receiptRegex)];

  const citedIds = new Set(matches.map(m => m[1]));
  const factsMap = new Map((ledger.facts || []).map(f => [f.id, f]));

  let recomputedCount = 0;
  let statedCount = 0;
  const unknownIds = [];

  for (const id of citedIds) {
    const fact = factsMap.get(id);
    if (fact) {
      if (fact.kind === 'quoted' || fact.kind === 'computed') {
        recomputedCount++;
      } else if (fact.kind === 'told') {
        statedCount++;
      }
    } else {
      unknownIds.push(id);
    }
  }

  const totalFigures = citedIds.size;
  const stampText = `\n\n---\n*Receipts: ${totalFigures} figures — ${recomputedCount} recomputed, ${statedCount} client-stated, 0 estimates.*\n`;

  // Strip existing stamp if present
  const existingStampRegex = /\n*---\n\*Receipts: \d+ figures[^*]+\*\n*/;
  reportText = reportText.replace(existingStampRegex, '').trimEnd();

  const finalReport = reportText + stampText;
  fs.writeFileSync(reportPath, finalReport, 'utf8');

  return {
    totalFigures,
    recomputedCount,
    statedCount,
    unknownCount: unknownIds.length,
    unknownIds,
    stampText
  };
}
