/**
 * 뉴스 & 시장 데이터 수집 스크립트
 *
 * 매일 아침 부자브리핑에 사용할 데이터를 수집합니다.
 * - Google 뉴스 RSS (한국 경제/금융)
 * - 시장 데이터 (KOSPI, 환율, 코인)
 * - 부자타임 최신 포스트
 *
 * 사용법: node scripts/collect-news.mjs
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = resolve(__dirname, 'temp');
const OUTPUT_PATH = resolve(TEMP_DIR, 'collected-data.json');

// temp 디렉토리 생성
if (!existsSync(TEMP_DIR)) {
  mkdirSync(TEMP_DIR, { recursive: true });
}

// ─── RSS XML 파서 (간단한 정규식 기반) ───
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const pubDate = extractTag(itemXml, 'pubDate');
    const description = extractTag(itemXml, 'description');

    if (title && link) {
      items.push({
        title: cleanHtml(title),
        link,
        pubDate,
        description: cleanHtml(description || '').substring(0, 200),
      });
    }
  }

  return items;
}

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's');
  const match = regex.exec(xml);
  return match ? match[1].trim() : '';
}

function cleanHtml(str) {
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── 1. Google 뉴스 RSS 수집 (한국 경제) ───
async function fetchNewsRSS() {
  const feeds = [
    {
      name: '경제',
      url: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNRGx6TVdZU0FtdHZLQUFQAQ?hl=ko&gl=KR&ceid=KR:ko',
    },
    {
      name: '비즈니스',
      url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko',
    },
  ];

  const allArticles = [];

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'BujaTime-Briefing/1.0' },
      });
      if (!res.ok) {
        console.warn(`⚠️ ${feed.name} RSS 응답 오류: ${res.status}`);
        continue;
      }
      const xml = await res.text();
      const items = parseRSS(xml);
      allArticles.push(
        ...items.slice(0, 5).map((item) => ({
          ...item,
          category: feed.name,
        }))
      );
      console.log(`  ✅ ${feed.name}: ${Math.min(items.length, 5)}건 수집`);
    } catch (err) {
      console.warn(`  ⚠️ ${feed.name} 수집 실패: ${err.message}`);
    }
  }

  return allArticles;
}

// ─── 2. 시장 데이터 수집 ───
async function fetchMarketData() {
  const market = {
    kospi: null,
    kosdaq: null,
    exchange: null,
    crypto: null,
  };

  // KOSPI
  try {
    const res = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/%5EKS11?interval=1d&range=2d',
      { headers: { 'User-Agent': 'BujaTime-Briefing/1.0' } }
    );
    if (res.ok) {
      const data = await res.json();
      const meta = data.chart?.result?.[0]?.meta;
      if (meta) {
        market.kospi = {
          price: meta.regularMarketPrice,
          previousClose: meta.chartPreviousClose,
          change: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100).toFixed(2),
        };
        console.log(`  ✅ KOSPI: ${market.kospi.price} (${market.kospi.change}%)`);
      }
    }
  } catch (err) {
    console.warn(`  ⚠️ KOSPI 수집 실패: ${err.message}`);
  }

  // KOSDAQ
  try {
    const res = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/%5EKQ11?interval=1d&range=2d',
      { headers: { 'User-Agent': 'BujaTime-Briefing/1.0' } }
    );
    if (res.ok) {
      const data = await res.json();
      const meta = data.chart?.result?.[0]?.meta;
      if (meta) {
        market.kosdaq = {
          price: meta.regularMarketPrice,
          previousClose: meta.chartPreviousClose,
          change: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose * 100).toFixed(2),
        };
        console.log(`  ✅ KOSDAQ: ${market.kosdaq.price} (${market.kosdaq.change}%)`);
      }
    }
  } catch (err) {
    console.warn(`  ⚠️ KOSDAQ 수집 실패: ${err.message}`);
  }

  // 환율 (기존 데이터 파일 활용)
  try {
    const exchangePath = resolve(__dirname, '../public/data/exchange-rates.json');
    if (existsSync(exchangePath)) {
      const exchangeData = JSON.parse(readFileSync(exchangePath, 'utf-8'));
      market.exchange = {
        usd: exchangeData.rates?.USD,
        jpy: exchangeData.rates?.JPY,
        eur: exchangeData.rates?.EUR,
        cny: exchangeData.rates?.CNY,
        updatedAt: exchangeData.updatedAt,
      };
      console.log(`  ✅ 환율: USD ${market.exchange.usd}`);
    }
  } catch (err) {
    console.warn(`  ⚠️ 환율 데이터 로드 실패: ${err.message}`);
  }

  // 코인 시세
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=krw&include_24hr_change=true'
    );
    if (res.ok) {
      const data = await res.json();
      market.crypto = {
        btc: {
          price: data.bitcoin?.krw,
          change24h: data.bitcoin?.krw_24h_change?.toFixed(2),
        },
        eth: {
          price: data.ethereum?.krw,
          change24h: data.ethereum?.krw_24h_change?.toFixed(2),
        },
      };
      console.log(`  ✅ BTC: ${market.crypto.btc.price?.toLocaleString()}원`);
    }
  } catch (err) {
    console.warn(`  ⚠️ 코인 시세 수집 실패: ${err.message}`);
  }

  return market;
}

// ─── 3. 부자타임 최신 포스트 ───
function getLatestPosts() {
  try {
    const postsPath = resolve(__dirname, '../src/data/posts.json');
    const posts = JSON.parse(readFileSync(postsPath, 'utf-8'));
    const latest = posts
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3)
      .map((p) => ({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        category: p.category,
        date: p.date,
        url: `https://bujatime.com/blog/${p.slug}`,
      }));
    console.log(`  ✅ 최신 포스트: ${latest.length}건`);
    return latest;
  } catch (err) {
    console.warn(`  ⚠️ 포스트 로드 실패: ${err.message}`);
    return [];
  }
}

// ─── 메인 실행 ───
async function main() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`\n📰 부자브리핑 데이터 수집 시작 (${today})\n`);

  console.log('🔍 뉴스 RSS 수집...');
  const news = await fetchNewsRSS();

  console.log('\n📊 시장 데이터 수집...');
  const market = await fetchMarketData();

  console.log('\n📖 부자타임 최신 포스트...');
  const latestPosts = getLatestPosts();

  const collectedData = {
    date: today,
    collectedAt: new Date().toISOString(),
    news,
    market,
    latestPosts,
    stats: {
      newsCount: news.length,
      hasMarketData: !!(market.kospi || market.exchange || market.crypto),
      postCount: latestPosts.length,
    },
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(collectedData, null, 2), 'utf-8');
  console.log(`\n✅ 수집 완료! → ${OUTPUT_PATH}`);
  console.log(`   뉴스 ${news.length}건 | 시장 데이터 ${collectedData.stats.hasMarketData ? '있음' : '없음'} | 포스트 ${latestPosts.length}건\n`);
}

main().catch((err) => {
  console.error('❌ 수집 중 오류:', err);
  process.exit(1);
});
