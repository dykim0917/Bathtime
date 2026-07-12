import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const host = process.env.NEXT_PUBLIC_WEB_URL?.trim() || 'https://www.getbathtime.com';

  return {
    rules: [
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app', '/auth', '/saved', '/onsen/results?'],
      },
    ],
    sitemap: `${host.replace(/\/+$/, '')}/sitemap.xml`,
  };
}
