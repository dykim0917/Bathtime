import { AdminShell } from '../../components/AdminShell';
import {
  buildPublishValidationViewModel,
  countFailedChecks,
  countWarningChecks,
} from '../../lib/publishValidation';

export default async function PublishPage() {
  const validation = await buildPublishValidationViewModel();
  const failedChecks = countFailedChecks(validation.checks);
  const warningChecks = countWarningChecks(validation.checks);

  return (
    <AdminShell activePath="/publish">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">PUBLISH</p>
            <h2>발행 검증</h2>
            <p className="lede">
              공개 snapshot endpoint를 기준으로 앱이 받을 콘텐츠 구조를 점검합니다.
            </p>
          </div>
          <button type="button" className="primaryButton">
            Publish 준비중
          </button>
        </header>

        <section className="summaryGrid compact" aria-label="발행 검증 요약">
          <div className="summaryCard">
            <span>Endpoint</span>
            <strong>{validation.configured ? 'Ready' : 'Missing'}</strong>
          </div>
          <div className="summaryCard">
            <span>Overall status</span>
            <strong>{validation.status.toUpperCase()}</strong>
          </div>
          <div className="summaryCard">
            <span>Issues</span>
            <strong>{failedChecks}/{warningChecks}</strong>
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h3>검증 결과</h3>
            <span>{validation.snapshotUrl ?? 'CONTENT_SNAPSHOT_API_URL 필요'}</span>
          </div>
          <div className="validationList">
            {validation.checks.map((check) => (
              <article className="validationRow" key={check.label}>
                <span className={`validationBadge ${check.state}`}>{check.state}</span>
                <div>
                  <strong>{check.label}</strong>
                  <p>{check.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h3>Snapshot 구성</h3>
            <span>{validation.metrics.length ? 'Payload counts' : 'Endpoint 연결 필요'}</span>
          </div>
          {validation.metrics.length > 0 ? (
            <div className="metricGrid">
              {validation.metrics.map((metric) => (
                <div className="metricItem" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="mutedText">검증할 snapshot payload가 아직 없습니다.</p>
          )}
        </section>
      </section>
    </AdminShell>
  );
}
