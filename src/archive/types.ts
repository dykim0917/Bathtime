export type ContentCategory = 'HOME_BATH' | 'BATH_PLACES' | 'BATH_ITEMS' | 'TIPS_CULTURE';

export type ContentType = 'TRIED' | 'RESEARCHED' | 'ORGANIZED' | 'VISITED' | 'SUBMITTED' | 'UPDATED';

export type ContentBodyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'image'; uri: string; caption?: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'divider' };

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

export type StructuredInfo =
  | HomeBathStructuredInfo
  | PlaceStructuredInfo
  | ItemStructuredInfo
  | TipsStructuredInfo;

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
  category: ContentCategory;
  contentType: ContentType;
  tags: string[];
  heroImage?: ImageAsset;
  body: ContentBodyBlock[];
  structuredInfo: StructuredInfo;
  relatedRoutineIds?: string[];
  relatedItemIds?: string[];
  relatedPlaceIds?: string[];
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
  type: 'sauna_spa' | 'bathtub_stay' | 'home_spa' | 'item' | 'topic';
  linkOrImage?: string;
  comment: string;
  nickname?: string;
  canPublish?: boolean;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
};
