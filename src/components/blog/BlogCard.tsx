import { Link } from 'react-router-dom'
import { BlogPost } from '@/types/blog'
import { formatDate } from '@/lib/formatDate'
import Badge from '@/components/common/Badge'

interface Props {
  post: BlogPost
  featured?: boolean
}

export default function BlogCard({ post, featured = false }: Props) {
  return (
    <article className={`group ${featured ? 'md:col-span-2' : ''}`}>
      <Link to={`/blog/${post.slug}`} className="block">
        <div className={`
          overflow-hidden rounded-2xl bg-white shadow-md
          hover:shadow-xl transition-shadow duration-300
          ${featured ? 'md:flex' : ''}
        `}>
          {/* 이미지 */}
          <div className={`
            relative overflow-hidden bg-gray-100
            ${featured ? 'md:w-1/2 aspect-[4/3]' : 'aspect-video'}
          `}>
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x450?text=No+Image'
              }}
            />
          </div>

          {/* 콘텐츠 */}
          <div className={`p-6 ${featured ? 'md:w-1/2 md:flex md:flex-col md:justify-center' : ''}`}>
            <Badge color={post.category.color} size="sm" className="mb-3">
              {post.category.title}
            </Badge>

            <h3 className={`
              font-bold text-gray-900 mb-2
              group-hover:text-primary-600 transition-colors
              ${featured ? 'text-2xl' : 'text-lg'}
              line-clamp-2
            `}>
              {post.title}
            </h3>

            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
              {post.excerpt}
            </p>

            <div className="flex items-center text-sm text-gray-500">
              <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 overflow-hidden">
                <img
                  src={post.author.image}
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <span>{post.author.name}</span>
              <span className="mx-2">•</span>
              <time>{formatDate(post.publishedAt)}</time>
              {post.readingTime && (
                <>
                  <span className="mx-2">•</span>
                  <span>{post.readingTime}분</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
