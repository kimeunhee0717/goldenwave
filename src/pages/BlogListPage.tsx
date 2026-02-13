import { useState, useMemo } from 'react'
import { usePosts } from '@/hooks/usePosts'
import Search from '@/components/blog/Search'
import FeaturedPosts from '@/components/blog/FeaturedPosts'
import BlogList from '@/components/blog/BlogList'
import CategoryFilter from '@/components/blog/CategoryFilter'
import Skeleton from '@/components/common/Skeleton'
import SEOHead from '@/components/common/SEOHead'

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
    <div className="min-h-screen bg-cream-100">
      <SEOHead
        title="블로그"
        description="AI, 재테크, 부업, 비즈니스 — 경제적 자유를 향한 매일의 인사이트를 전합니다."
        url="/blog"
      />
      {/* Hero 섹션 */}
      <section className="relative bg-gradient-to-br from-soot-900 via-moss-600 to-sage-500 text-white py-20 md:py-28 overflow-hidden">
        {/* 배경 패턴 - 자연스러운 잎 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M40 40c0-11.046-8.954-20-20-20S0 28.954 0 40s8.954 20 20 20c-11.046 0-20 8.954-20 20h80c0-11.046-8.954-20-20-20 11.046 0 20-8.954 20-20s-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6 border border-white/20">
              <span className="w-2 h-2 bg-sage-400 rounded-full animate-pulse"></span>
              새로운 인사이트가 계속 업데이트됩니다
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
              부자타임 뉴스
            </h1>
            <p className="text-xl md:text-2xl text-sage-200 mb-10 leading-relaxed font-light">
              AI, 재테크, 부업, 마인드셋, 디지털 스킬<br className="hidden md:block" />
              경제적 자유를 위한 인사이트를 제공합니다.
            </p>
            <Search posts={posts} onSearch={setSearchQuery} />
          </div>
        </div>

        {/* 하단 그라데이션 효과 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream-100 to-transparent"></div>
      </section>

        {/* 추천 포스트 섹션 */}
        {!selectedCategory && !searchQuery && featuredPosts.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-moss-500 to-sage-400 rounded-full"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-soot-900">추천 포스트</h2>
              </div>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-48 w-full rounded-2xl" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
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
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* 사이드바 */}
              <aside className="lg:w-72 flex-shrink-0">
                <div className="sticky top-28">
                  <div className="flex items-center gap-2 mb-5">
                    <svg className="w-5 h-5 text-moss-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <h3 className="text-lg font-bold text-soot-900">카테고리</h3>
                  </div>
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />
                  
                  {/* 뉴스레터 구독 카드 */}
                  <div className="mt-8 p-6 bg-gradient-to-br from-sage-50 to-mist-50 rounded-2xl border border-sage-200">
                    <h4 className="font-bold text-soot-900 mb-2">뉴스레터 구독</h4>
                    <p className="text-sm text-soot-600 mb-4">최신 인사이트를 이메일로 받아보세요</p>
                    <button className="w-full py-2.5 px-4 bg-moss-600 text-white rounded-xl font-medium hover:bg-moss-700 transition-colors text-sm">
                      구독하기
                    </button>
                  </div>
                </div>
              </aside>

              {/* 블로그 리스트 */}
              <main className="flex-1 min-w-0">
                {selectedCategory && (
                  <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-sage-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-moss-500 to-sage-400 rounded-full"></div>
                      <h2 className="text-2xl font-bold text-soot-900">
                        {categories.find(c => c.slug === selectedCategory)?.title}
                      </h2>
                    </div>
                    <p className="text-soot-600 ml-4">
                      {categories.find(c => c.slug === selectedCategory)?.description}
                    </p>
                  </div>
                )}

                {!selectedCategory && !searchQuery && (
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-8 bg-gradient-to-b from-moss-500 to-sage-400 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-soot-900">최신 포스트</h2>
                  </div>
                )}

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl p-5 space-y-4 border border-gray-100 shadow-sm">
                        <Skeleton className="h-52 w-full rounded-xl" />
                        <Skeleton className="h-4 w-24" />
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
