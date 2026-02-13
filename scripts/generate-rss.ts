import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const BASE_URL = 'https://www.bujatime.com'
const SITE_TITLE = '부자타임 - AI 시대의 경제적 자유를 위한 인사이트'
const SITE_DESC = 'AI, 재테크, 부업, 비즈니스 — 경제적 자유를 향한 매일의 인사이트를 전합니다.'

// 데이터 로드
const posts = JSON.parse(readFileSync(resolve('src/data/posts.json'), 'utf-8')) as Array<{
  slug: string
  title: string
  excerpt: string
  publishedAt: string
}>

// 최신순 정렬
posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

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

const lastBuildDate = toRfc822(posts[0].publishedAt)

const items = posts
  .map(
    (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${BASE_URL}/blog/${post.slug}</link>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${toRfc822(post.publishedAt)}</pubDate>
      <guid>${BASE_URL}/blog/${post.slug}</guid>
    </item>`
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
console.log(`rss.xml 생성 완료: ${posts.length}개 포스트`)
