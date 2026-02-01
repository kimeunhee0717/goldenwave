# 옵션 B: Vite 블로그 개발 체크리스트

> 현재 Vite + React 프로젝트에 블로그 기능 추가
>
> **예상 소요 시간**: 9-11시간
> **기술 스택**: Vite + React + TypeScript + Tailwind CSS + React Router

---

## 진행 상황 요약

| Phase | 작업 내용 | 예상 시간 | 상태 |
|-------|---------|----------|------|
| Phase 1 | 의존성 설치 및 프로젝트 구조 정리 | 1시간 | ✅ 완료 |
| Phase 2 | 라우터 및 레이아웃 설정 | 1시간 | ✅ 완료 |
| Phase 3 | 타입 정의 및 데이터 구조 | 1시간 | ✅ 완료 |
| Phase 4 | 유틸리티 함수 및 커스텀 훅 | 30분 | ✅ 완료 |
| Phase 5 | 공통 UI 컴포넌트 | 30분 | ✅ 완료 |
| Phase 6 | 블로그 컴포넌트 구현 | 2-3시간 | ✅ 완료 |
| Phase 7 | 페이지 컴포넌트 구현 | 2시간 | ✅ 완료 |
| Phase 8 | Giscus 댓글 시스템 연동 | 30분 | ✅ 완료 |
| Phase 9 | 샘플 콘텐츠 작성 | 30분 | ✅ 완료 |
| Phase 10 | 테스트 및 배포 | 30분 | ✅ 완료 |

---

## Phase 1: 의존성 설치 및 프로젝트 구조 정리

> 예상 시간: 1시간

### 1.1 의존성 설치

#### 필수 패키지
- [ ] React Router 설치
  ```bash
  npm install react-router-dom
  ```

- [ ] 마크다운 렌더링 패키지 설치
  ```bash
  npm install react-markdown remark-gfm rehype-highlight
  ```

- [ ] 검색 기능 패키지 설치
  ```bash
  npm install fuse.js
  ```

- [ ] 댓글 시스템 패키지 설치
  ```bash
  npm install @giscus/react
  ```

- [ ] 유틸리티 패키지 설치
  ```bash
  npm install date-fns
  ```

#### 개발 의존성
- [ ] Tailwind Typography 플러그인 설치
  ```bash
  npm install -D @tailwindcss/typography
  ```

#### 설치 확인
- [ ] `package.json`에 모든 패키지가 추가되었는지 확인
  ```json
  {
    "dependencies": {
      "react-router-dom": "^6.x",
      "react-markdown": "^9.x",
      "remark-gfm": "^4.x",
      "rehype-highlight": "^7.x",
      "fuse.js": "^7.x",
      "@giscus/react": "^3.x",
      "date-fns": "^3.x"
    },
    "devDependencies": {
      "@tailwindcss/typography": "^0.5.x"
    }
  }
  ```

### 1.2 Tailwind 설정 업데이트

- [ ] `tailwind.config.js` 파일 수정
  ```javascript
  /** @type {import('tailwindcss').Config} */
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
      // 기존 경로도 유지
      "./*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
          },
        },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  }
  ```

### 1.3 Vite 설정 업데이트

- [ ] `vite.config.ts` 파일 수정
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
    assetsInclude: ['**/*.md'],
  })
  ```

### 1.4 TypeScript 경로 별칭 설정

- [ ] `tsconfig.json` 수정
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

### 1.5 폴더 구조 생성

- [ ] src 폴더 생성 (없는 경우)
  ```bash
  mkdir src
  ```

- [ ] 기존 파일들을 src 폴더로 이동
  ```bash
  # Windows PowerShell
  Move-Item -Path ".\components" -Destination ".\src\"
  Move-Item -Path ".\App.tsx" -Destination ".\src\"
  Move-Item -Path ".\index.tsx" -Destination ".\src\main.tsx"
  ```

- [ ] 새 폴더들 생성
  ```bash
  mkdir src\pages
  mkdir src\data
  mkdir src\data\posts
  mkdir src\lib
  mkdir src\hooks
  mkdir src\types
  mkdir src\components\common
  mkdir src\components\layout
  mkdir src\components\home
  mkdir src\components\blog
  mkdir public\images\blog
  mkdir public\images\authors
  ```

### 1.6 기존 컴포넌트 폴더 정리

- [ ] home 폴더로 홈페이지 컴포넌트 이동
  ```
  src/components/home/
  ├── Hero.tsx
  ├── Features.tsx
  ├── ThemeGallery.tsx
  ├── Testimonials.tsx
  └── CallToAction.tsx
  ```

- [ ] layout 폴더로 레이아웃 컴포넌트 이동
  ```
  src/components/layout/
  ├── Navbar.tsx
  └── Footer.tsx
  ```

### 1.7 index.html 수정

- [ ] `index.html`의 script 경로 수정
  ```html
  <script type="module" src="/src/main.tsx"></script>
  ```

### Phase 1 완료 체크
- [ ] `npm run dev` 실행하여 에러 없이 시작되는지 확인
- [ ] 기존 홈페이지가 정상 작동하는지 확인

---

## Phase 2: 라우터 및 레이아웃 설정

> 예상 시간: 1시간

### 2.1 Layout 컴포넌트 생성

- [ ] `src/components/layout/Layout.tsx` 생성
  ```typescript
  import { Outlet } from 'react-router-dom'
  import Navbar from './Navbar'
  import Footer from './Footer'

  export default function Layout() {
    return (
      <div className="font-sans antialiased text-slate-800 bg-white min-h-screen selection:bg-primary-100 selection:text-primary-700">
        <Navbar />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    )
  }
  ```

### 2.2 HomePage 컴포넌트 생성

- [ ] `src/pages/HomePage.tsx` 생성
  - 기존 App.tsx의 내용을 여기로 이동
  ```typescript
  import Hero from '@/components/home/Hero'
  import Features from '@/components/home/Features'
  import ThemeGallery from '@/components/home/ThemeGallery'
  import Testimonials from '@/components/home/Testimonials'
  import CallToAction from '@/components/home/CallToAction'

  export default function HomePage() {
    return (
      <>
        <Hero />
        <Features />
        <ThemeGallery />
        <Testimonials />
        <CallToAction />
      </>
    )
  }
  ```

### 2.3 App.tsx 라우터 설정

- [ ] `src/App.tsx` 완전히 새로 작성
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

### 2.4 임시 페이지 컴포넌트 생성 (플레이스홀더)

- [ ] `src/pages/BlogListPage.tsx` 생성 (임시)
  ```typescript
  export default function BlogListPage() {
    return <div className="container mx-auto px-6 py-20">블로그 목록 페이지 (준비중)</div>
  }
  ```

- [ ] `src/pages/BlogPostPage.tsx` 생성 (임시)
  ```typescript
  export default function BlogPostPage() {
    return <div className="container mx-auto px-6 py-20">블로그 포스트 페이지 (준비중)</div>
  }
  ```

- [ ] `src/pages/CategoryPage.tsx` 생성 (임시)
  ```typescript
  export default function CategoryPage() {
    return <div className="container mx-auto px-6 py-20">카테고리 페이지 (준비중)</div>
  }
  ```

- [ ] `src/pages/NotFoundPage.tsx` 생성
  ```typescript
  import { Link } from 'react-router-dom'

  export default function NotFoundPage() {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">페이지를 찾을 수 없습니다</p>
        <Link
          to="/"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          홈으로 돌아가기
        </Link>
      </div>
    )
  }
  ```

### 2.5 Navbar 수정 (블로그 메뉴 추가)

- [ ] `src/components/layout/Navbar.tsx` 수정
  - 메뉴에 블로그 링크 추가
  - `<a>` 태그를 React Router의 `<Link>` 또는 `<NavLink>`로 변경
  ```typescript
  import { Link, useLocation } from 'react-router-dom'

  const menuItems = [
    { label: '서비스', href: '/#services' },
    { label: '포트폴리오', href: '/#portfolio' },
    { label: '블로그', href: '/blog', isRoute: true },  // 추가
    { label: '고객 후기', href: '/#testimonials' },
    { label: '상담 신청', href: '/#contact' },
  ]

  // 렌더링 부분에서:
  // isRoute가 true면 <Link to={href}>
  // isRoute가 false면 <a href={href}>
  ```

### 2.6 main.tsx 확인

- [ ] `src/main.tsx` 확인 및 수정
  ```typescript
  import React from 'react'
  import ReactDOM from 'react-dom/client'
  import App from './App'
  import './index.css'  // 또는 globals.css

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  ```

### Phase 2 완료 체크
- [ ] `npm run dev` 실행
- [ ] `/` 경로에서 홈페이지 표시 확인
- [ ] `/blog` 경로에서 블로그 목록 페이지 표시 확인
- [ ] `/blog/test` 경로에서 포스트 페이지 표시 확인
- [ ] 존재하지 않는 경로에서 404 페이지 표시 확인
- [ ] 네비게이션 메뉴에서 블로그 링크 작동 확인

---

## Phase 3: 타입 정의 및 데이터 구조

> 예상 시간: 1시간

### 3.1 블로그 타입 정의

- [ ] `src/types/blog.ts` 생성
  ```typescript
  // 카테고리 타입
  export interface Category {
    id: string
    title: string
    slug: string
    description?: string
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  }

  // 작성자 타입
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

  // 블로그 포스트 타입
  export interface BlogPost {
    id: string
    slug: string
    title: string
    excerpt: string
    content: string
    coverImage: string
    category: Category
    tags: string[]
    author: Author
    publishedAt: string
    featured: boolean
    readingTime?: number
  }

  // 포스트 메타데이터 (JSON 파일용)
  export interface PostMeta {
    id: string
    slug: string
    title: string
    excerpt: string
    coverImage: string
    categoryId: string
    tags: string[]
    authorId: string
    publishedAt: string
    featured: boolean
  }
  ```

### 3.2 카테고리 데이터 생성

- [ ] `src/data/categories.json` 생성
  ```json
  [
    {
      "id": "marketing",
      "title": "마케팅 전략",
      "slug": "marketing",
      "description": "효과적인 마케팅 전략과 최신 트렌드",
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
      "description": "검색 엔진 최적화 전략 가이드",
      "color": "green"
    },
    {
      "id": "case-study",
      "title": "성공 사례",
      "slug": "case-study",
      "description": "실제 고객사 성공 스토리",
      "color": "orange"
    },
    {
      "id": "tips",
      "title": "실무 팁",
      "slug": "tips",
      "description": "바로 적용 가능한 실무 노하우",
      "color": "red"
    }
  ]
  ```

### 3.3 작성자 데이터 생성

- [ ] `src/data/authors.json` 생성
  ```json
  [
    {
      "id": "ceo",
      "name": "김대표",
      "image": "/images/authors/ceo.jpg",
      "role": "대표이사",
      "bio": "10년간 디지털 마케팅 분야에서 활동하며 수백 개 기업의 성장을 도왔습니다. 데이터 기반 마케팅과 AI 활용에 대한 전문성을 보유하고 있습니다.",
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
      "bio": "콘텐츠 마케팅과 브랜딩 전문가입니다. 스타트업부터 대기업까지 다양한 규모의 기업 마케팅을 담당했습니다.",
      "social": {
        "twitter": "https://twitter.com/example",
        "email": "marketing@goldenwave.com"
      }
    },
    {
      "id": "tech-lead",
      "name": "박개발",
      "image": "/images/authors/tech-lead.jpg",
      "role": "기술 리드",
      "bio": "풀스택 개발자로 마케팅 자동화 시스템과 데이터 분석 도구를 개발합니다.",
      "social": {
        "email": "tech@goldenwave.com"
      }
    }
  ]
  ```

### 3.4 포스트 메타데이터 생성

- [ ] `src/data/posts.json` 생성
  ```json
  [
    {
      "id": "1",
      "slug": "ai-marketing-guide-2024",
      "title": "2024 AI 마케팅 완벽 가이드: 비즈니스 성장을 위한 전략",
      "excerpt": "AI 기술을 마케팅에 활용하는 방법과 실제 사례를 통해 비즈니스 성장 전략을 알아봅니다. ChatGPT부터 자동화 도구까지 실무에서 바로 적용할 수 있는 내용을 담았습니다.",
      "coverImage": "/images/blog/ai-marketing.jpg",
      "categoryId": "ai",
      "tags": ["AI", "마케팅", "자동화", "ChatGPT", "트렌드"],
      "authorId": "ceo",
      "publishedAt": "2024-02-01",
      "featured": true
    },
    {
      "id": "2",
      "slug": "seo-strategy-small-business",
      "title": "중소기업을 위한 SEO 전략: 예산 없이 검색 1페이지 달성하기",
      "excerpt": "제한된 예산으로도 효과적인 SEO 전략을 수립하고 실행하는 방법을 소개합니다. 키워드 연구부터 콘텐츠 최적화까지 단계별 가이드를 제공합니다.",
      "coverImage": "/images/blog/seo-strategy.jpg",
      "categoryId": "seo",
      "tags": ["SEO", "검색 최적화", "중소기업", "콘텐츠", "키워드"],
      "authorId": "marketing-lead",
      "publishedAt": "2024-01-28",
      "featured": true
    },
    {
      "id": "3",
      "slug": "content-marketing-roi",
      "title": "콘텐츠 마케팅 ROI 측정하기: 성과를 수치로 증명하는 방법",
      "excerpt": "콘텐츠 마케팅의 효과를 정확하게 측정하고 보고하는 방법을 알아봅니다. KPI 설정부터 대시보드 구축까지 실무 가이드를 제공합니다.",
      "coverImage": "/images/blog/content-roi.jpg",
      "categoryId": "marketing",
      "tags": ["콘텐츠 마케팅", "ROI", "KPI", "데이터 분석"],
      "authorId": "marketing-lead",
      "publishedAt": "2024-01-20",
      "featured": false
    },
    {
      "id": "4",
      "slug": "startup-growth-case-study",
      "title": "스타트업 A사의 6개월 300% 성장 스토리",
      "excerpt": "초기 스타트업이 어떻게 6개월 만에 매출 300% 성장을 이뤘는지 실제 사례를 통해 알아봅니다. 전략 수립부터 실행까지의 과정을 상세히 공개합니다.",
      "coverImage": "/images/blog/case-study.jpg",
      "categoryId": "case-study",
      "tags": ["스타트업", "성장", "케이스 스터디", "마케팅 전략"],
      "authorId": "ceo",
      "publishedAt": "2024-01-15",
      "featured": true
    }
  ]
  ```

### 3.5 샘플 마크다운 포스트 생성

- [ ] `src/data/posts/ai-marketing-guide-2024.md` 생성
  ```markdown
  AI 기술이 마케팅 분야를 어떻게 혁신하고 있는지, 그리고 여러분의 비즈니스에 어떻게 적용할 수 있는지 알아보겠습니다.

  ## 1. AI 마케팅이란?

  AI 마케팅은 인공지능 기술을 활용하여 마케팅 활동을 최적화하고 자동화하는 것을 의미합니다. 단순한 자동화를 넘어 데이터 기반의 의사결정과 개인화된 고객 경험을 제공할 수 있습니다.

  ### 1.1 주요 활용 분야

  - **콘텐츠 생성**: ChatGPT, Claude를 활용한 콘텐츠 작성 및 아이디어 발굴
  - **개인화**: 고객 데이터 기반 맞춤 추천 및 타겟팅
  - **자동화**: 반복 작업 자동화로 효율성 향상
  - **분석**: 대량의 데이터에서 인사이트 도출

  ## 2. 실전 활용 방법

  ### 2.1 콘텐츠 마케팅에 AI 활용하기

  AI를 콘텐츠 마케팅에 활용하는 방법은 다양합니다:

  1. **아이디어 브레인스토밍**: 주제에 대한 다양한 각도의 아이디어 생성
  2. **초안 작성**: 블로그 포스트, 이메일 뉴스레터 초안 작성
  3. **SEO 최적화**: 키워드 연구 및 메타 설명 작성
  4. **A/B 테스트**: 여러 버전의 카피 생성 및 테스트

  > 💡 **팁**: AI가 생성한 콘텐츠는 반드시 사람이 검토하고 브랜드 톤에 맞게 수정해야 합니다.

  ### 2.2 고객 서비스 자동화

  챗봇과 AI 어시스턴트를 활용하면 24시간 고객 서비스가 가능합니다:

  - FAQ 자동 응답
  - 주문 상태 조회
  - 기본적인 문의 처리
  - 복잡한 문의는 담당자에게 연결

  ## 3. 시작하기

  AI 마케팅을 시작하려면:

  1. **목표 설정**: 어떤 문제를 해결하고 싶은지 명확히 정의
  2. **도구 선택**: 목표에 맞는 AI 도구 선택
  3. **작은 실험**: 작은 규모로 시작하여 효과 검증
  4. **확장**: 성공한 실험을 확장

  ## 마무리

  AI는 마케터를 대체하는 것이 아니라, 마케터의 능력을 증폭시키는 도구입니다. 전략적으로 활용하면 더 적은 리소스로 더 큰 성과를 낼 수 있습니다.

  다음 포스트에서는 구체적인 AI 도구 추천과 활용 사례를 더 자세히 다루겠습니다.
  ```

- [ ] `src/data/posts/seo-strategy-small-business.md` 생성

- [ ] `src/data/posts/content-marketing-roi.md` 생성

- [ ] `src/data/posts/startup-growth-case-study.md` 생성

### 3.6 플레이스홀더 이미지 준비

- [ ] 블로그 커버 이미지 준비 또는 플레이스홀더 사용
  ```
  public/images/blog/
  ├── ai-marketing.jpg
  ├── seo-strategy.jpg
  ├── content-roi.jpg
  └── case-study.jpg
  ```

- [ ] 작성자 프로필 이미지 준비 또는 플레이스홀더 사용
  ```
  public/images/authors/
  ├── ceo.jpg
  ├── marketing-lead.jpg
  └── tech-lead.jpg
  ```

### Phase 3 완료 체크
- [ ] 모든 JSON 파일이 올바른 형식인지 확인
- [ ] 마크다운 파일이 정상적으로 생성되었는지 확인
- [ ] 이미지 경로가 올바른지 확인

---

## Phase 4: 유틸리티 함수 및 커스텀 훅

> 예상 시간: 30분

### 4.1 날짜 포맷팅 유틸리티

- [ ] `src/lib/formatDate.ts` 생성
  ```typescript
  import { format, parseISO } from 'date-fns'
  import { ko } from 'date-fns/locale'

  export function formatDate(dateString: string): string {
    const date = parseISO(dateString)
    return format(date, 'yyyy년 M월 d일', { locale: ko })
  }

  export function formatDateShort(dateString: string): string {
    const date = parseISO(dateString)
    return format(date, 'M월 d일', { locale: ko })
  }
  ```

### 4.2 읽기 시간 계산 유틸리티

- [ ] `src/lib/readingTime.ts` 생성
  ```typescript
  export function calculateReadingTime(content: string): number {
    const wordsPerMinute = 500 // 한국어 기준 (영어보다 빠름)
    const textLength = content.replace(/\s+/g, '').length
    const minutes = Math.ceil(textLength / wordsPerMinute)
    return Math.max(1, minutes) // 최소 1분
  }
  ```

### 4.3 클래스명 병합 유틸리티

- [ ] `src/lib/utils.ts` 생성
  ```typescript
  import { type ClassValue, clsx } from 'clsx'
  import { twMerge } from 'tailwind-merge'

  // clsx와 tailwind-merge가 없다면 간단한 버전 사용:
  export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
  }
  ```

### 4.4 포스트 데이터 훅

- [ ] `src/hooks/usePosts.ts` 생성
  ```typescript
  import { useState, useEffect, useMemo } from 'react'
  import { BlogPost, Category, Author, PostMeta } from '@/types/blog'
  import postsData from '@/data/posts.json'
  import categoriesData from '@/data/categories.json'
  import authorsData from '@/data/authors.json'

  // 마크다운 파일들을 동적으로 import
  const markdownModules = import.meta.glob('@/data/posts/*.md', {
    eager: true,
    query: '?raw',
    import: 'default'
  })

  export function usePosts() {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const categories = categoriesData as Category[]
    const authors = authorsData as Author[]

    useEffect(() => {
      function loadPosts() {
        try {
          const loadedPosts = (postsData as PostMeta[]).map((postMeta) => {
            // 마크다운 파일 경로 생성
            const mdPath = `/src/data/posts/${postMeta.slug}.md`
            const content = (markdownModules[mdPath] as string) || ''

            const category = categories.find(c => c.id === postMeta.categoryId)!
            const author = authors.find(a => a.id === postMeta.authorId)!

            return {
              ...postMeta,
              content,
              category,
              author,
            } as BlogPost
          })

          // 최신순 정렬
          loadedPosts.sort((a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          )

          setPosts(loadedPosts)
        } catch (error) {
          console.error('Failed to load posts:', error)
        } finally {
          setIsLoading(false)
        }
      }

      loadPosts()
    }, [])

    const getPostBySlug = (slug: string): BlogPost | undefined => {
      return posts.find(post => post.slug === slug)
    }

    const getPostsByCategory = (categorySlug: string): BlogPost[] => {
      return posts.filter(post => post.category.slug === categorySlug)
    }

    const getRelatedPosts = (currentPost: BlogPost, limit = 3): BlogPost[] => {
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
      authors,
      featuredPosts,
      isLoading,
      getPostBySlug,
      getPostsByCategory,
      getRelatedPosts,
    }
  }
  ```

### 4.5 스크롤 진행률 훅

- [ ] `src/hooks/useScrollProgress.ts` 생성
  ```typescript
  import { useState, useEffect } from 'react'

  export function useScrollProgress() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
      function handleScroll() {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const scrollPercent = (scrollTop / docHeight) * 100
        setProgress(Math.min(100, Math.max(0, scrollPercent)))
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return progress
  }
  ```

### Phase 4 완료 체크
- [ ] 유틸리티 함수 import 테스트
- [ ] usePosts 훅이 정상 작동하는지 콘솔로 확인

---

## Phase 5: 공통 UI 컴포넌트

> 예상 시간: 30분

### 5.1 Badge 컴포넌트

- [x] `src/components/common/Badge.tsx` 생성
  ```typescript
  import { cn } from '@/lib/utils'

  interface BadgeProps {
    children: React.ReactNode
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray'
    size?: 'sm' | 'md'
    className?: string
  }

  const colorStyles = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700',
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  export default function Badge({
    children,
    color = 'blue',
    size = 'md',
    className
  }: BadgeProps) {
    return (
      <span className={cn(
        'inline-block font-medium rounded-full',
        colorStyles[color],
        sizeStyles[size],
        className
      )}>
        {children}
      </span>
    )
  }
  ```

### 5.2 Skeleton 컴포넌트 (로딩 상태)

- [x] `src/components/common/Skeleton.tsx` 생성
  ```typescript
  import { cn } from '@/lib/utils'

  interface SkeletonProps {
    className?: string
  }

  export default function Skeleton({ className }: SkeletonProps) {
    return (
      <div className={cn(
        'animate-pulse bg-gray-200 rounded',
        className
      )} />
    )
  }
  ```

### 5.3 Card 컴포넌트

- [x] `src/components/common/Card.tsx` 생성
  ```typescript
  import { cn } from '@/lib/utils'

  interface CardProps {
    children: React.ReactNode
    className?: string
    hover?: boolean
  }

  export default function Card({ children, className, hover = false }: CardProps) {
    return (
      <div className={cn(
        'bg-white rounded-2xl shadow-md overflow-hidden',
        hover && 'hover:shadow-xl transition-shadow duration-300',
        className
      )}>
        {children}
      </div>
    )
  }
  ```

### Phase 5 완료 체크
- [x] Badge 컴포넌트 렌더링 테스트
- [x] Skeleton 컴포넌트 애니메이션 확인
- [x] Card 컴포넌트 hover 효과 확인

---

## Phase 6: 블로그 컴포넌트 구현

> 예상 시간: 2-3시간

### 6.1 BlogCard 컴포넌트

- [x] `src/components/blog/BlogCard.tsx` 생성
  - 커버 이미지 (hover 확대 효과)
  - 카테고리 배지
  - 제목, 요약
  - 작성자 정보, 날짜
  - featured 옵션 (큰 카드)

### 6.2 BlogList 컴포넌트

- [x] `src/components/blog/BlogList.tsx` 생성
  - 그리드 레이아웃 (1/2/3열 반응형)
  - 첫 번째 포스트 featured 처리
  - 빈 상태 처리

### 6.3 FeaturedPosts 컴포넌트

- [x] `src/components/blog/FeaturedPosts.tsx` 생성
  - 추천 포스트 그리드 (최대 4개)
  - 큰 카드 레이아웃

### 6.4 CategoryFilter 컴포넌트

- [x] `src/components/blog/CategoryFilter.tsx` 생성
  - 카테고리 목록
  - 현재 선택된 카테고리 하이라이트
  - "전체 보기" 옵션

### 6.5 BlogPostContent 컴포넌트

- [x] `src/components/blog/BlogPostContent.tsx` 생성
  - react-markdown으로 마크다운 렌더링
  - 코드 블록 하이라이팅
  - 이미지 캡션
  - 커스텀 스타일링

### 6.6 TableOfContents 컴포넌트

- [x] `src/components/blog/TableOfContents.tsx` 생성
  - H2, H3 헤딩 추출
  - 클릭 시 해당 섹션으로 스크롤
  - 현재 읽는 섹션 하이라이트 (선택)

### 6.7 ShareButtons 컴포넌트

- [x] `src/components/blog/ShareButtons.tsx` 생성
  - 트위터 공유
  - 페이스북 공유
  - 링크드인 공유
  - 링크 복사

### 6.8 AuthorCard 컴포넌트

- [x] `src/components/blog/AuthorCard.tsx` 생성
  - 프로필 이미지
  - 이름, 직책
  - 소개 (bio)
  - 소셜 링크

### 6.9 RelatedPosts 컴포넌트

- [x] `src/components/blog/RelatedPosts.tsx` 생성
  - 관련 포스트 카드 (3개)
  - 간단한 카드 레이아웃

### 6.10 Search 컴포넌트

- [x] `src/components/blog/Search.tsx` 생성
  - 검색 입력 필드
  - Fuse.js로 검색
  - 실시간 결과 드롭다운

### 6.11 ReadingProgressBar 컴포넌트

- [x] `src/components/blog/ReadingProgressBar.tsx` 생성
  - 페이지 상단 고정
  - 스크롤 진행률 표시

### Phase 6 완료 체크
- [x] 모든 컴포넌트 import/export 확인
- [x] 각 컴포넌트 개별 렌더링 테스트
- [x] 스타일 적용 확인

---

## Phase 7: 페이지 컴포넌트 구현

> 예상 시간: 2시간

### 7.1 BlogListPage 완성

- [x] `src/pages/BlogListPage.tsx` 완성
  - Hero 섹션 (그라데이션 배경)
  - 검색 바
  - 추천 포스트 섹션
  - 2단 레이아웃 (사이드바 + 리스트)
  - 카테고리 필터 사이드바
  - 블로그 리스트

### 7.2 BlogPostPage 완성

- [x] `src/pages/BlogPostPage.tsx` 완성
  - 읽기 진행률 바
  - 포스트 헤더 (카테고리, 제목, 요약, 메타)
  - 커버 이미지
  - 2단 레이아웃 (목차 사이드바 + 본문)
  - 본문 렌더링
  - 태그 목록
  - 작성자 소개
  - 관련 포스트
  - 댓글 섹션

### 7.3 CategoryPage 완성

- [x] `src/pages/CategoryPage.tsx` 완성
  - 카테고리 정보 헤더
  - 해당 카테고리 포스트 목록
  - 빈 상태 처리

### Phase 7 완료 체크
- [x] `/blog` 페이지 전체 기능 테스트
- [x] `/blog/:slug` 페이지 전체 기능 테스트
- [x] `/blog/category/:category` 페이지 테스트
- [x] 반응형 레이아웃 확인 (모바일/태블릿/데스크톱)

---

## Phase 8: Giscus 댓글 시스템 연동

> 예상 시간: 30분

### 8.1 GitHub 저장소 설정

- [x] GitHub에 `blog-comments` 저장소 생성 (Public) - kimeunhee0717/goldenwave 사용
- [x] Repository Settings > Features > Discussions 활성화
- [x] [giscus.app](https://giscus.app) 접속
- [x] 저장소 연결 및 설정
- [x] 생성된 설정값 복사

### 8.2 GiscusComments 컴포넌트 구현

- [x] `src/components/blog/GiscusComments.tsx` 생성
  ```typescript
  import Giscus from '@giscus/react'

  export default function GiscusComments() {
    return (
      <Giscus
        repo="YOUR_USERNAME/blog-comments"
        repoId="R_kgDOxxxxxx"
        category="General"
        categoryId="DIC_xxxxxx"
        mapping="pathname"
        strict="0"
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

### 8.3 BlogPostPage에 댓글 추가

- [x] BlogPostPage에 GiscusComments 컴포넌트 추가

### Phase 8 완료 체크
- [x] Giscus 댓글 위젯 표시 확인
- [ ] GitHub 로그인 후 댓글 작성 테스트 (사용자 테스트 필요)
- [ ] 댓글이 GitHub Discussions에 저장되는지 확인 (사용자 테스트 필요)

---

## Phase 9: 샘플 콘텐츠 작성

> 예상 시간: 30분

### 9.1 추가 마크다운 포스트 작성

- [ ] `seo-strategy-small-business.md` 완성
- [ ] `content-marketing-roi.md` 완성
- [ ] `startup-growth-case-study.md` 완성

### 9.2 이미지 준비

- [ ] 블로그 커버 이미지 4장 준비 (또는 Unsplash 사용)
- [ ] 작성자 프로필 이미지 3장 준비 (또는 플레이스홀더)

### Phase 9 완료 체크
- [ ] 모든 포스트가 정상 렌더링되는지 확인
- [ ] 이미지 로딩 확인
- [ ] 마크다운 스타일 확인

---

## Phase 10: 테스트 및 배포

> 예상 시간: 30분

### 10.1 기능 테스트

- [ ] 홈페이지 → 블로그 네비게이션
- [ ] 블로그 목록 페이지
  - [ ] 포스트 카드 표시
  - [ ] 카테고리 필터 동작
  - [ ] 검색 기능 동작
- [ ] 개별 포스트 페이지
  - [ ] 본문 렌더링
  - [ ] 목차 동작
  - [ ] 공유 버튼 동작
  - [ ] 관련 포스트 표시
  - [ ] 댓글 위젯 표시
- [ ] 카테고리 페이지
- [ ] 404 페이지

### 10.2 반응형 테스트

- [ ] 모바일 (320px ~ 640px)
- [ ] 태블릿 (768px ~ 1024px)
- [ ] 데스크톱 (1280px+)

### 10.3 빌드 테스트

- [x] 프로덕션 빌드 실행
  ```bash
  npm run build
  ```
- [x] 빌드 에러 없음 확인
- [ ] 미리보기 실행
  ```bash
  npm run preview
  ```

### 10.4 배포

- [x] Vercel 계정 로그인 (또는 생성)
- [x] 프로젝트 연결
  ```bash
  npm i -g vercel
  vercel login
  vercel
  ```
- [x] 배포 완료 확인
- [x] 프로덕션 URL 테스트

### Phase 10 완료 체크
- [x] 모든 기능 정상 동작
- [x] 프로덕션 배포 완료
- [x] 라이브 URL 접속 가능

**배포 URL:** https://bujatime.vercel.app

---

## 완료 후 선택 작업

### 추가 기능 (선택)

- [ ] 다크모드 지원
- [ ] 페이지 전환 애니메이션 (framer-motion)
- [ ] 뉴스레터 구독 폼
- [ ] 인기 포스트 위젯
- [ ] 태그 페이지 (`/blog/tag/:tag`)

### SEO 개선 (선택)

- [ ] react-helmet-async로 메타태그 관리
- [ ] vite-plugin-prerender로 정적 생성
- [ ] sitemap.xml 생성
- [ ] robots.txt 추가

### 성능 최적화 (선택)

- [ ] 이미지 lazy loading
- [ ] 코드 스플리팅
- [ ] 폰트 최적화

---

## 트러블슈팅 가이드

### 자주 발생하는 문제

1. **마크다운 파일 import 에러**
   - `vite.config.ts`에 `assetsInclude: ['**/*.md']` 확인
   - import 경로가 정확한지 확인

2. **경로 별칭(@/) 인식 안됨**
   - `tsconfig.json`에 paths 설정 확인
   - `vite.config.ts`에 alias 설정 확인

3. **Tailwind Typography 스타일 적용 안됨**
   - `@tailwindcss/typography` 설치 확인
   - `tailwind.config.js`에 plugin 추가 확인
   - `prose` 클래스 적용 확인

4. **Giscus 로딩 안됨**
   - repo 이름이 정확한지 확인 (username/repo-name)
   - Discussions 활성화 확인
   - repoId, categoryId 값 확인

---

*작성일: 2026-02-02*
*프로젝트: 골든웨이브 인사이트 블로그*
