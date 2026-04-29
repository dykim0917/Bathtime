import { AdminShell } from '../../components/AdminShell';
import {
  buildAdminAudioListViewModel,
  formatDuration,
  getAudioStatusLabel,
  readAdminAudioRows,
} from '../../lib/audioData';

export default async function AudioPage() {
  const audio = buildAdminAudioListViewModel(await readAdminAudioRows());

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
            <span>Read-only table</span>
          </div>
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
                <span className="statusText">{getAudioStatusLabel(track.status)}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
