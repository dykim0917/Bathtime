import {
  buildAdminDashboardViewModel,
  getStatusLabel,
} from '../lib/dashboardData';
import { AdminShell } from '../components/AdminShell';

export default function AdminHomePage() {
  const dashboard = buildAdminDashboardViewModel();

  return (
    <AdminShell activePath="/">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">운영 콘솔</p>
            <h2>콘텐츠 관리 대시보드</h2>
            <p className="lede">
              앱 업데이트 없이 제품, 루틴, 음악 콘텐츠를 검수하고 발행하는 PC 전용
              작업 공간입니다.
            </p>
          </div>
          <button type="button" className="primaryButton">
            Validation 준비중
          </button>
        </header>

        <section className="summaryGrid" aria-label="콘텐츠 상태 요약">
          <div className="summaryCard">
            <span>Active rows</span>
            <strong>{dashboard.summary.activeRows}</strong>
          </div>
          <div className="summaryCard">
            <span>Draft rows</span>
            <strong>{dashboard.summary.draftRows}</strong>
          </div>
          <div className="summaryCard">
            <span>Publish blockers</span>
            <strong>{dashboard.summary.publishBlockers}</strong>
          </div>
          <div className="summaryCard">
            <span>Snapshot</span>
            <strong>{dashboard.summary.schemaVersion}</strong>
          </div>
        </section>

        <section className="contentGrid">
          <div className="panel wide">
            <div className="panelHeader">
              <h3>관리 섹션</h3>
              <span>Read-only shell</span>
            </div>
            <div className="sectionTable">
              {dashboard.sections.map((section) => (
                <article className="sectionRow" key={section.title}>
                  <div>
                    <h4>{section.title}</h4>
                    <p>{section.description}</p>
                  </div>
                  <div className="rowMetrics">
                    <span>{section.activeCount} active</span>
                    <span>{section.draftCount} draft</span>
                    <strong>{getStatusLabel(section.status)}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panelHeader">
              <h3>다음 작업</h3>
              <span>MVP queue</span>
            </div>
            <ol className="queueList">
              {dashboard.queue.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
