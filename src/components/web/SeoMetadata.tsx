import { useEffect } from 'react';
import { Platform } from 'react-native';

type Props = {
  title: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
};

function upsertMeta(selector: string, createAttrs: Record<string, string>, content: string): void {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(createAttrs).forEach(([key, value]) => element?.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function SeoMetadata({ title, description, image, canonicalUrl }: Props) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.title = title;
    if (description) {
      upsertMeta('meta[name="description"]', { name: 'description' }, description);
      upsertMeta('meta[property="og:description"]', { property: 'og:description' }, description);
    }
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, title);
    if (image) upsertMeta('meta[property="og:image"]', { property: 'og:image' }, image);
    if (canonicalUrl) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    }
  }, [canonicalUrl, description, image, title]);

  return null;
}
