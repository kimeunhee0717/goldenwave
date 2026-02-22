import { readFileSync } from 'fs'
import { resolve } from 'path'

const BASE_URL = 'https://www.bujatime.com'
const HIDDEN_CATEGORY_IDS = new Set(['briefing', 'draft'])

function readJson(relPath) {
  return JSON.parse(readFileSync(resolve(relPath), 'utf-8'))
}

function fail(message) {
  console.error(`ERROR: ${message}`)
  process.exitCode = 1
}

const posts = readJson('src/data/posts.json')
const categories = readJson('src/data/categories.json')
const authors = readJson('src/data/authors.json')
const sitemapXml = readFileSync(resolve('public/sitemap.xml'), 'utf-8')
const rssXml = readFileSync(resolve('public/rss.xml'), 'utf-8')

const categoryIds = new Set(categories.map(c => c.id))
const authorIds = new Set(authors.map(a => a.id))

const slugCount = new Map()
for (const post of posts) {
  slugCount.set(post.slug, (slugCount.get(post.slug) || 0) + 1)

  if (!categoryIds.has(post.categoryId)) {
    fail(`Unknown categoryId "${post.categoryId}" in post "${post.slug}"`)
  }

  if (!authorIds.has(post.authorId)) {
    fail(`Unknown authorId "${post.authorId}" in post "${post.slug}"`)
  }
}

for (const [slug, count] of slugCount.entries()) {
  if (count > 1) {
    fail(`Duplicate slug "${slug}" (${count} items)`)
  }
}

for (const post of posts) {
  const url = `${BASE_URL}/blog/${post.slug}`
  const isHidden = HIDDEN_CATEGORY_IDS.has(post.categoryId)
  const inSitemap = sitemapXml.includes(`<loc>${url}</loc>`)
  const inRss = rssXml.includes(`<link>${url}</link>`)

  if (isHidden && (inSitemap || inRss)) {
    fail(`Hidden post exposed in feed/sitemap: ${post.slug}`)
  }

  if (!isHidden && (!inSitemap || !inRss)) {
    fail(`Visible post missing in feed/sitemap: ${post.slug}`)
  }
}

if (sitemapXml.includes('/blog/category/draft') || sitemapXml.includes('/blog/category/briefing')) {
  fail('Hidden categories are still exposed in sitemap.xml')
}

if (process.exitCode !== 1) {
  console.log('OK: content integrity checks passed')
  console.log(`- posts: ${posts.length}`)
  console.log(`- categories: ${categories.length}`)
  console.log(`- authors: ${authors.length}`)
}
