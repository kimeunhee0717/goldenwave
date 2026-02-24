/**
 * Puppeteer 프리렌더: 실제 브라우저에서 렌더링된 HTML을 저장.
 * 애드센스 승인에 필수인 페이지들의 실제 콘텐츠를 크롤러가 읽을 수 있도록 함.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import puppeteer from 'puppeteer'
import { spawn, ChildProcess } from 'child_process'

const DIST_DIR = resolve('dist')
const BASE_URL = 'https://www.bujatime.com'
const SITE_NAME = '부자타임'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`
const SERVER_PORT = 4173 // Vite preview 기본 포트

// 애드센스 승인에 필수인 페이지들 (완전 렌더링)
const CRITICAL_PAGES = ['/about', '/privacy', '/terms', '/contact']

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
const HIDDEN_CATEGORY_IDS = new Set(['briefing', 'draft'])
const HIDDEN_CATEGORY_SLUGS = new Set(['briefing', 'draft'])

function getSEOData(route: string): SEOData {
  const staticSEO: Record<string, SEOData> = {
    '/': { title: SITE_NAME, description: 'AI, 재테크, 부업, 비즈니스 — 경제적 자유를 향한 매일의 인사이트를 전합니다. 복리 계산기, 연봉 계산기 등 무료 재무 도구도 이용하세요.', url: '/' },
    '/blog': { title: '블로그', description: 'AI, 재테크, 부업, 비즈니스 — 경제적 자유를 향한 매일의 인사이트를 전합니다.', url: '/blog' },
    '/tools': { title: '무료 계산기 도구 모음', description: '복리 계산기, 대출 이자 계산기, 연봉 실수령액 계산기, 환율 계산기 등 20가지 이상의 무료 재무·생활 계산기를 이용하세요.', url: '/tools' },
    '/about': { title: '소개', description: '부자타임은 AI 시대의 경제적 자유를 위한 인사이트를 매일 전하는 콘텐츠 플랫폼입니다.', url: '/about' },
    '/contact': { title: '문의하기', description: '부자타임에 문의사항이 있으시면 연락해 주세요.', url: '/contact' },
    '/privacy': { title: '개인정보처리방침', description: '부자타임의 개인정보처리방침입니다.', url: '/privacy' },
    '/terms': { title: '이용약관', description: '부자타임의 서비스 이용약관입니다.', url: '/terms' },
  }

  if (staticSEO[route]) return staticSEO[route]

  if (route.startsWith('/blog/category/')) {
    const slug = route.replace('/blog/category/', '')
    const cat = categories.find((c: any) => c.slug === slug)
    if (cat) return { title: `${cat.title} - 블로그`, description: cat.description || `${cat.title} 카테고리의 최신 글을 확인하세요.`, url: route }
  }

  if (route.startsWith('/blog/')) {
    const slug = route.replace('/blog/', '')
    const post = posts.find((p: any) => p.slug === slug)
    if (post) return { title: post.title, description: post.excerpt, url: route, image: post.coverImage, type: 'article', publishedAt: post.publishedAt }
  }

  const toolsSEO: Record<string, { title: string; desc: string }> = {
    '/tools/compound-interest': { title: '복리 계산기', desc: '복리 효과를 한눈에 확인하세요. 초기 투자금, 매월 적립액, 수익률을 입력하면 자산 성장 그래프와 연도별 상세 내역을 보여드립니다.' },
    '/tools/loan-interest': { title: '대출 이자 계산기', desc: '대출 원리금 상환 계획을 한눈에. 원리금균등, 원금균등, 만기일시상환 방식별 월 상환액과 총 이자를 비교해보세요.' },
    '/tools/salary': { title: '연봉 실수령액 계산기', desc: '연봉에서 4대보험과 소득세를 공제한 실수령액을 정확하게 계산합니다.' },
    '/tools/savings': { title: '적금·예금 이자 계산기', desc: '적금과 예금의 만기 수령액을 비교 계산합니다.' },
    '/tools/severance': { title: '퇴직금 계산기', desc: '근속 기간과 급여 정보를 입력하면 예상 퇴직금을 계산합니다.' },
    '/tools/pension': { title: '연금 수령액 계산기', desc: '국민연금 예상 수령액을 계산합니다.' },
    '/tools/real-estate': { title: '부동산 수익률 계산기', desc: '부동산 투자 수익률을 정확하게 분석합니다.' },
    '/tools/bmi': { title: 'BMI 계산기', desc: '키와 몸무게를 입력하면 BMI 지수와 비만도를 확인할 수 있습니다.' },
    '/tools/age': { title: '나이·만나이 계산기', desc: '생년월일을 입력하면 만나이, 한국식 나이, 연나이를 한번에 확인할 수 있습니다.' },
    '/tools/exchange-rate': { title: '환율 계산기', desc: '실시간 환율 기반으로 통화를 변환합니다.' },
    '/tools/jeonse-wolse': { title: '전세↔월세 전환 계산기', desc: '전세보증금과 월세를 상호 전환하여 비교합니다.' },
    '/tools/stock-return': { title: '주식 수익률 계산기', desc: '주식 투자 수익률을 계산합니다.' },
    '/tools/loan-refinance': { title: '대출 갈아타기 비교기', desc: '기존 대출과 신규 대출 조건을 비교하여 갈아타기 시 절감 금액을 계산합니다.' },
    '/tools/electricity': { title: '전기요금 계산기', desc: '가정용 전기요금을 누진제 기준으로 계산합니다.' },
    '/tools/hourly-wage': { title: '시급·일급 변환 계산기', desc: '시급, 일급, 주급, 월급을 상호 변환합니다.' },
    '/tools/income-tax': { title: '종합소득세 계산기', desc: '종합소득세를 간편하게 계산합니다.' },
    '/tools/car-cost': { title: '자동차 유지비 계산기', desc: '자동차 연간 유지비를 계산합니다.' },
    '/tools/retirement': { title: '은퇴 자금 계산기', desc: '은퇴 후 필요한 자금을 계산합니다.' },
    '/tools/child-cost': { title: '육아 비용 계산기', desc: '자녀 양육에 드는 비용을 단계별로 계산합니다.' },
    '/tools/vat': { title: '부가세(VAT) 계산기', desc: '공급가액과 부가세를 간편하게 계산합니다.' },
    '/tools/chess': { title: '체스 게임', desc: 'AI와 대결하는 온라인 체스 게임입니다.' },
    '/tools/peg-solitaire': { title: '페그 솔리테어', desc: '혼자 즐기는 클래식 보드게임입니다.' },
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
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function injectSEO(html: string, seo: SEOData): string {
  const fullTitle = seo.title === SITE_NAME ? SITE_NAME : `${seo.title} | ${SITE_NAME}`
  const fullUrl = `${BASE_URL}${seo.url}`
  const ogImage = seo.image || DEFAULT_IMAGE
  const desc = seo.description.length > 160 ? seo.description.slice(0, 157) + '...' : seo.description
  const ogType = seo.type || 'website'

  // title 교체
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(fullTitle)}</title>`)

  // description 교체
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${esc(desc)}" />`
  )

  // og 태그 교체
  html = html.replace(/<meta property="og:type" content="[^"]*"\s*\/?>/, `<meta property="og:type" content="${ogType}" />`)
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(fullTitle)}" />`)
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(desc)}" />`)
  html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${fullUrl}" />`)
  html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${ogImage}" />`)

  // twitter 태그 교체
  html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(fullTitle)}" />`)
  html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(desc)}" />`)

  // canonical 교체
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${fullUrl}" />`)

  // article:published_time 추가
  if (seo.type === 'article' && seo.publishedAt) {
    html = html.replace('</head>', `    <meta property="article:published_time" content="${seo.publishedAt}" />\n  </head>`)
  }

  // JSON-LD 추가
  const jsonLd = seo.type === 'article'
    ? JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: seo.title, description: desc, image: ogImage, url: fullUrl, datePublished: seo.publishedAt, publisher: { '@type': 'Organization', name: SITE_NAME, url: BASE_URL } })
    : JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: fullUrl, description: desc })
  html = html.replace('</head>', `    <script type="application/ld+json">${jsonLd}</script>\n  </head>`)

  return html
}

// ── 라우트 목록 ──
function getRoutes(): string[] {
  const visibleCategories = categories.filter((c: any) => !HIDDEN_CATEGORY_SLUGS.has(c.slug))
  const visiblePosts = posts
    .filter((p: any) => !HIDDEN_CATEGORY_IDS.has(p.categoryId))
    .filter((p: any, index: number, arr: any[]) => arr.findIndex(item => item.slug === p.slug) === index)

  return [
    '/',
    '/blog',
    '/tools',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    ...visibleCategories.map((c: any) => `/blog/category/${c.slug}`),
    '/tools/compound-interest', '/tools/loan-interest', '/tools/salary', '/tools/savings',
    '/tools/severance', '/tools/pension', '/tools/real-estate', '/tools/bmi',
    '/tools/age', '/tools/exchange-rate', '/tools/jeonse-wolse', '/tools/stock-return',
    '/tools/loan-refinance', '/tools/electricity', '/tools/hourly-wage', '/tools/income-tax',
    '/tools/car-cost', '/tools/retirement', '/tools/child-cost', '/tools/vat',
    '/tools/chess', '/tools/peg-solitaire', '/tools/janggi', '/tools/gomoku',
    '/tools/sudoku', '/tools/baduk',
    ...visiblePosts.map((p: any) => `/blog/${p.slug}`),
  ]
}

// ── 서버 시작 및 준비 확인 ──
async function startServer(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const server = spawn('npx', ['vite', 'preview', '--port', SERVER_PORT.toString()], {
      stdio: 'pipe',
      shell: true
    })

    let started = false

    server.stdout?.on('data', (data) => {
      const output = data.toString()
      console.log('  [서버]', output.trim())
      if (output.includes('Local:') || output.includes('localhost')) {
        started = true
        resolve(server)
      }
    })

    server.stderr?.on('data', (data) => {
      console.error('  [서버 에러]', data.toString())
    })

    server.on('error', (err) => {
      reject(err)
    })

    // 타임아웃: 10초 안에 시작 안 되면 실패
    setTimeout(() => {
      if (!started) {
        server.kill()
        reject(new Error('서버 시작 타임아웃'))
      }
    }, 10000)
  })
}

// ── 서버 준비 확인 (HTTP 요청) ──
async function waitForServer(port: number, maxRetries = 10): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`http://localhost:${port}/`)
      if (res.ok) {
        console.log('  ✓ 서버 준비 완료')
        return
      }
    } catch (e) {
      // 아직 준비 안 됨
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  throw new Error('서버 응답 대기 실패')
}

// ── Puppeteer 완전 렌더링 ──
async function renderWithPuppeteer(route: string, baseUrl: string): Promise<string> {
  let browser = null
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })

    const url = `${baseUrl}${route}`
    console.log(`    → ${url}`)

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    })

    // React 렌더링 완료 대기
    await page.waitForSelector('#root', { timeout: 5000 })
    await new Promise(resolve => setTimeout(resolve, 1500))

    const html = await page.content()

    await browser.close()
    return html

  } catch (error) {
    if (browser) {
      await browser.close().catch(() => {})
    }
    throw error
  }
}

// ── 메인 ──
async function main() {
  const routes = getRoutes()
  const baseHtml = readFileSync(resolve(DIST_DIR, 'index.html'), 'utf-8')

  console.log(`프리렌더 시작: ${routes.length}개 라우트`)
  console.log(`애드센스 필수 페이지 완전 렌더링: ${CRITICAL_PAGES.join(', ')}`)

  let server: ChildProcess | null = null
  let actualPort = SERVER_PORT

  try {
    // Vite preview 서버 시작
    console.log('\n1. 프리뷰 서버 시작 중...')
    server = await startServer()

    // 실제 사용된 포트 감지 (4173이 이미 사용 중이면 다른 포트 사용)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 포트 4173, 4174, 4175 순서로 시도
    for (const port of [4173, 4174, 4175, 4176]) {
      try {
        const res = await fetch(`http://localhost:${port}/`)
        if (res.ok) {
          actualPort = port
          console.log(`  ✓ 서버 포트: ${actualPort}`)
          break
        }
      } catch (e) {
        // 다음 포트 시도
      }
    }

    console.log('\n2. 페이지 렌더링 중...')
    let count = 0

    for (const route of routes) {
      const seo = getSEOData(route)
      let html: string

      // 애드센스 필수 페이지는 Puppeteer로 완전 렌더링
      if (CRITICAL_PAGES.includes(route)) {
        console.log(`  🔍 완전 렌더링: ${route}`)
        try {
          html = await renderWithPuppeteer(route, `http://localhost:${actualPort}`)
          html = injectSEO(html, seo)
        } catch (error) {
          console.error(`    ⚠️ 렌더링 실패, 메타태그만 적용: ${error}`)
          html = injectSEO(baseHtml, seo)
        }
      } else {
        // 나머지는 메타태그만 교체
        html = injectSEO(baseHtml, seo)
      }

      const outputPath = route === '/'
        ? resolve(DIST_DIR, 'index.html')
        : resolve(DIST_DIR, route.slice(1), 'index.html')

      const dir = dirname(outputPath)
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      writeFileSync(outputPath, html, 'utf-8')
      count++
    }

    console.log(`\n✅ 프리렌더 완료: ${count}개 파일`)

  } catch (error) {
    console.error('\n❌ 프리렌더 실패:', error)
    throw error
  } finally {
    // 서버 종료
    if (server) {
      console.log('\n3. 서버 종료 중...')
      server.kill()
    }
  }
}

main().catch(err => {
  console.error('치명적 에러:', err)
  process.exit(1)
})
