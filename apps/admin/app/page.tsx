import {
  buildAdminDashboardViewModel,
  formatActivityTime,
  getActivityTargetLabel,
  getStatusLabel,
  readRecentAdminActivity,
} from '../lib/dashboardData';
import { AdminShell } from '../components/AdminShell';

function getActivityEmptyMessage(status: string): string {
  if (status === 'not_configured') return 'Supabase 세션 연결 후 최근 작업이 표시됩니다.';
  if (status === 'unavailable') return 'Audit log migration 적용 후 최근 작업이 표시됩니다.';
  return '아직 기록된 관리자 작업이 없습니다.';
}

export default async function AdminHomePage() {
  const activity = await readRecentAdminActivity();
  const dashboard = buildAdminDashboardViewModel(undefined, activity);

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
              <span>Content areas</span>
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
              <h3>최근 작업</h3>
              <span>{dashboard.activity.status === 'ready' ? 'Audit log' : 'Setup required'}</span>
            </div>
            {dashboard.activity.rows.length > 0 ? (
              <div className="activityList">
                {dashboard.activity.rows.map((item) => (
                  <article className="activityRow" key={item.id}>
                    <div>
                      <strong>
                        {getActivityTargetLabel(item.targetTable)} · {item.targetId}
                      </strong>
                      <p>
                        {item.action} by {item.actorEmail}
                      </p>
                    </div>
                    <time dateTime={item.createdAt}>{formatActivityTime(item.createdAt)}</time>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mutedText emptyPanelText">
                {getActivityEmptyMessage(dashboard.activity.status)}
              </p>
            )}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
