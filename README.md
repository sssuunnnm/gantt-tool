# Gantt Tool V0

Task Tree 기반 협업 간트툴

## 로컬 세팅

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
```bash
cp .env.example .env.local
```

`.env.local` 에 다음을 채운다:

#### Vercel Postgres
1. [Vercel](https://vercel.com) 로그인 → Dashboard → Storage → Create → Postgres
2. `.env.local` 탭에서 `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING` 복사

#### NextAuth Secret
```bash
openssl rand -base64 32
# → NEXTAUTH_SECRET 에 붙여넣기
```

#### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. OAuth 2.0 Client ID 생성
3. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
4. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 복사

### 3. DB 마이그레이션
```bash
npm run db:push
```

### 4. 개발 서버 실행
```bash
npm run dev
```

→ http://localhost:3000

---

## Vercel 배포

1. GitHub에 push
2. Vercel에서 import
3. Storage에서 같은 Postgres DB 연결
4. 환경변수 추가 (NEXTAUTH_URL은 실제 도메인으로)
5. Google OAuth redirect URI에 `https://your-domain.vercel.app/api/auth/callback/google` 추가

---

## 기능

- **Task Tree**: 계층형 태스크 관리, 더블클릭 편집, 서브태스크 추가
- **Gantt Timeline**: 드래그로 생성/이동/리사이즈
- **Zoom**: 24px / 40px / 64px dayWidth
- **CSV Import**: 템플릿 다운로드 후 가져오기
- **Assignee**: 팀원 할당
- **Google OAuth**: 간편 로그인

## CSV 형식

```
title,parent,start_date,end_date,assignee,status
개발,,2026-03-01,2026-03-31,,todo
프런트엔드,개발,2026-03-01,2026-03-15,user@example.com,in_progress
버튼 UI,프런트엔드,2026-03-01,2026-03-05,,todo
```
