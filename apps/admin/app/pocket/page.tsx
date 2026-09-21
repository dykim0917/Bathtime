import Link from 'next/link';
import { AdminShell } from '../../components/AdminShell';
import { pocketRows, pocketStatus, type PocketSourceRow } from '../../lib/pocket';

export const dynamic = 'force-dynamic';

export default async function PocketQueue() {
  let sources: PocketSourceRow[] = [];
  let error = '';
  try { sources = await pocketRows<PocketSourceRow>('archive_sources', { order: 'created_at.desc', limit: '200' }); }
  catch (cause) { error = cause instanceof Error ? cause.message : '대기 목록을 불러오지 못했어요.'; }
  const queued = sources.filter((source) => source.status === 'queued' || source.status === 'processing');
  return <AdminShell activePath="/pocket"><section className="workspace">
    <header className="topbar"><div><h2>보관함 정리</h2><p>공유한 원문을 확인하고 장소·제품으로 정리해요.</p></div></header>
    {error ? <p role="alert" className="formNotice error">{error}</p> : <>
      <p>최근 {sources.length}건 · 정리 대기/진행 {queued.length}건</p>
      <section className="panel"><table style={{ width: '100%', textAlign: 'left' }}>
        <thead><tr><th>원문</th><th>상태</th><th>저장일</th><th>작업</th></tr></thead>
        <tbody>{sources.map((source) => <tr key={source.id}>
          <td><a href={source.url} target="_blank" rel="noreferrer">{source.title || source.platform}</a></td>
          <td>{pocketStatus[source.status]}</td><td>{source.created_at.slice(0, 10)}</td>
          <td><Link href={`/pocket/${source.id}`}>정리하기</Link></td>
        </tr>)}</tbody>
      </table>{sources.length === 0 ? <p>아직 공유된 링크가 없어요.</p> : null}</section>
    </>}
  </section></AdminShell>;
}
