import { AdminShell } from '../../components/AdminShell';
import {
  buildAdminAudioListViewModel,
  formatDuration,
  getAudioStatusLabel,
  readAdminAudioRows,
} from '../../lib/audioData';
import { updateAudioTrackStatus } from '../../lib/audioActions';

interface AudioPageProps {
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
}

function getAudioStatusMessage(error?: string, updated?: string): string | null {
  if (updated === 'status') return '상태가 저장되었습니다.';
  if (error === 'invalid_status') return '상태 값이 올바르지 않습니다.';
  if (error === 'missing_content_db') return '콘텐츠 DB 연결이 설정되지 않았습니다.';
  if (error === 'update_failed') return '상태 저장에 실패했습니다. RLS 정책과 권한을 확인하세요.';
  return null;
}

export default async function AudioPage({ searchParams }: AudioPageProps) {
  const { error, updated } = await searchParams;
  const audio = buildAdminAudioListViewModel(await readAdminAudioRows());
  const statusMessage = getAudioStatusMessage(error, updated);

  return (
    <AdminShell activePath="/audio">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">AUDIO</p>
            <h2>음악 관리</h2>
            <p className="lede">
              음악과 앰비언스 트랙, 원격 URL 전환 대상, 루틴 연결 상태를 검수합니다.
            </p>
          </div>
          <button type="button" className="primaryButton">
            트랙 추가 준비중
          </button>
        </header>

        <section className="summaryGrid compact" aria-label="오디오 상태 요약">
          <div className="summaryCard">
            <span>Total tracks</span>
            <strong>{audio.totalCount}</strong>
          </div>
          <div className="summaryCard">
            <span>Music / Ambience</span>
            <strong>{audio.musicCount}/{audio.ambienceCount}</strong>
          </div>
          <div className="summaryCard">
            <span>Remote tracks</span>
            <strong>{audio.remoteCount}</strong>
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h3>오디오 트랙 목록</h3>
            <span>Supabase Auth</span>
          </div>
          {statusMessage ? (
            <p className={error ? 'formNotice error' : 'formNotice'}>
              {statusMessage}
            </p>
          ) : null}
          <div className="dataTable audioTable" role="table" aria-label="오디오 트랙 목록">
            <div className="dataTableHeader" role="row">
              <span>트랙</span>
              <span>Type</span>
              <span>Duration</span>
              <span>Source</span>
              <span>Persona</span>
              <span>연결</span>
              <span>License</span>
              <span>상태</span>
            </div>
            {audio.rows.map((track) => (
              <div className="dataTableRow" role="row" key={track.id}>
                <div>
                  <strong>{track.title}</strong>
                  <small>{track.id}</small>
                </div>
                <span>{track.type}</span>
                <span>{formatDuration(track.durationSeconds)}</span>
                <span>{track.source}</span>
                <span>{track.personaCodes.join(', ')}</span>
                <span>{track.linkedRoutineCount}</span>
                <span>{track.licenseNote}</span>
                <form className="tableForm" action={updateAudioTrackStatus}>
                  <input type="hidden" name="id" value={track.id} />
                  <select
                    aria-label={`${track.title} 상태`}
                    name="status"
                    defaultValue={track.status}
                  >
                    <option value="active">{getAudioStatusLabel('active')}</option>
                    <option value="draft">{getAudioStatusLabel('draft')}</option>
                    <option value="paused">{getAudioStatusLabel('paused')}</option>
                    <option value="retired">{getAudioStatusLabel('retired')}</option>
                  </select>
                  <button type="submit" className="textButton">
                    저장
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
