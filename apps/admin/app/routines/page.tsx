import Link from 'next/link';
import { AdminShell } from '../../components/AdminShell';
import { adminRoutinePresets } from '../../lib/archive/data';

export default function RoutinesAdminPage() {
  return (
    <AdminShell activePath="/routines">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">RITUAL PRESETS</p>
            <h2>의식 프리셋 관리</h2>
            <p className="lede">샤워 7분, 족욕 10분, 입욕 15분, 자유 의식을 콘텐츠 CTA와 연결합니다.</p>
          </div>
        </header>

        <section className="panel">
          <div className="panelHeader">
            <h3>프리셋 목록</h3>
            <span>{adminRoutinePresets.length} presets</span>
          </div>
          <div className="dataTable routinesTable" role="table" aria-label="의식 프리셋 목록">
            <div className="dataTableHeader" role="row">
              <span>의식명</span>
              <span>소요 시간</span>
              <span>환경</span>
              <span>단계</span>
              <span>공개</span>
              <span>상세</span>
            </div>
            {adminRoutinePresets.map((routine) => (
              <div className="dataTableRow" role="row" key={routine.id}>
                <div>
                  <strong>{routine.title}</strong>
                  <small>{routine.description}</small>
                </div>
                <span>{routine.durationMinutes}분</span>
                <span>{routine.environment}</span>
                <span>{routine.steps.length} steps</span>
                <strong>{routine.isPublished ? '공개' : '비공개'}</strong>
                <Link className="textButton" href={`/routines/${routine.id}`}>열기</Link>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
