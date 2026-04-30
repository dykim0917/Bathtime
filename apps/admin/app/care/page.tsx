import Link from 'next/link';

import { AdminShell } from '../../components/AdminShell';
import {
  buildAdminCareListViewModel,
  getCareStatusLabel,
  readAdminCareRows,
} from '../../lib/careData';
import { updateCareRoutineStatus } from '../../lib/careActions';

interface CarePageProps {
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
}

function getCareStatusMessage(error?: string, updated?: string): string | null {
  if (updated === 'status') return '상태가 저장되었습니다.';
  if (error === 'invalid_status') return '상태 값이 올바르지 않습니다.';
  if (error === 'missing_content_db') return '콘텐츠 DB 연결이 설정되지 않았습니다.';
  if (error === 'update_failed') return '상태 저장에 실패했습니다. RLS 정책과 권한을 확인하세요.';
  return null;
}

export default async function CarePage({ searchParams }: CarePageProps) {
  const { error, updated } = await searchParams;
  const care = buildAdminCareListViewModel(await readAdminCareRows());
  const statusMessage = getCareStatusMessage(error, updated);

  return (
    <AdminShell activePath="/care">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">CARE ROUTINES</p>
            <h2>케어 루틴 관리</h2>
            <p className="lede">
              의도 카드, 환경별 노출 조건, 기본 세부 루틴, 안전 메모를 검수합니다.
            </p>
          </div>
          <button type="button" className="primaryButton">
            루틴 추가 준비중
          </button>
        </header>

        <section className="summaryGrid compact" aria-label="케어 루틴 상태 요약">
          <div className="summaryCard">
            <span>Total intents</span>
            <strong>{care.totalCount}</strong>
          </div>
          <div className="summaryCard">
            <span>Subprotocols</span>
            <strong>{care.subprotocolCount}</strong>
          </div>
          <div className="summaryCard">
            <span>Safety notes</span>
            <strong>{care.safetyReviewCount}</strong>
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h3>케어 루틴 목록</h3>
            <span>Supabase Auth</span>
          </div>
          {statusMessage ? (
            <p className={error ? 'formNotice error' : 'formNotice'}>
              {statusMessage}
            </p>
          ) : null}
          <div className="dataTable careTable" role="table" aria-label="케어 루틴 목록">
            <div className="dataTableHeader" role="row">
              <span>루틴</span>
              <span>Mode</span>
              <span>환경</span>
              <span>세부 루틴</span>
              <span>Default</span>
              <span>안전 메모</span>
              <span>상태</span>
              <span>상세</span>
            </div>
            {care.rows.map((routine) => (
              <div className="dataTableRow" role="row" key={routine.id}>
                <div>
                  <strong>{routine.title}</strong>
                  <small>{routine.intentId} · {routine.id}</small>
                </div>
                <span>{routine.mode}</span>
                <span>{routine.environments.join(', ')}</span>
                <span>{routine.subprotocols}</span>
                <span>{routine.defaultSubprotocolId}</span>
                <span>{routine.safetyNote}</span>
                <form className="tableForm" action={updateCareRoutineStatus}>
                  <input type="hidden" name="id" value={routine.id} />
                  <select
                    aria-label={`${routine.title} 상태`}
                    name="status"
                    defaultValue={routine.status}
                  >
                    <option value="active">{getCareStatusLabel('active')}</option>
                    <option value="draft">{getCareStatusLabel('draft')}</option>
                    <option value="paused">{getCareStatusLabel('paused')}</option>
                    <option value="retired">{getCareStatusLabel('retired')}</option>
                  </select>
                  <button type="submit" className="textButton">
                    저장
                  </button>
                </form>
                <Link className="textButton" href={`/care/${routine.id}`}>
                  열기
                </Link>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
