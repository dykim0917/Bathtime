import { AdminShell } from '../../components/AdminShell';
import {
  buildAdminCareListViewModel,
  getCareStatusLabel,
} from '../../lib/careData';

export default function CarePage() {
  const care = buildAdminCareListViewModel();

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
            <span>Read-only table</span>
          </div>
          <div className="dataTable careTable" role="table" aria-label="케어 루틴 목록">
            <div className="dataTableHeader" role="row">
              <span>루틴</span>
              <span>Mode</span>
              <span>환경</span>
              <span>세부 루틴</span>
              <span>Default</span>
              <span>안전 메모</span>
              <span>상태</span>
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
                <span className="statusText">{getCareStatusLabel(routine.status)}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
