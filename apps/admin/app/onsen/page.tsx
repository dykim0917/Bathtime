import Link from 'next/link';

import { AdminShell } from '../../components/AdminShell';
import {
  bathScopeLabels,
  onsenStatusLabels,
  readAdminOnsenAccommodations,
  waterSourceTypeLabels,
  waterUseStatusLabels,
} from '../../lib/onsen/data';

interface OnsenPageProps {
  searchParams: Promise<{
    status?: string;
    water?: string;
    scope?: string;
  }>;
}

export default async function OnsenAdminPage({ searchParams }: OnsenPageProps) {
  const { status = 'ALL', water = 'ALL', scope = 'ALL' } = await searchParams;
  const allRows = await readAdminOnsenAccommodations();
  const rows = allRows.filter((row) => {
    const matchesStatus = status === 'ALL' || row.status === status;
    const matchesWater = water === 'ALL' || row.waterUseStatus === water;
    const matchesScope = scope === 'ALL' || row.bathScope === scope;
    return matchesStatus && matchesWater && matchesScope;
  });

  const officialCount = allRows.filter((row) => row.waterUseStatus === 'official_confirmed').length;
  const reviewCount = allRows.filter((row) => row.waterUseStatus === 'review_supported').length;
  const allRoomCount = allRows.filter((row) => row.bathScope === 'all_rooms').length;
  const seedCount = allRows.filter((row) => row.source === 'seed').length;

  return (
    <AdminShell activePath="/onsen">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">ONSEN DATA</p>
            <h2>온천 숙소 데이터</h2>
            <p className="lede">
              유후인 료칸의 온천수 사용 여부, 객실탕 범위, 후기 근거 수를 같은 기준으로 관리합니다.
            </p>
          </div>
          <Link className="primaryButton linkButton" href="/onsen">숙소 데이터</Link>
        </header>

        <section className="summaryGrid compact">
          <div className="summaryCard">
            <span>Total</span>
            <strong className="smallValue">{allRows.length}</strong>
          </div>
          <div className="summaryCard">
            <span>공식 확인</span>
            <strong className="smallValue">{officialCount}</strong>
          </div>
          <div className="summaryCard">
            <span>후기 참고</span>
            <strong className="smallValue">{reviewCount}</strong>
          </div>
          <div className="summaryCard">
            <span>전 객실</span>
            <strong className="smallValue">{allRoomCount}</strong>
          </div>
          <div className="summaryCard">
            <span>Seed fallback</span>
            <strong className="smallValue">{seedCount}</strong>
          </div>
        </section>

        <section className="panel compactPanel">
          <div className="panelHeader">
            <h3>필터</h3>
            <span>Onsen fields</span>
          </div>
          <form className="filterBar">
            <select name="status" defaultValue={status}>
              <option value="ALL">전체 상태</option>
              {Object.entries(onsenStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select name="water" defaultValue={water}>
              <option value="ALL">온천수 전체</option>
              {Object.entries(waterUseStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select name="scope" defaultValue={scope}>
              <option value="ALL">객실탕 전체</option>
              {Object.entries(bathScopeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button type="submit" className="primaryButton">적용</button>
          </form>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h3>숙소</h3>
            <span>{rows.length} rows</span>
          </div>
          <div className="dataTable onsenTable" role="table" aria-label="온천 숙소 데이터">
            <div className="dataTableHeader" role="row">
              <span>숙소</span>
              <span>온천수</span>
              <span>유형</span>
              <span>객실탕</span>
              <span>후기 근거</span>
              <span>등급</span>
              <span>상태</span>
              <span>작업</span>
            </div>
            {rows.map((row) => (
              <div className="dataTableRow" role="row" key={row.slug}>
                <div>
                  <strong>{row.name}</strong>
                  <small>{row.jaName ?? row.area}</small>
                </div>
                <span>{waterUseStatusLabels[row.waterUseStatus]}</span>
                <span>{waterSourceTypeLabels[row.waterSourceType]}</span>
                <span>{bathScopeLabels[row.bathScope]}</span>
                <span className="feedbackSummaryText">
                  직접 {row.evidenceCounts.directReviewCount ?? '-'} · 온천 {row.evidenceCounts.onsenReviewCount ?? '-'}
                </span>
                <span className="statusText">{row.evidenceGrade}</span>
                <span>{row.source === 'seed' ? '시드' : onsenStatusLabels[row.status]}</span>
                <div className="rowActions">
                  <Link className="textButton" href={`/onsen/${row.slug}`}>상세</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
