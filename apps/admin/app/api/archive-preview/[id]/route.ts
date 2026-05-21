import { NextRequest } from 'next/server';

import { isValidPreviewToken, previewTokenParam } from '../../../../lib/previewToken';
import { readPreviewArchiveContent } from '../../../../lib/archive/data';
import { type ArchiveContent } from '../../../../../../src/archive/types';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function toArchiveContent(content: Awaited<ReturnType<typeof readPreviewArchiveContent>>): ArchiveContent | null {
  if (!content) return null;

  return {
    id: content.id,
    title: content.title,
    subtitle: content.subtitle,
    summary: content.summary,
    category: content.category,
    contentType: content.contentType,
    tags: content.tags,
    heroImage: content.heroImage && typeof content.heroImage.uri === 'string' && typeof content.heroImage.alt === 'string'
      ? {
          uri: content.heroImage.uri,
          alt: content.heroImage.alt,
          credit: typeof content.heroImage.credit === 'string' ? content.heroImage.credit : undefined,
          sourceType:
            content.heroImage.sourceType === 'uploaded'
              ? 'owned'
              : content.heroImage.sourceType === 'owned' ||
                  content.heroImage.sourceType === 'official' ||
                  content.heroImage.sourceType === 'licensed' ||
                  content.heroImage.sourceType === 'generated' ||
                  content.heroImage.sourceType === 'none'
                ? content.heroImage.sourceType
                : undefined,
        }
      : undefined,
    body: content.body,
    structuredInfo: content.structuredInfo,
    relatedRoutineIds: [],
    relatedItemIds: [],
    relatedPlaceIds: [],
    seo: content.seo,
    isPublished: content.isPublished,
    createdAt: content.updatedAt,
    updatedAt: content.updatedAt,
  };
}

export function OPTIONS(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest, { params }: RouteContext): Promise<Response> {
  const token = request.nextUrl.searchParams.get(previewTokenParam);
  if (!isValidPreviewToken(token)) {
    return Response.json({ error: 'Invalid preview token' }, { status: 401, headers: corsHeaders });
  }

  const { id } = await params;
  const content = toArchiveContent(await readPreviewArchiveContent(id));
  if (!content) {
    return Response.json({ error: 'Archive content not found' }, { status: 404, headers: corsHeaders });
  }

  return Response.json(
    {
      schema_version: 'archive-content-preview.v1',
      content,
    },
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'private, no-store',
      },
    }
  );
}
