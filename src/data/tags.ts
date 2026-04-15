import { PhysicalTag, MentalTag } from '@/src/engine/types';

export interface TagDefinition {
  id: PhysicalTag | MentalTag;
  labelKo: string;
  labelEn: string;
  category: 'physical' | 'mental';
}

export const PHYSICAL_TAGS: TagDefinition[] = [
  { id: 'muscle_pain', labelKo: '근육통', labelEn: 'Muscle pain', category: 'physical' },
  { id: 'swelling', labelKo: '부종', labelEn: 'Swelling', category: 'physical' },
  { id: 'cold', labelKo: '감기', labelEn: 'Cold', category: 'physical' },
  { id: 'menstrual_pain', labelKo: '생리통', labelEn: 'Menstrual pain', category: 'physical' },
  { id: 'hangover', labelKo: '음주/숙취', labelEn: 'Hangover', category: 'physical' },
];

export const MENTAL_TAGS: TagDefinition[] = [
  { id: 'insomnia', labelKo: '불면', labelEn: 'Insomnia', category: 'mental' },
  { id: 'stress', labelKo: '스트레스', labelEn: 'Stress', category: 'mental' },
  { id: 'depression', labelKo: '우울', labelEn: 'Depression', category: 'mental' },
];

export const ALL_TAGS: TagDefinition[] = [...PHYSICAL_TAGS, ...MENTAL_TAGS];
