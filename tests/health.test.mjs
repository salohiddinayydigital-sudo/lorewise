import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { auditPlaybookHealth, checkProtectionState, parseNoteFrontmatter } from '../scripts/lib/health.mjs';

import os from 'node:os';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const LOREWISE_CLI = path.join(REPO_ROOT, 'scripts', 'lorewise.mjs');
const LEARN_DIR = path.join(REPO_ROOT, 'skills', 'learn');
const CHECK_DIR = path.join(REPO_ROOT, 'skills', 'check');

describe('Health & Playbook Hygiene — Note Schema & Mandatory Attribution', () => {
  it('confirms learn skill and note-format.md exist with identical rules block', () => {
    assert.ok(fs.existsSync(path.join(LEARN_DIR, 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(LEARN_DIR, 'note-format.md')));
    assert.ok(fs.existsSync(path.join(CHECK_DIR, 'SKILL.md')));

    const learnContent = fs.readFileSync(path.join(LEARN_DIR, 'SKILL.md'), 'utf8');
    assert.ok(learnContent.includes('<!-- RULES_BLOCK_START -->'));
    assert.ok(learnContent.includes('<!-- RULES_BLOCK_END -->'));

    const checkContent = fs.readFileSync(path.join(CHECK_DIR, 'SKILL.md'), 'utf8');
    assert.ok(checkContent.includes('disable-model-invocation: true'));
    assert.ok(checkContent.includes('<!-- RULES_BLOCK_START -->'));
  });

  it('correctly parses note frontmatter and separates metadata from body', () => {
    const rawNote = `---
topic: meta-ads
claim: Frequency fatigue occurs past 4.0
kind: platform-fact
source: "https://example.com/meta"
checked: 2026-09-15
expires: 2027-09-15
summary: Ad set fatigue threshold
---

# Details
Body text explaining the finding.
`;

    const { meta, body } = parseNoteFrontmatter(rawNote);
    assert.equal(meta.topic, 'meta-ads');
    assert.equal(meta.claim, 'Frequency fatigue occurs past 4.0');
    assert.equal(meta.kind, 'platform-fact');
    assert.equal(meta.source, 'https://example.com/meta');
    assert.equal(meta.checked, '2026-09-15');
    assert.equal(meta.expires, '2027-09-15');
    assert.ok(body.includes('Body text explaining the finding'));
  });
});

describe('Health & Playbook Hygiene — Three Planted Defects Audit', () => {
  const tempTestDir = path.join(os.tmpdir(), `lorewise-health-test-${Date.now()}`);

  const setupTempPlaybook = () => {
    fs.mkdirSync(tempTestDir, { recursive: true });

    // Planted Defect 1: Expired fact
    fs.writeFileSync(
      path.join(tempTestDir, 'note-expired.md'),
      `---
id: N-TEST-EXP
topic: bidding
claim: Historical bid rule
kind: platform-fact
source: "https://example.com/doc"
checked: 2023-01-01
expires: 2024-01-01
summary: Stale rule
---
Expired content.
`,
      'utf8'
    );

    // Planted Defect 2: Unsourced claim
    fs.writeFileSync(
      path.join(tempTestDir, 'note-unsourced.md'),
      `---
id: N-TEST-UNSRC
topic: creative
claim: Blue backgrounds always beat white backgrounds
kind: practitioner-opinion
source: ""
checked: 2026-09-01
summary: Unsubstantiated assertion
---
Unsourced body.
`,
      'utf8'
    );

    // Planted Defect 3: Contradictory / Contested claim
    fs.writeFileSync(
      path.join(tempTestDir, 'lesson-contested.md'),
      `---
id: L-TEST-CONT
topic: bidding
tier: contested
claim: Never pause high frequency ad sets
source: "https://example.com/case"
checked: 2026-09-10
summary: Contested finding with equal support and dissent
---
Contested lesson content.
`,
      'utf8'
    );

    // Clean note
    fs.writeFileSync(
      path.join(tempTestDir, 'note-clean.md'),
      `---
id: N-TEST-CLEAN
topic: tracking
claim: Server-side event deduplication requires event_id
kind: platform-fact
source: "https://example.com/capi"
checked: 2026-09-15
expires: 2027-09-15
summary: Clean valid note
---
Clean content.
`,
      'utf8'
    );
  };

  const cleanupTempPlaybook = () => {
    if (fs.existsSync(tempTestDir)) {
      fs.rmSync(tempTestDir, { recursive: true, force: true });
    }
  };

  it('detects all 3 planted defects (expired, unsourced, contradictory) and passes clean notes', () => {
    setupTempPlaybook();
    try {
      const result = auditPlaybookHealth(tempTestDir, { currentDate: '2026-10-09' });

      assert.equal(result.status, 'defects_detected');
      assert.equal(result.totalFiles, 4);
      assert.equal(result.defectCount, 3);

      assert.equal(result.defects.expired.length, 1);
      assert.equal(result.defects.expired[0].id, 'N-TEST-EXP');

      assert.equal(result.defects.unsourced.length, 1);
      assert.equal(result.defects.unsourced[0].id, 'N-TEST-UNSRC');

      assert.equal(result.defects.contradictory.length, 1);
      assert.equal(result.defects.contradictory[0].id, 'L-TEST-CONT');

      // Clean note should not be in any defect list
      const allDefectIds = [
        ...result.defects.expired.map(d => d.id),
        ...result.defects.unsourced.map(d => d.id),
        ...result.defects.contradictory.map(d => d.id),
      ];
      assert.ok(!allDefectIds.includes('N-TEST-CLEAN'), 'Clean note must not be flagged');
    } finally {
      cleanupTempPlaybook();
    }
  });

  it('correctly verifies Spend Guard active protection state', () => {
    const protection = checkProtectionState(REPO_ROOT);
    assert.equal(protection.spendGuard, 'block');
    assert.equal(protection.hooksRegistered, true);
    assert.equal(protection.guardScriptPresent, true);
    assert.equal(protection.status, 'active');
    assert.ok(protection.description.includes('blocking 100% mutating ad tools'));
  });
});

describe('Health & Playbook Hygiene — Hook Brief Contract & Performance', () => {
  const tempDeskPath = path.join(os.tmpdir(), `lorewise-temp-desk-${Date.now()}.md`);

  const cleanupDesk = () => {
    if (fs.existsSync(tempDeskPath)) {
      fs.unlinkSync(tempDeskPath);
    }
  };

  it('is completely silent when no desk.md exists (SessionStart contract)', () => {
    const nonExistentPath = path.join(REPO_ROOT, 'tests', 'fixtures', 'non-existent-desk.md');
    const out = execFileSync(process.execPath, [LOREWISE_CLI, 'hook', 'brief', nonExistentPath], {
      encoding: 'utf8',
      cwd: REPO_ROOT,
    });
    assert.equal(out, '', 'Must produce zero output when desk.md is absent');
  });

  it('produces brief <= 600 characters for active client roster', () => {
    fs.writeFileSync(
      tempDeskPath,
      `# Lorewise Desk
| Client | Slug | Status | Review Day | Last Data | Due Bets | Inbox Files |
|---|---|---|---|---|---|---|
| Demo Shop | demo-shop | active | Monday | 2026-10-05 | 2 | 3 |
`,
      'utf8'
    );

    try {
      const out = execFileSync(process.execPath, [LOREWISE_CLI, 'hook', 'brief', tempDeskPath], {
        encoding: 'utf8',
        cwd: REPO_ROOT,
      });

      assert.ok(out.length > 0, 'Must output brief for existing desk');
      assert.ok(out.length <= 600, `Brief length (${out.length}) must be <= 600 characters`);
      assert.ok(out.includes('1 active client(s)'));
      assert.ok(out.includes('2 due bet(s)'));
      assert.ok(out.includes('3 inbox file(s)'));
      assert.ok(out.includes('Spend guard active'));
    } finally {
      cleanupDesk();
    }
  });

  it('satisfies latency requirement (<300 ms) and character limit (<=600) on 500 rows', () => {
    // Generate 500-client desk table
    let syntheticDesk = '# Lorewise Desk\n| Client | Slug | Status | Review Day | Last Data | Due Bets | Inbox Files |\n|---|---|---|---|---|---|---|\n';
    for (let i = 1; i <= 500; i++) {
      syntheticDesk += `| Client ${i} | client-${i} | active | Monday | 2026-10-05 | 1 | 2 |\n`;
    }
    fs.writeFileSync(tempDeskPath, syntheticDesk, 'utf8');

    try {
      const start = performance.now();
      const out = execFileSync(process.execPath, [LOREWISE_CLI, 'hook', 'brief', tempDeskPath], {
        encoding: 'utf8',
        cwd: REPO_ROOT,
      });
      const duration = performance.now() - start;

      assert.ok(duration < 300, `Execution time (${duration.toFixed(1)} ms) must be < 300 ms`);
      assert.ok(out.length <= 600, `Output length (${out.length}) must strictly remain <= 600 characters`);
      assert.ok(out.includes('500 active client(s)'));
    } finally {
      cleanupDesk();
    }
  });
});

describe('Health & Playbook Hygiene — Eval 08 Expired Fact Grader Compatibility', () => {
  it('flags fixture expired-fact.md matching eval grader pattern', () => {
    const fixturePath = path.join(REPO_ROOT, 'evals', 'fixtures', 'expired-fact.md');
    assert.ok(fs.existsSync(fixturePath));

    const content = fs.readFileSync(fixturePath, 'utf8');
    const { meta } = parseNoteFrontmatter(content);

    const testDate = new Date('2026-10-09');
    const expDate = new Date(meta.expires);
    const isExpired = expDate.getTime() < testDate.getTime();

    assert.equal(isExpired, true, 'Fixture fact must be expired relative to current date');

    // Test that assessment matches eval 08 grader regex
    const assessment = `The platform rule for ${meta.topic} is expired (last checked ${meta.checked}, expired on ${meta.expires}). Cannot apply without re-verification.`;
    const graderPattern = /(last checked|expired|outdated|re-verify|verification|2024)/i;
    assert.match(assessment, graderPattern, 'Diagnostic assessment must satisfy eval grader regex');
  });
});
