#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const shouldApply = process.argv.includes('--apply');
const selectionPath = path.join(
  repoRoot,
  'research/onsen-db-seed/decision-goal-2026-07-13-goal100/goal100_candidate_selection_2026-07-13.json'
);
const targetTables = {
  accommodation: 'onsen_accommodations',
  facility: 'onsen_facilities',
};
const batchSize = 50;

function parseEnv(filePath) {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(readFileSync(filePath, 'utf8').split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (!match) return [];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    return [[match[1], value]];
  }));
}

function readConfig() {
  const env = { ...parseEnv(path.join(repoRoot, '.env.local')), ...process.env };
  const supabaseUrl = (env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
  const restUrl = (env.CONTENT_DB_REST_URL || (supabaseUrl ? `${supabaseUrl}/rest/v1` : '')).replace(/\/+$/, '');
  const apiKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!restUrl || !apiKey) throw new Error('Supabase REST URL and service role key are required.');
  return { restUrl, apiKey };
}

function readSelection() {
  const payload = JSON.parse(readFileSync(selectionPath, 'utf8'));
  if (payload.target_count !== 100 || payload.targets?.length !== 100) {
    throw new Error(`Expected a 100-target selection, received ${payload.targets?.length ?? 0}.`);
  }
  if (payload.targets.some((row) => row.readiness === 'hold')) {
    throw new Error('The selection includes a hold target.');
  }
  const keys = new Set(payload.targets.map((row) => `${row.target_type}:${row.slug}`));
  if (keys.size !== payload.targets.length) throw new Error('The selection includes duplicate targets.');
  return payload.targets;
}

async function request(config, table, query = {}, options = {}) {
  const url = new URL(`${config.restUrl}/${table}`);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      apikey: config.apiKey,
      authorization: `Bearer ${config.apiKey}`,
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.prefer ? { prefer: options.prefer } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  if (!response.ok) throw new Error(`${table} ${response.status}: ${await response.text()}`);
  if (response.status === 204) return [];
  return response.json();
}

function batches(rows) {
  return Array.from({ length: Math.ceil(rows.length / batchSize) }, (_, index) => (
    rows.slice(index * batchSize, (index + 1) * batchSize)
  ));
}

function inFilter(slugs) {
  return `in.(${slugs.map((slug) => JSON.stringify(slug)).join(',')})`;
}

async function patchStatus(config, table, slugs, status) {
  let changed = 0;
  for (const batch of batches(slugs)) {
    if (batch.length === 0) continue;
    const rows = await request(config, table, { slug: inFilter(batch), select: 'slug,status' }, {
      method: 'PATCH',
      prefer: 'return=representation',
      body: { status },
    });
    if (rows.length !== batch.length || rows.some((row) => row.status !== status)) {
      throw new Error(`${table} ${status} patch verification failed.`);
    }
    changed += rows.length;
  }
  return changed;
}

async function auditTable(config, targetType, table, selection) {
  const rows = await request(config, table, { select: 'slug,status', limit: '1000' });
  const selectedSlugs = selection.filter((row) => row.target_type === targetType).map((row) => row.slug).sort();
  const selectedSet = new Set(selectedSlugs);
  const rowsBySlug = new Map(rows.map((row) => [row.slug, row]));
  const missing = selectedSlugs.filter((slug) => !rowsBySlug.has(slug));
  const retired = selectedSlugs.filter((slug) => rowsBySlug.get(slug)?.status === 'retired');
  if (missing.length > 0 || retired.length > 0) {
    throw new Error(`${targetType} invalid selection: missing=${missing.join(',')} retired=${retired.join(',')}`);
  }
  return {
    target_type: targetType,
    table,
    selected: selectedSlugs.length,
    activate: selectedSlugs.filter((slug) => rowsBySlug.get(slug)?.status !== 'active'),
    retain: selectedSlugs.filter((slug) => rowsBySlug.get(slug)?.status === 'active'),
    demote: rows.filter((row) => row.status === 'active' && !selectedSet.has(row.slug)).map((row) => row.slug).sort(),
  };
}

async function verifyTable(config, audit) {
  const rows = await request(config, audit.table, { select: 'slug,status', limit: '1000' });
  const active = rows.filter((row) => row.status === 'active').map((row) => row.slug).sort();
  const expected = [...audit.activate, ...audit.retain].sort();
  if (active.length !== expected.length || active.some((slug, index) => slug !== expected[index])) {
    throw new Error(`${audit.table} active scope does not match the selected inventory.`);
  }
  return { target_type: audit.target_type, active_after: active.length };
}

const selection = readSelection();
const config = readConfig();
const audits = await Promise.all(Object.entries(targetTables).map(([targetType, table]) => (
  auditTable(config, targetType, table, selection)
)));

if (!shouldApply) {
  console.log(JSON.stringify({
    mode: 'dry-run',
    selected: selection.length,
    changes: audits.map((audit) => ({
      target_type: audit.target_type,
      selected: audit.selected,
      activate: audit.activate.length,
      retain: audit.retain.length,
      demote: audit.demote.length,
    })),
  }, null, 2));
  process.exit(0);
}

const applied = [];
for (const audit of audits) {
  applied.push({
    target_type: audit.target_type,
    activated: await patchStatus(config, audit.table, audit.activate, 'active'),
    demoted: await patchStatus(config, audit.table, audit.demote, 'draft'),
  });
}
const verification = await Promise.all(audits.map((audit) => verifyTable(config, audit)));
console.log(JSON.stringify({ mode: 'applied', selected: selection.length, applied, verification }, null, 2));
