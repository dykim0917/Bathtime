import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminShell } from '../../../components/AdminShell';
import { ArchiveBodyBlockEditor } from '../../../components/ArchiveBodyBlockEditor';
import {
  categoryLabels,
  contentStatusLabels,
  contentTypeLabels,
  readAdminArchiveContent,
} from '../../../lib/archive/data';
import {
  uploadArchiveContentImage,
  updateArchiveContentBasicInfo,
  updateArchiveContentBody,
} from '../../../lib/archive/contentActions';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
}

function getStatusMessage(error?: string, updated?: string): string | null {
  if (updated === 'create') return '콘텐츠 초안이 생성되었습니다.';
  if (updated === 'basic_info') return '기본 정보가 저장되었습니다.';
  if (updated === 'body') return '본문과 구조화 정보가 저장되었습니다.';
  if (updated === 'asset') return '이미지가 업로드되고 콘텐츠에 반영되었습니다.';
  if (error === 'invalid_basic_info') return '필수 기본 정보 값을 확인하세요.';
  if (error === 'invalid_content_json') return '본문, 대표 이미지, 구조화 정보 JSON 형식을 확인하세요.';
  if (error === 'invalid_upload') return '업로드할 이미지 파일을 선택하세요.';
  if (error === 'missing_content_db') return '콘텐츠 DB 연결이 설정되지 않았습니다.';
  if (error === 'upload_failed') return '이미지 업로드에 실패했습니다. Storage 버킷과 정책을 확인하세요.';
  if (error === 'update_failed') return '저장에 실패했습니다. RLS 정책과 권한을 확인하세요.';
  return null;
}

function getContentPreviewHref(id: string): string {
  const previewToken = process.env.ADMIN_PREVIEW_TOKEN?.trim();
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL?.trim() ?? 'https://getbathtime.com';

  if (!previewToken) return `/content/${id}/preview`;

  const url = new URL(`/content/${id}`, webUrl);
  url.searchParams.set('previewToken', previewToken);
  return url.toString();
}

export default async function ContentDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error, updated } = await searchParams;
  const content = await readAdminArchiveContent(id);
  const statusMessage = getStatusMessage(error, updated);

  if (!content) notFound();

  return (
    <AdminShell activePath="/content">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">ARCHIVE CONTENT</p>
            <h2>{content.title}</h2>
            <p className="lede">{content.subtitle}</p>
          </div>
          <div className="topbarActions">
            <Link className="primaryButton secondaryButton linkButton" href={getContentPreviewHref(content.id)}>
              미리보기
            </Link>
            <Link className="primaryButton linkButton" href="/content">목록으로</Link>
          </div>
        </header>

        <section className="summaryGrid compact">
          <div className="summaryCard">
            <span>Category</span>
            <strong className="smallValue">{categoryLabels[content.category]}</strong>
          </div>
          <div className="summaryCard">
            <span>Type</span>
            <strong className="smallValue">{contentTypeLabels[content.contentType]}</strong>
          </div>
          <div className="summaryCard">
            <span>Status</span>
            <strong className="smallValue">{contentStatusLabels[content.status]}</strong>
          </div>
          <div className="summaryCard">
            <span>Source</span>
            <strong className="smallValue">{content.source === 'database' ? 'DB' : 'Fallback'}</strong>
          </div>
        </section>

        <section className="detailGrid">
          <section className="panel">
            <div className="panelHeader">
              <h3>기본 정보</h3>
              <span>Supabase Auth</span>
            </div>
            <form className="inlineForm" action={updateArchiveContentBasicInfo}>
              <input type="hidden" name="id" value={content.id} />
              <label htmlFor="title">제목</label>
              <input id="title" name="title" defaultValue={content.title} />
              <label htmlFor="subtitle">부제</label>
              <input id="subtitle" name="subtitle" defaultValue={content.subtitle} />
              <label htmlFor="summary">요약</label>
              <textarea id="summary" name="summary" defaultValue={content.summary} rows={4} />
              <label htmlFor="category">카테고리</label>
              <select id="category" name="category" defaultValue={content.category}>
                {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <label htmlFor="contentType">콘텐츠 타입</label>
              <select id="contentType" name="contentType" defaultValue={content.contentType}>
                {Object.entries(contentTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <label htmlFor="tags">태그</label>
              <input id="tags" name="tags" defaultValue={content.tags.join(', ')} />
              <label htmlFor="status">상태</label>
              <select id="status" name="status" defaultValue={content.status}>
                {Object.entries(contentStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <button type="submit" className="primaryButton">기본 정보 저장</button>
            </form>
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h3>본문</h3>
              <span>JSON blocks</span>
            </div>
            <ArchiveBodyBlockEditor
              contentId={content.id}
              initialHeroImage={content.heroImage}
              initialBody={content.body}
              structuredInfo={content.structuredInfo}
              seo={content.seo}
              action={updateArchiveContentBody}
              assetUploadAction={uploadArchiveContentImage}
            />
          </section>

          <section className="panel wide">
            <div className="panelHeader">
              <h3>구조화 정보</h3>
              <span>{categoryLabels[content.category]}</span>
            </div>
            {statusMessage ? (
              <p className={error ? 'formNotice error' : 'formNotice'}>
                {statusMessage}
              </p>
            ) : null}
            <form className="inlineForm" action={updateArchiveContentBody}>
              <input type="hidden" name="id" value={content.id} />
              <input type="hidden" name="heroImage" value={JSON.stringify(content.heroImage ?? {})} />
              <input type="hidden" name="body" value={JSON.stringify(content.body)} />
              <label htmlFor="structuredInfo">구조화 정보 JSON</label>
              <textarea
                id="structuredInfo"
                name="structuredInfo"
                rows={10}
                defaultValue={JSON.stringify(content.structuredInfo, null, 2)}
              />
              <label htmlFor="seo">SEO JSON</label>
              <textarea
                id="seo"
                name="seo"
                rows={8}
                defaultValue={JSON.stringify(content.seo, null, 2)}
              />
              <button type="submit" className="primaryButton">구조화 정보 저장</button>
            </form>
          </section>
        </section>
      </section>
    </AdminShell>
  );
}
