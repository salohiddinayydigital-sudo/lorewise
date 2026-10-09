#!/usr/bin/env node

/**
 * Lorewise Spend Guard (PreToolUse Hook)
 * Intercepts mutating advertising MCP tool calls, enforces read-only safety,
 * and advises human-executable change packets instead.
 *
 * Exit codes:
 * 0: Allow tool execution (or non-ad tool, or fail-open on malformed input)
 * 2: Block tool execution (Claude Code blocking hook exit code)
 */

import fs from 'node:fs';
import path from 'node:path';

// Known recorded tool classifications
const KNOWN_READ_TOOLS = new Set([
  'ads_account_get_activity_logs',
  'ads_catalog_event_source_get',
  'ads_catalog_event_source_get_catalogs',
  'ads_catalog_event_source_get_health',
  'ads_catalog_event_source_get_recommendations',
  'ads_catalog_get_businesses',
  'ads_catalog_get_data_sources',
  'ads_catalog_get_diagnostics',
  'ads_catalog_get_dynamic_ads_health',
  'ads_catalog_get_feed_rules',
  'ads_catalog_get_product_feed_upload_sessions',
  'ads_catalog_list_catalogs',
  'ads_catalog_list_dpa_eligible_catalogs',
  'ads_catalog_list_partner_integrations',
  'ads_catalog_list_product_feeds',
  'ads_catalog_list_product_sets',
  'ads_catalog_list_products',
  'ads_experiment_abtest_get_test',
  'ads_experiment_check_eligibility',
  'ads_experiment_lift_get_test',
  'ads_experiment_list_tests',
  'ads_get_ad_account_custom_audiences',
  'ads_get_ad_account_pages',
  'ads_get_ad_accounts',
  'ads_get_ad_entities',
  'ads_get_ad_images',
  'ads_get_ad_preview',
  'ads_get_ad_videos',
  'ads_get_creative_ads',
  'ads_get_creatives',
  'ads_get_custom_audience',
  'ads_get_custom_audience_adsets',
  'ads_get_customconversions',
  'ads_get_dataset_details',
  'ads_get_dataset_quality',
  'ads_get_dataset_stats',
  'ads_get_datasets',
  'ads_get_errors',
  'ads_get_field_context',
  'ads_get_help_article',
  'ads_get_ig_accounts',
  'ads_get_ig_media',
  'ads_get_opportunity_score',
  'ads_get_pages_for_business',
  'ads_get_user_pages',
  'ads_insights_advertiser_context',
  'ads_insights_anomaly_signal',
  'ads_insights_auction_ranking_benchmarks',
  'ads_insights_industry_benchmark',
  'ads_insights_performance_trend',
  'ads_library_search',
  'ads_pixel_event_read',
  'ads_pixel_parameter_read',
  'google_ads_search',
  'google_ads_get_campaigns',
  'google_ads_get_ad_groups',
  'google_ads_get_metrics',
  'google_ads_list_accessible_customers',
  'ga4_run_report',
  'ga4_run_realtime_report',
  'ga4_get_metadata',
  'ga4_list_accounts',
  'ga4_list_properties'
]);

const KNOWN_WRITE_TOOLS = new Set([
  'ads_activate_entity',
  'ads_boost_ig_post',
  'ads_catalog_create',
  'ads_catalog_create_feed_rule',
  'ads_catalog_create_product_feed',
  'ads_catalog_create_product_feed_upload_session',
  'ads_catalog_create_product_set',
  'ads_catalog_delete_product',
  'ads_catalog_event_source_connect',
  'ads_catalog_event_source_disconnect',
  'ads_catalog_product_create',
  'ads_catalog_product_feed_delete',
  'ads_catalog_product_feed_delete_rule',
  'ads_catalog_product_set_delete',
  'ads_catalog_update_catalog',
  'ads_catalog_update_product',
  'ads_catalog_update_product_feed',
  'ads_catalog_update_product_set',
  'ads_create_ad',
  'ads_create_ad_set',
  'ads_create_campaign',
  'ads_create_creative',
  'ads_create_custom_audience',
  'ads_creative_delete',
  'ads_creative_update',
  'ads_creative_upload_media',
  'ads_delete_custom_audience',
  'ads_experiment_abtest_create_test',
  'ads_experiment_abtest_update_test',
  'ads_experiment_lift_create_test',
  'ads_pixel_event_create',
  'ads_pixel_event_delete',
  'ads_pixel_event_update',
  'ads_pixel_parameter_create',
  'ads_pixel_parameter_delete',
  'ads_pixel_parameter_update',
  'ads_update_custom_audience',
  'ads_update_custom_audience_users',
  'ads_update_entity',
  'google_ads_mutate_campaigns',
  'google_ads_mutate_ad_groups',
  'google_ads_create_campaign',
  'google_ads_update_budget',
  'google_ads_pause_ad_group',
  'ga4_create_conversion_event',
  'ga4_delete_conversion_event',
  'ga4_update_property'
]);

const WRITE_TOKENS = [
  'create', 'update', 'delete', 'activate', 'boost', 'upload',
  'connect', 'disconnect', 'pause', 'set', 'add', 'remove',
  'mutate', 'edit', 'publish', 'archive', 'modify'
];

const READ_TOKENS = [
  'get', 'list', 'read', 'search', 'insights', 'check',
  'preview', 'describe', 'query', 'report', 'stats', 'status', 'fetch'
];

/**
 * Checks whether a tool name belongs to the advertising/analytics domain.
 */
function isAdDomainTool(toolName) {
  const lower = toolName.toLowerCase();
  return (
    lower.startsWith('ads_') ||
    lower.startsWith('ad_') ||
    lower.startsWith('google_ads_') ||
    lower.startsWith('googleads_') ||
    lower.startsWith('adwords_') ||
    lower.startsWith('ga4_') ||
    lower.startsWith('meta_') ||
    lower.startsWith('facebook_ads_') ||
    lower.startsWith('tiktok_ads_') ||
    lower.startsWith('telegram_ads_') ||
    lower.startsWith('tg_ads_') ||
    lower.includes('_ads_') ||
    lower.includes('_adwords_')
  );
}

/**
 * Extracts normalized tool identifier by taking the trailing part after mcp__<server>__
 */
export function extractToolIdentifier(rawToolName) {
  if (!rawToolName) return '';
  const parts = rawToolName.split('__');
  return parts[parts.length - 1];
}

/**
 * Core decision logic. Returns { allow: boolean, reason: string }
 */
export function evaluateTool(rawToolName, options = {}) {
  // If spend guard is disabled by configuration
  if (options.spendGuard === 'off' || process.env.CLAUDE_PLUGIN_OPTION_SPEND_GUARD === 'off') {
    return { allow: true, reason: 'spend_guard disabled' };
  }

  const tool = extractToolIdentifier(rawToolName);

  // 1. If not an advertising tool, allow unconditionally
  if (!isAdDomainTool(tool)) {
    return { allow: true, reason: 'non-advertising domain tool' };
  }

  // 2. Check recorded classification table
  if (KNOWN_WRITE_TOOLS.has(tool)) {
    return { allow: false, reason: `known mutating tool: ${tool}` };
  }
  if (KNOWN_READ_TOOLS.has(tool)) {
    return { allow: true, reason: `known read tool: ${tool}` };
  }

  // 3. Token decomposition for unrecorded tools
  const tokens = tool.toLowerCase().split('_');

  // Check write tokens first
  for (const token of tokens) {
    if (WRITE_TOKENS.includes(token)) {
      return { allow: false, reason: `write verb token detected: "${token}" in ${tool}` };
    }
  }

  // Check read tokens
  for (const token of tokens) {
    if (READ_TOKENS.includes(token)) {
      return { allow: true, reason: `read verb token detected: "${token}" in ${tool}` };
    }
  }

  // 4. Unknown tool in advertising domain -> fail closed / block
  return { allow: false, reason: `unknown action in advertising domain: ${tool}` };
}

// Log audit decisions if plugin data directory is configured
function logDecision(tool, allow, reason) {
  const dataDir = process.env.CLAUDE_PLUGIN_DATA;
  if (!dataDir) return;
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const logLine = `[${new Date().toISOString()}] ${allow ? 'ALLOW' : 'BLOCK'} tool="${tool}" reason="${reason}"\n`;
    fs.appendFileSync(path.join(dataDir, 'guard.log'), logLine, 'utf8');
  } catch {
    // Silent fail for logging
  }
}

// Stdin reader
function readStdin() {
  return new Promise((resolve) => {
    let input = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      input += chunk;
    });
    process.stdin.on('end', () => {
      resolve(input);
    });
    process.stdin.on('error', () => {
      resolve('');
    });
    // In case stdin is not hooked
    setTimeout(() => resolve(input), 500);
  });
}

// CLI / Hook Entrypoint
async function main() {
  let rawInput = '';
  try {
    rawInput = await readStdin();
  } catch {
    process.exit(0); // Fail-open on input read error
  }

  if (!rawInput.trim()) {
    process.exit(0); // Fail-open on empty input
  }

  let data;
  try {
    data = JSON.parse(rawInput);
  } catch {
    process.exit(0); // Fail-open on malformed JSON
  }

  const rawToolName = data.tool || data.tool_name || data.name || '';
  if (!rawToolName) {
    process.exit(0);
  }

  const decision = evaluateTool(rawToolName);
  logDecision(rawToolName, decision.allow, decision.reason);

  if (!decision.allow) {
    const tool = extractToolIdentifier(rawToolName);
    process.stderr.write(
      `Lorewise is read-only. Mutating advertising tool "${tool}" was blocked.\n` +
      `I will write an actionable change packet instead for human review.\n`
    );
    process.exit(2); // Block execution
  }

  process.exit(0); // Allow execution
}

if (process.argv[1] && process.argv[1].endsWith('guard.mjs')) {
  main();
}
