import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminShell } from '../../../components/AdminShell';
import {
  getCareStatusLabel,
  readAdminCareRows,
} from '../../../lib/careData';
import { cloneCareRoutineDraft } from '../../../lib/careActions';

interface CareDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
}

function getStatusMessage(error?: string, updated?: string): string | null {
  if (updated === 'clone') return '복제한 draft 케어 루틴입니다. 발행 전 내용을 검수하세요.';
  if (error === 'missing_content_db') return '콘텐츠 DB 연결이 설정되지 않았습니다.';
  if (error === 'missing_admin') return '관리자 세션을 확인할 수 없습니다. 다시 로그인하세요.';
  if (error === 'clone_failed') return '케어 루틴 복제에 실패했습니다. INSERT RLS 정책을 확인하세요.';
  return null;
}

export default async function CareDetailPage({
  params,
  searchParams,
}: CareDetailPageProps) {
  const { id } = await params;
  const { error, updated } = await searchParams;
  const routines = await readAdminCareRows();
  const routine = routines.find((item) => item.id === id);
  const statusMessage = getStatusMessage(error, updated);

  if (!routine) notFound();

  return (
    <AdminShell activePath="/care">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">CARE ROUTINES</p>
            <h2>{routine.title}</h2>
            <p className="lede">
              의도 카드의 노출 조건, 기본 세부 루틴, 안전 메모를 확인합니다.
            </p>
          </div>
          <div className="topbarActions">
            <form action={cloneCareRoutineDraft}>
              <input type="hidden" name="id" value={routine.id} />
              <button type="submit" className="primaryButton secondaryButton">
                Draft 복제
              </button>
            </form>
            <Link className="primaryButton linkButton" href="/care">
              목록으로
            </Link>
          </div>
        </header>

        {statusMessage ? (
          <p className={error ? 'formNotice error' : 'formNotice'}>
            {statusMessage}
          </p>
        ) : null}

        <section className="summaryGrid compact" aria-label="케어 루틴 상세 요약">
          <div className="summaryCard">
            <span>Status</span>
            <strong>{getCareStatusLabel(routine.status)}</strong>
          </div>
          <div className="summaryCard">
            <span>Subprotocols</span>
            <strong>{routine.subprotocols}</strong>
          </div>
          <div className="summaryCard">
            <span>Mode</span>
            <strong>{routine.mode}</strong>
          </div>
        </section>

        <section className="detailGrid">
          <section className="panel">
            <div className="panelHeader">
              <h3>기본 정보</h3>
              <span>{routine.id}</span>
            </div>
            <dl className="detailList">
              <div>
                <dt>Intent</dt>
                <dd>{routine.intentId}</dd>
              </div>
              <div>
                <dt>Default subprotocol</dt>
                <dd>{routine.defaultSubprotocolId}</dd>
              </div>
              <div>
                <dt>Safety note</dt>
                <dd>{routine.safetyNote}</dd>
              </div>
            </dl>
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h3>허용 환경</h3>
              <span>Read-only</span>
            </div>
            <div className="tagList">
              {routine.environments.map((environment) => (
                <span key={environment}>{environment}</span>
              ))}
            </div>
          </section>
        </section>
      </section>
    </AdminShell>
  );
}
