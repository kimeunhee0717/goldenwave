import { useParams, Link, Navigate } from 'react-router-dom'
import { usePosts } from '@/hooks/usePosts'
import { formatDate } from '@/lib/formatDate'
import { calculateReadingTime } from '@/lib/readingTime'
import Badge from '@/components/common/Badge'
import Skeleton from '@/components/common/Skeleton'
import SEOHead from '@/components/common/SEOHead'
import ReadingProgressBar from '@/components/blog/ReadingProgressBar'
import BlogPostContent from '@/components/blog/BlogPostContent'
import TableOfContents from '@/components/blog/TableOfContents'
import ShareButtons from '@/components/blog/ShareButtons'
import AuthorCard from '@/components/blog/AuthorCard'
import RelatedPosts from '@/components/blog/RelatedPosts'
import GiscusComments from '@/components/blog/GiscusComments'
import { Clock, Calendar, ArrowLeft, Edit3 } from 'lucide-react'
import { useAdmin } from '@/contexts/AdminContext'

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { getPostBySlug, getRelatedPosts, isLoading } = usePosts()

  const { isAdmin } = useAdmin()
  const post = slug ? getPostBySlug(slug) : undefined
  const relatedPosts = post ? getRelatedPosts(post, 3) : []
  const readingTime = post ? calculateReadingTime(post.content) : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-golden-100">
        <div className="container mx-auto px-6 py-20 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-6 w-24 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return <Navigate to="/blog" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-golden-100 via-oatmeal-200/30 to-golden-50">
      <SEOHead
        title={post.title}
        description={post.excerpt}
        url={`/blog/${post.slug}`}
        image={post.coverImage}
        type="article"
        publishedAt={post.publishedAt}
        tags={post.tags}
        noindex={post.category.slug === 'briefing'}
      />
      <ReadingProgressBar />

      {/* 헤더 */}
      <article>
        <header className="relative pt-20 pb-16">
          {/* 배경 패턴 */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23544339' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="container mx-auto px-6 max-w-3xl relative">
            <Badge color={post.category.color} size="md" className="mb-6 px-4 py-1.5 shadow-sm">
              {post.category.title}
            </Badge>

            <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-espresso-800 mb-6 leading-[1.2] tracking-tight">
              {post.title}
            </h1>

            <p className="text-lg md:text-xl text-cocoa-600 mb-10 leading-relaxed font-light">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-cocoa-500 pt-6 border-t border-sand-300/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sand-300 to-cocoa-300 overflow-hidden ring-2 ring-white shadow-lg">
                  <img
                    src={post.author.image}
                    alt={post.author.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
                <div>
                  <p className="font-semibold text-espresso-800">{post.author.name}</p>
                  <p className="text-sm text-cocoa-500">{post.author.role}</p>
                </div>
              </div>

              <div className="h-8 w-px bg-sand-300 hidden md:block"></div>

              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-oatmeal-200">
                  <Calendar size={15} className="text-cocoa-400" />
                  <span className="text-espresso-700">{formatDate(post.publishedAt)}</span>
                </span>
                <span className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-oatmeal-200">
                  <Clock size={15} className="text-cocoa-400" />
                  <span className="text-espresso-700">{readingTime}분 읽기</span>
                </span>
                {isAdmin && (
                  <Link
                    to={`/admin/edit/${slug}`}
                    className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full shadow-sm hover:bg-amber-600 transition-colors text-sm font-semibold"
                  >
                    <Edit3 size={15} />
                    수정
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 커버 이미지 */}
        <div className="container mx-auto px-6 max-w-5xl mb-16">
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
            <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/20 to-transparent z-10"></div>
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700"
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder-cover.svg'
              }}
            />
          </div>
        </div>

        {/* 본문 + 목차 */}
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* 목차 사이드바 */}
            <aside className="lg:w-72 flex-shrink-0 order-2 lg:order-1">
              <div className="lg:sticky lg:top-28 space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-oatmeal-200">
                  <TableOfContents content={post.content} />
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-oatmeal-200 shadow-sm">
                  <h3 className="text-sm font-bold text-espresso-800 mb-4 uppercase tracking-wide">공유하기</h3>
                  <ShareButtons
                    title={post.title}
                    url={typeof window !== 'undefined' ? window.location.href : ''}
                  />
                </div>
              </div>
            </aside>

            {/* 본문 */}
            <main className="flex-1 min-w-0 order-1 lg:order-2 max-w-3xl">
              {/* 본문 카드 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl ring-1 ring-black/5">
                <BlogPostContent content={post.content} />
              </div>

              {/* 태그 */}
              {post.tags.length > 0 && (
                <div className="mt-12 p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-oatmeal-200 shadow-sm">
                  <h3 className="text-sm font-bold text-espresso-800 mb-5 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-cocoa-500 to-sand-400 rounded-full"></span>
                    관련 태그
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-5 py-2.5 bg-gradient-to-br from-golden-100 to-oatmeal-200 text-cocoa-600 rounded-full text-sm font-medium hover:shadow-md hover:from-golden-200 hover:to-sand-200 transition-all cursor-pointer border border-sand-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 작성자 소개 */}
              <AuthorCard author={post.author} className="mt-12" />
            </main>
          </div>
        </div>

        {/* 관련 포스트 */}
        {relatedPosts.length > 0 && (
          <div className="container mx-auto px-6 max-w-6xl mt-20">
            <RelatedPosts posts={relatedPosts} />
          </div>
        )}

        {/* 댓글 */}
        <div className="container mx-auto px-6 max-w-3xl mt-20 pb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-cocoa-500 to-sand-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-espresso-800">댓글</h2>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-oatmeal-200 p-8 shadow-lg">
            <GiscusComments />
          </div>
        </div>
      </article>
    </div>
  )
}
