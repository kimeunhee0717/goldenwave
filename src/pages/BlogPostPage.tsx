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
        <header className="bg-gradient-to-b from-gray-50 to-white pt-8 pb-12">
          <div className="container mx-auto px-6 max-w-4xl">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-8 transition-colors"
            >
              <ArrowLeft size={18} />
              블로그 목록으로
            </Link>

            <Badge color={post.category.color} className="mb-4">
              {post.category.title}
            </Badge>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-gray-600 mb-6">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-gray-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
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
                  <p className="font-medium text-gray-900">{post.author.name}</p>
                  <p className="text-sm">{post.author.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Calendar size={16} />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={16} />
                  {readingTime}분 읽기
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 커버 이미지 */}
        <div className="container mx-auto px-6 max-w-5xl mb-12">
          <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/1200x675?text=Cover+Image'
              }}
            />
          </div>
        </div>

        {/* 본문 + 목차 */}
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* 목차 사이드바 */}
            <aside className="lg:w-64 flex-shrink-0 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24">
                <TableOfContents content={post.content} />
                <div className="mt-8">
                  <ShareButtons
                    title={post.title}
                    url={typeof window !== 'undefined' ? window.location.href : ''}
                  />
                </div>
              </div>
            </aside>

            {/* 본문 */}
            <main className="flex-1 min-w-0 order-1 lg:order-2">
              <BlogPostContent content={post.content} />

              {/* 태그 */}
              {post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
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
          <div className="container mx-auto px-6 max-w-6xl mt-16">
            <RelatedPosts posts={relatedPosts} />
          </div>
        )}

        {/* 댓글 */}
        <div className="container mx-auto px-6 max-w-4xl mt-16 pb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">댓글</h2>
          <GiscusComments />
        </div>
      </article>
    </div>
  )
}
