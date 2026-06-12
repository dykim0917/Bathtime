'use client';

import { useId, useState } from 'react';

const disclosureText = [
  '이 글에는 쿠팡 파트너스, 오늘의집 큐레이터, 올리브영 쇼핑 큐레이터 제휴 링크가 포함되어 있습니다.',
  '링크를 통해 구매가 발생하면 바스타임에 수수료가 지급됩니다.',
  '제품 선택 기준과 설명은 바스타임의 리서치 기준으로 정리하며, 직접 사용 후기처럼 작성하지 않습니다.',
];

export function AffiliateDisclosureBadge() {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        className="affiliate-disclosure-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="제휴 링크 안내 보기"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true" className="affiliate-disclosure-icon">!</span>
        <span>제휴 포함</span>
      </button>

      {open ? (
        <div className="affiliate-disclosure-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="affiliate-disclosure-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="affiliate-disclosure-dialog-header">
              <h2 id={titleId}>제휴 링크 안내</h2>
              <button type="button" aria-label="제휴 안내 닫기" onClick={() => setOpen(false)}>
                닫기
              </button>
            </div>
            <div className="affiliate-disclosure-dialog-body">
              {disclosureText.map((text) => <p key={text}>{text}</p>)}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
