# 인사이트 블로그 개발 체크리스트

> 골든웨이브/BZTIME용 B2B 전문 블로그 구축 작업 목록
>
> **기술 스택:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Sanity CMS + Giscus

---

## Phase 1: 프로젝트 초기 설정

### 1.1 개발 환경 준비
- [ ] Node.js 18+ 설치 확인 (`node --version`)
- [ ] pnpm 글로벌 설치 (`npm install -g pnpm`)
- [ ] VS Code 확장 프로그램 설치
  - [ ] ES7+ React/Redux/React-Native snippets
  - [ ] Tailwind CSS IntelliSense
  - [ ] Prettier - Code formatter
  - [ ] ESLint
  - [ ] TypeScript Importer

### 1.2 Next.js 프로젝트 생성
- [ ] 프로젝트 생성
  ```bash
  npx create-next-app@latest insight-blog --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
  ```
- [ ] 추가 의존성 설치
  ```bash
  pnpm add @sanity/client @sanity/image-url next-sanity groq
  pnpm add @giscus/react
  pnpm add fuse.js
  pnpm add react-markdown remark-gfm rehype-highlight
  pnpm add date-fns
  pnpm add @vercel/postgres
  pnpm add framer-motion
  ```
- [ ] 개발 의존성 설치
  ```bash
  pnpm add -D @tailwindcss/typography
  pnpm add -D prettier eslint-config-prettier
  ```

### 1.3 폴더 구조 생성
- [ ] `src/app/(site)/` - 사이트 페이지들
- [ ] `src/app/(site)/blog/` - 블로그 목록
- [ ] `src/app/(site)/blog/[slug]/` - 개별 포스트
- [ ] `src/app/(site)/blog/category/[id]/` - 카테고리별
- [ ] `src/app/(site)/about/` - 회사 소개
- [ ] `src/app/(site)/contact/` - 문의하기
- [ ] `src/app/api/revalidate/` - ISR 재검증 API
- [ ] `src/app/api/views/` - 조회수 API
- [ ] `src/components/ui/` - 재사용 UI 컴포넌트
- [ ] `src/components/blog/` - 블로그 관련 컴포넌트
- [ ] `src/components/layout/` - 레이아웃 컴포넌트
- [ ] `src/components/seo/` - SEO 컴포넌트
- [ ] `src/lib/sanity/` - Sanity 클라이언트
- [ ] `src/lib/utils/` - 유틸리티 함수
- [ ] `src/lib/algolia/` - Algolia 검색 (선택)
- [ ] `src/types/` - TypeScript 타입 정의
- [ ] `src/hooks/` - 커스텀 훅

---

## Phase 2: Sanity CMS 설정

### 2.1 Sanity 프로젝트 생성
- [ ] sanity-studio 폴더 생성
  ```bash
  mkdir sanity-studio && cd sanity-studio
  npx create-sanity@latest
  ```
- [ ] 프로젝트명: `insight-blog-cms`
- [ ] 템플릿: Clean project with no predefined schemas
- [ ] TypeScript 선택

### 2.2 스키마 정의
- [ ] `sanity-studio/schemas/blogPost.ts` 생성
  - [ ] title (string, required)
  - [ ] slug (slug, required)
  - [ ] excerpt (text, max 200)
  - [ ] content (array of blocks, images, code)
  - [ ] coverImage (image with hotspot)
  - [ ] category (reference, required)
  - [ ] tags (array of references)
  - [ ] author (reference, required)
  - [ ] publishedAt (datetime, required)
  - [ ] featured (boolean)
  - [ ] metaTitle (string, SEO)
  - [ ] metaDescription (text, SEO)
- [ ] `sanity-studio/schemas/category.ts` 생성
  - [ ] title (string, required)
  - [ ] slug (slug)
  - [ ] description (text)
  - [ ] color (color)
- [ ] `sanity-studio/schemas/author.ts` 생성
  - [ ] name (string)
  - [ ] slug (slug)
  - [ ] image (image)
  - [ ] bio (array of blocks)
  - [ ] role (string)
  - [ ] social (object: linkedin, twitter, email)
- [ ] `sanity-studio/schemas/tag.ts` 생성
  - [ ] title (string)
  - [ ] slug (slug)
- [ ] `sanity-studio/schemas/index.ts` 스키마 내보내기

### 2.3 Sanity 클라이언트 설정
- [ ] `src/lib/sanity/client.ts` 생성
  - [ ] read client (CDN 사용)
  - [ ] write client (토큰 사용)
- [ ] `src/lib/sanity/image.ts` 이미지 URL 빌더
- [ ] `src/lib/sanity/queries.ts` GROQ 쿼리 작성

### 2.4 환경 변수 설정
- [ ] `.env.local` 파일 생성
  ```bash
  NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
  NEXT_PUBLIC_SANITY_DATASET=production
  NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
  SANITY_API_TOKEN=your_write_token
  ```

---

## Phase 3: 블로그 페이지 구현

### 3.1 타입 정의
- [ ] `src/types/blog.ts` 생성
  - [ ] BlogPost 인터페이스
  - [ ] Category 인터페이스
  - [ ] Author 인터페이스
  - [ ] Tag 인터페이스

### 3.2 GROQ 쿼리 작성
- [ ] `src/lib/sanity/queries.ts`
  - [ ] `allPostsQuery` - 모든 포스트 (최신순)
  - [ ] `postBySlugQuery` - 특정 슬러그 포스트 (상세)
  - [ ] `postsByCategoryQuery` - 카테고리별 포스트
  - [ ] `featuredPostsQuery` - 추천 포스트 (최대 4개)
  - [ ] `relatedPostsQuery` - 관련 포스트 (같은 카테고리, 최대 3개)
  - [ ] `allCategoriesQuery` - 모든 카테고리 (포스트 수 포함)
  - [ ] `allTagsQuery` - 모든 태그

### 3.3 블로그 목록 페이지
- [ ] `src/app/(site)/blog/page.tsx`
  - [ ] Metadata 설정 (SEO)
  - [ ] ISR 설정 (`revalidate = 60`)
  - [ ] Hero 섹션 (그라데이션 배경, 제목, 설명)
  - [ ] 추천 포스트 섹션 (FeaturedPosts 컴포넌트)
  - [ ] 메인 콘텐츠 영역
    - [ ] 사이드바 (카테고리 필터)
    - [ ] 블로그 리스트 (BlogList 컴포넌트)

### 3.4 개별 포스트 페이지
- [ ] `src/app/(site)/blog/[slug]/page.tsx`
  - [ ] `generateMetadata` 함수 (동적 SEO)
  - [ ] `generateStaticParams` 함수 (정적 생성)
  - [ ] 읽기 진행률 바 (ReadingProgressBar)
  - [ ] 포스트 헤더
    - [ ] 카테고리 배지
    - [ ] 제목 (h1)
    - [ ] 요약 (excerpt)
    - [ ] 메타 정보 (작성자, 날짜, 조회수, 읽기 시간)
  - [ ] 커버 이미지 (캡션 포함)
  - [ ] 메인 콘텐츠 영역
    - [ ] 사이드바 (목차 + 공유 버튼)
    - [ ] 본문 (BlogPostContent)
    - [ ] 태그 목록
    - [ ] 작성자 소개 (AuthorBio)
    - [ ] 관련 포스트 (RelatedPosts)
    - [ ] 댓글 섹션 (GiscusComments)

### 3.5 카테고리별 목록 페이지
- [ ] `src/app/(site)/blog/category/[id]/page.tsx`
  - [ ] 카테고리 정보 표시
  - [ ] 해당 카테고리 포스트 목록

---

## Phase 4: UI 컴포넌트 구현

### 4.1 블로그 컴포넌트
- [ ] `src/components/blog/BlogCard.tsx`
  - [ ] 커버 이미지 (hover 확대 효과)
  - [ ] 카테고리 배지
  - [ ] 제목, 요약
  - [ ] 작성자, 날짜
  - [ ] featured 옵션 (큰 카드)
- [ ] `src/components/blog/BlogList.tsx`
  - [ ] 그리드 레이아웃
  - [ ] 페이지네이션 또는 무한 스크롤
- [ ] `src/components/blog/FeaturedPosts.tsx`
  - [ ] 추천 포스트 캐러셀 또는 그리드
- [ ] `src/components/blog/CategoryFilter.tsx`
  - [ ] 카테고리 목록 (포스트 수 표시)
  - [ ] 선택된 카테고리 하이라이트
- [ ] `src/components/blog/BlogPostContent.tsx`
  - [ ] Portable Text 렌더링
  - [ ] 코드 블록 하이라이팅
  - [ ] 이미지 캡션
- [ ] `src/components/blog/TableOfContents.tsx`
  - [ ] H2, H3 추출
  - [ ] Intersection Observer로 현재 섹션 추적
  - [ ] 클릭 시 스크롤
- [ ] `src/components/blog/RelatedPosts.tsx`
  - [ ] 관련 포스트 카드 (3개)
- [ ] `src/components/blog/ShareButtons.tsx`
  - [ ] 트위터, 페이스북, 링크드인, 링크 복사
- [ ] `src/components/blog/AuthorInfo.tsx`
  - [ ] 작성자 아바타, 이름 (작은 버전)
- [ ] `src/components/blog/AuthorBio.tsx`
  - [ ] 작성자 상세 소개 (큰 버전)
  - [ ] 소셜 링크
- [ ] `src/components/blog/ReadingProgressBar.tsx`
  - [ ] 스크롤 진행률 표시 (상단 고정)
- [ ] `src/components/blog/ViewCounter.tsx`
  - [ ] 조회수 표시 (useViews 훅 사용)
- [ ] `src/components/blog/ReadingTime.tsx`
  - [ ] 예상 읽기 시간 계산

### 4.2 레이아웃 컴포넌트
- [ ] `src/components/layout/Header.tsx`
  - [ ] 로고
  - [ ] 네비게이션 메뉴
  - [ ] 검색 버튼
  - [ ] CTA 버튼
  - [ ] 모바일 메뉴
- [ ] `src/components/layout/Footer.tsx`
  - [ ] 브랜드 정보
  - [ ] 링크 섹션
  - [ ] 소셜 미디어
  - [ ] 저작권
- [ ] `src/components/layout/Navigation.tsx`
  - [ ] 메뉴 항목
  - [ ] 활성 상태 표시
- [ ] `src/components/layout/Sidebar.tsx`
  - [ ] sticky 포지션
  - [ ] 콘텐츠 슬롯

### 4.3 공통 UI 컴포넌트
- [ ] `src/components/ui/Button.tsx`
- [ ] `src/components/ui/Card.tsx`
- [ ] `src/components/ui/Input.tsx`
- [ ] `src/components/ui/Badge.tsx`
- [ ] `src/components/ui/Skeleton.tsx` (로딩 상태)

---

## Phase 5: 댓글 시스템 (Giscus)

### 5.1 GitHub 설정
- [ ] GitHub에 `blog-comments` 저장소 생성 (Public)
- [ ] Repository Settings → Features → Discussions 활성화
- [ ] [giscus.app](https://giscus.app) 접속
  - [ ] 저장소 연결
  - [ ] Discussion 카테고리 선택 (General 권장)
  - [ ] 설정 값 복사

### 5.2 환경 변수 추가
```bash
NEXT_PUBLIC_GISCUS_REPO=username/blog-comments
NEXT_PUBLIC_GISCUS_REPO_ID=R_kg...
NEXT_PUBLIC_GISCUS_CATEGORY=General
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_...
```

### 5.3 컴포넌트 구현
- [ ] `src/components/blog/GiscusComments.tsx`
  - [ ] @giscus/react 사용
  - [ ] 다크모드 테마 연동
  - [ ] 한국어 설정
  - [ ] lazy loading

---

## Phase 6: 검색 기능

### 6.1 Fuse.js 클라이언트 검색
- [ ] `fuse.js` 설치 확인
- [ ] `src/components/blog/Search.tsx` 구현
  - [ ] 검색 입력 필드
  - [ ] Fuse 인스턴스 생성 (title, excerpt, content 검색)
  - [ ] 실시간 검색 결과 드롭다운
  - [ ] 검색 결과 없음 메시지
  - [ ] 키보드 네비게이션 (선택)

### 6.2 (선택) Algolia 서버 검색
- [ ] Algolia 계정 생성
- [ ] 환경 변수 추가
  ```bash
  ALGOLIA_APP_ID=your_app_id
  ALGOLIA_API_KEY=your_api_key
  ALGOLIA_INDEX_NAME=blog_posts
  ```
- [ ] `src/lib/algolia/sync.ts` 동기화 스크립트
- [ ] Sanity Webhook → Algolia 자동 동기화

---

## Phase 7: 조회수 추적

### 7.1 Vercel Postgres 설정
- [ ] Vercel 대시보드에서 Postgres 생성
  ```bash
  vercel postgres create insight-blog-db
  ```
- [ ] 환경 변수 자동 추가 확인
  ```bash
  POSTGRES_URL=postgres://...
  POSTGRES_URL_NON_POOLING=postgres://...
  ```
- [ ] views 테이블 생성
  ```sql
  CREATE TABLE views (
    post_id VARCHAR(255) PRIMARY KEY,
    count INTEGER DEFAULT 0
  );
  ```

### 7.2 API 구현
- [ ] `src/app/api/views/route.ts`
  - [ ] POST: 조회수 증가 (UPSERT)
  - [ ] GET: 조회수 조회

### 7.3 훅 구현
- [ ] `src/hooks/useViews.ts`
  - [ ] 페이지 로드 시 조회수 증가
  - [ ] 현재 조회수 반환
  - [ ] 로딩 상태 관리

---

## Phase 8: SEO & 피드

### 8.1 메타데이터 설정
- [ ] 각 페이지별 Metadata export
  - [ ] title, description
  - [ ] openGraph (title, description, type, images)
  - [ ] twitter (card, title, description, images)
- [ ] `src/components/seo/StructuredData.tsx`
  - [ ] Article JSON-LD
  - [ ] BreadcrumbList JSON-LD
  - [ ] Organization JSON-LD

### 8.2 Sitemap 생성
- [ ] `src/app/api/sitemap/route.ts`
  - [ ] 정적 페이지 (/, /blog, /about 등)
  - [ ] 동적 페이지 (모든 블로그 포스트)
  - [ ] lastModified, priority 설정

### 8.3 RSS 피드 생성
- [ ] `src/app/api/rss/route.ts`
  - [ ] 최신 포스트 20개
  - [ ] RSS 2.0 포맷
  - [ ] Atom 링크 포함

### 8.4 next.config.js 설정
- [ ] rewrites 설정
  ```javascript
  async rewrites() {
    return [
      { source: '/sitemap.xml', destination: '/api/sitemap' },
      { source: '/rss.xml', destination: '/api/rss' },
    ];
  }
  ```

### 8.5 robots.txt
- [ ] `public/robots.txt` 생성
  ```
  User-agent: *
  Allow: /
  Sitemap: https://yourdomain.com/sitemap.xml
  ```

---

## Phase 9: 배포 및 최적화

### 9.1 Next.js 설정
- [ ] `next.config.js` 업데이트
  - [ ] images.domains: ['cdn.sanity.io']
  - [ ] images.formats: ['image/webp', 'image/avif']
  - [ ] headers (Cache-Control)

### 9.2 성능 최적화
- [ ] 이미지 최적화
  - [ ] Sanity 이미지 URL 빌더로 WebP 포맷
  - [ ] width, height 지정
  - [ ] lazy loading (priority 제외)
- [ ] ISR 설정
  - [ ] 목록 페이지: `revalidate = 60`
  - [ ] 상세 페이지: `revalidate = 60`
- [ ] 폰트 최적화
  - [ ] `next/font` 사용
  - [ ] subset 지정

### 9.3 Vercel 배포
- [ ] Vercel 로그인 (`vercel login`)
- [ ] 프로젝트 연결 (`vercel link`)
- [ ] 환경 변수 설정
  ```bash
  vercel env add NEXT_PUBLIC_SANITY_PROJECT_ID
  vercel env add SANITY_API_TOKEN
  vercel env add NEXT_PUBLIC_GISCUS_REPO
  vercel env add NEXT_PUBLIC_GISCUS_REPO_ID
  vercel env add NEXT_PUBLIC_GISCUS_CATEGORY
  vercel env add NEXT_PUBLIC_GISCUS_CATEGORY_ID
  vercel env add NEXT_PUBLIC_SITE_URL
  ```
- [ ] 프로덕션 배포 (`vercel --prod`)
- [ ] 커스텀 도메인 연결 (선택)

### 9.4 모니터링
- [ ] Vercel Analytics 활성화
- [ ] Google Analytics 4 연동 (선택)
- [ ] Sentry 에러 트래킹 (선택)

---

## Phase 10: 추가 기능 (선택)

### 10.1 다크모드
- [ ] `next-themes` 설치
- [ ] ThemeProvider 설정
- [ ] 다크모드 토글 버튼
- [ ] Tailwind dark: 클래스 적용

### 10.2 애니메이션
- [ ] `framer-motion` 설치 확인
- [ ] 페이지 전환 애니메이션
- [ ] 카드 호버 애니메이션
- [ ] 스크롤 reveal 애니메이션

### 10.3 추가 위젯
- [ ] 인기 포스트 위젯
- [ ] 태그 클라우드
- [ ] 뉴스레터 구독 폼
- [ ] 최근 댓글 위젯

### 10.4 관리 기능
- [ ] Sanity Studio 커스터마이징
- [ ] 미리보기 기능 (draft)
- [ ] Webhook 설정 (ISR 트리거)

---

## 유틸리티 함수

### 필수 구현
- [ ] `src/lib/utils/formatDate.ts` - 날짜 포맷팅
- [ ] `src/lib/utils/readingTime.ts` - 읽기 시간 계산
- [ ] `src/lib/utils/generateSlug.ts` - 슬러그 생성

---

## 체크리스트 요약

| Phase | 작업 항목 수 | 상태 |
|-------|-------------|------|
| Phase 1: 프로젝트 초기 설정 | 15개 | ⬜ |
| Phase 2: Sanity CMS 설정 | 20개 | ⬜ |
| Phase 3: 블로그 페이지 구현 | 25개 | ⬜ |
| Phase 4: UI 컴포넌트 구현 | 30개 | ⬜ |
| Phase 5: 댓글 시스템 | 8개 | ⬜ |
| Phase 6: 검색 기능 | 6개 | ⬜ |
| Phase 7: 조회수 추적 | 6개 | ⬜ |
| Phase 8: SEO & 피드 | 12개 | ⬜ |
| Phase 9: 배포 및 최적화 | 15개 | ⬜ |
| Phase 10: 추가 기능 (선택) | 12개 | ⬜ |
| **총계** | **약 150개** | |

---

## 참고 문서

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Giscus Setup Guide](https://giscus.app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

---

*생성일: 2026-02-01*
*프로젝트: 골든웨이브 인사이트 블로그*
