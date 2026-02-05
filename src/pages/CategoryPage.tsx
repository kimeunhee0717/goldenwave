import { useParams, Link, Navigate } from 'react-router-dom'
import { usePosts } from '@/hooks/usePosts'
import BlogList from '@/components/blog/BlogList'
import CategoryFilter from '@/components/blog/CategoryFilter'
import Skeleton from '@/components/common/Skeleton'
import { ArrowLeft } from 'lucide-react'

export default function CategoryPage() {
  const { category: categorySlug } = useParams<{ category: string }>()
  const { categories, getPostsByCategory, isLoading } = usePosts()

  const category = categories.find(c => c.slug === categorySlug)
  const posts = categorySlug ? getPostsByCategory(categorySlug) : []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-primary-600 to-indigo-700 text-white py-16">
          <div className="container mx-auto px-6">
            <Skeleton className="h-8 w-32 mb-4 bg-white/20" />
            <Skeleton className="h-12 w-64 mb-4 bg-white/20" />
            <Skeleton className="h-6 w-96 bg-white/20" />
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 space-y-3">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!category) {
    return <Navigate to="/blog" replace />
  }

  const colorMap: Record<string, string> = {
    blue: 'from-blue-600 to-blue-800',
    green: 'from-green-600 to-green-800',
    purple: 'from-purple-600 to-purple-800',
    orange: 'from-orange-500 to-orange-700',
    red: 'from-red-600 to-red-800',
    teal: 'from-teal-600 to-teal-800',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero 섹션 */}
      <section className={`bg-gradient-to-r ${colorMap[category.color] || 'from-primary-600 to-indigo-700'} text-white py-16`}>
        <div className="container mx-auto px-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            전체 블로그
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {category.title}
          </h1>
          {category.description && (
            <p className="text-xl text-white/80 max-w-2xl">
              {category.description}
            </p>
          )}
          <p className="mt-4 text-white/60">
            총 {posts.length}개의 포스트
          </p>
        </div>
      </section>

      {/* 콘텐츠 */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 사이드바 */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">다른 카테고리</h3>
                <CategoryFilter
                  categories={categories}
                  selectedCategory={categorySlug || null}
                  onSelectCategory={() => {}}
                  showAsLinks
                />
              </div>
            </aside>

            {/* 포스트 목록 */}
            <main className="flex-1">
              {posts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">
                    이 카테고리에 아직 포스트가 없습니다.
                  </p>
                  <Link
                    to="/blog"
                    className="inline-block mt-4 text-primary-600 hover:text-primary-700"
                  >
                    전체 블로그 보기 →
                  </Link>
                </div>
              ) : (
                <BlogList posts={posts} />
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}
