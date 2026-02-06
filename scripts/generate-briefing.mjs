/**
 * AI 브리핑 생성 스크립트
 *
 * collect-news.mjs로 수집된 데이터를 Gemini API로 요약하여
 * 부자브리핑 콘텐츠를 생성합니다.
 *
 * 환경변수: GEMINI_API_KEY
 * 사용법: node scripts/generate-briefing.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT_PATH = resolve(__dirname, 'temp/collected-data.json');
const OUTPUT_PATH = resolve(__dirname, 'temp/briefing-content.json');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

if (!existsSync(INPUT_PATH)) {
  console.error('❌ 수집 데이터 파일이 없습니다. collect-news.mjs를 먼저 실행하세요.');
  process.exit(1);
}

async function callGemini(prompt, options = {}) {
  const { temperature = 0.7, maxTokens = 2048 } = options;

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API 오류 (${res.status}): ${errText}`);
  }

  const result = await res.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ─── 시장 데이터 포맷팅 ───
function formatMarketSummary(market) {
  const lines = [];

  if (market.kospi) {
    const dir = parseFloat(market.kospi.change) >= 0 ? '▲' : '▼';
    lines.push(`KOSPI: ${market.kospi.price?.toLocaleString()} (${dir}${Math.abs(market.kospi.change)}%)`);
  }
  if (market.kosdaq) {
    const dir = parseFloat(market.kosdaq.change) >= 0 ? '▲' : '▼';
    lines.push(`KOSDAQ: ${market.kosdaq.price?.toLocaleString()} (${dir}${Math.abs(market.kosdaq.change)}%)`);
  }
  if (market.exchange) {
    lines.push(`환율(USD/KRW): ${market.exchange.usd?.toLocaleString()}원`);
    if (market.exchange.jpy) lines.push(`환율(JPY 100/KRW): ${(market.exchange.jpy * 100)?.toFixed(0)}원`);
  }
  if (market.crypto) {
    if (market.crypto.btc) {
      const dir = parseFloat(market.crypto.btc.change24h) >= 0 ? '▲' : '▼';
      lines.push(`BTC: ${market.crypto.btc.price?.toLocaleString()}원 (${dir}${Math.abs(market.crypto.btc.change24h)}%)`);
    }
    if (market.crypto.eth) {
      const dir = parseFloat(market.crypto.eth.change24h) >= 0 ? '▲' : '▼';
      lines.push(`ETH: ${market.crypto.eth.price?.toLocaleString()}원 (${dir}${Math.abs(market.crypto.eth.change24h)}%)`);
    }
  }

  return lines.length > 0 ? lines.join('\n') : '시장 데이터 없음';
}

// ─── 뉴스 요약용 데이터 포맷팅 ───
function formatNewsForPrompt(news) {
  if (!news || news.length === 0) return '수집된 뉴스가 없습니다.';

  return news
    .map((n, i) => `${i + 1}. [${n.category}] ${n.title}\n   ${n.description}\n   링크: ${n.link}`)
    .join('\n\n');
}

// ─── 최신 포스트 포맷팅 ───
function formatPostsForPrompt(posts) {
  if (!posts || posts.length === 0) return '';

  return posts
    .map((p) => `- "${p.title}" (${p.category}) - ${p.excerpt}\n  URL: ${p.url}`)
    .join('\n');
}

async function main() {
  console.log('\n🤖 AI 브리핑 생성 시작...\n');

  const collected = JSON.parse(readFileSync(INPUT_PATH, 'utf-8'));
  const today = collected.date;

  const marketSummary = formatMarketSummary(collected.market);
  const newsSummary = formatNewsForPrompt(collected.news);
  const postsSummary = formatPostsForPrompt(collected.latestPosts);

  // ─── Step 1: 브리핑 본문 생성 ───
  console.log('📝 브리핑 본문 생성 중...');

  const briefingPrompt = `당신은 "부자타임(bujatime.com)"이라는 한국 금융 인사이트 미디어의 에디터입니다.
아래 수집된 데이터를 바탕으로 "${today} 부자브리핑"을 작성하세요.

## 작성 규칙
1. 톤: 친근하지만 전문적, 20~40대 직장인/투자자 대상
2. 반드시 아래 구조를 따르세요:

### 📊 오늘의 시장 한눈에
(시장 데이터를 깔끔한 표/목록으로 정리)

### 🔥 주요 뉴스 TOP 5
(각 뉴스를 2~3줄로 핵심 요약, 번호 매겨서. 원문 링크는 제목에 포함)

### 💡 오늘의 부자 인사이트
(실천 가능한 금융/투자/절약 팁 1가지를 3~5줄로 작성)

### 📖 부자타임 추천 글
(최신 블로그 포스트 1~2개를 간략히 소개, 링크 포함)

3. 전체 분량: 800~1,200자 (읽는 데 3분 이내)
4. 이모지는 섹션 제목에만 사용
5. 마크다운 형식으로 출력
6. 인사말은 "좋은 아침이에요! 오늘의 부자브리핑입니다." 한 줄로 시작
7. 마지막 한 줄: "오늘도 부자되는 하루 보내세요! — 부자타임 드림"

## 수집 데이터

### 시장 데이터
${marketSummary}

### 뉴스
${newsSummary}

### 부자타임 최신 글
${postsSummary || '(최신 포스트 없음)'}
`;

  const briefingMarkdown = await callGemini(briefingPrompt, {
    temperature: 0.7,
    maxTokens: 2048,
  });

  console.log('  ✅ 본문 생성 완료');

  // ─── Step 2: 이메일 제목 생성 ───
  console.log('📌 이메일 제목 생성 중...');

  const titlePrompt = `다음 뉴스레터 내용을 보고, 이메일 제목을 1개만 작성하세요.

규칙:
- 30자 이내
- 호기심을 자극하는 문구
- 핵심 숫자나 키워드 포함
- 앞에 이모지 1개만 사용
- 따옴표 없이 제목만 출력

뉴스레터 내용:
${briefingMarkdown.substring(0, 800)}`;

  const subject = (await callGemini(titlePrompt, {
    temperature: 0.9,
    maxTokens: 100,
  })).trim().replace(/^["']|["']$/g, '');

  console.log(`  ✅ 제목: ${subject}`);

  // ─── Step 3: 미리보기 텍스트 생성 ───
  const previewText = briefingMarkdown
    .replace(/^#+\s.*$/gm, '')
    .replace(/[*_`#]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, 120) + '...';

  // ─── 결과 저장 ───
  const briefingData = {
    date: today,
    subject,
    previewText,
    markdown: briefingMarkdown,
    sourceData: {
      newsCount: collected.news?.length || 0,
      hasMarket: collected.stats?.hasMarketData || false,
      postCount: collected.latestPosts?.length || 0,
    },
    generatedAt: new Date().toISOString(),
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(briefingData, null, 2), 'utf-8');
  console.log(`\n✅ 브리핑 생성 완료! → ${OUTPUT_PATH}\n`);
}

main().catch((err) => {
  console.error('❌ 브리핑 생성 중 오류:', err);
  process.exit(1);
});
