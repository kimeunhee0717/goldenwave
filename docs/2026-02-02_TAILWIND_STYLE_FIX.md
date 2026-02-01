# Tailwind CSS 스타일 깨짐 문제 분석 및 해결

> 작성일: 2026-02-02
> 프로젝트: 골든웨이브 인사이트 블로그

---

## 문제 현상

배포된 사이트에서 모든 스타일이 적용되지 않음:
- 네비게이션 바 스타일 없음
- 버튼 스타일 없음
- 카드 배경색/그림자 없음
- 레이아웃 깨짐
- 색상 적용 안됨

---

## 원인 분석

### 핵심 원인: Tailwind CSS v4와 v3 설정 방식 불일치

설치된 버전:
```
tailwindcss@4.1.18
@tailwindcss/postcss@4.1.18
@tailwindcss/typography@0.5.19
```

**문제점:** Tailwind CSS v4는 완전히 새로운 설정 방식을 사용하지만, 프로젝트는 v3 방식으로 설정되어 있음.

### Tailwind v3 vs v4 차이점

| 항목 | v3 (기존 설정) | v4 (새로운 방식) |
|------|---------------|-----------------|
| CSS 임포트 | `@tailwind base;` | `@import "tailwindcss";` |
| 설정 파일 | `tailwind.config.js` 필수 | CSS 내 `@theme` 사용 |
| 플러그인 | `require('@tailwindcss/typography')` | `@plugin "@tailwindcss/typography"` |
| PostCSS | `tailwindcss: {}` | `@tailwindcss/postcss: {}` |
| 커스텀 색상 | config 파일에서 정의 | CSS `@theme` 블록에서 정의 |

### 현재 프로젝트 상태

**index.css (v3 방식):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**tailwind.config.js (v3 방식):**
```javascript
export default {
  content: [...],
  theme: { extend: { colors: { primary: {...} } } },
  plugins: [require('@tailwindcss/typography')]
}
```

**postcss.config.js (v4 플러그인 사용):**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},  // v4 플러그인
    autoprefixer: {},
  }
}
```

→ **v4 PostCSS 플러그인**이 **v3 설정 파일**을 읽지 못해 스타일이 생성되지 않음

---

## 해결 방법

### 방법 1: Tailwind v3으로 다운그레이드 (권장)

**장점:**
- 빠른 수정 가능
- 기존 설정 파일 그대로 사용
- 안정적이고 문서화가 잘 되어 있음

**단점:**
- 최신 기능 사용 불가

**실행:**
```bash
npm uninstall tailwindcss @tailwindcss/postcss @tailwindcss/typography
npm install -D tailwindcss@3 postcss autoprefixer @tailwindcss/typography
```

**postcss.config.js 수정:**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
```

### 방법 2: Tailwind v4 방식으로 마이그레이션

**장점:**
- 최신 기능 사용 가능
- 더 나은 성능

**단점:**
- 설정 전면 수정 필요
- 새로운 문법 학습 필요

**실행:**

1. **index.css 수정:**
```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --font-sans: "Noto Sans KR", sans-serif;

  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
}

/* Custom styles */
html {
  scroll-behavior: smooth;
}
```

2. **tailwind.config.js 삭제** (또는 content 경로만 유지)

---

## 선택한 해결 방법

**방법 1: Tailwind v3으로 다운그레이드** 선택

이유:
1. 기존 코드 변경 최소화
2. 빠른 수정 가능
3. 안정성 검증됨
4. @tailwindcss/typography 플러그인 호환성 보장

---

## 적용 절차

1. 기존 패키지 제거
2. Tailwind v3 및 관련 패키지 설치
3. postcss.config.js 수정
4. 빌드 테스트
5. 재배포

---

## 예방 조치

향후 유사 문제 예방을 위해:

1. **패키지 설치 시 버전 명시:**
   ```bash
   npm install -D tailwindcss@3
   ```

2. **package.json에 버전 고정:**
   ```json
   "tailwindcss": "^3.4.0"  // ^3으로 v3 범위 내 업데이트만 허용
   ```

3. **설정 방식 확인:**
   - v3: `tailwind.config.js` + `@tailwind` directives
   - v4: CSS 내 `@theme` + `@import "tailwindcss"`

---

*문서 작성: 2026-02-02*
