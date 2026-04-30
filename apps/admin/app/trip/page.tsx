import Link from 'next/link';

import { AdminShell } from '../../components/AdminShell';
import {
  buildAdminTripListViewModel,
  getTripStatusLabel,
  readAdminTripRows,
} from '../../lib/tripData';
import { updateTripThemeStatus } from '../../lib/tripActions';

interface TripPageProps {
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
}

function getTripStatusMessage(error?: string, updated?: string): string | null {
  if (updated === 'status') return '상태가 저장되었습니다.';
  if (error === 'invalid_status') return '상태 값이 올바르지 않습니다.';
  if (error === 'missing_content_db') return '콘텐츠 DB 연결이 설정되지 않았습니다.';
  if (error === 'update_failed') return '상태 저장에 실패했습니다. RLS 정책과 권한을 확인하세요.';
  return null;
}

export default async function TripPage({ searchParams }: TripPageProps) {
  const { error, updated } = await searchParams;
  const trip = buildAdminTripListViewModel(await readAdminTripRows());
  const statusMessage = getTripStatusMessage(error, updated);

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
            <span>Supabase Auth</span>
          </div>
          {statusMessage ? (
            <p className={error ? 'formNotice error' : 'formNotice'}>
              {statusMessage}
            </p>
          ) : null}
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
              <span>상세</span>
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
                <form className="tableForm" action={updateTripThemeStatus}>
                  <input type="hidden" name="id" value={theme.id} />
                  <select
                    aria-label={`${theme.title} 상태`}
                    name="status"
                    defaultValue={theme.status}
                  >
                    <option value="active">{getTripStatusLabel('active')}</option>
                    <option value="draft">{getTripStatusLabel('draft')}</option>
                    <option value="paused">{getTripStatusLabel('paused')}</option>
                    <option value="retired">{getTripStatusLabel('retired')}</option>
                  </select>
                  <button type="submit" className="textButton">
                    저장
                  </button>
                </form>
                <Link className="textButton" href={`/trip/${theme.id}`}>
                  열기
                </Link>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
