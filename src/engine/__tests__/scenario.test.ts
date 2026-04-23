/**
 * 시나리오 테스트 — 8명 가상 페르소나
 * 각 페르소나의 프로필 + 인텐트를 엔진에 직접 통과시켜
 * 추천 결과(온도·시간·페르소나·안전경고·재료)를 검증한다.
 */

import { generateCareRecommendation, generateTripRecommendation } from '../recommend';
import { UserProfile, BathEnvironment, DailyTag, ThemeId } from '../types';

// ─── 헬퍼 ───────────────────────────────────────────────────────────
function makeProfile(
  env: BathEnvironment,
  conditions: UserProfile['healthConditions']
): UserProfile {
  const now = new Date().toISOString();
  return {
    bathEnvironment: env,
    healthConditions: conditions,
    onboardingComplete: true,
    createdAt: now,
    updatedAt: now,
  };
}

// ─── 8 PERSONAS ──────────────────────────────────────────────────────
describe('시나리오 테스트 — 8명 가상 페르소나', () => {

  // ① 이현수 (28세, 직장인) — 건강 이상 없음, 욕조, 퇴근 후 근육통
  describe('P01 이현수 — 건강 직장인 / 욕조 / 근육통', () => {
    const profile = makeProfile('bathtub', ['none']);
    const rec = generateCareRecommendation(profile, ['muscle_pain'], 'bathtub');

    it('P3_MUSCLE 페르소나 선택', () => expect(rec.persona).toBe('P3_MUSCLE'));
    it('권장 온도 41°C (고온 근육 이완)', () => expect(rec.temperature.recommended).toBe(41));
    it('욕조 → 전신욕(full)', () => expect(rec.bathType).toBe('full'));
    it('15분 루틴', () => expect(rec.durationMinutes).toBe(15));
    it('안전 경고 없음', () => expect(rec.safetyWarnings).toHaveLength(0));
    it('epsom_salt 포함', () => expect(rec.ingredients.map(i => i.id)).toContain('epsom_salt'));
    it('유효한 ID 형식', () => expect(rec.id).toMatch(/^rec_\d+_[a-z0-9]+$/));
  });

  // ② 김지영 (34세, 임신 6개월) — 임신, 샤워, 잠이 안 옴
  describe('P02 김지영 — 임신 6개월 / 샤워 / 불면', () => {
    const profile = makeProfile('shower', ['pregnant']);
    const rec = generateCareRecommendation(profile, ['insomnia'], 'shower');

    it('P1_SAFETY 페르소나 강제 (임신 → 안심케어)', () => expect(rec.persona).toBe('P1_SAFETY'));
    it('온도 38°C 이하 (임신 안전 상한)', () => expect(rec.temperature.recommended).toBeLessThanOrEqual(38));
    it('샤워 환경 → shower 목욕 유형', () => expect(rec.bathType).toBe('shower'));
    it('샤워 시간 10분 이하', () => {
      // shower caps at 10 min, P1_SAFETY has null duration → default 10
      if (rec.durationMinutes !== null) expect(rec.durationMinutes).toBeLessThanOrEqual(10);
    });
    it('안전 경고 포함 (임신)', () => expect(rec.safetyWarnings.length).toBeGreaterThan(0));
    it('peppermint_oil 금지', () => expect(rec.ingredients.map(i => i.id)).not.toContain('peppermint_oil'));
    it('rosemary_oil 금지', () => expect(rec.ingredients.map(i => i.id)).not.toContain('rosemary_oil'));
    it('clary_sage_oil 금지', () => expect(rec.ingredients.map(i => i.id)).not.toContain('clary_sage_oil'));
  });

  // ③ 박영호 (62세, 은퇴) — 고혈압/심장, 족욕, 몸이 차고 부음
  describe('P03 박영호 — 고혈압 / 족욕 / 냉증·부종', () => {
    const profile = makeProfile('footbath', ['hypertension_heart']);
    const rec = generateCareRecommendation(profile, ['cold', 'swelling'], 'footbath');

    it('P1_SAFETY 페르소나 강제 (고혈압)', () => expect(rec.persona).toBe('P1_SAFETY'));
    it('온도 38°C 이하', () => expect(rec.temperature.recommended).toBeLessThanOrEqual(38));
    it('족욕(foot) 유형', () => expect(rec.bathType).toBe('foot'));
    it('고혈압 안전 경고 포함', () => {
      const warnings = rec.safetyWarnings.join(' ');
      expect(warnings).toMatch(/고혈압/);
    });
  });

  // ④ 최수민 (25세, 대학생) — 건강 이상 없음, 욕조, 숙취
  describe('P04 최수민 — 건강 대학생 / 욕조 / 숙취', () => {
    const profile = makeProfile('bathtub', ['none']);
    const rec = generateCareRecommendation(profile, ['hangover'], 'bathtub');

    it('P1_SAFETY 페르소나 강제 (숙취 안전 정책)', () => expect(rec.persona).toBe('P1_SAFETY'));
    it('온도 38°C 이하 (숙취 안전 제한)', () => expect(rec.temperature.recommended).toBeLessThanOrEqual(38));
    it('강제 족욕(foot) 유형 — 숙취 안전 정책', () => expect(rec.bathType).toBe('foot'));
    it('숙취 안전 경고 포함', () => {
      const warnings = rec.safetyWarnings.join(' ');
      expect(warnings).toMatch(/음주/);
    });
  });

  // ⑤ 정혜린 (32세, 프리랜서) — 민감성 피부, 족욕, 스트레스+불면
  describe('P05 정혜린 — 민감성 피부 / 족욕 / 스트레스·불면', () => {
    const profile = makeProfile('partial_bath', ['sensitive_skin']);
    const rec = generateCareRecommendation(profile, ['stress', 'insomnia'], 'partial_bath');

    it('P4_SLEEP 페르소나 (수면 우선)', () => expect(rec.persona).toBe('P4_SLEEP'));
    it('족욕 → foot 유형', () => expect(rec.bathType).toBe('foot'));
    it('민감성 피부 경고 포함', () => {
      const warnings = rec.safetyWarnings.join(' ');
      expect(warnings).toMatch(/민감/);
    });
    it('grapefruit_oil 제외 (민감성 피부 금기)', () => {
      expect(rec.ingredients.map(i => i.id)).not.toContain('grapefruit_oil');
    });
  });

  // ⑥ 손민준 (45세, 관리직) — 당뇨, 욕조, 근육통
  describe('P06 손민준 — 당뇨 / 욕조 / 근육통', () => {
    const profile = makeProfile('bathtub', ['diabetes']);
    const rec = generateCareRecommendation(profile, ['muscle_pain'], 'bathtub');

    it('P3_MUSCLE 페르소나 (근육통 태그 매칭)', () => expect(rec.persona).toBe('P3_MUSCLE'));
    it('당뇨 경고 포함', () => {
      const warnings = rec.safetyWarnings.join(' ');
      expect(warnings).toMatch(/당뇨/);
    });
    it('당뇨 온도 상한 40°C 적용', () => {
      expect(rec.temperature.recommended).toBeLessThanOrEqual(40);
      expect(rec.temperature.max).toBeLessThanOrEqual(40);
    });
    it('욕조 → full 유형', () => expect(rec.bathType).toBe('full'));
  });

  // ⑦ 강서연 (38세, 간호사) — 건강 이상 없음, 샤워, 야간 근무 후 부종+근육통
  describe('P07 강서연 — 건강 간호사 / 샤워 / 부종·근육통', () => {
    const profile = makeProfile('shower', ['none']);
    const rec = generateCareRecommendation(profile, ['swelling', 'muscle_pain'], 'shower');

    it('샤워 환경 → shower 목욕 유형', () => expect(rec.bathType).toBe('shower'));
    it('시간 10분 이하 (샤워 캡)', () => {
      if (rec.durationMinutes !== null) expect(rec.durationMinutes).toBeLessThanOrEqual(10);
    });
    it('shower_steamer 재료 포함', () => {
      expect(rec.ingredients.map(i => i.id)).toContain('shower_steamer');
    });
    it('epsom_salt 제외 (샤워 불가 재료)', () => {
      expect(rec.ingredients.map(i => i.id)).not.toContain('epsom_salt');
    });
    it('안전 경고 없음', () => expect(rec.safetyWarnings).toHaveLength(0));
  });

  // ⑧ 윤태준 (55세, 중년) — 고혈압+당뇨 복합, 욕조, 트립 루틴 (교토)
  describe('P08 윤태준 — 고혈압+당뇨 / 욕조 / 트립 교토 숲', () => {
    const profile = makeProfile('bathtub', ['hypertension_heart', 'diabetes']);
    const rec = generateTripRecommendation(profile, 'kyoto_forest', 'bathtub');

    it('Trip 모드', () => expect(rec.mode).toBe('trip'));
    it('kyoto_forest 테마', () => expect(rec.themeId).toBe('kyoto_forest'));
    it('온도 38°C 이하 (고혈압 안전 상한)', () => expect(rec.temperature.recommended).toBeLessThanOrEqual(38));
    it('고혈압 경고 포함', () => {
      const warnings = rec.safetyWarnings.join(' ');
      expect(warnings).toMatch(/고혈압/);
    });
    it('당뇨 경고 포함', () => {
      const warnings = rec.safetyWarnings.join(' ');
      expect(warnings).toMatch(/당뇨/);
    });
    it('hinoki_oil 재료 포함', () => {
      expect(rec.ingredients.map(i => i.id)).toContain('hinoki_oil');
    });
    it('유효한 ID 형식', () => expect(rec.id).toMatch(/^rec_\d+_[a-z0-9]+$/));
  });

});
