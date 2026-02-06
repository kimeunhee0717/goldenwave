# 부자브리핑 뉴스레터 - 설정 진행 기록

> 작성일: 2026-02-06
> 이 문서는 실제 설정 과정을 단계별로 기록합니다.

---

## 진행 상태

| 단계 | 작업 | 상태 |
|------|------|------|
| 1 | Supabase 프로젝트 생성 | ✅ 완료 |
| 2 | API 키 확인 & .env 저장 | ✅ 완료 |
| 3 | DB 테이블 생성 | ⏳ 진행 중 |
| 4 | Edge Function 배포 | ⬜ 대기 |
| 5 | Resend 가입 & API 키 발급 | ⬜ 대기 |
| 6 | Resend 도메인 인증 | ⬜ 대기 |
| 7 | GitHub Secrets 등록 | ⬜ 대기 |
| 8 | 전체 테스트 | ⬜ 대기 |

---

## Step 1: Supabase 프로젝트 생성 ✅

### 접속 경로
```
https://supabase.com
→ "Start your project" 클릭
→ "Continue with GitHub" 로 로그인
→ "+ New Project" 클릭
```

### 입력 정보
| 항목 | 값 |
|------|-----|
| Name | `bujatime` |
| Database Password | (본인이 설정한 비밀번호) |
| Region | `Northeast Asia (Seoul)` |
| Pricing Plan | `Free` |

### 결과
- 프로젝트 생성 완료
- Project Ref: `lacxggtvsizeiucgufxz`

---

## Step 2: API 키 확인 & .env 저장 ✅

### 접속 경로
```
Supabase 대시보드
→ 왼쪽 사이드바 맨 아래 톱니바퀴 아이콘 (Project Settings)
→ 왼쪽 메뉴에서 "API" 클릭
```

### 확인한 키 목록

| 키 이름 | 값 | 용도 |
|---------|-----|------|
| Project URL | `https://[프로젝트ID].supabase.co` | API 엔드포인트 |
| anon public | `(Supabase 대시보드에서 확인)` | 프론트엔드 인증 |
| service_role secret | `(Supabase 대시보드에서 확인)` | 서버 전체 권한 |
| publishable key | `(Supabase 대시보드에서 확인)` | 클라이언트용 |
| secret key | `(Supabase 대시보드에서 확인)` | 서버용 |

### 저장된 파일
**`.env`** (프로젝트 루트):
```env
# --- Supabase (프론트엔드용) ---
VITE_SUPABASE_URL=https://[프로젝트ID].supabase.co
VITE_SUPABASE_ANON_KEY=(anon key)

# --- Supabase (서버/스크립트용) ---
SUPABASE_URL=https://[프로젝트ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY=(service_role key)

# --- Supabase Publishable/Secret Keys ---
SUPABASE_PUBLISHABLE_KEY=(publishable key)
SUPABASE_SECRET_KEY=(secret key)

# --- Google Gemini API ---
GEMINI_API_KEY=(gemini key)
```

---

## Step 3: DB 테이블 생성 ⏳

### 접속 경로
```
Supabase 대시보드
→ 왼쪽 사이드바에서 "SQL Editor" 클릭 (데이터베이스 + 번개 아이콘)
→ 빈 에디터 화면에 SQL 붙여넣기
→ "Run" 버튼 클릭
```

### 실행할 SQL

아래 SQL을 전체 복사하여 SQL Editor에 붙여넣고 실행:

```sql
-- =============================================
-- 부자타임 뉴스레터 테이블
-- =============================================

-- 1. subscribers: 뉴스레터 구독자
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  token UUID DEFAULT gen_random_uuid() NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  ip_address INET,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers (email);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers (status) WHERE status = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_token ON subscribers (token);

-- RLS (Row Level Security) 활성화
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- service_role만 접근 가능
CREATE POLICY "Service role full access" ON subscribers
  FOR ALL USING (auth.role() = 'service_role');


-- 2. briefing_issues: 발송된 브리핑 이력
CREATE TABLE IF NOT EXISTS briefing_issues (
  id SERIAL PRIMARY KEY,
  issue_date DATE UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  html_content TEXT NOT NULL,
  plain_text TEXT,
  source_articles JSONB,
  ai_summary TEXT,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_briefing_date ON briefing_issues (issue_date DESC);

-- RLS 활성화
ALTER TABLE briefing_issues ENABLE ROW LEVEL SECURITY;

-- service_role 전체 접근
CREATE POLICY "Service role full access" ON briefing_issues
  FOR ALL USING (auth.role() = 'service_role');

-- 공개 읽기 허용 (아카이브 페이지용)
CREATE POLICY "Public read access" ON briefing_issues
  FOR SELECT USING (true);
```

### 테이블 설명

**subscribers 테이블 (구독자)**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | 고유 ID (자동 생성) |
| email | TEXT | 이메일 주소 (유니크) |
| status | TEXT | 상태: active, unsubscribed, bounced |
| token | UUID | 구독 해지용 고유 토큰 |
| subscribed_at | TIMESTAMP | 구독 일시 |
| unsubscribed_at | TIMESTAMP | 구독 해지 일시 |
| ip_address | INET | 구독 시 IP 주소 |
| source | TEXT | 유입 경로 (website, footer 등) |
| created_at | TIMESTAMP | 레코드 생성 일시 |

**briefing_issues 테이블 (발송 이력)**
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL | 순차 ID |
| issue_date | DATE | 발송 날짜 (유니크) |
| subject | TEXT | 이메일 제목 |
| preview_text | TEXT | 미리보기 텍스트 |
| html_content | TEXT | 이메일 HTML 본문 |
| ai_summary | TEXT | AI 생성 마크다운 원본 |
| sent_at | TIMESTAMP | 실제 발송 일시 |
| recipient_count | INTEGER | 발송 수신자 수 |
| open_count | INTEGER | 열람 수 (추후 구현) |
| click_count | INTEGER | 클릭 수 (추후 구현) |

### 확인 방법
```
SQL 실행 후:
→ 왼쪽 사이드바에서 "Table Editor" 클릭
→ 테이블 목록에 subscribers, briefing_issues 두 개 확인
```

### 결과
- [ ] SQL 실행 완료
- [ ] "Success. No rows returned" 메시지 확인
- [ ] Table Editor에서 2개 테이블 확인

---

## Step 4: Edge Function 배포 ⬜

### 사전 준비: Supabase CLI 설치

**PowerShell (관리자 권한):**
```powershell
npm install -g supabase
```

**설치 확인:**
```powershell
supabase --version
```

### CLI 로그인

```powershell
supabase login
```
- 브라우저가 열리면 GitHub으로 로그인
- "Token stored successfully" 메시지 확인

### 프로젝트 연결

```powershell
cd C:\NewProject\2026-02\bujatime.com\goldenwave
supabase link --project-ref lacxggtvsizeiucgufxz
```
- Database password 입력 요청 시 → 프로젝트 생성 때 설정한 비밀번호

### Edge Function 배포

```powershell
# subscribe-email 함수 배포
supabase functions deploy subscribe-email --no-verify-jwt

# unsubscribe 함수 배포
supabase functions deploy unsubscribe --no-verify-jwt
```

### 확인 방법
```
Supabase 대시보드
→ 왼쪽 사이드바 "Edge Functions" (번개 아이콘)
→ subscribe-email, unsubscribe 두 개가 "Active" 상태인지 확인
```

### 결과
- [ ] CLI 설치 완료
- [ ] CLI 로그인 완료
- [ ] 프로젝트 연결 완료
- [ ] subscribe-email 배포 완료
- [ ] unsubscribe 배포 완료

---

## Step 5: Resend 가입 & API 키 발급 ⬜

### 접속 경로
```
https://resend.com
→ "Get Started" 또는 "Sign Up" 클릭
→ "Continue with GitHub" 로 가입
```

### API 키 생성
```
Resend 대시보드
→ 왼쪽 사이드바 "API Keys" 클릭
→ "+ Create API Key" 클릭
→ Name: bujatime-briefing
→ Permission: Full access
→ "Create" 클릭
→ 생성된 키 복사 (한 번만 표시됨!)
```

### 결과
- [ ] Resend 가입 완료
- [ ] API 키 생성 완료
- [ ] API 키 메모 완료: `re_xxxxxxxxx`

---

## Step 6: Resend 도메인 인증 ⬜

### 접속 경로
```
Resend 대시보드
→ 왼쪽 사이드바 "Domains" 클릭
→ "+ Add Domain" 클릭
→ Domain: bujatime.com 입력
→ Region: Asia Pacific (Singapore)
→ "Add" 클릭
```

### DNS 레코드 추가

Resend가 제공하는 DNS 레코드 6개를 도메인 DNS 관리자에 추가:

1. **SPF** (TXT 레코드)
2. **DKIM 1, 2, 3** (CNAME 레코드 3개)
3. **DMARC** (TXT 레코드)
4. **MX** (선택사항)

### 확인 방법
```
Resend 대시보드 → Domains → bujatime.com
→ 모든 레코드가 ✅ Verified 상태인지 확인
```

### 결과
- [ ] 도메인 추가 완료
- [ ] DNS 레코드 6개 추가 완료
- [ ] 모든 레코드 Verified 확인

---

## Step 7: GitHub Secrets 등록 ⬜

### 접속 경로
```
GitHub 저장소 페이지
→ 상단 탭에서 "Settings" 클릭
→ 왼쪽 사이드바 "Security" 섹션
→ "Secrets and variables" 클릭
→ "Actions" 클릭
→ "New repository secret" 클릭
```

### 등록할 Secrets (4개)

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://lacxggtvsizeiucgufxz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (service_role 키) |
| `RESEND_API_KEY` | `re_xxxxxxxxx` (Resend에서 발급받은 키) |
| `GEMINI_API_KEY` | (Gemini API 키) |

### 결과
- [ ] SUPABASE_URL 등록 완료
- [ ] SUPABASE_SERVICE_ROLE_KEY 등록 완료
- [ ] RESEND_API_KEY 등록 완료
- [ ] GEMINI_API_KEY 등록 완료

---

## Step 8: 전체 테스트 ⬜

### 로컬 구독 테스트
```powershell
npm run dev
```
- http://localhost:3000 접속
- 맨 아래 뉴스레터 구독 섹션에서 이메일 입력 → 구독하기
- "구독이 완료되었습니다!" 메시지 확인
- Supabase Table Editor → subscribers 테이블에서 데이터 확인

### 브리핑 파이프라인 테스트
```powershell
# 1. 뉴스 수집
node scripts/collect-news.mjs

# 2. AI 브리핑 생성
$env:GEMINI_API_KEY="여기에_API_키"
node scripts/generate-briefing.mjs

# 3. 이메일 HTML 생성
node scripts/generate-email-html.mjs

# 4. 생성된 HTML 브라우저에서 확인
start scripts/temp/briefing-email.html
```

### GitHub Actions 테스트
```
GitHub 저장소 → Actions 탭
→ "Daily Briefing Newsletter" 워크플로우 클릭
→ "Run workflow" → "Run workflow" 버튼 클릭
→ 모든 단계 ✅ 확인
```

### 결과
- [ ] 로컬 구독 테스트 통과
- [ ] 브리핑 파이프라인 테스트 통과
- [ ] GitHub Actions 테스트 통과

---

## 최종 완료 체크리스트

- [x] Supabase 프로젝트 생성
- [x] API 키 확인 & .env 저장
- [ ] DB 테이블 생성
- [ ] Edge Function 배포
- [ ] Resend 가입 & API 키 발급
- [ ] Resend 도메인 인증
- [ ] GitHub Secrets 등록
- [ ] 전체 테스트 통과
