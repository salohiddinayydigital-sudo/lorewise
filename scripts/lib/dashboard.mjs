import fs from 'node:fs';
import path from 'node:path';
import { checkProtectionState, auditPlaybookHealth } from './health.mjs';

/**
 * Generates structured portfolio and desk dashboard metrics.
 */
export function generateDashboard(workspaceDir = process.cwd(), repoRoot = path.resolve(import.meta.dirname, '../..')) {
  const deskPath = path.join(workspaceDir, 'lorewise', 'desk.md');
  const clientsDir = path.join(workspaceDir, 'lorewise', 'clients');
  const playbookDir = path.join(workspaceDir, 'lorewise', 'playbook');

  const protection = checkProtectionState(repoRoot);
  const health = auditPlaybookHealth(playbookDir);

  const clients = [];
  let totalMonthlySpend = 0;
  let totalDueBets = 0;
  let totalInboxFiles = 0;

  if (fs.existsSync(deskPath)) {
    const deskContent = fs.readFileSync(deskPath, 'utf8');
    const rows = deskContent.split(/\r?\n/).filter(l => {
      if (!l.startsWith('|')) return false;
      if (l.includes('---')) return false;
      const cols = l.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length === 0) return false;
      if (cols[0].toLowerCase() === 'client' && cols[1]?.toLowerCase() === 'slug') return false;
      return true;
    });

    for (const r of rows) {
      const cols = r.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 7) {
        const clientName = cols[0];
        const slug = cols[1];
        const spendRaw = cols[2];
        const primary = cols[3];
        const secondary = cols[4];
        const dueBets = parseInt(cols[5], 10) || 0;
        const inbox = parseInt(cols[6], 10) || 0;

        const spendNum = parseInt(spendRaw.replace(/[^\d]/g, ''), 10) || 0;
        totalMonthlySpend += spendNum;
        totalDueBets += dueBets;
        totalInboxFiles += inbox;

        clients.push({
          name: clientName,
          slug,
          spend: spendRaw,
          primary,
          secondary,
          dueBets,
          inbox
        });
      }
    }
  }

  // Scan bets across all client folders
  const bets = [];
  if (fs.existsSync(clientsDir)) {
    const slugs = fs.readdirSync(clientsDir).filter(f => !f.startsWith('.'));
    for (const slug of slugs) {
      const bPath = path.join(clientsDir, slug, 'bets.csv');
      if (fs.existsSync(bPath)) {
        const lines = fs.readFileSync(bPath, 'utf8').split(/\r?\n/).filter(Boolean);
        if (lines.length > 1) {
          for (const l of lines.slice(1)) {
            const parts = l.split(',').map(p => p.trim());
            if (parts.length >= 8) {
              bets.push({
                id: parts[0],
                slug,
                date: parts[1],
                channel: parts[2],
                hypothesis: parts[3],
                metric: parts[4],
                target: parts[5],
                actual: parts[6],
                status: parts[7]
              });
            }
          }
        }
      }
    }
  }

  const openBets = bets.filter(b => b.status.toLowerCase() === 'open' || b.status.toLowerCase() === 'pending');
  const wonBets = bets.filter(b => b.status.toLowerCase() === 'won');
  const lostBets = bets.filter(b => b.status.toLowerCase() === 'lost');
  const settledCount = wonBets.length + lostBets.length;
  const winRate = settledCount > 0 ? Math.round((wonBets.length / settledCount) * 100) : 0;

  return {
    clients,
    totalMonthlySpend,
    totalDueBets,
    totalInboxFiles,
    betsSummary: {
      total: bets.length,
      open: openBets.length,
      won: wonBets.length,
      lost: lostBets.length,
      winRate: `${winRate}%`
    },
    protection,
    health
  };
}

/**
 * Formats dashboard data into a clean ASCII terminal board.
 */
export function formatDashboardAscii(dashboardData) {
  const { clients, totalMonthlySpend, betsSummary, protection, health } = dashboardData;

  const lines = [];
  lines.push('================================================================================');
  lines.push('                     LOREWISE MEDIA BUYER DESK DASHBOARD                        ');
  lines.push('================================================================================');
  lines.push('');
  lines.push(' [PORTFOLIO OVERVIEW]');
  lines.push('--------------------------------------------------------------------------------');
  lines.push(
    ' Client'.padEnd(20) +
    'Slug'.padEnd(16) +
    'Spend/Mo'.padEnd(14) +
    'Channels'.padEnd(18) +
    'Due Bets  Inbox'
  );
  lines.push('--------------------------------------------------------------------------------');

  if (clients.length === 0) {
    lines.push(' No active clients registered yet. Run `lorewise init <client-slug>` to start.');
  } else {
    for (const c of clients) {
      const channels = `${c.primary}, ${c.secondary}`;
      lines.push(
        ` ${c.name.slice(0, 18)}`.padEnd(20) +
        c.slug.slice(0, 14).padEnd(16) +
        c.spend.slice(0, 12).padEnd(14) +
        channels.slice(0, 16).padEnd(18) +
        String(c.dueBets).padEnd(10) +
        String(c.inbox)
      );
    }
  }
  lines.push('--------------------------------------------------------------------------------');
  lines.push(` Total Portfolio Monthly Budget: $${totalMonthlySpend.toLocaleString()}`);
  lines.push('');
  lines.push(' [FALSIFIABLE BETS & LEARNING ENGINE]');
  lines.push('--------------------------------------------------------------------------------');
  lines.push(
    ` Total Bets: ${betsSummary.total}  |  Open Hypotheses: ${betsSummary.open}  |  Settled: ${betsSummary.won + betsSummary.lost} (Won: ${betsSummary.won}, Lost: ${betsSummary.lost})`
  );
  lines.push(` Cumulative Hypothesis Win Rate: ${betsSummary.winRate}`);
  lines.push('');
  lines.push(' [SYSTEM PROTECTION & KNOWLEDGE HEALTH]');
  lines.push('--------------------------------------------------------------------------------');
  lines.push(` * Spend Guard:       [${protection.status.toUpperCase()}] — ${protection.description}`);
  lines.push(` * Receipts Engine:   [ACTIVE] — Non-additive guard, CSV Profiler, PostToolVerify`);
  lines.push(` * Playbook Health:   [${health.status.toUpperCase()}] — ${health.defectCount} defect(s) detected across ${health.totalFiles} notes`);
  lines.push('================================================================================');
  lines.push(' Weekly Cadence: Mon (/lorewise:week) | Wed (/lorewise:diagnose) | Fri (/lorewise:remember)');
  lines.push('================================================================================');

  return lines.join('\n');
}
