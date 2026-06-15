import Link from 'next/link';
import { AdminShell } from '../../components/AdminShell';
import {
  categoryLabels,
  contentStatusLabels,
  contentTypeLabels,
  readAdminContentFeedbackSummaries,
  readAdminArchiveContents,
} from '../../lib/archive/data';
import { updateArchiveContentStatusFromList } from '../../lib/archive/contentActions';

interface ContentPageProps {
  searchParams: Promise<{
    category?: string;
    status?: string;
    type?: string;
    error?: string;
    updated?: string;
  }>;
}

function getContentPreviewHref(id: string): string {
  const previewToken = process.env.ADMIN_PREVIEW_TOKEN?.trim();
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL?.trim() ?? 'https://getbathtime.com';

  if (!previewToken) return `/content/${id}/preview`;

  const url = new URL(`/content/${id}`, webUrl);
  url.searchParams.set('previewToken', previewToken);
  return url.toString();
}

export default async function ContentPage({ searchParams }: ContentPageProps) {
  const { category = 'ALL', status = 'ALL', type = 'ALL', error, updated } = await searchParams;
  const filterParams = new URLSearchParams();
  if (category !== 'ALL') filterParams.set('category', category);
  if (type !== 'ALL') filterParams.set('type', type);
  if (status !== 'ALL') filterParams.set('status', status);
  const returnTo = `/content${filterParams.toString() ? `?${filterParams.toString()}` : ''}`;
  const rows = (await readAdminArchiveContents()).filter((content) => {
    const matchesCategory = category === 'ALL' || content.category === category;
    const matchesStatus = status === 'ALL' || content.status === status;
    const matchesType = type === 'ALL' || content.contentType === type;
    return matchesCategory && matchesStatus && matchesType;
  });
  const feedbackSummaries = await readAdminContentFeedbackSummaries(rows.map((content) => content.id));
  const statusMessage = getStatusMessage(error, updated);

  return (
    <AdminShell activePath="/content">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">ARCHIVE CONTENT</p>
            <h2>콘텐츠 목록</h2>
            <p className="lede">제목, 카테고리, 콘텐츠 타입, 공개 상태, 태그를 기준으로 아카이브 콘텐츠를 관리합니다.</p>
          </div>
          <Link className="primaryButton linkButton" href="/content/new">콘텐츠 등록</Link>
        </header>

        <section className="panel compactPanel">
          <div className="panelHeader">
            <h3>필터</h3>
            <span>P0 filters</span>
          </div>
          <form className="filterBar">
            <select name="category" defaultValue={category}>
              <option value="ALL">전체 카테고리</option>
              {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select name="type" defaultValue={type}>
              <option value="ALL">전체 타입</option>
              {Object.entries(contentTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select name="status" defaultValue={status}>
              <option value="ALL">전체 상태</option>
              {Object.entries(contentStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button type="submit" className="primaryButton">적용</button>
          </form>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h3>콘텐츠</h3>
            <span>{rows.length} rows</span>
          </div>
          {statusMessage ? (
            <p className={error ? 'formNotice error' : 'formNotice'}>
              {statusMessage}
            </p>
          ) : null}
          <div className="dataTable contentArchiveTable" role="table" aria-label="콘텐츠 목록">
            <div className="dataTableHeader" role="row">
              <span>제목</span>
              <span>카테고리</span>
              <span>타입</span>
              <span>상태</span>
              <span>수정일</span>
              <span>반응</span>
              <span>태그</span>
              <span>작업</span>
            </div>
            {rows.map((content) => (
              <div className="dataTableRow" role="row" key={content.id}>
                <div>
                  <strong>{content.title}</strong>
                  <small>{content.subtitle}</small>
                </div>
                <span>{categoryLabels[content.category]}</span>
                <span>{contentTypeLabels[content.contentType]}</span>
                <form className="tableForm statusSelectForm" action={updateArchiveContentStatusFromList}>
                  <input type="hidden" name="id" value={content.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <select
                    className="autoSubmitStatusSelect"
                    name="status"
                    defaultValue={content.status}
                    aria-label={`${content.title} 발행 상태`}
                  >
                    {Object.entries(contentStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <button type="submit" className="srOnly">상태 저장</button>
                </form>
                <span>{content.updatedAt}</span>
                <span className="feedbackSummaryText">
                  도움 {feedbackSummaries[content.id]?.helpful ?? 0} · 아쉬움 {feedbackSummaries[content.id]?.needsImprovement ?? 0}
                </span>
                <span className="tagText" title={content.tags.join(', ')}>{content.tags.join(', ')}</span>
                <div className="rowActions">
                  <Link className="textButton" href={`/content/${content.id}`}>상세</Link>
                  <Link className="textButton" href={getContentPreviewHref(content.id)}>미리보기</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('change', function (event) {
              var target = event.target;
              if (!(target instanceof HTMLSelectElement)) return;
              if (!target.classList.contains('autoSubmitStatusSelect')) return;
              if (target.form) target.form.requestSubmit();
            });
          `,
        }}
      />
    </AdminShell>
  );
}

function getStatusMessage(error?: string, updated?: string): string | null {
  if (updated === 'status') return '콘텐츠 상태가 저장되었습니다.';
  if (error === 'invalid_status') return '상태 값이 올바르지 않습니다.';
  if (error === 'missing_content_db') return '콘텐츠 DB 연결이 설정되지 않았습니다.';
  if (error === 'update_failed') return '상태 저장에 실패했습니다. 권한과 RLS 정책을 확인하세요.';
  return null;
}
