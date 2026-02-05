import { useState, useMemo } from 'react'
import { usePosts } from '@/hooks/usePosts'
import CategoryTabs from './CategoryTabs'
import BriefingCard from './BriefingCard'
import Skeleton from '@/components/common/Skeleton'

const POSTS_PER_PAGE = 10

export default function BriefingFeed() {
  const { posts, categories, isLoading } = usePosts()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE)

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return posts
    return posts.filter(p => p.category.slug === selectedCategory)
  }, [posts, selectedCategory])

  const visiblePosts = filteredPosts.slice(0, visibleCount)
  const hasMore = visibleCount < filteredPosts.length

  const handleCategoryChange = (slug: string | null) => {
    setSelectedCategory(slug)
    setVisibleCount(POSTS_PER_PAGE)
  }

  return (
    <>
      <CategoryTabs
        categories={categories}
        selected={selectedCategory}
        onSelect={handleCategoryChange}
      />
      <section className="py-8 bg-cream-100">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-6 p-5 bg-white rounded-2xl">
                  <Skeleton className="w-64 h-40 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-3 py-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {visiblePosts.map(post => (
                  <BriefingCard key={post.id} post={post} />
                ))}
              </div>
              {visiblePosts.length === 0 && (
                <div className="py-20 text-center text-soot-400">
                  이 카테고리에는 아직 포스트가 없습니다.
                </div>
              )}
              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setVisibleCount(prev => prev + POSTS_PER_PAGE)}
                    className="px-8 py-3 bg-white border border-slate-200 rounded-full text-sm font-semibold text-soot-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                  >
                    더 보기 ({filteredPosts.length - visibleCount}개 남음)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
