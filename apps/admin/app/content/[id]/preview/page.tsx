import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminShell } from '../../../../components/AdminShell';
import {
  categoryLabels,
  contentStatusLabels,
  contentTypeLabels,
  readAdminArchiveContent,
  type AdminArchiveBodyBlock,
} from '../../../../lib/archive/data';

interface PageProps {
  params: Promise<{ id: string }>;
}

function renderBodyBlock(block: AdminArchiveBodyBlock, index: number) {
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

export default async function ContentPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const content = await readAdminArchiveContent(id);

  if (!content) notFound();

  return (
    <AdminShell activePath="/content">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">ARCHIVE PREVIEW</p>
            <h2>{content.title}</h2>
            <p className="lede">비공개 초안도 관리자 권한으로 확인하는 웹 표시 미리보기입니다.</p>
          </div>
          <div className="topbarActions">
            <Link className="primaryButton secondaryButton linkButton" href={`/content/${content.id}`}>
              편집으로
            </Link>
            <Link className="primaryButton linkButton" href="/content">
              목록으로
            </Link>
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
