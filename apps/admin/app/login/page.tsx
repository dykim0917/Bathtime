import { readAdminAuthConfig } from '../../lib/auth/config';
import { signInWithPassword } from '../../lib/auth/actions';

function getErrorMessage(error?: string): string | null {
  if (error === 'missing_credentials') return '이메일과 비밀번호를 모두 입력해주세요.';
  if (error === 'invalid_credentials') return '로그인 정보를 확인해주세요.';
  if (error === 'not_allowed') return '관리자 접근 권한이 없는 계정입니다.';
  return null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const config = readAdminAuthConfig();
  const { error } = await searchParams;
  const errorMessage = getErrorMessage(error);

  return (
    <main className="loginShell">
      <section className="loginCard">
        <p className="eyebrow">BATH SOMMELIER ADMIN</p>
        <h1>관리자 로그인</h1>
        <p className="lede">
          Supabase Auth 계정으로 콘텐츠 운영 콘솔에 접근합니다.
        </p>

        {!config ? (
          <div className="configWarning">
            <strong>Supabase Auth 환경변수가 필요합니다.</strong>
            <span>NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
          </div>
        ) : null}

        {errorMessage ? <p className="formError">{errorMessage}</p> : null}

        <form action={signInWithPassword} className="loginForm">
          <label>
            이메일
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            비밀번호
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" className="primaryButton" disabled={!config}>
            로그인
          </button>
        </form>
      </section>
    </main>
  );
}
