/**
 * 부자타임 로컬 API 서버
 * 블로그 포스트 생성/수정/삭제를 위한 로컬 전용 서버
 *
 * 사용법: node local-api.js
 * 포트: 18790
 */

const http = require('http')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const PORT = 18790
const DATA_DIR = path.join(__dirname, 'src/data')
const POSTS_JSON = path.join(DATA_DIR, 'posts.json')
const POSTS_DIR = path.join(DATA_DIR, 'posts')

// JSON 응답 헬퍼
function jsonResponse(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(data, null, 2))
}

// 요청 본문 파싱
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (e) {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

// posts.json 읽기
function readPosts() {
  const data = fs.readFileSync(POSTS_JSON, 'utf-8')
  return JSON.parse(data)
}

// posts.json 저장
function savePosts(posts) {
  fs.writeFileSync(POSTS_JSON, JSON.stringify(posts, null, 2), 'utf-8')
}

// 새 ID 생성
function generateId(posts) {
  const maxId = posts.reduce((max, p) => Math.max(max, parseInt(p.id) || 0), 0)
  return String(maxId + 1)
}

// 슬러그 유효성 검사
function isValidSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

// 슬러그 중복 검사
function isSlugExists(posts, slug) {
  return posts.some(p => p.slug === slug)
}

// 마크다운 파일 경로
function getMarkdownPath(categoryId, slug) {
  return path.join(POSTS_DIR, categoryId, `${slug}.md`)
}

// 라우터
async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const method = req.method
  const pathname = url.pathname

  // CORS preflight
  if (method === 'OPTIONS') {
    jsonResponse(res, 200, { ok: true })
    return
  }

  try {
    // GET /api/posts - 전체 포스트 목록
    if (method === 'GET' && pathname === '/api/posts') {
      const posts = readPosts()
      jsonResponse(res, 200, { posts })
      return
    }

    // GET /api/post/:category/:slug - 포스트 내용 조회
    const getMatch = pathname.match(/^\/api\/post\/([^/]+)\/([^/]+)$/)
    if (method === 'GET' && getMatch) {
      const [, categoryId, slug] = getMatch
      const mdPath = getMarkdownPath(categoryId, slug)

      if (!fs.existsSync(mdPath)) {
        jsonResponse(res, 404, { error: '포스트를 찾을 수 없습니다' })
        return
      }

      const content = fs.readFileSync(mdPath, 'utf-8')
      const posts = readPosts()
      const meta = posts.find(p => p.slug === slug)

      jsonResponse(res, 200, { meta, content })
      return
    }

    // POST /api/post - 새 포스트 생성
    if (method === 'POST' && pathname === '/api/post') {
      const body = await parseBody(req)
      const { slug, title, excerpt, categoryId, tags, coverImage, content, authorId, featured } = body

      // 필수 필드 검증
      if (!slug || !title || !categoryId || !content) {
        jsonResponse(res, 400, { error: '필수 필드가 누락되었습니다 (slug, title, categoryId, content)' })
        return
      }

      // 슬러그 유효성 검사
      if (!isValidSlug(slug)) {
        jsonResponse(res, 400, { error: '슬러그는 영문 소문자, 숫자, 하이픈만 사용 가능합니다' })
        return
      }

      // 카테고리 폴더 확인
      const categoryDir = path.join(POSTS_DIR, categoryId)
      if (!fs.existsSync(categoryDir)) {
        jsonResponse(res, 400, { error: `카테고리 폴더가 없습니다: ${categoryId}` })
        return
      }

      // 슬러그 중복 검사
      const posts = readPosts()
      if (isSlugExists(posts, slug)) {
        jsonResponse(res, 400, { error: '이미 존재하는 슬러그입니다' })
        return
      }

      // 새 포스트 메타데이터
      const newPost = {
        id: generateId(posts),
        slug,
        title,
        excerpt: excerpt || title,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop',
        categoryId,
        tags: tags || [],
        authorId: authorId || 'ceo',
        publishedAt: new Date().toISOString().split('T')[0],
        featured: featured || false,
      }

      // posts.json에 추가
      posts.unshift(newPost) // 최신 글이 앞에 오도록
      savePosts(posts)

      // 마크다운 파일 생성
      const mdPath = getMarkdownPath(categoryId, slug)
      fs.writeFileSync(mdPath, content, 'utf-8')

      console.log(`[CREATE] ${categoryId}/${slug} (ID: ${newPost.id})`)
      jsonResponse(res, 201, {
        success: true,
        post: newPost,
        url: `/blog/${slug}`,
      })
      return
    }

    // PUT /api/post/:category/:slug - 포스트 수정
    const putMatch = pathname.match(/^\/api\/post\/([^/]+)\/([^/]+)$/)
    if (method === 'PUT' && putMatch) {
      const [, categoryId, slug] = putMatch
      const body = await parseBody(req)
      const { content, title, excerpt, tags, coverImage, featured } = body

      const mdPath = getMarkdownPath(categoryId, slug)

      if (!fs.existsSync(mdPath)) {
        jsonResponse(res, 404, { error: '포스트를 찾을 수 없습니다' })
        return
      }

      // 마크다운 내용 수정
      if (content !== undefined) {
        fs.writeFileSync(mdPath, content, 'utf-8')
      }

      // 메타데이터 수정
      const posts = readPosts()
      const postIndex = posts.findIndex(p => p.slug === slug)

      if (postIndex !== -1) {
        if (title !== undefined) posts[postIndex].title = title
        if (excerpt !== undefined) posts[postIndex].excerpt = excerpt
        if (tags !== undefined) posts[postIndex].tags = tags
        if (coverImage !== undefined) posts[postIndex].coverImage = coverImage
        if (featured !== undefined) posts[postIndex].featured = featured
        savePosts(posts)
      }

      console.log(`[UPDATE] ${categoryId}/${slug}`)
      jsonResponse(res, 200, { success: true })
      return
    }

    // DELETE /api/post/:category/:slug - 포스트 삭제
    const deleteMatch = pathname.match(/^\/api\/post\/([^/]+)\/([^/]+)$/)
    if (method === 'DELETE' && deleteMatch) {
      const [, categoryId, slug] = deleteMatch
      const mdPath = getMarkdownPath(categoryId, slug)

      // 마크다운 파일 삭제
      if (fs.existsSync(mdPath)) {
        fs.unlinkSync(mdPath)
      }

      // posts.json에서 제거
      const posts = readPosts()
      const filtered = posts.filter(p => p.slug !== slug)
      savePosts(filtered)

      console.log(`[DELETE] ${categoryId}/${slug}`)
      jsonResponse(res, 200, { success: true })
      return
    }

    // POST /api/build - 빌드만 (발행)
    if (method === 'POST' && pathname === '/api/build') {
      console.log('[BUILD] 빌드 시작...')

      exec('npm run build', { cwd: __dirname, maxBuffer: 50 * 1024 * 1024 }, (err, stdout, stderr) => {
        if (err) {
          console.error(`[BUILD] 실패: ${err.message}`)
          jsonResponse(res, 500, { error: `빌드 실패: ${err.message}` })
          return
        }
        console.log('[BUILD] 빌드 완료!')
        jsonResponse(res, 200, { success: true, message: '빌드 완료' })
      })
      return
    }

    // POST /api/deploy - 커밋 + 푸시 (배포)
    if (method === 'POST' && pathname === '/api/deploy') {
      const body = await parseBody(req)
      const commitMessage = body.message || 'Add new blog post'

      console.log('[DEPLOY] 배포 시작...')

      // 순차적으로 실행: git add → git commit → git push
      const commands = [
        'git add .',
        `git commit -m "${commitMessage}\n\nCo-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"`,
        'git push'
      ]

      let step = 0
      const runNext = () => {
        if (step >= commands.length) {
          console.log('[DEPLOY] 배포 완료!')
          jsonResponse(res, 200, { success: true, message: '배포 완료' })
          return
        }

        const cmd = commands[step]
        console.log(`[DEPLOY] ${step + 1}/${commands.length}: ${cmd.split('\n')[0]}`)

        exec(cmd, { cwd: __dirname, maxBuffer: 50 * 1024 * 1024 }, (err, stdout, stderr) => {
          if (err) {
            // git commit이 "nothing to commit"이면 무시하고 계속
            if (cmd.startsWith('git commit') && stderr.includes('nothing to commit')) {
              console.log('[DEPLOY] 변경사항 없음, 계속 진행')
              step++
              runNext()
              return
            }
            console.error(`[DEPLOY] 실패: ${err.message}`)
            jsonResponse(res, 500, { error: `${cmd} 실패: ${err.message}` })
            return
          }
          step++
          runNext()
        })
      }

      runNext()
      return
    }

    // 404 Not Found
    jsonResponse(res, 404, { error: 'Not Found' })

  } catch (err) {
    console.error('[ERROR]', err.message)
    jsonResponse(res, 500, { error: err.message })
  }
}

// 서버 시작
const server = http.createServer(handleRequest)

server.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  부자타임 로컬 API 서버')
  console.log(`  http://localhost:${PORT}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('API 엔드포인트:')
  console.log('  GET    /api/posts              전체 포스트 목록')
  console.log('  GET    /api/post/:cat/:slug    포스트 조회')
  console.log('  POST   /api/post               새 포스트 생성 (저장)')
  console.log('  PUT    /api/post/:cat/:slug    포스트 수정')
  console.log('  DELETE /api/post/:cat/:slug    포스트 삭제')
  console.log('  POST   /api/build              빌드 (발행)')
  console.log('  POST   /api/deploy             커밋 + 푸시 (배포)')
  console.log('')
  console.log('종료: Ctrl+C')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
})
