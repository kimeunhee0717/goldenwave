# 부자타임 (BujaTime) 프로젝트 지침

## 프로젝트 개요
- **사이트명:** 부자타임 (BujaTime)
- **도메인:** bujatime.com
- **이메일:** hello@bujatime.com
- **기술 스택:** React + TypeScript + Vite + Tailwind CSS
- **라우터:** react-router-dom

## 브랜딩 규칙
- 사이트명은 **부자타임** 또는 **BujaTime** 으로 통일
- "골든웨이브" 명칭은 사용하지 않음 (운영사 상호로만 제한적 사용)
- 이메일은 `hello@bujatime.com` 사용

## 도구(Tools) 개발 규칙

### 파일 위치
- 도구 목록 페이지: `src/pages/ToolsPage.tsx`
- 개별 도구: `src/pages/tools/{도구명}.tsx`
- 라우트: `src/App.tsx` 에서 `/tools/{slug}` 형태로 등록

### 디자인 패턴 (CompoundInterestCalculator 기준)
- **히어로:** `bg-gradient-to-r from-espresso-800 to-espresso-950` 다크 헤더
- **레이아웃:** `lg:grid-cols-5` (입력 2열 + 결과 3열)
- **입력 패널:** `sticky top-24` 흰 카드, `border-2 border-oatmeal-200 rounded-xl` 인풋
- **결과 카드:** 다크 그라데이션 핵심 결과 + 흰 카드들 (비율 바, 차트, 테이블)
- **팁 섹션:** `bg-gradient-to-br from-golden-50 to-cream-100` 팁 카드
- **아이콘:** lucide-react 사용

### 반응형 필수 (PC + 모바일)
- **항상 PC 버전과 모바일 버전 두 가지를 신경 써서 만들 것**
- 그리드: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` 등 단계적 반응형
- 결과 카드 내 grid: `grid-cols-1 sm:grid-cols-3` (모바일 1열, PC 3열)
- 빠른 선택 버튼: `flex flex-wrap gap-2` (모바일에서 줄바꿈)
- 폰트 사이즈: `text-base sm:text-lg` 등 모바일 우선
- 테이블: `overflow-x-auto` 필수
- 히어로 제목: `text-3xl md:text-4xl` 반응형 타이포그래피

### 새 도구 추가 시 체크리스트
1. `src/pages/tools/{도구명}.tsx` 생성
2. `src/App.tsx` 에 import + Route 추가
3. `src/pages/ToolsPage.tsx` 에서 해당 도구 `ready: true` + `href` 설정
4. `npm run build` 에러 없는지 확인
5. 모바일 뷰 (375px) 에서 레이아웃 깨짐 없는지 확인

### 도구 목록 현황
| # | 도구 | 상태 | 경로 |
|---|------|------|------|
| 1 | 복리 계산기 | 완성 | `/tools/compound-interest` |
| 2 | 대출 이자 계산기 | 완성 | `/tools/loan-interest` |
| 3 | 연봉 실수령액 계산기 | 완성 | `/tools/salary` |
| 4 | 적금/예금 이자 계산기 | 완성 | `/tools/savings` |
| 5 | 퇴직금 계산기 | 미구현 | `/tools/severance` |
| 6 | 연금 수령액 계산기 | 미구현 | `/tools/pension` |
| 7 | 부동산 수익률 계산기 | 미구현 | `/tools/real-estate` |
| 8 | BMI 계산기 | 미구현 | `/tools/bmi` |
| 9 | 나이/만나이 계산기 | 미구현 | `/tools/age` |
| 10 | 환율 계산기 | 미구현 | `/tools/exchange-rate` |
