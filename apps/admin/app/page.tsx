import {
  formatActivityTime,
  getActivityTargetLabel,
  readRecentAdminActivity,
} from '../lib/dashboardData';
import { AdminShell } from '../components/AdminShell';
import { adminRoutinePresets, readAdminArchiveContents, readAdminSubmissions } from '../lib/archive/data';

function getActivityEmptyMessage(status: string): string {
  if (status === 'not_configured') return 'Supabase 세션 연결 후 최근 작업이 표시됩니다.';
  if (status === 'unavailable') return 'Audit log migration 적용 후 최근 작업이 표시됩니다.';
  return '아직 기록된 관리자 작업이 없습니다.';
}

export default async function AdminHomePage() {
  const [activity, submissions, archiveContents] = await Promise.all([
    readRecentAdminActivity(),
    readAdminSubmissions(),
    readAdminArchiveContents(),
  ]);
  const published = archiveContents.filter((item) => item.isPublished).length;
  const drafts = archiveContents.length - published;
  const newSubmissions = submissions.filter((item) => item.status === 'new').length;

  return (
    <AdminShell activePath="/">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">운영 콘솔</p>
            <h2>바스타임 아카이브 관리자</h2>
            <p className="lede">
              콘텐츠 구조화 정보, 제보 상태, 루틴 프리셋을 관리하는 P0 운영 공간입니다.
            </p>
          </div>
          <button type="button" className="primaryButton">
            Validation 준비중
          </button>
        </header>

        <section className="summaryGrid" aria-label="콘텐츠 상태 요약">
          <div className="summaryCard">
            <span>Published content</span>
            <strong>{published}</strong>
          </div>
          <div className="summaryCard">
            <span>Draft content</span>
            <strong>{drafts}</strong>
          </div>
          <div className="summaryCard">
            <span>New submissions</span>
            <strong>{newSubmissions}</strong>
          </div>
          <div className="summaryCard">
            <span>Routine presets</span>
            <strong>{adminRoutinePresets.length}</strong>
          </div>
        </section>

        <section className="contentGrid">
          <div className="panel wide">
            <div className="panelHeader">
              <h3>관리 섹션</h3>
              <span>P0 archive operations</span>
            </div>
            <div className="sectionTable">
              {[
                { title: 'Archive Content', description: '콘텐츠 등록/수정과 공개 상태 관리', activeCount: published, draftCount: drafts, status: 'P0' },
                { title: 'Submissions', description: '사용자 제보 확인과 상태 변경', activeCount: submissions.length, draftCount: newSubmissions, status: 'Review' },
                { title: 'Routine Presets', description: '샤워/족욕/입욕/자유 루틴 관리', activeCount: adminRoutinePresets.length, draftCount: 0, status: 'P0' },
              ].map((section) => (
                <article className="sectionRow" key={section.title}>
                  <div>
                    <h4>{section.title}</h4>
                    <p>{section.description}</p>
                  </div>
                  <div className="rowMetrics">
                    <span>{section.activeCount} active</span>
                    <span>{section.draftCount} draft</span>
                    <strong>{section.status}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panelHeader">
              <h3>최근 작업</h3>
              <span>{activity.status === 'ready' ? 'Audit log' : 'Setup required'}</span>
            </div>
            {activity.rows.length > 0 ? (
              <div className="activityList">
                {activity.rows.map((item) => (
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
                {getActivityEmptyMessage(activity.status)}
              </p>
            )}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
