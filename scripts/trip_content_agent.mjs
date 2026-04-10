import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const inputDir = path.join(rootDir, 'input');
const outputDir = path.join(rootDir, 'output');
const themesSourcePath = path.join(rootDir, 'src', 'data', 'themes.ts');

function parseArgs(argv) {
  const args = {
    input: path.join(inputDir, 'theme_list.json'),
    template: path.join(inputDir, 'theme_profile_template.json'),
    firewall: path.join(inputDir, 'copy_firewall_rules.json'),
    outputDir,
    themeId: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];
    if (token === '--input' && next) {
      args.input = path.isAbsolute(next) ? next : path.join(rootDir, next);
      index += 1;
      continue;
    }
    if (token === '--template' && next) {
      args.template = path.isAbsolute(next) ? next : path.join(rootDir, next);
      index += 1;
      continue;
    }
    if (token === '--firewall' && next) {
      args.firewall = path.isAbsolute(next) ? next : path.join(rootDir, next);
      index += 1;
      continue;
    }
    if ((token === '--theme' || token === '--theme-id') && next) {
      args.themeId = next;
      index += 1;
      continue;
    }
    if ((token === '--output-dir' || token === '--out-dir') && next) {
      args.outputDir = path.isAbsolute(next) ? next : path.join(rootDir, next);
      index += 1;
    }
  }

  return args;
}

async function loadThemesModule() {
  const source = await readFile(themesSourcePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      baseUrl: rootDir,
      paths: {
        '@/*': ['*'],
      },
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

function slugToWords(value) {
  return value
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

function synthesizeTheme(inputTheme) {
  const normalizedEnvironment = inputTheme.environment || 'bathtub';
  const title = inputTheme.title || slugToWords(inputTheme.themeId || inputTheme.destination || 'trip_theme');

  return {
    id: inputTheme.themeId,
    title,
    subtitle: inputTheme.subtitle || `${inputTheme.destination || title} + 감각 몰입`,
    baseTemp: normalizedEnvironment === 'shower' ? 38 : 39,
    colorHex: inputTheme.colorHex || '#5E6B7A',
    recScent: inputTheme.recScent || '우디 머스크',
    recommendedEnvironment: normalizedEnvironment,
    durationMinutes: normalizedEnvironment === 'shower' ? 10 : 18,
    lighting: inputTheme.lighting || '차분한 확산 조명',
  };
}

function pickCategoryDetail(category) {
  const details = {
    nature: {
      liteMood: '조용한 숲결이 천천히 열리며 시선이 안쪽으로 정돈되는 흐름',
      deepMood: '안개와 나무 결이 겹겹이 쌓이듯 몰입이 깊어지는 여정',
      water: '잔잔한 파동 위로 리듬이 길게 이어지는 흐름',
      materials: 'bamboo grain, wet stone, layered mist',
      palette: 'deep forest green, muted sage, damp stone gray',
      sound: ['forest_air', 'soft_water', 'bamboo_resonance'],
    },
    outdoor: {
      liteMood: '비를 피해 들어온 작은 쉼터처럼 감각을 단정히 모으는 흐름',
      deepMood: '젖은 공기와 작은 불빛이 겹치며 외부 소음이 멀어지는 여정',
      water: '빗결 같은 점묘 리듬이 짧게 스치고 잔향이 남는 흐름',
      materials: 'wet canvas, rain droplets, lantern glow',
      palette: 'rain blue, slate, muted teal, warm lantern amber',
      sound: ['rain_canopy', 'night_insects', 'lantern_hum'],
    },
    urban: {
      liteMood: '도시의 밤을 얇게 덮는 재즈 잔광처럼 감각을 부드럽게 전환하는 흐름',
      deepMood: '늦은 도시의 조도와 리듬이 천천히 멀어지며 고요가 남는 여정',
      water: '벨벳 같은 잔광 위로 작은 파동이 반복되는 흐름',
      materials: 'wet pavement reflection, velvet shadow, brass glow',
      palette: 'deep plum, midnight navy, dim gold, smoky rose',
      sound: ['jazz_room_tone', 'city_rain_reflection', 'night_air'],
    },
    cozy: {
      liteMood: '따뜻한 목재와 스팀의 숨결이 빠르게 긴장을 낮추는 흐름',
      deepMood: '건조한 온기와 부드러운 증기가 층을 만들며 밀도 있게 머무는 여정',
      water: '스팀이 감싸듯 둥글게 퍼지는 흐름',
      materials: 'warm timber grain, soft steam, smooth bench surfaces',
      palette: 'toasted oak, amber, smoky beige, deep brown',
      sound: ['soft_steam', 'timber_room_tone', 'low_ambient'],
    },
    warm: {
      liteMood: '노을의 잔광이 표면을 천천히 데우듯 전환되는 흐름',
      deepMood: '건조한 공기와 광물성 온기가 겹치며 느린 몰입을 만드는 여정',
      water: '미지근한 파동이 넓게 번져나가는 흐름',
      materials: 'sun-warmed stone, dry sand texture, amber haze',
      palette: 'amber orange, mineral beige, dusk rose, warm sand',
      sound: ['desert_wind', 'mineral_resonance', 'slow_drone'],
    },
    coastal: {
      liteMood: '새벽 해안선처럼 호흡을 고르게 맞추는 밝은 전환',
      deepMood: '옅은 파도와 먼 수평선이 겹치며 리듬이 길게 정돈되는 여정',
      water: '얇은 물결이 반복되며 숨결처럼 이어지는 흐름',
      materials: 'sea mist, pale water surface, smooth stone',
      palette: 'sea blue, pale aqua, mist gray, dawn silver',
      sound: ['shoreline_waves', 'early_breeze', 'glass_bell_pad'],
    },
    ritual: {
      liteMood: '차향이 번지듯 조용히 집중점을 모으는 흐름',
      deepMood: '종이 등과 목재 결 사이로 작은 의식감이 이어지는 여정',
      water: '잔을 채우듯 정갈하게 차오르는 흐름',
      materials: 'wood grain, tea steam, paper light, ceramic texture',
      palette: 'bergamot gold, tea brown, parchment cream, cedar',
      sound: ['tea_room_air', 'porcelain_tap', 'soft_string_pad'],
    },
    winter: {
      liteMood: '서늘한 창가와 실내 온기가 선명한 대비를 만드는 전환',
      deepMood: '차가운 바깥 풍경과 실내 잔광이 교차하며 안정적으로 가라앉는 여정',
      water: '온기 어린 파동이 천천히 퍼져 바깥의 서늘함과 대비되는 흐름',
      materials: 'frosted glass, wood trim, snow texture, soft glow',
      palette: 'blue-gray, snow white, steel, dim amber',
      sound: ['distant_snow_wind', 'fireplace_low', 'cabin_room_tone'],
    },
  };

  return details[category] ?? {
    liteMood: '차분한 전환을 만드는 흐름',
    deepMood: '깊은 몰입으로 이어지는 여정',
    water: '부드러운 파동이 이어지는 흐름',
    materials: 'soft texture, layered atmosphere',
    palette: 'navy, muted gold, soft gray',
    sound: ['ambient_pad', 'soft_water', 'room_tone'],
  };
}

function buildSoundLayers(layerIds) {
  return layerIds.map((layer, index) => ({
    layer,
    role: index === 0 ? 'primary' : index === 1 ? 'secondary' : 'accent',
    volumeRatio: index === 0 ? 0.6 : index === 1 ? 0.3 : 0.1,
  }));
}

function buildImageDirection(theme, inputTheme, detail, depth) {
  const intensity = depth === 'lite' ? 'restrained' : 'immersive';
  return {
    primaryPrompt: `A premium ${theme.title} bath-travel mood for a mobile app card background, ${inputTheme.imagePromptSeed}, ${intensity} editorial atmosphere`,
    scene: `${theme.subtitle}, no people, no faces, calm environment-only scene`,
    style: `photorealistic editorial ${inputTheme.category} travel imagery, premium, restrained, cinematic but subtle`,
    lightingMood: depth === 'lite'
      ? `${theme.lighting}, soft contrast, readable upper area`
      : `${theme.lighting}, layered atmosphere, deeper contrast in lower half`,
    palette: detail.palette,
    materials: detail.materials,
  };
}

function buildDepthProfile(theme, inputTheme, detail, depth) {
  const isLite = depth === 'lite';
  return {
    narrativeDescription: isLite
      ? `${inputTheme.destination}의 ${detail.liteMood}. ${theme.recScent}의 결만 가볍게 얹어 짧은 전환을 돕는 트립 루틴입니다.`
      : `${inputTheme.destination}의 ${detail.deepMood}. ${theme.recScent} 향과 ${theme.lighting}이 겹치며 감각의 결이 천천히 안쪽으로 모입니다.`,
    lightingProfile: isLite
      ? `${theme.lighting}을 중심으로 밝기 변화는 작게 유지하고 상단 가독성을 확보합니다.`
      : `${theme.lighting}을 기반으로 잔광과 그림자 층을 넓혀 몰입의 깊이를 만듭니다.`,
    scentProfile: isLite ? [theme.recScent] : [theme.recScent, '스팀 머스크'],
    temperatureMood: isLite
      ? `${theme.baseTemp - 1}~${theme.baseTemp}°C 사이의 온기로 빠르게 톤을 맞춥니다.`
      : `${theme.baseTemp}°C 전후의 온기가 천천히 퍼지며 분위기 전환의 밀도를 높입니다.`,
    waterBehaviorStyle: detail.water,
    visualMotionStyle: isLite
      ? '모션은 작고 안정적으로 유지하며 카드 텍스트 가독성을 우선합니다.'
      : '미세한 입자, 증기, 잔광 레이어를 더해도 중심 피사체 없이 차분한 구성을 유지합니다.',
    ambientSoundLayer: buildSoundLayers(detail.sound),
    tripCtaCopy: isLite
      ? `${inputTheme.destination} 무드로 ${isLite ? '가볍게 전환하기' : '몰입 시작하기'}`
      : `${inputTheme.destination} 무드로 깊게 머물러보기`,
    timeExpectationMinutes: isLite ? { min: 3, max: 7 } : { min: 10, max: 20 },
    interactionDensity: isLite ? 'low' : 'high',
    imageDirection: buildImageDirection(theme, inputTheme, detail, depth),
  };
}

function collectTextForFirewall(profile) {
  return [
    profile.themeTitle,
    profile.destination,
    profile.lite.narrativeDescription,
    profile.lite.lightingProfile,
    profile.lite.temperatureMood,
    profile.lite.waterBehaviorStyle,
    profile.lite.visualMotionStyle,
    profile.lite.tripCtaCopy,
    profile.deep.narrativeDescription,
    profile.deep.lightingProfile,
    profile.deep.temperatureMood,
    profile.deep.waterBehaviorStyle,
    profile.deep.visualMotionStyle,
    profile.deep.tripCtaCopy,
  ].join('\n');
}

function applyFirewall(profile, firewall) {
  const text = collectTextForFirewall(profile);
  const violations = firewall.forbiddenTerms
    .filter((term) => text.includes(term))
    .map((term) => ({
      term,
      replacementHint: firewall.replacementHints?.[term],
    }));

  return {
    passed: violations.length === 0,
    violations,
  };
}

function buildContentProfile(theme, inputTheme, template) {
  const detail = pickCategoryDetail(inputTheme.category);
  return {
    ...structuredClone(template),
    themeId: theme.id,
    themeTitle: theme.title,
    destination: inputTheme.destination || slugToWords(theme.id),
    category: inputTheme.category,
    environment: inputTheme.environment || theme.recommendedEnvironment,
    themeColorHex: theme.colorHex,
    sourceTheme: {
      subtitle: theme.subtitle,
      recommendedScent: theme.recScent,
      lighting: theme.lighting,
      durationMinutes: theme.durationMinutes,
    },
    lite: buildDepthProfile(theme, inputTheme, detail, 'lite'),
    deep: buildDepthProfile(theme, inputTheme, detail, 'deep'),
  };
}

function buildBibleEntry(profile) {
  return [
    `## ${profile.themeTitle}`,
    `- Theme ID: \`${profile.themeId}\``,
    `- Destination: ${profile.destination}`,
    `- Category: ${profile.category}`,
    `- Environment: ${profile.environment}`,
    `- Lite narrative: ${profile.lite.narrativeDescription}`,
    `- Deep narrative: ${profile.deep.narrativeDescription}`,
    `- Lite CTA: ${profile.lite.tripCtaCopy}`,
    `- Deep CTA: ${profile.deep.tripCtaCopy}`,
    `- Sound layers: ${profile.deep.ambientSoundLayer.map((layer) => layer.layer).join(', ')}`,
    '',
  ].join('\n');
}

function buildConsistencyReport(packs) {
  const usage = new Map();

  for (const pack of packs) {
    const signature = pack.deep.ambientSoundLayer.map((layer) => layer.layer).join('+');
    const themes = usage.get(signature) ?? [];
    themes.push(pack.themeId);
    usage.set(signature, themes);
  }

  const repeatedSignatures = Array.from(usage.entries())
    .filter(([, themes]) => themes.length >= 3)
    .map(([signature, themes]) => ({
      signature,
      themes,
      severity: 'warning',
      reason: 'ambient_sound_layer_reused_3_or_more_times',
    }));

  return {
    generatedAt: new Date().toISOString(),
    repeatedSignatures,
    themeCount: packs.length,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const themesModule = await loadThemesModule();
  const [themeListRaw, templateRaw, firewallRaw] = await Promise.all([
    readFile(args.input, 'utf8'),
    readFile(args.template, 'utf8'),
    readFile(args.firewall, 'utf8'),
  ]);

  const themeList = JSON.parse(themeListRaw);
  const template = JSON.parse(templateRaw);
  const firewall = JSON.parse(firewallRaw);
  const themeById = new Map(themesModule.THEMES.map((theme) => [theme.id, theme]));
  const targets = args.themeId
    ? themeList.filter((item) => item.themeId === args.themeId)
    : themeList;

  if (targets.length === 0) {
    throw new Error(`No theme found for selection: ${args.themeId ?? 'all'}`);
  }

  await mkdir(args.outputDir, { recursive: true });

  const acceptedPacks = [];
  const rejectedPacks = [];
  const runLog = [];

  for (const inputTheme of targets) {
    const theme = themeById.get(inputTheme.themeId) ?? synthesizeTheme(inputTheme);

    const profile = buildContentProfile(theme, inputTheme, template);
    const firewallResult = applyFirewall(profile, firewall);

    if (!firewallResult.passed) {
      runLog.push({
        themeId: inputTheme.themeId,
        status: 'rejected',
        reason: 'copy_firewall_failed',
        violations: firewallResult.violations,
      });
      rejectedPacks.push({
        themeId: inputTheme.themeId,
        reason: 'copy_firewall_failed',
        violations: firewallResult.violations,
      });
      continue;
    }

    const outputPath = path.join(args.outputDir, `trip_content_pack_${theme.id}.json`);
    await writeFile(outputPath, `${JSON.stringify(profile, null, 2)}\n`, 'utf8');
    acceptedPacks.push(profile);
    runLog.push({
      themeId: theme.id,
      status: 'generated',
      outputPath,
    });
  }

  const bible = [
    '# Trip Content Bible',
    '',
    `Generated on \`${new Date().toISOString().slice(0, 10)}\` by \`scripts/trip_content_agent.mjs\`.`,
    '',
    ...acceptedPacks.map((pack) => buildBibleEntry(pack)),
  ].join('\n');

  const consistencyReport = buildConsistencyReport(acceptedPacks);
  await Promise.all([
    writeFile(path.join(args.outputDir, 'trip_content_bible.md'), `${bible}\n`, 'utf8'),
    writeFile(
      path.join(args.outputDir, 'consistency_report.json'),
      `${JSON.stringify(consistencyReport, null, 2)}\n`,
      'utf8'
    ),
    writeFile(
      path.join(args.outputDir, 'rejected_contents.json'),
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          rejected: rejectedPacks,
        },
        null,
        2
      )}\n`,
      'utf8'
    ),
    writeFile(
      path.join(args.outputDir, 'run_log.json'),
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          runLog,
        },
        null,
        2
      )}\n`,
      'utf8'
    ),
  ]);

  console.log(
    JSON.stringify(
      {
        generatedThemes: acceptedPacks.map((pack) => pack.themeId),
        rejectedThemes: rejectedPacks.map((pack) => pack.themeId),
        outputDir: args.outputDir,
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
