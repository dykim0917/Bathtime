import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const audioDir = path.join(rootDir, 'assets', 'audio');
const sampleRate = 12000;
const durationSeconds = 24;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function writeWav(filePath, samples, rate) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < samples.length; index += 1) {
    const sample = clamp(samples[index], -1, 1);
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + index * 2);
  }

  fs.writeFileSync(filePath, buffer);
}

function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function makeEnvelope(progress) {
  const fade = 0.06;
  const fadeIn = progress < fade ? progress / fade : 1;
  const fadeOut = progress > 1 - fade ? (1 - progress) / fade : 1;
  return Math.min(fadeIn, fadeOut);
}

function createPadTrack({
  seed,
  rootHz,
  chord = [1, 1.25, 1.5],
  shimmer = 0.08,
  warmth = 0.12,
  pulseHz = 0.08,
  driftDepth = 0.003,
  noiseAmount = 0.01,
}) {
  const length = sampleRate * durationSeconds;
  const samples = new Float32Array(length);
  const random = createSeededRandom(seed);
  let smoothNoise = 0;

  for (let index = 0; index < length; index += 1) {
    const t = index / sampleRate;
    const progress = index / length;
    const envelope = makeEnvelope(progress);
    const pulse = 0.88 + 0.12 * Math.sin(2 * Math.PI * pulseHz * t);

    let harmonic = 0;
    chord.forEach((ratio, chordIndex) => {
      const frequency = rootHz * ratio;
      const drift =
        frequency *
        driftDepth *
        Math.sin(2 * Math.PI * (0.03 + chordIndex * 0.013) * t + chordIndex * 1.3);
      harmonic +=
        (0.42 / (chordIndex + 1)) *
        Math.sin(2 * Math.PI * (frequency + drift) * t + chordIndex * 0.4);
    });

    const shimmerLayer =
      shimmer *
      Math.sin(2 * Math.PI * rootHz * 2 * t + 0.35 * Math.sin(2 * Math.PI * 0.12 * t));
    const warmthLayer = warmth * Math.sin(2 * Math.PI * rootHz * 0.5 * t);

    smoothNoise = smoothNoise * 0.985 + ((random() * 2 - 1) * noiseAmount);

    samples[index] = envelope * pulse * (harmonic + shimmerLayer + warmthLayer + smoothNoise);
  }

  return samples;
}

function createRainTrack(seed) {
  const length = sampleRate * durationSeconds;
  const samples = new Float32Array(length);
  const random = createSeededRandom(seed);
  let bed = 0;
  let droplets = 0;

  for (let index = 0; index < length; index += 1) {
    const t = index / sampleRate;
    const progress = index / length;
    const envelope = makeEnvelope(progress);

    bed = bed * 0.86 + (random() * 2 - 1) * 0.08;

    if (random() > 0.9974) {
      droplets += 0.35 + random() * 0.22;
    }
    droplets *= 0.985;

    const airy = 0.03 * Math.sin(2 * Math.PI * 430 * t);
    samples[index] = envelope * (bed * 0.65 + droplets * airy);
  }

  return samples;
}

function createOceanTrack(seed) {
  const length = sampleRate * durationSeconds;
  const samples = new Float32Array(length);
  const random = createSeededRandom(seed);
  let swellNoise = 0;

  for (let index = 0; index < length; index += 1) {
    const t = index / sampleRate;
    const progress = index / length;
    const envelope = makeEnvelope(progress);
    const swell = 0.45 + 0.35 * Math.sin(2 * Math.PI * 0.09 * t);
    swellNoise = swellNoise * 0.992 + (random() * 2 - 1) * 0.028;

    const foam = 0.02 * Math.sin(2 * Math.PI * 190 * t + 0.7 * Math.sin(2 * Math.PI * 0.11 * t));
    samples[index] = envelope * (swellNoise * swell + foam);
  }

  return samples;
}

function createForestTrack(seed) {
  const length = sampleRate * durationSeconds;
  const samples = new Float32Array(length);
  const random = createSeededRandom(seed);
  let wind = 0;

  for (let index = 0; index < length; index += 1) {
    const t = index / sampleRate;
    const progress = index / length;
    const envelope = makeEnvelope(progress);

    wind = wind * 0.985 + (random() * 2 - 1) * 0.04;
    let chirp = 0;
    if (Math.sin(2 * Math.PI * 0.17 * t) > 0.995) {
      chirp = 0.08 * Math.sin(2 * Math.PI * (820 + 180 * Math.sin(2 * Math.PI * 6 * t)) * t);
    }

    samples[index] = envelope * (wind * 0.65 + chirp);
  }

  return samples;
}

function createHotspringTrack(seed) {
  const length = sampleRate * durationSeconds;
  const samples = new Float32Array(length);
  const random = createSeededRandom(seed);
  let water = 0;
  let bubble = 0;

  for (let index = 0; index < length; index += 1) {
    const t = index / sampleRate;
    const progress = index / length;
    const envelope = makeEnvelope(progress);

    water = water * 0.975 + (random() * 2 - 1) * 0.032;
    if (random() > 0.9982) {
      bubble += 0.22 + random() * 0.18;
    }
    bubble *= 0.978;

    const bubbleTone = Math.sin(2 * Math.PI * (210 + 80 * Math.sin(2 * Math.PI * 3.2 * t)) * t);
    samples[index] = envelope * (water * 0.62 + bubble * 0.06 * bubbleTone);
  }

  return samples;
}

function createFireplaceTrack(seed) {
  const length = sampleRate * durationSeconds;
  const samples = new Float32Array(length);
  const random = createSeededRandom(seed);
  let hum = 0;
  let crackle = 0;

  for (let index = 0; index < length; index += 1) {
    const t = index / sampleRate;
    const progress = index / length;
    const envelope = makeEnvelope(progress);

    hum = hum * 0.994 + (random() * 2 - 1) * 0.012;
    if (random() > 0.9977) {
      crackle += 0.4 + random() * 0.3;
    }
    crackle *= 0.94;

    const ember = 0.05 * Math.sin(2 * Math.PI * 96 * t);
    samples[index] = envelope * (hum * 0.5 + crackle * 0.04 + ember);
  }

  return samples;
}

const musicDefinitions = [
  ['care/care_muscle_relief.wav', createPadTrack({ seed: 11, rootHz: 110, chord: [1, 1.5, 1.75], shimmer: 0.04, warmth: 0.18, pulseHz: 0.06 })],
  ['care/care_sleep_ready.wav', createPadTrack({ seed: 22, rootHz: 82.4, chord: [1, 1.333, 1.5], shimmer: 0.09, warmth: 0.14, pulseHz: 0.04 })],
  ['care/care_hangover_relief.wav', createPadTrack({ seed: 33, rootHz: 130.8, chord: [1, 1.25, 1.5], shimmer: 0.05, warmth: 0.16, pulseHz: 0.08 })],
  ['care/care_edema_relief.wav', createPadTrack({ seed: 44, rootHz: 98, chord: [1, 1.2, 1.5], shimmer: 0.06, warmth: 0.17, pulseHz: 0.07 })],
  ['care/care_cold_relief.wav', createPadTrack({ seed: 55, rootHz: 116.5, chord: [1, 1.333, 1.6], shimmer: 0.07, warmth: 0.14, pulseHz: 0.09 })],
  ['care/care_menstrual_relief.wav', createPadTrack({ seed: 66, rootHz: 92.5, chord: [1, 1.25, 1.5], shimmer: 0.05, warmth: 0.19, pulseHz: 0.05 })],
  ['care/care_stress_relief.wav', createPadTrack({ seed: 77, rootHz: 87.3, chord: [1, 1.333, 1.667], shimmer: 0.08, warmth: 0.13, pulseHz: 0.05 })],
  ['care/care_mood_lift.wav', createPadTrack({ seed: 88, rootHz: 146.8, chord: [1, 1.25, 1.5], shimmer: 0.07, warmth: 0.12, pulseHz: 0.11 })],
  ['trip/trip_kyoto_forest.wav', createPadTrack({ seed: 101, rootHz: 98, chord: [1, 1.333, 1.778], shimmer: 0.08, warmth: 0.12, pulseHz: 0.05 })],
  ['trip/trip_rainy_camping.wav', createPadTrack({ seed: 202, rootHz: 87.3, chord: [1, 1.25, 1.5], shimmer: 0.05, warmth: 0.16, pulseHz: 0.04 })],
  ['trip/trip_midnight_paris.wav', createPadTrack({ seed: 303, rootHz: 123.5, chord: [1, 1.333, 1.667], shimmer: 0.07, warmth: 0.11, pulseHz: 0.06 })],
  ['trip/trip_nordic_sauna.wav', createPadTrack({ seed: 404, rootHz: 110, chord: [1, 1.5, 1.875], shimmer: 0.05, warmth: 0.17, pulseHz: 0.07 })],
  ['trip/trip_desert_onsen.wav', createPadTrack({ seed: 505, rootHz: 103.8, chord: [1, 1.25, 1.6], shimmer: 0.04, warmth: 0.18, pulseHz: 0.09 })],
  ['trip/trip_ocean_dawn.wav', createPadTrack({ seed: 606, rootHz: 92.5, chord: [1, 1.333, 1.5], shimmer: 0.08, warmth: 0.13, pulseHz: 0.06 })],
  ['trip/trip_tea_house.wav', createPadTrack({ seed: 707, rootHz: 98, chord: [1, 1.2, 1.5], shimmer: 0.06, warmth: 0.15, pulseHz: 0.05 })],
  ['trip/trip_snow_cabin.wav', createPadTrack({ seed: 808, rootHz: 82.4, chord: [1, 1.5, 1.75], shimmer: 0.04, warmth: 0.17, pulseHz: 0.04 })],
  ['ambience/rain.wav', createRainTrack(901)],
  ['ambience/ocean.wav', createOceanTrack(902)],
  ['ambience/forest.wav', createForestTrack(903)],
  ['ambience/hotspring.wav', createHotspringTrack(904)],
  ['ambience/fireplace.wav', createFireplaceTrack(905)],
];

ensureDir(path.join(audioDir, 'care'));
ensureDir(path.join(audioDir, 'trip'));
ensureDir(path.join(audioDir, 'ambience'));

for (const [relativePath, samples] of musicDefinitions) {
  const filePath = path.join(audioDir, relativePath);
  writeWav(filePath, samples, sampleRate);
  console.log(`generated ${path.relative(rootDir, filePath)}`);
}
