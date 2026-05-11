import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminShell } from '../../../components/AdminShell';
import { readAdminSubmissions, submissionStatusLabels, submissionTypeLabels } from '../../../lib/archive/data';
import { updateSubmissionStatus } from '../../../lib/archive/submissionActions';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; updated?: string }>;
}

function getMessage(error?: string, updated?: string): string | null {
  if (updated === 'status') return '제보 상태가 저장되었습니다.';
  if (error === 'invalid_status') return '상태 값을 확인해주세요.';
  if (error === 'submission_not_found') return '제보를 찾을 수 없습니다.';
  return null;
}

export default async function SubmissionDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error, updated } = await searchParams;
  const submissions = await readAdminSubmissions();
  const submission = submissions.find((item) => item.id === id);
  if (!submission) notFound();
  const message = getMessage(error, updated);

  return (
    <AdminShell activePath="/submissions">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">SUBMISSION</p>
            <h2>{submissionTypeLabels[submission.type] ?? submission.type}</h2>
            <p className="lede">{submission.comment}</p>
          </div>
          <Link className="primaryButton linkButton" href="/submissions">목록으로</Link>
        </header>

        {message ? <p className={error ? 'formNotice error' : 'formNotice'}>{message}</p> : null}

        <section className="detailGrid">
          <section className="panel">
            <div className="panelHeader">
              <h3>제보 정보</h3>
              <span>{submission.createdAt}</span>
            </div>
            <div className="readonlyList">
              <p><strong>사진/링크</strong><span>{submission.linkOrImage ?? '-'}</span></p>
              <p><strong>작성자 계정</strong><span>{submission.user?.email ?? submission.userId ?? '-'}</span></p>
              <p><strong>닉네임</strong><span>{submission.nickname ?? '-'}</span></p>
              <p><strong>공개 가능</strong><span>{submission.canPublish ? '예' : '아니오'}</span></p>
            </div>
          </section>
          <section className="panel">
            <div className="panelHeader">
              <h3>상태 변경</h3>
              <span>P0 저장</span>
            </div>
            <form className="inlineForm" action={updateSubmissionStatus}>
              <input type="hidden" name="id" value={submission.id} />
              <label htmlFor="status">상태</label>
              <select id="status" name="status" defaultValue={submission.status}>
                {Object.entries(submissionStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <button type="submit" className="primaryButton">상태 저장</button>
            </form>
          </section>
        </section>
      </section>
    </AdminShell>
  );
}
