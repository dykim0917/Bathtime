import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const snapshotDate = '2026-07-07';
const reviewedNamePath = path.join(
  process.cwd(),
  'research',
  'onsen-name-normalization',
  'onsen_accommodation_name_qa_reviewed_2026-07-07.json'
);

let reviewedNames = null;

function unique(values) {
  return [...new Set(values.map((value) => String(value ?? '').trim()).filter(Boolean))];
}

function readReviewedNames() {
  if (reviewedNames) return reviewedNames;
  if (!existsSync(reviewedNamePath)) {
    reviewedNames = new Map();
    return reviewedNames;
  }
  const rows = JSON.parse(readFileSync(reviewedNamePath, 'utf8'));
  reviewedNames = new Map(rows.map((row) => [row.slug, row]));
  return reviewedNames;
}

export function applyOnsenNameQa(row) {
  const reviewed = readReviewedNames().get(row.slug);
  if (!reviewed?.verified_display_name_ko) return row;

  return {
    ...row,
    name: reviewed.verified_display_name_ko,
    display_name_ko: reviewed.verified_display_name_ko,
    aliases_ko: unique([
      reviewed.verified_display_name_ko,
      ...(String(reviewed.aliases_ko ?? '').split('|')),
      ...(row.aliases_ko ?? []),
      reviewed.previous_display_name_ko,
    ]),
    aliases_ja: unique([row.name_ja, row.ja_name, ...(row.aliases_ja ?? [])]),
    aliases_en: unique([row.name_en, row.name_romaji, ...(row.aliases_en ?? [])]),
    name_verification_status: 'verified',
    name_source_note: `한국어 서비스 대표명 1차 QA 완료(${snapshotDate}). 일본 공식명/영문명은 별칭으로 보존.`,
  };
}
