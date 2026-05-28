import Link from 'next/link';

export default function ContentNotFound() {
  return (
    <div className="page-stack">
      <header className="page-header compact">
        <h1>콘텐츠를 찾을 수 없습니다.</h1>
        <p>발행되지 않았거나 주소가 바뀐 콘텐츠입니다.</p>
        <Link className="button-primary" href="/explore">탐색으로 돌아가기</Link>
      </header>
    </div>
  );
}
