import { useState, useMemo } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAdmin } from '@/contexts/AdminContext'
import { usePosts } from '@/hooks/usePosts'
import { formatDate } from '@/lib/formatDate'
import {
  ArrowLeft, Search, Filter, Edit3, Trash2, Plus, FileText,
  ChevronLeft, ChevronRight, Eye
} from 'lucide-react'

const ITEMS_PER_PAGE = 20

export default function PostsManagePage() {
  const { isAdmin } = useAdmin()
  const { posts, categories, isLoading } = usePosts()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  if (!isAdmin) return <Navigate to="/admin" replace />

  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchSearch = !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      const matchCat = categoryFilter === 'all' || p.category.id === categoryFilter
      return matchSearch && matchCat
    })
  }, [posts, search, categoryFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    posts.forEach(p => {
      counts[p.category.id] = (counts[p.category.id] || 0) + 1
    })
    return counts
  }, [posts])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 바 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
              관리자 홈
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              <h1 className="text-xl font-bold text-gray-900">포스트 관리</h1>
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-sm rounded-full font-medium">
                {filtered.length}개
              </span>
            </div>
          </div>
          <Link
            to="/admin/new"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            새 글 작성
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 검색 + 필터 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="제목 또는 태그로 검색..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="all">전체 카테고리</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.title} ({catCounts[cat.id] || 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">로딩 중...</div>
          ) : paged.length === 0 ? (
            <div className="p-12 text-center text-gray-500">검색 결과가 없습니다.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 w-16">#</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">카테고리</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">제목</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 w-28">날짜</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 w-24">태그</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600 w-32">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.map((post, idx) => (
                  <tr key={post.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {(page - 1) * ITEMS_PER_PAGE + idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                        {post.category.title}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(post.publishedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {post.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="text-xs text-gray-400">+{post.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/blog/${post.slug}`}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="보기"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/edit/${post.slug}`}
                          className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(post.id === deleteConfirm ? null : post.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {deleteConfirm === post.id && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 text-center">
                          삭제 기능은 준비 중입니다
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-500">
                {(page - 1) * ITEMS_PER_PAGE + 1}~{Math.min(page * ITEMS_PER_PAGE, filtered.length)} / {filtered.length}개
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
                      n === page ? 'bg-amber-500 text-white' : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
