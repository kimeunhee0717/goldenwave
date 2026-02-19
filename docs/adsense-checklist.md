# 부자타임 애드센스 승인 체크리스트

> 작성일: 2026-02-19
> 상태: **문제 발견 및 해결됨 - 배포 필요**

## 애드센스 경고 내용
- "게시자 콘텐츠가 없는 화면에 Google 게재 광고"
- "가치가 별로 없는 콘텐츠"

---

## 1단계: SSG/SSR 렌더링 확인

### 1.1 빌드된 HTML 파일 확인
- [x] `dist/index.html`에 실제 콘텐츠가 있는가? → **34KB (콘텐츠 포함)**
- [x] `dist/blog/index.html`이 존재하는가? → **399KB (161개 블로그 목록 포함)**
- [x] `dist/tools/index.html`이 존재하는가? → **56KB (도구 목록 포함)**
- [x] HTML에 `<div id="root"></div>` 외에 콘텐츠가 있는가? → **YES**

### 1.2 프리렌더 스크립트 작동 확인
- [x] `scripts/prerender.ts` 정상 실행되는가? → **YES (201개 페이지 생성)**
- [x] 빌드 시 에러 없는가? → **2개 실패 (google-analytics 관련), 나머지 성공**

---

## 핵심 문제 발견

### 원인
```
이전 빌드 시 puppeteer가 설치되지 않아 프리렌더가 실패함
→ dist/index.html에 <div id="root"></div> 만 존재
→ Google 크롤러가 빈 페이지로 인식
→ "가치가 별로 없는 콘텐츠" 경고
```

### 해결
```bash
npm install  # puppeteer 설치
npm run build  # 프리렌더 포함 빌드
```

### 결과
| 파일 | 이전 | 이후 |
|------|------|------|
| dist/index.html | 3KB (빈 껍데기) | 34KB (콘텐츠 포함) |
| dist/blog/index.html | 없음 | 399KB |
| dist/tools/index.html | 없음 | 56KB |
| 총 HTML 파일 | 1개 | **201개** |

---

## 2단계: 배포 필요

### 즉시 해야 할 일
- [ ] **새로 빌드된 dist/ 폴더를 호스팅 서버에 배포**
- [ ] 배포 후 https://bujatime.com 에서 View Source로 확인
- [ ] Google Search Console에서 URL 재검사 요청

### 배포 방법 (호스팅에 따라)
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# 수동 업로드
dist/ 폴더 전체를 호스팅 서버에 업로드
```

---

## 3단계: 배포 후 확인

### 3.1 View Source 테스트
- [ ] https://bujatime.com 에서 View Source로 HTML 확인
- [ ] JavaScript 없이 콘텐츠가 보이는가?

### 3.2 Google 크롤러 시뮬레이션
- [ ] Google Search Console URL 검사 결과
- [ ] 렌더링된 HTML에 콘텐츠 존재 여부

---

## 4단계: Google Search Console 확인

### 4.1 인덱싱 현황
- [ ] 총 인덱싱된 페이지 수
- [ ] 인덱싱 제외된 페이지 수 및 사유
- [ ] 크롤링 오류 여부

### 4.2 재인덱싱 요청
- [ ] sitemap.xml 재제출
- [ ] 주요 페이지 URL 검사 및 재인덱싱 요청
  - https://bujatime.com/
  - https://bujatime.com/blog
  - https://bujatime.com/tools

---

## 5단계: 애드센스 재심사

### 배포 완료 후
- [ ] 1-2주 대기 (Google 재크롤링)
- [ ] 애드센스 대시보드에서 "다시 검토 요청" (필요시)

---

## 콘텐츠 현황 (양호)

| 항목 | 수량 | 상태 |
|------|------|------|
| 블로그 포스트 | 161개 | ✅ |
| 도구/계산기 | 20개 | ✅ |
| 게임 | 6개 | ✅ |
| 사이트맵 URL | 196개 | ✅ |
| 프리렌더 HTML | 201개 | ✅ |

---

## 결론

**문제**: puppeteer 미설치로 SSG(프리렌더)가 작동하지 않아, Google 크롤러에게 빈 페이지로 보임

**해결**: `npm install && npm run build` 실행으로 201개 정적 HTML 생성 완료

**다음 단계**: **dist/ 폴더를 배포 서버에 업로드**

---

## 참고: 실패한 페이지 (2개)

1. `/blog/google-analytics-4-setup-guide`
2. `/blog/post-05-google-analytics-4-setup`

→ 마크다운 파일 또는 라우팅 문제 확인 필요 (영향 미미)
