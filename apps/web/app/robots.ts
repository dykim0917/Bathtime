import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const host = process.env.NEXT_PUBLIC_WEB_URL?.trim() || 'https://www.getbathtime.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app', '/auth', '/saved'],
    },
    sitemap: `${host.replace(/\/+$/, '')}/sitemap.xml`,
  };
}
