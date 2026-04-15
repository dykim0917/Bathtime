import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const inputDir = path.join(rootDir, 'input');
const outputDir = path.join(rootDir, 'output');
const themesSourcePath = path.join(rootDir, 'src', 'data', 'themes.ts');
const DEFAULT_MODEL = 'gpt-5-mini';
const MAX_OPENAI_RETRIES = 2;

function parseArgs(argv) {
  const args = {
    brief: path.join(inputDir, 'trip_theme_brief.json'),
    outputDir,
    count: undefined,
    model: DEFAULT_MODEL,
    offline: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];
    if ((token === '--brief' || token === '--input') && next) {
      args.brief = path.isAbsolute(next) ? next : path.join(rootDir, next);
      index += 1;
      continue;
    }
    if ((token === '--output-dir' || token === '--out-dir') && next) {
      args.outputDir = path.isAbsolute(next) ? next : path.join(rootDir, next);
      index += 1;
      continue;
    }
    if (token === '--count' && next) {
      const parsed = Number.parseInt(next, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        args.count = parsed;
      }
      index += 1;
      continue;
    }
    if (token === '--model' && next) {
      args.model = next;
      index += 1;
      continue;
    }
    if (token === '--offline') {
      args.offline = true;
    }
  }

  return args;
}

async function loadThemesModule() {
  const source = await readFile(themesSourcePath, 'utf8');
  const sanitized = `const GENERATED_THEME_PRESETS = [];\n${source.replace(/import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];?\n/g, '')}`;
  const transpiled = ts.transpileModule(sanitized, {
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

  new vm.Script(transpiled, { filename: 'themes.transpiled.js' }).runInContext(context);
  return module.exports;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function uniqueBy(array, keyFn) {
  const seen = new Set();
  const result = [];

  for (const item of array) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

function isAllowedEnvironment(environment, brief) {
  return (brief.environments ?? []).includes(environment);
}

function normalizeGeneratedSpec(spec, brief, existingIds) {
  const title = String(spec.title ?? '').trim();
  const destination = String(spec.destination ?? title).trim();
  const category = String(spec.category ?? '').trim();
  const subtitle = String(spec.subtitle ?? '').trim();
  const environment = String(spec.environment ?? 'bathtub').trim();
  const imagePromptSeed = String(spec.imagePromptSeed ?? '').trim();
  const scent = String(spec.scent ?? '우디 머스크').trim();
  const lighting = String(spec.lighting ?? '차분한 확산 조명').trim();
  const colorHex = /^#[0-9a-fA-F]{6}$/.test(String(spec.colorHex ?? '').trim())
    ? String(spec.colorHex).trim()
    : '#5E6B7A';
  const rationale = String(spec.rationale ?? '').trim();

  if (!title || !category || !subtitle || !imagePromptSeed || !rationale) {
    return null;
  }
  if (!(brief.categories ?? []).includes(category)) {
    return null;
  }
  if (!isAllowedEnvironment(environment, brief)) {
    return null;
  }

  return buildCandidate(
    {
      title,
      destination,
      subtitle,
      environment,
      imagePromptSeed,
      scent,
      lighting,
      colorHex,
      rationale,
    },
    category,
    existingIds,
    brief
  );
}

function extractJsonBlock(text) {
  const start = text.indexOf('{');
  const altStart = text.indexOf('[');
  const jsonStart =
    start === -1 ? altStart : altStart === -1 ? start : Math.min(start, altStart);

  if (jsonStart === -1) {
    throw new Error('No JSON block found in OpenAI response.');
  }

  const jsonText = text.slice(jsonStart).trim();
  return JSON.parse(jsonText);
}

function responseToText(payload) {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const chunks = [];
  for (const outputItem of payload.output ?? []) {
    for (const contentItem of outputItem.content ?? []) {
      if (typeof contentItem.text === 'string') {
        chunks.push(contentItem.text);
      }
    }
  }

  return chunks.join('\n').trim();
}

function buildThemeGenerationPrompts(brief, existingThemes, requestedCount) {
  const system = [
    'You are a premium wellness creative director for Bath Sommelier.',
    'Generate original trip routine themes for a bath ritual app.',
    'Return only valid JSON.',
    'Avoid medical framing, treatment framing, hype, party energy, and generic travel brochure language.',
    'Each theme must feel quiet, premium, immersive, and usable as a mobile app routine theme.',
  ].join(' ');

  const user = {
    task: 'Create new trip theme candidates.',
    requestedCount,
    allowedCategories: brief.categories,
    allowedEnvironments: brief.environments,
    requiredMoodWords: brief.mustIncludeMoodWords,
    forbiddenWords: brief.avoidWords,
    existingThemeIds: existingThemes.map((theme) => theme.id),
    existingThemeTitles: existingThemes.map((theme) => theme.title),
    outputShape: {
      candidates: [
        {
          title: 'string',
          destination: 'string',
          subtitle: 'string',
          category: 'one of allowedCategories',
          environment: 'one of allowedEnvironments',
          imagePromptSeed: 'short comma-separated visual seed phrase in English',
          scent: 'short scent label in Korean',
          lighting: 'short lighting label in Korean',
          colorHex: '#RRGGBB',
          rationale: 'short Korean explanation of why this theme is distinct',
        },
      ],
    },
    constraints: [
      'Themes must be distinct from existing themes and from each other.',
      'Prefer evocative but product-usable names.',
      'Subtitles should read like a premium card subtitle in Korean.',
      'Image prompt seeds should be visual, concrete, and people-free.',
      'No duplicate destinations or duplicate titles.',
      'Keep the candidate list exactly requestedCount items when possible.',
    ],
  };

  return { system, user: JSON.stringify(user, null, 2) };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readErrorBody(response) {
  try {
    const text = await response.text();
    if (!text.trim()) return null;
    try {
      const parsed = JSON.parse(text);
      return parsed.error?.message ?? text;
    } catch {
      return text;
    }
  } catch {
    return null;
  }
}

async function generateCandidatesViaOpenAI(args, brief, existingThemes, existingIds, requestedCount) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set.');
  }

  const { system, user } = buildThemeGenerationPrompts(brief, existingThemes, requestedCount);
  let lastError = null;
  for (let attempt = 0; attempt <= MAX_OPENAI_RETRIES; attempt += 1) {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: args.model,
        reasoning: { effort: 'low' },
        input: [
          {
            role: 'system',
            content: [{ type: 'input_text', text: system }],
          },
          {
            role: 'user',
            content: [{ type: 'input_text', text: user }],
          },
        ],
      }),
    });

    if (response.ok) {
      const payload = await response.json();
      const text = responseToText(payload);
      const parsed = extractJsonBlock(text);
      const rawCandidates = Array.isArray(parsed) ? parsed : parsed.candidates;

      if (!Array.isArray(rawCandidates) || rawCandidates.length === 0) {
        throw new Error('OpenAI API returned no candidates.');
      }

      const normalized = rawCandidates
        .map((candidate) => normalizeGeneratedSpec(candidate, brief, existingIds))
        .filter(Boolean);

      if (normalized.length === 0) {
        throw new Error('OpenAI API returned candidates, but none passed local validation.');
      }

      return uniqueBy(normalized, (candidate) => candidate.themeId).slice(0, requestedCount);
    }

    const errorBody = await readErrorBody(response);
    lastError =
      response.status === 429
        ? `OpenAI API rate limit or quota issue (429). ${errorBody ?? 'Check billing, credits, or retry later.'}`
        : `OpenAI API request failed with status ${response.status}.${errorBody ? ` ${errorBody}` : ''}`;

    if (response.status === 429 && attempt < MAX_OPENAI_RETRIES) {
      await sleep(1500 * (attempt + 1));
      continue;
    }

    throw new Error(lastError);
  }
  throw new Error(lastError ?? 'OpenAI API request failed.');
}

const CATEGORY_LIBRARY = {
  nature: [
    {
      title: 'Moss Garden',
      destination: 'Moss Garden',
      subtitle: '이끼 정원 + 젖은 돌결',
      environment: 'bathtub',
      imagePromptSeed: 'mossy stone garden, dew, shaded green light, still air',
      scent: '편백',
      lighting: '낮은 녹색 반사광',
      colorHex: '#4E6F52',
      rationale: '기존 숲 계열과는 다르게 더 낮고 젖은 정원 질감을 중심에 둔 테마',
    },
    {
      title: 'Cedar Valley',
      destination: 'Cedar Valley',
      subtitle: '시더 숲 + 계곡 안개',
      environment: 'partial_bath',
      imagePromptSeed: 'cedar trunks, valley mist, cold stream edge, quiet depth',
      scent: '시더우드',
      lighting: '희미한 계곡광',
      colorHex: '#5D6B57',
      rationale: '깊은 숲 대신 좁은 계곡과 차가운 공기감을 전면에 둔 테마',
    },
  ],
  urban: [
    {
      title: 'Afterglow Seoul',
      destination: 'Seoul',
      subtitle: '젖은 네온 + 새벽 골목',
      environment: 'shower',
      imagePromptSeed: 'wet alley reflections, dim neon, midnight fog, calm city air',
      scent: '베티버',
      lighting: '차분한 네온 잔광',
      colorHex: '#4C4A74',
      rationale: '파리보다 더 젖고 미니멀한 아시아 도시 잔광 무드',
    },
    {
      title: 'Lisbon Blue Hour',
      destination: 'Lisbon',
      subtitle: '트램 잔향 + 블루아워',
      environment: 'bathtub',
      imagePromptSeed: 'stone street, tiled wall, dusk tram glow, Atlantic air',
      scent: '네롤리',
      lighting: '푸른 황혼 조명',
      colorHex: '#5E7291',
      rationale: '도시 테마지만 재즈보다 해안성과 석재 질감을 살린 방향',
    },
  ],
  cozy: [
    {
      title: 'Wool Cabin',
      destination: 'Wool Cabin',
      subtitle: '울 블랭킷 + 스팀 램프',
      environment: 'footbath',
      imagePromptSeed: 'soft wool texture, lamp haze, warm steam, intimate cabin corner',
      scent: '바닐라 우드',
      lighting: '로우 앰버 램프',
      colorHex: '#8A6D58',
      rationale: '사우나보다 더 패브릭과 포근함에 치우친 실내 무드',
    },
    {
      title: 'Fireside Library',
      destination: 'Fireside Library',
      subtitle: '가죽 의자 + 벽난로 잔향',
      environment: 'bathtub',
      imagePromptSeed: 'old leather, low fire glow, book-lined wall, warm dusk air',
      scent: '앰버',
      lighting: '벽난로 로우 키 라이트',
      colorHex: '#6E4B3A',
      rationale: '사우나의 깨끗한 목재감 대신 서재의 밀도와 잔향을 강조',
    },
  ],
  coastal: [
    {
      title: 'Salt Breeze',
      destination: 'Salt Breeze',
      subtitle: '소금기 바람 + 흐린 해안선',
      environment: 'shower',
      imagePromptSeed: 'cloudy shoreline, sea spray, chalk stone, pale horizon',
      scent: '시솔트',
      lighting: '옅은 회청색 자연광',
      colorHex: '#7A8F9C',
      rationale: 'Ocean Dawn보다 더 흐리고 미네랄 감도가 높은 테마',
    },
    {
      title: 'Harbor Dawn',
      destination: 'Harbor Dawn',
      subtitle: '항구 안개 + 밧줄 결',
      environment: 'partial_bath',
      imagePromptSeed: 'harbor mist, rope texture, wet dock wood, muted sunrise',
      scent: '베르가못',
      lighting: '옅은 새벽 항만광',
      colorHex: '#64818C',
      rationale: '파도 대신 항구 디테일로 분위기 전환을 설계한 테마',
    },
  ],
  winter: [
    {
      title: 'Frost Window',
      destination: 'Frost Window',
      subtitle: '서리 유리 + 실내 잔광',
      environment: 'bathtub',
      imagePromptSeed: 'frosted pane, pale snow reflection, warm sill light, silent air',
      scent: '화이트 머스크',
      lighting: '차가운 확산광 + 웜 포인트',
      colorHex: '#A7B2BF',
      rationale: 'Snow Cabin보다 더 미니멀하고 창가 중심의 정적 테마',
    },
    {
      title: 'Ice Bathhouse',
      destination: 'Ice Bathhouse',
      subtitle: '서늘한 타일 + 증기 기둥',
      environment: 'shower',
      imagePromptSeed: 'cool tile bathhouse, rising steam, pale blue shadow, quiet room',
      scent: '유칼립투스',
      lighting: '서늘한 블루 화이트',
      colorHex: '#92A7BC',
      rationale: '오두막 대신 공용 배스하우스 질감으로 겨울감을 푼 테마',
    },
  ],
  ritual: [
    {
      title: 'Ink Tea Room',
      destination: 'Ink Tea Room',
      subtitle: '먹빛 찻잔 + 조용한 다실',
      environment: 'bathtub',
      imagePromptSeed: 'ink-toned tea bowl, cedar tray, paper lamp, still ritual air',
      scent: '우롱',
      lighting: '부드러운 종이등 조명',
      colorHex: '#64584E',
      rationale: 'Tea House보다 더 절제되고 먹빛 톤의 의식감으로 확장한 테마',
    },
    {
      title: 'Stone Spa Ritual',
      destination: 'Stone Spa',
      subtitle: '스톤 볼 + 허브 스팀',
      environment: 'partial_bath',
      imagePromptSeed: 'stone vessel, herb steam, folded linen, quiet ceremonial spacing',
      scent: '로즈메리',
      lighting: '미지근한 스톤 반사광',
      colorHex: '#7A7066',
      rationale: '차 중심이 아니라 스톤과 리넨 중심의 스파 의식 테마',
    },
  ],
  outdoor: [
    {
      title: 'Lake Tent',
      destination: 'Lake Tent',
      subtitle: '호숫가 텐트 + 안개 호흡',
      environment: 'footbath',
      imagePromptSeed: 'misty lakeside tent, wet fabric, dawn hush, pine edge',
      scent: '파인',
      lighting: '회청색 새벽 랜턴광',
      colorHex: '#5D7680',
      rationale: 'Rainy Camping보다 비를 걷어내고 호수 안개에 집중한 변주',
    },
    {
      title: 'Canyon Rain',
      destination: 'Canyon Rain',
      subtitle: '협곡 빗결 + 젖은 흙내음',
      environment: 'shower',
      imagePromptSeed: 'canyon rain wall, wet clay, distant thunder haze, cool shelter',
      scent: '클레이 세이지',
      lighting: '어두운 비구름 확산광',
      colorHex: '#6A6C63',
      rationale: '캠핑 대신 지형감과 흙내음을 전면에 둔 아웃도어 테마',
    },
  ],
  warm: [
    {
      title: 'Amber Hammam',
      destination: 'Amber Hammam',
      subtitle: '웜 스톤 + 금빛 수증기',
      environment: 'bathtub',
      imagePromptSeed: 'warm stone chamber, amber steam, brass detail, glowing haze',
      scent: '오렌지 블로섬',
      lighting: '금빛 스팀 라이트',
      colorHex: '#B47A3E',
      rationale: 'Desert Onsen과 다른 방향으로 실내 스톤 스파 무드를 강화한 테마',
    },
    {
      title: 'Saffron Sunset',
      destination: 'Saffron Sunset',
      subtitle: '사프란 빛 + 저녁 열기',
      environment: 'partial_bath',
      imagePromptSeed: 'saffron dusk haze, warm linen, low sun reflection, soft heat',
      scent: '샌달우드',
      lighting: '노을 앰버 확산광',
      colorHex: '#C3874F',
      rationale: '사막 지형보다 색 온도와 천 질감 중심으로 설계한 웜 테마',
    },
  ],
};

function buildCandidate(spec, category, existingIds, brief) {
  const themeId = slugify(`${spec.destination}_${spec.title}`);
  const normalizedId = existingIds.has(themeId) ? `${themeId}_v2` : themeId;
  const fitTags = uniqueBy(
    [
      category,
      spec.environment,
      ...(brief.mustIncludeMoodWords ?? []),
      'trip',
    ],
    (value) => value
  );

  return {
    themeId: normalizedId,
    title: spec.title,
    subtitle: spec.subtitle,
    destination: spec.destination,
    category,
    recommendedEnvironment: spec.environment,
    recScent: spec.scent,
    lighting: spec.lighting,
    colorHex: spec.colorHex,
    imagePromptSeed: spec.imagePromptSeed,
    fitTags,
    rationale: spec.rationale,
    contentInput: {
      themeId: normalizedId,
      title: spec.title,
      subtitle: spec.subtitle,
      category,
      destination: spec.destination,
      environment: spec.environment,
      imagePromptSeed: spec.imagePromptSeed,
      recScent: spec.scent,
      lighting: spec.lighting,
      colorHex: spec.colorHex,
    },
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const themesModule = await loadThemesModule();
  const brief = JSON.parse(await readFile(args.brief, 'utf8'));
  const requestedCount = args.count ?? brief.count ?? 8;

  const existingIds = new Set(themesModule.THEMES.map((theme) => theme.id));
  const categories = (brief.categories ?? Object.keys(CATEGORY_LIBRARY)).filter((category) => CATEGORY_LIBRARY[category]);
  const fallbackCandidates = [];
  for (const category of categories) {
    for (const spec of CATEGORY_LIBRARY[category]) {
      fallbackCandidates.push(buildCandidate(spec, category, existingIds, brief));
      if (fallbackCandidates.length >= requestedCount) break;
    }
    if (fallbackCandidates.length >= requestedCount) break;
  }

  let candidates = fallbackCandidates;
  let generationSource = 'fallback_library';
  let generationError = null;

  if (!args.offline) {
    try {
      candidates = await generateCandidatesViaOpenAI(
        args,
        brief,
        themesModule.THEMES,
        existingIds,
        requestedCount
      );
      generationSource = 'openai';
    } catch (error) {
      generationError = error instanceof Error ? error.message : String(error);
    }
  }

  candidates = candidates.filter((candidate) => {
    const haystack = `${candidate.title} ${candidate.subtitle} ${candidate.rationale}`.toLowerCase();
    return !(brief.avoidWords ?? []).some((word) => haystack.includes(String(word).toLowerCase()));
  });

  await mkdir(args.outputDir, { recursive: true });

  const candidatesPath = path.join(args.outputDir, 'trip_theme_candidates.json');
  const generatedThemeListPath = path.join(args.outputDir, 'trip_theme_list.generated.json');

  await Promise.all([
    writeFile(
      candidatesPath,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          requestedCount,
          candidateCount: candidates.length,
          generationSource,
          generationError,
          candidates,
        },
        null,
        2
      )}\n`,
      'utf8'
    ),
    writeFile(
      generatedThemeListPath,
      `${JSON.stringify(candidates.map((candidate) => candidate.contentInput), null, 2)}\n`,
      'utf8'
    ),
  ]);

  console.log(
    JSON.stringify(
      {
        candidatesPath,
        generatedThemeListPath,
        generationSource,
        generationError,
        candidateIds: candidates.map((candidate) => candidate.themeId),
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
