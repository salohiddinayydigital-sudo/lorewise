import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const AGENTS_DIR = path.join(REPO_ROOT, 'agents');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

describe('Expanded Roster — 8 Specialized Subagents', () => {
  const EXPECTED_AGENTS = [
    'analyst.md',
    'creative-eye.md',
    'skeptic.md',
    'copywriter.md',
    'tracking-auditor.md',
    'budget-strategist.md',
    'launch-architect.md',
    'compliance-guard.md'
  ];

  it('contains all 8 designated subagents in agents/', () => {
    for (const agentFile of EXPECTED_AGENTS) {
      const fullPath = path.join(AGENTS_DIR, agentFile);
      assert.ok(fs.existsSync(fullPath), `Subagent definition ${agentFile} must exist`);
    }
  });

  it('enforces read-only safety tools and valid frontmatter on every subagent', () => {
    for (const agentFile of EXPECTED_AGENTS) {
      const content = fs.readFileSync(path.join(AGENTS_DIR, agentFile), 'utf8');
      assert.ok(content.startsWith('---'), `${agentFile} must start with YAML frontmatter`);

      const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      assert.ok(fmMatch, `${agentFile} must close YAML frontmatter`);
      const fm = fmMatch[1];

      assert.match(fm, /name:[ \t]*[a-z-]+/, `${agentFile} must have a name`);
      assert.match(fm, /description:[ \t]*.+/, `${agentFile} must have a description`);
      assert.match(fm, /model:[ \t]*.+/, `${agentFile} must specify a model`);
      assert.match(fm, /tools:[ \t]*\[.+\]/, `${agentFile} must define allowed tools`);

      // All subagents must disallow mutating tools (Write, Edit, Bash)
      assert.match(fm, /disallowedTools:[ \t]*\[.+\]/, `${agentFile} must define disallowedTools`);
      assert.ok(fm.includes('Write'), `${agentFile} must disallow Write`);
      assert.ok(fm.includes('Edit'), `${agentFile} must disallow Edit`);
      assert.ok(fm.includes('Bash'), `${agentFile} must disallow Bash`);
    }
  });
});

describe('Expanded Capabilities — 12 Worker Skills', () => {
  const EXPECTED_SKILLS = [
    'start',
    'week',
    'plan',
    'diagnose',
    'creative',
    'copy',
    'launch',
    'competitor',
    'tracking',
    'learn',
    'remember',
    'check'
  ];

  it('contains all 12 designated skills in skills/', () => {
    for (const skillName of EXPECTED_SKILLS) {
      const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
      assert.ok(fs.existsSync(skillPath), `Skill ${skillName}/SKILL.md must exist`);
    }
  });

  it('verifies new skill reference files exist and contain structured guidance', () => {
    const references = [
      path.join(SKILLS_DIR, 'copy', 'copy-angles.md'),
      path.join(SKILLS_DIR, 'copy', 'platform-limits.md'),
      path.join(SKILLS_DIR, 'launch', 'phased-testing.md'),
      path.join(SKILLS_DIR, 'launch', 'preflight-checklist.md'),
      path.join(SKILLS_DIR, 'competitor', 'angle-extraction.md'),
      path.join(SKILLS_DIR, 'competitor', 'differentiation-matrix.md'),
      path.join(SKILLS_DIR, 'tracking', 'event-taxonomy.md'),
      path.join(SKILLS_DIR, 'tracking', 'utm-standards.md'),
      path.join(SKILLS_DIR, 'plan', 'scaling-frameworks.md')
    ];

    for (const refPath of references) {
      assert.ok(fs.existsSync(refPath), `Reference guide ${path.relative(REPO_ROOT, refPath)} must exist`);
      const text = fs.readFileSync(refPath, 'utf8');
      assert.ok(text.length > 200, `Reference guide ${refPath} must contain substantive guidance`);
    }
  });
});
