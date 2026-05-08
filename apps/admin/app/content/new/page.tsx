import Link from 'next/link';
import { AdminShell } from '../../../components/AdminShell';
import { categoryLabels, contentTypeLabels } from '../../../lib/archive/data';

export default function NewContentPage() {
  return (
    <AdminShell activePath="/content">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">ARCHIVE CONTENT</p>
            <h2>콘텐츠 등록</h2>
            <p className="lede">P0에서는 저장 액션보다 입력 구조와 필수 필드 확인을 먼저 고정합니다.</p>
          </div>
          <Link className="primaryButton linkButton" href="/content">목록으로</Link>
        </header>
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
        <form className="inlineForm">
          <label htmlFor="title">제목</label>
          <input id="title" name="title" placeholder="콘텐츠 제목" />
          <label htmlFor="subtitle">부제</label>
          <input id="subtitle" name="subtitle" placeholder="콘텐츠 부제" />
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
          <label htmlFor="heroImage">대표 이미지</label>
          <input id="heroImage" name="heroImage" placeholder="이미지 URL 또는 asset id" />
          <label htmlFor="routine">관련 루틴</label>
          <select id="routine" name="routine">
            <option value="shower-7">샤워 7분</option>
            <option value="footbath-10">족욕 10분</option>
            <option value="bath-15">입욕 15분</option>
            <option value="free-timer">자유 의식/타이머</option>
          </select>
          <label htmlFor="published">공개 상태</label>
          <select id="published" name="published">
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
          <textarea id="body" name="body" rows={14} placeholder="paragraph / heading / image / list 블록으로 전환 가능한 원고" />
        </form>
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
