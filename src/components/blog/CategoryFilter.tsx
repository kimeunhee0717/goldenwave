import { Link } from 'react-router-dom'
import { Category } from '@/types/blog'
import { cn } from '@/lib/utils'

interface Props {
  categories: Category[]
  selectedCategory?: string | null
  onSelectCategory?: (category: string | null) => void
  showAsLinks?: boolean
}

export default function CategoryFilter({
  categories,
  selectedCategory = null,
  onSelectCategory,
  showAsLinks = false
}: Props) {
  const handleClick = (slug: string | null) => {
    if (onSelectCategory) {
      onSelectCategory(slug)
    }
  }

  if (showAsLinks) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <ul className="space-y-2">
          <li>
            <Link
              to="/blog"
              className={cn(
                'block py-2 px-3 rounded-lg transition',
                !selectedCategory
                  ? 'bg-sage-50 text-moss-700 font-medium'
                  : 'text-soot-600 hover:bg-cream-50'
              )}
            >
              전체 보기
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                to={`/blog/category/${cat.slug}`}
                className={cn(
                  'block py-2 px-3 rounded-lg transition',
                  selectedCategory === cat.slug
                    ? 'bg-sage-50 text-moss-700 font-medium'
                    : 'text-soot-600 hover:bg-cream-50'
                )}
              >
                {cat.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-sage-100 shadow-sm">
      <ul className="space-y-1.5">
        <li>
          <button
            onClick={() => handleClick(null)}
            className={cn(
              'w-full text-left py-3 px-4 rounded-xl transition-all duration-200 flex items-center gap-3',
              !selectedCategory
                ? 'bg-gradient-to-r from-sage-50 to-mist-50 text-moss-700 font-semibold shadow-sm border border-sage-200'
                : 'text-soot-600 hover:bg-cream-50 hover:text-soot-900'
            )}
          >
            <span className={`w-2 h-2 rounded-full ${!selectedCategory ? 'bg-moss-500' : 'bg-sage-300'}`}></span>
            전체 보기
          </button>
        </li>
        {categories.map((cat) => (
          <li key={cat.id}>
            <button
              onClick={() => handleClick(cat.slug)}
              className={cn(
                'w-full text-left py-3 px-4 rounded-xl transition-all duration-200 flex items-center gap-3',
                selectedCategory === cat.slug
                  ? 'bg-gradient-to-r from-sage-50 to-mist-50 text-moss-700 font-semibold shadow-sm border border-sage-200'
                  : 'text-soot-600 hover:bg-cream-50 hover:text-soot-900'
              )}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedCategory === cat.slug
                    ? 'bg-moss-500'
                    : 'bg-sage-300 group-hover:bg-sage-400'
                }`}
              ></span>
              {cat.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
