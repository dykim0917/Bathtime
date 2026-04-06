# Trip Card Image Generation

Generated on `2026-03-09` for the `Trip` main routine cards.

## Goal
- Produce 4 photorealistic card-background images for the `Trip` tab.
- Keep the current deep navy / gold UI readable on top of the images.
- Preserve the existing card structure and use the images as background assets.

## Output Targets
- `/Users/exem/DK/BathSommelier/output/imagegen/trip-card-kyoto-forest.png`
- `/Users/exem/DK/BathSommelier/output/imagegen/trip-card-nordic-sauna.png`
- `/Users/exem/DK/BathSommelier/output/imagegen/trip-card-rainy-camping.png`
- `/Users/exem/DK/BathSommelier/output/imagegen/trip-card-snow-cabin.png`

## Shared Generation Rules
- Use case: `photorealistic-natural`
- Asset type: `mobile app trip routine card background`
- Size: `1024x1536`
- Quality: `high`
- Output format: `png`
- No people, no faces, no text, no logos, no watermark
- Premium editorial mood, restrained cinematic lighting
- Safe negative space near the upper area and one side for title / badge readability
- Avoid oversaturation, stock-photo styling, clutter, aggressive perspective, lens flare

## Theme Specs

### Kyoto Forest
- Intent id: `kyoto_forest`
- Output: `trip-card-kyoto-forest.png`
- Primary request:
  `A premium Kyoto forest bath-travel mood for a mobile app card background, wet stone path, bamboo texture, soft green mist, quiet ryokan atmosphere, calm immersive forest air`
- Scene/background:
  `subtle forest path and garden textures, damp stones, layered bamboo and soft mist, no focal human subject`
- Subject:
  `environment-only travel mood background`
- Style/medium:
  `photorealistic editorial travel photography, premium, restrained, cinematic but subtle`
- Composition/framing:
  `vertical mobile card background, stable upper area for UI text, quiet side negative space, atmosphere concentrated toward center and lower half`
- Lighting/mood:
  `low-contrast moody daylight through mist, gentle highlights, calm and immersive`
- Color palette:
  `deep forest green, muted sage, damp stone gray, dark navy-friendly values`
- Materials/textures:
  `wet stone, bamboo grain, mist, soft foliage texture`

### Nordic Sauna
- Intent id: `nordic_sauna`
- Output: `trip-card-nordic-sauna.png`
- Primary request:
  `A premium Nordic sauna mood for a mobile app card background, warm wood interior, soft steam, golden ambient light, dry clean Scandinavian atmosphere`
- Scene/background:
  `minimal wood sauna surfaces, steam haze, warm air, calm interior depth, no people`
- Subject:
  `environment-only travel mood background`
- Style/medium:
  `photorealistic editorial interior photography, premium, restrained, cinematic but subtle`
- Composition/framing:
  `vertical mobile card background, calm readable upper area for UI, one side kept quieter, detail focus in center and lower half`
- Lighting/mood:
  `warm amber glow through steam, soft contrast, clean and comforting`
- Color palette:
  `toasted oak, golden amber, smoky beige, deep brown`
- Materials/textures:
  `warm timber grain, soft steam, smooth bench surfaces`

### Rainy Camping
- Intent id: `rainy_camping`
- Output: `trip-card-rainy-camping.png`
- Primary request:
  `A premium rainy camping mood for a mobile app card background, wet tent canvas, soft lantern glow, rain streaks, cool blue outdoor air with cozy shelter feeling`
- Scene/background:
  `rainy campsite textures, damp fabric, blurred rain atmosphere, cozy lantern accents, no people`
- Subject:
  `environment-only travel mood background`
- Style/medium:
  `photorealistic editorial outdoor photography, premium, restrained, cinematic but subtle`
- Composition/framing:
  `vertical mobile card background, stable upper text area, one quiet side for badges, weather detail centered lower`
- Lighting/mood:
  `cool rainy dusk with small warm lantern contrast, restful and cocooned`
- Color palette:
  `rain blue, slate, muted teal, warm lantern amber`
- Materials/textures:
  `wet canvas, raindrops, soft reflections, diffused foggy air`

### Snow Cabin
- Intent id: `snow_cabin`
- Output: `trip-card-snow-cabin.png`
- Primary request:
  `A premium snow cabin mood for a mobile app card background, frosted window, snowy forest outside, gentle indoor warmth, calm blue-gray winter atmosphere`
- Scene/background:
  `cabin interior edge, frosted glass, soft snowy landscape beyond, quiet winter air, no people`
- Subject:
  `environment-only travel mood background`
- Style/medium:
  `photorealistic editorial winter interior photography, premium, restrained, cinematic but subtle`
- Composition/framing:
  `vertical mobile card background, clean upper area for UI text, one side negative space, atmosphere concentrated in center and lower half`
- Lighting/mood:
  `soft winter daylight with subtle interior warmth, peaceful and settled`
- Color palette:
  `blue-gray, snow white, desaturated steel, warm dim interior amber`
- Materials/textures:
  `frosted glass, wood trim, snow texture, soft interior glow`

## Execution Command
Use the bundled skill CLI after `OPENAI_API_KEY` is exported:

```bash
python3 /Users/exem/.codex/skills/imagegen/scripts/image_gen.py generate-batch \
  --input /Users/exem/DK/BathSommelier/tmp/imagegen/trip-card-batch.jsonl \
  --out-dir /Users/exem/DK/BathSommelier/output/imagegen \
  --quality high \
  --size 1024x1536 \
  --output-format png \
  --force
```

## Current Blocker
- `OPENAI_API_KEY` is not present in the current shell environment, so live generation could not be executed yet.
