import { AdminShell } from '../../components/AdminShell';
import { publishContentSnapshot } from '../../lib/publishActions';
import {
  buildPublishValidationViewModel,
  countFailedChecks,
  countWarningChecks,
} from '../../lib/publishValidation';
import { buildReleasePreviewViewModel } from '../../lib/releasePreview';

interface PublishPageProps {
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
}

function getPublishStatusMessage(error?: string, updated?: string): string | null {
  if (updated === 'publish') return '발행 체크포인트가 기록되었습니다.';
  if (error === 'missing_content_db') return '콘텐츠 DB 연결이 설정되지 않았습니다.';
  if (error === 'missing_snapshot') return 'Snapshot endpoint가 설정되지 않았습니다.';
  if (error === 'validation_failed') return '검증 실패 항목이 있어 발행할 수 없습니다.';
  if (error === 'missing_admin') return '관리자 세션을 확인할 수 없습니다.';
  if (error === 'publish_log_failed') return '발행 기록 저장에 실패했습니다. Audit log RLS를 확인하세요.';
  return null;
}

export default async function PublishPage({ searchParams }: PublishPageProps) {
  const { error, updated } = await searchParams;
  const [validation, preview] = await Promise.all([
    buildPublishValidationViewModel(),
    buildReleasePreviewViewModel(),
  ]);
  const failedChecks = countFailedChecks(validation.checks);
  const warningChecks = countWarningChecks(validation.checks);
  const statusMessage = getPublishStatusMessage(error, updated);
  const canPublish = validation.configured && failedChecks === 0;

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
          <form action={publishContentSnapshot}>
            <button type="submit" className="primaryButton" disabled={!canPublish}>
              Publish
            </button>
          </form>
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
          {statusMessage ? (
            <p className={error ? 'formNotice error' : 'formNotice'}>
              {statusMessage}
            </p>
          ) : null}
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
            <h3>상세 이슈</h3>
            <span>{validation.issues.length ? `${validation.issues.length} findings` : 'Ready'}</span>
          </div>
          {validation.issues.length > 0 ? (
            <div className="issueList">
              {validation.issues.map((issue) => (
                <article className="issueRow" key={`${issue.path}-${issue.message}`}>
                  <span className={`validationBadge ${issue.severity === 'error' ? 'fail' : 'warn'}`}>
                    {issue.severity}
                  </span>
                  <div>
                    <strong>{issue.path}</strong>
                    <p>{issue.message}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mutedText">발행을 막는 상세 이슈가 없습니다.</p>
          )}
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

        <section className="panel">
          <div className="panelHeader">
            <h3>발행 미리보기</h3>
            <span>{preview.totalCards ? `${preview.totalCards} active cards` : 'No active cards'}</span>
          </div>
          {preview.totalCards > 0 ? (
            <div className="previewGrid">
              {preview.sections.map((section) => (
                <section className="previewColumn" key={section.title}>
                  <h4>{section.title}</h4>
                  {section.cards.length > 0 ? (
                    <div className="previewStack">
                      {section.cards.map((card) => (
                        <article className="previewCard" key={`${card.kind}-${card.id}`}>
                          <span>{card.kind}</span>
                          <strong>{card.title}</strong>
                          <p>{card.subtitle}</p>
                          <small>{card.detail}</small>
                          <em>{card.meta}</em>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="mutedText">Active 항목이 없습니다.</p>
                  )}
                </section>
              ))}
            </div>
          ) : (
            <p className="mutedText">미리보기할 active 콘텐츠가 없습니다.</p>
          )}
        </section>
      </section>
    </AdminShell>
  );
}
