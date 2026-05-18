import Link from 'next/link';
import { AdminShell } from '../../../components/AdminShell';
import { createArchiveContentDraft } from '../../../lib/archive/contentActions';
import { categoryLabels, contentStatusLabels, contentTypeLabels } from '../../../lib/archive/data';

interface NewContentPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

function getStatusMessage(error?: string): string | null {
  if (error === 'invalid_basic_info') return '필수 기본 정보 값을 확인하세요.';
  if (error === 'missing_content_db') return '콘텐츠 DB 연결이 설정되지 않았습니다.';
  if (error === 'create_failed') return '콘텐츠 생성에 실패했습니다. 중복 ID 또는 RLS 정책을 확인하세요.';
  return null;
}

export default async function NewContentPage({ searchParams }: NewContentPageProps) {
  const { error } = await searchParams;
  const statusMessage = getStatusMessage(error);

  return (
    <AdminShell activePath="/content">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">ARCHIVE CONTENT</p>
            <h2>콘텐츠 등록</h2>
            <p className="lede">필수 메타데이터를 먼저 저장한 뒤 상세 화면에서 본문과 구조화 정보를 편집합니다.</p>
          </div>
          <Link className="primaryButton linkButton" href="/content">목록으로</Link>
        </header>
        {statusMessage ? <p className="formNotice error">{statusMessage}</p> : null}
        <ContentFormSummary />
      </section>
    </AdminShell>
  );
}

function ContentFormSummary() {
  return (
    <section className="detailGrid">
      <section className="panel">
        <div className="panelHeader">
          <h3>기본 정보</h3>
          <span>Required</span>
        </div>
        <form className="inlineForm" action={createArchiveContentDraft}>
          <label htmlFor="id">콘텐츠 ID</label>
          <input id="id" name="id" placeholder="place-dormy-inn-gangnam" />
          <label htmlFor="title">제목</label>
          <input id="title" name="title" placeholder="콘텐츠 제목" />
          <label htmlFor="subtitle">부제</label>
          <input id="subtitle" name="subtitle" placeholder="콘텐츠 부제" />
          <label htmlFor="summary">요약</label>
          <textarea id="summary" name="summary" rows={4} placeholder="목록과 SEO에 쓰일 짧은 요약" />
          <label htmlFor="category">카테고리</label>
          <select id="category" name="category">
            {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label htmlFor="contentType">콘텐츠 타입</label>
          <select id="contentType" name="contentType">
            {Object.entries(contentTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <label htmlFor="tags">태그</label>
          <input id="tags" name="tags" placeholder="쉼표로 구분" />
          <label htmlFor="status">상태</label>
          <select id="status" name="status" defaultValue="draft">
            {Object.entries(contentStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button type="submit" className="primaryButton">초안 생성</button>
        </form>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <h3>본문</h3>
          <span>Blocks / Markdown</span>
        </div>
        <p className="mutedText">
          초안 생성 후 상세 화면에서 JSON 블록, 대표 이미지, SEO 정보를 편집합니다.
        </p>
      </section>

      <section className="panel wide">
        <div className="panelHeader">
          <h3>구조화 정보</h3>
          <span>카테고리별 필수</span>
        </div>
        <div className="structuredGrid">
          {['목욕 공간', '홈케어', '욕실 아이템', '읽을거리 / 문화'].map((title) => (
            <div className="structuredCard" key={title}>
              <h4>{title}</h4>
              <p>카테고리 선택에 따라 이 영역의 필드만 노출합니다.</p>
              <ul>
                {title === '목욕 공간' ? ['외부인 이용 가능 여부', '가격대', '예약 필요 여부', '지역', '프라이빗 여부'].map((item) => <li key={item}>{item}</li>) : null}
                {title === '홈케어' ? ['소요 시간', '욕조 필요 여부', '필요한 아이템', '난이도', '추천 상황'].map((item) => <li key={item}>{item}</li>) : null}
                {title === '욕실 아이템' ? ['아이템 유형', '사용 상황', '보관/관리 난이도', '추천/비추천 대상'].map((item) => <li key={item}>{item}</li>) : null}
                {title === '읽을거리 / 문화' ? ['주제', '관련 카테고리', '난이도'].map((item) => <li key={item}>{item}</li>) : null}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
