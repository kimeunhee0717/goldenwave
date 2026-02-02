import { useParams, Link, Navigate } from 'react-router-dom'
import { usePosts } from '@/hooks/usePosts'
import { formatDate } from '@/lib/formatDate'
import { calculateReadingTime } from '@/lib/readingTime'
import Badge from '@/components/common/Badge'
import Skeleton from '@/components/common/Skeleton'
import ReadingProgressBar from '@/components/blog/ReadingProgressBar'
import BlogPostContent from '@/components/blog/BlogPostContent'
import TableOfContents from '@/components/blog/TableOfContents'
import ShareButtons from '@/components/blog/ShareButtons'
import AuthorCard from '@/components/blog/AuthorCard'
import RelatedPosts from '@/components/blog/RelatedPosts'
import GiscusComments from '@/components/blog/GiscusComments'
import { Clock, Calendar, ArrowLeft } from 'lucide-react'

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { getPostBySlug, getRelatedPosts, isLoading } = usePosts()

  const post = slug ? getPostBySlug(slug) : undefined
  const relatedPosts = post ? getRelatedPosts(post, 3) : []
  const readingTime = post ? calculateReadingTime(post.content) : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
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
    <div className="min-h-screen bg-white">
      <ReadingProgressBar />

      {/* 헤더 */}
      <article>
        <header className="relative bg-gradient-to-b from-gray-50 via-white to-white pt-12 pb-16">
          <div className="container mx-auto px-6 max-w-3xl">
            <Link
              to="/blog"
              className="group inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-8 transition-all duration-300"
            >
              <span className="p-2 rounded-full bg-gray-100 group-hover:bg-primary-50 transition-colors">
                <ArrowLeft size={18} />
              </span>
              <span className="font-medium">블로그 목록으로</span>
            </Link>

            <Badge color={post.category.color} size="md" className="mb-5 px-4 py-1.5">
              {post.category.title}
            </Badge>

            <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-gray-900 mb-6 leading-[1.2] tracking-tight">
              {post.title}
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed font-light">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-gray-500 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 overflow-hidden ring-2 ring-white shadow-md">
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
                  <p className="font-semibold text-gray-900">{post.author.name}</p>
                  <p className="text-sm text-gray-500">{post.author.role}</p>
                </div>
              </div>

              <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                  <Calendar size={15} className="text-gray-400" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                  <Clock size={15} className="text-gray-400" />
                  {readingTime}분 읽기
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 커버 이미지 */}
        <div className="container mx-auto px-6 max-w-5xl mb-16">
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10"></div>
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
              <div className="lg:sticky lg:top-28">
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <TableOfContents content={post.content} />
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">공유하기</h3>
                  <ShareButtons
                    title={post.title}
                    url={typeof window !== 'undefined' ? window.location.href : ''}
                  />
                </div>
              </div>
            </aside>

            {/* 본문 */}
            <main className="flex-1 min-w-0 order-1 lg:order-2 max-w-3xl">
              <BlogPostContent content={post.content} />

              {/* 태그 */}
              {post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">태그</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 rounded-full text-sm font-medium hover:shadow-md transition-all cursor-pointer border border-primary-100"
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
            <div className="w-1 h-8 bg-gradient-to-b from-primary-500 to-purple-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">댓글</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <GiscusComments />
          </div>
        </div>
      </article>
    </div>
  )
}
