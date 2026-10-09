import fs from 'node:fs';

export const NON_ADDITIVE_KEYWORDS = [
  'reach',
  'frequency',
  'ctr',
  'cpc',
  'cpm',
  'roas',
  'rate',
  'cost per purchase',
  'cost / conv',
  'cost_per_'
];

export function isNonAdditiveColumn(columnName) {
  const lower = columnName.toLowerCase();
  return NON_ADDITIVE_KEYWORDS.some(k => lower.includes(k));
}

/**
 * Parses CSV text into rows, handling quotes, commas, and newlines.
 */
export function parseCsv(text, delimiter = null) {
  // Strip BOM
  let cleaned = text;
  if (cleaned.charCodeAt(0) === 0xFEFF) {
    cleaned = cleaned.slice(1);
  }

  // Auto-detect delimiter if not provided
  if (!delimiter) {
    const firstLine = cleaned.split(/\r?\n/)[0] || '';
    const commas = (firstLine.match(/,/g) || []).length;
    const tabs = (firstLine.match(/\t/g) || []).length;
    const semicolons = (firstLine.match(/;/g) || []).length;

    if (tabs > commas && tabs > semicolons) delimiter = '\t';
    else if (semicolons > commas && semicolons > tabs) delimiter = ';';
    else delimiter = ',';
  }

  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const nextChar = cleaned[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // handle CRLF
      }
      currentRow.push(currentField.trim());
      if (currentRow.some(f => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return { rows, delimiter };
}

/**
 * Profiles a CSV file: delimiter, encoding, headers, row count, column types, totals row.
 */
export function profileCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { rows, delimiter } = parseCsv(content);

  if (rows.length === 0) {
    return { error: 'Empty file' };
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);

  // Check if last row is a totals row
  let hasTotalsRow = false;
  if (dataRows.length > 0) {
    const lastRow = dataRows[dataRows.length - 1];
    const firstCol = (lastRow[0] || '').toLowerCase();
    if (firstCol.includes('total') || firstCol.includes('results') || firstCol.includes('summary')) {
      hasTotalsRow = true;
    }
  }

  // Sniff numeric columns
  const numericColumns = [];
  for (let colIdx = 0; colIdx < headers.length; colIdx++) {
    let numericCount = 0;
    const sampleRows = dataRows.slice(0, Math.min(20, dataRows.length));
    for (const r of sampleRows) {
      const val = (r[colIdx] || '').replace(/[\$,]/g, '');
      if (val !== '' && !isNaN(Number(val))) {
        numericCount++;
      }
    }
    if (numericCount >= sampleRows.length * 0.8 && sampleRows.length > 0) {
      numericColumns.push(headers[colIdx]);
    }
  }

  return {
    filePath,
    delimiter,
    headers,
    totalRows: rows.length,
    dataRowCount: dataRows.length,
    hasTotalsRow,
    numericColumns
  };
}

/**
 * Intelligent Media Buyer Audit of an Advertising Export CSV
 * Identifies platform (Meta, Google, Telegram, Store), scans for totals trap,
 * non-additive metrics, fatigue warnings, and computes clean blended actuals.
 */
export function auditCsv(filePath) {
  const profile = profileCsv(filePath);
  if (profile.error) {
    return { error: profile.error };
  }

  const { rows } = parseCsv(fs.readFileSync(filePath, 'utf8'));
  const headers = profile.headers;
  const headerStr = headers.join(' ').toLowerCase();

  // Platform auto-detection
  let platform = 'generic';
  if (headerStr.includes('amount spent') || (headerStr.includes('campaign name') && headerStr.includes('impressions'))) {
    platform = 'meta';
  } else if (headerStr.includes('cost / conv') || (headerStr.includes('campaign') && headerStr.includes('impr.')) || headerStr.includes('conv. value')) {
    platform = 'google';
  } else if (headerStr.includes('cpm') && (headerStr.includes('channel') || headerStr.includes('views') || headerStr.includes('joined channel'))) {
    platform = 'telegram';
  } else if (headerStr.includes('order id') || headerStr.includes('total sales') || headerStr.includes('customer id')) {
    platform = 'store';
  }

  // Traps & Non-Additive metrics detection
  const nonAdditive = [];
  for (const h of headers) {
    if (isNonAdditiveColumn(h)) {
      nonAdditive.push(h);
    }
  }

  const anomalies = [];
  if (profile.hasTotalsRow) {
    anomalies.push({
      type: 'totals_row',
      severity: 'warning',
      message: `Summary Totals row detected at row ${rows.length}. Exclude from sums to avoid 2x double-counting.`
    });
  }

  if (nonAdditive.length > 0) {
    anomalies.push({
      type: 'non_additive',
      severity: 'warning',
      message: `Non-additive column(s) detected: ${nonAdditive.join(', ')}. Never SUM these columns across rows; recompute using weighted totals.`
    });
  }

  // Column matching
  const getColIdx = (...terms) => {
    for (let i = 0; i < headers.length; i++) {
      const h = headers[i].toLowerCase();
      if (terms.some(t => h.includes(t))) return i;
    }
    return -1;
  };

  const spendIdx = getColIdx('amount spent', 'cost', 'budget spent', 'total sales');
  const impIdx = getColIdx('impressions', 'impr.', 'views');
  const clickIdx = getColIdx('link clicks', 'clicks');
  const convIdx = getColIdx('purchases', 'conversions', 'joined channel', 'orders');
  const freqIdx = getColIdx('frequency');
  const cpmIdx = getColIdx('cpm');
  const nameIdx = getColIdx('campaign', 'channel', 'ad set name');

  const dataRows = profile.hasTotalsRow ? rows.slice(1, -1) : rows.slice(1);

  let totalSpend = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalConversions = 0;

  for (let rIdx = 0; rIdx < dataRows.length; rIdx++) {
    const row = dataRows[rIdx];
    const rowNum = rIdx + 2;
    const rowName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : `Row ${rowNum}`;

    const parseNum = (idx) => {
      if (idx === -1 || !row[idx]) return 0;
      const clean = row[idx].replace(/[\$,]/g, '').trim();
      const n = Number(clean);
      return isNaN(n) ? 0 : n;
    };

    const spend = parseNum(spendIdx);
    const imp = parseNum(impIdx);
    const clicks = parseNum(clickIdx);
    const conv = parseNum(convIdx);
    const freq = parseNum(freqIdx);
    const cpm = parseNum(cpmIdx);

    totalSpend += spend;
    totalImpressions += imp;
    totalClicks += clicks;
    totalConversions += conv;

    // Creative fatigue alert (Meta frequency >= 3.5)
    if (freq >= 3.5) {
      anomalies.push({
        type: 'fatigue',
        severity: 'alert',
        row: rowNum,
        message: `High frequency alert on "${rowName}" (${freq.toFixed(1)}). Creative fatigue detected: audience is saturated.`
      });
    }

    // High CPM check
    if (cpm >= 35 && platform === 'meta') {
      anomalies.push({
        type: 'high_cpm',
        severity: 'warning',
        row: rowNum,
        message: `Elevated CPM on "${rowName}" ($${cpm.toFixed(2)}). Audience auction is saturated or bidding is aggressive.`
      });
    } else if (cpm >= 15 && platform === 'telegram') {
      anomalies.push({
        type: 'high_cpm',
        severity: 'warning',
        row: rowNum,
        message: `Elevated Telegram CPM on "${rowName}" ($${cpm.toFixed(2)}). Premium channel bidding above standard benchmark.`
      });
    }

    // Bleeding spend without conversions
    if (spend >= 50 && conv === 0 && convIdx !== -1) {
      anomalies.push({
        type: 'zero_conversion',
        severity: 'alert',
        row: rowNum,
        message: `Bleeding spend on "${rowName}": $${spend.toFixed(2)} spent with 0 conversions. Verify tracking or pause.`
      });
    }
  }

  const blendedCpa = totalConversions > 0 ? (totalSpend / totalConversions) : null;
  const blendedCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100) : null;

  return {
    ...profile,
    platform,
    nonAdditiveColumns: nonAdditive,
    anomalies,
    metrics: {
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalImpressions,
      totalClicks,
      totalConversions,
      blendedCpa: blendedCpa !== null ? Math.round(blendedCpa * 100) / 100 : null,
      blendedCtr: blendedCtr !== null ? Math.round(blendedCtr * 100) / 100 : null
    }
  };
}
