import { AdminShell } from '../../components/AdminShell';
import {
  buildAdminProductListViewModel,
  getProductStatusLabel,
} from '../../lib/productsData';

export default function ProductsPage() {
  const products = buildAdminProductListViewModel();

  return (
    <AdminShell activePath="/products">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">PRODUCTS</p>
            <h2>제품 관리</h2>
            <p className="lede">
              상품 원본, 구매처, 추천 규칙, 표시 메타데이터를 발행 전에 점검합니다.
            </p>
          </div>
          <button type="button" className="primaryButton">
            제품 추가 준비중
          </button>
        </header>

        <section className="summaryGrid compact" aria-label="제품 상태 요약">
          <div className="summaryCard">
            <span>Total products</span>
            <strong>{products.totalCount}</strong>
          </div>
          <div className="summaryCard">
            <span>Active</span>
            <strong>{products.activeCount}</strong>
          </div>
          <div className="summaryCard">
            <span>Safety review</span>
            <strong>{products.needsSafetyReviewCount}</strong>
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h3>제품 목록</h3>
            <span>Read-only table</span>
          </div>
          <div className="dataTable" role="table" aria-label="제품 목록">
            <div className="dataTableHeader" role="row">
              <span>제품</span>
              <span>카테고리</span>
              <span>구매처</span>
              <span>규칙</span>
              <span>안전</span>
              <span>상태</span>
              <span>검수일</span>
            </div>
            {products.rows.map((product) => (
              <div className="dataTableRow" role="row" key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <small>{product.brand} · {product.id}</small>
                </div>
                <span>{product.category}</span>
                <span>{product.activeListings}</span>
                <span>{product.matchRules}</span>
                <span>{product.safetyFlags.length || '-'}</span>
                <span className="statusText">{getProductStatusLabel(product.status)}</span>
                <span>{product.lastVerifiedAt}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
