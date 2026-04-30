import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminShell } from '../../../components/AdminShell';
import {
  getTripStatusLabel,
  readAdminTripRows,
} from '../../../lib/tripData';

interface TripDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { id } = await params;
  const themes = await readAdminTripRows();
  const theme = themes.find((item) => item.id === id);

  if (!theme) notFound();

  return (
    <AdminShell activePath="/trip">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">MOOD ROUTINES</p>
            <h2>{theme.title}</h2>
            <p className="lede">
              무드 테마의 환경, 온도, 시간, 조명, 오디오 연결 상태를 확인합니다.
            </p>
          </div>
          <Link className="primaryButton linkButton" href="/trip">
            목록으로
          </Link>
        </header>

        <section className="summaryGrid compact" aria-label="무드 테마 상세 요약">
          <div className="summaryCard">
            <span>Status</span>
            <strong>{getTripStatusLabel(theme.status)}</strong>
          </div>
          <div className="summaryCard">
            <span>Temperature</span>
            <strong>{theme.baseTemp}°C</strong>
          </div>
          <div className="summaryCard">
            <span>Duration</span>
            <strong>{theme.durationMinutes}m</strong>
          </div>
        </section>

        <section className="detailGrid">
          <section className="panel">
            <div className="panelHeader">
              <h3>기본 정보</h3>
              <span>{theme.id}</span>
            </div>
            <dl className="detailList">
              <div>
                <dt>환경</dt>
                <dd>{theme.environment}</dd>
              </div>
              <div>
                <dt>조명</dt>
                <dd>{theme.lighting}</dd>
              </div>
            </dl>
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h3>오디오 연결</h3>
              <span>Read-only</span>
            </div>
            <dl className="detailList">
              <div>
                <dt>Music</dt>
                <dd>{theme.musicId}</dd>
              </div>
              <div>
                <dt>Ambience</dt>
                <dd>{theme.ambienceId}</dd>
              </div>
            </dl>
          </section>
        </section>
      </section>
    </AdminShell>
  );
}
