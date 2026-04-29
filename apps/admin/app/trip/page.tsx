import { AdminShell } from '../../components/AdminShell';
import {
  buildAdminTripListViewModel,
  getTripStatusLabel,
} from '../../lib/tripData';

export default function TripPage() {
  const trip = buildAdminTripListViewModel();

  return (
    <AdminShell activePath="/trip">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">MOOD ROUTINES</p>
            <h2>무드 루틴 관리</h2>
            <p className="lede">
              테마, 온도, 시간, 조명, 음악과 앰비언스 연결 상태를 검수합니다.
            </p>
          </div>
          <button type="button" className="primaryButton">
            테마 추가 준비중
          </button>
        </header>

        <section className="summaryGrid compact" aria-label="무드 루틴 상태 요약">
          <div className="summaryCard">
            <span>Total themes</span>
            <strong>{trip.totalCount}</strong>
          </div>
          <div className="summaryCard">
            <span>Avg duration</span>
            <strong>{trip.averageDurationMinutes}m</strong>
          </div>
          <div className="summaryCard">
            <span>Linked audio</span>
            <strong>{trip.linkedAudioCount}</strong>
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h3>무드 테마 목록</h3>
            <span>Read-only table</span>
          </div>
          <div className="dataTable tripTable" role="table" aria-label="무드 테마 목록">
            <div className="dataTableHeader" role="row">
              <span>테마</span>
              <span>환경</span>
              <span>온도</span>
              <span>시간</span>
              <span>음악</span>
              <span>앰비언스</span>
              <span>조명</span>
              <span>상태</span>
            </div>
            {trip.rows.map((theme) => (
              <div className="dataTableRow" role="row" key={theme.id}>
                <div>
                  <strong>{theme.title}</strong>
                  <small>{theme.id}</small>
                </div>
                <span>{theme.environment}</span>
                <span>{theme.baseTemp}°C</span>
                <span>{theme.durationMinutes}m</span>
                <span>{theme.musicId}</span>
                <span>{theme.ambienceId}</span>
                <span>{theme.lighting}</span>
                <span className="statusText">{getTripStatusLabel(theme.status)}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
