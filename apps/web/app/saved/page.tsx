import type { Metadata } from 'next';
import { SavedContentList } from '@web/components/SavedContentList';
import { SavedSettingsButton } from '@web/components/SavedSettingsButton';
import { getPublishedArchiveContents } from '@web/lib/archive';
import { readOnsenCandidates } from '@web/lib/onsenData';

export const revalidate = 300;

export const metadata: Metadata = {
  title: '찜한 온천',
  description: '바스타임 온천 검색기에서 찜한 료칸과 온천 조건을 다시 확인합니다.',
};

export default async function SavedPage() {
  const [contents, onsenCandidates] = await Promise.all([getPublishedArchiveContents(), readOnsenCandidates()]);

  return (
    <div className="page-stack">
      <div className="saved-header-row">
        <header className="page-header compact">
          <p className="kicker">SAVED</p>
          <h1>찜한 온천</h1>
          <p>비교 중인 료칸과 온천 조건을 한곳에 모아둡니다.</p>
        </header>
        <SavedSettingsButton />
      </div>
      <SavedContentList contents={contents} onsenCandidates={onsenCandidates} />
    </div>
  );
}
