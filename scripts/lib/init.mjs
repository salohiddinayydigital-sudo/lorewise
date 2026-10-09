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
 * Creates profile.md, bets.csv, and subdirectories (data, exports, briefs, reports).
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

  // 1. profile.md
  const profilePath = path.join(clientDir, 'profile.md');
  if (!fs.existsSync(profilePath)) {
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
    fs.writeFileSync(profilePath, profileContent, 'utf8');
  }

  // 2. bets.csv
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
    profilePath,
    betsPath,
    slug,
    clientName
  };
}
