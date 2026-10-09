import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parseCsv } from './csv.mjs';

const NON_ADDITIVE_KEYWORDS = [
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
 * Executes a ledger request file and returns the structured ledger data
 */
export function buildLedger(request, baseDir = process.cwd()) {
  const period = request.period || { from: 'unknown', to: 'unknown' };
  const filesList = [];
  const fileCache = new Map();

  // Load and hash all input files
  for (const f of request.files || []) {
    const fullPath = path.isAbsolute(f.path) ? f.path : path.resolve(baseDir, f.path);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Input file not found: ${f.path}`);
    }
    const rawContent = fs.readFileSync(fullPath, 'utf8');
    const sha256 = crypto.createHash('sha256').update(rawContent).digest('hex');
    const { rows, delimiter } = parseCsv(rawContent);

    const fileMeta = {
      id: f.id,
      name: path.basename(fullPath),
      path: f.path,
      platform: f.platform || 'generic',
      rows: rows.length,
      sha256
    };
    filesList.push(fileMeta);
    fileCache.set(f.id, { rows, delimiter, fileMeta });
  }

  const facts = [];
  const factMap = new Map();
  const gaps = request.gaps ? [...request.gaps] : [];

  // Process queries
  for (const q of request.queries || []) {
    if (q.formula) {
      // Computed formula
      const fact = computeFormulaFact(q, factMap);
      facts.push(fact);
      factMap.set(fact.id, fact.value);
    } else {
      // Quoted fact from file
      const fact = computeQuotedFact(q, fileCache);
      facts.push(fact);
      factMap.set(fact.id, fact.value);
    }
  }

  return {
    period,
    files: filesList,
    facts,
    gaps
  };
}

function computeQuotedFact(q, fileCache) {
  const cached = fileCache.get(q.file);
  if (!cached) {
    throw new Error(`Referenced file id "${q.file}" not loaded in ledger request`);
  }

  const { rows } = cached.rows.length ? cached : { rows: [] };
  if (rows.length < 2) {
    throw new Error(`File ${q.file} has insufficient rows (header + data required)`);
  }

  const headers = rows[0];
  const colIdx = headers.findIndex(h => h.trim().toLowerCase() === q.column.trim().toLowerCase());
  if (colIdx === -1) {
    throw new Error(`Column "${q.column}" not found in file ${q.file}. Available: ${headers.join(', ')}`);
  }

  const agg = (q.agg || 'sum').toLowerCase();

  // Guard against summing non-additive metrics
  if (agg === 'sum' && isNonAdditiveColumn(q.column)) {
    throw new Error(
      `Non-additive guard violation: Refusing to sum "${q.column}". ` +
      `Metrics like reach, frequency, CTR, and ROAS cannot be summed across rows. ` +
      `Sum raw constituent numbers and recompute ratio via formula instead.`
    );
  }

  let dataRows = rows.slice(1);
  let effectiveRowsDesc = `2-${rows.length}`;

  // If specific row range requested
  if (q.rows) {
    if (String(q.rows).includes('-')) {
      const [start, end] = String(q.rows).split('-').map(Number);
      dataRows = rows.slice(start - 1, end);
      effectiveRowsDesc = q.rows;
    } else {
      const singleRow = Number(q.rows);
      dataRows = [rows[singleRow - 1]];
      effectiveRowsDesc = String(q.rows);
    }
  } else {
    // Automatically check for Totals/Summary row at bottom to prevent double counting
    const lastRow = dataRows[dataRows.length - 1];
    const firstCell = (lastRow && lastRow[0] ? lastRow[0] : '').toLowerCase();
    if (firstCell.includes('total') || firstCell.includes('results') || firstCell.includes('summary')) {
      dataRows = dataRows.slice(0, dataRows.length - 1);
      effectiveRowsDesc = `2-${rows.length - 1}`;
    }
  }

  let value = 0;

  if (agg === 'sum') {
    let sum = 0;
    for (const r of dataRows) {
      if (!r || !r[colIdx]) continue;
      const cleanVal = r[colIdx].replace(/[\$,]/g, '').trim();
      const num = Number(cleanVal);
      if (!isNaN(num)) sum += num;
    }
    // Round to 2 decimal places if fractional
    value = Math.round(sum * 100) / 100;
  } else if (agg === 'count') {
    value = dataRows.length;
  } else if (agg === 'exact') {
    const rawVal = (dataRows[0] && dataRows[0][colIdx] ? dataRows[0][colIdx] : '').replace(/[\$,]/g, '').trim();
    const num = Number(rawVal);
    value = isNaN(num) ? rawVal : num;
  }

  return {
    id: q.id,
    label: q.label || q.column,
    value,
    unit: q.unit || 'unit',
    kind: 'quoted',
    file: q.file,
    column: headers[colIdx],
    rows: effectiveRowsDesc,
    agg
  };
}

function computeFormulaFact(q, factMap) {
  // Safe evaluation of simple arithmetic expressions: r3/r6, r3+r4, r6-r12
  const formula = q.formula;
  // Replace tokens like r1, r2 with their values
  const evaluatedStr = formula.replace(/\b([a-zA-Z][0-9]+)\b/g, (match) => {
    if (!factMap.has(match)) {
      throw new Error(`Formula "${formula}" references undefined fact id: ${match}`);
    }
    return String(factMap.get(match));
  });

  // Only allow numbers and basic math operators +, -, *, /, (, )
  if (!/^[\d\s\+\-\*\/\(\)\.]+$/.test(evaluatedStr)) {
    throw new Error(`Formula contains unsafe characters: ${formula}`);
  }

  // Safe Function evaluation for arithmetic
  const result = Function(`"use strict"; return (${evaluatedStr});`)();
  const value = Math.round(result * 100) / 100;

  return {
    id: q.id,
    label: q.label || q.formula,
    value,
    unit: q.unit || 'unit',
    kind: 'computed',
    formula: q.formula
  };
}
