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
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 bg-gradient-to-b from-cocoa-500 to-sand-400 rounded-full"></div>
        <h2 className="text-2xl font-bold text-espresso-800">관련 포스트</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="group block bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-oatmeal-200 hover:border-sand-300"
          >
            <div className="aspect-video bg-gradient-to-br from-oatmeal-200 to-golden-100 overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x225?text=No+Image'
                }}
              />
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-espresso-800 group-hover:text-cocoa-600 transition-colors line-clamp-2 mb-3 leading-snug">
                {post.title}
              </h3>
              <time className="text-sm text-cocoa-500">{formatDate(post.publishedAt)}</time>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
