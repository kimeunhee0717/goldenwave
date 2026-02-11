import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Landmark,
  Wallet,
  PiggyBank,
  Briefcase,
  Clock,
  Building2,
  Heart,
  Calendar,
  ArrowLeftRight,
  ArrowRight,
  Wrench,
  Home,
  BarChart3,
  RefreshCw,
  Zap,
  Timer,
  FileText,
  Car,
  Umbrella,
  Baby,
  Receipt,
  Crown,
  Target,
  Grid3X3,
} from 'lucide-react';

interface Tool {
  name: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  ready: boolean;
  color: 'blush' | 'rose' | 'champagne' | 'thyme' | 'bisque';
}

const colorStyles = {
  blush: {
    iconBg: 'bg-blush-200/60',
    iconText: 'text-blush-700',
    iconHover: 'group-hover:bg-blush-200',
    border: 'hover:border-blush-300',
    shadow: 'hover:shadow-blush-100/60',
    cta: 'text-blush-600',
    accent: 'bg-blush-200',
  },
  rose: {
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-400',
    iconHover: 'group-hover:bg-rose-200',
    border: 'hover:border-rose-300',
    shadow: 'hover:shadow-rose-100/60',
    cta: 'text-rose-400',
    accent: 'bg-rose-400',
  },
  champagne: {
    iconBg: 'bg-champagne-100',
    iconText: 'text-champagne-700',
    iconHover: 'group-hover:bg-champagne-200',
    border: 'hover:border-champagne-300',
    shadow: 'hover:shadow-champagne-100/60',
    cta: 'text-champagne-700',
    accent: 'bg-champagne-100',
  },
  thyme: {
    iconBg: 'bg-thyme-100',
    iconText: 'text-thyme-500',
    iconHover: 'group-hover:bg-thyme-200',
    border: 'hover:border-thyme-300',
    shadow: 'hover:shadow-thyme-100/60',
    cta: 'text-thyme-500',
    accent: 'bg-thyme-500',
  },
  bisque: {
    iconBg: 'bg-bisque-100',
    iconText: 'text-bisque-700',
    iconHover: 'group-hover:bg-bisque-200',
    border: 'hover:border-bisque-300',
    shadow: 'hover:shadow-bisque-200/60',
    cta: 'text-bisque-600',
    accent: 'bg-bisque-200',
  },
};

const tools: Tool[] = [
  {
    name: '마크다운 에디터',
    description: '제미나이(Gemini) 답변을 깔끔하게 정리해주는 에디터. 특수문자 오류 자동 수정, 미리보기, 서식 복사까지!',
    icon: <FileText size={24} />,
    href: '/markdown-editor.html',
    ready: true,
    color: 'thyme',
  },
  {
    name: '복리 계산기',
    description: '복리의 마법을 직접 확인하세요. 초기 투자금과 수익률로 미래 자산을 계산합니다.',
    icon: <TrendingUp size={24} />,
    href: '/tools/compound-interest',
    ready: true,
    color: 'thyme',
  },
  {
    name: '대출 이자 계산기',
    description: '대출 원리금 상환 스케줄과 총 이자 비용을 한눈에 확인하세요.',
    icon: <Landmark size={24} />,
    href: '/tools/loan-interest',
    ready: true,
    color: 'rose',
  },
  {
    name: '연봉 실수령액 계산기',
    description: '세금과 4대 보험료를 제외한 실제 수령액을 계산합니다.',
    icon: <Wallet size={24} />,
    href: '/tools/salary',
    ready: true,
    color: 'champagne',
  },
  {
    name: '적금·예금 이자 계산기',
    description: '적금과 예금의 만기 수령액, 세후 이자를 비교해보세요.',
    icon: <PiggyBank size={24} />,
    href: '/tools/savings',
    ready: true,
    color: 'blush',
  },
  {
    name: '퇴직금 계산기',
    description: '근속 기간과 평균 임금으로 예상 퇴직금을 계산합니다.',
    icon: <Briefcase size={24} />,
    href: '/tools/severance',
    ready: true,
    color: 'bisque',
  },
  {
    name: '연금 수령액 계산기',
    description: '국민연금 예상 수령액과 개인연금 시뮬레이션을 제공합니다.',
    icon: <Clock size={24} />,
    href: '/tools/pension',
    ready: true,
    color: 'thyme',
  },
  {
    name: '부동산 수익률 계산기',
    description: '매입가, 보유 비용, 임대 수익으로 실질 수익률을 분석합니다.',
    icon: <Building2 size={24} />,
    href: '/tools/real-estate',
    ready: true,
    color: 'rose',
  },
  {
    name: 'BMI 계산기',
    description: '키와 체중으로 체질량지수(BMI)를 계산하고 건강 상태를 확인하세요.',
    icon: <Heart size={24} />,
    href: '/tools/bmi',
    ready: true,
    color: 'blush',
  },
  {
    name: '나이·만나이 계산기',
    description: '생년월일로 한국식 나이와 만나이를 동시에 계산합니다.',
    icon: <Calendar size={24} />,
    href: '/tools/age',
    ready: true,
    color: 'champagne',
  },
  {
    name: '환율 계산기',
    description: '주요 통화 간 환율을 빠르게 변환합니다.',
    icon: <ArrowLeftRight size={24} />,
    href: '/tools/exchange-rate',
    ready: true,
    color: 'bisque',
  },
  {
    name: '전세↔월세 전환 계산기',
    description: '전세금과 월세를 전환율로 상호 변환합니다.',
    icon: <Home size={24} />,
    href: '/tools/jeonse-wolse',
    ready: true,
    color: 'thyme',
  },
  {
    name: '주식 수익률 계산기',
    description: '매수가·매도가·수수료·세금 반영 실질 수익률을 계산합니다.',
    icon: <BarChart3 size={24} />,
    href: '/tools/stock-return',
    ready: true,
    color: 'rose',
  },
  {
    name: '대출 갈아타기 비교기',
    description: '기존 대출과 신규 대출 조건을 비교해 이자 절감액을 확인하세요.',
    icon: <RefreshCw size={24} />,
    href: '/tools/loan-refinance',
    ready: true,
    color: 'blush',
  },
  {
    name: '전기요금 계산기',
    description: '사용량(kWh)을 입력하면 누진세 단계별 전기요금을 계산합니다.',
    icon: <Zap size={24} />,
    href: '/tools/electricity',
    ready: true,
    color: 'champagne',
  },
  {
    name: '시급·일급 변환 계산기',
    description: '시급↔일급↔월급↔연봉을 상호 변환하고 최저시급과 비교합니다.',
    icon: <Timer size={24} />,
    href: '/tools/hourly-wage',
    ready: true,
    color: 'bisque',
  },
  {
    name: '종합소득세 계산기',
    description: '프리랜서·자영업자의 종합소득세를 간이 계산합니다.',
    icon: <FileText size={24} />,
    href: '/tools/income-tax',
    ready: true,
    color: 'thyme',
  },
  {
    name: '자동차 유지비 계산기',
    description: '유류비·보험·세금·감가상각 등 월/연 총 유지비를 계산합니다.',
    icon: <Car size={24} />,
    href: '/tools/car-cost',
    ready: true,
    color: 'rose',
  },
  {
    name: '은퇴 자금 계산기',
    description: '목표 은퇴 나이와 월 생활비로 필요 자금을 역산합니다.',
    icon: <Umbrella size={24} />,
    href: '/tools/retirement',
    ready: true,
    color: 'champagne',
  },
  {
    name: '육아 비용 계산기',
    description: '출산부터 대학까지 연차별 예상 육아 비용을 시뮬레이션합니다.',
    icon: <Baby size={24} />,
    href: '/tools/child-cost',
    ready: true,
    color: 'blush',
  },
  {
    name: '부가세(VAT) 계산기',
    description: '공급가↔부가세↔합계를 상호 변환합니다.',
    icon: <Receipt size={24} />,
    href: '/tools/vat',
    ready: true,
    color: 'bisque',
  },
  {
    name: '체스 게임',
    description: '무료로 즐기는 온라인 체스. AI와 대전하거나 친구와 함께 플레이하세요.',
    icon: <Crown size={24} />,
    href: '/tools/chess',
    ready: true,
    color: 'champagne',
  },
  {
    name: '페그 솔리테어',
    description: '클�식한 두뇌 게임! 페그를 뛰어넘어 마지막까지 최소한의 페그만 남기세요.',
    icon: <Target size={24} />,
    href: '/tools/peg-solitaire',
    ready: true,
    color: 'thyme',
  },
  {
    name: '한국 장기',
    description: '전통 한국 장기를 온라인에서 즐기세요. AI와 대전하거나 친구와 함께 플레이할 수 있습니다.',
    icon: <Grid3X3 size={24} />,
    href: '/tools/janggi',
    ready: true,
    color: 'rose',
  },
  {
    name: '오목',
    description: '15×15 보드에서 펼쳐지는 전략 게임. 3-3 금수 규칙을 준수하며 AI와 대전필 수 있습니다.',
    icon: <Grid3X3 size={24} />,
    href: '/tools/gomoku',
    ready: true,
    color: 'bisque',
  },
  {
    name: '스도쿠',
    description: '9×9 보드의 논리 퍼즐. 4단계 난이도로 매일 새로운 문제에 도전하세요.',
    icon: <Grid3X3 size={24} />,
    href: '/tools/sudoku',
    ready: true,
    color: 'blush',
  },
  {
    name: '바둑 13×13',
    description: 'MCTS AI와 대전하는 바둑. 4단계 난이도, 중국식 계가, 덤 6.5점.',
    icon: <Grid3X3 size={24} />,
    href: '/tools/baduk',
    ready: true,
    color: 'thyme',
  },
];

const ToolsPage: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FBEAD6 0%, #fdf6f7 30%, #FFFFFF 100%)' }}>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 lg:px-12">
        <div className="container mx-auto max-w-4xl text-center">
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-8"
            style={{ backgroundColor: '#F0C4CB', color: '#9c3f56' }}
          >
            <Wrench size={16} />
            부자타임 도구 모음
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 leading-tight" style={{ color: '#6B7556' }}>
            스마트한 계산, 현명한 선택
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#9c3f56' }}>
            재테크와 일상에 필요한 계산기를 한 곳에 모았습니다.<br className="hidden sm:block" />
            복리, 대출, 연봉, 연금까지 — 더 나은 의사결정을 도와드립니다.
          </p>

          {/* Color dots decoration */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F0C4CB' }} />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#C87D87' }} />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FBEAD6' }} />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6B7556' }} />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E5BCA9' }} />
          </div>
        </div>
      </section>

      {/* Tool Cards Grid */}
      <section className="pb-24 px-6 lg:px-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const styles = colorStyles[tool.color];

              const Card = (
                <div
                  className={`relative bg-white/80 backdrop-blur-sm rounded-2xl border p-6 transition-all duration-300 ${
                    tool.ready
                      ? `border-slate-200/60 ${styles.border} hover:shadow-xl ${styles.shadow} cursor-pointer group hover:-translate-y-1`
                      : 'border-slate-100 opacity-75'
                  }`}
                >
                  {/* Top accent line */}
                  <div className={`absolute top-0 left-6 right-6 h-0.5 rounded-full ${styles.accent} opacity-60`} />

                  {/* Status Badge */}
                  {!tool.ready && (
                    <span className="absolute top-4 right-4 bg-slate-100 text-slate-400 text-xs font-medium px-2.5 py-1 rounded-full">
                      준비 중
                    </span>
                  )}

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-200 ${
                      tool.ready
                        ? `${styles.iconBg} ${styles.iconText} ${styles.iconHover}`
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {tool.icon}
                  </div>

                  {/* Content */}
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      tool.ready ? 'text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    {tool.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">
                    {tool.description}
                  </p>

                  {/* CTA */}
                  {tool.ready && (
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${styles.cta} group-hover:gap-2 transition-all`}>
                      사용하기 <ArrowRight size={14} />
                    </span>
                  )}
                </div>
              );

              return tool.ready && tool.href ? (
                tool.href.endsWith('.html') ? (
                  <a key={tool.name} href={tool.href} target="_blank" rel="noopener noreferrer">
                    {Card}
                  </a>
                ) : (
                  <Link key={tool.name} to={tool.href}>
                    {Card}
                  </Link>
                )
              ) : (
                <div key={tool.name}>{Card}</div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ToolsPage;
