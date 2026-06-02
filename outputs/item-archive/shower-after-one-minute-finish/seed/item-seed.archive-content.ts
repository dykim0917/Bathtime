import type { ArchiveContent } from '@/src/archive/types';

export const showerAfterOneMinuteFinishContent: ArchiveContent = {
  id: 'item-shower-after-one-minute-finish',
  title: '샤워 후 만족감은 물을 끈 뒤 1분에서 갈립니다.',
  subtitle: '큰 수건, 가운, 바디로션은 사야 할 목록이 아니라 물을 끈 뒤 몸이 식기 전까지의 마무리를 돕는 장치입니다.',
  summary: '샤워 후 첫 1분을 수건, 가운, 바디로션의 동선으로 정리해 씻은 뒤의 만족감을 놓치지 않는 방법을 다룹니다.',
  category: 'BATH_ITEMS',
  contentType: 'ORGANIZED',
  tags: ['샤워 후', '큰 수건', '목욕 가운', '바디로션', '보습 루틴', '수면 전', '홈스파 입문'],
  heroImage: {
    uri: 'https://rgbzlnagkbgisljwycio.supabase.co/storage/v1/object/public/bathtime-assets/archive/item-shower-after-one-minute-finish/hero.webp',
    alt: '샤워 후 마른 큰 수건과 가운, 바디로션이 욕실 밖 의자에 준비된 장면',
    sourceType: 'generated',
  },
  body: [
    { type: 'heading', text: '한 줄 판단' },
    {
      type: 'paragraph',
      text: '샤워 후 만족감은 물을 더 오래 맞아서가 아니라, 물을 끈 뒤 첫 1분을 덜 허둥대게 만들 때 달라집니다. 큰 수건, 가운, 바디로션은 각각 닦기, 감싸기, 보습을 맡는 마무리 도구입니다.',
    },
    {
      type: 'image',
      uri: 'https://rgbzlnagkbgisljwycio.supabase.co/storage/v1/object/public/bathtime-assets/archive/item-shower-after-one-minute-finish/body-1.webp',
      caption: '샤워 후 물기 누르기, 몸 감싸기, 보습 연결을 순서대로 보여주는 마무리 동선 이미지입니다.',
      aspectRatio: 2,
    },
    { type: 'heading', text: '어떤 의식을 돕나요' },
    {
      type: 'paragraph',
      text: '이 노트는 샤워 후 몸을 닦고 바로 방으로 나가는 습관 사이에 짧은 정착 시간을 둡니다. 물기를 누르듯 닦고, 몸이 식기 전에 감싸고, 손이 닿는 곳에서 보습까지 끝내는 흐름입니다.',
    },
    { type: 'heading', text: '왜 1분인가요' },
    {
      type: 'paragraph',
      text: '샤워 직후에는 몸에 물기가 남아 있고 욕실 밖 공기는 더 차갑게 느껴집니다. 이때 수건을 찾느라 늦어지거나 로션이 멀리 있으면 마무리는 금방 숙제가 됩니다. 1분은 긴 루틴이 아니라 끊기지 않는 동선입니다.',
    },
    {
      type: 'mechanism',
      title: '세 가지 도구가 맡는 일',
      subtitle: '좋은 물건을 고르는 글이 아니라, 물을 끈 뒤 순서를 정리하는 글입니다.',
      steps: [
        {
          label: '큰 수건',
          description:
            '몸을 비비며 급하게 닦기보다 물기를 눌러 닦을 여유를 만듭니다. 대신 두꺼운 수건일수록 말릴 자리와 세탁 주기가 중요합니다.',
        },
        {
          label: '목욕 가운',
          description:
            '샤워 후 바로 눕거나 옷을 급히 입기 전, 몸이 식지 않게 잠깐 머물 시간을 줍니다. 매일 쓰려면 욕실 밖에 걸 자리와 건조 시간이 필요합니다.',
        },
        {
          label: '바디로션',
          description:
            '보습을 해야 할 일로 미루지 않고 샤워를 닫는 마지막 동작으로 바꿉니다. 향이나 제형보다 손에 닿는 위치와 바르는 부담이 먼저입니다.',
        },
      ],
    },
    { type: 'heading', text: '시작 전에 먼저 볼 것' },
    {
      type: 'list',
      items: [
        '샤워부스나 욕실 문 근처에 마른 수건이 있는가',
        '젖은 큰 수건이나 가운을 펼쳐 말릴 자리가 있는가',
        '바디로션을 물기 닦은 직후 손에 닿는 곳에 둘 수 있는가',
        '향이 강한 제품을 수면 전에도 편하게 쓸 수 있는가',
        '수건과 가운 세탁 주기를 감당할 수 있는가',
      ],
    },
    { type: 'heading', text: '좋게 볼 수 있는 점' },
    {
      type: 'list',
      items: [
        '샤워 후 몸이 식기 전까지의 공백이 줄어듭니다.',
        '보습을 미루지 않고 자연스럽게 이어가기 쉽습니다.',
        '욕조가 없어도 씻은 뒤 마무리감이 생깁니다.',
      ],
    },
    { type: 'heading', text: '아쉬운 점' },
    {
      type: 'list',
      items: [
        '큰 수건과 가운은 말릴 자리가 없으면 금방 부담이 됩니다.',
        '로션은 제형이 무겁거나 향이 강하면 수면 전 루틴에서 빠지기 쉽습니다.',
        '세 도구를 모두 갖추는 것보다 위치와 관리 동선이 더 중요합니다.',
      ],
    },
    { type: 'heading', text: '이런 사람에게 맞아요' },
    {
      type: 'list',
      items: [
        '샤워 후 바로 침대에 눕고 나서 몸이 식는 느낌이 싫은 사람',
        '바디로션을 사두고도 자주 빼먹는 사람',
        '수면 전 샤워를 조금 더 차분하게 끝내고 싶은 사람',
        '욕조 없이 샤워만으로 홈스파 감각을 만들고 싶은 사람',
      ],
    },
    { type: 'heading', text: '이런 사람에게는 애매해요' },
    {
      type: 'list',
      items: [
        '욕실에 젖은 수건이나 가운을 말릴 자리가 없는 사람',
        '세탁물이 늘어나는 것 자체가 부담스러운 사람',
        '특정 보습제가 피부 문제를 해결해주길 기대하는 사람',
      ],
    },
    {
      type: 'ritualTimer',
      title: '샤워 후 1분 마무리',
      description: '물을 끈 뒤 바로 방으로 나가지 않고 닦기, 감싸기, 보습을 한 번에 이어갑니다.',
      environment: 'shower',
      durationMinutes: 1,
      timerId: 'shower-7',
      steps: [
        {
          timeLabel: '0:00-0:20',
          title: '물기 누르기',
          instruction: '큰 수건으로 어깨, 등, 팔의 물기를 비비지 말고 눌러 닦습니다.',
        },
        {
          timeLabel: '0:20-0:40',
          title: '몸 감싸기',
          instruction: '가운이나 마른 수건으로 몸을 감싸 욕실 밖 공기에 바로 식지 않게 합니다.',
        },
        {
          timeLabel: '0:40-1:00',
          title: '보습 연결',
          instruction: '손이 닿는 곳에 둔 바디로션을 팔, 다리처럼 잊기 쉬운 부위부터 바릅니다.',
        },
      ],
      ctaLabel: '샤워 7분 루틴 열기',
    },
    { type: 'heading', text: '저장해둘 이유' },
    {
      type: 'paragraph',
      text: '이 노트는 어떤 수건이나 로션을 사야 하는지보다, 샤워 후 첫 1분을 매번 덜 놓치기 위한 배치 기준입니다. 수건, 가운, 로션의 자리를 정하기 전 다시 확인해둘 만합니다.',
    },
    { type: 'heading', text: '참고한 자료' },
    {
      type: 'list',
      items: [
        'Mayo Clinic Health System: What to do about your dry skin - https://www.mayoclinichealthsystem.org/hometown-health/speaking-of-health/what-to-do-about-dry-skin',
        'Mayo Clinic: Dry skin - https://www.mayoclinic.org/diseases-conditions/dry-skin/symptoms-causes/syc-20353885',
        'Johns Hopkins Medicine: Dry Skin - https://www.hopkinsmedicine.org/health/conditions-and-diseases/dry-skin',
        'Cleveland Clinic: How Often Should You Wash Your Bath Towels? - https://health.clevelandclinic.org/how-often-should-you-wash-your-germ-magnet-of-a-bath-towel',
      ],
    },
  ],
  structuredInfo: {
    itemType: '샤워 후 마무리 도구',
    useCases: ['샤워 후', '수면 전', '퇴근 후', '몸이 빨리 식는 날'],
    bathRequired: false,
    storageDifficulty: 'medium',
    maintenanceDifficulty: 'medium',
    priceRange: '제품별 차이 큼 · 실제 후보는 별도 비교 필요',
    recommendedFor: ['샤워 후 바로 침대에 눕는 사람', '보습을 자꾸 미루는 사람', '욕조 없이 샤워 마무리감을 만들고 싶은 사람'],
    notRecommendedFor: ['수건과 가운을 말릴 공간이 없는 사람', '향이 강한 제품에 민감한 사람', '피부 질환 치료 효과를 기대하는 사람'],
  },
  relatedRoutineIds: ['shower-7'],
  seo: {
    seoTitle: '샤워 후 만족감은 물을 끈 뒤 1분에서 갈립니다.',
    seoDescription: '큰 수건, 목욕 가운, 바디로션을 제품 추천이 아니라 샤워 후 첫 1분 마무리 의식을 돕는 도구로 정리합니다.',
    canonicalUrl: '/content/item-shower-after-one-minute-finish',
    ogImage:
      'https://rgbzlnagkbgisljwycio.supabase.co/storage/v1/object/public/bathtime-assets/archive/item-shower-after-one-minute-finish/hero.webp',
  },
  isPublished: false,
  createdAt: '2026-06-02',
  updatedAt: '2026-06-02',
};
