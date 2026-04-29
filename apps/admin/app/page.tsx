const sections = [
  {
    title: '제품',
    description: '상품, 구매처, 추천 규칙, 표시 메타데이터',
    active: 30,
    draft: 0,
    status: '정상',
  },
  {
    title: '케어 루틴',
    description: '의도 카드, 환경별 문구, 세부 루틴',
    active: 16,
    draft: 0,
    status: '정상',
  },
  {
    title: '무드 루틴',
    description: '테마, 온도, 조명, 음악 연결',
    active: 22,
    draft: 0,
    status: '정상',
  },
  {
    title: '음악',
    description: '음악, 앰비언스, 원격 URL, 라이선스',
    active: 12,
    draft: 0,
    status: '정상',
  },
];

const queue = [
  'Supabase/PostgREST 연결값 등록',
  '제품 목록 read-only 테이블',
  '케어 루틴 목록 read-only 테이블',
  '발행 전 validation 결과 패널',
];

export default function AdminHomePage() {
  const totalActive = sections.reduce((total, item) => total + item.active, 0);
  const totalDraft = sections.reduce((total, item) => total + item.draft, 0);

  return (
    <main className="shell">
      <aside className="sidebar" aria-label="관리자 메뉴">
        <div>
          <p className="eyebrow">BATH SOMMELIER</p>
          <h1>Content Admin</h1>
        </div>
        <nav>
          <a className="navItem active" href="/">
            Dashboard
          </a>
          <a className="navItem" href="/">
            Products
          </a>
          <a className="navItem" href="/">
            Care Routines
          </a>
          <a className="navItem" href="/">
            Mood Routines
          </a>
          <a className="navItem" href="/">
            Audio
          </a>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">운영 콘솔</p>
            <h2>콘텐츠 관리 대시보드</h2>
            <p className="lede">
              앱 업데이트 없이 제품, 루틴, 음악 콘텐츠를 검수하고 발행하는 PC 전용
              작업 공간입니다.
            </p>
          </div>
          <button type="button" className="primaryButton">
            Validation 준비중
          </button>
        </header>

        <section className="summaryGrid" aria-label="콘텐츠 상태 요약">
          <div className="summaryCard">
            <span>Active rows</span>
            <strong>{totalActive}</strong>
          </div>
          <div className="summaryCard">
            <span>Draft rows</span>
            <strong>{totalDraft}</strong>
          </div>
          <div className="summaryCard">
            <span>Publish blockers</span>
            <strong>0</strong>
          </div>
          <div className="summaryCard">
            <span>Snapshot</span>
            <strong>content.v1</strong>
          </div>
        </section>

        <section className="contentGrid">
          <div className="panel wide">
            <div className="panelHeader">
              <h3>관리 섹션</h3>
              <span>Read-only shell</span>
            </div>
            <div className="sectionTable">
              {sections.map((section) => (
                <article className="sectionRow" key={section.title}>
                  <div>
                    <h4>{section.title}</h4>
                    <p>{section.description}</p>
                  </div>
                  <div className="rowMetrics">
                    <span>{section.active} active</span>
                    <span>{section.draft} draft</span>
                    <strong>{section.status}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panelHeader">
              <h3>다음 작업</h3>
              <span>MVP queue</span>
            </div>
            <ol className="queueList">
              {queue.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        </section>
      </section>
    </main>
  );
}
