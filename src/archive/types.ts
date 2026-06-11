export type ContentCategory = 'HOME_BATH' | 'BATH_PLACES' | 'BATH_ITEMS' | 'TIPS_CULTURE';

export type ContentType = 'TRIED' | 'RESEARCHED' | 'ORGANIZED' | 'VISITED' | 'SUBMITTED' | 'UPDATED';

export type CareEnvironment = 'shower' | 'footbath' | 'bath' | 'sauna';

export type CareCTA = {
  label: string;
  action: 'start_timer' | 'save' | 'view_related' | 'submit' | 'open_article' | 'open_item';
  targetId?: string;
  emphasis: 'primary' | 'secondary' | 'tertiary';
};

export type CareSummaryCard = {
  situation: string;
  recommendedFor: string[];
  duration: {
    minMinutes: number;
    maxMinutes: number;
    label: string;
  };
  environments: CareEnvironment[];
  bathtubRequired: boolean;
  items: string[];
  difficulty: 'low' | 'medium' | 'high';
  bestTiming?: string;
  intensity: 'low' | 'medium' | 'high';
  avoidWhen: string[];
  primaryCTA: {
    label: string;
    timerId?: string;
  };
};

export type CareRitual = {
  id: string;
  environment: CareEnvironment;
  durationMinutes: number;
  title: string;
};

export type CareSource = {
  title: string;
  type: 'paper' | 'medical_org' | 'public_health' | 'expert_org' | 'book' | 'official_site';
  url?: string;
  note?: string;
};

export type P0CareBodyBlock =
  | { type: 'heroIntro'; eyebrow: string; title: string; intro: string[] }
  | { type: 'aha'; title: string; text: string }
  | {
      type: 'mechanism';
      title: string;
      subtitle?: string;
      steps: { label: string; description: string; icon?: string }[];
      visualHint?: string;
    }
  | {
      type: 'evidenceCard';
      title: string;
      intro?: string;
      items: {
        sourceName: string;
        year?: string;
        sourceType?: CareSource['type'];
        finding: string;
        bathtimeTakeaway: string;
        url?: string;
      }[];
    }
  | {
      type: 'ritualTimer';
      title: string;
      description?: string;
      environment?: CareEnvironment;
      durationMinutes: number;
      timerId: string;
      steps: { timeLabel: string; title: string; instruction: string }[];
      ctaLabel: string;
    }
  | { type: 'safetyBox'; title: string; tone?: 'gentle' | 'caution' | 'medical'; items: string[]; note?: string }
  | { type: 'ctaGroup'; title?: string; items: CareCTA[] };

export type ContentBodyBlock =
  | { type: 'paragraph'; text: string; legacyFallback?: boolean }
  | { type: 'heading'; text: string; legacyFallback?: boolean }
  | { type: 'image'; uri: string; caption?: string; aspectRatio?: number }
  | {
      type: 'productCandidates';
      items: {
        name: string;
        brand: string;
        imageUri: string;
        purchaseUrl: string;
        priceLabel: string;
        priceCheckedAt: string;
        badge?: string;
        metaSummary?: string;
        specSummary?: string;
        ctaLabel?: string;
        summary: string;
        watchOut: string;
        sourceLabel?: string;
      }[];
    }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[]; legacyFallback?: boolean }
  | { type: 'divider' }
  | P0CareBodyBlock;

export type HomeBathStructuredInfo = {
  durationMinutes?: number;
  bathRequired?: boolean;
  requiredItems?: string[];
  difficulty?: 'low' | 'medium' | 'high';
  recommendedSituations?: string[];
  environment?: 'shower' | 'footbath' | 'bath' | 'home_spa';
};

export type PlaceStructuredInfo = {
  publicAccess?: 'available' | 'restricted' | 'members_only' | 'unknown';
  priceRange?: string;
  reservationRequired?: boolean | 'unknown';
  region?: string;
  suitableForSolo?: boolean;
  suitableForCouple?: boolean;
  privateLevel?: 'public' | 'semi_private' | 'private' | 'unknown';
  facilityTypes?: string[];
  lastCheckedAt?: string;
};

export type ItemStructuredInfo = {
  itemType?: string;
  useCases?: string[];
  bathRequired?: boolean;
  storageDifficulty?: 'low' | 'medium' | 'high' | 'unknown';
  maintenanceDifficulty?: 'low' | 'medium' | 'high' | 'unknown';
  priceRange?: string;
  recommendedFor?: string[];
  notRecommendedFor?: string[];
};

export type TipsStructuredInfo = {
  topic?: string;
  relatedCategories?: ContentCategory[];
  difficulty?: 'low' | 'medium' | 'high';
};

export type StructuredInfoOverviewRow = {
  label: string;
  value: string | string[] | number | boolean | null;
  iconPath?: string;
  iconLabel?: string;
};

type StructuredInfoOverrides = {
  overviewRows?: StructuredInfoOverviewRow[];
};

export type StructuredInfo =
  (
    | HomeBathStructuredInfo
    | PlaceStructuredInfo
    | ItemStructuredInfo
    | TipsStructuredInfo
  ) &
    StructuredInfoOverrides;

export type ContentSeoMetadata = {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
};

export type ImageAsset = {
  uri: string;
  alt: string;
  credit?: string;
  sourceType?: 'owned' | 'official' | 'licensed' | 'generated' | 'none';
};

export type ArchiveContent = {
  id: string;
  title: string;
  subtitle?: string;
  summary: string;
  category: ContentCategory;
  contentType: ContentType;
  tags: string[];
  heroImage?: ImageAsset;
  body: ContentBodyBlock[];
  structuredInfo: StructuredInfo;
  relatedRoutineIds?: string[];
  relatedItemIds?: string[];
  relatedPlaceIds?: string[];
  careArchive?: {
    templateVersion: 'care-archive.v1';
    summaryCard: CareSummaryCard;
    ahaPoint: string;
    rituals: CareRitual[];
    ctas: CareCTA[];
    sources: CareSource[];
    disclaimers: string[];
  };
  seo?: ContentSeoMetadata;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RoutinePreset = {
  id: string;
  title: string;
  durationMinutes: number;
  environment: 'shower' | 'footbath' | 'bath' | 'free';
  situationTags: string[];
  description?: string;
  steps: string[];
  relatedContentIds?: string[];
  isPublished: boolean;
};

export type SubmissionStatus = 'new' | 'reviewing' | 'accepted' | 'rejected';

export type Submission = {
  id: string;
  userId?: string;
  type: 'sauna_spa' | 'bathtub_stay' | 'home_spa' | 'item' | 'topic';
  linkOrImage?: string;
  comment: string;
  nickname?: string;
  canPublish?: boolean;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
};
