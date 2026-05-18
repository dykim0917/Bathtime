export const previewTokenParam = 'token';

export function isValidPreviewToken(token: string | null | undefined): boolean {
  const expected = process.env.ADMIN_PREVIEW_TOKEN?.trim();
  return Boolean(expected && token && token === expected);
}

export function isPreviewPath(pathname: string): boolean {
  return /^\/content\/[^/]+\/preview\/?$/.test(pathname);
}
