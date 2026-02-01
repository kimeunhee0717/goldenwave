import { useState, useMemo } from 'react'
import { usePosts } from '@/hooks/usePosts'
import Search from '@/components/blog/Search'
import FeaturedPosts from '@/components/blog/FeaturedPosts'
import BlogList from '@/components/blog/BlogList'
import CategoryFilter from '@/components/blog/CategoryFilter'
import Skeleton from '@/components/common/Skeleton'

export default function BlogListPage() {
  const { posts, categories, featuredPosts, isLoading } = usePosts()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = useMemo(() => {
    let result = posts

    if (selectedCategory) {
      result = result.filter(post => post.category.slug === selectedCategory)
    }

    return result
  }, [posts, selectedCategory])

  const nonFeaturedPosts = useMemo(() => {
    const featuredIds = new Set(featuredPosts.map(p => p.id))
    return filteredPosts.filter(post => !featuredIds.has(post.id))
  }, [filteredPosts, featuredPosts])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero 섹션 */}
      <section className="bg-gradient-to-r from-primary-600 to-indigo-700 text-white py-16 md:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              인사이트 & 노하우
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              마케팅 전략, 디지털 트렌드, 성공 사례 등
              비즈니스 성장을 위한 전문 인사이트를 제공합니다.
            </p>
            <Search posts={posts} onSearch={setSearchQuery} />
          </div>
        </div>
      </section>

      {/* 추천 포스트 섹션 */}
      {!selectedCategory && !searchQuery && featuredPosts.length > 0 && (
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">추천 포스트</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <FeaturedPosts posts={featuredPosts} />
            )}
          </div>
        </section>
      )}

      {/* 메인 콘텐츠 */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 사이드바 */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리</h3>
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </div>
            </aside>

            {/* 블로그 리스트 */}
            <main className="flex-1">
              {selectedCategory && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {categories.find(c => c.slug === selectedCategory)?.title}
                  </h2>
                  <p className="text-gray-500">
                    {categories.find(c => c.slug === selectedCategory)?.description}
                  </p>
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 space-y-3">
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : (
                <BlogList
                  posts={selectedCategory ? filteredPosts : nonFeaturedPosts}
                />
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}
