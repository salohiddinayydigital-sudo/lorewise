import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { generateDemo } from './gen-demo.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

describe('Deterministic Demo Data Generator', () => {
  it('is strictly deterministic (identical seed yields identical SHA256 hashes)', () => {
    const tmpA = fs.mkdtempSync(path.join(os.tmpdir(), 'lorewise-demo-a-'));
    const tmpB = fs.mkdtempSync(path.join(os.tmpdir(), 'lorewise-demo-b-'));

    try {
      generateDemo(tmpA, 0x12345678);
      generateDemo(tmpB, 0x12345678);

      function hashTree(dir) {
        const hashes = {};
        const entries = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory()) {
            const rel = path.relative(dir, path.join(entry.parentPath || entry.path, entry.name));
            const content = fs.readFileSync(path.join(dir, rel));
            hashes[rel] = crypto.createHash('sha256').update(content).digest('hex');
          }
        }
        return hashes;
      }

      const hashesA = hashTree(tmpA);
      const hashesB = hashTree(tmpB);

      assert.deepStrictEqual(hashesA, hashesB, 'Generated outputs from same seed must match bit-for-bit');
    } finally {
      fs.rmSync(tmpA, { recursive: true, force: true });
      fs.rmSync(tmpB, { recursive: true, force: true });
    }
  });

  it('plants the 23% (48 purchase) gap between Meta and Store orders', () => {
    const demoDir = path.join(REPO_ROOT, 'skills', 'start', 'demo');
    const ledger = JSON.parse(fs.readFileSync(path.join(demoDir, 'ledger.json'), 'utf8'));

    const metaPurchases = ledger.facts.find(f => f.id === 'r6').value;
    const storeOrders = ledger.facts.find(f => f.id === 'r12').value;
    const gap = ledger.facts.find(f => f.id === 'r13').value;

    assert.strictEqual(metaPurchases, 212);
    assert.strictEqual(storeOrders, 164);
    assert.strictEqual(gap, 48);

    const gapPct = gap / metaPurchases;
    assert.ok(Math.abs(gapPct - 0.2264) < 0.01, 'Gap must be ~23%');
  });

  it('plants the fatigued ad set story (Broad 25-44 frequency 4.8)', () => {
    const demoDir = path.join(REPO_ROOT, 'skills', 'start', 'demo');
    const ledger = JSON.parse(fs.readFileSync(path.join(demoDir, 'ledger.json'), 'utf8'));
    const freqFact = ledger.facts.find(f => f.id === 'r9');

    assert.ok(freqFact, 'Must contain frequency fact r9');
    assert.strictEqual(freqFact.value, 4.8);
  });

  it('plants the winning bet B-014 conditions for settlement', () => {
    const demoDir = path.join(REPO_ROOT, 'skills', 'start', 'demo');
    const ledger = JSON.parse(fs.readFileSync(path.join(demoDir, 'ledger.json'), 'utf8'));
    const bets = fs.readFileSync(path.join(demoDir, 'bets.md'), 'utf8');

    const lookalikePurchases = ledger.facts.find(f => f.id === 'r16').value;
    const lookalikeCpa = ledger.facts.find(f => f.id === 'r15').value;

    assert.ok(lookalikePurchases >= 30, 'Lookalike purchases must be >= 30');
    assert.ok(lookalikeCpa <= 36.0, 'Lookalike CPA must be <= 36');
    assert.ok(bets.includes('B-014'), 'Bets must contain B-014');
    assert.ok(bets.includes('result: held'), 'Bet B-014 resolved as held');
  });

  it('deliberately leaves LTV absent/unknown in profile and ledger', () => {
    const demoDir = path.join(REPO_ROOT, 'skills', 'start', 'demo');
    const client = fs.readFileSync(path.join(demoDir, 'client.md'), 'utf8');
    const ledger = JSON.parse(fs.readFileSync(path.join(demoDir, 'ledger.json'), 'utf8'));

    assert.ok(client.includes('ltv: unknown'), 'client.md must have ltv: unknown');
    assert.ok(
      ledger.gaps.some(g => g.toLowerCase().includes('ltv')),
      'ledger gaps must explicitly record missing LTV'
    );
  });

  it('generates 4 valid synthetic PNG ad creatives', () => {
    const creativeDir = path.join(REPO_ROOT, 'skills', 'start', 'demo', 'creative');
    const files = fs.readdirSync(creativeDir).filter(f => f.endsWith('.png'));

    assert.strictEqual(files.length, 4, 'Must have exactly 4 PNG files');
    const pngMagic = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    for (const file of files) {
      const buf = fs.readFileSync(path.join(creativeDir, file));
      assert.ok(buf.length > 50, `${file} must be non-empty`);
      assert.ok(buf.length < 10000, `${file} must be lightweight (< 10 KB)`);
      assert.deepStrictEqual(
        buf.subarray(0, 8),
        pngMagic,
        `${file} must have valid PNG signature`
      );
    }
  });
});
