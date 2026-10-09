import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

// Helper to recursively list all files, ignoring .git and node_modules
function getAllFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

describe('Repository Structure & Directory Limits', () => {
  const allFiles = getAllFiles(REPO_ROOT);

  it('contains at most 512 files (Anthropic directory limit)', () => {
    assert.ok(allFiles.length <= 512, `File count ${allFiles.length} exceeds limit of 512`);
  });

  it('keeps every non-binary file under 256 KiB', () => {
    const MAX_SIZE_BYTES = 256 * 1024;
    for (const filePath of allFiles) {
      const stats = fs.statSync(filePath);
      assert.ok(
        stats.size < MAX_SIZE_BYTES,
        `File ${path.relative(REPO_ROOT, filePath)} is ${stats.size} bytes (>= 256 KiB limit)`
      );
    }
  });

  it('contains no forbidden binary files in root', () => {
    const allowedBinaryExts = new Set(['.png', '.jpg', '.jpeg', '.webp']);
    for (const filePath of allFiles) {
      const ext = path.extname(filePath).toLowerCase();
      const forbiddenExts = ['.exe', '.dll', '.so', '.dylib', '.zip', '.tar', '.gz', '.pdf', '.bin'];
      assert.ok(
        !forbiddenExts.includes(ext),
        `Prohibited binary file found: ${path.relative(REPO_ROOT, filePath)}`
      );
    }
  });
});

describe('Clean-Room Hygiene & Forbidden Strings', () => {
  const allFiles = getAllFiles(REPO_ROOT);
  const FORBIDDEN_STRINGS = [
    'tyrion',
    'claude-ads',
    'agricidaniel',
    'ai-marketing-hub',
    'marketingskills',
    'D:\\',
    'py -3'
  ];

  it('does not contain forbidden external project strings or local drive paths', () => {
    for (const filePath of allFiles) {
      // Don't test this test file's declaration of forbidden strings
      if (filePath.endsWith('structure.test.mjs')) continue;

      const content = fs.readFileSync(filePath, 'utf8');
      for (const forbidden of FORBIDDEN_STRINGS) {
        const found = content.toLowerCase().includes(forbidden.toLowerCase());
        assert.strictEqual(
          found,
          false,
          `Forbidden string "${forbidden}" found in ${path.relative(REPO_ROOT, filePath)}`
        );
      }
    }
  });

  it('contains no secrets or credential patterns', () => {
    const SECRET_PATTERNS = [
      /sk-ant-[a-zA-Z0-9_-]{20,}/,
      /ghp_[a-zA-Z0-9]{20,}/,
      /AKIA[0-9A-Z]{16}/,
      /-----BEGIN (RSA |EC )?PRIVATE KEY-----/
    ];

    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const pattern of SECRET_PATTERNS) {
        assert.strictEqual(
          pattern.test(content),
          false,
          `Potential secret pattern detected in ${path.relative(REPO_ROOT, filePath)}`
        );
      }
    }
  });
});

describe('Plugin Manifests', () => {
  it('has a valid plugin.json manifest', () => {
    const pluginPath = path.join(REPO_ROOT, '.claude-plugin', 'plugin.json');
    assert.ok(fs.existsSync(pluginPath), 'plugin.json must exist in .claude-plugin');

    const manifest = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));
    assert.strictEqual(manifest.name, 'lorewise');
    assert.strictEqual(manifest.displayName, 'Lorewise');
    assert.ok(manifest.version, 'Manifest must have a version string');
    assert.match(manifest.version, /^\d+\.\d+\.\d+$/, 'Version must be semver');
    assert.ok(manifest.description, 'Manifest must have a description');
    assert.ok(manifest.author, 'Manifest must declare author');
    assert.strictEqual(manifest.license, 'MIT');
    assert.ok(manifest.userConfig, 'Manifest must declare userConfig');
    assert.ok(manifest.userConfig.hook_mode, 'userConfig must include hook_mode');
    assert.ok(manifest.userConfig.spend_guard, 'userConfig must include spend_guard');
  });

  it('has a valid marketplace.json manifest', () => {
    const mktPath = path.join(REPO_ROOT, '.claude-plugin', 'marketplace.json');
    assert.ok(fs.existsSync(mktPath), 'marketplace.json must exist in .claude-plugin');

    const mkt = JSON.parse(fs.readFileSync(mktPath, 'utf8'));
    assert.strictEqual(mkt.name, 'lorewise');
    assert.ok(mkt.description, 'Marketplace must have description');
    assert.ok(mkt.owner, 'Marketplace must have owner');
    assert.ok(Array.isArray(mkt.plugins), 'Marketplace must have plugins array');
    assert.strictEqual(mkt.plugins.length, 1);
    assert.strictEqual(mkt.plugins[0].name, 'lorewise');
    assert.strictEqual(mkt.plugins[0].source, './');
  });
});

describe('Rules Block Uniformity (Prepared for Skills)', () => {
  it('checks that all worker skills have identical rules blocks when present', () => {
    const skillsDir = path.join(REPO_ROOT, 'skills');
    if (!fs.existsSync(skillsDir)) {
      // P0 stage: skills not created yet
      assert.ok(true);
      return;
    }

    const skillFolders = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    if (skillFolders.length === 0) {
      assert.ok(true);
      return;
    }

    // When skills are implemented in P2+, verify rules block consistency
    let referenceBlock = null;
    let referenceSkill = null;

    for (const folder of skillFolders) {
      const skillPath = path.join(skillsDir, folder, 'SKILL.md');
      if (!fs.existsSync(skillPath)) continue;

      const content = fs.readFileSync(skillPath, 'utf8');
      const rulesMatch = content.match(/<!-- RULES_BLOCK_START -->([\s\S]*?)<!-- RULES_BLOCK_END -->/);
      if (rulesMatch) {
        const block = rulesMatch[1].trim();
        if (referenceBlock === null) {
          referenceBlock = block;
          referenceSkill = folder;
        } else {
          assert.strictEqual(
            block,
            referenceBlock,
            `Rules block in ${folder}/SKILL.md does not match reference in ${referenceSkill}/SKILL.md`
          );
        }
      }
    }
  });
});
