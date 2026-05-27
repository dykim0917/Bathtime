'use client';

import { useMemo, useState } from 'react';

import { type AdminArchiveBodyBlock } from '../lib/archive/data';

type ArchiveBodyAction = (formData: FormData) => void | Promise<void>;

interface ArchiveBodyBlockEditorProps {
  contentId: string;
  initialHeroImage: Record<string, unknown> | null;
  initialBody: AdminArchiveBodyBlock[];
  structuredInfo: Record<string, unknown>;
  seo: Record<string, unknown>;
  action: ArchiveBodyAction;
  assetUploadAction: ArchiveBodyAction;
}

type BodyBlockType = 'paragraph' | 'heading' | 'image' | 'quote' | 'list' | 'divider';

const maxAssetUploadBytes = 4 * 1024 * 1024;
const maxAssetUploadLabel = '4MB';

interface AssetFileState {
  name: string;
  error: string;
}

function getAssetFileState(file: File | undefined): AssetFileState {
  if (!file) return { name: '', error: '' };
  if (file.size > maxAssetUploadBytes) {
    return {
      name: file.name,
      error: `이미지는 ${maxAssetUploadLabel} 이하로 줄여서 업로드해주세요.`,
    };
  }
  return { name: file.name, error: '' };
}

function createBlock(type: BodyBlockType): AdminArchiveBodyBlock {
  if (type === 'heading') return { type, text: '새 제목' };
  if (type === 'quote') return { type, text: '인용 문구를 입력하세요.' };
  if (type === 'list') return { type, items: ['첫 번째 항목'] };
  if (type === 'image') return { type, uri: '', caption: '' };
  if (type === 'divider') return { type };
  return { type: 'paragraph', text: '문단을 입력하세요.' };
}

function updateTextBlock(
  block: AdminArchiveBodyBlock,
  text: string
): AdminArchiveBodyBlock {
  if (block.type === 'heading' || block.type === 'paragraph' || block.type === 'quote') {
    return { ...block, text };
  }
  return block;
}

function getBlockLabel(type: BodyBlockType): string {
  if (type === 'heading') return '제목';
  if (type === 'quote') return '인용';
  if (type === 'list') return '리스트';
  if (type === 'image') return '이미지';
  if (type === 'divider') return '구분선';
  return '문단';
}

function isEditableBlock(block: AdminArchiveBodyBlock): block is Extract<AdminArchiveBodyBlock, { type: BodyBlockType }> {
  return ['paragraph', 'heading', 'image', 'quote', 'list', 'divider'].includes(block.type);
}

export function ArchiveBodyBlockEditor({
  contentId,
  initialHeroImage,
  initialBody,
  structuredInfo,
  seo,
  action,
  assetUploadAction,
}: ArchiveBodyBlockEditorProps) {
  const [heroImageText, setHeroImageText] = useState(() =>
    JSON.stringify(initialHeroImage ?? {}, null, 2)
  );
  const [blocks, setBlocks] = useState<AdminArchiveBodyBlock[]>(initialBody);
  const [heroAssetFile, setHeroAssetFile] = useState<AssetFileState>({ name: '', error: '' });
  const [bodyAssetFiles, setBodyAssetFiles] = useState<Record<number, AssetFileState>>({});

  const bodyJson = useMemo(() => JSON.stringify(blocks), [blocks]);

  const addBlock = (type: BodyBlockType) => {
    setBlocks((current) => [...current, createBlock(type)]);
  };

  const updateBlock = (index: number, nextBlock: AdminArchiveBodyBlock) => {
    setBlocks((current) => current.map((block, blockIndex) => (blockIndex === index ? nextBlock : block)));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    setBlocks((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      const [block] = next.splice(index, 1);
      next.splice(nextIndex, 0, block);
      return next;
    });
  };

  const removeBlock = (index: number) => {
    setBlocks((current) => current.filter((_, blockIndex) => blockIndex !== index));
    setBodyAssetFiles((current) => {
      const next: Record<number, AssetFileState> = {};
      Object.entries(current).forEach(([key, value]) => {
        const numericKey = Number(key);
        if (numericKey < index) next[numericKey] = value;
        if (numericKey > index) next[numericKey - 1] = value;
      });
      return next;
    });
  };

  const updateBodyAssetFile = (index: number, file: File | undefined) => {
    setBodyAssetFiles((current) => ({ ...current, [index]: getAssetFileState(file) }));
  };

  return (
    <div className="inlineForm">
      <label htmlFor="heroImage">대표 이미지 JSON</label>
      <textarea
        id="heroImage"
        name="heroImage"
        rows={5}
        value={heroImageText}
        onChange={(event) => setHeroImageText(event.currentTarget.value)}
      />
      <form className="assetUploadRow" action={assetUploadAction} encType="multipart/form-data">
        <input type="hidden" name="id" value={contentId} />
        <input type="hidden" name="body" value={bodyJson} />
        <input type="hidden" name="structuredInfo" value={JSON.stringify(structuredInfo)} />
        <input type="hidden" name="seo" value={JSON.stringify(seo)} />
        <input type="hidden" name="heroImage" value={heroImageText} />
        <input type="hidden" name="assetTarget" value="hero" />
        <div className="assetFileControl">
          <input
            id="assetFile_hero"
            name="assetFile_hero"
            type="file"
            accept="image/*"
            onChange={(event) => setHeroAssetFile(getAssetFileState(event.currentTarget.files?.[0]))}
          />
          <span className={heroAssetFile.error ? 'assetFileName assetFileError' : 'assetFileName'}>
            {heroAssetFile.error || heroAssetFile.name || '선택된 파일 없음'}
          </span>
        </div>
        <button
          type="submit"
          className="primaryButton secondaryButton"
          disabled={!heroAssetFile.name || Boolean(heroAssetFile.error)}
        >
          대표 이미지 업로드
        </button>
      </form>

      <div className="blockToolbar" aria-label="본문 블록 추가">
        {(['paragraph', 'heading', 'list', 'quote', 'image', 'divider'] as BodyBlockType[]).map((type) => (
          <button key={type} type="button" className="secondaryButton miniButton" onClick={() => addBlock(type)}>
            {getBlockLabel(type)}
          </button>
        ))}
      </div>

      <div className="blockEditorStack">
        {blocks.length === 0 ? <p className="mutedText">본문 블록이 없습니다. 위 버튼으로 블록을 추가하세요.</p> : null}
        {blocks.map((block, index) => (
          <section className="blockEditorCard" key={`${block.type}-${index}`}>
            <div className="blockEditorHeader">
              <strong>{index + 1}. {isEditableBlock(block) ? getBlockLabel(block.type) : block.type}</strong>
              <div>
                <button type="button" className="textButton" onClick={() => moveBlock(index, -1)}>위로</button>
                <button type="button" className="textButton" onClick={() => moveBlock(index, 1)}>아래로</button>
                <button type="button" className="textButton dangerText" onClick={() => removeBlock(index)}>삭제</button>
              </div>
            </div>

            {!isEditableBlock(block) ? (
              <pre className="mutedText">{JSON.stringify(block, null, 2)}</pre>
            ) : null}

            {block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote' ? (
              <textarea
                rows={block.type === 'heading' ? 2 : 4}
                value={block.text}
                onChange={(event) => updateBlock(index, updateTextBlock(block, event.currentTarget.value))}
              />
            ) : null}

            {block.type === 'list' ? (
              <textarea
                rows={5}
                value={block.items.join('\n')}
                onChange={(event) =>
                  updateBlock(index, {
                    type: 'list',
                    items: event.currentTarget.value.split('\n').map((item) => item.trim()).filter(Boolean),
                  })
                }
              />
            ) : null}

            {block.type === 'image' ? (
              <>
                <label htmlFor={`image-uri-${index}`}>이미지 URI</label>
                <input
                  id={`image-uri-${index}`}
                  value={block.uri}
                  onChange={(event) => updateBlock(index, { ...block, uri: event.currentTarget.value })}
                />
                <form className="assetUploadRow" action={assetUploadAction} encType="multipart/form-data">
                  <input type="hidden" name="id" value={contentId} />
                  <input type="hidden" name="body" value={bodyJson} />
                  <input type="hidden" name="structuredInfo" value={JSON.stringify(structuredInfo)} />
                  <input type="hidden" name="seo" value={JSON.stringify(seo)} />
                  <input type="hidden" name="heroImage" value={heroImageText} />
                  <input type="hidden" name="assetTarget" value={`body:${index}`} />
                  <div className="assetFileControl">
                    <input
                      name={`assetFile_${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(event) => updateBodyAssetFile(index, event.currentTarget.files?.[0])}
                    />
                    <span className={bodyAssetFiles[index]?.error ? 'assetFileName assetFileError' : 'assetFileName'}>
                      {bodyAssetFiles[index]?.error || bodyAssetFiles[index]?.name || '선택된 파일 없음'}
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="primaryButton secondaryButton"
                    disabled={!bodyAssetFiles[index]?.name || Boolean(bodyAssetFiles[index]?.error)}
                  >
                    이미지 업로드
                  </button>
                </form>
                <label htmlFor={`image-caption-${index}`}>캡션</label>
                <input
                  id={`image-caption-${index}`}
                  value={block.caption ?? ''}
                  onChange={(event) => updateBlock(index, { ...block, caption: event.currentTarget.value })}
                />
              </>
            ) : null}

            {block.type === 'divider' ? <p className="mutedText">웹 본문에 구분선으로 표시됩니다.</p> : null}
          </section>
        ))}
      </div>

      <form action={action} encType="multipart/form-data">
        <input type="hidden" name="id" value={contentId} />
        <input type="hidden" name="body" value={bodyJson} />
        <input type="hidden" name="structuredInfo" value={JSON.stringify(structuredInfo)} />
        <input type="hidden" name="seo" value={JSON.stringify(seo)} />
        <input type="hidden" name="heroImage" value={heroImageText} />
        <button type="submit" className="primaryButton">본문 저장</button>
      </form>
    </div>
  );
}
