import { notFound } from 'next/navigation';
import { AdminShell } from '../../../components/AdminShell';
import { PocketReviewEditor } from '../../../components/PocketReviewEditor';
import { pocketRows, pocketStatus, type PocketSourceRow } from '../../../lib/pocket';
import type { ArchiveReview } from '../../../../../src/pocket/contracts';

export default async function PocketDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [source] = await pocketRows<PocketSourceRow>('archive_sources', { id: `eq.${id}` });
  if (!source) notFound();
  const history = await pocketRows<{ revision: number; payload: ArchiveReview }>('archive_review_history', {
    source_id: `eq.${id}`, order: 'revision.desc', limit: '10',
  });
  const template: ArchiveReview = {
    ...(history[0]?.payload ?? { version: 1, title: source.title || '저장한 게시물', summary: '', creator: '', status: 'ready', entities: [] }),
    sourceId: id, expectedRevision: source.revision, checkedAt: new Date().toISOString().slice(0, 10),
  };
  const exportText = `다음 공개 원문을 확인하고 JSON 형식으로 정리해 주세요. 접근할 수 없으면 status를 unavailable로 두고 reason에 이유를 적으세요. 로그인 정보나 비공개 자료는 요청하지 마세요. 장소·제품의 이름과 근거를 구분하고 가격·시간은 확인일을 포함하세요. 추측한 정보는 넣지 마세요. 영상·이미지·캡션 전체는 복제하지 마세요.\n\n원문: ${source.url}\n\n결과 형식:\n${JSON.stringify(template, null, 2)}\n\nentities 항목: {kind: "place" 또는 "product", name, location: 지역 또는 브랜드, summary, tags: [], facts: [{label, value, sourceUrl, basis: "official" 또는 "post", checkedAt: "YYYY-MM-DD"}], actionUrl?: 공식 제품/지도 URL}. 기존 대상에 연결할 때만 id를 넣으세요.`;
  return <AdminShell activePath="/pocket"><section className="workspace">
    <header className="topbar"><div><h2>{source.title || '저장한 게시물'}</h2>
      <p>{pocketStatus[source.status]} · 버전 {source.revision}</p><a href={source.url} target="_blank" rel="noreferrer">원문 열기</a>
    </div></header>
    <PocketReviewEditor key={source.revision} template={template} exportText={exportText} />
    <section className="panel"><h3>반영 이력</h3><p>이전 JSON을 가져와 expectedRevision을 현재 버전으로 바꾸면 검토 후 복원할 수 있어요.</p>
      {history.map((entry) => <details key={entry.revision}><summary>버전 {entry.revision}</summary><pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(entry.payload, null, 2)}</pre></details>)}
    </section>
  </section></AdminShell>;
}
