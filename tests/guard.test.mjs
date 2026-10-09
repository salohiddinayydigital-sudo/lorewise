import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { evaluateTool, extractToolIdentifier } from '../scripts/guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const GUARD_SCRIPT = path.join(REPO_ROOT, 'scripts', 'guard.mjs');
const FIXTURES_FILE = path.join(REPO_ROOT, 'tests', 'fixtures', 'connector-tools.json');

const fixtureData = JSON.parse(fs.readFileSync(FIXTURES_FILE, 'utf8'));

describe('Spend Guard — Unit & Table Verification', () => {
  it('extracts trailing tool identifier from UUID server prefixes', () => {
    assert.strictEqual(
      extractToolIdentifier('mcp__f47ac10b-58cc-4372-a567-0e02b2c3d479__ads_create_campaign'),
      'ads_create_campaign'
    );
    assert.strictEqual(
      extractToolIdentifier('ads_create_campaign'),
      'ads_create_campaign'
    );
  });

  it('blocks 100% of recorded mutating advertising tools (exit code 2 condition)', () => {
    for (const tool of fixtureData.write) {
      const decision = evaluateTool(tool);
      assert.strictEqual(
        decision.allow,
        false,
        `Mutating tool "${tool}" must be blocked, but was allowed`
      );
    }
  });

  it('allows 100% of recorded read-only advertising tools (exit code 0 condition)', () => {
    for (const tool of fixtureData.read) {
      const decision = evaluateTool(tool);
      assert.strictEqual(
        decision.allow,
        true,
        `Read tool "${tool}" must be allowed, but was blocked: ${decision.reason}`
      );
    }
  });

  it('correctly handles known trick cases', () => {
    // 1. Has "upload" in name, but is a GET query
    const uploadSessions = evaluateTool('ads_catalog_get_product_feed_upload_sessions');
    assert.strictEqual(uploadSessions.allow, true, 'get_upload_sessions must be allowed');

    // 2. Check verb
    const checkElig = evaluateTool('ads_experiment_check_eligibility');
    assert.strictEqual(checkElig.allow, true, 'check_eligibility must be allowed');

    // 3. User list upload
    const customUsers = evaluateTool('ads_update_custom_audience_users');
    assert.strictEqual(customUsers.allow, false, 'update_custom_audience_users must be blocked');

    // 4. Verb at end of identifier
    const pixelRead = evaluateTool('ads_pixel_event_read');
    assert.strictEqual(pixelRead.allow, true, 'pixel_event_read must be allowed');

    const productCreate = evaluateTool('ads_catalog_product_create');
    assert.strictEqual(productCreate.allow, false, 'product_create must be blocked');
  });

  it('unconditionally allows tools outside the advertising domain', () => {
    const nonAdTools = [
      'mcp__filesystem__read_file',
      'mcp__filesystem__write_file',
      'mcp__github__create_issue',
      'Read',
      'Write',
      'Edit',
      'Bash',
      'calculator_compute'
    ];
    for (const tool of nonAdTools) {
      const decision = evaluateTool(tool);
      assert.strictEqual(decision.allow, true, `Non-ad tool "${tool}" must not be interfered with`);
    }
  });

  it('blocks unlisted unknown tools inside the advertising domain (fail closed)', () => {
    const unlistedAdTool = 'ads_arbitrary_unlisted_verb';
    const decision = evaluateTool(unlistedAdTool);
    assert.strictEqual(
      decision.allow,
      false,
      'Unknown verb in ad domain must fail closed (block)'
    );
  });

  it('decomposes tokens for unrecorded ad tools', () => {
    const customWrite = evaluateTool('meta_ads_special_custom_mutate');
    assert.strictEqual(customWrite.allow, false, 'Token "mutate" must trigger block');

    const customRead = evaluateTool('meta_ads_special_custom_report');
    assert.strictEqual(customRead.allow, true, 'Token "report" must trigger allow');
  });

  it('honors spend_guard=off configuration override', () => {
    const decision = evaluateTool('ads_create_campaign', { spendGuard: 'off' });
    assert.strictEqual(decision.allow, true, 'spend_guard=off must allow mutating tools');
  });
});

describe('Spend Guard — CLI Process Execution & Fail-Open Behavior', () => {
  it('exits with code 2 when mutating tool is passed via stdin', () => {
    const input = JSON.stringify({ tool: 'mcp__uuid__ads_create_campaign' });
    const res = spawnSync(process.execPath, [GUARD_SCRIPT], {
      input,
      encoding: 'utf8'
    });
    assert.strictEqual(res.status, 2, 'Must exit with code 2 on mutating tool');
    assert.ok(res.stderr.includes('read-only'), 'Must advise read-only mode in stderr');
  });

  it('exits with code 0 when read tool is passed via stdin', () => {
    const input = JSON.stringify({ tool: 'mcp__uuid__ads_get_ad_accounts' });
    const res = spawnSync(process.execPath, [GUARD_SCRIPT], {
      input,
      encoding: 'utf8'
    });
    assert.strictEqual(res.status, 0, 'Must exit with code 0 on read-only tool');
  });

  it('fails open (exit 0) on malformed JSON or empty stdin', () => {
    const badJson = spawnSync(process.execPath, [GUARD_SCRIPT], {
      input: 'INVALID_JSON{{{',
      encoding: 'utf8'
    });
    assert.strictEqual(badJson.status, 0, 'Must fail open on malformed JSON');

    const emptyInput = spawnSync(process.execPath, [GUARD_SCRIPT], {
      input: '',
      encoding: 'utf8'
    });
    assert.strictEqual(emptyInput.status, 0, 'Must fail open on empty input');
  });

  it('satisfies latency requirement (p95 < 150 ms per invocation)', () => {
    const timings = [];
    const payload = JSON.stringify({ tool: 'ads_get_ad_accounts' });

    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      const res = spawnSync(process.execPath, [GUARD_SCRIPT], {
        input: payload,
        encoding: 'utf8'
      });
      const duration = performance.now() - start;
      assert.strictEqual(res.status, 0);
      timings.push(duration);
    }

    timings.sort((a, b) => a - b);
    const p95 = timings[Math.floor(timings.length * 0.95)];
    assert.ok(p95 < 150, `p95 latency ${p95.toFixed(2)}ms must be < 150ms`);
  });
});
