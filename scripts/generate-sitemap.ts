import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const BASE_URL = 'https://www.bujatime.com'
const TODAY = new Date().toISOString().split('T')[0]

// 데이터 로드
const posts = JSON.parse(readFileSync(resolve('src/data/posts.json'), 'utf-8'))
const categories = JSON.parse(readFileSync(resolve('src/data/categories.json'), 'utf-8'))

interface UrlEntry {
  loc: string
  lastmod: string
  changefreq: string
  priority: string
}

const urls: UrlEntry[] = []

// 1. 정적 페이지
const staticPages = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/blog', changefreq: 'daily', priority: '0.9' },
  { path: '/tools', changefreq: 'weekly', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
]

for (const page of staticPages) {
  urls.push({
    loc: `${BASE_URL}${page.path}`,
    lastmod: TODAY,
    changefreq: page.changefreq,
    priority: page.priority,
  })
}

// 2. 카테고리 페이지
for (const cat of categories) {
  if (cat.slug === 'briefing') continue
  urls.push({
    loc: `${BASE_URL}/blog/category/${cat.slug}`,
    lastmod: TODAY,
    changefreq: 'daily',
    priority: '0.8',
  })
}

// 3. 도구 페이지
const tools = [
  { slug: 'compound-interest', priority: '0.8' },
  { slug: 'loan-interest', priority: '0.8' },
  { slug: 'salary', priority: '0.8' },
  { slug: 'savings', priority: '0.8' },
  { slug: 'severance', priority: '0.8' },
  { slug: 'pension', priority: '0.8' },
  { slug: 'real-estate', priority: '0.8' },
  { slug: 'bmi', priority: '0.7' },
  { slug: 'age', priority: '0.7' },
  { slug: 'exchange-rate', priority: '0.8' },
  { slug: 'jeonse-wolse', priority: '0.8' },
  { slug: 'stock-return', priority: '0.8' },
  { slug: 'loan-refinance', priority: '0.8' },
  { slug: 'electricity', priority: '0.7' },
  { slug: 'hourly-wage', priority: '0.8' },
  { slug: 'income-tax', priority: '0.8' },
  { slug: 'car-cost', priority: '0.7' },
  { slug: 'retirement', priority: '0.8' },
  { slug: 'child-cost', priority: '0.7' },
  { slug: 'vat', priority: '0.7' },
  { slug: 'chess', priority: '0.5' },
  { slug: 'peg-solitaire', priority: '0.5' },
  { slug: 'janggi', priority: '0.5' },
  { slug: 'gomoku', priority: '0.5' },
  { slug: 'sudoku', priority: '0.5' },
  { slug: 'baduk', priority: '0.5' },
]

for (const tool of tools) {
  urls.push({
    loc: `${BASE_URL}/tools/${tool.slug}`,
    lastmod: TODAY,
    changefreq: 'monthly',
    priority: tool.priority,
  })
}

// 4. 블로그 포스트
for (const post of posts) {
  if (post.categoryId === 'briefing') continue
  urls.push({
    loc: `${BASE_URL}/blog/${post.slug}`,
    lastmod: post.publishedAt,
    changefreq: 'monthly',
    priority: '0.7',
  })
}

// XML 생성
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

writeFileSync(resolve('public/sitemap.xml'), xml, 'utf-8')
console.log(`sitemap.xml 생성 완료: ${urls.length}개 URL`)
