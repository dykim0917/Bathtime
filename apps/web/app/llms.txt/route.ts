const content = `# 바스타임

바스타임은 사우나, 홈케어, 족욕, 욕실 아이템처럼 흩어져 있는 씻고 쉬는 시간을 발견하고 저장하는 한국어 아카이브입니다.

사이트: https://www.getbathtime.com/
앱: https://play.google.com/store/apps/details?id=com.bathtimestudio.bathtime

## 핵심 페이지

- 홈: https://www.getbathtime.com/
- 바스타임이란: https://www.getbathtime.com/about
- 아카이브 탐색: https://www.getbathtime.com/explore
- 제보: https://www.getbathtime.com/submit

## 콘텐츠 원칙

- 추천 순위보다 이용 조건, 준비 부담, 관리 난이도, 다시 찾기 쉬운 기준을 우선합니다.
- 장소 콘텐츠는 공식 안내, 지도/예약 정보, 후기 패턴, 제보, 직접 경험 여부를 구분합니다.
- 제품 콘텐츠는 "추천 TOP"이 아니라 비교해볼 만한 후보와 구매 전 확인 기준으로 다룹니다.
- 건강 효과나 치료 효과를 단정하지 않고, 일상에서 시도 가능한 낮은 부담의 의식으로 설명합니다.

## 편집 기준

브랜드명은 "바스타임"입니다. 사용자에게 노출되는 문구에서는 "루틴"보다 "의식"을 우선 사용합니다.
콘텐츠는 공개 전 최신 정보, 이미지 권리, 출처 구분, 업데이트일을 확인합니다.
`;

export function GET() {
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
