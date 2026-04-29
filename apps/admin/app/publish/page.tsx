import { AdminShell } from '../../components/AdminShell';
import {
  buildPublishValidationViewModel,
  countFailedChecks,
} from '../../lib/publishValidation';

export default async function PublishPage() {
  const validation = await buildPublishValidationViewModel();
  const failedChecks = countFailedChecks(validation.checks);

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
            <span>Failed checks</span>
            <strong>{failedChecks}</strong>
          </div>
          <div className="summaryCard">
            <span>Checked at</span>
            <strong className="smallValue">{validation.checkedAt.slice(11, 19)}</strong>
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
      </section>
    </AdminShell>
  );
}
