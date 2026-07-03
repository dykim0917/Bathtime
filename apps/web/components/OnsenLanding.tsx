import { readOnsenCandidates } from '@web/lib/onsenData';
import { onsenAreaFilters } from '@web/lib/onsenTaxonomy';
import { OnsenSearchForm, type OnsenSearchSuggestion } from './OnsenSearchForm';

const recommendedPlaces: OnsenSearchSuggestion[] = [
  { label: '유후인, 일본', description: '객실탕과 조용한 료칸부터 확인', href: '/onsen/results?area=yufuin', kind: 'region' },
  { label: '벳푸, 일본', description: '당일온천과 대욕장 후보 준비 중', href: '/onsen/results?query=벳푸', kind: 'region' },
  { label: '하코네, 일본', description: '도쿄 근교 온천 여행 후보', href: '/onsen/results?query=하코네', kind: 'region' },
  { label: '서울 근교 온천', description: '국내 온천 후보 준비 중', href: '/onsen/results?query=서울 근교 온천', kind: 'region' },
];

const popularSearches = [
  { label: '유후인 객실탕', href: '/onsen/results?area=yufuin&bath=room_bath' },
  { label: '유후인 가족탕', href: '/onsen/results?area=yufuin&bath=private_bath' },
  { label: '직수 온천 료칸', href: '/onsen/results?travel=ryokan_stay&water=direct_source' },
  { label: '온천수 확인', href: '/onsen/results?water=spring_confirmed' },
];

export async function OnsenLanding() {
  const candidates = await readOnsenCandidates();
  const yufuinCount = candidates.filter((candidate) => candidate.location?.onsenArea === 'yufuin').length;
  const roomBathCount = candidates.filter((candidate) => candidate.contexts?.bath.includes('room_bath')).length;
  const privateBathCount = candidates.filter((candidate) => candidate.contexts?.bath.includes('private_bath')).length;
  const areaSuggestions: OnsenSearchSuggestion[] = onsenAreaFilters.map((area) => ({
    label: `${area.label}, 일본`,
    description: area.description ?? '일본 온천 지역',
    href: area.disabled ? `/onsen/results?query=${encodeURIComponent(area.label)}` : `/onsen/results?area=${area.value}`,
    kind: 'region',
  }));
  const staySuggestions: OnsenSearchSuggestion[] = candidates.slice(0, 40).map((candidate) => ({
    label: candidate.name,
    description: candidate.location?.display ?? candidate.area ?? '일본 온천 숙소',
    href: `/onsen/${candidate.slug}`,
    kind: 'stay',
  }));
  const suggestions = [...areaSuggestions, ...staySuggestions, ...recommendedPlaces];

  return (
    <div className="onsen-home">
      <section className="onsen-search-hero" aria-labelledby="onsen-search-title">
        <div className="onsen-hero-copy-block">
          <p className="onsen-kicker">바스타임 온천 검색기</p>
          <h1 id="onsen-search-title">숙소보다 먼저, 어떤 온천인지 확인하세요.</h1>
          <p className="onsen-hero-copy">온천 이름을 몰라도 괜찮아요. 지역, 도시, 탕의 조건으로 먼저 찾아보세요.</p>

          <OnsenSearchForm suggestions={suggestions} recommendedPlaces={recommendedPlaces} popularSearches={popularSearches} />

          <p className="onsen-home-count">현재 유후인 {yufuinCount}곳을 정리했습니다.</p>
        </div>

        <div className="onsen-home-guide" aria-label="온천 검색기 확인 항목">
          <div>
            <span>{yufuinCount}</span>
            <strong>유후인 숙소</strong>
            <p>공식 안내와 이용 조건을 나눠 정리한 후보입니다.</p>
          </div>
          <div>
            <span>{roomBathCount}</span>
            <strong>객실탕 중심</strong>
            <p>객실 안에서 온천 경험이 끝나는 숙소를 따로 봅니다.</p>
          </div>
          <div>
            <span>{privateBathCount}</span>
            <strong>대절탕 가능</strong>
            <p>가족탕과 대절탕을 조용히 쓸 수 있는지를 확인합니다.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
