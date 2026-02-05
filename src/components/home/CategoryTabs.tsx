import { cn } from '@/lib/utils'
import type { Category } from '@/types/blog'

interface CategoryTabsProps {
  categories: Category[]
  selected: string | null
  onSelect: (slug: string | null) => void
}

const colorMap: Record<string, string> = {
  purple: 'bg-purple-600 text-white',
  blue: 'bg-blue-600 text-white',
  green: 'bg-green-600 text-white',
  orange: 'bg-orange-500 text-white',
  red: 'bg-red-600 text-white',
  teal: 'bg-teal-600 text-white',
}

const dotColorMap: Record<string, string> = {
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-400',
  red: 'bg-red-500',
  teal: 'bg-teal-500',
}

export default function CategoryTabs({ categories, selected, onSelect }: CategoryTabsProps) {
  return (
    <div className="sticky top-[60px] z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="container mx-auto px-6">
        <nav className="flex gap-1 overflow-x-auto py-3 scrollbar-hide -mx-1 px-1" aria-label="카테고리 탭">
          <button
            onClick={() => onSelect(null)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all',
              selected === null
                ? 'bg-soot-900 text-white shadow-md'
                : 'text-soot-600 hover:bg-slate-100'
            )}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.slug)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5',
                selected === cat.slug
                  ? colorMap[cat.color] + ' shadow-md'
                  : 'text-soot-600 hover:bg-slate-100'
              )}
            >
              {selected !== cat.slug && (
                <span className={cn('w-2 h-2 rounded-full', dotColorMap[cat.color])} />
              )}
              {cat.title}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
