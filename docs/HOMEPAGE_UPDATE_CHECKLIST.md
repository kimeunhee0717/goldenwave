# 골든웨이브 홈페이지 업데이트 체크리스트

> FreshWeb → 골든웨이브 마케팅 에이전시 홈페이지 전환 작업

**작업 상태: 완료**
**완료일: 2026-02-01**

---

## Phase 1: 기존 컴포넌트 업데이트

### 1.1 Navbar.tsx
- [x] 로고 변경: "F" → 파도 아이콘 (Waves)
- [x] 브랜드명 변경: "FreshWeb" → "골든웨이브"
- [x] 메뉴 항목 변경: 서비스, 포트폴리오, 팀 소개, 문의하기
- [x] CTA 버튼 변경: "무료로 시작하기" → "상담 신청"
- [x] 색상 테마: 골드/앰버 계열로 변경

### 1.2 Hero.tsx
- [x] 헤드라인 변경: "브랜드의 가치를 파도처럼 퍼트리는 마케팅 파트너"
- [x] 미션 문구 추가: "모든 브랜드가 금빛 파도를 타고 성공의 해변에 도달하도록"
- [x] 배경 효과: 골드/앰버 그라데이션으로 변경
- [x] CTA 버튼: "무료 마케팅 진단 신청", "서비스 자세히 보기"
- [x] 성과 지표 카드: ROI 320%, KPI 달성률 94%, 누적 프로젝트 200+

### 1.3 Features.tsx → Services.tsx (새 파일 생성)
- [x] 새 컴포넌트 생성 (Services.tsx)
- [x] 섹션 제목 변경: "핵심 서비스"
- [x] 5개 서비스 카드 구현:
  - [x] 브랜드 전략 수립 (Brand Strategy)
  - [x] 디지털 마케팅 (Digital Marketing)
  - [x] 크리에이티브 제작 (Creative Production)
  - [x] 퍼블릭 리레이션 (PR & Communication)
  - [x] 데이터 분석 & 인사이트 (Data Analytics)
- [x] 각 서비스별 상세 항목 표시
- [x] 아이콘 변경 (서비스에 맞는 아이콘)

### 1.4 ThemeGallery.tsx → Portfolio.tsx (새 파일 생성)
- [x] 새 컴포넌트 생성 (Portfolio.tsx)
- [x] 섹션 제목 변경: "성공 사례"
- [x] 4개 포트폴리오 케이스:
  - [x] 글로우업 SNS 캠페인 (뷰티 브랜드)
  - [x] 쿡마스터 리브랜딩 (주방가전)
  - [x] 핏플레이스 투자 유치 PR (스타트업)
  - [x] 스트릿라이프 글로벌 진출 (패션 브랜드)
- [x] 각 케이스별 과제, 전략, 성과 표시
- [x] 성과 수치 강조 (팔로워 증가, 매출 상승 등)

### 1.5 Testimonials.tsx
- [x] 섹션 헤더 변경: "고객 후기"
- [x] 4개 고객 후기로 변경:
  - [x] 글로우업 뷰티 대표 김OO
  - [x] 쿡마스터 마케팅 팀장 박OO
  - [x] 핏플레이스 CEO 이OO
  - [x] 스트릿라이프 글로벌팀 장OO
- [x] 후기 내용 업데이트
- [x] 아바타 이미지 변경

### 1.6 CallToAction.tsx → ContactCTA.tsx (새 파일 생성)
- [x] 새 컴포넌트 생성 (ContactCTA.tsx)
- [x] 헤드라인 변경: 상담 신청 안내
- [x] 신규 고객 특별 혜택 표시
- [x] "무료 마케팅 진단 리포트 제공" 강조
- [x] CTA 버튼: "상담 신청하기", "서비스 요금 보기"
- [x] 7일 내 계약 시 20% 할인 이벤트 안내

### 1.7 Footer.tsx
- [x] 브랜드명 변경: "골든웨이브"
- [x] 브랜드 설명 업데이트
- [x] 연락처 정보:
  - [x] 이메일: hello@goldenwave.co.kr
  - [x] 전화: 02-1234-5678
  - [x] 카카오톡: @goldenwave
- [x] 주소 정보:
  - [x] 본사: 서울특별시 강남구 테헤란로 123
  - [x] 분사: 부산광역시 해운대구 센텀중앙로 45
- [x] 사업자등록번호 추가
- [x] 푸터 링크 업데이트 (서비스, 지원, 회사 섹션)
- [x] 소셜 미디어 링크 유지

---

## Phase 2: 새 컴포넌트 생성

### 2.1 CoreValues.tsx
- [x] 섹션 제목: "골든웨이브가 다른 3가지 이유"
- [x] 3개 핵심 가치 카드:
  - [x] 데이터 기반의 직관 (Data-Driven Intuition)
  - [x] 360° 통합 솔루션 (360° Integrated Solution)
  - [x] 성과 보장 시스템 (Performance Guarantee)
- [x] 각 가치별 상세 설명 3개

### 2.2 Process.tsx
- [x] 섹션 제목: "4단계 골든 웨이브 프로세스"
- [x] 4단계 시각화:
  - [x] 1️⃣ 발견 (DISCOVER)
  - [x] 2️⃣ 설계 (DESIGN)
  - [x] 3️⃣ 실행 (DELIVER)
  - [x] 4️⃣ 발전 (DEVELOP)
- [x] 각 단계별 설명 표시
- [x] 타임라인 UI (데스크톱/모바일 반응형)

### 2.3 Team.tsx
- [x] 섹션 제목: "팀 소개"
- [x] 핵심 리더 3인 프로필:
  - [x] 임정훈 - 대표이사 / 전략 디렉터
  - [x] 서민준 - 디지털 마케팅 디렉터
  - [x] 최유진 - 크리에이티브 디렉터
- [x] 각 프로필: 사진, 이름, 직책, 경력, 인용구
- [x] 팀 구성 요약 (15명: 전략3, 디지털4, 크리에이티브5, 미디어3)

### 2.4 Stats.tsx
- [x] 성과 지표 섹션 (2024년 기준)
- [x] 6개 핵심 지표 표시:
  - [x] 누적 프로젝트: 200+
  - [x] 고객 유지율: 85%
  - [x] 평균 ROI: 320%
  - [x] 캠페인 성과 달성률: 94%
  - [x] 직원 만족도: 4.8/5.0
  - [x] 재계약률: 78%

### 2.5 Partners.tsx
- [x] 섹션 제목: "파트너사"
- [x] 3개 파트너 카테고리:
  - [x] 미디어 파트너 (네이버, 카카오, 구글, 메타)
  - [x] 인플루언서 네트워크 (5,000+ 인플루언서)
  - [x] 제작 파트너 (영상, 웹개발, 인쇄)

### 2.6 FAQ.tsx
- [x] 섹션 제목: "자주 묻는 질문"
- [x] 5개 FAQ 아코디언:
  - [x] Q1: 최소 계약 기간
  - [x] Q2: 예산 범위
  - [x] Q3: 성과 미달 시 대응
  - [x] Q4: 업종 제한
  - [x] Q5: 해외 마케팅 가능 여부
- [x] 아코디언 UI (열기/닫기)

### 2.7 Awards.tsx
- [x] 섹션 제목: "수상 및 인증"
- [x] 5개 수상/인증 내역:
  - [x] 2024 대한민국 마케팅 대상
  - [x] 2023 광고주협회 브랜드 혁신상
  - [x] 2023 구글 파트너 공식 인증
  - [x] 2022 메타 비즈니스 파트너 인증
  - [x] 2021 중소벤처기업부 우수 기업

### 2.8 ContactForm.tsx
- [x] 섹션 제목: "무료 마케팅 진단 신청"
- [x] 폼 필드:
  - [x] 회사명
  - [x] 담당자명
  - [x] 연락처
  - [x] 이메일
  - [x] 희망 서비스 (체크박스)
  - [x] 예산 범위 (라디오)
  - [x] 문의사항 (텍스트에어리어)
- [x] 제출 버튼

---

## Phase 3: 통합 및 마무리

### 3.1 App.tsx 업데이트
- [x] 새 컴포넌트 import
- [x] 섹션 순서 배치:
  1. Navbar
  2. Hero
  3. Services
  4. CoreValues
  5. Process
  6. Portfolio
  7. Stats
  8. Team
  9. Testimonials
  10. Partners
  11. FAQ
  12. Awards
  13. ContactCTA
  14. ContactForm
  15. Footer

### 3.2 추가 파일 업데이트
- [x] metadata.json - 브랜드명 변경
- [x] index.html - 페이지 타이틀 변경

### 3.3 스타일 통일
- [x] 컬러 팔레트 통일 (골드/앰버 테마)
- [x] 타이포그래피 일관성 확인
- [x] 반응형 디자인 구현

---

## 변경된 파일 목록

### 수정된 파일 (7개)
1. `components/Navbar.tsx`
2. `components/Hero.tsx`
3. `components/Testimonials.tsx`
4. `components/Footer.tsx`
5. `App.tsx`
6. `metadata.json`
7. `index.html`

### 새로 생성된 파일 (8개)
1. `components/Services.tsx`
2. `components/CoreValues.tsx`
3. `components/Process.tsx`
4. `components/Portfolio.tsx`
5. `components/Stats.tsx`
6. `components/Team.tsx`
7. `components/Partners.tsx`
8. `components/FAQ.tsx`
9. `components/Awards.tsx`
10. `components/ContactCTA.tsx`
11. `components/ContactForm.tsx`

### 더 이상 사용되지 않는 파일 (3개)
1. `components/Features.tsx` - Services.tsx로 대체
2. `components/ThemeGallery.tsx` - Portfolio.tsx로 대체
3. `components/CallToAction.tsx` - ContactCTA.tsx로 대체

---

## 완료 요약

**총 작업 항목**: 100개 이상
**완료율**: 100%

모든 goldenwave-homepage.md 내용이 홈페이지에 반영되었습니다:
- 브랜드 아이덴티티 (골든웨이브)
- 미션 및 캐치프레이즈
- 5개 핵심 서비스
- 4개 성공 사례 (포트폴리오)
- 3가지 핵심 가치
- 4단계 프로세스
- 팀 소개 (3명 리더 + 팀 구성)
- 성과 지표 (6개)
- 고객 후기 (4개)
- 파트너사
- FAQ (5개)
- 수상 및 인증 (5개)
- 연락처 및 상담 신청 폼
- 신규 고객 혜택

---

*생성일: 2026-02-01*
*완료일: 2026-02-01*
*프로젝트: 골든웨이브 홈페이지 전환*
