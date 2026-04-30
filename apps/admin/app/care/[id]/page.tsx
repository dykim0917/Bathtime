import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminShell } from '../../../components/AdminShell';
import {
  getCareStatusLabel,
  readAdminCareRows,
} from '../../../lib/careData';

interface CareDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CareDetailPage({ params }: CareDetailPageProps) {
  const { id } = await params;
  const routines = await readAdminCareRows();
  const routine = routines.find((item) => item.id === id);

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
          <Link className="primaryButton linkButton" href="/care">
            목록으로
          </Link>
        </header>

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
