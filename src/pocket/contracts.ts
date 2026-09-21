export type ArchivePlatform = 'instagram' | 'youtube' | 'web';
export type ArchiveJobStatus = 'queued' | 'processing' | 'ready' | 'unavailable';

export interface ArchiveLink {
  url: string;
  canonicalKey: string;
  platform: ArchivePlatform;
}

/** Only normalizes a URL. It never fetches arbitrary user-provided addresses. */
export function normalizeArchiveLink(input: string): ArchiveLink {
  if (input.length > 16000) throw new Error('공유한 내용이 너무 길어요. 링크만 붙여넣어 주세요.');
  const candidate = input.match(/https?:\/\/[^\s<>"\u0000-\u001f]+/i)?.[0];
  if (!candidate || candidate.length > 4096) throw new Error('저장할 링크를 찾지 못했어요.');
  let url: URL;
  try { url = new URL(candidate); } catch { throw new Error('링크 주소를 확인해 주세요.'); }
  const host = url.hostname.toLowerCase();
  if (url.username || url.password || url.port || host === 'localhost' || !host.includes('.') ||
      host.endsWith('.local') || host.endsWith('.internal') || /^[\d.]+$/.test(host) || host.includes(':')) {
    throw new Error('공개된 웹페이지 링크를 넣어 주세요.');
  }
  if (['instagram.com', 'www.instagram.com', 'm.instagram.com'].includes(host)) {
    const id = url.pathname.match(/^\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)\/?$/)?.[1];
    if (!id) throw new Error('Instagram 게시물이나 릴스 링크를 넣어 주세요.');
    return { platform: 'instagram', canonicalKey: `instagram:${id}`, url: `https://www.instagram.com/p/${id}/` };
  }
  if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)) {
    const id = host === 'youtu.be' ? url.pathname.slice(1) :
      url.pathname === '/watch' ? url.searchParams.get('v') :
        url.pathname.match(/^\/(?:shorts|embed|live)\/([A-Za-z0-9_-]+)\/?$/)?.[1];
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) throw new Error('YouTube 영상이나 쇼츠 링크를 넣어 주세요.');
    return { platform: 'youtube', canonicalKey: `youtube:${id}`, url: `https://www.youtube.com/watch?v=${id}` };
  }
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
    if (/^utm_/i.test(key) || ['fbclid', 'gclid'].includes(key)) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  return { platform: 'web', canonicalKey: `web:${url.href}`, url: url.href };
}

export interface ArchiveFact {
  label: string;
  value: string;
  sourceUrl: string;
  basis: 'official' | 'post';
  checkedAt: string;
}

export interface ArchiveEntityDraft {
  id?: string;
  kind: 'place' | 'product';
  name: string;
  location: string;
  summary: string;
  tags: string[];
  facts: ArchiveFact[];
  actionUrl?: string;
}

export interface ArchiveReview {
  version: 1;
  sourceId: string;
  expectedRevision: number;
  title: string;
  summary: string;
  creator: string;
  postedAt?: string;
  checkedAt: string;
  status: 'ready' | 'unavailable';
  reason?: string;
  entities: ArchiveEntityDraft[];
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('정리 결과는 JSON 객체여야 해요.');
  return value as Record<string, unknown>;
}
function text(value: unknown, name: string, max: number, allowEmpty = false): string {
  if (typeof value !== 'string' || value.length > max || (!allowEmpty && !value.trim())) throw new Error(`${name}을 확인해 주세요.`);
  return value.trim();
}
function date(value: unknown, name: string): string {
  const result = text(value, name, 10);
  const timestamp = Date.parse(result);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || !Number.isFinite(timestamp) ||
      new Date(timestamp).toISOString().slice(0, 10) !== result) throw new Error(`${name}은 YYYY-MM-DD 형식이어야 해요.`);
  return result;
}
function externalUrl(value: unknown): string {
  const raw = text(value, '출처 주소', 4096);
  if (!/^https?:\/\/\S+$/.test(raw)) throw new Error('출처 주소를 확인해 주세요.');
  normalizeArchiveLink(raw);
  return raw;
}

/** Validates operator/AI output before preview; the database validates writes again. */
export function parseArchiveReview(input: unknown): ArchiveReview {
  const item = record(input);
  if (item.version !== 1 || typeof item.sourceId !== 'string' || !uuid.test(item.sourceId) ||
      !Number.isInteger(item.expectedRevision) || Number(item.expectedRevision) < 0 ||
      !['ready', 'unavailable'].includes(String(item.status))) throw new Error('원문 ID와 결과 버전을 확인해 주세요.');
  if (!Array.isArray(item.entities) || item.entities.length > 20) throw new Error('장소·제품은 한 번에 20개까지 정리할 수 있어요.');
  const entities = item.entities.map((value): ArchiveEntityDraft => {
    const entity = record(value);
    if (!['place', 'product'].includes(String(entity.kind))) throw new Error('장소 또는 제품으로 구분해 주세요.');
    if (entity.id !== undefined && (typeof entity.id !== 'string' || !uuid.test(entity.id))) throw new Error('연결할 장소·제품 ID를 확인해 주세요.');
    if (!Array.isArray(entity.tags) || entity.tags.length > 12 || !Array.isArray(entity.facts) || entity.facts.length > 20) {
      throw new Error('태그는 12개, 이용 정보는 20개까지 넣을 수 있어요.');
    }
    return {
      ...(entity.id ? { id: String(entity.id) } : {}),
      kind: entity.kind as ArchiveEntityDraft['kind'],
      name: text(entity.name, '이름', 160), location: text(entity.location, '지역·브랜드', 200, true),
      summary: text(entity.summary, '소개', 2000, true),
      tags: entity.tags.map((tag) => text(tag, '태그', 40)),
      facts: entity.facts.map((value): ArchiveFact => {
        const fact = record(value);
        if (!['official', 'post'].includes(String(fact.basis))) throw new Error('공식 안내와 게시물 근거를 구분해 주세요.');
        return { label: text(fact.label, '항목명', 80), value: text(fact.value, '항목 내용', 1000),
          sourceUrl: externalUrl(fact.sourceUrl), basis: fact.basis as ArchiveFact['basis'], checkedAt: date(fact.checkedAt, '확인일') };
      }),
      ...(entity.actionUrl ? { actionUrl: externalUrl(entity.actionUrl) } : {}),
    };
  });
  const ids = entities.flatMap((entity) => entity.id ? [entity.id] : []);
  if (new Set(ids).size !== ids.length) throw new Error('같은 장소·제품이 두 번 연결됐어요.');
  if (item.status === 'unavailable' && entities.length) throw new Error('확인하지 못한 원문에는 장소·제품을 연결할 수 없어요.');
  return {
    version: 1, sourceId: item.sourceId, expectedRevision: Number(item.expectedRevision),
    title: text(item.title, '제목', 200), summary: text(item.summary, '요약', 4000, true),
    creator: text(item.creator, '작성자', 160, true), checkedAt: date(item.checkedAt, '확인일'),
    ...(item.postedAt ? { postedAt: date(item.postedAt, '게시일') } : {}),
    status: item.status as ArchiveReview['status'],
    ...(item.status === 'unavailable' ? { reason: text(item.reason, '확인하지 못한 이유', 500) } : {}),
    entities,
  };
}
