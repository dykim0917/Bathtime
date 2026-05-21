import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminShell } from '../../../../components/AdminShell';
import {
  categoryLabels,
  contentStatusLabels,
  contentTypeLabels,
  readAdminArchiveContent,
  readPreviewArchiveContent,
  type AdminArchiveBodyBlock,
} from '../../../../lib/archive/data';
import { isValidPreviewToken, previewTokenParam } from '../../../../lib/previewToken';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

function renderBodyBlock(block: AdminArchiveBodyBlock, index: number) {
  if (block.type === 'heroIntro') {
    return (
      <section key={index}>
        <p className="eyebrow">{block.eyebrow}</p>
        <h2>{block.title}</h2>
        {block.intro.map((text) => <p key={text}>{text}</p>)}
      </section>
    );
  }

  if (block.type === 'aha') {
    return (
      <blockquote key={index}>
        <strong>{block.title}</strong>
        <p>{block.text}</p>
      </blockquote>
    );
  }

  if (block.type === 'mechanism') {
    return (
      <section key={index}>
        <h3>{block.title}</h3>
        {block.subtitle ? <p>{block.subtitle}</p> : null}
        <ol>
          {block.steps.map((step) => (
            <li key={step.label}>
              <strong>{step.label}</strong>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  if (block.type === 'evidenceCard') {
    return (
      <section key={index}>
        <h3>{block.title}</h3>
        {block.intro ? <p>{block.intro}</p> : null}
        {block.items.map((item) => (
          <article key={`${item.sourceName}-${item.year ?? ''}`}>
            <strong>{item.sourceName}{item.year ? ` · ${item.year}` : ''}</strong>
            <p>{item.finding}</p>
            <p>배스타임 해석: {item.bathtimeTakeaway}</p>
          </article>
        ))}
      </section>
    );
  }

  if (block.type === 'ritualTimer') {
    return (
      <section key={index}>
        <h3>{block.title}</h3>
        {block.description ? <p>{block.description}</p> : null}
        <p>{block.durationMinutes}분 · {block.timerId}</p>
        <ol>
          {block.steps.map((step) => (
            <li key={`${step.timeLabel}-${step.title}`}>
              <strong>{step.timeLabel} {step.title}</strong>
              <p>{step.instruction}</p>
            </li>
          ))}
        </ol>
        <p>{block.ctaLabel}</p>
      </section>
    );
  }

  if (block.type === 'safetyBox') {
    return (
      <section key={index}>
        <h3>{block.title}</h3>
        <ul>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>
        {block.note ? <p>{block.note}</p> : null}
      </section>
    );
  }

  if (block.type === 'ctaGroup') {
    return (
      <section key={index}>
        {block.title ? <h3>{block.title}</h3> : null}
        <ul>{block.items.map((item) => <li key={`${item.action}-${item.targetId ?? item.label}`}>{item.label}</li>)}</ul>
      </section>
    );
  }

  if (block.type === 'heading') {
    return <h3 key={index}>{block.text}</h3>;
  }

  if (block.type === 'quote') {
    return <blockquote key={index}>{block.text}</blockquote>;
  }

  if (block.type === 'list') {
    return (
      <ul key={index}>
        {block.items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    );
  }

  if (block.type === 'image') {
    return (
      <figure key={index}>
        <div className="previewImageFallback">{block.uri || '이미지 URI 없음'}</div>
        {block.caption ? <figcaption>{block.caption}</figcaption> : null}
      </figure>
    );
  }

  if (block.type === 'divider') {
    return <hr key={index} />;
  }

  return <p key={index}>{block.text}</p>;
}

export default async function ContentPreviewPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { token } = await searchParams;
  const hasPreviewToken = isValidPreviewToken(token);
  const content = hasPreviewToken
    ? await readPreviewArchiveContent(id)
    : await readAdminArchiveContent(id);

  if (!content) notFound();

  return (
    <AdminShell activePath="/content">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">ARCHIVE PREVIEW</p>
            <h2>{content.title}</h2>
            <p className="lede">
              {hasPreviewToken
                ? '공유 토큰으로 확인하는 비공개 초안 웹 표시 미리보기입니다.'
                : '비공개 초안도 관리자 권한으로 확인하는 웹 표시 미리보기입니다.'}
            </p>
          </div>
          <div className="topbarActions">
            {hasPreviewToken ? null : (
              <>
                <Link className="primaryButton secondaryButton linkButton" href={`/content/${content.id}`}>
                  편집으로
                </Link>
                <Link className="primaryButton linkButton" href="/content">
                  목록으로
                </Link>
              </>
            )}
          </div>
        </header>

        <article className="webPreviewFrame">
          <section className="webPreviewHero">
            <div>
              <p>{categoryLabels[content.category]} · {contentTypeLabels[content.contentType]}</p>
              <h1>{content.title}</h1>
              {content.subtitle ? <h2>{content.subtitle}</h2> : null}
              <div className="webPreviewSummary">
                <span>요약</span>
                <strong>{content.summary}</strong>
              </div>
            </div>
            <aside>
              <span>Status</span>
              <strong>{contentStatusLabels[content.status]}</strong>
              <span>Published</span>
              <strong>{content.isPublished ? 'true' : 'false'}</strong>
              <span>Preview</span>
              <strong>{hasPreviewToken ? previewTokenParam : 'admin'}</strong>
            </aside>
          </section>

          <section className="webPreviewColumns">
            <div className="webPreviewBody">
              {content.body.length > 0 ? content.body.map(renderBodyBlock) : (
                <p>본문 블록이 없습니다.</p>
              )}
            </div>
            <aside className="webPreviewMeta">
              <h3>구조화 정보</h3>
              <pre>{JSON.stringify(content.structuredInfo, null, 2)}</pre>
              <h3>SEO</h3>
              <pre>{JSON.stringify(content.seo, null, 2)}</pre>
            </aside>
          </section>
        </article>
      </section>
    </AdminShell>
  );
}
