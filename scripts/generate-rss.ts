import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const BASE_URL = 'https://www.bujatime.com'
const SITE_TITLE = 'BujaTime - Daily Insights for Financial Freedom'
const SITE_DESC = 'AI, finance, side hustle, and business insights from BujaTime.'

// 데이터 로드
const posts = JSON.parse(readFileSync(resolve('src/data/posts.json'), 'utf-8')) as Array<{
  categoryId: string
  slug: string
  title: string
  excerpt: string
  publishedAt: string
}>
const HIDDEN_CATEGORY_IDS = new Set(['briefing', 'draft'])

// 최신순 정렬
const filteredPosts = posts
  .filter(post => !HIDDEN_CATEGORY_IDS.has(post.categoryId))
  .filter((post, index, arr) => arr.findIndex(item => item.slug === post.slug) === index)
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

function toRfc822(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00+09:00')
  return d.toUTCString()
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const lastBuildDate = filteredPosts.length > 0
  ? toRfc822(filteredPosts[0].publishedAt)
  : new Date().toUTCString()

const items = filteredPosts
  .map(
    (post) => {
      const description = post.excerpt?.trim() ? post.excerpt : post.title
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${BASE_URL}/blog/${post.slug}</link>
      <description>${escapeXml(description)}</description>
      <pubDate>${toRfc822(post.publishedAt)}</pubDate>
      <guid>${BASE_URL}/blog/${post.slug}</guid>
    </item>`
    }
  )
  .join('\n\n')

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(SITE_DESC)}</description>
    <language>ko</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>

${items}
  </channel>
</rss>
`

writeFileSync(resolve('public/rss.xml'), rss, 'utf-8')
console.log(`rss.xml 생성 완료: ${filteredPosts.length}개 포스트`)
