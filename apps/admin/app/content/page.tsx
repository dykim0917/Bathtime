import Link from 'next/link';
import { AdminShell } from '../../components/AdminShell';
import {
  categoryLabels,
  contentStatusLabels,
  contentTypeLabels,
  readAdminArchiveContents,
} from '../../lib/archive/data';

interface ContentPageProps {
  searchParams: Promise<{
    category?: string;
    status?: string;
    type?: string;
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
  const { category = 'ALL', status = 'ALL', type = 'ALL' } = await searchParams;
  const rows = (await readAdminArchiveContents()).filter((content) => {
    const matchesCategory = category === 'ALL' || content.category === category;
    const matchesStatus = status === 'ALL' || content.status === status;
    const matchesType = type === 'ALL' || content.contentType === type;
    return matchesCategory && matchesStatus && matchesType;
  });

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

        <section className="panel">
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
          <div className="dataTable contentArchiveTable" role="table" aria-label="콘텐츠 목록">
            <div className="dataTableHeader" role="row">
              <span>제목</span>
              <span>카테고리</span>
              <span>타입</span>
              <span>상태</span>
              <span>수정일</span>
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
                <strong>{contentStatusLabels[content.status]}</strong>
                <span>{content.updatedAt}</span>
                <span>{content.tags.join(', ')}</span>
                <div className="rowActions">
                  <Link className="textButton" href={`/content/${content.id}`}>상세</Link>
                  <Link className="textButton" href={getContentPreviewHref(content.id)}>미리보기</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
