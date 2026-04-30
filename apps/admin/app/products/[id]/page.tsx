import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminShell } from '../../../components/AdminShell';
import {
  getProductStatusLabel,
  readAdminProductRows,
} from '../../../lib/productsData';
import {
  updateProductPresentation,
  updateProductStatus,
} from '../../../lib/productActions';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    updated?: string;
  }>;
}

function getStatusMessage(error?: string, updated?: string): string | null {
  if (updated === 'status') return '상태가 저장되었습니다.';
  if (updated === 'presentation') return '표시 메타데이터가 저장되었습니다.';
  if (error === 'invalid_status') return '상태 값이 올바르지 않습니다.';
  if (error === 'invalid_presentation') return '표시 메타데이터 값을 확인하세요.';
  if (error === 'missing_content_db') return '콘텐츠 DB 연결이 설정되지 않았습니다.';
  if (error === 'update_failed') return '상태 저장에 실패했습니다. RLS 정책과 권한을 확인하세요.';
  return null;
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const { id } = await params;
  const { error, updated } = await searchParams;
  const products = await readAdminProductRows();
  const product = products.find((item) => item.id === id);
  const statusMessage = getStatusMessage(error, updated);

  if (!product) notFound();

  return (
    <AdminShell activePath="/products">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">PRODUCTS</p>
            <h2>{product.name}</h2>
            <p className="lede">
              제품 원본 데이터와 발행 전 검수 상태를 확인합니다.
            </p>
          </div>
          <Link className="primaryButton linkButton" href="/products">
            목록으로
          </Link>
        </header>

        <section className="summaryGrid compact" aria-label="제품 상세 요약">
          <div className="summaryCard">
            <span>Status</span>
            <strong>{getProductStatusLabel(product.status)}</strong>
          </div>
          <div className="summaryCard">
            <span>Listings</span>
            <strong>{product.activeListings}</strong>
          </div>
          <div className="summaryCard">
            <span>Rules</span>
            <strong>{product.matchRules}</strong>
          </div>
        </section>

        <section className="detailGrid">
          <section className="panel">
            <div className="panelHeader">
              <h3>기본 정보</h3>
              <span>{product.id}</span>
            </div>
            <dl className="detailList">
              <div>
                <dt>브랜드</dt>
                <dd>{product.brand}</dd>
              </div>
              <div>
                <dt>카테고리</dt>
                <dd>{product.category}</dd>
              </div>
              <div>
                <dt>최근 검수일</dt>
                <dd>{product.lastVerifiedAt}</dd>
              </div>
            </dl>
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h3>상태 변경</h3>
              <span>Supabase Auth</span>
            </div>
            <form className="inlineForm" action={updateProductStatus}>
              <input type="hidden" name="id" value={product.id} />
              <label htmlFor="product-status">상태</label>
              <select id="product-status" name="status" defaultValue={product.status}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
                <option value="retired">Retired</option>
              </select>
              <button type="submit" className="primaryButton">
                저장
              </button>
            </form>
            {statusMessage ? (
              <p className={error ? 'formNotice error' : 'formNotice'}>
                {statusMessage}
              </p>
            ) : null}
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h3>표시 메타데이터</h3>
              <span>Supabase Auth</span>
            </div>
            <form className="inlineForm" action={updateProductPresentation}>
              <input type="hidden" name="id" value={product.id} />
              <label htmlFor="product-tags">Tags</label>
              <textarea
                id="product-tags"
                name="tags"
                defaultValue={product.tags.join(', ')}
                rows={3}
              />
              <label htmlFor="product-emoji">Emoji code</label>
              <input id="product-emoji" name="emoji" defaultValue={product.emoji} />
              <label htmlFor="product-bg">Background color</label>
              <input id="product-bg" name="bgColor" defaultValue={product.bgColor} />
              <label htmlFor="product-safety-flags">Safety flags</label>
              <textarea
                id="product-safety-flags"
                name="safetyFlags"
                defaultValue={product.safetyFlags.join(', ')}
                rows={3}
              />
              <button type="submit" className="primaryButton">
                표시 저장
              </button>
            </form>
          </section>
        </section>
      </section>
    </AdminShell>
  );
}
