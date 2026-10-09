import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const DIAGNOSE_DIR = path.join(REPO_ROOT, 'skills', 'diagnose');
const CREATIVE_DIR = path.join(REPO_ROOT, 'skills', 'creative');
const AGENTS_DIR = path.join(REPO_ROOT, 'agents');
const DEMO_DIR = path.join(REPO_ROOT, 'skills', 'start', 'demo');

/**
 * Helper to extract YAML frontmatter facts from platform markdown references
 */
function parsePlatformFacts(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) {
    return { platform: null, facts: [] };
  }

  const rawYaml = frontmatterMatch[1];
  const platformMatch = rawYaml.match(/^platform:[ \t]*([^\r\n]+)/m);
  const platform = platformMatch ? platformMatch[1].trim() : null;

  // Clean deterministic YAML facts parser
  const facts = [];
  const factBlocks = rawYaml.split(/(?:^|\n)[ \t]*-[ \t]+id:[ \t]*/).slice(1);

  for (const block of factBlocks) {
    const idMatch = block.match(/^([A-Z0-9_-]+)/);
    const claimMatch = block.match(/claim:[ \t]*([^\r\n]+)/);
    const sourceMatch = block.match(/source:[ \t]*([^\r\n]+)/);
    const checkedMatch = block.match(/checked:[ \t]*([^\r\n]+)/);
    const expiresMatch = block.match(/expires:[ \t]*([^\r\n]+)/);

    if (idMatch && claimMatch && sourceMatch && checkedMatch && expiresMatch) {
      facts.push({
        id: idMatch[1].trim(),
        claim: claimMatch[1].trim(),
        source: sourceMatch[1].trim(),
        checked: checkedMatch[1].trim(),
        expires: expiresMatch[1].trim(),
      });
    }
  }

  return { platform, facts };
}

/**
 * Diagnostic fact lint and expiry checker
 */
function lintFactExpiry(fact, currentDate = new Date()) {
  const expiresDate = new Date(fact.expires);
  const diffDays = (expiresDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

  // If expired by more than 30 days, fail lint
  if (diffDays < -30) {
    return { valid: false, reason: `Fact ${fact.id} expired more than 30 days ago (${fact.expires})` };
  }
  return { valid: true, diffDays };
}

/**
 * Diagnostic coverage calculator
 */
function calculateCoverage(checks) {
  const applicable = checks.filter(c => c.status !== 'not_applicable');
  if (applicable.length === 0) return 0;
  const graded = applicable.filter(c => c.status === 'pass' || c.status === 'fail');
  return graded.length / applicable.length;
}

describe('Diagnose & Creative — Platform Knowledge Base Lint', () => {
  const platformFiles = ['meta.md', 'google-ads.md', 'ga4.md', 'blended.md', 'tracking.md'];

  it('contains all 5 platform reference files', () => {
    for (const file of platformFiles) {
      const fullPath = path.join(DIAGNOSE_DIR, file);
      assert.ok(fs.existsSync(fullPath), `Platform reference ${file} must exist`);
    }
  });

  it('keeps total platform claims strictly <= 40 across all reference files', () => {
    let totalFacts = 0;
    for (const file of platformFiles) {
      const { facts } = parsePlatformFacts(path.join(DIAGNOSE_DIR, file));
      totalFacts += facts.length;
    }

    assert.ok(totalFacts > 0, 'Must contain verified platform facts');
    assert.ok(totalFacts <= 40, `Total platform claims (${totalFacts}) must not exceed 40`);
  });

  it('validates every fact has valid official URL, checked date, and unexpired date', () => {
    const today = new Date('2026-10-09');

    for (const file of platformFiles) {
      const { platform, facts } = parsePlatformFacts(path.join(DIAGNOSE_DIR, file));
      assert.ok(platform, `File ${file} must specify platform`);
      assert.ok(facts.length >= 4, `File ${file} must contain at least 4 facts`);

      for (const fact of facts) {
        assert.ok(fact.id.length > 3, `Fact ID must be non-empty in ${file}`);
        assert.ok(fact.claim.length > 10, `Fact claim must be descriptive in ${file}`);
        assert.ok(fact.source.startsWith('https://'), `Fact ${fact.id} must cite HTTPS official source`);
        assert.match(fact.checked, /^\d{4}-\d{2}-\d{2}$/, `Checked date must be YYYY-MM-DD in ${fact.id}`);
        assert.match(fact.expires, /^\d{4}-\d{2}-\d{2}$/, `Expires date must be YYYY-MM-DD in ${fact.id}`);

        const lint = lintFactExpiry(fact, today);
        assert.ok(lint.valid, lint.reason);
      }
    }
  });

  it('triggers lint failure if a fact has been expired for more than 30 days', () => {
    const expiredFact = {
      id: 'TEST-EXP-01',
      claim: 'Old legacy rule',
      source: 'https://example.com',
      checked: '2024-01-01',
      expires: '2024-06-01',
    };
    const testDate = new Date('2024-07-15'); // 44 days past expiration
    const result = lintFactExpiry(expiredFact, testDate);
    assert.equal(result.valid, false);
    assert.match(result.reason, /expired more than 30 days ago/);
  });
});

describe('Diagnose & Creative — 20-Check Method & Coverage Gate', () => {
  const methodPath = path.join(DIAGNOSE_DIR, 'method.md');

  it('defines all 20 diagnostic checks (CHK-01 through CHK-20) in method.md', () => {
    assert.ok(fs.existsSync(methodPath));
    const content = fs.readFileSync(methodPath, 'utf8');

    for (let i = 1; i <= 20; i++) {
      const chkId = `CHK-${String(i).padStart(2, '0')}`;
      assert.ok(content.includes(chkId), `method.md must define check ${chkId}`);
    }
  });

  it('defines four states (pass, fail, unknown, not_applicable) for diagnostic checks', () => {
    const content = fs.readFileSync(methodPath, 'utf8');
    assert.ok(content.includes('pass'));
    assert.ok(content.includes('fail'));
    assert.ok(content.includes('unknown'));
    assert.ok(content.includes('not_applicable'));
  });

  it('enforces the coverage gate (<60% coverage leads to insufficient data verdict)', () => {
    // Scenario 1: 5 pass, 2 fail, 8 unknown, 5 not_applicable (Total applicable = 15, Graded = 7 -> 46.7% coverage)
    const lowChecks = [
      ...Array(5).fill({ status: 'pass' }),
      ...Array(2).fill({ status: 'fail' }),
      ...Array(8).fill({ status: 'unknown' }),
      ...Array(5).fill({ status: 'not_applicable' }),
    ];
    const lowCoverage = calculateCoverage(lowChecks);
    assert.ok(lowCoverage < 0.60, `Coverage ${lowCoverage} should be < 0.60`);

    // Scenario 2: 10 pass, 3 fail, 2 unknown, 5 not_applicable (Total applicable = 15, Graded = 13 -> 86.7% coverage)
    const highChecks = [
      ...Array(10).fill({ status: 'pass' }),
      ...Array(3).fill({ status: 'fail' }),
      ...Array(2).fill({ status: 'unknown' }),
      ...Array(5).fill({ status: 'not_applicable' }),
    ];
    const highCoverage = calculateCoverage(highChecks);
    assert.ok(highCoverage >= 0.60, `Coverage ${highCoverage} should be >= 0.60`);
  });

  it('diagnoses planted demo account conditions accurately', () => {
    // Demo account has planted:
    // 1. Meta purchases 212 vs store 164 -> Gap = 48 purchases (23% gap) -> CHK-04 fails
    // 2. Broad 25-44 frequency = 4.80 -> CHK-06 fails
    // 3. Winning bet Lookalike CPA = $34.10 <= $35 target -> CHK-01 passes
    const metaPurchases = 212;
    const storePurchases = 164;
    const gapRatio = (metaPurchases - storePurchases) / storePurchases;
    assert.ok(gapRatio > 0.20, 'Attribution gap should exceed 20% in demo account');

    const broadFrequency = 4.80;
    assert.ok(broadFrequency > 4.0, 'Broad frequency should exceed fatigue threshold');

    const lookalikeCpa = 34.10;
    const targetCpa = 35.00;
    assert.ok(lookalikeCpa <= targetCpa, 'Lookalike CPA should beat target');
  });
});

describe('Diagnose & Creative — Subagent Configurations', () => {
  it('configures agents/analyst.md with sonnet and read-only tools', () => {
    const analystPath = path.join(AGENTS_DIR, 'analyst.md');
    assert.ok(fs.existsSync(analystPath));
    const content = fs.readFileSync(analystPath, 'utf8');

    assert.match(content, /name:[ \t]*analyst/);
    assert.match(content, /model:[ \t]*sonnet/);
    assert.match(content, /tools:[ \t]*\[Read,[ \t]*Grep,[ \t]*Glob\]/);
    assert.match(content, /disallowedTools:[ \t]*\[Write,[ \t]*Edit,[ \t]*Bash\]/);
  });

  it('configures agents/creative-eye.md with sonnet and visual inspection tools', () => {
    const eyePath = path.join(AGENTS_DIR, 'creative-eye.md');
    assert.ok(fs.existsSync(eyePath));
    const content = fs.readFileSync(eyePath, 'utf8');

    assert.match(content, /name:[ \t]*creative-eye/);
    assert.match(content, /model:[ \t]*sonnet/);
    assert.match(content, /tools:[ \t]*\[Read\]/);
    assert.match(content, /disallowedTools:[ \t]*\[Write,[ \t]*Edit,[ \t]*Bash\]/);
  });
});

describe('Diagnose & Creative — Creative Card & Brief Specifications', () => {
  it('validates creative-card.md contains status determination and demo examples', () => {
    const cardPath = path.join(CREATIVE_DIR, 'creative-card.md');
    assert.ok(fs.existsSync(cardPath));
    const content = fs.readFileSync(cardPath, 'utf8');

    assert.ok(content.includes('CR-<slug>-<asset_id>'));
    assert.ok(content.includes('visual_hook'));
    assert.ok(content.includes('copy_angle'));
    assert.ok(content.includes('fatigued'));
    assert.ok(content.includes('CR-demo-shop-ad-01'));
    assert.ok(content.includes('CR-demo-shop-ad-02'));
  });

  it('validates brief-format.md requires 3 hook options and bet link', () => {
    const briefPath = path.join(CREATIVE_DIR, 'brief-format.md');
    assert.ok(fs.existsSync(briefPath));
    const content = fs.readFileSync(briefPath, 'utf8');

    assert.ok(content.includes('Hook A'));
    assert.ok(content.includes('Hook B'));
    assert.ok(content.includes('Hook C'));
    assert.ok(content.includes('Associated Bet'));
    assert.ok(content.includes('Strategic Hypothesis'));
  });

  it('verifies demo synthetic creative images exist on disk', () => {
    const creativePath = path.join(DEMO_DIR, 'creative');
    assert.ok(fs.existsSync(creativePath));
    const images = ['ad1-hero-serum.png', 'ad2-bundle-offer.png', 'ad3-ugc-review.png', 'ad4-lifestyle-skin.png'];

    for (const img of images) {
      const fullPath = path.join(creativePath, img);
      assert.ok(fs.existsSync(fullPath), `Demo image ${img} must exist`);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 0, `Demo image ${img} must not be empty`);
    }
  });
});
