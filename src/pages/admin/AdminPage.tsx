import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Home, Mail, BarChart3, Settings, Shield, Eye, EyeOff, Loader2, FileText } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const adminMenus = [
  {
    title: '포스트 관리',
    description: '블로그 포스트 목록 조회, 수정, 삭제',
    href: '/admin/posts',
    icon: FileText,
    color: 'bg-amber-500',
  },
  {
    title: '구독자 관리',
    description: '뉴스레터 구독자 목록 조회 및 관리',
    href: '/admin/subscribers',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    title: '브리핑 발송 내역',
    description: '발송된 브리핑 이력 확인',
    href: '/admin/briefings',
    icon: Mail,
    color: 'bg-green-500',
    disabled: true,
  },
  {
    title: '통계',
    description: '구독자 증가 추이, 오픈율 등',
    href: '/admin/stats',
    icon: BarChart3,
    color: 'bg-purple-500',
    disabled: true,
  },
  {
    title: '설정',
    description: '뉴스레터 설정 관리',
    href: '/admin/settings',
    icon: Settings,
    color: 'bg-gray-500',
    disabled: true,
  },
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedPassword = sessionStorage.getItem('admin_password');
    if (savedPassword) {
      verifyPassword(savedPassword);
    }
  }, []);

  const verifyPassword = async (pwd: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-subscribers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pwd,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_password', pwd);
        setError('');
      } else {
        sessionStorage.removeItem('admin_password');
        setError('비밀번호가 올바르지 않습니다.');
      }
    } catch {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyPassword(password);
  };

  // 로그인 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">관리자 로그인</h1>
              <p className="text-gray-500 mt-2">부자타임 관리자 페이지</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    확인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-gray-500 hover:text-amber-600">
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 바 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">부자타임 관리자</h1>
              <p className="text-sm text-gray-500">Admin Dashboard</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
          >
            <Home className="w-4 h-4" />
            홈으로
          </Link>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">관리 메뉴</h2>
          <p className="text-gray-500 mt-1">부자타임 뉴스레터를 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminMenus.map((menu) => {
            const Icon = menu.icon;

            if (menu.disabled) {
              return (
                <div
                  key={menu.href}
                  className="bg-white rounded-xl border border-gray-200 p-6 opacity-50 cursor-not-allowed"
                >
                  <div className={`w-12 h-12 ${menu.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{menu.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{menu.description}</p>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                    준비 중
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={menu.href}
                to={menu.href}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-amber-300 transition-all group"
              >
                <div className={`w-12 h-12 ${menu.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{menu.title}</h3>
                <p className="text-sm text-gray-500">{menu.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
