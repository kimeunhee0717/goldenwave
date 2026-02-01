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
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => handleClick(null)}
            className={cn(
              'w-full text-left py-2 px-3 rounded-lg transition',
              !selectedCategory
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            전체 보기
          </button>
        </li>
        {categories.map((cat) => (
          <li key={cat.id}>
            <button
              onClick={() => handleClick(cat.slug)}
              className={cn(
                'w-full text-left py-2 px-3 rounded-lg transition',
                selectedCategory === cat.slug
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {cat.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
