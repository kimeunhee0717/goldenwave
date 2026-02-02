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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero 섹션 */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-primary-700 to-purple-800 text-white py-20 md:py-28 overflow-hidden">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              새로운 인사이트가 계속 업데이트됩니다
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
              인사이트 & 노하우
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed font-light">
              마케팅 전략, 디지털 트렌드, 성공 사례 등<br className="hidden md:block" />
              비즈니스 성장을 위한 전문 인사이트를 제공합니다.
            </p>
            <Search posts={posts} onSearch={setSearchQuery} />
          </div>
        </div>
        
        {/* 하단 그라데이션 효과 */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

        {/* 추천 포스트 섹션 */}
        {!selectedCategory && !searchQuery && featuredPosts.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-purple-500 rounded-full"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">추천 포스트</h2>
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
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <h3 className="text-lg font-bold text-gray-900">카테고리</h3>
                  </div>
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />
                  
                  {/* 뉴스레터 구독 카드 */}
                  <div className="mt-8 p-6 bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl border border-primary-100">
                    <h4 className="font-bold text-gray-900 mb-2">뉴스레터 구독</h4>
                    <p className="text-sm text-gray-600 mb-4">최신 인사이트를 이메일로 받아보세요</p>
                    <button className="w-full py-2.5 px-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm">
                      구독하기
                    </button>
                  </div>
                </div>
              </aside>

              {/* 블로그 리스트 */}
              <main className="flex-1 min-w-0">
                {selectedCategory && (
                  <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-purple-500 rounded-full"></div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {categories.find(c => c.slug === selectedCategory)?.title}
                      </h2>
                    </div>
                    <p className="text-gray-600 ml-4">
                      {categories.find(c => c.slug === selectedCategory)?.description}
                    </p>
                  </div>
                )}

                {!selectedCategory && !searchQuery && (
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-purple-500 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-900">최신 포스트</h2>
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
