import fs from 'node:fs';
import path from 'node:path';

/**
 * Initializes workspace folders and desk.md if missing.
 */
export function initWorkspace(workspaceDir = process.cwd()) {
  const lorewiseDir = path.join(workspaceDir, 'lorewise');
  const deskPath = path.join(lorewiseDir, 'desk.md');
  const playbookDir = path.join(lorewiseDir, 'playbook', 'notes');
  const clientsDir = path.join(lorewiseDir, 'clients');

  fs.mkdirSync(playbookDir, { recursive: true });
  fs.mkdirSync(clientsDir, { recursive: true });

  if (!fs.existsSync(deskPath)) {
    const defaultDesk = [
      '# Lorewise Desk — Active Client Portfolio',
      '',
      '| Client | Slug | Monthly Spend | Primary Channel | Secondary Channel | Due Bets | Inbox Files |',
      '|---|---|---|---|---|---|---|',
      ''
    ].join('\n');
    fs.writeFileSync(deskPath, defaultDesk, 'utf8');
  }

  return { lorewiseDir, deskPath, playbookDir, clientsDir };
}

/**
 * Initializes a new client second brain inside the workspace.
 * Creates client.md, bets.md, and subdirectories (data, exports, briefs, reports).
 */
export function initClient(slug, options = {}) {
  const workspaceDir = options.workspaceDir || process.cwd();
  const { deskPath, clientsDir } = initWorkspace(workspaceDir);

  const clientDir = path.join(clientsDir, slug);
  const dataDir = path.join(clientDir, 'data');
  const exportsDir = path.join(clientDir, 'exports');
  const briefsDir = path.join(clientDir, 'briefs');
  const reportsDir = path.join(clientDir, 'reports');

  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(exportsDir, { recursive: true });
  fs.mkdirSync(briefsDir, { recursive: true });
  fs.mkdirSync(reportsDir, { recursive: true });

  const clientName = options.name || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const monthlyBudget = options.budget ? Number(options.budget) : 5000;
  const targetRoas = options.targetRoas || '2.50';
  const targetCpa = options.targetCpa || '35.00';
  const primaryChannel = options.primaryChannel || 'Meta';
  const secondaryChannel = options.secondaryChannel || 'Google';
  const dateStr = options.date || new Date().toISOString().slice(0, 10);

  // 1. client.md & profile.md (dual creation for format spec & backward compatibility)
  const clientPath = path.join(clientDir, 'client.md');
  const profilePath = path.join(clientDir, 'profile.md');
  const profileContent = [
    '---',
    `client: "${clientName}"`,
    `slug: "${slug}"`,
    `created: "${dateStr}"`,
    `monthly_budget: ${monthlyBudget}`,
    `target_roas: ${targetRoas}`,
    `target_cpa: ${targetCpa}`,
    `primary_channel: "${primaryChannel}"`,
    `secondary_channel: "${secondaryChannel}"`,
    `conversion_lag_days: 3`,
    '---',
    '',
    `# ${clientName} — Media Buying Profile`,
    '',
    '## Unit Economics & Guardrails',
    `- Monthly Budget: $${monthlyBudget.toLocaleString()}`,
    `- Target ROAS: ${targetRoas}x`,
    `- Target CPA: $${targetCpa}`,
    `- Attribution Window: 7-day click / 1-day view (Meta), Data-driven (GA4)`,
    '',
    '## Channels & Objectives',
    `- Primary: ${primaryChannel} Ads`,
    `- Secondary: ${secondaryChannel} Ads`,
    '',
    '## Creative Formats',
    '- UGC Reels / TikToks (9:16 vertical video)',
    '- Static benefit-driven carousels',
    ''
  ].join('\n');

  if (!fs.existsSync(clientPath)) {
    fs.writeFileSync(clientPath, profileContent, 'utf8');
  }
  if (!fs.existsSync(profilePath)) {
    fs.writeFileSync(profilePath, profileContent, 'utf8');
  }

  // 2. bets.md & bets.csv
  const betsMdPath = path.join(clientDir, 'bets.md');
  if (!fs.existsSync(betsMdPath)) {
    const betsContent = [
      '# Bets Registry',
      '',
      '<!-- Append new bets below this line -->',
      ''
    ].join('\n');
    fs.writeFileSync(betsMdPath, betsContent, 'utf8');
  }

  const betsPath = path.join(clientDir, 'bets.csv');
  if (!fs.existsSync(betsPath)) {
    const betsHeader = 'bet_id,date_placed,channel,hypothesis,metric,target_value,actual_value,status,settled_date\n';
    fs.writeFileSync(betsPath, betsHeader, 'utf8');
  }

  // 3. Update desk.md if client not already present
  const deskContent = fs.readFileSync(deskPath, 'utf8');
  if (!deskContent.includes(`| ${slug} |`)) {
    const newRow = `| ${clientName} | ${slug} | $${monthlyBudget.toLocaleString()} | ${primaryChannel} | ${secondaryChannel} | 0 | 0 |\n`;
    fs.appendFileSync(deskPath, newRow, 'utf8');
  }

  return {
    clientDir,
    clientPath,
    profilePath,
    betsPath,
    betsMdPath,
    slug,
    clientName
  };
}

/**
 * Initializes the full synthetic Demo Shop inside the workspace.
 * Preloads client.md, bets.md, bets.csv, ledger.json, multi-channel data, and creatives.
 */
export function initDemo(options = {}) {
  const workspaceDir = options.workspaceDir || process.cwd();
  const repoRoot = options.repoRoot || path.resolve(import.meta.dirname, '../..');
  const demoSourceDir = path.join(repoRoot, 'skills', 'start', 'demo');

  const { deskPath, clientsDir } = initWorkspace(workspaceDir);
  const demoClientDir = path.join(clientsDir, 'demo-shop');
  const demoDataDir = path.join(demoClientDir, 'data');
  const demoCreativeDir = path.join(demoClientDir, 'creative');
  const demoExportsDir = path.join(demoClientDir, 'exports');
  const demoBriefsDir = path.join(demoClientDir, 'briefs');
  const demoReportsDir = path.join(demoClientDir, 'reports');

  fs.mkdirSync(demoDataDir, { recursive: true });
  fs.mkdirSync(demoCreativeDir, { recursive: true });
  fs.mkdirSync(demoExportsDir, { recursive: true });
  fs.mkdirSync(demoBriefsDir, { recursive: true });
  fs.mkdirSync(demoReportsDir, { recursive: true });

  if (fs.existsSync(demoSourceDir)) {
    // client.md & profile.md
    if (fs.existsSync(path.join(demoSourceDir, 'client.md'))) {
      fs.copyFileSync(path.join(demoSourceDir, 'client.md'), path.join(demoClientDir, 'client.md'));
      fs.copyFileSync(path.join(demoSourceDir, 'client.md'), path.join(demoClientDir, 'profile.md'));
    }
    if (fs.existsSync(path.join(demoSourceDir, 'bets.md'))) {
      fs.copyFileSync(path.join(demoSourceDir, 'bets.md'), path.join(demoClientDir, 'bets.md'));
    }
    if (fs.existsSync(path.join(demoSourceDir, 'ledger.json'))) {
      fs.copyFileSync(path.join(demoSourceDir, 'ledger.json'), path.join(demoClientDir, 'ledger.json'));
    }

    // Copy demo CSVs
    const sourceDataDir = path.join(demoSourceDir, 'data');
    if (fs.existsSync(sourceDataDir)) {
      for (const f of fs.readdirSync(sourceDataDir)) {
        fs.copyFileSync(path.join(sourceDataDir, f), path.join(demoDataDir, f));
        fs.copyFileSync(path.join(sourceDataDir, f), path.join(demoExportsDir, f));
      }
    }

    // Copy synthetic creatives
    const sourceCreativeDir = path.join(demoSourceDir, 'creative');
    if (fs.existsSync(sourceCreativeDir)) {
      for (const f of fs.readdirSync(sourceCreativeDir)) {
        fs.copyFileSync(path.join(sourceCreativeDir, f), path.join(demoCreativeDir, f));
      }
    }
  }

  // Create demo bets.csv
  const betsCsvPath = path.join(demoClientDir, 'bets.csv');
  const betsContent = [
    'bet_id,date_placed,channel,hypothesis,metric,target_value,actual_value,status,settled_date',
    'B-014,2026-09-28,Meta,Pause fatigued Broad 25-44 and move $60/day to Lookalike,CPA,<=$36,$34.10,won,2026-10-05',
    'B-015,2026-10-05,Google,Scale PMax Search asset group with UGC hook,ROAS,>=2.80,,open,'
  ].join('\n') + '\n';
  fs.writeFileSync(betsCsvPath, betsContent, 'utf8');

  // Update desk.md
  const deskContent = fs.readFileSync(deskPath, 'utf8');
  if (!deskContent.includes('| demo-shop |')) {
    const row = '| Demo Shop | demo-shop | $24,000 | Meta | Google | 1 | 4 |\n';
    fs.appendFileSync(deskPath, row, 'utf8');
  }

  return {
    slug: 'demo-shop',
    clientName: 'Demo Shop',
    clientDir: demoClientDir,
    deskPath
  };
}
