import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminShell } from '../../../components/AdminShell';
import {
  formatDuration,
  getAudioStatusLabel,
  readAdminAudioRows,
} from '../../../lib/audioData';
import { cloneAudioTrackDraft } from '../../../lib/audioActions';

interface AudioDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
}

function getStatusMessage(error?: string, updated?: string): string | null {
  if (updated === 'clone') return '복제한 draft 오디오 트랙입니다. 발행 전 내용을 검수하세요.';
  if (error === 'missing_content_db') return '콘텐츠 DB 연결이 설정되지 않았습니다.';
  if (error === 'missing_admin') return '관리자 세션을 확인할 수 없습니다. 다시 로그인하세요.';
  if (error === 'clone_failed') return '오디오 트랙 복제에 실패했습니다. INSERT RLS 정책을 확인하세요.';
  return null;
}

export default async function AudioDetailPage({
  params,
  searchParams,
}: AudioDetailPageProps) {
  const { id } = await params;
  const { error, updated } = await searchParams;
  const tracks = await readAdminAudioRows();
  const track = tracks.find((item) => item.id === id);
  const statusMessage = getStatusMessage(error, updated);

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
          <div className="topbarActions">
            <form action={cloneAudioTrackDraft}>
              <input type="hidden" name="id" value={track.id} />
              <button type="submit" className="primaryButton secondaryButton">
                Draft 복제
              </button>
            </form>
            <Link className="primaryButton linkButton" href="/audio">
              목록으로
            </Link>
          </div>
        </header>

        {statusMessage ? (
          <p className={error ? 'formNotice error' : 'formNotice'}>
            {statusMessage}
          </p>
        ) : null}

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
