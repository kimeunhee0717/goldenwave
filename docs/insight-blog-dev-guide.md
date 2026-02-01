# 인사이트 블로그 개발 기술 가이드
## 골든웨이브/BZTIME용 B2B 전문 블로그 구축 가이드

---

## 🎯 기술 스택 개요

```
Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS
CMS: Sanity (Headless CMS)
Database: PostgreSQL (Vercel Postgres) - 댓글/조회수용
Comments: Giscus (GitHub Discussions 기반)
Search: Algolia 또는 Fuse.js
Deployment: Vercel
Analytics: Vercel Analytics + Google Analytics 4
SEO: Next.js Metadata API + sitemap.xml + robots.txt
```

---

## 📦 1단계: 프로젝트 초기 설정

### 1.1 개발 환경 준비

**필수 설치:**
```bash
# Node.js 18+ 설치 확인
node --version

# 패키지 매니저 선택 (pnpm 권장)
npm install -g pnpm

# Git 설정
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**VS Code 확장 프로그램:**
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code: formatter
- ESLint
- TypeScript Importer

### 1.2 Next.js 프로젝트 생성

```bash
# 프로젝트 생성 (App Router 사용)
npx create-next-app@latest insight-blog --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm

cd insight-blog

# 추가 의존성 설치
pnpm add @sanity/client @sanity/image-url groq
pnpm add next-sanity
pnpm add @giscus/react
pnpm add algoliasearch instantsearch.js react-instantsearch-dom
pnpm add react-markdown remark-gfm rehype-highlight
pnpm add date-fns
pnpm add @vercel/postgres
pnpm add framer-motion  # 애니메이션용

# 개발 의존성
pnpm add -D @types/node @types/react @types/react-dom
pnpm add -D prettier eslint-config-prettier
pnpm add -D @tailwindcss/typography
```

### 1.3 폴더 구조 설정

```
insight-blog/
├── src/
│   ├── app/
│   │   ├── (site)/
│   │   │   ├── layout.tsx          # 루트 레이아웃
│   │   │   ├── page.tsx            # 홈페이지
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx        # 블로그 목록
│   │   │   │   ├── [slug]/
│   │   │   │   │   └── page.tsx    # 개별 포스트
│   │   │   │   └── category/
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx # 카테고리별 목록
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   └── contact/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── revalidate/
│   │   │   │   └── route.ts        # ISR 재검증 API
│   │   │   └── views/
│   │   │       └── route.ts        # 조회수 API
│   │   ├── layout.tsx              # 루트 레이아웃
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                     # 재사용 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Badge.tsx
│   │   ├── blog/
│   │   │   ├── BlogCard.tsx        # 블로그 카드
│   │   │   ├── BlogList.tsx        # 블로그 목록
│   │   │   ├── BlogPost.tsx        # 블로그 본문
│   │   │   ├── TableOfContents.tsx # 목차
│   │   │   ├── RelatedPosts.tsx    # 관련 글
│   │   │   └── ShareButtons.tsx    # 공유 버튼
│   │   ├── layout/
│   │   │   ├── Header.tsx          # 헤더
│   │   │   ├── Footer.tsx          # 푸터
│   │   │   ├── Navigation.tsx      # 네비게이션
│   │   │   └── Sidebar.tsx         # 사이드바
│   │   └── seo/
│   │       ├── MetaTags.tsx        # 메타 태그
│   │       └── StructuredData.tsx  # JSON-LD
│   ├── lib/
│   │   ├── sanity/
│   │   │   ├── client.ts           # Sanity 클라이언트
│   │   │   ├── queries.ts          # GROQ 쿼리
│   │   │   └── image.ts            # 이미지 URL 빌더
│   │   ├── utils/
│   │   │   ├── formatDate.ts
│   │   │   ├── generateSlug.ts
│   │   │   └── readingTime.ts
│   │   └── algolia/
│   │       └── searchClient.ts
│   ├── types/
│   │   ├── blog.ts                 # 블로그 타입 정의
│   │   └── sanity.ts               # Sanity 타입
│   └── hooks/
│       ├── useViews.ts             # 조회수 훅
│       └── useScrollProgress.ts    # 스크롤 진행률
├── sanity-studio/                  # Sanity Studio (별도 폴더)
├── public/
│   ├── images/
│   └── favicon.ico
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── sanity.config.ts
```

---

## 🔧 2단계: Sanity CMS 설정

### 2.1 Sanity 프로젝트 생성

```bash
# 별도 폴더에서 Sanity Studio 생성
mkdir sanity-studio
cd sanity-studio
npx create-sanity@latest

# 프로젝트명: insight-blog-cms
# 템플릿: Clean project with no predefined schemas
# TypeScript 선택
```

### 2.2 스키마 정의

**sanity-studio/schemas/blogPost.ts:**
```typescript
export default {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule: any) => Rule.max(200),
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
            },
          ],
        },
        { type: 'code' },
      ],
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'featured',
      title: 'Featured Post',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'metaTitle',
      title: 'Meta Title (SEO)',
      type: 'string',
      description: 'Override the default title for SEO',
    },
    {
      name: 'metaDescription',
      title: 'Meta Description (SEO)',
      type: 'text',
      rows: 2,
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'coverImage',
    },
    prepare(selection: any) {
      const { author } = selection;
      return Object.assign({}, selection, {
        subtitle: `by ${author}`,
      });
    },
  },
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
};
```

**sanity-studio/schemas/category.ts:**
```typescript
export default {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    },
    {
      name: 'color',
      title: 'Color',
      type: 'color',
    },
  ],
};
```

**sanity-studio/schemas/author.ts:**
```typescript
export default {
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'e.g., Marketing Director, AI Specialist',
    },
    {
      name: 'social',
      title: 'Social Media',
      type: 'object',
      fields: [
        { name: 'linkedin', title: 'LinkedIn', type: 'url' },
        { name: 'twitter', title: 'Twitter/X', type: 'url' },
        { name: 'email', title: 'Email', type: 'string' },
      ],
    },
  ],
};
```

**sanity-studio/schemas/index.ts:**
```typescript
import blogPost from './blogPost';
import category from './category';
import author from './author';
import tag from './tag';

export const schemaTypes = [blogPost, category, author, tag];
```

### 2.3 Next.js Sanity 클라이언트 설정

**src/lib/sanity/client.ts:**
```typescript
import { createClient } from 'next-sanity';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
  perspective: 'published',
});

// Server-side only client (for mutations)
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});
```

**.env.local:**
```bash
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=your_write_token

# Vercel Postgres (조회수 저장용)
POSTGRES_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...

# Giscus
NEXT_PUBLIC_GISCUS_REPO=username/blog-comments
NEXT_PUBLIC_GISCUS_REPO_ID=R_kg...
NEXT_PUBLIC_GISCUS_CATEGORY=General
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_...
```

---

## 📄 3단계: 블로그 페이지 구현

### 3.1 블로그 타입 정의

**src/types/blog.ts:**
```typescript
export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  content: any[]; // Portable Text
  coverImage?: {
    asset: {
      _ref: string;
      url: string;
    };
    caption?: string;
    alt?: string;
  };
  category: {
    _id: string;
    title: string;
    slug: { current: string };
  };
  tags?: {
    _id: string;
    title: string;
    slug: { current: string };
  }[];
  author: {
    _id: string;
    name: string;
    image?: {
      asset: {
        url: string;
      };
    };
    role?: string;
    bio?: any[];
  };
  publishedAt: string;
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Category {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  color?: string;
}
```

### 3.2 Sanity GROQ 쿼리

**src/lib/sanity/queries.ts:**
```typescript
import { groq } from 'next-sanity';

// 모든 블로그 포스트 (최신순)
export const allPostsQuery = groq`
  *[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    coverImage,
    "category": category->{_id, title, slug},
    "author": author->{_id, name, image},
    publishedAt,
    featured
  }
`;

// 특정 슬러그의 포스트
export const postBySlugQuery = groq`
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    content,
    coverImage,
    "category": category->{_id, title, slug},
    "tags": tags[]->{_id, title, slug},
    "author": author->{_id, name, image, role, bio},
    publishedAt,
    metaTitle,
    metaDescription
  }
`;

// 카테고리별 포스트
export const postsByCategoryQuery = groq`
  *[_type == "blogPost" && category->slug.current == $category] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    coverImage,
    "category": category->{_id, title, slug},
    "author": author->{_id, name, image},
    publishedAt
  }
`;

// 추천 포스트
export const featuredPostsQuery = groq`
  *[_type == "blogPost" && featured == true] | order(publishedAt desc)[0...4] {
    _id,
    title,
    slug,
    excerpt,
    coverImage,
    "category": category->{title, slug},
    publishedAt
  }
`;

// 관련 포스트 (같은 카테고리, 현재 포스트 제외)
export const relatedPostsQuery = groq`
  *[_type == "blogPost" && category->_id == $categoryId && _id != $currentId] | order(publishedAt desc)[0...3] {
    _id,
    title,
    slug,
    excerpt,
    coverImage,
    publishedAt
  }
`;

// 모든 카테고리
export const allCategoriesQuery = groq`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    color,
    "count": count(*[_type == "blogPost" && references(^._id)])
  }
`;
```

### 3.3 블로그 목록 페이지

**src/app/(site)/blog/page.tsx:**
```typescript
import { Metadata } from 'next';
import { client } from '@/lib/sanity/client';
import { allPostsQuery, allCategoriesQuery, featuredPostsQuery } from '@/lib/sanity/queries';
import { BlogList } from '@/components/blog/BlogList';
import { CategoryFilter } from '@/components/blog/CategoryFilter';
import { FeaturedPosts } from '@/components/blog/FeaturedPosts';
import { BlogPost, Category } from '@/types/blog';

export const metadata: Metadata = {
  title: '인사이트 & 노하우 | 골든웨이브',
  description: '마케팅 전략, 디지털 트렌드, 성공 사례 등 최신 인사이트를 제공합니다.',
  openGraph: {
    title: '인사이트 & 노하우 | 골든웨이브',
    description: '마케팅 전략, 디지털 트렌드, 성공 사례 등 최신 인사이트를 제공합니다.',
    type: 'website',
  },
};

export const revalidate = 60; // 60초마다 재검증 (ISR)

export default async function BlogPage() {
  const posts = await client.fetch<BlogPost[]>(allPostsQuery);
  const categories = await client.fetch<Category[]>(allCategoriesQuery);
  const featuredPosts = await client.fetch<BlogPost[]>(featuredPostsQuery);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            인사이트 & 노하우
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            마케팅 전략, 디지털 트렌드, 성공 사례 등 
            비즈니스 성장을 위한 전문 인사이트를 제공합니다.
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-12 container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">추천 포스트</h2>
          <FeaturedPosts posts={featuredPosts} />
        </section>
      )}

      {/* Main Content */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <CategoryFilter categories={categories} />
            </div>
          </aside>

          {/* Blog List */}
          <main className="flex-1">
            <BlogList posts={posts} />
          </main>
        </div>
      </section>
    </div>
  );
}
```

### 3.4 개별 포스트 페이지 (상세)

**src/app/(site)/blog/[slug]/page.tsx:**
```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { client } from '@/lib/sanity/client';
import { postBySlugQuery, relatedPostsQuery } from '@/lib/sanity/queries';
import { BlogPost as BlogPostType } from '@/types/blog';
import { BlogPost } from '@/components/blog/BlogPost';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { GiscusComments } from '@/components/blog/GiscusComments';
import { ViewCounter } from '@/components/blog/ViewCounter';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await client.fetch<BlogPostType>(postBySlugQuery, { slug: params.slug });
  
  if (!post) return {};

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;

  return {
    title: `${title} | 골든웨이브 블로그`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: post.coverImage ? [post.coverImage.asset.url] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.coverImage ? [post.coverImage.asset.url] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const posts = await client.fetch<{ slug: { current: string } }[]>(
    groq`*[_type == "blogPost" && defined(slug.current)] { slug }`
  );
  
  return posts.map((post) => ({
    slug: post.slug.current,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const post = await client.fetch<BlogPostType>(postBySlugQuery, { slug: params.slug });
  
  if (!post) {
    notFound();
  }

  // 관련 포스트 조회
  const relatedPosts = await client.fetch(
    relatedPostsQuery, 
    { 
      categoryId: post.category._id, 
      currentId: post._id 
    }
  );

  return (
    <article className="min-h-screen bg-white">
      {/* Progress Bar */}
      <ReadingProgressBar />

      {/* Post Header */}
      <header className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Category Badge */}
          <a 
            href={`/blog/category/${post.category.slug.current}`}
            className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4 hover:bg-blue-200 transition"
          >
            {post.category.title}
          </a>
          
          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          {/* Excerpt */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {post.excerpt}
          </p>
          
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <AuthorInfo author={post.author} />
            <span>•</span>
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
            <span>•</span>
            <ViewCounter postId={post._id} />
            <span>•</span>
            <ReadingTime content={post.content} />
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="container mx-auto px-4 max-w-4xl -mt-8">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={urlFor(post.coverImage).url()}
              alt={post.coverImage.alt || post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          {post.coverImage.caption && (
            <p className="text-center text-sm text-gray-500 mt-2">
              {post.coverImage.caption}
            </p>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          {/* Sidebar - TOC */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <TableOfContents content={post.content} />
              <ShareButtons title={post.title} url={`/blog/${post.slug.current}`} />
            </div>
          </aside>

          {/* Article Content */}
          <main className="flex-1 max-w-3xl">
            <BlogPostContent content={post.content} />
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">태그</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <a
                      key={tag._id}
                      href={`/blog/tag/${tag.slug.current}`}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition"
                    >
                      #{tag.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            <AuthorBio author={post.author} className="mt-12" />

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <RelatedPosts posts={relatedPosts} className="mt-16" />
            )}

            {/* Comments */}
            <section className="mt-16 pt-16 border-t border-gray-200">
              <h2 className="text-2xl font-bold mb-8">댓글</h2>
              <GiscusComments />
            </section>
          </main>
        </div>
      </div>
    </article>
  );
}
```

---

## 💬 4단계: 댓글 시스템 (Giscus) 구현

### 4.1 Giscus 설정

1. **GitHub Repository 생성**: `blog-comments` 이름으로 생성
2. **Discussions 활성화**: Repo Settings > General > Discussions 체크
3. **Giscus 설치**: [giscus.app](https://giscus.app) 접속 후 repo 연결
4. **환경 변수**에 repo ID, category ID 복사

### 4.2 Giscus 컴포넌트

**src/components/blog/GiscusComments.tsx:**
```typescript
'use client';

import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';

export function GiscusComments() {
  const { theme } = useTheme();

  return (
    <Giscus
      repo={process.env.NEXT_PUBLIC_GISCUS_REPO!}
      repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID!}
      category={process.env.NEXT_PUBLIC_GISCUS_CATEGORY!}
      categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID!}
      mapping="pathname" // URL 경로별로 Discussion 생성
      term="Welcome to @giscus/react component!"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={theme === 'dark' ? 'dark' : 'light'}
      lang="ko"
      loading="lazy"
    />
  );
}
```

**장점:**
- 완전 무료
- GitHub 계정으로 댓글 작성 (스팸 방지)
- 마크다운 지원
- 알림 기능
- SEO에 영향 없음

---

## 🔍 5단계: 검색 기능 구현

### 5.1 클라이언트 사이드 검색 (Fuse.js)

**src/components/blog/Search.tsx:**
```typescript
'use client';

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { BlogPost } from '@/types/blog';

interface Props {
  posts: BlogPost[];
}

export function Search({ posts }: Props) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: ['title', 'excerpt', 'content', 'author.name'],
        threshold: 0.3,
        includeScore: true,
      }),
    [posts]
  );

  const results = useMemo(() => {
    if (!query) return [];
    return fuse.search(query).map((result) => result.item);
  }, [query, fuse]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="검색어를 입력하세요..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      
      {/* 검색 결과 드롭다운 */}
      {query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
          {results.length > 0 ? (
            results.map((post) => (
              <a
                key={post._id}
                href={`/blog/${post.slug.current}`}
                className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <h4 className="font-medium text-gray-900">{post.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
              </a>
            ))
          ) : (
            <p className="px-4 py-3 text-gray-500">검색 결과가 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
}
```

### 5.2 Algolia 서버 사이드 검색 (고급)

```bash
pnpm add algoliasearch
```

**src/lib/algolia/sync.ts:** (Sanity → Algolia 동기화)
```typescript
import algoliasearch from 'algoliasearch';
import { client } from '../sanity/client';

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_API_KEY!
);

const index = client.initIndex('blog_posts');

export async function syncPostsToAlgolia() {
  const posts = await client.fetch(`
    *[_type == "blogPost"] {
      _id,
      title,
      excerpt,
      "slug": slug.current,
      "contentText": pt::text(content),
      "category": category->title,
      "author": author->name,
      publishedAt
    }
  `);

  await index.saveObjects(posts, { autoGenerateObjectIDIfNotExist: true });
}
```

---

## 📊 6단계: 조회수 추적

### 6.1 Vercel Postgres 설정

```bash
# Vercel CLI로 Postgres 생성
vercel postgres create insight-blog-db
```

**src/app/api/views/route.ts:**
```typescript
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { postId } = await request.json();
  
  try {
    // 조회수 증가
    await sql`
      INSERT INTO views (post_id, count)
      VALUES (${postId}, 1)
      ON CONFLICT (post_id)
      DO UPDATE SET count = views.count + 1
    `;
    
    // 현재 조회수 조회
    const { rows } = await sql`SELECT count FROM views WHERE post_id = ${postId}`;
    
    return NextResponse.json({ views: rows[0]?.count || 0 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update views' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');
  
  if (!postId) {
    return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
  }
  
  try {
    const { rows } = await sql`SELECT count FROM views WHERE post_id = ${postId}`;
    return NextResponse.json({ views: rows[0]?.count || 0 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch views' }, { status: 500 });
  }
}
```

**src/hooks/useViews.ts:**
```typescript
'use client';

import { useEffect, useState } from 'react';

export function useViews(postId: string) {
  const [views, setViews] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 조회수 증가
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setViews(data.views);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [postId]);

  return { views, isLoading };
}
```

---

## 🚀 7단계: 배포 및 최적화

### 7.1 Next.js 설정

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.sanity.io'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    serverActions: true,
  },
  async headers() {
    return [
      {
        source: '/blog/:slug',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/rss.xml',
        destination: '/api/rss',
      },
    ];
  },
};

module.exports = nextConfig;
```

### 7.2 Sitemap.xml 생성

**src/app/api/sitemap/route.ts:**
```typescript
import { client } from '@/lib/sanity/client';
import { MetadataRoute } from 'next';

export async function GET() {
  const posts = await client.fetch(`
    *[_type == "blogPost"] {
      "url": "/blog/" + slug.current,
      "lastModified": publishedAt,
      "priority": 0.8
    }
  `);

  const staticRoutes = [
    { url: '/', lastModified: new Date(), priority: 1.0 },
    { url: '/blog', lastModified: new Date(), priority: 0.9 },
    { url: '/about', lastModified: new Date(), priority: 0.7 },
  ];

  const allRoutes = [...staticRoutes, ...posts];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes.map((route) => `
    <url>
      <loc>${process.env.NEXT_PUBLIC_SITE_URL}${route.url}</loc>
      <lastModified>${route.lastModified}</lastModified>
      <priority>${route.priority}</priority>
    </url>
  `).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
```

### 7.3 RSS 피드 생성

**src/app/api/rss/route.ts:**
```typescript
import { client } from '@/lib/sanity/client';

export async function GET() {
  const posts = await client.fetch(`
    *[_type == "blogPost"] | order(publishedAt desc) [0...20] {
      title,
      excerpt,
      "slug": slug.current,
      "author": author->name,
      publishedAt
    }
  `);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>골든웨이브 인사이트</title>
    <link>${process.env.NEXT_PUBLIC_SITE_URL}</link>
    <description>마케팅 전략, 디지털 트렌드, 성공 사례</description>
    <language>ko</language>
    <atom:link href="${process.env.NEXT_PUBLIC_SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts.map((post) => `
      <item>
        <title>${post.title}</title>
        <link>${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}</link>
        <guid>${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}</guid>
        <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
        <author>${post.author}</author>
        <description>${post.excerpt}</description>
      </item>
    `).join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
```

### 7.4 Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 프로젝트 연결
vercel link

# 환경 변수 설정
vercel env add NEXT_PUBLIC_SANITY_PROJECT_ID
vercel env add SANITY_API_TOKEN
vercel env add POSTGRES_URL
vercel env add NEXT_PUBLIC_GISCUS_REPO

# 배포
vercel --prod
```

---

## 🎨 8단계: UI/UX 컴포넌트

### 8.1 블로그 카드 컴포넌트

**src/components/blog/BlogCard.tsx:**
```typescript
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/types/blog';
import { urlFor } from '@/lib/sanity/image';
import { formatDate } from '@/lib/utils/formatDate';

interface Props {
  post: BlogPost;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: Props) {
  return (
    <article className={`group ${featured ? 'md:col-span-2' : ''}`}>
      <Link href={`/blog/${post.slug.current}`} className="block">
        <div className={`relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-shadow duration-300 ${featured ? 'md:flex' : ''}`}>
          {/* Image */}
          {post.coverImage && (
            <div className={`relative overflow-hidden ${featured ? 'md:w-1/2 aspect-[4/3]' : 'aspect-video'}`}>
              <Image
                src={urlFor(post.coverImage).width(800).height(450).url()}
                alt={post.coverImage.alt || post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full mb-3">
              {post.category.title}
            </span>
            
            <h3 className={`font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors ${featured ? 'text-2xl' : 'text-lg'}`}>
              {post.title}
            </h3>
            
            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
              {post.excerpt}
            </p>
            
            <div className="flex items-center text-sm text-gray-500">
              <span>{post.author.name}</span>
              <span className="mx-2">•</span>
              <time>{formatDate(post.publishedAt)}</time>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
```

### 8.2 목차 (Table of Contents)

**src/components/blog/TableOfContents.tsx:**
```typescript
'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // H2, H3 추출
    const elements = document.querySelectorAll('h2, h3');
    const headingsList = Array.from(elements).map((el) => ({
      id: el.id,
      text: el.textContent || '',
      level: el.tagName === 'H2' ? 2 : 3,
    }));
    setHeadings(headingsList);

    // Intersection Observer로 현재 섹션 추적
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -35% 0%' }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="bg-gray-50 rounded-xl p-6">
      <h3 className="font-bold text-gray-900 mb-4">목차</h3>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`block text-sm transition-colors hover:text-blue-600 ${
                heading.level === 3 ? 'pl-4' : ''
              } ${
                activeId === heading.id ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

---

## 📈 9단계: 성능 최적화

### 9.1 이미지 최적화

```typescript
// Sanity 이미지 URL 빌더
import imageUrlBuilder from '@sanity/image-url';
import { client } from './client';

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

// 사용 예시
<Image
  src={urlFor(post.coverImage)
    .width(800)
    .height(450)
    .format('webp')
    .quality(80)
    .url()}
  alt={post.title}
  width={800}
  height={450}
  loading="lazy"
/>
```

### 9.2 ISR (Incremental Static Regeneration)

```typescript
// 페이지별 재생성 설정
export const revalidate = 60; // 60초마다 재검증

// 수동 재검증 API
// src/app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const { path, token } = await request.json();
  
  if (token !== process.env.REVALIDATE_TOKEN) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
  
  try {
    revalidatePath(path);
    return Response.json({ revalidated: true });
  } catch (err) {
    return Response.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
```

---

## 📋 개발 체크리스트

### ✅ 필수 기능
- [ ] Next.js 14 + App Router 설정
- [ ] Sanity CMS 연동
- [ ] 블로그 목록/상세 페이지 구현
- [ ] Giscus 댓글 시스템 연동
- [ ] 반응형 디자인 (모바일/태블릿/데스크톱)
- [ ] SEO 메타 태그 + JSON-LD
- [ ] Sitemap.xml 자동 생성
- [ ] RSS 피드 제공

### ✅ 추가 기능
- [ ] 검색 기능 (Fuse.js 또는 Algolia)
- [ ] 조회수 추적 (Vercel Postgres)
- [ ] 카테고리/태그 필터링
- [ ] 관련 포스트 추천
- [ ] 목차 (Table of Contents)
- [ ] 공유 버튼 (SNS)
- [ ] 다크모드 지원
- [ ] 페이지 로딩 애니메이션

### ✅ 성능 최적화
- [ ] 이미지 WebP 포맷 + lazy loading
- [ ] ISR 설정
- [ ] 폰트 최적화 (next/font)
- [ ] Vercel Analytics 설정

---

## 🚀 빠른 시작 템플릿

**GitHub Repo**: `https://github.com/yourusername/insight-blog`

**1-click Deploy:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/insight-blog)

---

**참고 문서:**
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Sanity Docs](https://www.sanity.io/docs)
- [Giscus Guide](https://giscus.app)
- [Tailwind CSS](https://tailwindcss.com)

**추가 질문은 언제든 문의하세요!**
