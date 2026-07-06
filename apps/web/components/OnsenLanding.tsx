import { readOnsenCandidates } from '@web/lib/onsenData';
import { buildOnsenSearchSuggestions, popularOnsenSearches, recommendedOnsenPlaces } from '@web/lib/onsenSearch';
import { OnsenSearchForm } from './OnsenSearchForm';

export async function OnsenLanding() {
  const candidates = await readOnsenCandidates();
  const suggestions = buildOnsenSearchSuggestions(candidates);

  return (
    <div className="onsen-home">
      <section className="onsen-search-hero" aria-labelledby="onsen-search-title">
        <div className="onsen-hero-copy-block">
          <p className="onsen-kicker">바스타임 온천 검색기</p>
          <h1 id="onsen-search-title">숙소보다 먼저, 어떤 온천인지 확인하세요.</h1>

          <OnsenSearchForm suggestions={suggestions} recommendedPlaces={recommendedOnsenPlaces} popularSearches={popularOnsenSearches} />
        </div>
      </section>
    </div>
  );
}
