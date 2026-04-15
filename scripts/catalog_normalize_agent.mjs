import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const seedSourcePath = path.join(rootDir, 'src', 'data', 'catalogResearchSeed.ts');
const candidateDir = path.join(rootDir, 'output', 'catalog-candidates');
const proposalDir = path.join(rootDir, 'output', 'catalog-proposals');

function parseArgs(argv) {
  const args = {
    input: undefined,
    file: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];
    if ((token === '--input' || token === '--file') && next) {
      args.input = next;
      args.file = next;
      index += 1;
    }
  }

  return args;
}

async function loadSeedModule() {
  const source = await readFile(seedSourcePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;

  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    console,
  });

  new vm.Script(transpiled, { filename: 'catalogResearchSeed.transpiled.js' }).runInContext(
    context
  );

  return module.exports;
}

function sanitizeIdChunk(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function nextListingId(market, canonicalProductId, existingListings) {
  const current = existingListings.filter(
    (item) => item.market === market && item.canonicalProductId === canonicalProductId
  ).length;
  const next = String(current + 1).padStart(2, '0');
  return `listing_${market}_${canonicalProductId}_${next}`;
}

function buildCanonicalDraft(candidate) {
  const suffix = sanitizeIdChunk(candidate.ingredientKey || candidate.titleSnapshot || 'candidate');
  const canonicalProductId = `p_${suffix}`;
  return {
    id: canonicalProductId,
    ingredientKey: candidate.ingredientKey,
    nameKo: candidate.titleSnapshot,
    brand: candidate.titleSnapshot.split(' ')[0] ?? '미확인',
    category: candidate.category,
    mechanism: candidate.category === 'bath_salt' ? 'magnesium' : 'aromatic',
    priceTier: 'mid',
    environments: candidate.category === 'body_wash' || candidate.category === 'bath_item'
      ? ['shower']
      : ['bathtub'],
    summary: '자동 조사 후보에서 생성된 초안입니다. 사람이 문구를 다듬어야 합니다.',
    editorialEyebrow: 'RESEARCH DRAFT',
    editorialFooterHint: '실제 등록 전 사람이 검수해야 하는 후보',
    status: 'paused',
    lastVerifiedAt: candidate.verifiedAt,
  };
}

function buildRuleDraft(candidate, canonicalProductId) {
  return {
    id: `rule_${canonicalProductId}`,
    canonicalProductId,
    ingredientKeys: [candidate.ingredientKey],
    allowedEnvironments:
      candidate.category === 'body_wash' || candidate.category === 'bath_item'
        ? ['shower']
        : ['bathtub'],
    modeBias: undefined,
    priorityWeight: 50,
    isSommelierPickCandidate: false,
    status: 'paused',
  };
}

function buildListingDraft(candidate, canonicalProductId, existingListings) {
  return {
    id: nextListingId(candidate.market, canonicalProductId, existingListings),
    canonicalProductId,
    market: candidate.market,
    sourceUrl: candidate.sourceUrl,
    titleSnapshot: candidate.titleSnapshot,
    sellerSnapshot: candidate.sellerSnapshot,
    priceSnapshotKrw: candidate.priceSnapshotKrw,
    availability: candidate.availability,
    verifiedAt: candidate.verifiedAt,
    sourceConfidence: candidate.sourceConfidence,
    notes: candidate.notes,
  };
}

async function loadCandidateFiles(inputFile) {
  const files = inputFile
    ? [path.isAbsolute(inputFile) ? inputFile : path.join(rootDir, inputFile)]
    : (await readdir(candidateDir))
        .filter((file) => file.endsWith('.json'))
        .map((file) => path.join(candidateDir, file));

  const payloads = [];
  for (const file of files) {
    const raw = await readFile(file, 'utf8');
    payloads.push({
      file,
      payload: JSON.parse(raw),
    });
  }
  return payloads;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const seedModule = await loadSeedModule();
  const candidateFiles = await loadCandidateFiles(args.file);
  const canonicalProducts = seedModule.CANONICAL_PRODUCT_SEED_V1;
  const existingListings = seedModule.PRODUCT_MARKET_LISTING_SEED_V1;

  const canonicalById = new Map(canonicalProducts.map((item) => [item.id, item]));
  const canonicalByIngredient = new Map(canonicalProducts.map((item) => [item.ingredientKey, item]));
  const listingByUrl = new Map(existingListings.map((item) => [item.sourceUrl, item]));

  const proposals = [];

  for (const { file, payload } of candidateFiles) {
    for (const candidate of payload.candidates ?? []) {
      if (listingByUrl.has(candidate.sourceUrl)) {
        proposals.push({
          sourceFile: file,
          action: 'skip',
          canonicalProductId: listingByUrl.get(candidate.sourceUrl).canonicalProductId,
          candidate,
          reason: 'listing_already_exists',
        });
        continue;
      }

      const existingCanonical =
        (candidate.canonicalProductId && canonicalById.get(candidate.canonicalProductId)) ||
        canonicalByIngredient.get(candidate.ingredientKey);

      if (existingCanonical) {
        proposals.push({
          sourceFile: file,
          action: 'attach_listing',
          canonicalProductId: existingCanonical.id,
          candidate,
          proposedListing: buildListingDraft(candidate, existingCanonical.id, existingListings),
          reason: candidate.canonicalProductId
            ? 'matched_target_canonical_product'
            : 'matched_existing_ingredient_key',
        });
        continue;
      }

      const canonicalDraft = buildCanonicalDraft(candidate);
      proposals.push({
        sourceFile: file,
        action: 'create_canonical',
        canonicalProductId: canonicalDraft.id,
        candidate,
        proposedCanonical: canonicalDraft,
        proposedListing: buildListingDraft(candidate, canonicalDraft.id, existingListings),
        proposedMatchRule: buildRuleDraft(candidate, canonicalDraft.id),
        reason: 'no_existing_canonical_match',
      });
    }
  }

  const summary = proposals.reduce(
    (acc, item) => {
      acc[item.action] = (acc[item.action] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const output = {
    generatedAt: new Date().toISOString(),
    counts: {
      files: candidateFiles.length,
      proposals: proposals.length,
      ...summary,
    },
    proposals,
  };

  await mkdir(proposalDir, { recursive: true });
  const outputPath = path.join(proposalDir, 'catalog-proposals.v1.json');
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

  console.log(
    JSON.stringify(
      {
        outputPath,
        counts: output.counts,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
