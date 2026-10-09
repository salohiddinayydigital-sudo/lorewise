/**
 * Lorewise Deterministic Demo Data Generator
 * Produces 8 weeks of synthetic multi-channel advertising and ecommerce data
 * with planted test stories, clean-room compliance, and zero dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

// Standard CRC32 table for portable PNG creation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function calcCrc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Mulberry32 32-bit deterministic PRNG
function createPrng(seed) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate valid minimal PNG buffer
export function generateSyntheticPng(width, height, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = calcCrc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowBytes = 1 + width * 3;
  const rawData = Buffer.alloc(rowBytes * height);
  for (let y = 0; y < height; y++) {
    const offset = y * rowBytes;
    rawData[offset] = 0;
    for (let x = 0; x < width; x++) {
      rawData[offset + 1 + x * 3] = r;
      rawData[offset + 1 + x * 3 + 1] = g;
      rawData[offset + 1 + x * 3 + 2] = b;
    }
  }

  const idat = zlib.deflateSync(rawData);
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

/**
 * Generates the full synthetic Demo Shop data package
 * @param {string} targetDir
 * @param {number} seed - default seed 0x108E315E
 */
export function generateDemo(targetDir, seed = 0x108E315E) {
  const prng = createPrng(seed);
  const dataDir = path.join(targetDir, 'data');
  const creativeDir = path.join(targetDir, 'creative');

  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(creativeDir, { recursive: true });

  // 1. client.md
  const clientMd = `---
type: client
name: Demo Shop
slug: demo-shop
status: active
currency: USD
goal: {metric: purchases, target_cpa: 32}
economics: {aov: 58, gross_margin: 0.62, breakeven_cpa: 36, ltv: unknown}
budget_monthly: 24000
channels: [meta, google]
truth_order: [store, ga4, platform]
measured_gap: {meta_vs_store: 0.23, as_of: 2026-10-05}
attribution_lag_days: 7
review_day: monday
report_reader: founder, non-technical
summary: DTC skincare shop; goal is purchases under $32 CPA
updated: 2026-10-05
---
## Offers
- Hero Serum $58 (told, 2026-10-05)
- Moisturizer Bundle $84 (told, 2026-10-05)

## Audiences
- Lookalike buyers 1-2% (tested winner)
- Broad 25-44 US (fatigued in W40)

## Constraints
- Max daily spend $800 across channels
- Breakeven CPA ceiling: $36.00

## Calendar
- Q4 Holiday promo planned for November 2026

## Voice
- Professional, concise, focus on blended ROAS and store net contribution
`;
  fs.writeFileSync(path.join(targetDir, 'client.md'), clientMd, 'utf8');

  // 2. bets.md
  const betsMd = `# Bets — Demo Shop

## B-014 · open
made: 2026-09-28 · check_by: 2026-10-05
subject: ad set "Broad 25-44 v2"
if: pause it, move $60/day to "Lookalike buyers"
then: CPA of "Lookalike buyers" stays under $36 at the higher budget
win_if: CPA <= 36 with >= 30 purchases
because: frequency 4.8 [r9]; CTR -38% in 3 weeks [r10]
tests_lesson: L-019
applied: yes
confounds: []
result: held · actual CPA $34.10 with 41 purchases [r15@2026-10-05]
`;
  fs.writeFileSync(path.join(targetDir, 'bets.md'), betsMd, 'utf8');

  // 3. Generate 4 synthetic ad images
  const creatives = [
    { name: 'ad1-hero-serum.png', r: 70, g: 130, b: 180 },
    { name: 'ad2-bundle-offer.png', r: 219, g: 112, b: 147 },
    { name: 'ad3-ugc-review.png', r: 60, g: 179, b: 113 },
    { name: 'ad4-lifestyle-skin.png', r: 238, g: 130, b: 238 }
  ];
  for (const c of creatives) {
    const pngBuf = generateSyntheticPng(120, 120, c.r, c.g, c.b);
    fs.writeFileSync(path.join(creativeDir, c.name), pngBuf);
  }

  // 4. Generate CSVs
  // Planted numbers:
  // Meta spend = 5768.40, purchases = 212
  // Store orders = 164
  // Purchase gap = 48 (212 - 164 = 48 -> 22.64% ~ 23%)
  // "Lookalike buyers" = 41 purchases, spend $1398.10 -> CPA $34.10
  // "Broad 25-44 v2" = frequency 4.8, CTR decline
  // Google Ads spend = 2450.00, conversions = 68
  // GA4 sessions = 12450, purchases = 182

  // A. Meta CSV
  const metaRows = [
    'Reporting starts,Reporting ends,Campaign name,Ad set name,Ad name,Amount spent (USD),Impressions,Link clicks,Purchases,Cost per Purchase (USD),Frequency'
  ];

  // Ad set: Lookalike buyers (Winner - Planted story)
  metaRows.push('2026-09-28,2026-10-04,Sales_Conversions_Q3,Lookalike buyers,ad1-hero-serum,818.40,26400,480,24,34.10,2.1');
  metaRows.push('2026-09-28,2026-10-04,Sales_Conversions_Q3,Lookalike buyers,ad2-bundle-offer,579.70,18200,340,17,34.10,2.0');

  // Ad set: Broad 25-44 v2 (Fatigued - Planted story)
  metaRows.push('2026-09-28,2026-10-04,Sales_Conversions_Q3,Broad 25-44 v2,ad3-ugc-review,1420.30,48600,610,32,44.38,4.8');
  metaRows.push('2026-09-28,2026-10-04,Sales_Conversions_Q3,Broad 25-44 v2,ad4-lifestyle-skin,950.00,32400,420,21,45.24,4.8');

  // Ad set: Retargeting Engaged 30d
  metaRows.push('2026-09-28,2026-10-04,Retargeting_MOFU,Engaged Visitors 30d,ad1-hero-serum,1200.00,36120,780,68,17.65,3.2');

  // Ad set: Advantage+ Catalog
  metaRows.push('2026-09-28,2026-10-04,DABA_Catalog_Sales,Advantage+ Shopping,dynamic-catalog,800.00,22800,490,50,16.00,2.5');

  const metaCsv = metaRows.join('\n') + '\n';
  fs.writeFileSync(path.join(dataDir, 'meta.csv'), metaCsv, 'utf8');

  // B. Google Ads CSV
  const googleRows = [
    'Campaign,Ad group,Cost,Impressions,Clicks,Conversions,Cost / conv.'
  ];
  googleRows.push('Brand_Search,Exact_Brand,650.00,8200,1420,38,17.11');
  googleRows.push('NonBrand_Serum,Serum_General,1100.00,24500,890,18,61.11');
  googleRows.push('Performance_Max_Feed,All_Products,700.00,31200,640,12,58.33');
  const googleCsv = googleRows.join('\n') + '\n';
  fs.writeFileSync(path.join(dataDir, 'google-ads.csv'), googleCsv, 'utf8');

  // C. GA4 CSV
  const ga4Rows = [
    'Session source / medium,Sessions,Engaged sessions,Key events,Total revenue'
  ];
  ga4Rows.push('facebook / cpc,6120,4100,108,6264.00');
  ga4Rows.push('google / cpc,2950,2180,42,2436.00');
  ga4Rows.push('direct / (none),1840,1290,18,1044.00');
  ga4Rows.push('email / klaviyo,1540,1110,14,812.00');
  const ga4Csv = ga4Rows.join('\n') + '\n';
  fs.writeFileSync(path.join(dataDir, 'ga4.csv'), ga4Csv, 'utf8');

  // D. Store Orders CSV (164 orders)
  const storeRows = [
    'Name,Created at,Financial Status,Fulfillment Status,Total,Discount Amount,Lineitem quantity,Referring Site'
  ];
  const orderBaseDate = new Date('2026-09-28T08:00:00Z');
  for (let i = 1; i <= 164; i++) {
    const orderNum = `#${1000 + i}`;
    const orderTime = new Date(orderBaseDate.getTime() + i * 3600000).toISOString();
    const isBundle = (i % 4 === 0);
    const amount = isBundle ? '84.00' : '58.00';
    const refSite = (i % 2 === 0) ? 'facebook.com' : (i % 3 === 0 ? 'google.com' : 'direct');
    storeRows.push(`${orderNum},${orderTime},paid,fulfilled,${amount},0.00,1,${refSite}`);
  }
  const storeCsv = storeRows.join('\n') + '\n';
  fs.writeFileSync(path.join(dataDir, 'store-orders.csv'), storeCsv, 'utf8');

  // 5. Precomputed ledger.json
  const metaHash = crypto.createHash('sha256').update(metaCsv).digest('hex');
  const googleHash = crypto.createHash('sha256').update(googleCsv).digest('hex');
  const ga4Hash = crypto.createHash('sha256').update(ga4Csv).digest('hex');
  const storeHash = crypto.createHash('sha256').update(storeCsv).digest('hex');

  const ledger = {
    period: {
      from: '2026-09-28',
      to: '2026-10-04'
    },
    files: [
      { id: 'f1', name: 'meta.csv', platform: 'meta', rows: metaRows.length - 1, sha256: metaHash },
      { id: 'f2', name: 'google-ads.csv', platform: 'google', rows: googleRows.length - 1, sha256: googleHash },
      { id: 'f3', name: 'ga4.csv', platform: 'ga4', rows: ga4Rows.length - 1, sha256: ga4Hash },
      { id: 'f4', name: 'store-orders.csv', platform: 'store', rows: storeRows.length - 1, sha256: storeHash }
    ],
    facts: [
      { id: 'r1', label: 'Meta impressions', value: 184520, unit: 'impressions', kind: 'quoted', file: 'f1', column: 'Impressions', rows: '2-7', agg: 'sum' },
      { id: 'r2', label: 'Meta link clicks', value: 3060, unit: 'clicks', kind: 'quoted', file: 'f1', column: 'Link clicks', rows: '2-7', agg: 'sum' },
      { id: 'r3', label: 'Meta spend', value: 5768.40, unit: 'USD', kind: 'quoted', file: 'f1', column: 'Amount spent (USD)', rows: '2-7', agg: 'sum' },
      { id: 'r4', label: 'Google Ads spend', value: 2450.00, unit: 'USD', kind: 'quoted', file: 'f2', column: 'Cost', rows: '2-4', agg: 'sum' },
      { id: 'r5', label: 'Total ad spend', value: 8218.40, unit: 'USD', kind: 'computed', formula: 'r3+r4' },
      { id: 'r6', label: 'Meta purchases', value: 212, unit: 'purchases', kind: 'quoted', file: 'f1', column: 'Purchases', rows: '2-7', agg: 'sum' },
      { id: 'r7', label: 'Meta CPA', value: 27.21, unit: 'USD', kind: 'computed', formula: 'r3/r6' },
      { id: 'r8', label: 'Google Ads conversions', value: 68, unit: 'conversions', kind: 'quoted', file: 'f2', column: 'Conversions', rows: '2-4', agg: 'sum' },
      { id: 'r9', label: 'Broad ad set frequency', value: 4.8, unit: 'frequency', kind: 'quoted', file: 'f1', column: 'Frequency', rows: '4', agg: 'exact' },
      { id: 'r10', label: 'Broad ad set CTR 3w decline', value: -0.38, unit: 'pct', kind: 'computed', formula: 'trend_calc' },
      { id: 'r11', label: 'GA4 recorded purchases', value: 182, unit: 'purchases', kind: 'quoted', file: 'f3', column: 'Key events', rows: '2-5', agg: 'sum' },
      { id: 'r12', label: 'Store verified orders', value: 164, unit: 'orders', kind: 'quoted', file: 'f4', column: 'Name', rows: '2-165', agg: 'count' },
      { id: 'r13', label: 'Meta vs Store purchase gap', value: 48, unit: 'purchases', kind: 'computed', formula: 'r6-r12' },
      { id: 'r14', label: 'Store net revenue', value: 10578.00, unit: 'USD', kind: 'quoted', file: 'f4', column: 'Total', rows: '2-165', agg: 'sum' },
      { id: 'r15', label: 'Lookalike ad set CPA', value: 34.10, unit: 'USD', kind: 'quoted', file: 'f1', column: 'Cost per Purchase (USD)', rows: '2', agg: 'exact' },
      { id: 'r16', label: 'Lookalike ad set purchases', value: 41, unit: 'purchases', kind: 'quoted', file: 'f1', column: 'Purchases', rows: '2-3', agg: 'sum' }
    ],
    gaps: [
      'LTV: not in any file provided',
      'Store vs Meta attribution gap: 48 orders (22.6%)'
    ]
  };

  fs.writeFileSync(path.join(targetDir, 'ledger.json'), JSON.stringify(ledger, null, 2), 'utf8');

  return {
    metaSpend: 5768.40,
    metaPurchases: 212,
    storeOrders: 164,
    gapPurchases: 48,
    gapPercent: 48 / 212,
    lookalikePurchases: 41,
    lookalikeCpa: 34.10,
    broadFrequency: 4.8
  };
}

// Direct execution CLI runner
if (process.argv[1] && process.argv[1].endsWith('gen-demo.mjs')) {
  const destDir = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(REPO_ROOT, 'skills', 'start', 'demo');

  console.log(`Generating synthetic demo data in: ${destDir}`);
  const stats = generateDemo(destDir);
  console.log('Successfully generated demo package with planted stories:');
  console.log(`  - Meta Purchases: ${stats.metaPurchases}`);
  console.log(`  - Store Orders:   ${stats.storeOrders}`);
  console.log(`  - Purchase Gap:   ${stats.gapPurchases} (${(stats.gapPercent * 100).toFixed(2)}%)`);
  console.log(`  - Lookalike CPA:  $${stats.lookalikeCpa} (${stats.lookalikePurchases} purchases)`);
}
