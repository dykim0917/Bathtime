'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { parseArchiveReview, type ArchiveReview } from '../../../src/pocket/contracts';
import { applyPocketReview, claimPocketJob } from '../app/pocket/actions';

export function PocketReviewEditor({ template, exportText }: { template: ArchiveReview; exportText: string }) {
  const [input, setInput] = useState(JSON.stringify(template, null, 2));
  const [preview, setPreview] = useState<ArchiveReview | null>(null);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  function validate() {
    try {
      const result = parseArchiveReview(JSON.parse(input));
      if (result.sourceId !== template.sourceId) throw new Error('현재 원문과 결과의 ID가 달라요.');
      setPreview(result); setMessage('');
    } catch (error) { setPreview(null); setMessage(error instanceof Error ? error.message : 'JSON 형식을 확인해 주세요.'); }
  }
  return <section className="panel">
    <h3>원문 정리</h3>
    <p>출처가 없는 정보는 채우지 마세요. 다른 지점·규격을 합치지 말고, 공개 발행은 별도로 검토하세요.</p>
    <button disabled={pending} onClick={() => startTransition(async () => {
      const result = await claimPocketJob(template.sourceId); setMessage(result.message); if (result.ok) router.refresh();
    })}>이 원문 정리 시작</button>
    <details><summary>Codex에 전달할 작업</summary>
      <textarea aria-label="정리 작업 내보내기" readOnly value={exportText} rows={12} style={{ width: '100%' }} />
    </details>
    <label htmlFor="review-json">정리 결과 JSON</label>
    <textarea id="review-json" value={input} onChange={(event) => { setInput(event.target.value); setPreview(null); }}
      rows={24} style={{ width: '100%', fontFamily: 'monospace' }} />
    <button disabled={pending} onClick={validate}>미리보기</button>
    {preview ? <div>
      <h3>{preview.title}</h3><p>{preview.summary}</p>
      <p>{preview.creator || '작성자 미확인'} · 확인일 {preview.checkedAt}</p>
      {preview.status === 'unavailable' ? <p>내용 확인 어려움: {preview.reason}</p> : null}
      {preview.entities.map((entity, index) => <article key={entity.id ?? index} className="panel">
        <h4>{entity.kind === 'place' ? '장소' : '제품'} · {entity.name}</h4>
        <p>{entity.location}</p><p>{entity.summary}</p><p>{entity.tags.join(' · ')}</p>
        <dl>{entity.facts.map((fact, index) => <div key={index}>
          <dt>{fact.label}</dt><dd>{fact.value} · {fact.basis === 'official' ? '공식 안내' : '게시물'} · {fact.checkedAt}
            {' '}<a href={fact.sourceUrl} target="_blank" rel="noreferrer">출처</a></dd>
        </div>)}</dl>
      </article>)}
      <button disabled={pending} onClick={() => startTransition(async () => {
        const result = await applyPocketReview(JSON.stringify(preview)); setMessage(result.message);
        if (result.ok) { setPreview(null); router.refresh(); }
      })}>{pending ? '반영 중…' : '검토 완료 · 보관함에 반영'}</button>
    </div> : null}
    <p role="status">{message}</p>
  </section>;
}
