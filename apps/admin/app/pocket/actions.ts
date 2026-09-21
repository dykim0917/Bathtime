'use server';

import { revalidatePath } from 'next/cache';
import { parseArchiveReview } from '../../../../src/pocket/contracts';
import { pocketRpc } from '../../lib/pocket';

export async function applyPocketReview(payload: string): Promise<{ ok: boolean; message: string }> {
  try {
    if (payload.length > 100000) throw new Error('결과가 너무 길어요. 원문 한 건씩 반영해 주세요.');
    const review = parseArchiveReview(JSON.parse(payload));
    await pocketRpc('archive_apply_review', { p_result: review });
    revalidatePath('/pocket');
    revalidatePath(`/pocket/${review.sourceId}`);
    return { ok: true, message: '보관함에 반영했어요.' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : '결과를 확인해 주세요.' };
  }
}

export async function claimPocketJob(sourceId: string): Promise<{ ok: boolean; message: string }> {
  try {
    await pocketRpc('archive_claim_job', { p_source: sourceId });
    revalidatePath('/pocket');
    revalidatePath(`/pocket/${sourceId}`);
    return { ok: true, message: '정리를 시작했어요.' };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : '작업 상태를 확인해 주세요.' };
  }
}
