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
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
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
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
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
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <ul className="space-y-1.5">
        <li>
          <button
            onClick={() => handleClick(null)}
            className={cn(
              'w-full text-left py-3 px-4 rounded-xl transition-all duration-200 flex items-center gap-3',
              !selectedCategory
                ? 'bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 font-semibold shadow-sm border border-primary-100'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <span className={`w-2 h-2 rounded-full ${!selectedCategory ? 'bg-primary-500' : 'bg-gray-300'}`}></span>
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
                  ? 'bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 font-semibold shadow-sm border border-primary-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span 
                className={`w-2 h-2 rounded-full ${
                  selectedCategory === cat.slug 
                    ? 'bg-primary-500' 
                    : 'bg-gray-300 group-hover:bg-gray-400'
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
