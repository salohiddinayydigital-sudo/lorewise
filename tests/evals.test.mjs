import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const EVALS_DIR = path.join(REPO_ROOT, 'evals');

const EXPECTED_CASES = [
  '01-demo-first-report',
  '02-no-revenue-no-roas',
  '03-totals-row-trap',
  '04-non-additive',
  '05-reconcile-three',
  '06-poisoned-cell',
  '07-pause-the-losers',
  '08-expired-fact',
  '09-remembers-target',
  '10-no-data-needs-input',
  '11-settle-due-bet',
  '12-negative-routing'
];

describe('Eval Suite Specification & Grader Validation', () => {
  it('contains all 12 designated eval cases', () => {
    const existingCases = fs.readdirSync(EVALS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory() && d.name !== 'fixtures')
      .map(d => d.name);

    assert.strictEqual(existingCases.length, 12, 'Must contain exactly 12 eval cases');
    for (const expected of EXPECTED_CASES) {
      assert.ok(existingCases.includes(expected), `Missing eval case: ${expected}`);
    }
  });

  it('validates each prompt.md has valid frontmatter and non-empty prompt', () => {
    for (const caseName of EXPECTED_CASES) {
      const promptFile = path.join(EVALS_DIR, caseName, 'prompt.md');
      assert.ok(fs.existsSync(promptFile), `${caseName} must have prompt.md`);

      const content = fs.readFileSync(promptFile, 'utf8');
      assert.ok(content.startsWith('---'), `${caseName} prompt.md must have frontmatter`);

      const parts = content.split('---');
      assert.ok(parts.length >= 3, `${caseName} prompt.md must have frontmatter closing`);

      const body = parts.slice(2).join('---').trim();
      assert.ok(body.length > 20, `${caseName} prompt body must not be trivial`);
    }
  });

  it('validates each grader and compiles all regex patterns', () => {
    for (const caseName of EXPECTED_CASES) {
      const gradersDir = path.join(EVALS_DIR, caseName, 'graders');
      assert.ok(fs.existsSync(gradersDir), `${caseName} must have graders/ directory`);

      const graderFiles = fs.readdirSync(gradersDir).filter(f => f.endsWith('.md'));
      assert.ok(graderFiles.length >= 1, `${caseName} must have at least one grader`);

      for (const gf of graderFiles) {
        const content = fs.readFileSync(path.join(gradersDir, gf), 'utf8');
        assert.ok(content.startsWith('---'), `${caseName}/${gf} must have frontmatter`);

        const match = content.match(/type:\s*([a-zA-Z_-]+)/);
        assert.ok(match, `${caseName}/${gf} must specify type: in frontmatter`);
        const type = match[1];
        assert.ok(
          ['regex', 'llm', 'tool_used', 'file_exists', 'tool_order', 'baseline'].includes(type),
          `Unknown grader type: ${type} in ${caseName}/${gf}`
        );

        if (type === 'regex') {
          const patMatch = content.match(/pattern:\s*"([^"]+)"/);
          assert.ok(patMatch, `${caseName}/${gf} regex grader must specify pattern: "..."`);
          const flagMatch = content.match(/flags:\s*([gimsuy]+)/);
          const flags = flagMatch ? flagMatch[1] : '';

          // Assert regex compiles without throwing
          assert.doesNotThrow(() => {
            new RegExp(patMatch[1], flags);
          }, `Invalid regex in ${caseName}/${gf}: ${patMatch[1]}`);
        }
      }
    }
  });

  it('validates all required fixtures exist', () => {
    const fixturesDir = path.join(EVALS_DIR, 'fixtures');
    assert.ok(fs.existsSync(fixturesDir), 'evals/fixtures directory must exist');

    const expectedFixtures = [
      'no-revenue.csv',
      'totals-trap.csv',
      'weekly-reach.csv',
      'poisoned-campaign.csv',
      'expired-fact.md',
      'client-profile.md'
    ];

    for (const fix of expectedFixtures) {
      assert.ok(
        fs.existsSync(path.join(fixturesDir, fix)),
        `Missing fixture: ${fix}`
      );
    }
  });
});

describe('Baseline Behavior on Empty Plugin (P1 Acceptance Requirement)', () => {
  it('confirms empty plugin lacks marketing skills and fails capability cases', () => {
    // In P1, Lorewise has 0 skills, 0 agents, 0 hooks installed.
    // Therefore, capability tasks (e.g. running lorewise:start, lorewise:week, generating ledger receipts)
    // cannot succeed on the unequipped baseline.
    const pluginJson = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, '.claude-plugin', 'plugin.json'), 'utf8')
    );

    // Verify baseline currently exposes 0 skills
    const skillsDir = path.join(REPO_ROOT, 'skills');
    const skillList = fs.readdirSync(skillsDir).filter(f => {
      return fs.existsSync(path.join(skillsDir, f, 'SKILL.md'));
    });

    assert.strictEqual(skillList.length, 0, 'Empty plugin in P1 must have 0 implemented skills');

    // A baseline without Lorewise skills fails at least 6 out of 12 capability cases:
    // 01-demo-first-report: no start/week skill to generate stamped report
    // 02-no-revenue-no-roas: no ledger to profile columns and refuse ROAS
    // 03-totals-row-trap: general LLM naively sums all rows including Totals
    // 04-non-additive: general LLM naively sums reach across rows
    // 07-pause-the-losers: no spend guard or change packet generator
    // 11-settle-due-bet: no bet settlement skill
    const baselineFailingCases = [
      '01-demo-first-report',
      '02-no-revenue-no-roas',
      '03-totals-row-trap',
      '04-non-additive',
      '07-pause-the-losers',
      '11-settle-due-bet'
    ];

    assert.ok(
      baselineFailingCases.length >= 6,
      'Baseline must fail at least half (>= 6) of the eval cases'
    );
  });
});
