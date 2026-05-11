import Link from 'next/link';
import { AdminShell } from '../../components/AdminShell';
import { readAdminSubmissions, submissionStatusLabels, submissionTypeLabels } from '../../lib/archive/data';

interface SubmissionsPageProps {
  searchParams: Promise<{ error?: string; updated?: string }>;
}

function getMessage(error?: string, updated?: string): string | null {
  if (updated === 'status') return '제보 상태가 저장되었습니다.';
  if (error === 'invalid_status') return '상태 값을 확인해주세요.';
  if (error === 'submission_not_found') return '제보를 찾을 수 없습니다.';
  return null;
}

export default async function SubmissionsPage({ searchParams }: SubmissionsPageProps) {
  const { error, updated } = await searchParams;
  const message = getMessage(error, updated);
  const submissions = await readAdminSubmissions();

  return (
    <AdminShell activePath="/submissions">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">SUBMISSIONS</p>
            <h2>제보 관리</h2>
            <p className="lede">제보는 바로 공개하지 않고 상태를 바꿔가며 운영자가 확인합니다.</p>
          </div>
        </header>

        {message ? <p className={error ? 'formNotice error' : 'formNotice'}>{message}</p> : null}

        <section className="summaryGrid compact">
          <div className="summaryCard">
            <span>Total</span>
            <strong>{submissions.length}</strong>
          </div>
          <div className="summaryCard">
            <span>새 제보</span>
            <strong>{submissions.filter((item) => item.status === 'new').length}</strong>
          </div>
          <div className="summaryCard">
            <span>반영됨</span>
            <strong>{submissions.filter((item) => item.status === 'accepted').length}</strong>
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h3>제보 목록</h3>
            <span>Status workflow</span>
          </div>
          <div className="dataTable submissionsTable" role="table" aria-label="제보 목록">
            <div className="dataTableHeader" role="row">
              <span>유형</span>
              <span>사진/링크</span>
              <span>코멘트</span>
              <span>닉네임</span>
              <span>계정</span>
              <span>공개 가능</span>
              <span>상태</span>
              <span>상세</span>
            </div>
            {submissions.map((submission) => (
              <div className="dataTableRow" role="row" key={submission.id}>
                <strong>{submissionTypeLabels[submission.type] ?? submission.type}</strong>
                <span>{submission.linkOrImage ?? '-'}</span>
                <span>{submission.comment}</span>
                <span>{submission.nickname ?? '-'}</span>
                <span>{submission.user?.email ?? submission.userId ?? '-'}</span>
                <span>{submission.canPublish ? '예' : '아니오'}</span>
                <strong>{submissionStatusLabels[submission.status]}</strong>
                <Link className="textButton" href={`/submissions/${submission.id}`}>열기</Link>
              </div>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
