import fs from 'node:fs';

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
