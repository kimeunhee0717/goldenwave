import { useState, useEffect, useMemo } from 'react'
import { BlogPost, Category, Author, PostMeta } from '@/types/blog'
import { calculateReadingTime } from '@/lib/readingTime'
import postsData from '@/data/posts.json'
import categoriesData from '@/data/categories.json'
import authorsData from '@/data/authors.json'

// 마크다운 파일들을 동적으로 import
const markdownModules = import.meta.glob('@/data/posts/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

export function usePosts() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const categories = categoriesData as Category[]
  const authors = authorsData as Author[]

  useEffect(() => {
    function loadPosts() {
      try {
        const loadedPosts = (postsData as PostMeta[]).map((postMeta) => {
          // slug로 마크다운 파일 탐색 (하위 폴더 무관)
          const mdEntry = Object.entries(markdownModules)
            .find(([path]) => path.endsWith(`/${postMeta.slug}.md`))
          const content = mdEntry ? mdEntry[1] : ''

          const category = categories.find(c => c.id === postMeta.categoryId)!
          const author = authors.find(a => a.id === postMeta.authorId)!

          return {
            ...postMeta,
            content,
            category,
            author,
            readingTime: calculateReadingTime(content),
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
