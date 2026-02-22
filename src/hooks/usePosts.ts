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

  const categories = (categoriesData as Category[]).filter(
    category => category.slug !== 'draft'
  )
  const authors = authorsData as Author[]

  useEffect(() => {
    function loadPosts() {
      try {
        const loadedPosts = (postsData as PostMeta[]).flatMap((postMeta) => {
          // slug로 마크다운 파일 탐색 (하위 폴더 무관)
          const mdEntry = Object.entries(markdownModules)
            .find(([path]) => path.endsWith(`/${postMeta.slug}.md`))
          const content = mdEntry ? mdEntry[1] : ''

          const category = categories.find(c => c.id === postMeta.categoryId)
          const author = authors.find(a => a.id === postMeta.authorId)

          if (!category || !author) {
            console.warn('Skipping invalid post metadata', {
              id: postMeta.id,
              slug: postMeta.slug,
              categoryId: postMeta.categoryId,
              authorId: postMeta.authorId,
            })
            return []
          }

          return [{
            ...postMeta,
            content,
            category,
            author,
            readingTime: calculateReadingTime(content),
          } as BlogPost]
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
    // 태그 기반 매칭: 같은 태그가 많을수록 관련성 높음
    const currentTags = new Set(currentPost.tags.map(t => t.toLowerCase()))

    const scored = posts
      .filter(post => post.id !== currentPost.id)
      .map(post => {
        const matchCount = post.tags.filter(t => currentTags.has(t.toLowerCase())).length
        const sameCategory = post.category.id === currentPost.category.id ? 1 : 0
        return { post, score: matchCount * 3 + sameCategory }
      })
      .filter(item => item.score > 0)

    // 같은 점수끼리는 랜덤 셔플
    for (let i = scored.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      if (scored[i].score === scored[j].score) {
        ;[scored[i], scored[j]] = [scored[j], scored[i]]
      }
    }

    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, limit).map(item => item.post)
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
