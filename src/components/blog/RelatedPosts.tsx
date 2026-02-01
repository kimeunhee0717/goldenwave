import { Link } from 'react-router-dom'
import { BlogPost } from '@/types/blog'
import { formatDate } from '@/lib/formatDate'
import { cn } from '@/lib/utils'

interface Props {
  posts: BlogPost[]
  className?: string
}

export default function RelatedPosts({ posts, className }: Props) {
  if (posts.length === 0) return null

  return (
    <section className={cn('', className)}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">관련 포스트</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="aspect-video bg-gray-100 overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x225?text=No+Image'
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                {post.title}
              </h3>
              <time className="text-sm text-gray-500">{formatDate(post.publishedAt)}</time>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
