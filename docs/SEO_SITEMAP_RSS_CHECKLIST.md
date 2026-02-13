# SEO / Sitemap / RSS 개선 태스크 체크리스트

> 작성일: 2026-02-14
> 완료일: 2026-02-14
> 목적: Client-Side SPA 구조에서 크롤러 수집 최적화
> 현황: React + Vite CSR, 블로그 112개, 도구 26개, 정적 페이지 7개

---

## Phase 1. 동적 Meta 태그 (React 19 네이티브 + SEOHead 컴포넌트)

> **참고**: react-helmet-async는 React 19와 호환되지 않아 React 19 네이티브 방식으로 전환.
> CSR에서 `<meta>` 호이스팅이 불완전하므로, Phase 4의 프리렌더 스크립트에서 직접 meta 태그를 주입.

- [x] **1-1. SEOHead 공통 컴포넌트 생성**
  - `src/components/common/SEOHead.tsx`
  - React 19 네이티브 `<title>`, `<meta>`, `<link>` 사용

- [x] **1-2. 블로그 포스트 페이지에 SEOHead 적용**
  - `src/pages/BlogPostPage.tsx`

- [x] **1-3. 블로그 목록 페이지에 SEOHead 적용**
  - `src/pages/BlogListPage.tsx`

- [x] **1-4. 카테고리 페이지에 SEOHead 적용**
  - `src/pages/CategoryPage.tsx`

- [x] **1-5. 도구 페이지 26개에 SEOHead 일괄 적용**
  - 자동 삽입 스크립트로 26개 도구 페이지에 적용 완료

- [x] **1-6. 정적 페이지에 SEOHead 적용**
  - HomePage, ToolsPage, AboutPage, ContactPage, PrivacyPolicyPage, TermsPage

- [x] **1-7. index.html에 RSS autodiscovery 링크 추가**

---

## Phase 2. Sitemap 자동 생성 빌드 스크립트

- [x] **2-1. sitemap 생성 스크립트 작성**
  - `scripts/generate-sitemap.ts`
  - posts.json (112개) + categories.json (6개) + 정적 페이지 + 도구 = 총 151개 URL
  - `<lastmod>`, `<changefreq>`, `<priority>` 포함

- [x] **2-2. package.json prebuild 연동**
  - `"prebuild": "npx tsx scripts/generate-sitemap.ts && npx tsx scripts/generate-rss.ts"`

- [x] **2-3. 기존 수동 sitemap.xml 대체**

---

## Phase 3. RSS 자동 생성 빌드 스크립트

- [x] **3-1. RSS 생성 스크립트 작성**
  - `scripts/generate-rss.ts`
  - 전체 112개 포스트 수록 (기존 20개 → 112개)
  - RSS 2.0 표준 + atom:link self 포함

- [x] **3-2. prebuild 연동** (Phase 2와 함께)

- [x] **3-3. 기존 수동 rss.xml 대체**

---

## Phase 4. Prerendering (Puppeteer 기반 HTML 사전 생성)

> **참고**: vite-plugin-prerender는 ESM 호환성 문제로 사용 불가.
> Puppeteer 기반 커스텀 프리렌더 스크립트로 대체.

- [x] **4-1. Puppeteer 설치 및 프리렌더 스크립트 작성**
  - `scripts/prerender.ts`
  - 외부 리소스(광고, 폰트, giscus) 차단으로 안정성 확보
  - SEO 메타 태그를 스크립트에서 직접 HTML에 주입 (React 19 CSR 한계 보완)
  - JSON-LD 구조화 데이터 포함

- [x] **4-2. postbuild 연동**
  - `"postbuild": "npx tsx scripts/prerender.ts"`

- [x] **4-3. 빌드 테스트 및 검증**
  - 151개 라우트 중 149개 성공 (2개는 google-analytics 관련 포스트 — 콘텐츠 내 외부 스크립트 이슈)

---

## Phase 5. 검증 및 마무리

- [x] **5-1. 빌드 성공 확인** — `npm run build` 에러 없이 완료
- [x] **5-2. 프리렌더 결과 검증**
  - 각 페이지별 고유 title, description, og:title, canonical 확인
  - 본문 콘텐츠가 HTML에 포함되어 크롤러가 JS 없이도 읽기 가능
- [x] **5-3. robots.txt 업데이트** — admin 경로 Disallow 추가
- [x] **5-4. 임시 스크립트 정리** — debug, helper 스크립트 삭제

---

## 빌드 파이프라인 요약

```
npm run build
  ├── prebuild:  generate-sitemap.ts → public/sitemap.xml (151 URLs)
  ├── prebuild:  generate-rss.ts     → public/rss.xml (112 posts)
  ├── build:     vite build          → dist/ (SPA 번들)
  └── postbuild: prerender.ts        → dist/***/index.html (149 prerendered HTMLs)
```

## 생성된 파일 목록

| 파일 | 용도 |
|------|------|
| `src/components/common/SEOHead.tsx` | SEO 메타 태그 공통 컴포넌트 |
| `scripts/generate-sitemap.ts` | sitemap.xml 자동 생성 |
| `scripts/generate-rss.ts` | rss.xml 자동 생성 |
| `scripts/prerender.ts` | Puppeteer 기반 프리렌더링 + meta 태그 주입 |
