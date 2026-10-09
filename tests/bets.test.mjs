import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { deriveLessonTier, evaluateBet, lintSharedLesson } from '../scripts/lib/settle.mjs';

describe('Bets & Lessons — Confidence Tier Derivation', () => {
  it('derives observation tier for 1 confirmed bet', () => {
    const tier = deriveLessonTier({ supportCount: 1, accountsCount: 1, againstCount: 0 });
    assert.strictEqual(tier, 'observation');
  });

  it('derives pattern tier for >= 3 confirmed bets in one account', () => {
    const tier = deriveLessonTier({ supportCount: 3, accountsCount: 1, againstCount: 0 });
    assert.strictEqual(tier, 'pattern');
  });

  it('derives cross-account tier when seen in >= 2 accounts', () => {
    const tier = deriveLessonTier({ supportCount: 4, accountsCount: 2, againstCount: 0 });
    assert.strictEqual(tier, 'seen in 2 accounts');
  });

  it('derives contested tier when against count >= 50% of support', () => {
    const tier = deriveLessonTier({ supportCount: 4, accountsCount: 2, againstCount: 2 });
    assert.strictEqual(tier, 'contested');
  });

  it('derives dormant tier when last supported is older than 180 days', () => {
    const oldDate = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();
    const tier = deriveLessonTier({
      supportCount: 5,
      accountsCount: 2,
      againstCount: 0,
      lastSupportedDate: oldDate
    });
    assert.strictEqual(tier, 'dormant');
  });
});

describe('Bets & Lessons — Bet Settlement Logic', () => {
  it('settles as held when threshold and volume are met', () => {
    const res = evaluateBet({ id: 'B-014' }, {
      actualMetricValue: 34.10,
      actualVolume: 41,
      targetMetricValue: 36.00,
      minVolume: 30,
      operator: '<='
    });
    assert.strictEqual(res.status, 'held');
  });

  it('settles as missed when target is not achieved', () => {
    const res = evaluateBet({ id: 'B-015' }, {
      actualMetricValue: 38.50,
      actualVolume: 35,
      targetMetricValue: 36.00,
      minVolume: 30,
      operator: '<='
    });
    assert.strictEqual(res.status, 'missed');
  });

  it('settles as inconclusive when volume is below minimum', () => {
    const res = evaluateBet({ id: 'B-016' }, {
      actualMetricValue: 32.00,
      actualVolume: 12,
      targetMetricValue: 36.00,
      minVolume: 30,
      operator: '<='
    });
    assert.strictEqual(res.status, 'inconclusive');
    assert.ok(res.reason.includes('Insufficient sample volume'));
  });

  it('settles as inconclusive when result is within account noise band', () => {
    const res = evaluateBet({ id: 'B-017' }, {
      actualMetricValue: 35.50,
      actualVolume: 50,
      targetMetricValue: 36.00,
      baselineValue: 36.00,
      noiseBand: 0.05 // 5% band -> 34.20 to 37.80 is noise
    });
    assert.strictEqual(res.status, 'inconclusive');
    assert.ok(res.reason.includes('noise band'));
  });

  it('voids bets that were never applied', () => {
    const res = evaluateBet({ id: 'B-018' }, {
      actualMetricValue: 32.00,
      actualVolume: 40,
      targetMetricValue: 36.00,
      applied: 'no'
    });
    assert.strictEqual(res.status, 'void');
  });

  it('voids bets that have exceeded 30 days without review data', () => {
    const res = evaluateBet({ id: 'B-019' }, {
      actualMetricValue: 32.00,
      actualVolume: 40,
      targetMetricValue: 36.00,
      daysSinceCheckBy: 35
    });
    assert.strictEqual(res.status, 'void');
  });
});

describe('Bets & Lessons — Shared Lesson Privacy Lint', () => {
  it('passes a clean anonymized shared lesson', () => {
    const cleanLesson = `---
id: L-020
scope: shared
tier: pattern
claim: In broad skincare campaigns, frequency above 4.5 correlates with steep CPA decay
summary: Frequency decay above 4.5 across broad sets
---
# Lesson L-020
Broad targeting ad sets on Meta suffer diminishing returns once 14-day frequency passes 4.5.
`;
    const lint = lintSharedLesson(cleanLesson, ['demo-shop', 'acme-beauty']);
    assert.strictEqual(lint.valid, true);
    assert.strictEqual(lint.errors.length, 0);
  });

  it('fails if a shared lesson contains a client slug', () => {
    const leakedLesson = `---
id: L-021
scope: shared
tier: pattern
claim: In demo-shop campaigns, frequency above 4.5 causes decay
summary: Lessons from demo-shop account
---
# Lesson L-021
Tested on demo-shop ad account with $5,768 spend.
`;
    const lint = lintSharedLesson(leakedLesson, ['demo-shop', 'acme-beauty']);
    assert.strictEqual(lint.valid, false);
    assert.ok(lint.errors.length > 0);
    assert.ok(lint.errors[0].includes('demo-shop'));
  });

  it('allows client slug in client-scoped lessons', () => {
    const clientLesson = `---
id: L-022
scope: client:demo-shop
tier: observation
summary: Client specific observation
---
# Lesson L-022
Applies specifically to demo-shop account.
`;
    const lint = lintSharedLesson(clientLesson, ['demo-shop']);
    assert.strictEqual(lint.valid, true);
  });
});
