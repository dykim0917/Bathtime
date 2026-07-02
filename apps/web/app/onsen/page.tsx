import type { Metadata } from 'next';
import Link from 'next/link';
import { Drop, MagnifyingGlass, Mountains, Thermometer, Warning, Waves } from '@phosphor-icons/react/ssr';

export const metadata: Metadata = {
  title: '온천 검색기',
  description: '일본 료칸 예약 전 객실탕, 가족탕, 대욕장, 온천수 체감과 주의할 점을 확인하는 바스타임 온천 검색기입니다.',
  alternates: {
    canonical: '/onsen',
  },
};

const regionFilters = [
  { label: '유후인', value: 'yufuin' },
  { label: '벳푸', value: 'beppu', disabled: true },
  { label: '쿠로카와', value: 'kurokawa', disabled: true },
  { label: '하코네', value: 'hakone', disabled: true },
  { label: '노보리베츠', value: 'noboribetsu', disabled: true },
];

const pointFilters = [
  { label: '객실탕 중심', value: 'room-bath', icon: Waves },
  { label: '가족탕/대절탕 있음', value: 'private-bath', icon: Drop },
  { label: '대욕장 중심', value: 'public-bath', icon: Mountains },
  { label: '물이 부드럽다는 후기', value: 'water-texture', icon: Thermometer },
  { label: '겨울 주의', value: 'winter-caution', icon: Warning },
];

export default function OnsenPage() {
  return (
    <div className="onsen-home">
      <section className="onsen-search-hero" aria-labelledby="onsen-search-title">
        <p className="onsen-kicker">바스타임 온천 검색기</p>
        <h1 id="onsen-search-title">숙소보다 먼저, 어떤 온천인지 확인하세요.</h1>
        <p className="onsen-hero-copy">
          객실탕, 가족탕, 대욕장, 온천수 체감과 주의할 점을 예약 전에 면밀히 정리합니다.
        </p>

        <form className="onsen-search-box" action="/onsen/results">
          <MagnifyingGlass size={28} weight="regular" aria-hidden="true" />
          <input
            name="query"
            type="search"
            placeholder="료칸 이름, 지역, 온천 유형을 입력하세요"
            aria-label="온천 검색어"
          />
          <button type="submit">검색</button>
        </form>

        <div className="onsen-filter-stack" aria-label="빠른 필터">
          <div className="onsen-filter-group">
            <span className="onsen-filter-label">지역</span>
            <div className="onsen-chip-row">
              {regionFilters.map((item) =>
                item.disabled ? (
                  <span key={item.value} className="bt-chip onsen-disabled-chip" data-size="lg" data-tone="soft">
                    {item.label}
                  </span>
                ) : (
                  <Link key={item.value} className="bt-chip" data-size="lg" data-tone="soft" href={`/onsen/results?region=${item.value}`}>
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          </div>

          <div className="onsen-filter-group">
            <span className="onsen-filter-label">확인 포인트</span>
            <div className="onsen-chip-row onsen-signal-row">
              {pointFilters.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.value} className="bt-chip" data-size="md" data-tone="point" href={`/onsen/results?signal=${item.value}`}>
                    <Icon size={16} weight="bold" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="onsen-home-guide" aria-label="온천 검색기 확인 항목">
          <div>
            <strong>온천수</strong>
            <p>원천 사용인지, 물을 섞어 쓰는지 먼저 봅니다.</p>
          </div>
          <div>
            <strong>객실탕</strong>
            <p>객실탕에도 온천수가 들어오는지 따로 확인합니다.</p>
          </div>
          <div>
            <strong>운용 방식</strong>
            <p>직수 온천, 온도 조정, 탕과 풀 조건을 나눠 봅니다.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
