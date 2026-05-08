import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminShell } from '../../../components/AdminShell';
import { adminRoutinePresets } from '../../../lib/archive/data';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoutineDetailPage({ params }: PageProps) {
  const { id } = await params;
  const routine = adminRoutinePresets.find((item) => item.id === id);
  if (!routine) notFound();

  return (
    <AdminShell activePath="/routines">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">RITUAL PRESET</p>
            <h2>{routine.title}</h2>
            <p className="lede">{routine.description}</p>
          </div>
          <Link className="primaryButton linkButton" href="/routines">목록으로</Link>
        </header>

        <section className="detailGrid">
          <section className="panel">
            <div className="panelHeader">
              <h3>기본 정보</h3>
              <span>P0 mock</span>
            </div>
            <form className="inlineForm">
              <label htmlFor="title">의식명</label>
              <input id="title" name="title" defaultValue={routine.title} />
              <label htmlFor="duration">소요 시간</label>
              <input id="duration" name="duration" type="number" defaultValue={routine.durationMinutes} />
              <label htmlFor="environment">환경</label>
              <input id="environment" name="environment" defaultValue={routine.environment} />
              <label htmlFor="description">간단 설명</label>
              <textarea id="description" name="description" rows={4} defaultValue={routine.description} />
              <label htmlFor="published">공개 여부</label>
              <select id="published" name="published" defaultValue={routine.isPublished ? 'true' : 'false'}>
                <option value="true">공개</option>
                <option value="false">비공개</option>
              </select>
              <button type="button" className="primaryButton">저장 준비중</button>
            </form>
          </section>
          <section className="panel">
            <div className="panelHeader">
              <h3>단계</h3>
              <span>{routine.steps.length} steps</span>
            </div>
            <form className="inlineForm">
              <label htmlFor="steps">단계</label>
              <textarea id="steps" name="steps" rows={8} defaultValue={routine.steps.join('\n')} />
            </form>
          </section>
        </section>
      </section>
    </AdminShell>
  );
}
