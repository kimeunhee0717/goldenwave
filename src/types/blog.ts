// 카테고리 타입
export interface Category {
  id: string
  title: string
  slug: string
  description?: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal'
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
