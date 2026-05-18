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
}

type BodyBlockType = AdminArchiveBodyBlock['type'];

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

export function ArchiveBodyBlockEditor({
  contentId,
  initialHeroImage,
  initialBody,
  structuredInfo,
  seo,
  action,
}: ArchiveBodyBlockEditorProps) {
  const [heroImageText, setHeroImageText] = useState(() =>
    JSON.stringify(initialHeroImage ?? {}, null, 2)
  );
  const [blocks, setBlocks] = useState<AdminArchiveBodyBlock[]>(initialBody);

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
  };

  return (
    <form className="inlineForm" action={action}>
      <input type="hidden" name="id" value={contentId} />
      <input type="hidden" name="body" value={bodyJson} />
      <input type="hidden" name="structuredInfo" value={JSON.stringify(structuredInfo)} />
      <input type="hidden" name="seo" value={JSON.stringify(seo)} />

      <label htmlFor="heroImage">대표 이미지 JSON</label>
      <textarea
        id="heroImage"
        name="heroImage"
        rows={5}
        value={heroImageText}
        onChange={(event) => setHeroImageText(event.currentTarget.value)}
      />

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
              <strong>{index + 1}. {getBlockLabel(block.type)}</strong>
              <div>
                <button type="button" className="textButton" onClick={() => moveBlock(index, -1)}>위로</button>
                <button type="button" className="textButton" onClick={() => moveBlock(index, 1)}>아래로</button>
                <button type="button" className="textButton dangerText" onClick={() => removeBlock(index)}>삭제</button>
              </div>
            </div>

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

      <button type="submit" className="primaryButton">본문 저장</button>
    </form>
  );
}
