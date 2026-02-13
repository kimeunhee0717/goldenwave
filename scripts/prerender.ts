import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { createServer } from 'http'
import puppeteer from 'puppeteer'

const DIST_DIR = resolve('dist')
const PORT = 4173
const CONCURRENCY = 3
const BASE_URL = 'https://www.bujatime.com'
const SITE_NAME = '부자타임'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`

// ── SEO 데이터 ──
interface SEOData {
  title: string
  description: string
  url: string
  image?: string
  type?: 'website' | 'article'
  publishedAt?: string
}

const posts = JSON.parse(readFileSync('src/data/posts.json', 'utf-8'))
const categories = JSON.parse(readFileSync('src/data/categories.json', 'utf-8'))

function getSEOData(route: string): SEOData {
  // 정적 페이지
  const staticSEO: Record<string, SEOData> = {
    '/': { title: SITE_NAME, description: 'AI, 재테크, 부업, 비즈니스 — 경제적 자유를 향한 매일의 인사이트를 전합니다. 복리 계산기, 연봉 계산기 등 무료 재무 도구도 이용하세요.', url: '/' },
    '/blog': { title: '블로그', description: 'AI, 재테크, 부업, 비즈니스 — 경제적 자유를 향한 매일의 인사이트를 전합니다.', url: '/blog' },
    '/tools': { title: '무료 계산기 도구 모음', description: '복리 계산기, 대출 이자 계산기, 연봉 실수령액 계산기, 환율 계산기 등 20가지 이상의 무료 재무·생활 계산기를 이용하세요.', url: '/tools' },
    '/about': { title: '소개', description: '부자타임은 AI 시대의 경제적 자유를 위한 인사이트를 매일 전하는 콘텐츠 플랫폼입니다.', url: '/about' },
    '/contact': { title: '문의하기', description: '부자타임에 문의사항이 있으시면 연락해 주세요. 빠르게 답변 드리겠습니다.', url: '/contact' },
    '/privacy': { title: '개인정보처리방침', description: '부자타임의 개인정보처리방침입니다.', url: '/privacy' },
    '/terms': { title: '이용약관', description: '부자타임의 서비스 이용약관입니다.', url: '/terms' },
  }

  if (staticSEO[route]) return staticSEO[route]

  // 카테고리 페이지
  if (route.startsWith('/blog/category/')) {
    const slug = route.replace('/blog/category/', '')
    const cat = categories.find((c: any) => c.slug === slug)
    if (cat) return { title: `${cat.title} - 블로그`, description: cat.description || `${cat.title} 카테고리의 최신 글을 확인하세요.`, url: route }
  }

  // 블로그 포스트
  if (route.startsWith('/blog/')) {
    const slug = route.replace('/blog/', '')
    const post = posts.find((p: any) => p.slug === slug)
    if (post) return { title: post.title, description: post.excerpt, url: route, image: post.coverImage, type: 'article', publishedAt: post.publishedAt }
  }

  // 도구 페이지
  const toolsSEO: Record<string, { title: string; desc: string }> = {
    '/tools/compound-interest': { title: '복리 계산기', desc: '복리 효과를 한눈에 확인하세요. 초기 투자금, 매월 적립액, 수익률을 입력하면 자산 성장 그래프와 연도별 상세 내역을 보여드립니다.' },
    '/tools/loan-interest': { title: '대출 이자 계산기', desc: '대출 원리금 상환 계획을 한눈에. 원리금균등, 원금균등, 만기일시상환 방식별 월 상환액과 총 이자를 비교해보세요.' },
    '/tools/salary': { title: '연봉 실수령액 계산기', desc: '연봉에서 4대보험과 소득세를 공제한 실수령액을 정확하게 계산합니다.' },
    '/tools/savings': { title: '적금·예금 이자 계산기', desc: '적금과 예금의 만기 수령액을 비교 계산합니다. 단리·복리, 세전·세후 이자를 한번에 확인하세요.' },
    '/tools/severance': { title: '퇴직금 계산기', desc: '근속 기간과 급여 정보를 입력하면 예상 퇴직금을 계산합니다.' },
    '/tools/pension': { title: '연금 수령액 계산기', desc: '국민연금 예상 수령액을 계산합니다. 가입 기간, 평균 소득에 따른 월 수령액을 확인하세요.' },
    '/tools/real-estate': { title: '부동산 수익률 계산기', desc: '부동산 투자 수익률을 정확하게 분석합니다. 매매가, 전세가, 월세, 각종 비용을 반영한 실질 수익률을 계산해보세요.' },
    '/tools/bmi': { title: 'BMI 계산기', desc: '키와 몸무게를 입력하면 BMI 지수와 비만도를 확인할 수 있습니다.' },
    '/tools/age': { title: '나이·만나이 계산기', desc: '생년월일을 입력하면 만나이, 한국식 나이, 연나이를 한번에 확인할 수 있습니다.' },
    '/tools/exchange-rate': { title: '환율 계산기', desc: '실시간 환율 기반으로 통화를 변환합니다. USD, EUR, JPY, CNY 등 주요 통화 환율을 간편하게 계산하세요.' },
    '/tools/jeonse-wolse': { title: '전세↔월세 전환 계산기', desc: '전세보증금과 월세를 상호 전환하여 비교합니다.' },
    '/tools/stock-return': { title: '주식 수익률 계산기', desc: '주식 투자 수익률을 계산합니다. 매수·매도 가격, 수량, 수수료를 입력하면 실현 수익과 수익률을 확인할 수 있습니다.' },
    '/tools/loan-refinance': { title: '대출 갈아타기 비교기', desc: '기존 대출과 신규 대출 조건을 비교하여 갈아타기 시 절감 금액을 계산합니다.' },
    '/tools/electricity': { title: '전기요금 계산기', desc: '가정용 전기요금을 누진제 기준으로 계산합니다.' },
    '/tools/hourly-wage': { title: '시급·일급 변환 계산기', desc: '시급, 일급, 주급, 월급을 상호 변환합니다.' },
    '/tools/income-tax': { title: '종합소득세 계산기', desc: '종합소득세를 간편하게 계산합니다. 사업소득, 근로소득, 기타소득에 대한 세금을 확인하세요.' },
    '/tools/car-cost': { title: '자동차 유지비 계산기', desc: '자동차 연간 유지비를 계산합니다. 유류비, 보험료, 세금, 정비비 등을 포함한 총 유지비용을 확인해보세요.' },
    '/tools/retirement': { title: '은퇴 자금 계산기', desc: '은퇴 후 필요한 자금을 계산합니다.' },
    '/tools/child-cost': { title: '육아 비용 계산기', desc: '자녀 양육에 드는 비용을 단계별로 계산합니다.' },
    '/tools/vat': { title: '부가세(VAT) 계산기', desc: '공급가액과 부가세를 간편하게 계산합니다.' },
    '/tools/chess': { title: '체스 게임', desc: 'AI와 대결하는 온라인 체스 게임입니다.' },
    '/tools/peg-solitaire': { title: '페그 솔리테어', desc: '혼자 즐기는 클래식 보드게임 페그 솔리테어입니다.' },
    '/tools/janggi': { title: '장기 게임', desc: 'AI와 대국하는 온라인 장기 게임입니다.' },
    '/tools/gomoku': { title: '오목 게임', desc: 'AI와 대결하는 오목 게임입니다.' },
    '/tools/sudoku': { title: '스도쿠 게임', desc: '다양한 난이도의 스도쿠 퍼즐을 풀어보세요.' },
    '/tools/baduk': { title: '바둑 게임', desc: 'AI와 대국하는 온라인 바둑 게임입니다.' },
  }

  if (toolsSEO[route]) {
    const t = toolsSEO[route]
    return { title: t.title, description: t.desc, url: route }
  }

  return { title: SITE_NAME, description: '', url: route }
}

// ── HTML meta 태그 교체 ──
function injectSEO(html: string, seo: SEOData): string {
  const fullTitle = seo.title === SITE_NAME ? SITE_NAME : `${seo.title} | ${SITE_NAME}`
  const fullUrl = `${BASE_URL}${seo.url}`
  const ogImage = seo.image || DEFAULT_IMAGE
  const desc = seo.description.length > 160 ? seo.description.slice(0, 157) + '...' : seo.description
  const ogType = seo.type || 'website'

  // title 교체
  html = html.replace(/<title>[^<]*<\/title>/g, '')
  html = html.replace('</head>', `<title>${fullTitle}</title>\n</head>`)

  // description 교체
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/g, '')
  html = html.replace('</head>', `<meta name="description" content="${esc(desc)}" />\n</head>`)

  // keywords 제거 (SEOHead가 동적으로 넣어줌 → 여기서는 생략)
  // og 태그 교체
  html = html.replace(/<meta property="og:type" content="[^"]*"\s*\/?>/g, '')
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/g, '')
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/g, '')
  html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/g, '')
  html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/g, '')

  const ogTags = [
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:title" content="${esc(fullTitle)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${fullUrl}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
  ].join('\n')
  html = html.replace('</head>', `${ogTags}\n</head>`)

  // twitter 태그 교체
  html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/g, '')
  html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/g, '')
  html = html.replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/g, '')

  const twTags = [
    `<meta name="twitter:title" content="${esc(fullTitle)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`,
  ].join('\n')
  html = html.replace('</head>', `${twTags}\n</head>`)

  // canonical 교체
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/g, '')
  html = html.replace('</head>', `<link rel="canonical" href="${fullUrl}" />\n</head>`)

  // article:published_time 추가
  if (seo.type === 'article' && seo.publishedAt) {
    html = html.replace('</head>', `<meta property="article:published_time" content="${seo.publishedAt}" />\n</head>`)
  }

  // JSON-LD 추가
  const jsonLd = seo.type === 'article'
    ? JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: seo.title, description: desc, image: ogImage, url: fullUrl, datePublished: seo.publishedAt, publisher: { '@type': 'Organization', name: SITE_NAME, url: BASE_URL } })
    : JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: fullUrl, description: desc })
  html = html.replace('</head>', `<script type="application/ld+json">${jsonLd}</script>\n</head>`)

  return html
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── 라우트 목록 ──
function getRoutes(): string[] {
  return [
    '/',
    '/blog',
    '/tools',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    ...categories.map((c: any) => `/blog/category/${c.slug}`),
    '/tools/compound-interest', '/tools/loan-interest', '/tools/salary', '/tools/savings',
    '/tools/severance', '/tools/pension', '/tools/real-estate', '/tools/bmi',
    '/tools/age', '/tools/exchange-rate', '/tools/jeonse-wolse', '/tools/stock-return',
    '/tools/loan-refinance', '/tools/electricity', '/tools/hourly-wage', '/tools/income-tax',
    '/tools/car-cost', '/tools/retirement', '/tools/child-cost', '/tools/vat',
    '/tools/chess', '/tools/peg-solitaire', '/tools/janggi', '/tools/gomoku',
    '/tools/sudoku', '/tools/baduk',
    ...posts.map((p: any) => `/blog/${p.slug}`),
  ]
}

// ── 서버 ──
function startServer(): Promise<ReturnType<typeof createServer>> {
  return new Promise((res) => {
    const server = createServer((req, resp) => {
      const url = req.url || '/'
      const filePath = url.includes('.')
        ? resolve(DIST_DIR, url.slice(1))
        : resolve(DIST_DIR, 'index.html')
      if (!existsSync(filePath)) { resp.writeHead(404); resp.end(); return }
      const ext = filePath.split('.').pop() || ''
      const types: Record<string, string> = { html:'text/html', js:'application/javascript', css:'text/css', json:'application/json', png:'image/png', jpg:'image/jpeg', svg:'image/svg+xml', xml:'application/xml', mp3:'audio/mpeg' }
      resp.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' })
      resp.end(readFileSync(filePath))
    })
    server.listen(PORT, () => res(server))
  })
}

// ── 프리렌더 ──
async function prerenderRoute(browser: puppeteer.Browser, route: string): Promise<void> {
  const page = await browser.newPage()

  await page.setRequestInterception(true)
  page.on('request', (req) => {
    const u = req.url()
    if (u.includes('googlesyndication') || u.includes('google-analytics') || u.includes('googletagmanager') || u.includes('giscus.app') || u.includes('fonts.googleapis') || u.includes('fonts.gstatic')) {
      req.abort()
    } else {
      req.continue()
    }
  })

  try {
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForFunction(() => {
      const root = document.getElementById('root')
      return root && root.children.length > 0 && root.innerHTML.length > 100
    }, { timeout: 10000 }).catch(() => {})
    await new Promise((r) => setTimeout(r, 1500))

    let html = await page.content()

    // SEO 데이터 기반으로 meta 태그 교체
    const seo = getSEOData(route)
    html = injectSEO(html, seo)

    const outputPath = route === '/'
      ? resolve(DIST_DIR, 'index.html')
      : resolve(DIST_DIR, route.slice(1), 'index.html')

    const dir = dirname(outputPath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(outputPath, html, 'utf-8')
  } catch (err) {
    console.error(`  FAIL: ${route} - ${(err as Error).message}`)
  } finally {
    await page.close()
  }
}

async function main() {
  const routes = getRoutes()
  console.log(`프리렌더 시작: ${routes.length}개 라우트`)

  const server = await startServer()
  console.log(`  서버 시작: http://localhost:${PORT}`)

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    for (let i = 0; i < routes.length; i += CONCURRENCY) {
      const batch = routes.slice(i, i + CONCURRENCY)
      await Promise.all(batch.map((route) => prerenderRoute(browser, route)))
      process.stdout.write(`\r  프리렌더 진행: ${Math.min(i + CONCURRENCY, routes.length)}/${routes.length}`)
    }
    console.log()
    console.log(`프리렌더 완료: ${routes.length}개 HTML 생성`)
  } finally {
    await browser.close()
    server.close()
  }
}

main().catch((err) => { console.error('프리렌더 에러:', err); process.exit(1) })
