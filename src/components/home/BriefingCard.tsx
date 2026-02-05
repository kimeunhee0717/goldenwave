import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { BlogPost } from '@/types/blog'

interface BriefingCardProps {
  post: BlogPost
}

const categoryColorMap: Record<string, string> = {
  purple: 'bg-purple-100 text-purple-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
  teal: 'bg-teal-100 text-teal-700',
}

export default function BriefingCard({ post }: BriefingCardProps) {
  const dateStr = new Date(post.publishedAt).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200"
    >
      {/* 썸네일 */}
      <div className="sm:w-56 md:w-64 lg:w-72 flex-shrink-0">
        <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      </div>

      {/* 텍스트 */}
      <div className="flex flex-col justify-center flex-1 min-w-0 py-1">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn(
            'px-2.5 py-0.5 text-xs font-semibold rounded-full',
            categoryColorMap[post.category.color]
          )}>
            {post.category.title}
          </span>
          <span className="text-xs text-soot-400">{dateStr}</span>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-soot-900 leading-snug mb-2 line-clamp-2 group-hover:text-moss-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-soot-500 leading-relaxed line-clamp-2 hidden sm:block">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-2 mt-3 text-xs text-soot-400">
          <span>{post.author.name}</span>
          {post.readingTime && (
            <>
              <span className="w-1 h-1 rounded-full bg-soot-300" />
              <span>{post.readingTime}분 읽기</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
