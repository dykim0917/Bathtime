import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminShell } from '../../../components/AdminShell';
import { adminArchiveContents, categoryLabels, contentTypeLabels } from '../../../lib/archive/data';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const content = adminArchiveContents.find((item) => item.id === id);
  if (!content) notFound();

  return (
    <AdminShell activePath="/content">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">ARCHIVE CONTENT</p>
            <h2>{content.title}</h2>
            <p className="lede">{content.subtitle}</p>
          </div>
          <Link className="primaryButton linkButton" href="/content">목록으로</Link>
        </header>

        <section className="summaryGrid compact">
          <div className="summaryCard">
            <span>Category</span>
            <strong className="smallValue">{categoryLabels[content.category]}</strong>
          </div>
          <div className="summaryCard">
            <span>Type</span>
            <strong className="smallValue">{contentTypeLabels[content.contentType]}</strong>
          </div>
          <div className="summaryCard">
            <span>Status</span>
            <strong className="smallValue">{content.isPublished ? '공개' : '비공개'}</strong>
          </div>
        </section>

        <section className="detailGrid">
          <section className="panel">
            <div className="panelHeader">
              <h3>기본 정보</h3>
              <span>P0 mock</span>
            </div>
            <form className="inlineForm">
              <label htmlFor="title">제목</label>
              <input id="title" name="title" defaultValue={content.title} />
              <label htmlFor="subtitle">부제</label>
              <input id="subtitle" name="subtitle" defaultValue={content.subtitle} />
              <label htmlFor="tags">태그</label>
              <input id="tags" name="tags" defaultValue={content.tags.join(', ')} />
              <label htmlFor="published">공개 상태</label>
              <select id="published" name="published" defaultValue={content.isPublished ? 'true' : 'false'}>
                <option value="true">공개</option>
                <option value="false">비공개</option>
              </select>
              <button type="button" className="primaryButton">저장 준비중</button>
            </form>
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h3>본문</h3>
              <span>Blocks / Markdown</span>
            </div>
            <form className="inlineForm">
              <label htmlFor="body">본문</label>
              <textarea id="body" name="body" rows={10} defaultValue="P0 seed 본문을 블록형 구조로 전환합니다." />
            </form>
          </section>

          <section className="panel wide">
            <div className="panelHeader">
              <h3>구조화 정보</h3>
              <span>{categoryLabels[content.category]}</span>
            </div>
            <p className="mutedText">
              선택된 카테고리에 맞는 구조화 필드를 노출합니다. 장소는 이용 가능 여부와 가격대,
              홈 리추얼은 소요 시간과 필요한 아이템, 아이템은 사용 상황과 관리 난이도가 핵심입니다.
            </p>
          </section>
        </section>
      </section>
    </AdminShell>
  );
}
