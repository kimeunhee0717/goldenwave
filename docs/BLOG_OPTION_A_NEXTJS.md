# 옵션 A: Next.js 새 프로젝트 생성

> 문서 가이드(insight-blog-dev-guide.md)를 그대로 따라가는 방식
>
> **권장 대상**: SEO가 중요한 B2B 블로그, 장기적 확장성 고려 시

---

## 1. 개요

### 1.1 접근 방식
현재 Vite + React 프로젝트를 **Next.js 14 App Router 기반**으로 완전히 새로 구축합니다. 기존 홈페이지 컴포넌트(Hero, Features, Testimonials 등)를 Next.js로 마이그레이션하고, 블로그 기능을 추가합니다.

### 1.2 최종 기술 스택
```
Framework:    Next.js 14 (App Router)
Language:     TypeScript
Styling:      Tailwind CSS + @tailwindcss/typography
CMS:          Sanity (Headless CMS)
Database:     Vercel Postgres (조회수 저장)
Comments:     Giscus (GitHub Discussions 기반)
Search:       Fuse.js (클라이언트) 또는 Algolia (서버)
Deployment:   Vercel
Analytics:    Vercel Analytics + Google Analytics 4
```

### 1.3 왜 Next.js인가?

| 기능 | Vite (CSR) | Next.js (SSR/SSG) |
|------|-----------|-------------------|
| SEO | 제한적 (JS 렌더링 후) | 완벽 지원 (서버 렌더링) |
| 초기 로딩 속도 | 느림 (JS 번들 다운로드 후) | 빠름 (HTML 즉시 전송) |
| 소셜 미리보기 | 동작 안함 | 완벽 지원 |
| 정적 생성 | 불가 | 빌드 시 HTML 생성 |
| ISR | 불가 | 60초마다 자동 갱신 |
| 이미지 최적화 | 수동 | next/image 자동 최적화 |

---

## 2. 프로젝트 구조

### 2.1 폴더 구조 (최종)
```
goldenwave-blog/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (site)/                   # 사이트 그룹 (공통 레이아웃)
│   │   │   ├── layout.tsx            # 사이트 레이아웃 (Header, Footer)
│   │   │   ├── page.tsx              # 홈페이지 (/)
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx          # 블로그 목록 (/blog)
│   │   │   │   ├── [slug]/
│   │   │   │   │   └── page.tsx      # 개별 포스트 (/blog/ai-marketing-guide)
│   │   │   │   └── category/
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx  # 카테고리별 (/blog/category/marketing)
│   │   │   ├── about/
│   │   │   │   └── page.tsx          # 회사 소개 (/about)
│   │   │   └── contact/
│   │   │       └── page.tsx          # 문의하기 (/contact)
│   │   ├── api/
│   │   │   ├── revalidate/
│   │   │   │   └── route.ts          # ISR 재검증 API
│   │   │   ├── views/
│   │   │   │   └── route.ts          # 조회수 API
│   │   │   ├── sitemap/
│   │   │   │   └── route.ts          # 사이트맵 생성
│   │   │   └── rss/
│   │   │       └── route.ts          # RSS 피드 생성
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   ├── globals.css               # 전역 스타일
│   │   └── not-found.tsx             # 404 페이지
│   │
│   ├── components/
│   │   ├── ui/                       # 공통 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Skeleton.tsx          # 로딩 스켈레톤
│   │   │
│   │   ├── home/                     # 홈페이지 전용 (기존 컴포넌트 마이그레이션)
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── ThemeGallery.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── CallToAction.tsx
│   │   │
│   │   ├── blog/                     # 블로그 전용
│   │   │   ├── BlogCard.tsx          # 블로그 카드
│   │   │   ├── BlogList.tsx          # 블로그 목록 그리드
│   │   │   ├── BlogPostContent.tsx   # 포스트 본문 렌더링
│   │   │   ├── FeaturedPosts.tsx     # 추천 포스트 섹션
│   │   │   ├── CategoryFilter.tsx    # 카테고리 필터 사이드바
│   │   │   ├── TableOfContents.tsx   # 목차 (스크롤 추적)
│   │   │   ├── RelatedPosts.tsx      # 관련 포스트
│   │   │   ├── ShareButtons.tsx      # SNS 공유 버튼
│   │   │   ├── AuthorInfo.tsx        # 작성자 정보 (작은 버전)
│   │   │   ├── AuthorBio.tsx         # 작성자 소개 (큰 버전)
│   │   │   ├── ReadingProgressBar.tsx # 읽기 진행률 바
│   │   │   ├── ViewCounter.tsx       # 조회수 표시
│   │   │   ├── ReadingTime.tsx       # 예상 읽기 시간
│   │   │   ├── Search.tsx            # 검색 컴포넌트
│   │   │   └── GiscusComments.tsx    # Giscus 댓글
│   │   │
│   │   ├── layout/                   # 레이아웃 컴포넌트
│   │   │   ├── Header.tsx            # 헤더/네비게이션
│   │   │   ├── Footer.tsx            # 푸터
│   │   │   ├── MobileMenu.tsx        # 모바일 메뉴
│   │   │   └── Sidebar.tsx           # 사이드바 래퍼
│   │   │
│   │   └── seo/                      # SEO 컴포넌트
│   │       └── StructuredData.tsx    # JSON-LD 구조화 데이터
│   │
│   ├── lib/
│   │   ├── sanity/
│   │   │   ├── client.ts             # Sanity 클라이언트 설정
│   │   │   ├── image.ts              # 이미지 URL 빌더
│   │   │   └── queries.ts            # GROQ 쿼리 모음
│   │   │
│   │   └── utils/
│   │       ├── formatDate.ts         # 날짜 포맷팅 (2024년 2월 1일)
│   │       ├── readingTime.ts        # 읽기 시간 계산
│   │       └── cn.ts                 # 클래스명 병합 유틸
│   │
│   ├── types/
│   │   ├── blog.ts                   # BlogPost, Category, Author 타입
│   │   └── sanity.ts                 # Sanity 관련 타입
│   │
│   └── hooks/
│       ├── useViews.ts               # 조회수 훅
│       ├── useScrollProgress.ts      # 스크롤 진행률 훅
│       └── useIntersectionObserver.ts # 목차 스크롤 추적
│
├── sanity-studio/                    # Sanity CMS (별도 폴더)
│   ├── schemas/
│   │   ├── blogPost.ts               # 블로그 포스트 스키마
│   │   ├── category.ts               # 카테고리 스키마
│   │   ├── author.ts                 # 작성자 스키마
│   │   ├── tag.ts                    # 태그 스키마
│   │   └── index.ts                  # 스키마 내보내기
│   ├── sanity.config.ts
│   └── package.json
│
├── public/
│   ├── images/
│   ├── favicon.ico
│   └── robots.txt
│
├── .env.local                        # 환경 변수 (git 제외)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. 상세 작업 목록

### Phase 1: 프로젝트 초기 설정 (1-2시간)

#### 1.1 Next.js 프로젝트 생성
```bash
# 프로젝트 생성
npx create-next-app@latest goldenwave-blog \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm

cd goldenwave-blog
```

#### 1.2 의존성 설치
```bash
# 핵심 의존성
pnpm add @sanity/client @sanity/image-url next-sanity groq
pnpm add @giscus/react
pnpm add fuse.js
pnpm add @portabletext/react
pnpm add date-fns
pnpm add @vercel/postgres
pnpm add framer-motion
pnpm add lucide-react

# 개발 의존성
pnpm add -D @tailwindcss/typography
pnpm add -D prettier eslint-config-prettier
```

#### 1.3 Tailwind 설정 업데이트
```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#334155',
            h2: {
              marginTop: '2em',
              marginBottom: '1em',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
          },
        },
      },
    },
  },
  plugins: [typography],
}
export default config
```

---

### Phase 2: Sanity CMS 설정 (2-3시간)

#### 2.1 Sanity 프로젝트 생성
```bash
# sanity-studio 폴더에서 진행
mkdir sanity-studio && cd sanity-studio
npx create-sanity@latest

# 선택 사항:
# - 프로젝트명: goldenwave-blog-cms
# - 템플릿: Clean project
# - TypeScript: Yes
```

#### 2.2 스키마 파일 생성

**blogPost.ts** - 블로그 포스트 스키마
```typescript
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'blogPost',
  title: '블로그 포스트',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '제목',
      type: 'string',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'URL 슬러그',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: '요약',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(200),
      description: '검색 결과 및 카드에 표시될 짧은 요약',
    }),
    defineField({
      name: 'content',
      title: '본문',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'caption', type: 'string', title: '캡션' },
            { name: 'alt', type: 'string', title: '대체 텍스트' },
          ],
        },
        {
          type: 'code',
          options: {
            language: 'javascript',
            languageAlternatives: [
              { title: 'JavaScript', value: 'javascript' },
              { title: 'TypeScript', value: 'typescript' },
              { title: 'HTML', value: 'html' },
              { title: 'CSS', value: 'css' },
              { title: 'Python', value: 'python' },
              { title: 'Bash', value: 'bash' },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'coverImage',
      title: '커버 이미지',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: '대체 텍스트' },
        { name: 'caption', type: 'string', title: '캡션' },
      ],
    }),
    defineField({
      name: 'category',
      title: '카테고리',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: '태그',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    }),
    defineField({
      name: 'author',
      title: '작성자',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: '발행일',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featured',
      title: '추천 포스트',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'metaTitle',
      title: 'SEO 제목',
      type: 'string',
      description: '검색 엔진에 표시될 제목 (비워두면 제목 사용)',
    }),
    defineField({
      name: 'metaDescription',
      title: 'SEO 설명',
      type: 'text',
      rows: 2,
      description: '검색 엔진에 표시될 설명 (비워두면 요약 사용)',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'coverImage',
    },
    prepare({ title, author, media }) {
      return {
        title,
        subtitle: `by ${author}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: '발행일 (최신순)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
})
```

**category.ts** - 카테고리 스키마
```typescript
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'category',
  title: '카테고리',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '이름',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL 슬러그',
      type: 'slug',
      options: { source: 'title' },
    }),
    defineField({
      name: 'description',
      title: '설명',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'color',
      title: '배지 색상',
      type: 'string',
      options: {
        list: [
          { title: '파랑', value: 'blue' },
          { title: '초록', value: 'green' },
          { title: '보라', value: 'purple' },
          { title: '주황', value: 'orange' },
          { title: '빨강', value: 'red' },
        ],
      },
    }),
  ],
})
```

**author.ts** - 작성자 스키마
```typescript
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'author',
  title: '작성자',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: '이름',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL 슬러그',
      type: 'slug',
      options: { source: 'name' },
    }),
    defineField({
      name: 'image',
      title: '프로필 이미지',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'role',
      title: '직책',
      type: 'string',
      description: '예: 마케팅 디렉터, AI 전문가',
    }),
    defineField({
      name: 'bio',
      title: '소개',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'social',
      title: '소셜 미디어',
      type: 'object',
      fields: [
        { name: 'linkedin', title: 'LinkedIn', type: 'url' },
        { name: 'twitter', title: 'Twitter/X', type: 'url' },
        { name: 'email', title: '이메일', type: 'string' },
      ],
    }),
  ],
})
```

#### 2.3 환경 변수 설정
```bash
# .env.local 파일 생성
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=your_write_token

# Giscus (댓글)
NEXT_PUBLIC_GISCUS_REPO=username/blog-comments
NEXT_PUBLIC_GISCUS_REPO_ID=R_kg...
NEXT_PUBLIC_GISCUS_CATEGORY=General
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_...

# 사이트 URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Vercel Postgres (조회수)
POSTGRES_URL=postgres://...
```

---

### Phase 3: 기존 컴포넌트 마이그레이션 (2-3시간)

기존 Vite 프로젝트의 컴포넌트들을 Next.js로 이전합니다.

#### 3.1 마이그레이션 대상
| 파일 | 변경 사항 |
|-----|---------|
| `Navbar.tsx` | → `Header.tsx`, Link 컴포넌트 교체 |
| `Hero.tsx` | 그대로 복사, Image 컴포넌트 교체 |
| `Features.tsx` | 그대로 복사 |
| `ThemeGallery.tsx` | Image 컴포넌트 교체 |
| `Testimonials.tsx` | 그대로 복사 |
| `CallToAction.tsx` | 그대로 복사 |
| `Footer.tsx` | Link 컴포넌트 교체 |

#### 3.2 주요 변경점
```typescript
// Vite (before)
import { Link } from 'react-router-dom'
<img src="/image.png" alt="..." />

// Next.js (after)
import Link from 'next/link'
import Image from 'next/image'
<Image src="/image.png" alt="..." width={800} height={400} />
```

---

### Phase 4: 블로그 페이지 구현 (4-6시간)

#### 4.1 블로그 목록 페이지 (`/blog`)
- Hero 섹션 (그라데이션 배경, 제목, 설명)
- 추천 포스트 섹션 (featured=true인 포스트 4개)
- 카테고리 필터 사이드바
- 블로그 카드 그리드 (페이지네이션 또는 무한 스크롤)

#### 4.2 개별 포스트 페이지 (`/blog/[slug]`)
- 읽기 진행률 바 (상단 고정)
- 포스트 헤더 (카테고리, 제목, 요약, 메타 정보)
- 커버 이미지 (캡션 포함)
- 2단 레이아웃
  - 좌측 사이드바: 목차 + 공유 버튼 (sticky)
  - 우측 본문: Portable Text 렌더링
- 태그 목록
- 작성자 소개 카드
- 관련 포스트 (같은 카테고리, 3개)
- Giscus 댓글

#### 4.3 카테고리 페이지 (`/blog/category/[id]`)
- 카테고리 정보 헤더
- 해당 카테고리 포스트만 필터링

---

### Phase 5: 추가 기능 구현 (3-4시간)

#### 5.1 댓글 시스템 (Giscus)
1. GitHub에 `blog-comments` 저장소 생성 (Public)
2. Settings > Discussions 활성화
3. giscus.app에서 설정값 복사
4. GiscusComments.tsx 컴포넌트 구현

#### 5.2 검색 기능 (Fuse.js)
- 클라이언트 사이드 검색
- 제목, 요약, 본문 검색
- 실시간 드롭다운 결과

#### 5.3 조회수 추적
- Vercel Postgres 데이터베이스
- POST /api/views - 조회수 증가
- GET /api/views?postId=xxx - 조회수 조회

#### 5.4 SEO 최적화
- 각 페이지별 Metadata export
- JSON-LD 구조화 데이터 (Article, BreadcrumbList)
- sitemap.xml 자동 생성
- RSS 피드 제공
- robots.txt

---

### Phase 6: 배포 (1시간)

```bash
# Vercel CLI 설치 및 로그인
npm i -g vercel
vercel login

# 프로젝트 연결
vercel link

# 환경 변수 설정
vercel env add NEXT_PUBLIC_SANITY_PROJECT_ID
vercel env add SANITY_API_TOKEN
# ... 나머지 변수들

# 프로덕션 배포
vercel --prod
```

---

## 4. 장단점 분석

### 장점

| 항목 | 설명 |
|-----|-----|
| **완벽한 SEO** | 서버 렌더링으로 검색 엔진 100% 인덱싱 |
| **소셜 미리보기** | 카카오톡, 페이스북 등 링크 공유 시 이미지/제목 표시 |
| **빠른 초기 로딩** | HTML 즉시 전송, JS 하이드레이션 |
| **ISR 지원** | 정적 생성 + 주기적 갱신 (DB 부하 없이 빠른 응답) |
| **이미지 최적화** | next/image 자동 WebP/AVIF 변환, lazy loading |
| **Sanity CMS** | 비개발자도 콘텐츠 관리 가능, 직관적인 에디터 |
| **확장성** | 다국어, 다크모드, 뉴스레터 등 추가 용이 |
| **문서 가이드 활용** | 기존 가이드 그대로 따라갈 수 있음 |

### 단점

| 항목 | 설명 |
|-----|-----|
| **높은 초기 작업량** | 프로젝트 재구축 필요 (약 150개 체크리스트) |
| **학습 곡선** | Next.js App Router, Sanity 학습 필요 |
| **Sanity 비용** | 무료 플랜 한계 (10,000 문서, 500K API 요청/월) |
| **복잡한 설정** | 환경 변수, 외부 서비스 연동 다수 |
| **Vercel 종속** | ISR, Postgres 등 Vercel 기능에 의존 |

---

## 5. 예상 소요 시간

| Phase | 작업 내용 | 예상 시간 |
|-------|---------|----------|
| 1 | 프로젝트 초기 설정 | 1-2시간 |
| 2 | Sanity CMS 설정 | 2-3시간 |
| 3 | 기존 컴포넌트 마이그레이션 | 2-3시간 |
| 4 | 블로그 페이지 구현 | 4-6시간 |
| 5 | 추가 기능 (댓글, 검색, 조회수) | 3-4시간 |
| 6 | 배포 및 테스트 | 1-2시간 |
| **총계** | | **13-20시간** |

---

## 6. 필요한 외부 서비스 계정

| 서비스 | 용도 | 비용 |
|-------|-----|-----|
| **Sanity** | 콘텐츠 관리 (CMS) | 무료 (제한 있음) |
| **Vercel** | 호스팅 + Postgres | 무료 (Hobby) |
| **GitHub** | 코드 저장소 + Giscus 댓글 | 무료 |
| **Google Analytics** | 트래픽 분석 (선택) | 무료 |

---

## 7. 최종 결과물

### 페이지 목록
- `/` - 홈페이지 (기존 랜딩 페이지)
- `/blog` - 블로그 목록
- `/blog/[slug]` - 개별 포스트
- `/blog/category/[id]` - 카테고리별 목록
- `/about` - 회사 소개
- `/contact` - 문의하기

### 기능 목록
- 반응형 디자인 (모바일/태블릿/데스크톱)
- 블로그 CRUD (Sanity Studio)
- 카테고리/태그 필터링
- 검색 기능
- 댓글 시스템 (GitHub 로그인)
- 조회수 추적
- 목차 (자동 생성, 스크롤 추적)
- SNS 공유 버튼
- RSS 피드
- SEO 최적화 (메타태그, JSON-LD, 사이트맵)

---

## 8. 다음 단계

옵션 A를 선택하시면:
1. 새 Next.js 프로젝트 생성
2. Phase별로 순차 진행
3. Sanity 계정 생성 및 연동
4. 기존 컴포넌트 마이그레이션
5. 블로그 기능 구현
6. Vercel 배포

---

*작성일: 2026-02-02*
*프로젝트: 골든웨이브 인사이트 블로그*
