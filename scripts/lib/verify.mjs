/**
 * Lorewise Receipts Verification Engine (PostToolUse Hook)
 * Scans generated reports for unsourced metric claims while ignoring dates,
 * section indices, and explicitly declared estimates.
 */

// Regex patterns to detect metric figures: currency, quantities, percentages
const METRIC_PATTERNS = [
  /\$[0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?/g, // $1,234.56 or $50
  /\b[0-9]+(?:,[0-9]{3})*\s+(?:purchases|orders|conversions|clicks|leads|sessions)\b/gi, // 212 purchases
  /\b[0-9]+\.[0-9]{1,2}x\s+ROAS\b/gi, // 3.2x ROAS
  /\bCPA\s*(?:of|is|was|at)?\s*\$?[0-9]+(?:\.[0-9]{2})?\b/gi // CPA $34.10
];

export function findUnverifiedMetrics(text) {
  const lines = text.split(/\r?\n/);
  const unverified = [];

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];

    // Skip headers, tables, code blocks, stamp, copy for client section, or lines explicitly declaring estimates/told
    if (
      line.startsWith('#') ||
      line.startsWith('|') ||
      line.includes('(estimate)') ||
      line.includes('(told') ||
      line.includes('Receipts: ') ||
      line.includes('needs_input') ||
      line.includes('unknown')
    ) {
      continue;
    }

    // Check if line contains a receipt tag [rX] or [rX@date]
    const hasReceipt = /\[r\d+(?:@[^\]]+)?\]/.test(line);

    for (const pattern of METRIC_PATTERNS) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const figure = match[0];
        // If line has no receipt tag and figure looks like an unsourced claim
        if (!hasReceipt) {
          unverified.push({
            line: lineIdx + 1,
            figure,
            text: line.trim()
          });
        }
      }
    }
  }

  return unverified;
}
