import { createP0Submission, readP0Submissions } from '@/src/server/archiveSubmissionStore';
import { Submission } from '@/src/archive/types';

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return Response.json(body, {
    ...init,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type',
      ...(init?.headers ?? {}),
    },
  });
}

export function OPTIONS(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
}

export async function GET(): Promise<Response> {
  const submissions = await readP0Submissions();
  return jsonResponse({ submissions });
}

export async function POST(request: Request): Promise<Response> {
  let input: Omit<Submission, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

  try {
    input = await request.json();
  } catch {
    return jsonResponse({ error: 'invalid_json' }, { status: 400 });
  }

  if (!input.comment?.trim()) {
    return jsonResponse({ error: 'comment_required' }, { status: 400 });
  }

  const submission = await createP0Submission({
    type: input.type,
    linkOrImage: input.linkOrImage?.trim() || undefined,
    comment: input.comment.trim(),
    nickname: input.nickname?.trim() || undefined,
    canPublish: input.canPublish,
  });

  return jsonResponse({ submission }, { status: 201 });
}

