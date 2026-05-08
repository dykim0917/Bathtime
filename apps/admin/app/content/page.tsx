import Link from 'next/link';
import { AdminShell } from '../../components/AdminShell';
import { adminArchiveContents, categoryLabels, contentTypeLabels } from '../../lib/archive/data';

interface ContentPageProps {
  searchParams: Promise<{
    category?: string;
    status?: string;
    type?: string;
  }>;
}

export default async function ContentPage({ searchParams }: ContentPageProps) {
  const { category = 'ALL', status = 'ALL', type = 'ALL' } = await searchParams;
  const rows = adminArchiveContents.filter((content) => {
    const matchesCategory = category === 'ALL' || content.category === category;
    const matchesStatus = status === 'ALL' || (status === 'published' ? content.isPublished : !content.isPublished);
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
              <option value="published">공개</option>
              <option value="draft">비공개</option>
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
              <span>상세</span>
            </div>
            {rows.map((content) => (
              <div className="dataTableRow" role="row" key={content.id}>
                <div>
                  <strong>{content.title}</strong>
                  <small>{content.subtitle}</small>
                </div>
                <span>{categoryLabels[content.category]}</span>
                <span>{contentTypeLabels[content.contentType]}</span>
                <strong>{content.isPublished ? '공개' : '비공개'}</strong>
                <span>{content.updatedAt}</span>
                <span>{content.tags.join(', ')}</span>
                <Link className="textButton" href={`/content/${content.id}`}>열기</Link>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
