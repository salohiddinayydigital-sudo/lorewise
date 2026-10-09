/**
 * Lorewise Bet Settlement & Playbook Lesson Engine
 * Implements attribution lag windows, noise bands, confounding flags,
 * lesson tier derivation, and shared lesson privacy linting.
 */

/**
 * Derives the canonical confidence tier for a lesson.
 * Tiers are mathematically derived, never subjectively assigned.
 */
export function deriveLessonTier({
  supportCount = 0,
  accountsCount = 1,
  againstCount = 0,
  lastSupportedDate = null,
  referenceDate = new Date()
}) {
  if (againstCount > 0 && againstCount >= supportCount * 0.5) {
    return 'contested';
  }

  if (lastSupportedDate) {
    const lastDate = new Date(lastSupportedDate);
    const diffDays = (referenceDate - lastDate) / (1000 * 60 * 60 * 24);
    if (diffDays > 180) {
      return 'dormant';
    }
  }

  if (accountsCount >= 2 && supportCount >= 2) {
    return `seen in ${accountsCount} accounts`;
  }

  if (supportCount >= 3) {
    return 'pattern';
  }

  return 'observation';
}

/**
 * Evaluates an individual bet against performance data.
 */
export function evaluateBet(bet, {
  actualMetricValue,
  actualVolume,
  targetMetricValue,
  minVolume = 0,
  operator = '<=', // '<=' for CPA, '>=' for ROAS/purchases
  noiseBand = 0.05,
  baselineValue = null,
  isConfounded = false,
  applied = 'yes',
  daysSinceCheckBy = 0
}) {
  if (applied === 'no') {
    return { status: 'void', reason: 'Action was never applied' };
  }

  if (daysSinceCheckBy > 30) {
    return { status: 'void', reason: 'Expired: 30 days passed without review data' };
  }

  if (isConfounded) {
    return { status: 'inconclusive', reason: 'Confounded by external promo calendar or concurrent shift' };
  }

  // Volume check
  if (actualVolume < minVolume) {
    return {
      status: 'inconclusive',
      reason: `Insufficient sample volume: ${actualVolume} (minimum required: ${minVolume})`
    };
  }

  // Noise band check against baseline if provided
  if (baselineValue !== null) {
    const relativeChange = Math.abs(actualMetricValue - baselineValue) / baselineValue;
    if (relativeChange < noiseBand) {
      return {
        status: 'inconclusive',
        reason: `Change (${(relativeChange * 100).toFixed(1)}%) is within account noise band (${(noiseBand * 100).toFixed(1)}%)`
      };
    }
  }

  // Threshold evaluation
  let passed = false;
  if (operator === '<=') {
    passed = actualMetricValue <= targetMetricValue;
  } else if (operator === '>=') {
    passed = actualMetricValue >= targetMetricValue;
  }

  return {
    status: passed ? 'held' : 'missed',
    actualMetricValue,
    actualVolume,
    targetMetricValue
  };
}

/**
 * Privacy lint: ensures shared lessons contain zero client slugs or private identifiers.
 */
export function lintSharedLesson(markdownContent, clientSlugs = []) {
  const errors = [];

  // Parse frontmatter
  const fmMatch = markdownContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) {
    return { valid: true, errors: [] };
  }

  const fm = fmMatch[1];
  const isShared = /scope:\s*shared/i.test(fm);

  if (!isShared) {
    return { valid: true, errors: [] };
  }

  // In shared scope, verify no client slug appears in body or frontmatter
  for (const slug of clientSlugs) {
    if (!slug || slug.length < 3) continue;
    const regex = new RegExp(`\\b${slug}\\b`, 'i');
    if (regex.test(markdownContent)) {
      errors.push(`Privacy leak detected: client slug "${slug}" found in shared lesson`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
