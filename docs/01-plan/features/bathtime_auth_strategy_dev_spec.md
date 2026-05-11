# 배스타임 P0 Auth Strategy 개발 문서

## 1. 문서 목적

이 문서는 배스타임 P0 웹 구현에 **로그인 기능**을 추가할 때 필요한 개발 범위, UX 원칙, 데이터 모델, 사이드이펙트, 제외 범위를 정의한다.

배스타임 P0는 콘텐츠 아카이브, 저장, 루틴 실행, 제보 기능을 중심으로 한다. 이 중 **저장(Saved)** 과 **제보(Submit)** 는 사용자의 계정과 연결될 때 서비스 가치가 커진다.

따라서 P0부터 최소 로그인 기능을 포함한다.

다만 로그인은 서비스 진입 장벽이 아니라, 사용자가 콘텐츠를 저장하거나 제보할 때 필요한 **보관함 기반 기능**으로 정의한다.

---

## 2. 핵심 원칙

### 2.1 로그인은 첫 진입에서 강제하지 않는다

콘텐츠 탐색과 상세 열람은 비로그인으로 가능해야 한다.

```txt
콘텐츠 열람: 비로그인 가능
Explore 탐색: 비로그인 가능
Content Detail 열람: 비로그인 가능
Routines 열람: 비로그인 가능
```

로그인은 다음 행동 시점에 요청한다.

```txt
저장하기 클릭
제보 제출
Saved 접근
```

### 2.2 로그인은 저장과 제보를 위한 기반이다

P0 로그인 목적은 다음 3가지로 제한한다.

1. 저장한 콘텐츠를 계정에 연결한다.
2. 웹/앱 간 Saved 동기화 기반을 만든다.
3. 제보 작성자 식별과 제보 상태 관리 기반을 만든다.

### 2.3 소셜 로그인만 지원한다

P0에서는 자체 이메일/비밀번호 회원가입을 만들지 않는다.

지원 로그인:

```txt
Kakao Login
Google Login
```

국내 사용자를 고려해 카카오 로그인을 우선 노출하고, 구글 로그인을 보조 수단으로 제공한다.

---

## 3. P0 로그인 범위

## 3.1 포함 기능

```txt
카카오 로그인
구글 로그인
로그아웃
내 계정 기본 정보 저장
저장한 콘텐츠 서버 저장
제보 작성자 연결
저장/제보 시점의 로그인 요청
```

## 3.2 제외 기능

```txt
자체 이메일/비밀번호 회원가입
이메일 인증
비밀번호 재설정
프로필 꾸미기
팔로우
댓글
회원 등급
포인트
공개 마이페이지
계정 병합
소셜 그래프
고급 알림 설정
마케팅 수신 동의
```

---

## 4. 로그인 UX 원칙

## 4.1 Progressive Login

사용자가 로그인하기 전에 먼저 서비스 가치를 경험할 수 있어야 한다.

### 저장하기 흐름

```txt
Content Detail 열람
↓
저장하기 클릭
↓
로그인 요청 모달
↓
카카오/구글 로그인
↓
로그인 성공
↓
원래 콘텐츠 자동 저장
↓
Saved에 반영
```

### 제보하기 흐름

```txt
Submit 진입
↓
제보 내용 작성
↓
제출 클릭
↓
로그인 요청
↓
카카오/구글 로그인
↓
로그인 성공
↓
제보 제출 완료
```

제보는 작성 전 로그인을 강제하지 않고, 제출 시점에 요청한다.

## 4.2 로그인 문구

### 저장 시

```txt
내 바스타임으로 저장하려면 로그인이 필요해요.
저장한 콘텐츠는 나중에 다시 꺼내볼 수 있습니다.

[카카오로 계속하기]
[Google로 계속하기]
```

### 제보 시

```txt
제보를 남기려면 로그인이 필요해요.
제보 채택 여부를 확인하고, 닉네임 표시 여부를 선택할 수 있습니다.

[카카오로 계속하기]
[Google로 계속하기]
```

### Saved 접근 시

```txt
저장한 바스타임을 보려면 로그인이 필요해요.
콘텐츠, 장소, 루틴을 내 보관함에 모아둘 수 있습니다.
```

---

## 5. 데이터 모델

## 5.1 User

```ts
export type AuthProvider = 'kakao' | 'google';

export type User = {
  id: string;
  provider: AuthProvider;
  providerUserId: string;
  email?: string;
  nickname?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
};
```

### P0 원칙

- `provider + providerUserId` 조합으로 동일 사용자를 식별한다.
- 카카오와 구글 계정 병합은 P0에서 하지 않는다.
- 이메일이 같더라도 provider가 다르면 다른 계정으로 본다.
- 계정 병합은 P1 이후 검토한다.

---

## 5.2 SavedItem

```ts
export type SavedTargetType = 'content' | 'place' | 'item' | 'routine';

export type SavedItem = {
  id: string;
  userId: string;
  targetType: SavedTargetType;
  targetId: string;
  createdAt: string;
};
```

### P0 저장 대상

P0에서는 우선 `content` 저장을 구현한다.

P1 이후 다음으로 확장한다.

```txt
place
item
routine
```

### 중복 저장 방지

동일 사용자가 같은 target을 중복 저장하지 못하게 한다.

권장 unique key:

```txt
userId + targetType + targetId
```

---

## 5.3 Submission

```ts
export type SubmissionStatus =
  | 'new'
  | 'reviewing'
  | 'accepted'
  | 'rejected';

export type SubmissionType =
  | 'sauna_spa'
  | 'bathtub_stay'
  | 'home_spa'
  | 'item'
  | 'topic';

export type Submission = {
  id: string;
  userId: string;
  type: SubmissionType;
  linkOrImage?: string;
  comment: string;
  nickname?: string;
  canPublish?: boolean;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
};
```

### P0 원칙

- 제보 제출에는 로그인이 필요하다.
- `userId`를 필수로 둔다.
- 공개 닉네임은 optional로 둔다.
- 제보는 바로 공개하지 않는다.
- 관리자 검토 후 콘텐츠화한다.

---

## 6. 저장 전략 변경

기존 P0에서는 로그인 없는 `localStorage` 저장을 고려했으나, 로그인 도입에 따라 저장 전략을 변경한다.

### 기존

```txt
Web: localStorage
Native App: AsyncStorage
```

### 변경

```txt
Web: 로그인 기반 서버 저장
Native App: 로그인 기반 서버 저장
비로그인: 저장 불가, 로그인 유도
```

### 이유

- 웹/앱 간 Saved 동기화 기반 확보
- 사용자가 기기를 바꿔도 저장 유지
- 앱을 사용할 이유 강화
- 향후 개인화 추천 기반 데이터 확보

### 공통 저장 인터페이스

```ts
export interface SavedContentStorage {
  getSavedIds(userId: string): Promise<string[]>;
  save(userId: string, targetId: string): Promise<void>;
  remove(userId: string, targetId: string): Promise<void>;
  isSaved(userId: string, targetId: string): Promise<boolean>;
}
```

P0에서는 서버 저장 adapter를 기본으로 구현한다.

---

## 7. Auth Provider 연동 요구사항

## 7.1 Kakao Login

필요 작업:

```txt
Kakao Developers 앱 생성
Web 플랫폼 등록
Redirect URI 설정
JavaScript Key 또는 REST API Key 관리
로컬 개발 redirect URI 등록
배포 도메인 redirect URI 등록
```

## 7.2 Google Login

필요 작업:

```txt
Google Cloud OAuth Client 생성
Web Client ID 생성
Redirect URI 설정
로컬 개발 redirect URI 등록
배포 도메인 redirect URI 등록
```

## 7.3 Redirect URI 예시

```txt
Local:
http://localhost:8081/auth/callback/kakao
http://localhost:8081/auth/callback/google

Production:
https://getbathtime.com/auth/callback/kakao
https://getbathtime.com/auth/callback/google
```

실제 포트와 라우트는 구현 환경에 맞춰 조정한다.

---

## 8. 라우트 구조

P0에 다음 인증 관련 라우트를 추가한다.

```txt
app/
├─ auth/
│  ├─ login.tsx
│  └─ callback/
│     ├─ kakao.tsx
│     └─ google.tsx
```

또는 Expo Router 구조에 맞춰 다음처럼 정리할 수 있다.

```txt
app/(auth)/
├─ login.tsx
└─ callback/
   ├─ kakao.tsx
   └─ google.tsx
```

### 로그인 모달 vs 로그인 페이지

P0에서는 다음 방식을 추천한다.

- 저장/제보 행동 중에는 로그인 모달 또는 bottom sheet
- 직접 접근 가능한 `/auth/login` 페이지도 제공
- OAuth callback은 독립 라우트 처리

---

## 9. Auth State 관리

## 9.1 필요 상태

```ts
type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};
```

## 9.2 필요 함수

```ts
loginWithKakao(): Promise<void>
loginWithGoogle(): Promise<void>
logout(): Promise<void>
getCurrentUser(): Promise<User | null>
requireLogin(nextAction: () => Promise<void>): Promise<void>
```

## 9.3 requireLogin 패턴

저장/제보 버튼은 다음 흐름을 따른다.

```txt
if user exists:
  perform action
else:
  open login prompt
  after login success:
    perform pending action
```

이 패턴이 없으면 로그인 후 사용자가 원래 하려던 행동이 끊긴다.

---

## 10. 관리자 영향 범위

로그인 기능 추가로 관리자에서 다음 정보가 필요해진다.

### Submissions

- 제보 작성자 userId
- 닉네임
- 공개 가능 여부
- 제보 상태

### P0 관리자에서 하지 않을 것

- 회원 목록 관리
- 회원 차단
- 권한 관리
- 저장 목록 조회
- 유저 프로필 수정

### P1 후보

- 유저 목록
- 유저별 제보 내역
- 부적절한 제보자 차단
- 탈퇴 사용자 데이터 삭제 관리

---

## 11. 개인정보/약관 영향

로그인을 추가하면 개인정보 처리방침과 이용약관 정비가 필요하다.

### 수집 가능 정보

```txt
provider
providerUserId
email
nickname
profileImageUrl
saved contents
submissions
```

### P0에 필요한 문서

```txt
개인정보 처리방침
이용약관
제보 콘텐츠 활용 동의 문구
```

### 제보 동의 문구

```txt
제보한 내용은 운영자 검토 후 서비스 콘텐츠로 활용될 수 있습니다.
공개 여부는 직접 선택할 수 있습니다.
```

### 마케팅 수신 동의

P0에서는 제외한다.

푸시/뉴스레터/마케팅 메시지를 보내기 전까지는 별도 마케팅 동의는 받지 않는다.

---

## 12. 탈퇴/데이터 삭제

로그인이 있으면 사용자는 계정 삭제와 데이터 삭제를 요구할 수 있다.

### P0 최소 요구사항

```txt
로그아웃
계정 삭제 요청 경로
개인정보 삭제 요청 안내
```

### 권장 구현

가능하면 P0에 간단한 회원 탈퇴 기능을 포함한다.

탈퇴 시 처리:

```txt
User 비활성화 또는 삭제
SavedItem 삭제
Submission은 정책에 따라 익명화 또는 삭제
```

P0에서 자동 탈퇴 구현이 어렵다면 개인정보 처리방침에 삭제 요청 이메일을 명시한다.

---

## 13. 보안 고려사항

### 13.1 OAuth Token 관리

- OAuth token을 클라이언트에 장기 저장하지 않는다.
- 세션 또는 서버 발급 토큰을 사용한다.
- 토큰 만료/갱신 정책을 정의한다.

### 13.2 API 보안

- 클라이언트가 넘긴 `userId`를 그대로 신뢰하지 않는다.
- 서버 세션 또는 인증 토큰에서 사용자 식별 정보를 가져온다.
- Saved 조회/수정은 본인 데이터만 접근 가능해야 한다.
- Submission 작성 시 인증된 사용자만 제출 가능하게 한다.

### 13.3 XSS / 입력값 검증

제보 입력에는 사용자가 링크와 코멘트를 남길 수 있다.

따라서 다음을 처리한다.

- 링크 URL 검증
- 본문/코멘트 escape
- 관리자 화면에서 HTML 직접 렌더링 금지
- 이미지 URL 검증

### 13.4 관리자 보안

- 관리자 페이지는 별도 인증 필요
- 일반 사용자 로그인과 관리자 권한은 분리
- 관리자 접근 가능한 이메일/role을 제한

---

## 14. UX 사이드이펙트와 대응

### 14.1 로그인 이탈

문제:

저장/제보 시 로그인 요구로 이탈 가능.

대응:

- 콘텐츠 열람은 비로그인 허용
- 저장/제보 시점에만 로그인 요청
- 로그인 후 원래 행동 자동 완료
- 카카오를 첫 번째 버튼으로 노출

### 14.2 로그인 후 맥락 손실

문제:

로그인 후 저장하려던 콘텐츠나 작성 중이던 제보가 사라지면 이탈.

대응:

- pending action 저장
- 로그인 성공 후 pending action 실행
- 제보 작성 내용은 로그인 전 임시 상태로 보존

### 14.3 계정 혼선

문제:

같은 사람이 카카오/구글로 각각 로그인하면 저장 목록이 분리됨.

대응:

- P0에서는 provider별 별도 계정으로 처리
- 추후 계정 병합 기능 검토
- UX 문구로 같은 로그인 방식을 계속 사용하도록 안내 가능

---

## 15. Analytics Event 추가

로그인 추가로 다음 이벤트를 정의한다.

```txt
auth_prompt_shown
auth_provider_clicked
auth_login_succeeded
auth_login_failed
auth_logout_clicked
auth_required_action_completed
saved_login_required
submit_login_required
```

### 주요 속성

```txt
provider
source
pendingAction
contentId
submissionType
platform
errorCode
```

### 기존 이벤트와 연결

저장 이벤트 흐름:

```txt
content_saved_clicked
→ saved_login_required
→ auth_prompt_shown
→ auth_login_succeeded
→ content_saved
```

제보 이벤트 흐름:

```txt
submit_started
→ submit_login_required
→ auth_prompt_shown
→ auth_login_succeeded
→ submit_completed
```

---

## 16. P0 구현 체크리스트

### Auth 기본

- [ ] Kakao Developers 앱 설정
- [ ] Google OAuth Client 설정
- [ ] Redirect URI 설정
- [ ] Auth callback 라우트 추가
- [ ] Auth state 관리 구현
- [ ] 로그아웃 구현

### 저장 연동

- [ ] SavedItem DB 모델 구현
- [ ] 저장 버튼 로그인 요구 처리
- [ ] 로그인 성공 후 자동 저장
- [ ] Saved 목록 서버 조회
- [ ] 저장 취소 구현

### 제보 연동

- [ ] Submission DB 모델에 userId 추가
- [ ] 제보 제출 시 로그인 요구 처리
- [ ] 로그인 전 작성 내용 보존
- [ ] 로그인 성공 후 제보 제출
- [ ] 관리자 제보 목록에 user 정보 표시

### 정책/보안

- [ ] 개인정보 처리방침 작성
- [ ] 이용약관 작성
- [ ] 제보 콘텐츠 활용 동의 문구 추가
- [ ] 로그아웃/탈퇴 또는 삭제 요청 안내 구현
- [ ] 관리자 접근 제한 확인

### 이벤트

- [ ] auth 관련 이벤트 정의
- [ ] 저장/제보 로그인 전환 이벤트 연결
- [ ] 로그인 실패 이벤트 기록

---

## 17. P0 완료 기준

로그인 기능은 다음 조건을 만족하면 P0 완료로 본다.

- 비로그인 사용자가 콘텐츠를 열람할 수 있다.
- 저장하기 클릭 시 로그인을 요청한다.
- 카카오 또는 구글 로그인 후 원래 콘텐츠가 자동 저장된다.
- Saved에서 계정 기반 저장 콘텐츠를 볼 수 있다.
- 제보 작성 후 제출 시 로그인을 요청한다.
- 로그인 후 작성 중이던 제보가 사라지지 않고 제출된다.
- 로그아웃이 가능하다.
- 개인정보 처리방침과 이용약관 링크가 제공된다.
- 관리자에서 제보 작성자와 상태를 확인할 수 있다.
- 저장/제보 관련 인증 이벤트가 기록된다.

---

## 18. 최종 정리

P0 로그인은 커뮤니티 기능을 시작하기 위한 것이 아니다.

P0 로그인은 **저장과 제보를 진짜 서비스 기능으로 만들기 위한 기반**이다.

콘텐츠 탐색은 열어두고, 저장과 제보 순간에만 카카오/구글 로그인을 요청한다.

이렇게 하면 진입장벽을 낮추면서도, 사용자가 자기만의 바스타임 아카이브를 만들 수 있는 기반을 확보할 수 있다.

핵심 원칙:

> 읽기는 열어두고, 저장과 제보는 로그인으로 묶는다.

