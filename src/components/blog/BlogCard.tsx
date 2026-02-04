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
      <Link to={`/blog/${post.slug}`} className="block h-full">
        <div className={`
          h-full overflow-hidden rounded-2xl bg-white 
          border border-sage-100 shadow-sm
          hover:shadow-xl hover:shadow-sage-200/50 hover:border-sage-200
          hover:-translate-y-1
          transition-all duration-300 ease-out
          ${featured ? 'md:flex' : ''}
        `}>
          {/* 이미지 */}
          <div className={`
            relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200
            ${featured ? 'md:w-1/2 aspect-[4/3]' : 'aspect-video'}
          `}>
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder-card.svg'
              }}
            />
            {/* 이미지 오버레이 효과 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* 콘텐츠 */}
          <div className={`p-6 flex flex-col ${featured ? 'md:w-1/2 md:p-8' : ''}`}>
            <div className="flex-1">
              <Badge 
                color={post.category.color} 
                size="sm" 
                className="mb-3 px-2.5 py-1 font-semibold"
              >
                {post.category.title}
              </Badge>

              <h3 className={`
                font-bold text-soot-900 mb-3
                group-hover:text-moss-600
                transition-colors duration-300
                ${featured ? 'text-2xl md:text-3xl leading-tight' : 'text-lg leading-snug'}
                line-clamp-2
              `}>
                {post.title}
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                {post.excerpt}
              </p>
            </div>

            <div className="flex items-center text-sm text-soot-500 pt-4 border-t border-sage-50">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sage-100 to-mist-100 mr-2.5 overflow-hidden ring-2 ring-white shadow-sm">
                <img
                  src={post.author.image}
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              <span className="font-medium text-soot-700">{post.author.name}</span>
              <span className="mx-2 text-sage-300">|</span>
              <time className="text-soot-500">{formatDate(post.publishedAt)}</time>
              {post.readingTime && (
                <>
                  <span className="mx-2 text-sage-300">|</span>
                  <span className="text-soot-500">{post.readingTime}분</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
