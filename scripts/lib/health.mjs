/**
 * Lorewise Brain Health & Playbook Hygiene Engine
 * Audits playbook notes and lessons for expired facts, unsourced claims,
 * and contradictory assertions. Verifies Spend Guard protection status.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Parse frontmatter from a markdown note or lesson
 */
export function parseNoteFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { meta: {}, body: content };

  const rawYaml = match[1];
  const meta = {};

  const lines = rawYaml.split(/\r?\n/);
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();

    // Strip quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }

    if (key) meta[key] = val;
  }

  const body = content.slice(match[0].length).trim();
  return { meta, body };
}

/**
 * Audit playbook directory for the three planted defects:
 * 1. Expired facts/notes
 * 2. Unsourced notes/claims
 * 3. Contradictory/contested assertions
 */
export function auditPlaybookHealth(playbookDir, options = {}) {
  const currentDate = options.currentDate ? new Date(options.currentDate) : new Date();

  const defects = {
    expired: [],
    unsourced: [],
    contradictory: [],
    totalChecked: 0,
  };

  if (!fs.existsSync(playbookDir)) {
    return {
      status: 'clean',
      totalFiles: 0,
      defectCount: 0,
      defects,
      message: 'No playbook directory found on disk.',
    };
  }

  const scanFiles = (dir) => {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        files = files.concat(scanFiles(full));
      } else if (ent.isFile() && ent.name.endsWith('.md')) {
        files.push(full);
      }
    }
    return files;
  };

  const mdFiles = scanFiles(playbookDir);
  const notesByTopic = new Map();

  for (const file of mdFiles) {
    defects.totalChecked++;
    const content = fs.readFileSync(file, 'utf8');
    const { meta } = parseNoteFrontmatter(content);
    const fileName = path.basename(file);

    // 1. Expiration check
    if (meta.expires) {
      const expDate = new Date(meta.expires);
      if (expDate.getTime() < currentDate.getTime()) {
        defects.expired.push({
          file: fileName,
          id: meta.id || fileName,
          claim: meta.claim || 'No claim provided',
          expires: meta.expires,
        });
      }
    }

    // 2. Unsourced check
    if (!meta.source || meta.source.trim() === '' || meta.source === 'null') {
      defects.unsourced.push({
        file: fileName,
        id: meta.id || fileName,
        claim: meta.claim || 'No claim provided',
      });
    }

    // 3. Contradictory / Contested check
    if (meta.tier === 'contested') {
      defects.contradictory.push({
        file: fileName,
        id: meta.id || fileName,
        reason: 'Lesson tier is marked contested',
        claim: meta.claim || 'No claim provided',
      });
    }

    // Check for conflicting claims on the same topic
    const topic = meta.topic || 'general';
    if (!notesByTopic.has(topic)) {
      notesByTopic.set(topic, []);
    }
    notesByTopic.get(topic).push({ file: fileName, id: meta.id || fileName, meta, content });
  }

  // Cross-file topic contradiction heuristic
  for (const [topic, notes] of notesByTopic.entries()) {
    if (notes.length > 1) {
      for (let i = 0; i < notes.length; i++) {
        for (let j = i + 1; j < notes.length; j++) {
          const a = notes[i];
          const b = notes[j];
          // Check explicit contradictory tags or opposite polarity
          if (
            (a.meta.claim && b.meta.claim && (
              (a.meta.claim.toLowerCase().includes('pause') && b.meta.claim.toLowerCase().includes('never pause')) ||
              (a.meta.claim.toLowerCase().includes('increase') && b.meta.claim.toLowerCase().includes('decrease'))
            )) ||
            (a.meta.conflict_with && a.meta.conflict_with === b.id) ||
            (b.meta.conflict_with && b.meta.conflict_with === a.id)
          ) {
            defects.contradictory.push({
              file: `${a.file} vs ${b.file}`,
              id: `${a.id} vs ${b.id}`,
              reason: `Conflicting advice under topic "${topic}"`,
              claim: `[${a.id}]: ${a.meta.claim} <--> [${b.id}]: ${b.meta.claim}`,
            });
          }
        }
      }
    }
  }

  const defectCount = defects.expired.length + defects.unsourced.length + defects.contradictory.length;
  const status = defectCount === 0 ? 'clean' : 'defects_detected';

  return {
    status,
    totalFiles: defects.totalChecked,
    defectCount,
    defects,
  };
}

/**
 * Inspect security spend guard and hook status
 */
export function checkProtectionState(pluginRootDir) {
  const pluginJsonPath = path.join(pluginRootDir, '.claude-plugin', 'plugin.json');
  const hooksJsonPath = path.join(pluginRootDir, 'hooks', 'hooks.json');
  const guardScriptPath = path.join(pluginRootDir, 'scripts', 'guard.mjs');

  const hasHooks = fs.existsSync(hooksJsonPath);
  const hasGuard = fs.existsSync(guardScriptPath);

  let spendGuardConfig = 'block';
  if (fs.existsSync(pluginJsonPath)) {
    try {
      const pluginConf = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
      if (pluginConf.userConfig?.spend_guard?.default) {
        spendGuardConfig = pluginConf.userConfig.spend_guard.default;
      }
    } catch {
      // Fallback to default
    }
  }

  const isProtected = hasHooks && hasGuard && spendGuardConfig === 'block';

  return {
    spendGuard: spendGuardConfig,
    hooksRegistered: hasHooks,
    guardScriptPresent: hasGuard,
    status: isProtected ? 'active' : 'degraded',
    description: isProtected
      ? 'Spend guard active (blocking 100% mutating ad tools)'
      : 'Spend guard is off or degraded',
  };
}
