import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminShell } from '../../../components/AdminShell';
import { updateOnsenAccommodation } from '../../../lib/onsen/actions';
import {
  bathScopeLabels,
  onsenStatusLabels,
  readAdminOnsenAccommodation,
  waterSourceTypeLabels,
  waterUseStatusLabels,
} from '../../../lib/onsen/data';

interface OnsenDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
}

function getStatusMessage(error?: string, updated?: string): string | null {
  if (updated === 'onsen') return '온천 숙소 데이터가 저장되었습니다.';
  if (error === 'invalid_onsen_data') return '필수 값과 상태 선택을 확인하세요.';
  if (error === 'missing_onsen_db') return '온천 숙소 DB 연결이 필요합니다. 현재 화면은 시드 fallback을 표시하고 있습니다.';
  if (error === 'update_failed') return '저장에 실패했습니다. 테이블, 권한, RLS 정책을 확인하세요.';
  return null;
}

export default async function OnsenDetailPage({ params, searchParams }: OnsenDetailPageProps) {
  const { slug } = await params;
  const { error, updated } = await searchParams;
  const accommodation = await readAdminOnsenAccommodation(slug);

  if (!accommodation) notFound();

  const statusMessage = getStatusMessage(error, updated);

  return (
    <AdminShell activePath="/onsen">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">ONSEN DATA</p>
            <h2>{accommodation.name}</h2>
            <p className="lede">{accommodation.summary}</p>
          </div>
          <div className="topbarActions">
            <Link className="primaryButton secondaryButton linkButton" href={`/onsen/${accommodation.slug}`}>
              상세
            </Link>
            <Link className="primaryButton linkButton" href="/onsen">목록으로</Link>
          </div>
        </header>

        <section className="summaryGrid compact">
          <div className="summaryCard">
            <span>온천수</span>
            <strong className="smallValue">{waterUseStatusLabels[accommodation.waterUseStatus]}</strong>
          </div>
          <div className="summaryCard">
            <span>유형</span>
            <strong className="smallValue">{waterSourceTypeLabels[accommodation.waterSourceType]}</strong>
          </div>
          <div className="summaryCard">
            <span>객실탕</span>
            <strong className="smallValue">{bathScopeLabels[accommodation.bathScope]}</strong>
          </div>
          <div className="summaryCard">
            <span>근거 등급</span>
            <strong className="smallValue">{accommodation.evidenceGrade}</strong>
          </div>
          <div className="summaryCard">
            <span>Source</span>
            <strong className="smallValue">{accommodation.source === 'database' ? 'DB' : 'Seed'}</strong>
          </div>
        </section>

        {statusMessage ? (
          <p className={error ? 'formNotice error' : 'formNotice'}>
            {statusMessage}
          </p>
        ) : null}

        <section className="detailGrid onsenDetailGrid">
          <section className="panel">
            <div className="panelHeader">
              <h3>숙소 판단</h3>
              <span>Water decision</span>
            </div>
            <form className="inlineForm" action={updateOnsenAccommodation}>
              <input type="hidden" name="slug" value={accommodation.slug} />
              <input type="hidden" name="directReviewCount" value={accommodation.evidenceCounts.directReviewCount ?? ''} />
              <input type="hidden" name="onsenReviewCount" value={accommodation.evidenceCounts.onsenReviewCount ?? ''} />
              <input type="hidden" name="roomBathMentionCount" value={accommodation.evidenceCounts.roomBathMentionCount ?? ''} />
              <input type="hidden" name="publicBathMentionCount" value={accommodation.evidenceCounts.publicBathMentionCount ?? ''} />
              <input type="hidden" name="privateBathMentionCount" value={accommodation.evidenceCounts.privateBathMentionCount ?? ''} />
              <input type="hidden" name="waterTextureMentionCount" value={accommodation.evidenceCounts.waterTextureMentionCount ?? ''} />
              <input type="hidden" name="cautionMentionCount" value={accommodation.evidenceCounts.cautionMentionCount ?? ''} />
              <input type="hidden" name="evidenceGrade" value={accommodation.evidenceGrade} />
              <input type="hidden" name="evidenceNote" value={accommodation.evidenceNote} />

              <label htmlFor="name">숙소명</label>
              <input id="name" name="name" defaultValue={accommodation.name} />

              <label htmlFor="jaName">일본어명</label>
              <input id="jaName" name="jaName" defaultValue={accommodation.jaName ?? ''} />

              <label htmlFor="region">지역 코드</label>
              <input id="region" name="region" defaultValue={accommodation.region} />

              <label htmlFor="area">지역 표시</label>
              <input id="area" name="area" defaultValue={accommodation.area} />

              <label htmlFor="summary">요약</label>
              <textarea id="summary" name="summary" rows={6} defaultValue={accommodation.summary} />

              <label htmlFor="primaryBath">대표 온천 구조</label>
              <input id="primaryBath" name="primaryBath" defaultValue={accommodation.primaryBath} />

              <label htmlFor="waterUseStatus">온천수 사용</label>
              <select id="waterUseStatus" name="waterUseStatus" defaultValue={accommodation.waterUseStatus}>
                {Object.entries(waterUseStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <label htmlFor="waterSourceType">온천수 유형</label>
              <select id="waterSourceType" name="waterSourceType" defaultValue={accommodation.waterSourceType}>
                {Object.entries(waterSourceTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <label htmlFor="bathScope">객실탕 범위</label>
              <select id="bathScope" name="bathScope" defaultValue={accommodation.bathScope}>
                {Object.entries(bathScopeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <label htmlFor="operationNotes">운용 메모</label>
              <input
                id="operationNotes"
                name="operationNotes"
                defaultValue={accommodation.operationNotes.join(', ')}
                placeholder="물을 섞어 식힘/온도 조절, 대절탕 운영 조건"
              />

              <label htmlFor="status">상태</label>
              <select id="status" name="status" defaultValue={accommodation.status}>
                {Object.entries(onsenStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <button type="submit" className="primaryButton">숙소 데이터 저장</button>
            </form>
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h3>후기 근거</h3>
              <span>Evidence counts</span>
            </div>
            <form className="inlineForm" action={updateOnsenAccommodation}>
              <input type="hidden" name="slug" value={accommodation.slug} />
              <input type="hidden" name="name" value={accommodation.name} />
              <input type="hidden" name="jaName" value={accommodation.jaName ?? ''} />
              <input type="hidden" name="region" value={accommodation.region} />
              <input type="hidden" name="area" value={accommodation.area} />
              <input type="hidden" name="summary" value={accommodation.summary} />
              <input type="hidden" name="primaryBath" value={accommodation.primaryBath} />
              <input type="hidden" name="waterUseStatus" value={accommodation.waterUseStatus} />
              <input type="hidden" name="waterSourceType" value={accommodation.waterSourceType} />
              <input type="hidden" name="bathScope" value={accommodation.bathScope} />
              <input type="hidden" name="operationNotes" value={accommodation.operationNotes.join(', ')} />
              <input type="hidden" name="status" value={accommodation.status} />

              <div className="formGridTwo">
                <label htmlFor="directReviewCount">
                  직접 확인
                  <input
                    id="directReviewCount"
                    name="directReviewCount"
                    inputMode="numeric"
                    defaultValue={accommodation.evidenceCounts.directReviewCount ?? ''}
                  />
                </label>
                <label htmlFor="onsenReviewCount">
                  온천 관련
                  <input
                    id="onsenReviewCount"
                    name="onsenReviewCount"
                    inputMode="numeric"
                    defaultValue={accommodation.evidenceCounts.onsenReviewCount ?? ''}
                  />
                </label>
                <label htmlFor="roomBathMentionCount">
                  객실탕 체감
                  <input
                    id="roomBathMentionCount"
                    name="roomBathMentionCount"
                    inputMode="numeric"
                    defaultValue={accommodation.evidenceCounts.roomBathMentionCount ?? ''}
                  />
                </label>
                <label htmlFor="publicBathMentionCount">
                  대욕장 체감
                  <input
                    id="publicBathMentionCount"
                    name="publicBathMentionCount"
                    inputMode="numeric"
                    defaultValue={accommodation.evidenceCounts.publicBathMentionCount ?? ''}
                  />
                </label>
                <label htmlFor="privateBathMentionCount">
                  프라이빗탕
                  <input
                    id="privateBathMentionCount"
                    name="privateBathMentionCount"
                    inputMode="numeric"
                    defaultValue={accommodation.evidenceCounts.privateBathMentionCount ?? ''}
                  />
                </label>
                <label htmlFor="waterTextureMentionCount">
                  수질/원천
                  <input
                    id="waterTextureMentionCount"
                    name="waterTextureMentionCount"
                    inputMode="numeric"
                    defaultValue={accommodation.evidenceCounts.waterTextureMentionCount ?? ''}
                  />
                </label>
              </div>

              <label htmlFor="cautionMentionCount">주의 신호</label>
              <input
                id="cautionMentionCount"
                name="cautionMentionCount"
                inputMode="numeric"
                defaultValue={accommodation.evidenceCounts.cautionMentionCount ?? ''}
              />

              <label htmlFor="evidenceGrade">근거 등급</label>
              <select id="evidenceGrade" name="evidenceGrade" defaultValue={accommodation.evidenceGrade}>
                {(['A', 'B', 'C', 'D'] as const).map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>

              <label htmlFor="evidenceNote">근거 메모</label>
              <textarea id="evidenceNote" name="evidenceNote" rows={4} defaultValue={accommodation.evidenceNote} />

              <button type="submit" className="primaryButton">후기 근거 저장</button>
            </form>
          </section>

          <section className="panel wide">
            <div className="panelHeader">
              <h3>시드 출처</h3>
              <span>{accommodation.updatedAt}</span>
            </div>
            <div className="seedSourceBox">
              <strong>{accommodation.sourceFile ?? 'DB row'}</strong>
              <p>
                현재 DB row가 없으면 리서치 시드 파일을 읽어 표시합니다. 테이블을 만든 뒤 같은 slug를 넣으면 이 화면은 DB 값을 우선합니다.
              </p>
            </div>
          </section>
        </section>
      </section>
    </AdminShell>
  );
}
