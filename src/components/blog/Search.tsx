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
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <SearchIcon
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="검색어를 입력하세요..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="w-full pl-12 pr-10 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {results.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
            >
              <h4 className="font-medium text-gray-900 line-clamp-1">{post.title}</h4>
              <p className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50">
          <p className="text-gray-500 text-center">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  )
}
