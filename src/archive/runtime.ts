import { useEffect, useMemo, useState } from 'react';

import {
  archiveContentDbSelect,
  mapArchiveContentDbRow,
  type ArchiveContentDbRow,
} from '@/src/archive/archiveContentMapper';
import { type ArchiveContentApiResponse } from '@/src/contracts/archiveContentApi';
import { archiveContents } from '@/src/archive/seed';
import { type ArchiveContent, type ContentCategory } from '@/src/archive/types';

type ArchiveHydrationStatus = 'fallback' | 'loading' | 'remote';

const DEFAULT_ARCHIVE_CONTENTS = archiveContents.filter((content) => content.isPublished);

let runtimeArchiveContents = DEFAULT_ARCHIVE_CONTENTS;
let hasRemoteArchiveContents = false;
let remoteArchiveAttempted = false;
let remoteArchivePromise: Promise<ArchiveContent[]> | null = null;

function getArchiveContentApiUrl(): string | undefined {
  return process.env.EXPO_PUBLIC_ARCHIVE_CONTENT_API_URL?.trim() || undefined;
}

function getSupabaseArchiveContentApiUrl(): string | undefined {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) return undefined;

  const url = new URL(`${supabaseUrl.replace(/\/+$/, '')}/rest/v1/archive_content`);
  url.searchParams.set('select', archiveContentDbSelect);
  url.searchParams.set('status', 'eq.active');
  url.searchParams.set('is_published', 'eq.true');
  url.searchParams.set('order', 'content_updated_at.desc,id.asc');
  return url.toString();
}

function getArchiveContentRequest():
  | { url: string; headers?: Record<string, string> }
  | undefined {
  const apiUrl = getArchiveContentApiUrl();
  if (apiUrl) return { url: apiUrl };

  const supabaseUrl = getSupabaseArchiveContentApiUrl();
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !anonKey) return undefined;

  return {
    url: supabaseUrl,
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
    },
  };
}

export function getArchiveContents(): ArchiveContent[] {
  return runtimeArchiveContents;
}

export function setArchiveContents(contents: ArchiveContent[]) {
  runtimeArchiveContents = contents.filter((content) => content.isPublished);
}

export function resetArchiveContents() {
  runtimeArchiveContents = DEFAULT_ARCHIVE_CONTENTS;
  hasRemoteArchiveContents = false;
  remoteArchiveAttempted = false;
  remoteArchivePromise = null;
}

export function searchArchiveContents(
  contents: ArchiveContent[],
  params: {
    category?: ContentCategory | 'ALL';
    tag?: string | null;
    query?: string;
  }
): ArchiveContent[] {
  const query = params.query?.trim().toLowerCase() ?? '';

  return contents.filter((content) => {
    const matchesCategory = !params.category || params.category === 'ALL' || content.category === params.category;
    const matchesTag = !params.tag || content.tags.includes(params.tag);
    const matchesQuery =
      query.length === 0 ||
      content.title.toLowerCase().includes(query) ||
      content.subtitle?.toLowerCase().includes(query) ||
      content.summary.toLowerCase().includes(query) ||
      content.tags.some((tag) => tag.toLowerCase().includes(query));
    return matchesCategory && matchesTag && matchesQuery;
  });
}

export async function hydrateArchiveContentsFromApi(): Promise<ArchiveContent[]> {
  const request = getArchiveContentRequest();
  if (!request) return getArchiveContents();
  if (hasRemoteArchiveContents) return getArchiveContents();
  if (remoteArchivePromise) return remoteArchivePromise;

  remoteArchiveAttempted = true;
  remoteArchivePromise = fetch(request.url, { headers: request.headers })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Archive content API request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as ArchiveContentApiResponse | ArchiveContentDbRow[];
      const contents = Array.isArray(payload)
        ? payload.map(mapArchiveContentDbRow)
        : payload.contents;

      if (!Array.isArray(contents)) {
        throw new Error('Invalid archive content API response');
      }

      setArchiveContents(contents);
      hasRemoteArchiveContents = true;
      return getArchiveContents();
    })
    .finally(() => {
      remoteArchivePromise = null;
    });

  return remoteArchivePromise;
}

export function useArchiveContentHydration(): {
  contents: ArchiveContent[];
  status: ArchiveHydrationStatus;
} {
  const [contents, setContents] = useState(() => getArchiveContents());
  const [status, setStatus] = useState<ArchiveHydrationStatus>(
    hasRemoteArchiveContents ? 'remote' : 'fallback'
  );

  useEffect(() => {
    if (hasRemoteArchiveContents) {
      setContents(getArchiveContents());
      setStatus('remote');
      return;
    }

    const request = getArchiveContentRequest();
    if (!request) return;

    let cancelled = false;
    setStatus(remoteArchiveAttempted ? 'fallback' : 'loading');

    hydrateArchiveContentsFromApi()
      .then((nextContents) => {
        if (cancelled) return;
        setContents(nextContents);
        setStatus(hasRemoteArchiveContents ? 'remote' : 'fallback');
      })
      .catch(() => {
        if (cancelled) return;
        setContents(getArchiveContents());
        setStatus('fallback');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => ({ contents, status }), [contents, status]);
}
