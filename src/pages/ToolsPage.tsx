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
} from 'lucide-react';

interface Tool {
  name: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  ready: boolean;
}

const tools: Tool[] = [
  {
    name: '복리 계산기',
    description: '복리의 마법을 직접 확인하세요. 초기 투자금과 수익률로 미래 자산을 계산합니다.',
    icon: <TrendingUp size={24} />,
    href: '/tools/compound-interest',
    ready: true,
  },
  {
    name: '대출 이자 계산기',
    description: '대출 원리금 상환 스케줄과 총 이자 비용을 한눈에 확인하세요.',
    icon: <Landmark size={24} />,
    href: '/tools/loan-interest',
    ready: true,
  },
  {
    name: '연봉 실수령액 계산기',
    description: '세금과 4대 보험료를 제외한 실제 수령액을 계산합니다.',
    icon: <Wallet size={24} />,
    href: '/tools/salary',
    ready: true,
  },
  {
    name: '적금·예금 이자 계산기',
    description: '적금과 예금의 만기 수령액, 세후 이자를 비교해보세요.',
    icon: <PiggyBank size={24} />,
    href: '/tools/savings',
    ready: true,
  },
  {
    name: '퇴직금 계산기',
    description: '근속 기간과 평균 임금으로 예상 퇴직금을 계산합니다.',
    icon: <Briefcase size={24} />,
    href: '/tools/severance',
    ready: true,
  },
  {
    name: '연금 수령액 계산기',
    description: '국민연금 예상 수령액과 개인연금 시뮬레이션을 제공합니다.',
    icon: <Clock size={24} />,
    href: '/tools/pension',
    ready: true,
  },
  {
    name: '부동산 수익률 계산기',
    description: '매입가, 보유 비용, 임대 수익으로 실질 수익률을 분석합니다.',
    icon: <Building2 size={24} />,
    ready: false,
  },
  {
    name: 'BMI 계산기',
    description: '키와 체중으로 체질량지수(BMI)를 계산하고 건강 상태를 확인하세요.',
    icon: <Heart size={24} />,
    ready: false,
  },
  {
    name: '나이·만나이 계산기',
    description: '생년월일로 한국식 나이와 만나이를 동시에 계산합니다.',
    icon: <Calendar size={24} />,
    ready: false,
  },
  {
    name: '환율 계산기',
    description: '주요 통화 간 환율을 실시간으로 변환합니다.',
    icon: <ArrowLeftRight size={24} />,
    ready: false,
  },
];

const ToolsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="pt-32 pb-12 px-6 lg:px-12">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 bg-moss-50 text-moss-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Wrench size={16} />
            부자타임 도구 모음
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            유용한 도구
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            재테크와 일상에 필요한 계산기를 한 곳에 모았습니다.<br className="hidden sm:block" />
            복리, 대출, 연봉, 연금까지 — 스마트한 의사결정을 도와드립니다.
          </p>
        </div>
      </section>

      {/* Tool Cards Grid */}
      <section className="pb-24 px-6 lg:px-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const Card = (
                <div
                  className={`relative bg-white rounded-2xl border p-6 transition-all duration-200 ${
                    tool.ready
                      ? 'border-slate-200 hover:border-moss-300 hover:shadow-lg hover:shadow-moss-100/50 cursor-pointer group'
                      : 'border-slate-100 opacity-75'
                  }`}
                >
                  {/* Status Badge */}
                  {!tool.ready && (
                    <span className="absolute top-4 right-4 bg-slate-100 text-slate-400 text-xs font-medium px-2.5 py-1 rounded-full">
                      준비 중
                    </span>
                  )}

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      tool.ready
                        ? 'bg-moss-50 text-moss-600 group-hover:bg-moss-100'
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {tool.icon}
                  </div>

                  {/* Content */}
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      tool.ready ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {tool.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">
                    {tool.description}
                  </p>

                  {/* CTA */}
                  {tool.ready && (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-moss-600 group-hover:gap-2 transition-all">
                      사용하기 <ArrowRight size={14} />
                    </span>
                  )}
                </div>
              );

              return tool.ready && tool.href ? (
                <Link key={tool.name} to={tool.href}>
                  {Card}
                </Link>
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
