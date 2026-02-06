# 매일 아침 부자브리핑 - 기능 설계 구현 가이드

> 작성일: 2026-02-05
> 프로젝트: 부자타임 (bujatime.com)

---

## 1. 시스템 아키텍처 전체 개요

```
┌─────────────────────────────────────────────────────────────────┐
│                        부자타임 프론트엔드                         │
│  (React + Vite + Tailwind)                                      │
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌───────────────────┐    │
│  │ NewsletterCTA│   │ 구독 확인 페이지│   │ 구독 해지 페이지  │    │
│  │ (이메일 입력) │   │ /subscribe/ok│   │ /unsubscribe     │    │
│  └──────┬───────┘   └──────────────┘   └───────────────────┘    │
│         │                                                        │
└─────────┼────────────────────────────────────────────────────────┘
          │ POST /subscribe
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Supabase (Backend)                           │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ Edge Function     │  │ Edge Function     │                    │
│  │ subscribe-email   │  │ unsubscribe       │                    │
│  └────────┬──────────┘  └──────────────────┘                    │
│           │                                                      │
│  ┌────────▼──────────────────────────────────────────┐          │
│  │              PostgreSQL Database                    │          │
│  │  ┌─────────────────┐  ┌────────────────────────┐  │          │
│  │  │ subscribers      │  │ briefing_issues        │  │          │
│  │  │ - id             │  │ - id                   │  │          │
│  │  │ - email          │  │ - issue_date           │  │          │
│  │  │ - status         │  │ - subject              │  │          │
│  │  │ - token          │  │ - html_content         │  │          │
│  │  │ - subscribed_at  │  │ - sent_at              │  │          │
│  │  │ - unsubscribed_at│  │ - recipient_count      │  │          │
│  │  └─────────────────┘  └────────────────────────┘  │          │
│  └───────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
          │
          │ GitHub Actions (매일 KST 07:00)
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  콘텐츠 큐레이션 파이프라인                        │
│                                                                  │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐  │
│  │ 1. 수집  │──▶│ 2. 요약  │──▶│ 3. 생성  │──▶│ 4. 이메일    │  │
│  │ (RSS/API)│   │ (Gemini) │   │ (HTML)   │   │    발송      │  │
│  └─────────┘   └──────────┘   └──────────┘   │ (Resend API) │  │
│                                               └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 기술 스택 선정

| 영역 | 선택 | 이유 |
|------|------|------|
| **DB & Auth** | Supabase (무료 티어) | PostgreSQL 기반, Edge Functions 제공, 무료 500MB DB |
| **이메일 발송** | Resend | 월 3,000통 무료, React Email 지원, API 간단 |
| **AI 요약** | Google Gemini API | 이미 GEMINI_API_KEY 설정됨, 무료 티어 넉넉 |
| **뉴스 수집** | RSS + 네이버 뉴스 API | 무료, 한국 금융/경제 뉴스 풍부 |
| **자동화** | GitHub Actions | 이미 환율 업데이트에 사용 중, 추가 비용 없음 |
| **이메일 템플릿** | React Email + Tailwind | 기존 스택과 일관성, 아름다운 이메일 디자인 |

### 대안 비교

**이메일 발송 서비스:**
| 서비스 | 무료 한도 | 장점 | 단점 |
|--------|----------|------|------|
| **Resend** (추천) | 3,000통/월 | API 심플, React Email 통합 | 구독자 1,000명 넘으면 유료 |
| SendGrid | 100통/일 | 검증된 서비스 | API 복잡, 설정 번거로움 |
| Mailgun | 1,000통/월 (3개월) | 높은 전달률 | 무료 기간 짧음 |
| AWS SES | $0.10/1,000통 | 가장 저렴 | 초기 설정 복잡 |

**데이터 저장:**
| 서비스 | 무료 한도 | 장점 | 단점 |
|--------|----------|------|------|
| **Supabase** (추천) | 500MB DB, 50K MAU | Edge Functions 포함, 관리 쉬움 | Row 제한 (500K) |
| Firebase | Firestore 1GB | Google 생태계 | 쿼리 제한적 |
| PlanetScale | 1GB (deprecated) | MySQL 호환 | 무료 플랜 종료 예정 |

---

## 3. 데이터베이스 설계 (Supabase)

### 3.1 subscribers 테이블

```sql
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  token UUID DEFAULT gen_random_uuid() NOT NULL, -- 구독 해지용 고유 토큰
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  ip_address INET,
  source TEXT DEFAULT 'website', -- 유입 경로 (website, footer, popup 등)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 이메일 검색 인덱스
CREATE INDEX idx_subscribers_email ON subscribers (email);
-- 활성 구독자 조회용
CREATE INDEX idx_subscribers_active ON subscribers (status) WHERE status = 'active';

-- RLS (Row Level Security) 정책
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- 서비스 키로만 접근 가능 (Edge Function에서 사용)
CREATE POLICY "Service role only" ON subscribers
  FOR ALL USING (auth.role() = 'service_role');
```

### 3.2 briefing_issues 테이블

```sql
CREATE TABLE briefing_issues (
  id SERIAL PRIMARY KEY,
  issue_date DATE UNIQUE NOT NULL,
  subject TEXT NOT NULL,             -- 이메일 제목
  preview_text TEXT,                 -- 이메일 미리보기 텍스트
  html_content TEXT NOT NULL,        -- 생성된 HTML 뉴스레터
  plain_text TEXT,                   -- 텍스트 버전
  source_articles JSONB,            -- 수집된 원본 기사 메타데이터
  ai_summary TEXT,                  -- AI 요약본
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_briefing_date ON briefing_issues (issue_date DESC);
```

### 3.3 briefing_clicks 테이블 (선택사항 - 통계 추적)

```sql
CREATE TABLE briefing_clicks (
  id SERIAL PRIMARY KEY,
  issue_id INTEGER REFERENCES briefing_issues(id),
  subscriber_id UUID REFERENCES subscribers(id),
  link_url TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Phase 1: 이메일 구독 시스템

### 4.1 Supabase Edge Function - 구독 처리

**파일: `supabase/functions/subscribe-email/index.ts`**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://bujatime.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: '유효한 이메일 주소를 입력해주세요.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 이미 구독 중인지 확인
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, status')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existing) {
      if (existing.status === 'active') {
        return new Response(
          JSON.stringify({ message: '이미 구독 중입니다!' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      // 구독 해지했던 사용자 재구독
      await supabase
        .from('subscribers')
        .update({ status: 'active', unsubscribed_at: null })
        .eq('id', existing.id)
    } else {
      // 신규 구독
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip')
      await supabase
        .from('subscribers')
        .insert({
          email: email.toLowerCase().trim(),
          ip_address: ip,
          source: 'website'
        })
    }

    return new Response(
      JSON.stringify({ message: '구독이 완료되었습니다! 매일 아침 부자브리핑을 보내드릴게요.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: '구독 처리 중 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### 4.2 프론트엔드 NewsletterCTA 수정

**파일: `src/components/home/NewsletterCTA.tsx`**

```tsx
import { useState } from 'react'
import { Mail, ArrowRight, Check, Loader2 } from 'lucide-react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export default function NewsletterCTA() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/subscribe-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message)
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || '구독 처리 중 오류가 발생했습니다.')
      }
    } catch {
      setStatus('error')
      setMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }

    // 5초 후 상태 초기화
    setTimeout(() => {
      setStatus('idle')
      setMessage('')
    }, 5000)
  }

  return (
    <section data-newsletter className="py-16 bg-gradient-to-br from-soot-900 via-soot-800 to-moss-900">
      <div className="container mx-auto px-6 text-center">
        {/* ... 기존 아이콘/타이틀 유지 ... */}

        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2 text-moss-400 text-lg">
            <Check size={20} />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소 입력"
              required
              disabled={status === 'loading'}
              className="w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-full text-white placeholder-soot-400 focus:outline-none focus:ring-2 focus:ring-moss-500 focus:border-transparent text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full sm:w-auto flex-shrink-0 px-6 py-3.5 bg-moss-600 hover:bg-moss-500 text-white rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-moss-900/30 disabled:opacity-50"
            >
              {status === 'loading' ? (
                <><Loader2 size={16} className="animate-spin" /> 처리 중...</>
              ) : (
                <>구독하기 <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-3 text-red-400 text-sm">{message}</p>
        )}

        <p className="mt-4 text-xs text-soot-500">
          구독은 언제든 취소할 수 있습니다. 스팸 없이, 가치 있는 콘텐츠만 보내드립니다.
        </p>
      </div>
    </section>
  )
}
```

### 4.3 환경 변수 설정

**`.env` (로컬 개발)**
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

**GitHub Secrets (배포)**
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
GEMINI_API_KEY
```

---

## 5. Phase 2: 콘텐츠 큐레이션 파이프라인

### 5.1 뉴스 수집 소스

| 소스 | 유형 | 수집 항목 | 방법 |
|------|------|----------|------|
| 네이버 뉴스 RSS | RSS | 경제/금융/부동산/주식 뉴스 | RSS 파싱 |
| 한국은행 | API | 기준금리, 경제 지표 | 공공 API |
| KOSPI/KOSDAQ | 크롤링 | 전일 종가, 등락률 | Yahoo Finance API |
| 환율 | 기존 데이터 | USD/JPY/EUR 환율 | 이미 구축됨 (exchange-rates.json) |
| 부자타임 블로그 | 내부 데이터 | 최신 포스트 | posts.json 참조 |
| 코인 시세 | API | BTC/ETH 가격 | CoinGecko API (무료) |

### 5.2 수집 스크립트

**파일: `scripts/collect-news.mjs`**

```javascript
import { writeFileSync } from 'fs';

// ─── 1. 네이버 뉴스 RSS 수집 ───
async function fetchNaverNews() {
  const categories = [
    { name: '경제', url: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNRGx6TVdZU0FtdHZLQUFQAQ?hl=ko&gl=KR&ceid=KR:ko' },
    // 또는 네이버 뉴스 RSS
  ];

  const articles = [];
  for (const cat of categories) {
    try {
      const res = await fetch(cat.url);
      const xml = await res.text();
      // XML 파싱하여 제목, 링크, 설명 추출
      const items = parseRSS(xml);
      articles.push(...items.slice(0, 5).map(item => ({
        ...item,
        category: cat.name
      })));
    } catch (e) {
      console.error(`${cat.name} 수집 실패:`, e.message);
    }
  }
  return articles;
}

// ─── 2. 시장 데이터 수집 ───
async function fetchMarketData() {
  // KOSPI / KOSDAQ
  const yahooRes = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EKS11');
  const kospiData = await yahooRes.json();

  // 환율 (기존 데이터 활용)
  const exchangeRes = await fetch('https://open.er-api.com/v6/latest/KRW');
  const exchangeData = await exchangeRes.json();

  // 코인
  const coinRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=krw&include_24hr_change=true');
  const coinData = await coinRes.json();

  return {
    kospi: kospiData,
    exchange: exchangeData,
    crypto: coinData
  };
}

// ─── 3. 부자타임 최신 포스트 ───
function getLatestPosts() {
  const posts = JSON.parse(readFileSync('src/data/posts.json', 'utf-8'));
  return posts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);
}

// ─── 메인 실행 ───
async function main() {
  console.log('📰 뉴스 수집 시작...');

  const [news, market, posts] = await Promise.all([
    fetchNaverNews(),
    fetchMarketData(),
    Promise.resolve(getLatestPosts())
  ]);

  const collectedData = {
    date: new Date().toISOString().split('T')[0],
    collectedAt: new Date().toISOString(),
    news,
    market,
    latestPosts: posts
  };

  writeFileSync(
    'scripts/temp/collected-data.json',
    JSON.stringify(collectedData, null, 2)
  );

  console.log(`✅ 수집 완료: 뉴스 ${news.length}건, 시장 데이터, 최신 포스트 ${posts.length}건`);
}

main().catch(console.error);
```

### 5.3 AI 요약 스크립트

**파일: `scripts/generate-briefing.mjs`**

```javascript
import { readFileSync, writeFileSync } from 'fs';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function generateBriefing() {
  const collected = JSON.parse(readFileSync('scripts/temp/collected-data.json', 'utf-8'));

  const prompt = `
당신은 "부자타임"이라는 한국 금융 인사이트 미디어의 에디터입니다.
아래 수집된 데이터를 바탕으로 "매일 아침 부자브리핑" 뉴스레터를 작성하세요.

## 작성 규칙
1. 톤: 친근하지만 전문적, 20-40대 직장인 대상
2. 구조:
   - 📊 오늘의 시장 한눈에 (KOSPI, 환율, 코인 등 핵심 수치)
   - 🔥 주요 뉴스 TOP 5 (각 2-3줄 요약 + 원문 링크)
   - 💡 오늘의 부자 인사이트 (실천 가능한 금융 팁 1가지)
   - 📖 부자타임 추천 글 (최신 블로그 포스트 소개)
3. 전체 분량: 800-1,200자 (읽는 데 3분 이내)
4. 이모지 적절히 사용하되 과하지 않게
5. 마크다운 형식으로 출력

## 수집 데이터
${JSON.stringify(collected, null, 2)}
`;

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    })
  });

  const result = await response.json();
  const briefingText = result.candidates[0].content.parts[0].text;

  // 이메일 제목 생성
  const titlePrompt = `
다음 뉴스레터 내용을 보고, 클릭하고 싶은 이메일 제목을 1개만 작성하세요.
규칙: 30자 이내, 핵심 숫자나 키워드 포함, 이모지 1개 사용
내용: ${briefingText.substring(0, 500)}
`;

  const titleRes = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: titlePrompt }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 100 }
    })
  });

  const titleResult = await titleRes.json();
  const subject = titleResult.candidates[0].content.parts[0].text.trim();

  const briefingData = {
    date: collected.date,
    subject,
    markdown: briefingText,
    generatedAt: new Date().toISOString()
  };

  writeFileSync(
    'scripts/temp/briefing-content.json',
    JSON.stringify(briefingData, null, 2)
  );

  console.log(`✅ 브리핑 생성 완료: "${subject}"`);
}

generateBriefing().catch(console.error);
```

---

## 6. Phase 3: 이메일 템플릿 생성

### 6.1 HTML 이메일 템플릿

**파일: `scripts/generate-email-html.mjs`**

이메일 클라이언트 호환성을 위해 인라인 CSS + 테이블 레이아웃 사용.

```javascript
import { readFileSync, writeFileSync } from 'fs';

function markdownToEmailHtml(markdown) {
  // 마크다운을 이메일 호환 HTML로 변환
  let html = markdown
    .replace(/^### (.*$)/gim, '<h3 style="color:#1a1a1a;font-size:18px;margin:20px 0 8px;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color:#1a1a1a;font-size:22px;margin:24px 0 12px;">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#2d6a4f;text-decoration:underline;">$1</a>')
    .replace(/\n\n/g, '</p><p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 16px;">')
    .replace(/\n/g, '<br>');

  return `<p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 16px;">${html}</p>`;
}

function generateEmailTemplate(briefingData, unsubscribeUrl) {
  const { date, subject, markdown } = briefingData;
  const contentHtml = markdownToEmailHtml(markdown);

  const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <!-- 프리헤더 텍스트 (이메일 미리보기) -->
  <div style="display:none;max-height:0;overflow:hidden;">
    ${subject} - 부자타임이 전하는 오늘의 금융 브리핑
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0eb;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- 헤더 -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a,#2d2d2d);padding:32px 40px;border-radius:16px 16px 0 0;">
              <table width="100%">
                <tr>
                  <td>
                    <h1 style="color:#d4a574;font-size:24px;margin:0;font-weight:800;">
                      ☀️ 부자브리핑
                    </h1>
                    <p style="color:#888;font-size:13px;margin:8px 0 0;">
                      ${formattedDate}
                    </p>
                  </td>
                  <td align="right" valign="top">
                    <a href="https://bujatime.com" style="color:#d4a574;font-size:14px;text-decoration:none;font-weight:600;">
                      bujatime.com
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 본문 -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- CTA: 부자타임 방문 -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px 40px;text-align:center;">
              <a href="https://bujatime.com"
                 style="display:inline-block;background-color:#2d6a4f;color:#ffffff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">
                부자타임에서 더 읽기 →
              </a>
            </td>
          </tr>

          <!-- 푸터 -->
          <tr>
            <td style="background-color:#f0ebe4;padding:24px 40px;border-radius:0 0 16px 16px;text-align:center;">
              <p style="color:#888;font-size:12px;margin:0 0 8px;">
                이 이메일은 부자타임 뉴스레터를 구독하셨기 때문에 발송되었습니다.
              </p>
              <a href="${unsubscribeUrl}"
                 style="color:#888;font-size:12px;text-decoration:underline;">
                구독 해지하기
              </a>
              <p style="color:#aaa;font-size:11px;margin:16px 0 0;">
                © 2026 부자타임 | hello@bujatime.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// 실행
const briefing = JSON.parse(readFileSync('scripts/temp/briefing-content.json', 'utf-8'));
const html = generateEmailTemplate(briefing, '{{UNSUBSCRIBE_URL}}');
writeFileSync('scripts/temp/briefing-email.html', html);
console.log('✅ 이메일 HTML 생성 완료');
```

---

## 7. Phase 4: 이메일 발송 시스템

### 7.1 Resend를 통한 발송

**파일: `scripts/send-briefing.mjs`**

```javascript
import { readFileSync } from 'fs';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getActiveSubscribers() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/subscribers?status=eq.active&select=id,email,token`, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    }
  });
  return res.json();
}

async function sendEmail(to, subject, html, unsubscribeToken) {
  // 개별 구독 해지 URL 삽입
  const personalizedHtml = html.replace(
    '{{UNSUBSCRIBE_URL}}',
    `https://bujatime.com/unsubscribe?token=${unsubscribeToken}`
  );

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: '부자타임 <briefing@bujatime.com>',
      to: [to],
      subject: subject,
      html: personalizedHtml,
      headers: {
        'List-Unsubscribe': `<https://bujatime.com/unsubscribe?token=${unsubscribeToken}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      }
    })
  });

  return res.json();
}

async function saveBriefingIssue(briefing, html, recipientCount) {
  await fetch(`${SUPABASE_URL}/rest/v1/briefing_issues`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({
      issue_date: briefing.date,
      subject: briefing.subject,
      html_content: html,
      ai_summary: briefing.markdown,
      sent_at: new Date().toISOString(),
      recipient_count: recipientCount,
    })
  });
}

async function main() {
  const briefing = JSON.parse(readFileSync('scripts/temp/briefing-content.json', 'utf-8'));
  const html = readFileSync('scripts/temp/briefing-email.html', 'utf-8');
  const subscribers = await getActiveSubscribers();

  console.log(`📬 발송 시작: ${subscribers.length}명 대상`);

  let successCount = 0;
  let failCount = 0;

  // 배치 발송 (Resend 무료 티어: 초당 2통 제한)
  for (let i = 0; i < subscribers.length; i++) {
    const sub = subscribers[i];
    try {
      await sendEmail(sub.email, briefing.subject, html, sub.token);
      successCount++;
      console.log(`  ✅ [${i + 1}/${subscribers.length}] ${sub.email}`);
    } catch (err) {
      failCount++;
      console.error(`  ❌ [${i + 1}/${subscribers.length}] ${sub.email}: ${err.message}`);
    }

    // Rate limit: 500ms 간격
    if (i < subscribers.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // 발송 기록 저장
  await saveBriefingIssue(briefing, html, successCount);

  console.log(`\n📊 발송 완료: 성공 ${successCount}건, 실패 ${failCount}건`);
}

main().catch(console.error);
```

### 7.2 구독자 규모별 발송 전략

| 구독자 수 | 전략 | 서비스 | 예상 비용 |
|-----------|------|--------|----------|
| ~1,000명 | Resend 직접 발송 | Resend 무료 | 무료 |
| 1,000~5,000명 | Resend Pro | Resend | $20/월 |
| 5,000~10,000명 | AWS SES + 큐 | AWS SES | ~$1/일 |
| 10,000명+ | 전문 ESP | Mailchimp/Stibee | 별도 견적 |

---

## 8. Phase 5: 구독 해지 시스템

### 8.1 Supabase Edge Function - 구독 해지

**파일: `supabase/functions/unsubscribe/index.ts`**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('잘못된 요청입니다.', { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data, error } = await supabase
    .from('subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString()
    })
    .eq('token', token)
    .eq('status', 'active');

  // 구독 해지 확인 페이지로 리다이렉트
  return new Response(null, {
    status: 302,
    headers: { 'Location': 'https://bujatime.com/unsubscribe/complete' }
  });
});
```

### 8.2 프론트엔드 구독 해지 페이지

**파일: `src/pages/UnsubscribePage.tsx`**

구독 해지 완료 확인 페이지. 간결하게 "구독이 해지되었습니다" 메시지와 재구독 링크 제공.

---

## 9. GitHub Actions 자동화

### 9.1 매일 아침 브리핑 발송 워크플로우

**파일: `.github/workflows/daily-briefing.yml`**

```yaml
name: Daily Briefing Newsletter

on:
  schedule:
    # 매일 한국시간 오전 7시 (UTC 22시, 전날) 실행
    - cron: '0 22 * * *'
  workflow_dispatch: # 수동 실행 가능

env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}

jobs:
  send-briefing:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Create temp directory
        run: mkdir -p scripts/temp

      # Step 1: 뉴스/시장 데이터 수집
      - name: Collect news and market data
        run: node scripts/collect-news.mjs

      # Step 2: AI 브리핑 생성
      - name: Generate briefing with Gemini
        run: node scripts/generate-briefing.mjs

      # Step 3: 이메일 HTML 생성
      - name: Generate email template
        run: node scripts/generate-email-html.mjs

      # Step 4: 이메일 발송
      - name: Send briefing emails
        run: node scripts/send-briefing.mjs

      # 정리
      - name: Cleanup temp files
        if: always()
        run: rm -rf scripts/temp
```

---

## 10. 전체 구현 순서 (단계별)

### Stage 1: 기반 인프라 (최우선)

```
[1] Supabase 프로젝트 생성
[2] subscribers 테이블 + RLS 정책 생성
[3] briefing_issues 테이블 생성
[4] subscribe-email Edge Function 배포
[5] .env에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 추가
[6] NewsletterCTA.tsx → Supabase 연동 (Phase 4.2 코드)
[7] 테스트: 이메일 구독 → DB 저장 확인
```

### Stage 2: 콘텐츠 파이프라인

```
[8] scripts/collect-news.mjs 작성 (뉴스 수집)
[9] scripts/generate-briefing.mjs 작성 (AI 요약)
[10] scripts/generate-email-html.mjs 작성 (이메일 템플릿)
[11] 로컬에서 수동 테스트 (수집 → 요약 → HTML 생성)
```

### Stage 3: 발송 시스템

```
[12] Resend 계정 생성 + bujatime.com 도메인 인증
[13] scripts/send-briefing.mjs 작성
[14] 테스트 이메일 발송 (자신에게)
[15] unsubscribe Edge Function 배포
[16] UnsubscribePage.tsx 프론트엔드 추가
```

### Stage 4: 자동화

```
[17] .github/workflows/daily-briefing.yml 작성
[18] GitHub Secrets 설정
[19] workflow_dispatch로 수동 테스트
[20] cron 스케줄 활성화 → 자동 발송 시작
```

### Stage 5: 개선 (선택)

```
[21] 웹에서 지난 브리핑 아카이브 페이지 (/briefing/archive)
[22] 열람율/클릭율 추적
[23] 구독자 세그먼트 (관심사별)
[24] Welcome 이메일 (구독 시 자동 발송)
[25] A/B 테스트 (제목줄)
```

---

## 11. 비용 예상

### 무료 단계 (구독자 1,000명 이하)

| 항목 | 비용 |
|------|------|
| Supabase 무료 플랜 | $0 |
| Resend 무료 플랜 (3,000통/월) | $0 |
| Gemini API 무료 티어 | $0 |
| GitHub Actions (2,000분/월) | $0 |
| **합계** | **$0/월** |

### 성장 단계 (구독자 5,000명)

| 항목 | 비용 |
|------|------|
| Supabase Pro | $25/월 |
| Resend Pro | $20/월 |
| Gemini API | ~$1/월 |
| **합계** | **~$46/월** |

---

## 12. 보안 고려사항

1. **이메일 주소 보호**: RLS 활성화, service_role 키만 DB 접근
2. **구독 해지 토큰**: UUID 기반 추측 불가능한 토큰
3. **Rate Limiting**: Edge Function에 rate limit 적용
4. **CORS**: bujatime.com 도메인만 허용
5. **이메일 인증**: Resend 도메인 인증 (SPF, DKIM, DMARC)
6. **환경 변수**: 민감 정보는 반드시 GitHub Secrets 사용
7. **List-Unsubscribe 헤더**: 스팸 필터 회피, 법적 요구사항 준수

---

## 13. 모니터링 & 대시보드 (선택)

간단한 관리자 통계 페이지 추가 가능:

```
/admin/briefing (비공개)
├── 총 구독자 수 / 활성 구독자 수
├── 최근 30일 구독/해지 추이
├── 발송 히스토리 (날짜, 제목, 발송 수, 열람률)
└── 최근 브리핑 미리보기
```

---

## 요약

| 구분 | 내용 |
|------|------|
| **핵심 스택** | Supabase + Resend + Gemini + GitHub Actions |
| **초기 비용** | $0 (무료 티어 활용) |
| **자동화 수준** | 완전 자동 (매일 KST 07:00 발송) |
| **구현 파일** | 스크립트 4개 + Edge Function 2개 + 프론트엔드 2개 + 워크플로우 1개 |
| **확장성** | 구독자 규모에 따라 단계적 확장 가능 |
