# 옵션 B: 현재 Vite 프로젝트에 블로그 추가

> 기존 프로젝트 구조를 유지하면서 블로그 기능만 추가하는 방식
>
> **권장 대상**: 빠른 MVP 출시, SEO가 덜 중요한 경우, 학습 비용 최소화

---

## 1. 개요

### 1.1 접근 방식
현재 **Vite + React + TypeScript** 프로젝트를 그대로 유지하면서, React Router를 추가하고 블로그 페이지를 구현합니다. CMS 대신 로컬 마크다운 파일 또는 JSON 데이터로 콘텐츠를 관리합니다.

### 1.2 기술 스택 (변경 최소화)
```
Framework:    Vite + React 18 (기존 유지)
Language:     TypeScript (기존 유지)
Styling:      Tailwind CSS (기존 유지)
Routing:      React Router v6 (추가)
Content:      로컬 마크다운 또는 JSON (추가)
Comments:     Giscus (추가)
Search:       Fuse.js (추가)
Deployment:   Vercel / Netlify (정적 호스팅)
```

### 1.3 Vite vs Next.js 비교

| 항목 | Vite (CSR) | Next.js (SSR) |
|-----|-----------|---------------|
| 렌더링 | 클라이언트 사이드 | 서버 사이드 + 정적 |
| SEO | 제한적 (prerender 필요) | 완벽 지원 |
| 초기 로딩 | JS 번들 다운로드 후 렌더링 | HTML 즉시 표시 |
| 빌드 속도 | 매우 빠름 | 상대적으로 느림 |
| 설정 복잡도 | 간단 | 복잡 |
| 배포 | 정적 파일 어디서나 | Vercel 권장 |

---

## 2. 프로젝트 구조

### 2.1 현재 구조 (변경 전)
```
bujatime/
├── components/
│   ├── CallToAction.tsx
│   ├── Features.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── Navbar.tsx
│   ├── Testimonials.tsx
│   └── ThemeGallery.tsx
├── App.tsx
├── index.tsx
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

### 2.2 변경 후 구조
```
bujatime/
├── src/                              # src 폴더로 이동 (권장)
│   ├── components/
│   │   ├── common/                   # 공통 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Badge.tsx
│   │   │
│   │   ├── layout/                   # 레이아웃 컴포넌트
│   │   │   ├── Navbar.tsx            # 기존 유지
│   │   │   ├── Footer.tsx            # 기존 유지
│   │   │   └── Layout.tsx            # 새로 추가 (Navbar + Footer 래퍼)
│   │   │
│   │   ├── home/                     # 홈페이지 전용 컴포넌트
│   │   │   ├── Hero.tsx              # 기존 유지
│   │   │   ├── Features.tsx          # 기존 유지
│   │   │   ├── ThemeGallery.tsx      # 기존 유지
│   │   │   ├── Testimonials.tsx      # 기존 유지
│   │   │   └── CallToAction.tsx      # 기존 유지
│   │   │
│   │   └── blog/                     # 블로그 전용 컴포넌트 (새로 추가)
│   │       ├── BlogCard.tsx          # 블로그 카드
│   │       ├── BlogList.tsx          # 블로그 목록 그리드
│   │       ├── BlogPost.tsx          # 포스트 본문 렌더링
│   │       ├── CategoryFilter.tsx    # 카테고리 필터
│   │       ├── TableOfContents.tsx   # 목차
│   │       ├── ShareButtons.tsx      # SNS 공유 버튼
│   │       ├── AuthorCard.tsx        # 작성자 카드
│   │       ├── RelatedPosts.tsx      # 관련 포스트
│   │       ├── Search.tsx            # 검색 컴포넌트
│   │       └── GiscusComments.tsx    # 댓글 (Giscus)
│   │
│   ├── pages/                        # 페이지 컴포넌트 (새로 추가)
│   │   ├── HomePage.tsx              # 홈페이지 (기존 App.tsx 내용)
│   │   ├── BlogListPage.tsx          # 블로그 목록
│   │   ├── BlogPostPage.tsx          # 개별 포스트
│   │   ├── CategoryPage.tsx          # 카테고리별 목록
│   │   ├── AboutPage.tsx             # 회사 소개 (선택)
│   │   └── NotFoundPage.tsx          # 404 페이지
│   │
│   ├── data/                         # 콘텐츠 데이터 (새로 추가)
│   │   ├── posts/                    # 마크다운 포스트 파일
│   │   │   ├── ai-marketing-guide.md
│   │   │   ├── seo-strategy-2024.md
│   │   │   └── content-marketing-tips.md
│   │   ├── posts.json                # 포스트 메타데이터 (또는 별도 관리)
│   │   ├── categories.json           # 카테고리 목록
│   │   └── authors.json              # 작성자 정보
│   │
│   ├── lib/                          # 유틸리티 (새로 추가)
│   │   ├── utils.ts                  # 공통 유틸리티
│   │   ├── formatDate.ts             # 날짜 포맷팅
│   │   └── readingTime.ts            # 읽기 시간 계산
│   │
│   ├── hooks/                        # 커스텀 훅 (새로 추가)
│   │   ├── usePosts.ts               # 포스트 데이터 훅
│   │   └── useScrollProgress.ts      # 스크롤 진행률
│   │
│   ├── types/                        # 타입 정의 (새로 추가)
│   │   └── blog.ts                   # 블로그 관련 타입
│   │
│   ├── App.tsx                       # 라우터 설정으로 변경
│   ├── main.tsx                      # 엔트리 포인트 (index.tsx → main.tsx)
│   └── index.css                     # 전역 스타일
│
├── public/
│   ├── images/
│   │   └── blog/                     # 블로그 이미지
│   └── favicon.ico
│
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 3. 상세 작업 목록

### Phase 1: 프로젝트 구조 정리 및 라우터 설정 (1시간)

#### 1.1 의존성 설치
```bash
# React Router 설치
npm install react-router-dom

# 마크다운 렌더링
npm install react-markdown remark-gfm rehype-highlight

# 검색 기능
npm install fuse.js

# 댓글 시스템
npm install @giscus/react

# 유틸리티
npm install date-fns
npm install lucide-react  # 이미 있으면 생략

# 개발 의존성
npm install -D @tailwindcss/typography
```

#### 1.2 폴더 구조 변경
```bash
# src 폴더 생성 및 파일 이동
mkdir src
mv components src/
mv App.tsx src/
mv index.tsx src/main.tsx  # 이름 변경

# 새 폴더 생성
mkdir src/pages
mkdir src/data
mkdir src/data/posts
mkdir src/lib
mkdir src/hooks
mkdir src/types
```

#### 1.3 vite.config.ts 업데이트
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 마크다운 파일을 raw 문자열로 가져오기
  assetsInclude: ['**/*.md'],
})
```

#### 1.4 tsconfig.json 경로 별칭 추가
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

#### 1.5 App.tsx 라우터 설정
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import BlogListPage from '@/pages/BlogListPage'
import BlogPostPage from '@/pages/BlogPostPage'
import CategoryPage from '@/pages/CategoryPage'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="blog" element={<BlogListPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />
          <Route path="blog/category/:category" element={<CategoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

---

### Phase 2: 레이아웃 컴포넌트 생성 (30분)

#### 2.1 Layout.tsx
```typescript
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="font-sans antialiased text-slate-800 bg-white min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
```

#### 2.2 Navbar.tsx 수정 (Link 컴포넌트 사용)
```typescript
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ArrowRight } from 'lucide-react'

const menuItems = [
  { label: '서비스', href: '/#services' },
  { label: '포트폴리오', href: '/#portfolio' },
  { label: '블로그', href: '/blog' },  // 추가
  { label: '고객 후기', href: '/#testimonials' },
  { label: '상담 신청', href: '/#contact' },
]

// ... 기존 코드에서 <a> 태그를 <Link> 컴포넌트로 변경
// 내부 링크: <Link to="/blog">블로그</Link>
// 앵커 링크: <a href="#services">서비스</a> (그대로 유지)
```

---

### Phase 3: 블로그 데이터 구조 설정 (1시간)

#### 3.1 타입 정의 (src/types/blog.ts)
```typescript
export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string  // 마크다운 문자열
  coverImage: string
  category: Category
  tags: string[]
  author: Author
  publishedAt: string
  featured: boolean
  readingTime?: number
}

export interface Category {
  id: string
  title: string
  slug: string
  description?: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

export interface Author {
  id: string
  name: string
  image: string
  role: string
  bio?: string
  social?: {
    linkedin?: string
    twitter?: string
    email?: string
  }
}
```

#### 3.2 카테고리 데이터 (src/data/categories.json)
```json
[
  {
    "id": "marketing",
    "title": "마케팅 전략",
    "slug": "marketing",
    "description": "효과적인 마케팅 전략과 트렌드",
    "color": "blue"
  },
  {
    "id": "ai",
    "title": "AI & 자동화",
    "slug": "ai",
    "description": "AI 기술을 활용한 비즈니스 혁신",
    "color": "purple"
  },
  {
    "id": "seo",
    "title": "SEO & 검색",
    "slug": "seo",
    "description": "검색 엔진 최적화 가이드",
    "color": "green"
  },
  {
    "id": "case-study",
    "title": "성공 사례",
    "slug": "case-study",
    "description": "실제 고객사 성공 스토리",
    "color": "orange"
  }
]
```

#### 3.3 작성자 데이터 (src/data/authors.json)
```json
[
  {
    "id": "ceo",
    "name": "김대표",
    "image": "/images/authors/ceo.jpg",
    "role": "대표이사",
    "bio": "10년간 디지털 마케팅 분야에서 활동하며 수백 개 기업의 성장을 도왔습니다.",
    "social": {
      "linkedin": "https://linkedin.com/in/example",
      "email": "ceo@goldenwave.com"
    }
  },
  {
    "id": "marketing-lead",
    "name": "이마케터",
    "image": "/images/authors/marketing-lead.jpg",
    "role": "마케팅 리드",
    "bio": "콘텐츠 마케팅과 브랜딩 전문가입니다."
  }
]
```

#### 3.4 포스트 메타데이터 (src/data/posts.json)
```json
[
  {
    "id": "1",
    "slug": "ai-marketing-guide-2024",
    "title": "2024 AI 마케팅 완벽 가이드: 비즈니스 성장을 위한 전략",
    "excerpt": "AI 기술을 마케팅에 활용하는 방법과 실제 사례를 통해 비즈니스 성장 전략을 알아봅니다.",
    "coverImage": "/images/blog/ai-marketing.jpg",
    "categoryId": "ai",
    "tags": ["AI", "마케팅", "자동화", "ChatGPT"],
    "authorId": "ceo",
    "publishedAt": "2024-02-01",
    "featured": true
  },
  {
    "id": "2",
    "slug": "seo-strategy-small-business",
    "title": "중소기업을 위한 SEO 전략: 예산 없이 검색 1페이지 달성하기",
    "excerpt": "제한된 예산으로도 효과적인 SEO 전략을 수립하고 실행하는 방법을 소개합니다.",
    "coverImage": "/images/blog/seo-strategy.jpg",
    "categoryId": "seo",
    "tags": ["SEO", "검색 최적화", "중소기업", "콘텐츠"],
    "authorId": "marketing-lead",
    "publishedAt": "2024-01-28",
    "featured": true
  }
]
```

#### 3.5 마크다운 포스트 파일 (src/data/posts/ai-marketing-guide-2024.md)
```markdown
# 2024 AI 마케팅 완벽 가이드

AI 기술이 마케팅 분야를 어떻게 혁신하고 있는지 살펴보겠습니다.

## 1. AI 마케팅이란?

AI 마케팅은 인공지능 기술을 활용하여 마케팅 활동을 최적화하는 것을 의미합니다.

### 1.1 주요 활용 분야

- **콘텐츠 생성**: ChatGPT, Claude를 활용한 콘텐츠 작성
- **개인화**: 고객 데이터 기반 맞춤 추천
- **자동화**: 반복 작업 자동화로 효율성 향상

## 2. 실제 활용 사례

...본문 계속...
```

---

### Phase 4: 블로그 컴포넌트 구현 (3-4시간)

#### 4.1 BlogCard.tsx
```typescript
import { Link } from 'react-router-dom'
import { BlogPost } from '@/types/blog'
import { formatDate } from '@/lib/formatDate'

interface Props {
  post: BlogPost
  featured?: boolean
}

export default function BlogCard({ post, featured = false }: Props) {
  const categoryColors = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
  }

  return (
    <article className={`group ${featured ? 'md:col-span-2' : ''}`}>
      <Link to={`/blog/${post.slug}`} className="block">
        <div className={`
          overflow-hidden rounded-2xl bg-white shadow-md
          hover:shadow-xl transition-shadow duration-300
          ${featured ? 'md:flex' : ''}
        `}>
          {/* 이미지 */}
          <div className={`
            relative overflow-hidden
            ${featured ? 'md:w-1/2 aspect-[4/3]' : 'aspect-video'}
          `}>
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* 콘텐츠 */}
          <div className="p-6">
            <span className={`
              inline-block px-3 py-1 text-xs font-medium rounded-full mb-3
              ${categoryColors[post.category.color]}
            `}>
              {post.category.title}
            </span>

            <h3 className={`
              font-bold text-gray-900 mb-2
              group-hover:text-primary-600 transition-colors
              ${featured ? 'text-2xl' : 'text-lg'}
            `}>
              {post.title}
            </h3>

            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
              {post.excerpt}
            </p>

            <div className="flex items-center text-sm text-gray-500">
              <img
                src={post.author.image}
                alt={post.author.name}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span>{post.author.name}</span>
              <span className="mx-2">•</span>
              <time>{formatDate(post.publishedAt)}</time>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
```

#### 4.2 BlogList.tsx
```typescript
import { BlogPost } from '@/types/blog'
import BlogCard from './BlogCard'

interface Props {
  posts: BlogPost[]
}

export default function BlogList({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">포스트가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post, index) => (
        <BlogCard
          key={post.id}
          post={post}
          featured={index === 0}  // 첫 번째 포스트는 featured
        />
      ))}
    </div>
  )
}
```

#### 4.3 CategoryFilter.tsx
```typescript
import { Link, useParams } from 'react-router-dom'
import { Category } from '@/types/blog'

interface Props {
  categories: Category[]
}

export default function CategoryFilter({ categories }: Props) {
  const { category: currentCategory } = useParams()

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-4">카테고리</h3>
      <ul className="space-y-2">
        <li>
          <Link
            to="/blog"
            className={`block py-2 px-3 rounded-lg transition ${
              !currentCategory
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            전체 보기
          </Link>
        </li>
        {categories.map((cat) => (
          <li key={cat.id}>
            <Link
              to={`/blog/category/${cat.slug}`}
              className={`block py-2 px-3 rounded-lg transition ${
                currentCategory === cat.slug
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

#### 4.4 BlogPost.tsx (본문 렌더링)
```typescript
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface Props {
  content: string
}

export default function BlogPostContent({ content }: Props) {
  return (
    <article className="prose prose-lg prose-slate max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // 커스텀 렌더링 (선택)
          h2: ({ children, ...props }) => (
            <h2
              {...props}
              id={String(children).toLowerCase().replace(/\s+/g, '-')}
              className="scroll-mt-24"
            >
              {children}
            </h2>
          ),
          img: ({ src, alt }) => (
            <figure className="my-8">
              <img
                src={src}
                alt={alt}
                className="rounded-xl shadow-lg"
              />
              {alt && (
                <figcaption className="text-center text-sm text-gray-500 mt-2">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
```

#### 4.5 GiscusComments.tsx
```typescript
import Giscus from '@giscus/react'

export default function GiscusComments() {
  return (
    <Giscus
      repo="username/blog-comments"  // 본인 저장소로 변경
      repoId="R_kgDOxxx"              // giscus.app에서 복사
      category="General"
      categoryId="DIC_xxx"            // giscus.app에서 복사
      mapping="pathname"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="light"
      lang="ko"
      loading="lazy"
    />
  )
}
```

---

### Phase 5: 페이지 컴포넌트 구현 (2시간)

#### 5.1 BlogListPage.tsx
```typescript
import { useState, useMemo } from 'react'
import BlogList from '@/components/blog/BlogList'
import CategoryFilter from '@/components/blog/CategoryFilter'
import Search from '@/components/blog/Search'
import { usePosts } from '@/hooks/usePosts'

export default function BlogListPage() {
  const { posts, categories, isLoading } = usePosts()
  const [searchQuery, setSearchQuery] = useState('')

  // 검색 필터링
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts
    const query = searchQuery.toLowerCase()
    return posts.filter(
      post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query)
    )
  }, [posts, searchQuery])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">로딩중...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero 섹션 */}
      <section className="bg-gradient-to-r from-primary-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            인사이트 & 노하우
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mb-8">
            마케팅 전략, 디지털 트렌드, 성공 사례 등
            비즈니스 성장을 위한 전문 인사이트를 제공합니다.
          </p>
          <Search onSearch={setSearchQuery} />
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <section className="py-12 container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 사이드바 */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <CategoryFilter categories={categories} />
            </div>
          </aside>

          {/* 블로그 리스트 */}
          <main className="flex-1">
            <BlogList posts={filteredPosts} />
          </main>
        </div>
      </section>
    </div>
  )
}
```

#### 5.2 BlogPostPage.tsx
```typescript
import { useParams, Link } from 'react-router-dom'
import { usePosts } from '@/hooks/usePosts'
import BlogPostContent from '@/components/blog/BlogPost'
import TableOfContents from '@/components/blog/TableOfContents'
import ShareButtons from '@/components/blog/ShareButtons'
import AuthorCard from '@/components/blog/AuthorCard'
import RelatedPosts from '@/components/blog/RelatedPosts'
import GiscusComments from '@/components/blog/GiscusComments'
import { formatDate } from '@/lib/formatDate'
import { calculateReadingTime } from '@/lib/readingTime'

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { getPostBySlug, getRelatedPosts, isLoading } = usePosts()

  const post = getPostBySlug(slug!)
  const relatedPosts = post ? getRelatedPosts(post) : []

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">로딩중...</div>
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">포스트를 찾을 수 없습니다</h1>
        <Link to="/blog" className="text-primary-600 hover:underline">
          블로그 목록으로 돌아가기
        </Link>
      </div>
    )
  }

  const readingTime = calculateReadingTime(post.content)

  return (
    <article className="min-h-screen bg-white">
      {/* 포스트 헤더 */}
      <header className="bg-gray-50 py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* 카테고리 배지 */}
          <Link
            to={`/blog/category/${post.category.slug}`}
            className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4 hover:bg-blue-200 transition"
          >
            {post.category.title}
          </Link>

          {/* 제목 */}
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* 요약 */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {post.excerpt}
          </p>

          {/* 메타 정보 */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <img
                src={post.author.image}
                alt={post.author.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">{post.author.name}</div>
                <div>{post.author.role}</div>
              </div>
            </div>
            <span>•</span>
            <time>{formatDate(post.publishedAt)}</time>
            <span>•</span>
            <span>{readingTime}분 읽기</span>
          </div>
        </div>
      </header>

      {/* 커버 이미지 */}
      <div className="container mx-auto px-6 max-w-4xl -mt-8">
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          {/* 사이드바 - 목차 */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <TableOfContents content={post.content} />
              <ShareButtons title={post.title} />
            </div>
          </aside>

          {/* 본문 */}
          <main className="flex-1 max-w-3xl">
            <BlogPostContent content={post.content} />

            {/* 태그 */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">태그</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 작성자 소개 */}
            <AuthorCard author={post.author} className="mt-12" />

            {/* 관련 포스트 */}
            {relatedPosts.length > 0 && (
              <RelatedPosts posts={relatedPosts} className="mt-16" />
            )}

            {/* 댓글 */}
            <section className="mt-16 pt-16 border-t border-gray-200">
              <h2 className="text-2xl font-bold mb-8">댓글</h2>
              <GiscusComments />
            </section>
          </main>
        </div>
      </div>
    </article>
  )
}
```

---

### Phase 6: 유틸리티 및 훅 구현 (1시간)

#### 6.1 formatDate.ts
```typescript
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatDate(dateString: string): string {
  const date = parseISO(dateString)
  return format(date, 'yyyy년 M월 d일', { locale: ko })
}
```

#### 6.2 readingTime.ts
```typescript
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200  // 한국어 기준
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}
```

#### 6.3 usePosts.ts
```typescript
import { useState, useEffect, useMemo } from 'react'
import { BlogPost, Category, Author } from '@/types/blog'
import postsData from '@/data/posts.json'
import categoriesData from '@/data/categories.json'
import authorsData from '@/data/authors.json'

export function usePosts() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const categories = categoriesData as Category[]
  const authors = authorsData as Author[]

  useEffect(() => {
    async function loadPosts() {
      try {
        // 포스트 메타데이터와 마크다운 콘텐츠 병합
        const loadedPosts = await Promise.all(
          postsData.map(async (postMeta: any) => {
            // 마크다운 파일 동적 import
            const content = await import(`@/data/posts/${postMeta.slug}.md?raw`)

            const category = categories.find(c => c.id === postMeta.categoryId)!
            const author = authors.find(a => a.id === postMeta.authorId)!

            return {
              ...postMeta,
              content: content.default,
              category,
              author,
            } as BlogPost
          })
        )

        setPosts(loadedPosts.sort((a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        ))
      } catch (error) {
        console.error('Failed to load posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [])

  const getPostBySlug = (slug: string) => {
    return posts.find(post => post.slug === slug)
  }

  const getPostsByCategory = (categorySlug: string) => {
    return posts.filter(post => post.category.slug === categorySlug)
  }

  const getRelatedPosts = (currentPost: BlogPost, limit = 3) => {
    return posts
      .filter(post =>
        post.id !== currentPost.id &&
        post.category.id === currentPost.category.id
      )
      .slice(0, limit)
  }

  const featuredPosts = useMemo(() => {
    return posts.filter(post => post.featured).slice(0, 4)
  }, [posts])

  return {
    posts,
    categories,
    featuredPosts,
    isLoading,
    getPostBySlug,
    getPostsByCategory,
    getRelatedPosts,
  }
}
```

---

### Phase 7: SEO 개선 (선택사항, 1시간)

Vite는 기본적으로 CSR이므로 SEO에 제한이 있습니다. 하지만 다음 방법으로 개선할 수 있습니다.

#### 7.1 vite-plugin-prerender 사용
```bash
npm install vite-plugin-prerender -D
```

```typescript
// vite.config.ts
import prerender from 'vite-plugin-prerender'

export default defineConfig({
  plugins: [
    react(),
    prerender({
      routes: [
        '/',
        '/blog',
        '/blog/ai-marketing-guide-2024',
        '/blog/seo-strategy-small-business',
        // ... 모든 포스트 경로
      ],
    }),
  ],
})
```

#### 7.2 react-helmet-async로 메타태그 관리
```bash
npm install react-helmet-async
```

```typescript
// main.tsx
import { HelmetProvider } from 'react-helmet-async'

<HelmetProvider>
  <App />
</HelmetProvider>

// BlogPostPage.tsx
import { Helmet } from 'react-helmet-async'

<Helmet>
  <title>{post.title} | 골든웨이브 블로그</title>
  <meta name="description" content={post.excerpt} />
  <meta property="og:title" content={post.title} />
  <meta property="og:description" content={post.excerpt} />
  <meta property="og:image" content={post.coverImage} />
</Helmet>
```

---

### Phase 8: 배포 (30분)

#### 8.1 빌드
```bash
npm run build
```

#### 8.2 Vercel 배포
```bash
npm i -g vercel
vercel login
vercel
```

또는 GitHub 연동 후 자동 배포

---

## 4. 장단점 분석

### 장점

| 항목 | 설명 |
|-----|-----|
| **빠른 구현** | 기존 프로젝트 유지, 학습 비용 최소화 |
| **간단한 구조** | 외부 서비스 의존성 최소 (CMS 불필요) |
| **유연한 배포** | Vercel, Netlify, GitHub Pages 등 어디서나 가능 |
| **빠른 빌드** | Vite의 초고속 빌드 |
| **로컬 콘텐츠 관리** | Git으로 포스트 버전 관리 가능 |
| **낮은 유지비용** | 무료 정적 호스팅으로 충분 |

### 단점

| 항목 | 설명 |
|-----|-----|
| **제한적 SEO** | CSR 특성상 검색 엔진 인덱싱 불완전 |
| **소셜 미리보기 제한** | prerender 없이는 링크 공유 시 미리보기 안됨 |
| **수동 콘텐츠 관리** | 마크다운 파일 직접 편집 필요 (비개발자 어려움) |
| **빌드 시 경로 추가** | 새 포스트마다 prerender 경로 추가 필요 |
| **ISR 불가** | 정적 빌드 후 갱신 불가 (재배포 필요) |

---

## 5. 예상 소요 시간

| Phase | 작업 내용 | 예상 시간 |
|-------|---------|----------|
| 1 | 프로젝트 구조 정리 + 라우터 설정 | 1시간 |
| 2 | 레이아웃 컴포넌트 | 30분 |
| 3 | 데이터 구조 설정 | 1시간 |
| 4 | 블로그 컴포넌트 구현 | 3-4시간 |
| 5 | 페이지 컴포넌트 구현 | 2시간 |
| 6 | 유틸리티 및 훅 | 1시간 |
| 7 | SEO 개선 (선택) | 1시간 |
| 8 | 배포 | 30분 |
| **총계** | | **9-11시간** |

---

## 6. 필요한 외부 서비스

| 서비스 | 용도 | 비용 |
|-------|-----|-----|
| **GitHub** | 코드 저장소 + Giscus 댓글 | 무료 |
| **Vercel/Netlify** | 정적 호스팅 | 무료 |

> Sanity, Vercel Postgres 등 추가 서비스 불필요

---

## 7. 콘텐츠 관리 워크플로우

### 새 포스트 작성 순서

1. `src/data/posts/` 폴더에 마크다운 파일 생성
   ```
   src/data/posts/new-post-slug.md
   ```

2. `src/data/posts.json`에 메타데이터 추가
   ```json
   {
     "id": "3",
     "slug": "new-post-slug",
     "title": "새 포스트 제목",
     ...
   }
   ```

3. (prerender 사용 시) `vite.config.ts` 경로 추가
   ```typescript
   routes: [
     '/blog/new-post-slug',
   ]
   ```

4. Git 커밋 & 푸시 → 자동 배포

---

## 8. 향후 확장 가능성

### CMS 추가 (나중에)
- Contentful, Strapi 등 헤드리스 CMS 연동 가능
- API 호출 방식으로 `usePosts` 훅만 수정하면 됨

### Next.js 마이그레이션 (나중에)
- 블로그가 성장하여 SEO가 중요해지면
- 컴포넌트 대부분 재사용 가능
- 라우팅, 데이터 페칭 부분만 변경

---

## 9. 최종 결과물

### 페이지 목록
- `/` - 홈페이지 (기존 랜딩 페이지)
- `/blog` - 블로그 목록
- `/blog/:slug` - 개별 포스트
- `/blog/category/:category` - 카테고리별 목록

### 기능 목록
- 반응형 디자인
- 블로그 목록/상세 페이지
- 카테고리 필터
- 검색 기능 (Fuse.js)
- 목차 (자동 생성)
- SNS 공유 버튼
- 댓글 시스템 (Giscus)
- 마크다운 렌더링 (코드 하이라이팅 포함)

---

## 10. 다음 단계

옵션 B를 선택하시면:
1. React Router 설치 및 설정
2. 폴더 구조 정리
3. 샘플 포스트 데이터 생성
4. 블로그 컴포넌트 구현
5. 페이지 구현
6. Giscus 댓글 연동
7. 배포

---

*작성일: 2026-02-02*
*프로젝트: 골든웨이브 인사이트 블로그*
