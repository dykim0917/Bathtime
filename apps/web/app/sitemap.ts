import type { MetadataRoute } from 'next';
import { getPublishedArchiveContents } from '@web/lib/archive';
import { readOnsenCandidates } from '@web/lib/onsenData';

function getHost() {
  return (process.env.NEXT_PUBLIC_WEB_URL?.trim() || 'https://www.getbathtime.com').replace(/\/+$/, '');
}

function toLastModified(value?: string) {
  return value?.trim() || new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = getHost();
  const [contents, onsenCandidates] = await Promise.all([getPublishedArchiveContents(), readOnsenCandidates()]);
  const staticRoutes = ['', '/about', '/explore', '/routines', '/submit', '/legal/privacy', '/legal/terms', '/onsen', '/onsen/results', '/onsen/methodology'].map((path) => ({
    url: `${host}${path}`,
    lastModified: new Date(),
  }));

  return [
    ...staticRoutes,
    ...contents.map((content) => ({
      url: `${host}/content/${content.id}`,
      lastModified: content.updatedAt,
    })),
    ...onsenCandidates.map((candidate) => ({
      url: `${host}/onsen/${candidate.slug}`,
      lastModified: toLastModified(candidate.updatedAt),
    })),
  ];
}
