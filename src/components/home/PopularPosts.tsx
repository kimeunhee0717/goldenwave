import { Link } from 'react-router-dom'
import { usePosts } from '@/hooks/usePosts'
import { cn } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

const categoryColorMap: Record<string, string> = {
  purple: 'bg-purple-100 text-purple-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
  teal: 'bg-teal-100 text-teal-700',
}

export default function PopularPosts() {
  const { featuredPosts } = usePosts()
  const topPosts = featuredPosts.slice(0, 3)

  if (topPosts.length === 0) return null

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp size={20} className="text-moss-600" />
          <h2 className="text-2xl font-bold text-soot-900">인기 포스트</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topPosts.map((post, index) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group relative bg-cream-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-black text-soot-200">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-semibold rounded-full',
                    categoryColorMap[post.category.color]
                  )}>
                    {post.category.title}
                  </span>
                </div>
                <h3 className="font-bold text-soot-900 leading-snug line-clamp-2 group-hover:text-moss-600 transition-colors">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
