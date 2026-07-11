export type OnsenTermInfoKey =
  | 'waterCriteria'
  | 'directWater'
  | 'pureDirectWater'
  | 'recirculatedWater'
  | 'slipperyWater'
  | 'saltWater'
  | 'sulfurWater'
  | 'carbonatedWater'
  | 'whiteCloudyWater'
  | 'brownWater'
  | 'temperatureCondition'
  | 'winterCaution';

export type OnsenTermInfo = {
  title: string;
  description: string;
};

const termInfo: Record<OnsenTermInfoKey, OnsenTermInfo> = {
  waterCriteria: {
    title: '온천수 기준',
    description: '공식 정보로 확인한 방식, 수질에서 파생한 감촉, 공식 색 근거를 나눠서 봅니다.',
  },
  directWater: {
    title: '직수',
    description: '온천수를 흘려보내는 방식입니다. 가수, 가온 같은 조건은 상세에서 따로 확인합니다.',
  },
  pureDirectWater: {
    title: '순수직수',
    description: '물을 더하거나 데우지 않고 원천 그대로 흘려보내는 방식으로 확인된 경우에만 씁니다.',
  },
  recirculatedWater: {
    title: '순환식 온천',
    description: '온천수를 여과하거나 순환해 다시 쓰는 방식입니다. 직수와 구분해서 봅니다.',
  },
  slipperyWater: {
    title: '미끌미끌',
    description: '탄산수소염천이나 알칼리성 단순온천처럼 물이 매끈하게 느껴지는 계열입니다. 효능은 단정하지 않습니다.',
  },
  saltWater: {
    title: '소금탕',
    description: '염화물천이나 황산염천처럼 염분 계열로 분류되는 온천입니다. 따뜻함 언급은 카운트로만 봅니다.',
  },
  sulfurWater: {
    title: '유황탕',
    description: '유황천 계열입니다. 냄새와 온천 실감이 강할 수 있어 자극 언급을 함께 확인합니다.',
  },
  carbonatedWater: {
    title: '탄산온천',
    description: '이산화탄소천 계열입니다. 기포나 탄산감 언급은 직접 읽은 후기 수와 함께 봅니다.',
  },
  whiteCloudyWater: {
    title: '백탁',
    description: '공식 표기나 사진에서 물이 뽀얗게 흐려지는 니고리유 계열로 확인된 경우에 씁니다.',
  },
  brownWater: {
    title: '갈색빛',
    description: '공식 표기나 사진에서 철분 등으로 갈색, 적갈색 물빛이 확인된 경우에 씁니다.',
  },
  temperatureCondition: {
    title: '가수·가온 조건',
    description: '온천수에 물을 섞거나 데워 온도를 맞추는 조건입니다. 직수 여부와 별도로 확인합니다.',
  },
  winterCaution: {
    title: '겨울 주의',
    description: '노천탕 냉감이나 계절별 이용 조건처럼 예약 전에 같이 확인할 변수를 뜻합니다.',
  },
};

export function getOnsenTermInfo(key: OnsenTermInfoKey) {
  return termInfo[key];
}
