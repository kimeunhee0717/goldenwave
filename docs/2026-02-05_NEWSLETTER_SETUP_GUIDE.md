# 부자브리핑 뉴스레터 - 후속 설정 가이드

> 이 문서는 부자브리핑 뉴스레터 시스템을 실제로 운영하기 위해 필요한
> 외부 서비스 설정을 **메뉴 접근 경로까지 아주 상세하게** 안내합니다.

---

## 목차

1. [Supabase 프로젝트 생성 & 설정](#1-supabase-프로젝트-생성--설정)
2. [Supabase DB 테이블 생성 (마이그레이션)](#2-supabase-db-테이블-생성)
3. [Supabase Edge Function 배포](#3-supabase-edge-function-배포)
4. [Resend 계정 생성 & 도메인 인증](#4-resend-계정-생성--도메인-인증)
5. [GitHub Secrets 등록](#5-github-secrets-등록)
6. [로컬 .env 파일 생성](#6-로컬-env-파일-생성)
7. [전체 테스트](#7-전체-테스트)

---

## 1. Supabase 프로젝트 생성 & 설정

### 1-1. Supabase 회원가입

1. 브라우저에서 **https://supabase.com** 접속
2. 화면 우측 상단의 **`Start your project`** 초록색 버튼 클릭
3. **`Continue with GitHub`** 버튼 클릭 (GitHub 계정으로 로그인 추천)
4. GitHub 로그인 화면이 나오면 → GitHub 아이디/비밀번호 입력 → **`Sign in`**
5. "Authorize Supabase" 화면이 나오면 → **`Authorize supabase`** 초록 버튼 클릭
6. Supabase 대시보드(`app.supabase.com`)로 자동 이동됨

### 1-2. 새 프로젝트 만들기

1. Supabase 대시보드(`https://supabase.com/dashboard`)에 로그인된 상태
2. 왼쪽 사이드바 최상단에 **조직(Organization) 이름**이 보임
   - 처음이면 "Default Organization"으로 되어 있음
3. 화면 중앙 또는 우측 상단의 **`+ New Project`** 초록 버튼 클릭
4. 프로젝트 생성 폼이 나타남:

   | 항목 | 입력값 |
   |------|--------|
   | **Name** | `bujatime` (원하는 이름) |
   | **Database Password** | 강력한 비밀번호 입력 → **반드시 어딘가에 메모해둘 것!** |
   | **Region** | `Northeast Asia (Seoul)` 선택 ← **중요! 한국 사용자 대상이므로 서울 선택** |
   | **Pricing Plan** | `Free` (무료) 선택 |

5. 하단의 **`Create new project`** 버튼 클릭
6. 프로젝트 생성 중... 화면이 나타남 (2~3분 소요)
7. 완료되면 프로젝트 대시보드가 표시됨

### 1-3. API 키 확인하기 (매우 중요!)

프로젝트가 생성되면 **2개의 키**를 확인해야 합니다.

**방법 A: 프로젝트 홈에서 확인**

1. 프로젝트 대시보드 화면에서 **`Project API`** 섹션이 보임
   - `Project URL`: `https://xxxxx.supabase.co` ← 이것이 **SUPABASE_URL**
   - `API Key (anon, public)`: `eyJhbG...` ← 이것이 **SUPABASE_ANON_KEY**

**방법 B: 설정 메뉴에서 확인 (더 확실한 방법)**

1. 왼쪽 사이드바 맨 아래에 **톱니바퀴 아이콘** (`Project Settings`) 클릭
2. 왼쪽 서브메뉴에서 **`API`** 클릭
   - 경로: `Project Settings` → `API`
3. 이 페이지에서 다음 정보를 확인:

```
┌─────────────────────────────────────────────────────┐
│ Project Settings > API                              │
│                                                      │
│ Project URL                                          │
│ ┌─────────────────────────────────────────────┐     │
│ │ https://abcdefgh.supabase.co                │ 📋  │  ← SUPABASE_URL
│ └─────────────────────────────────────────────┘     │  ← VITE_SUPABASE_URL
│                                                      │
│ Project API keys                                     │
│                                                      │
│ anon (public)                                        │
│ ┌─────────────────────────────────────────────┐     │
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....   │ 📋  │  ← VITE_SUPABASE_ANON_KEY
│ └─────────────────────────────────────────────┘     │
│                                                      │
│ service_role (secret)     ⚠️ 이 키는 절대 공개 금지! │
│ ┌─────────────────────────────────────────────┐     │
│ │ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....   │ 📋  │  ← SUPABASE_SERVICE_ROLE_KEY
│ └─────────────────────────────────────────────┘     │  ← (GitHub Secrets에만 저장)
│                                                      │
└─────────────────────────────────────────────────────┘
```

4. 각 값 오른쪽의 **📋 복사 아이콘**을 클릭하면 클립보드에 복사됨
5. 메모장이나 안전한 곳에 3개 값을 모두 저장해두세요:
   - `Project URL` → 나중에 **SUPABASE_URL** + **VITE_SUPABASE_URL** 로 사용
   - `anon public` → 나중에 **VITE_SUPABASE_ANON_KEY** 로 사용
   - `service_role secret` → 나중에 **SUPABASE_SERVICE_ROLE_KEY** 로 사용 (GitHub Secrets)

---

## 2. Supabase DB 테이블 생성

### 2-1. SQL 에디터 접근

1. Supabase 대시보드에서 방금 만든 프로젝트 선택 (이미 선택되어 있을 것)
2. **왼쪽 사이드바**를 보면 아이콘 메뉴가 세로로 나열되어 있음:
   ```
   🏠 Home
   📊 Table Editor        ← 테이블 시각적으로 보기
   🔍 SQL Editor          ← ★ 이것을 클릭!
   📁 Database
   🔐 Authentication
   📦 Storage
   ⚡ Edge Functions
   ...
   ```
3. **`SQL Editor`** (데이터베이스 실린더 + 번개 모양 아이콘) 클릭
4. SQL 에디터 화면이 나타남. 중앙에 큰 텍스트 입력 영역이 보임

### 2-2. 테이블 생성 SQL 실행

1. SQL 에디터의 빈 영역에 아래 SQL을 **전체 복사하여 붙여넣기**:

```sql
-- 1. subscribers 테이블
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

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers (email);
CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers (status) WHERE status = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_token ON subscribers (token);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON subscribers
  FOR ALL USING (auth.role() = 'service_role');

-- 2. briefing_issues 테이블
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

CREATE INDEX IF NOT EXISTS idx_briefing_date ON briefing_issues (issue_date DESC);

ALTER TABLE briefing_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON briefing_issues
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read access" ON briefing_issues
  FOR SELECT USING (true);
```

2. 우측 상단 또는 하단의 **`Run`** (초록색 재생 버튼 ▶) 클릭
3. 하단에 **`Success. No rows returned`** 메시지가 나오면 성공!

### 2-3. 테이블 생성 확인

1. 왼쪽 사이드바에서 **`Table Editor`** (표 아이콘) 클릭
2. 왼쪽 패널에 테이블 목록이 나타남:
   ```
   Schema: public
   ├── briefing_issues
   └── subscribers
   ```
3. 두 테이블이 모두 보이면 성공!
4. `subscribers`를 클릭하면 빈 테이블이 보임 (아직 데이터 없음)

---

## 3. Supabase Edge Function 배포

Edge Function은 Supabase CLI로 배포합니다.

### 3-1. Supabase CLI 설치

**Windows (PowerShell 관리자 권한으로 실행):**

```powershell
# npm으로 설치 (가장 간단)
npm install -g supabase
```

설치 확인:
```powershell
supabase --version
```

### 3-2. Supabase CLI 로그인

1. 터미널(PowerShell 또는 CMD)을 엽니다
2. 다음 명령어 실행:
   ```
   supabase login
   ```
3. 브라우저가 자동으로 열리면서 Supabase 로그인 페이지가 나타남
4. **이미 로그인되어 있으면** "CLI Login Successful" 메시지가 브라우저에 나타남
5. **로그인이 안 되어 있으면** GitHub으로 로그인
6. 터미널에 `Token stored successfully` 메시지 확인

**만약 브라우저가 안 열리면 (수동 토큰 방식):**

1. https://supabase.com/dashboard 에 로그인
2. 왼쪽 하단 **사용자 아이콘** (또는 프로필) 클릭 → **`Access Tokens`**
   - 또는 직접 URL: https://supabase.com/dashboard/account/tokens
3. **`Generate new token`** 클릭
4. 이름: `cli-token` 입력 → **`Generate token`** 클릭
5. 생성된 토큰을 복사
6. 터미널에서:
   ```
   supabase login --token YOUR_TOKEN_HERE
   ```

### 3-3. 프로젝트 연결

1. 프로젝트 폴더로 이동:
   ```
   cd C:\NewProject\2026-02\bujatime.com\goldenwave
   ```

2. Supabase 프로젝트 초기화:
   ```
   supabase init
   ```
   - `supabase` 폴더가 이미 있으므로 "Already initialized" 메시지가 나올 수 있음
   - 그래도 문제없음

3. 프로젝트 연결:
   ```
   supabase link --project-ref YOUR_PROJECT_REF
   ```

   **YOUR_PROJECT_REF 찾는 방법:**
   - Supabase 대시보드 → 프로젝트 선택
   - **왼쪽 사이드바 맨 아래** → **톱니바퀴** (`Project Settings`) 클릭
   - **`General`** 메뉴 (기본 선택되어 있음)
   - **`Reference ID`** 항목에 `abcdefgh` 같은 문자열이 있음 ← 이것이 Project Ref

   ```
   ┌─────────────────────────────────────────────────┐
   │ Project Settings > General                      │
   │                                                  │
   │ General Settings                                 │
   │                                                  │
   │ Project Name:  bujatime                          │
   │ Reference ID:  abcdefgh        📋               │  ← 이것!
   │ Region:        Northeast Asia (Seoul)            │
   │                                                  │
   └─────────────────────────────────────────────────┘
   ```

   - 📋 복사 버튼 클릭하여 복사

4. 다시 터미널에서:
   ```
   supabase link --project-ref abcdefgh
   ```
   - Database password 입력 요청 시 → 프로젝트 생성 때 설정한 비밀번호 입력

### 3-4. Edge Function 배포

1. **subscribe-email** 함수 배포:
   ```
   supabase functions deploy subscribe-email --no-verify-jwt
   ```
   - `--no-verify-jwt`: 비로그인 사용자도 구독할 수 있도록 JWT 검증 비활성화
   - 배포 완료 메시지: `Edge Function 'subscribe-email' deployed`

2. **unsubscribe** 함수 배포:
   ```
   supabase functions deploy unsubscribe --no-verify-jwt
   ```
   - 배포 완료 메시지: `Edge Function 'unsubscribe' deployed`

### 3-5. Edge Function 배포 확인

**Supabase 대시보드에서 확인:**

1. 왼쪽 사이드바에서 **`Edge Functions`** (번개⚡ 아이콘) 클릭
2. 함수 목록이 나타남:
   ```
   ┌──────────────────────────────────────────────┐
   │ Edge Functions                                │
   │                                               │
   │ 📦 subscribe-email    Active    3 seconds ago │
   │ 📦 unsubscribe        Active    2 seconds ago │
   │                                               │
   └──────────────────────────────────────────────┘
   ```
3. 두 함수가 `Active` 상태이면 성공!

**함수 URL 확인:**

1. `subscribe-email` 함수 이름 클릭
2. 상단에 **Function URL**이 표시됨:
   ```
   https://abcdefgh.supabase.co/functions/v1/subscribe-email
   ```
3. 이 URL이 프론트엔드에서 호출할 엔드포인트

---

## 4. Resend 계정 생성 & 도메인 인증

### 4-1. Resend 회원가입

1. 브라우저에서 **https://resend.com** 접속
2. 우측 상단 **`Get Started`** 또는 **`Sign Up`** 클릭
3. 가입 방법 선택:
   - **`Continue with GitHub`** (추천) → GitHub 로그인 → Authorize
   - 또는 이메일/비밀번호로 직접 가입
4. 가입 완료 후 Resend 대시보드로 이동됨

### 4-2. API 키 생성

1. Resend 대시보드 (`https://resend.com/api-keys`) 접속
2. **왼쪽 사이드바** 메뉴:
   ```
   📊 Overview
   📧 Emails
   📬 Broadcasts
   👥 Audiences
   🌐 Domains           ← 나중에 사용
   🔑 API Keys          ← ★ 먼저 이것 클릭!
   📊 Logs
   ⚙️ Settings
   ```
3. **`API Keys`** 클릭
4. 우측 상단 **`+ Create API Key`** 버튼 클릭
5. 폼이 나타남:

   | 항목 | 입력값 |
   |------|--------|
   | **Name** | `bujatime-briefing` |
   | **Permission** | `Full access` (기본값) |
   | **Domain** | `All domains` (기본값) |

6. **`Create`** 버튼 클릭
7. **API 키가 딱 한 번만 표시됨!** 반드시 복사하여 메모해두세요:
   ```
   ┌─────────────────────────────────────────────────────┐
   │ ⚠️ This key will only be shown once.               │
   │                                                      │
   │ re_abcdefgh_1234567890abcdefghijklmnopqr  📋       │
   │                                                      │
   │                              [Done]                  │
   └─────────────────────────────────────────────────────┘
   ```
8. 📋 복사 버튼 클릭 → 이것이 **RESEND_API_KEY**
9. **`Done`** 클릭

### 4-3. 도메인 인증 (중요!)

도메인 인증 없이는 `onboarding@resend.dev` 주소로만 발송 가능합니다.
`briefing@bujatime.com`으로 발송하려면 **반드시 도메인 인증**이 필요합니다.

1. 왼쪽 사이드바에서 **`Domains`** (지구본🌐 아이콘) 클릭
2. **`+ Add Domain`** 버튼 클릭
3. 도메인 입력:

   | 항목 | 입력값 |
   |------|--------|
   | **Domain** | `bujatime.com` |
   | **Region** | `Asia Pacific (Singapore)` 또는 `US East` |

4. **`Add`** 버튼 클릭
5. **DNS 레코드 설정 화면**이 나타남:

   ```
   ┌──────────────────────────────────────────────────────────────────┐
   │ DNS Records for bujatime.com                                    │
   │                                                                  │
   │ Add these records to your DNS provider:                          │
   │                                                                  │
   │ ① MX Record (메일 수신용 - 선택사항)                             │
   │    Type: MX                                                      │
   │    Name: send                                                    │
   │    Value: feedback-smtp.us-east-1.amazonses.com                 │
   │    Priority: 10                                                  │
   │                                                                  │
   │ ② SPF Record (발신자 인증)                                       │
   │    Type: TXT                                                     │
   │    Name: send                                                    │
   │    Value: v=spf1 include:amazonses.com ~all                     │
   │                                                                  │
   │ ③ DKIM Record 1                                                  │
   │    Type: CNAME                                                   │
   │    Name: resend._domainkey                                       │
   │    Value: (긴 문자열)                                             │
   │                                                                  │
   │ ④ DKIM Record 2                                                  │
   │    Type: CNAME                                                   │
   │    Name: resend2._domainkey                                      │
   │    Value: (긴 문자열)                                             │
   │                                                                  │
   │ ⑤ DKIM Record 3                                                  │
   │    Type: CNAME                                                   │
   │    Name: resend3._domainkey                                      │
   │    Value: (긴 문자열)                                             │
   │                                                                  │
   │ ⑥ DMARC Record (이메일 정책)                                     │
   │    Type: TXT                                                     │
   │    Name: _dmarc                                                  │
   │    Value: v=DMARC1; p=none;                                     │
   │                                                                  │
   └──────────────────────────────────────────────────────────────────┘
   ```

6. **이 DNS 레코드들을 도메인 DNS 관리자에 추가해야 합니다.**

### 4-4. DNS 레코드 추가하기

도메인을 어디에서 관리하느냐에 따라 다릅니다. 대표적인 경우:

---

#### [A] Vercel에서 도메인 관리하는 경우

1. **https://vercel.com/dashboard** 접속 → 로그인
2. 상단 메뉴에서 프로젝트 이름(bujatime) 말고 → **`Settings`** 탭 클릭
   - 또는 왼쪽 사이드바 하단의 **`Domains`** 클릭
   - 직접 URL: https://vercel.com/dashboard/domains
3. **`bujatime.com`** 클릭
4. **DNS Records** 섹션이 보임
5. 각 레코드를 추가:
   - 우측의 **`Add Record`** 또는 **`+`** 버튼 클릭
   - Type 드롭다운에서 `TXT`, `CNAME`, `MX` 등 선택
   - Name, Value 입력
   - **`Add`** 클릭
6. Resend에서 제공한 6개 레코드를 모두 추가

---

#### [B] Cloudflare에서 도메인 관리하는 경우

1. **https://dash.cloudflare.com** 접속 → 로그인
2. 메인 화면에서 **`bujatime.com`** 도메인 카드 클릭
3. 왼쪽 사이드바에서 **`DNS`** → **`Records`** 클릭
   ```
   왼쪽 사이드바:
   ├── Overview
   ├── Analytics & Logs
   ├── DNS               ← 클릭
   │   └── Records       ← 자동 선택됨
   ├── Email
   ├── SSL/TLS
   └── ...
   ```
4. **`+ Add Record`** 파란 버튼 클릭
5. 각 레코드 타입 선택 (TXT, CNAME, MX) → Name, Content 입력
6. **CNAME 레코드의 경우**: Proxy status를 **`DNS only`** (회색 구름)으로 설정!
   - 주황색 구름(Proxied)이면 DKIM 인증 실패함
7. **`Save`** 클릭
8. 6개 레코드 모두 반복

---

#### [C] 가비아, 카페24 등 한국 호스팅에서 관리하는 경우

**가비아 예시:**
1. **https://www.gabia.com** → 로그인
2. 상단 메뉴: **`My가비아`** 클릭
3. **`도메인`** 탭 → **`도메인 관리`** 클릭
4. 도메인 목록에서 `bujatime.com` 의 **`관리`** 버튼 클릭
5. **`DNS 관리`** 또는 **`DNS 설정`** 탭 클릭
6. **`레코드 추가`** 버튼으로 각 레코드 추가

---

### 4-5. 도메인 인증 확인

1. DNS 레코드를 모두 추가한 후 (전파까지 최대 48시간, 보통 10분~1시간)
2. Resend 대시보드 → **`Domains`** → `bujatime.com` 클릭
3. 각 레코드 옆에 상태가 표시됨:
   ```
   SPF     ✅ Verified
   DKIM 1  ✅ Verified
   DKIM 2  ✅ Verified
   DKIM 3  ✅ Verified
   DMARC   ✅ Verified
   ```
4. 모든 항목이 ✅ **Verified**이면 완료!
5. 아직 ❌ **Not verified**인 항목이 있으면:
   - **`Verify DNS Records`** 버튼 클릭하여 재확인
   - DNS 전파 시간이 필요할 수 있음 (최대 48시간)
   - DNS 레코드 값을 다시 한번 비교 확인

### 4-6. 발신 이메일 주소 확인

도메인 인증이 완료되면 `@bujatime.com` 주소로 이메일 발송 가능.
코드에서 사용하는 발신자: `부자타임 <briefing@bujatime.com>`

> 별도로 "이메일 주소"를 만들 필요 없음. Resend는 인증된 도메인의 아무 주소로나 발송 가능.

---

## 5. GitHub Secrets 등록

GitHub Actions 워크플로우가 사용할 비밀 환경변수를 등록합니다.

### 5-1. GitHub 저장소 Settings 접근

1. 브라우저에서 GitHub 저장소 페이지로 이동
   - 예: `https://github.com/YOUR_USERNAME/goldenwave`
2. 저장소 페이지 상단에 탭 메뉴가 보임:
   ```
   📋 Code   🔀 Pull requests   ▶️ Actions   📊 Projects   📦 Wiki   ⚙️ Settings
   ```
3. **`Settings`** (맨 오른쪽 톱니바퀴 탭) 클릭

### 5-2. Secrets 메뉴 찾기

1. Settings 페이지 왼쪽에 긴 사이드바 메뉴가 있음:
   ```
   General
   ─────────────
   Access
   ├── Collaborators
   ├── Moderation
   ─────────────
   Code and automation
   ├── Branches
   ├── Tags
   ├── Rules
   ├── Actions              ← 주의! 이것 말고
   ├── Webhooks
   ├── Environments
   ├── Pages
   ─────────────
   Security
   ├── Code security
   ├── Secrets and variables  ← ★ 이것을 클릭!
   │   ├── Actions            ← ★★ 그 다음 이것을 클릭!
   │   ├── Codespaces
   │   └── Dependabot
   └── ...
   ```

2. **`Security`** 섹션 아래 **`Secrets and variables`** 클릭
3. 펼쳐지는 하위 메뉴에서 **`Actions`** 클릭
4. "Actions secrets and variables" 페이지가 나타남

### 5-3. Secret 추가하기

1. **`Secrets`** 탭이 선택된 상태 확인 (기본값)
2. 우측 상단의 **`New repository secret`** 초록 버튼 클릭
3. 다음 4개의 Secret을 하나씩 추가:

---

**Secret 1: SUPABASE_URL**

| 항목 | 입력값 |
|------|--------|
| **Name** | `SUPABASE_URL` |
| **Secret** | `https://abcdefgh.supabase.co` (Supabase 대시보드에서 복사한 Project URL) |

→ **`Add secret`** 클릭

---

**Secret 2: SUPABASE_SERVICE_ROLE_KEY**

| 항목 | 입력값 |
|------|--------|
| **Name** | `SUPABASE_SERVICE_ROLE_KEY` |
| **Secret** | `eyJhbGciOiJI...` (Supabase Settings > API에서 복사한 service_role 키) |

→ **`Add secret`** 클릭

> ⚠️ **주의**: `anon` 키가 아니라 **`service_role`** 키를 넣어야 합니다!
> service_role은 "Reveal" 버튼을 눌러야 보입니다.

---

**Secret 3: RESEND_API_KEY**

| 항목 | 입력값 |
|------|--------|
| **Name** | `RESEND_API_KEY` |
| **Secret** | `re_abcdefgh_123...` (Resend에서 복사한 API Key) |

→ **`Add secret`** 클릭

---

**Secret 4: GEMINI_API_KEY**

| 항목 | 입력값 |
|------|--------|
| **Name** | `GEMINI_API_KEY` |
| **Secret** | Gemini API 키 |

→ **`Add secret`** 클릭

**Gemini API 키를 아직 발급받지 않았다면:**
1. https://aistudio.google.com/apikey 접속
2. Google 계정으로 로그인
3. **`Create API key`** 클릭
4. 프로젝트 선택 (또는 새로 생성)
5. 생성된 API 키 복사

---

### 5-4. Secret 등록 확인

모든 Secret을 등록하면 목록에 4개가 보여야 함:

```
┌────────────────────────────────────────────────────┐
│ Repository secrets                                  │
│                                                     │
│ GEMINI_API_KEY              Updated 1 minute ago    │
│ RESEND_API_KEY              Updated 2 minutes ago   │
│ SUPABASE_SERVICE_ROLE_KEY   Updated 3 minutes ago   │
│ SUPABASE_URL                Updated 4 minutes ago   │
│                                                     │
└────────────────────────────────────────────────────┘
```

> Secret 값은 한번 저장하면 다시 볼 수 없습니다. 수정만 가능.
> 잘못 입력했으면 해당 Secret의 **`Update`** (연필 아이콘) 클릭하여 다시 입력.

---

## 6. 로컬 .env 파일 생성

로컬 개발 환경에서 NewsletterCTA 구독 기능이 동작하도록 `.env` 파일을 만듭니다.

### 6-1. 파일 생성

1. 프로젝트 루트 폴더에 `.env` 파일 생성:
   ```
   C:\NewProject\2026-02\bujatime.com\goldenwave\.env
   ```

2. 다음 내용 입력:
   ```
   VITE_SUPABASE_URL=https://abcdefgh.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...여기에_anon_키
   GEMINI_API_KEY=여기에_제미나이_API_키
   ```

3. 값은 [1-3. API 키 확인하기](#1-3-api-키-확인하기-매우-중요)에서 메모해둔 것 사용:
   - `VITE_SUPABASE_URL` = Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = Supabase anon (public) 키
   - `GEMINI_API_KEY` = Google Gemini API 키

> ⚠️ `.env` 파일은 `.gitignore`에 포함되어 있어 Git에 올라가지 않습니다. 안전합니다.

---

## 7. 전체 테스트

### 7-1. 로컬 구독 테스트

1. 개발 서버 실행:
   ```
   npm run dev
   ```
2. `http://localhost:3000` 접속
3. 페이지 맨 아래 뉴스레터 구독 섹션으로 스크롤
4. 이메일 주소 입력 → **`구독하기`** 클릭
5. "구독이 완료되었습니다!" 메시지 확인
6. Supabase 대시보드 → **Table Editor** → `subscribers` 테이블에서 데이터 확인

### 7-2. 브리핑 파이프라인 수동 테스트

```powershell
# 1. 뉴스 수집
node scripts/collect-news.mjs

# 2. AI 브리핑 생성 (GEMINI_API_KEY 환경변수 필요)
$env:GEMINI_API_KEY="여기에_API_키"
node scripts/generate-briefing.mjs

# 3. 이메일 HTML 생성
node scripts/generate-email-html.mjs

# 4. 생성된 HTML 확인 (브라우저에서 열기)
start scripts/temp/briefing-email.html
```

### 7-3. GitHub Actions 수동 테스트

1. GitHub 저장소 페이지 → **`Actions`** 탭 클릭
2. 왼쪽 사이드바에서 **`Daily Briefing Newsletter`** 워크플로우 클릭
3. 우측의 **`Run workflow`** 드롭다운 클릭
4. Branch: `main` 선택 → **`Run workflow`** 초록 버튼 클릭
5. 워크플로우 실행 상태 확인:
   ```
   ✅ Checkout repository
   ✅ Setup Node.js
   ✅ Create temp directory
   ✅ Collect news and market data
   ✅ Generate briefing with Gemini
   ✅ Generate email HTML template
   ✅ Send briefing emails via Resend
   ✅ Cleanup temp files
   ```
6. 모든 단계가 ✅이면 성공!

### 7-4. 구독 해지 테스트

1. Supabase 대시보드 → **Table Editor** → `subscribers`
2. 아무 구독자 행의 `token` 값 복사
3. 브라우저에서: `http://localhost:3000/unsubscribe?token=복사한_토큰_값`
4. "구독이 해지되었습니다" 메시지 확인
5. Supabase에서 해당 구독자의 `status`가 `unsubscribed`로 변경 확인

---

## 요약: 필요한 키 & 어디에 사용되는지

| 키 이름 | 어디서 발급 | 어디에 저장 | 용도 |
|---------|------------|------------|------|
| `VITE_SUPABASE_URL` | Supabase > Settings > API | `.env` 파일 | 프론트엔드 구독 API 호출 |
| `VITE_SUPABASE_ANON_KEY` | Supabase > Settings > API (anon) | `.env` 파일 | 프론트엔드 인증 헤더 |
| `SUPABASE_URL` | Supabase > Settings > API | GitHub Secrets | 스크립트에서 DB 접근 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API (service_role) | GitHub Secrets | 스크립트에서 DB 전체 권한 |
| `RESEND_API_KEY` | Resend > API Keys | GitHub Secrets | 이메일 발송 |
| `GEMINI_API_KEY` | Google AI Studio | `.env` + GitHub Secrets | AI 브리핑 생성 |

---

## 체크리스트

완료할 때마다 체크하세요:

- [ ] Supabase 프로젝트 생성 완료
- [ ] Supabase API 키 3개 메모 완료 (URL, anon, service_role)
- [ ] Supabase SQL Editor에서 테이블 생성 완료
- [ ] Supabase CLI 설치 완료
- [ ] Supabase CLI 로그인 + 프로젝트 연결 완료
- [ ] Edge Function 2개 배포 완료 (subscribe-email, unsubscribe)
- [ ] Resend 가입 완료
- [ ] Resend API 키 발급 + 메모 완료
- [ ] Resend 도메인 인증 (DNS 레코드 추가) 완료
- [ ] Resend 도메인 인증 상태 ✅ Verified 확인
- [ ] GitHub Secrets 4개 등록 완료
- [ ] 로컬 `.env` 파일 생성 완료
- [ ] 로컬 구독 테스트 통과
- [ ] 브리핑 파이프라인 수동 테스트 통과
- [ ] GitHub Actions 수동 실행 테스트 통과
