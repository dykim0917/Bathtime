import { formatDuration, readAdminAudioRows } from './audioData';
import { readAdminCareRows } from './careData';
import { readAdminProductRows } from './productsData';
import { readAdminTripRows } from './tripData';

type ReleasePreviewKind = 'Product' | 'Care' | 'Trip' | 'Audio';

export interface ReleasePreviewCard {
  id: string;
  kind: ReleasePreviewKind;
  title: string;
  subtitle: string;
  detail: string;
  meta: string;
}

export interface ReleasePreviewSection {
  title: string;
  cards: ReleasePreviewCard[];
}

export interface ReleasePreviewViewModel {
  sections: ReleasePreviewSection[];
  totalCards: number;
}

const previewLimit = 3;

function takeActive<T extends { status: string }>(rows: T[]): T[] {
  return rows.filter((row) => row.status === 'active').slice(0, previewLimit);
}

export async function buildReleasePreviewViewModel(): Promise<ReleasePreviewViewModel> {
  const [products, careRoutines, tripThemes, audioTracks] = await Promise.all([
    readAdminProductRows(),
    readAdminCareRows(),
    readAdminTripRows(),
    readAdminAudioRows(),
  ]);

  const sections: ReleasePreviewSection[] = [
    {
      title: 'Products',
      cards: takeActive(products).map((product) => ({
        id: product.id,
        kind: 'Product',
        title: product.name,
        subtitle: `${product.brand} · ${product.category}`,
        detail: product.summary,
        meta: `${product.tags.slice(0, 2).join(', ') || 'No tags'} · ${product.activeListings} listing`,
      })),
    },
    {
      title: 'Care',
      cards: takeActive(careRoutines).map((routine) => ({
        id: routine.id,
        kind: 'Care',
        title: routine.title,
        subtitle: routine.mode,
        detail: routine.environments.join(', '),
        meta: `${routine.subprotocols} subprotocols · ${routine.safetyNote || 'No safety note'}`,
      })),
    },
    {
      title: 'Trip',
      cards: takeActive(tripThemes).map((theme) => ({
        id: theme.id,
        kind: 'Trip',
        title: theme.title,
        subtitle: `${theme.environment} · ${theme.baseTemp}C`,
        detail: theme.lighting,
        meta: `${theme.durationMinutes} min · ${theme.musicId}`,
      })),
    },
    {
      title: 'Audio',
      cards: takeActive(audioTracks).map((track) => ({
        id: track.id,
        kind: 'Audio',
        title: track.title,
        subtitle: `${track.type} · ${track.source}`,
        detail: track.personaCodes.join(', ') || 'No persona',
        meta: `${formatDuration(track.durationSeconds)} · ${track.linkedRoutineCount} links`,
      })),
    },
  ];

  return {
    sections,
    totalCards: sections.reduce((total, section) => total + section.cards.length, 0),
  };
}
