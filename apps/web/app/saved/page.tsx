import type { Metadata } from 'next';
import { SavedContentList } from '@web/components/SavedContentList';
import { SavedSettingsButton } from '@web/components/SavedSettingsButton';
import { getPublishedArchiveContents } from '@web/lib/archive';

export const revalidate = 300;

export const metadata: Metadata = {
  title: '보관함',
  description: '앱에서 저장한 바스타임 콘텐츠를 이어서 확인합니다.',
};

export default async function SavedPage() {
  const contents = await getPublishedArchiveContents();

  return (
    <div className="page-stack">
      <div className="saved-header-row">
        <header className="page-header compact">
          <p className="kicker">SAVED</p>
          <h1>다시 보고 싶은 바스타임 기록</h1>
          <p>저장한 공간, 아이템, 의식 기록을 한곳에서 확인합니다.</p>
        </header>
        <SavedSettingsButton />
      </div>
      <SavedContentList contents={contents} />
    </div>
  );
}
