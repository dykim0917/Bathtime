import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminShell } from '../../../components/AdminShell';
import {
  getTripStatusLabel,
  readAdminTripRows,
} from '../../../lib/tripData';
import {
  cloneTripThemeDraft,
  updateTripThemeBasicInfo,
} from '../../../lib/tripActions';

interface TripDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
}

function getStatusMessage(error?: string, updated?: string): string | null {
  if (updated === 'clone') return '복제한 draft 무드 테마입니다. 발행 전 내용을 검수하세요.';
  if (updated === 'basic_info') return '무드 테마 기본 정보가 저장되었습니다.';
  if (error === 'invalid_basic_info') return '무드 테마 기본 정보 값을 확인하세요.';
  if (error === 'missing_content_db') return '콘텐츠 DB 연결이 설정되지 않았습니다.';
  if (error === 'missing_admin') return '관리자 세션을 확인할 수 없습니다. 다시 로그인하세요.';
  if (error === 'clone_failed') return '무드 테마 복제에 실패했습니다. INSERT RLS 정책을 확인하세요.';
  if (error === 'update_failed') return '무드 테마 저장에 실패했습니다. RLS 정책과 권한을 확인하세요.';
  return null;
}

export default async function TripDetailPage({
  params,
  searchParams,
}: TripDetailPageProps) {
  const { id } = await params;
  const { error, updated } = await searchParams;
  const themes = await readAdminTripRows();
  const theme = themes.find((item) => item.id === id);
  const statusMessage = getStatusMessage(error, updated);

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
          <div className="topbarActions">
            <form action={cloneTripThemeDraft}>
              <input type="hidden" name="id" value={theme.id} />
              <button type="submit" className="primaryButton secondaryButton">
                Draft 복제
              </button>
            </form>
            <Link className="primaryButton linkButton" href="/trip">
              목록으로
            </Link>
          </div>
        </header>

        {statusMessage ? (
          <p className={error ? 'formNotice error' : 'formNotice'}>
            {statusMessage}
          </p>
        ) : null}

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
              <h3>기본 정보 편집</h3>
              <span>Supabase Auth</span>
            </div>
            <form className="inlineForm" action={updateTripThemeBasicInfo}>
              <input type="hidden" name="id" value={theme.id} />
              <label htmlFor="trip-title">Title</label>
              <input id="trip-title" name="title" defaultValue={theme.title} />
              <label htmlFor="trip-subtitle">Subtitle</label>
              <input id="trip-subtitle" name="subtitle" defaultValue={theme.subtitle} />
              <label htmlFor="trip-base-temp">Base temp</label>
              <input
                id="trip-base-temp"
                name="baseTemp"
                type="number"
                defaultValue={theme.baseTemp}
              />
              <label htmlFor="trip-color">Color</label>
              <input id="trip-color" name="colorHex" defaultValue={theme.colorHex} />
              <label htmlFor="trip-scent">Recommended scent</label>
              <input id="trip-scent" name="recScent" defaultValue={theme.recScent} />
              <label htmlFor="trip-bath-type">Default bath type</label>
              <input
                id="trip-bath-type"
                name="defaultBathType"
                defaultValue={theme.defaultBathType}
              />
              <label htmlFor="trip-environment">Recommended environment</label>
              <input id="trip-environment" name="environment" defaultValue={theme.environment} />
              <label htmlFor="trip-duration">Duration minutes</label>
              <input
                id="trip-duration"
                name="durationMinutes"
                type="number"
                min="1"
                defaultValue={theme.durationMinutes}
              />
              <label htmlFor="trip-lighting">Lighting</label>
              <textarea id="trip-lighting" name="lighting" defaultValue={theme.lighting} rows={3} />
              <button type="submit" className="primaryButton">
                기본 정보 저장
              </button>
            </form>
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
