import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminShell } from '../../../components/AdminShell';
import {
  formatDuration,
  getAudioStatusLabel,
  readAdminAudioRows,
} from '../../../lib/audioData';

interface AudioDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AudioDetailPage({ params }: AudioDetailPageProps) {
  const { id } = await params;
  const tracks = await readAdminAudioRows();
  const track = tracks.find((item) => item.id === id);

  if (!track) notFound();

  return (
    <AdminShell activePath="/audio">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">AUDIO</p>
            <h2>{track.title}</h2>
            <p className="lede">
              오디오 트랙의 타입, 길이, 소스, 페르소나 연결, 라이선스 메모를 확인합니다.
            </p>
          </div>
          <Link className="primaryButton linkButton" href="/audio">
            목록으로
          </Link>
        </header>

        <section className="summaryGrid compact" aria-label="오디오 상세 요약">
          <div className="summaryCard">
            <span>Status</span>
            <strong>{getAudioStatusLabel(track.status)}</strong>
          </div>
          <div className="summaryCard">
            <span>Duration</span>
            <strong>{formatDuration(track.durationSeconds)}</strong>
          </div>
          <div className="summaryCard">
            <span>Linked routines</span>
            <strong>{track.linkedRoutineCount}</strong>
          </div>
        </section>

        <section className="detailGrid">
          <section className="panel">
            <div className="panelHeader">
              <h3>기본 정보</h3>
              <span>{track.id}</span>
            </div>
            <dl className="detailList">
              <div>
                <dt>Type</dt>
                <dd>{track.type}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{track.source}</dd>
              </div>
              <div>
                <dt>License</dt>
                <dd>{track.licenseNote}</dd>
              </div>
            </dl>
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h3>Persona</h3>
              <span>Read-only</span>
            </div>
            <div className="tagList">
              {track.personaCodes.length > 0 ? (
                track.personaCodes.map((code) => <span key={code}>{code}</span>)
              ) : (
                <p className="mutedText">연결된 페르소나가 없습니다.</p>
              )}
            </div>
          </section>
        </section>
      </section>
    </AdminShell>
  );
}
