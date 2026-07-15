#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

function parseEnv(filePath) {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(readFileSync(filePath, 'utf8').split(/\n/).flatMap((line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)=(.*)\s*$/);
    if (!match) return [];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    return [[match[1], value]];
  }));
}

const root = process.cwd();
const env = { ...parseEnv(path.join(root, '.env.local')), ...process.env };
const restUrl = env.CONTENT_DB_REST_URL?.replace(/\/+$/, '');
const apiKey = env.CONTENT_DB_SERVICE_ROLE_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!restUrl || !apiKey) {
  console.error('CONTENT_DB_REST_URL and a Supabase API key are required.');
  process.exit(1);
}

async function readRows(table, select, filters = {}) {
  const url = new URL(`${restUrl}/${table}`);
  url.searchParams.set('select', select);
  for (const [key, value] of Object.entries(filters)) url.searchParams.set(key, value);
  const response = await fetch(url, { headers: { apikey: apiKey, authorization: `Bearer ${apiKey}` } });
  if (!response.ok) throw new Error(`${table} read failed: ${response.status}`);
  return response.json();
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function evidenceCount(row, key) {
  return isRecord(row.evidence_counts) && Number.isFinite(Number(row.evidence_counts[key]))
    ? Number(row.evidence_counts[key])
    : 0;
}

function factValue(row) {
  return isRecord(row.filter_value) ? row.filter_value : {};
}

function facilityCoverage(facility, facts) {
  const ready = facts.filter((fact) => fact.facility_slug === facility.slug && fact.filter_status === 'ready' && fact.availability !== 'not_available');
  const profile = isRecord(facility.official_profile) ? facility.official_profile : {};
  const officialFacts = Array.isArray(profile.official_facts) ? profile.official_facts : [];
  const text = officialFacts.map((fact) => isRecord(fact) ? String(fact.fact || fact.value || '') : '').join(' ');
  const hasHours = ready.some((fact) => ['day_use', 'morning_bath', 'late_night'].includes(fact.filter_code) && Object.keys(factValue(fact)).length > 0)
    || /\d{1,2}:\d{2}\s*[-~〜–]\s*\d{1,2}:\d{2}/.test(text);
  const hasPrice = ready.some((fact) => fact.filter_code === 'adult_day_use_price' && Object.keys(factValue(fact)).length > 0)
    || /(?:성인|adult|大人)[^0-9]{0,12}[0-9][0-9,]*\s*(?:엔|円|yen)/i.test(text);
  const hasTowel = /(?:타월|수건|タオル|towel)/i.test(text);
  const checks = {
    bath_composition: Array.isArray(profile.bath_areas) && profile.bath_areas.length > 0,
    opening_hours: hasHours,
    adult_price_yen: hasPrice,
    towel_policy: hasTowel,
    official_action: Boolean(facility.official_url),
  };
  return { checks, coverage: Math.round(Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 100) };
}

function accommodationCoverage(row, intent, officialFacts) {
  const ready = officialFacts.filter((fact) => fact.accommodation_slug === row.slug && fact.filter_status === 'ready' && fact.availability !== 'not_available');
  const officialAction = ready.some((fact) => /^https?:\/\//.test(fact.official_source_url || ''));
  const price = ready.some((fact) => fact.filter_code === 'adult_day_use_price');
  const roomBath = ['all_rooms', 'some_rooms', 'room_signal_only'].includes(row.bath_scope);
  const privateBath = evidenceCount(row, 'privateBathMentionCount') > 0 || /대절|가족탕|전세/.test(`${row.primary_bath || ''} ${(row.operation_notes || []).join(' ')}`);
  const publicBath = row.bath_scope === 'public_bath_only' || evidenceCount(row, 'publicBathMentionCount') > 0 || /대욕장|공용|노천/.test(row.primary_bath || '');
  const checks = intent === 'stay_private'
    ? { bath_composition: Boolean(row.primary_bath), room_or_private_bath: roomBath || privateBath, use_method: ready.some((fact) => ['private_bath', 'family_bath'].includes(fact.filter_code)), price, official_action: officialAction }
    : { bath_composition: Boolean(row.primary_bath), public_bath: publicBath, bath_depth: ready.some((fact) => ['open_air_bath', 'sauna', 'stone_sauna'].includes(fact.filter_code)), price, official_action: officialAction };
  return { checks, coverage: Math.round(Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 100) };
}

const [accommodations, facilities, accommodationFacts, facilityFacts] = await Promise.all([
  readRows('onsen_accommodations', 'slug,name,region,area,primary_bath,bath_scope,operation_notes,evidence_counts', { status: 'eq.active' }),
  readRows('onsen_facilities', 'slug,name_ko,region_group,prefecture,onsen_area,official_url,official_profile', { status: 'eq.active' }),
  readRows('onsen_accommodation_official_filter_facts', 'accommodation_slug,filter_code,availability,filter_status,filter_value,official_source_url'),
  readRows('onsen_facility_official_filter_facts', 'facility_slug,filter_code,availability,filter_status,filter_value,official_source_url'),
]);

const privateCandidates = accommodations
  .filter((row) => ['all_rooms', 'some_rooms', 'room_signal_only'].includes(row.bath_scope) || evidenceCount(row, 'privateBathMentionCount') > 0)
  .sort((a, b) => evidenceCount(b, 'roomBathMentionCount') + evidenceCount(b, 'privateBathMentionCount') - evidenceCount(a, 'roomBathMentionCount') - evidenceCount(a, 'privateBathMentionCount'))
  .slice(0, 10)
  .map((row) => ({ slug: row.slug, name: row.name, ...accommodationCoverage(row, 'stay_private', accommodationFacts) }));

const depthCandidates = accommodations
  .filter((row) => row.bath_scope === 'public_bath_only' || evidenceCount(row, 'publicBathMentionCount') > 0)
  .filter((row) => !privateCandidates.some((candidate) => candidate.slug === row.slug))
  .sort((a, b) => evidenceCount(b, 'publicBathMentionCount') - evidenceCount(a, 'publicBathMentionCount'))
  .slice(0, 10)
  .map((row) => ({ slug: row.slug, name: row.name, ...accommodationCoverage(row, 'stay_bath_depth', accommodationFacts) }));

const facilityCandidates = facilities
  .map((row) => ({ row, audit: facilityCoverage(row, facilityFacts) }))
  .sort((a, b) => b.audit.coverage - a.audit.coverage)
  .slice(0, 10)
  .map(({ row, audit }) => ({ slug: row.slug, name: row.name_ko, ...audit }));

const intents = {
  stay_private: privateCandidates,
  stay_bath_depth: depthCandidates,
  city_facility: facilityCandidates,
};

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  inventory: { accommodations: accommodations.length, facilities: facilities.length },
  readyOfficialFacts: {
    accommodations: accommodationFacts.filter((fact) => fact.filter_status === 'ready').length,
    facilities: facilityFacts.filter((fact) => fact.filter_status === 'ready').length,
  },
  intentSummary: Object.fromEntries(Object.entries(intents).map(([intent, rows]) => [intent, {
    candidates: rows.length,
    passed80: rows.filter((row) => row.coverage >= 80).length,
    averageCoverage: Math.round(rows.reduce((sum, row) => sum + row.coverage, 0) / Math.max(rows.length, 1)),
  }])),
  candidates: intents,
}, null, 2));
