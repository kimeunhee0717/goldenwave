import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';

const contactInfo = [
  {
    icon: Mail,
    label: '이메일',
    value: 'hello@goldenwave.co.kr',
    href: 'mailto:hello@goldenwave.co.kr',
  },
  {
    icon: Phone,
    label: '전화',
    value: '02-1234-5678',
    href: 'tel:02-1234-5678',
  },
  {
    icon: MapPin,
    label: '주소',
    value: '부산광역시 부산진구 동평로 183번길 86-3',
    href: undefined,
  },
  {
    icon: Clock,
    label: '운영시간',
    value: '평일 09:00 – 18:00',
    href: undefined,
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제 폼 전송 로직은 백엔드 연동 시 추가
    setSubmitted(true);
  };

  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            문의하기
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            궁금하신 점이나 제안사항이 있으시면 편하게 연락해 주세요.<br />
            빠른 시일 내에 답변드리겠습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* 연락처 정보 */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-bold text-slate-900 text-lg mb-6">연락처</h2>
            {contactInfo.map((info) => (
              <div key={info.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-moss-50 flex items-center justify-center flex-shrink-0">
                  <info.icon size={18} className="text-moss-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">{info.label}</p>
                  {info.href ? (
                    <a
                      href={info.href}
                      className="text-sm text-slate-700 hover:text-moss-600 transition-colors"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-700">{info.value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-moss-50 rounded-2xl">
              <h3 className="font-bold text-slate-900 text-sm mb-2">광고 및 제휴 문의</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                광고 게재, 콘텐츠 제휴, 비즈니스 협업 등의 문의는
                이메일로 연락 부탁드립니다.
              </p>
            </div>
          </div>

          {/* 문의 폼 */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="text-center py-20 bg-slate-50 rounded-2xl">
                <div className="w-16 h-16 bg-moss-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send size={24} className="text-moss-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  문의가 접수되었습니다
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  빠른 시일 내에 답변드리겠습니다. 감사합니다.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="text-sm text-moss-600 hover:underline"
                >
                  새 문의 작성
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                      이름
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moss-500 focus:border-transparent transition-all"
                      placeholder="홍길동"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moss-500 focus:border-transparent transition-all"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                    문의 유형
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moss-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">선택해주세요</option>
                    <option value="일반 문의">일반 문의</option>
                    <option value="광고·제휴">광고·제휴 문의</option>
                    <option value="콘텐츠 제안">콘텐츠 제안</option>
                    <option value="오류 신고">오류 신고</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                    문의 내용
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moss-500 focus:border-transparent transition-all resize-none"
                    placeholder="문의하실 내용을 입력해주세요."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-slate-900 text-white font-medium rounded-xl text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                >
                  <Send size={16} />
                  문의 보내기
                </button>

                <p className="text-xs text-slate-400 text-center">
                  문의를 보내시면{' '}
                  <Link to="/privacy" className="text-moss-600 hover:underline">
                    개인정보처리방침
                  </Link>
                  에 동의하는 것으로 간주됩니다.
                </p>
              </form>
            )}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 text-center">
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-moss-600 transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
