import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const contentOutputDir = path.join(rootDir, 'output');
const imageOutputDir = path.join(contentOutputDir, 'imagegen');
const tempImageDir = path.join(rootDir, 'tmp', 'imagegen');
const imageCliPath = '/Users/exem/.codex/skills/imagegen/scripts/image_gen.py';

function parseArgs(argv) {
  const args = {
    inputDir: contentOutputDir,
    batchFile: path.join(tempImageDir, 'trip-card-batch.jsonl'),
    outputDir: imageOutputDir,
    themeId: undefined,
    generate: false,
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];
    if ((token === '--input-dir' || token === '--content-dir') && next) {
      args.inputDir = path.isAbsolute(next) ? next : path.join(rootDir, next);
      index += 1;
      continue;
    }
    if ((token === '--output-dir' || token === '--out-dir') && next) {
      args.outputDir = path.isAbsolute(next) ? next : path.join(rootDir, next);
      index += 1;
      continue;
    }
    if ((token === '--batch-file' || token === '--output-batch') && next) {
      args.batchFile = path.isAbsolute(next) ? next : path.join(rootDir, next);
      index += 1;
      continue;
    }
    if ((token === '--theme' || token === '--theme-id') && next) {
      args.themeId = next;
      index += 1;
      continue;
    }
    if (token === '--generate') {
      args.generate = true;
      continue;
    }
    if (token === '--force') {
      args.force = true;
    }
  }

  return args;
}

function sanitizeThemeId(value) {
  return value.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
}

async function loadContentPacks(inputDir, themeId) {
  const files = (await readdir(inputDir))
    .filter((file) => file.startsWith('trip_content_pack_') && file.endsWith('.json'))
    .filter((file) => (themeId ? file === `trip_content_pack_${themeId}.json` : true))
    .map((file) => path.join(inputDir, file));

  const payloads = [];
  for (const file of files) {
    const raw = await readFile(file, 'utf8');
    payloads.push(JSON.parse(raw));
  }
  return payloads;
}

function buildBatchLine(pack, outputDir) {
  const imageDirection = pack.deep.imageDirection;
  const outputPath = path.join(outputDir, `trip-card-${sanitizeThemeId(pack.themeId)}.png`);

  return {
    prompt: imageDirection.primaryPrompt,
    use_case: 'photorealistic-natural',
    scene: imageDirection.scene,
    subject: 'environment-only travel mood background',
    style: imageDirection.style,
    composition: 'vertical mobile card background, stable upper area for UI text, quiet side negative space',
    lighting: imageDirection.lightingMood,
    palette: imageDirection.palette,
    materials: imageDirection.materials,
    constraints: 'mobile app trip routine card background; no people; no faces; no text; no logos; no watermark; preserve title and badge readability; dark-friendly contrast; crop-safe composition',
    negative: 'oversaturation, stock-photo vibe, clutter, harsh bloom, lens flare, aggressive perspective distortion',
    size: '1024x1536',
    quality: 'high',
    output_format: 'png',
    out: outputPath,
    meta: {
      themeId: pack.themeId,
      title: pack.themeTitle,
      destination: pack.destination,
    },
  };
}

function runImageCli(batchFile, outputDir, force) {
  return new Promise((resolve, reject) => {
    const args = [
      imageCliPath,
      'generate-batch',
      '--input',
      batchFile,
      '--out-dir',
      outputDir,
      '--quality',
      'high',
      '--size',
      '1024x1536',
      '--output-format',
      'png',
    ];

    if (force) {
      args.push('--force');
    }

    const child = spawn('python3', args, {
      cwd: rootDir,
      stdio: 'inherit',
      env: process.env,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Image generation exited with code ${code}`));
    });
  });
}

function checkPythonDependency(moduleName) {
  return new Promise((resolve) => {
    const child = spawn('python3', ['-c', `import importlib.util; raise SystemExit(0 if importlib.util.find_spec('${moduleName}') else 1)`], {
      cwd: rootDir,
      stdio: 'ignore',
      env: process.env,
    });

    child.on('error', () => resolve(false));
    child.on('exit', (code) => resolve(code === 0));
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const packs = await loadContentPacks(args.inputDir, args.themeId);

  if (packs.length === 0) {
    throw new Error(`No generated trip content packs found in ${args.inputDir}`);
  }

  await Promise.all([
    mkdir(path.dirname(args.batchFile), { recursive: true }),
    mkdir(args.outputDir, { recursive: true }),
  ]);

  const batchLines = packs.map((pack) => buildBatchLine(pack, args.outputDir));
  const batchFileContents = `${batchLines.map((line) => JSON.stringify(line)).join('\n')}\n`;
  await writeFile(args.batchFile, batchFileContents, 'utf8');

  const manifestPath = path.join(args.outputDir, 'trip-image-manifest.json');
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        batchFile: args.batchFile,
        images: batchLines.map(({ meta, out, ...line }) => ({
          ...meta,
          out,
          prompt: line.prompt,
        })),
      },
      null,
      2
    )}\n`,
    'utf8'
  );

  let generationStatus = 'batch_prepared';
  if (args.generate) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required when --generate is used.');
    }
    const hasOpenAiSdk = await checkPythonDependency('openai');
    if (!hasOpenAiSdk) {
      throw new Error(
        [
          'Python package `openai` is not installed for the current `python3` runtime.',
          'Install it with:',
          '`python3 -m pip install --user openai`',
          'Then re-run:',
          '`npm run trip:image -- --generate --force`',
        ].join('\n')
      );
    }
    await runImageCli(args.batchFile, args.outputDir, args.force);
    generationStatus = 'images_generated';
  }

  console.log(
    JSON.stringify(
      {
        generationStatus,
        batchFile: args.batchFile,
        manifestPath,
        imageCount: batchLines.length,
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
