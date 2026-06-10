import type { MetadataRoute } from 'next';
import { getPublishedArchiveContents } from '@web/lib/archive';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (process.env.NEXT_PUBLIC_WEB_URL?.trim() || 'https://www.getbathtime.com').replace(/\/+$/, '');
  const contents = await getPublishedArchiveContents();
  const staticRoutes = ['', '/about', '/explore', '/routines', '/submit', '/legal/privacy', '/legal/terms'].map((path) => ({
    url: `${host}${path}`,
    lastModified: new Date(),
  }));

  return [
    ...staticRoutes,
    ...contents.map((content) => ({
      url: `${host}/content/${content.id}`,
      lastModified: content.updatedAt,
    })),
  ];
}
