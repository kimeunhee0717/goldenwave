import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search as SearchIcon, X } from 'lucide-react'
import Fuse from 'fuse.js'
import { BlogPost } from '@/types/blog'

interface Props {
  posts: BlogPost[]
  onSearch?: (query: string) => void
}

export default function Search({ posts, onSearch }: Props) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: ['title', 'excerpt', 'tags'],
        threshold: 0.3,
        includeScore: true,
      }),
    [posts]
  )

  const results = useMemo(() => {
    if (!query.trim()) return []
    return fuse.search(query).slice(0, 5).map((result) => result.item)
  }, [query, fuse])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    setIsOpen(value.length > 0)
    onSearch?.(value)
  }

  const clearSearch = () => {
    setQuery('')
    setIsOpen(false)
    onSearch?.('')
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="relative group">
        <SearchIcon
          size={20}
          className="absolute left-5 top-1/2 -translate-y-1/2 text-white/70 group-focus-within:text-white transition-colors"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="검색어를 입력하세요..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="w-full pl-14 pr-12 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition-all duration-300 text-base shadow-lg"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X size={18} />
          </button>
        )}
        
        {/* 검색 힌트 */}
        {!query && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 text-xs text-white/40">
            <span className="px-2 py-1 bg-white/10 rounded border border-white/20">⌘K</span>
          </div>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              검색 결과 {results.length}개
            </p>
          </div>
          {results.map((post, index) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              onClick={() => setIsOpen(false)}
              className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors group"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-semibold group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">{post.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 z-50 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
            <SearchIcon size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-900 font-medium mb-1">검색 결과가 없습니다</p>
          <p className="text-sm text-gray-500">다른 키워드로 검색해보세요</p>
        </div>
      )}
    </div>
  )
}
