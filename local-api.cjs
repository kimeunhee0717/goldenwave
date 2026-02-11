/**
 * 부자타임 로컬 포스트 수정 API 서버
 * 실행: node local-api.js
 * 포트: 18790
 */
const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 18790
const POSTS_DIR = path.join(__dirname, 'src', 'data', 'posts')

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // GET /api/post/:category/:slug — 파일 읽기
  // PUT /api/post/:category/:slug — 파일 저장
  const match = req.url.match(/^\/api\/post\/([^/]+)\/([^/]+)$/)
  if (!match) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
    return
  }

  const category = match[1]
  const slug = match[2]
  const filePath = path.join(POSTS_DIR, category, `${slug}.md`)

  if (req.method === 'GET') {
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'File not found', path: filePath }))
      return
    }
    const content = fs.readFileSync(filePath, 'utf-8')
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, content, path: filePath }))
    return
  }

  if (req.method === 'PUT') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const { content } = JSON.parse(body)
        if (!content) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'content required' }))
          return
        }
        // 폴더 없으면 생성
        const dir = path.dirname(filePath)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

        fs.writeFileSync(filePath, content, 'utf-8')
        console.log(`✅ Saved: ${filePath}`)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true, path: filePath }))
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: err.message }))
      }
    })
    return
  }

  res.writeHead(405, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Method not allowed' }))
})

server.listen(PORT, () => {
  console.log(`🚀 부자타임 로컬 API 서버 실행 중: http://localhost:${PORT}`)
  console.log(`📂 포스트 폴더: ${POSTS_DIR}`)
})
