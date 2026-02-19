# AI 이미지 생성 마스터: Midjourney와 Stable Diffusion 실전

**발행일**: 2024-02-06 
**카테고리**: 디지털 스킬 중급 
**난이도**: ⭐⭐⭐ (중급) 
**대상**: AI로 프로페셔널한 이미지를 만들고 싶은 분 
**읽는 시간**: 18분

---

## 이미지도 AI가 그린다고요?

"AI가 그린 그림, 품질이 괜찮나요?" 
"상업적으로 써도 되나요?" 
"프롬프트는 어떻게 써야 하나요?"

이제 AI 이미지 생성은 **도구** 가 되었습니다. 
디자이너가 아니어도, 3초 만에 프로페셔널한 이미지를 만들 수 있어요. 
**Midjourney **와 ** Stable Diffusion**을 마스터필 봅시다.

---

## 1. AI 이미지 생성 기초

### 1-1. 원리 쉽게 이해하기

**어떻게 작동하나요?**
```
1. 수십억 장의 이미지 학습
2. 텍스트와 이미지 관계 학습
3. 입력된 텍스트(프롬프트) 분석
4. 새로운 이미지 생성
```

**쉬운 비유:**
> 마치 **수천 개의 퍼즐** 을 본 뒤, 
> "파란 하늘 아래 고양이"라는 설명을 듣고 
> 처음부터 새 퍼즐을 만드는 거예요. 
> 기존 퍼즐을 복사한 게 아니라, 
> 배운 패턴으로 **새로 만드는** 것이죠.

### 1-2. 주요 도구 비교

| 도구 | 특징 | 가격 | 난이도 | 상업용 |
|------|------|------|--------|--------|
| **Midjourney** | 예술적 품질 | $10/월 | 중간 | 가능 |
| **DALL-E 3** | ChatGPT 내장 | $20/월 | 쉬움 | 가능 |
| **Stable Diffusion** | 물론/커스텀 | 묶/자체 | 어려움 | 가능 |
| **Leonardo.ai** | 게임/캐릭터 | 묶/유료 | 중간 | 가능 |
| **Adobe Firefly** | 안전한 상업용 | 유료 | 쉬움 | 안전 |

---

## 2. Midjourney 마스터하기

### 2-1. 시작하기

**가입 및 사용:**
```
1. Discord 가입 (discord.com)
2. Midjourney 서버 접속
3. /subscribe로 요금제 선택
4. Newbie 채널 또는 DM으로 생성
```

**기본 명령어:**
```
/imagine [프롬프트] - 이미지 생성
/variations [번호] - 변형 생성
/upscale [번호] - 고화질 업스케일
/remix - 수정 모드
```

### 2-2. 프롬프트 구조

**기본 구조:**
```
[주제] + [세부사항] + [환경] + [스타일] + [품질] + [파라미터]
```

**완성 예시:**
```
a cute orange cat wearing sunglasses, 
sitting on a beach chair, 
sunset background, 
Pixar animation style, 
soft lighting, 
high quality, 
--ar 16:9 --v 6.0
```

**번역:**
```
귀여운 주황색 고양이가 선글라스를 쓰고
비치 체어에 앉아있음
일몰 배경
픽사 애니메이션 스타일
부드러운 조명
고품질
비율 16:9, 버전 6.0
```

### 2-3. 고급 프롬프트 파라미터

**필수 파라미터:**
```
--ar [비율]
--ar 16:9 (와이드)
--ar 9:16 (세로/모바일)
--ar 1:1 (정사각형)
--ar 2:3 (인물)

--v [버전]
--v 6.0 (최신)
--v 5.2 (안정적)
--niji 6 (애니메이션)

--stylize [예술성]
--s 50 (낮음, 프롬프트 충실)
--s 250 (기본)
--s 750 (높음, 예술적)
```

**고급 파라미터:**
```
--chaos [다양성]
--c 0 (일관적)
--c 50 (기본)
--c 100 (매우 다양함)

--seed [재현성]
--seed 12345 (같은 결과)

--no [제외]
--no text (텍스트 제외)
--no blur (흐림 제외)
```

### 2-4. 스타일별 프롬프트 사전

**🎨 예술 스타일:**
```
- oil painting (유화)
- watercolor (수채화)
- acrylic painting (아크릴)
- pencil sketch (연필 스케치)
- charcoal drawing (숯)
- pastel art (파스텔)
- digital art (디지털 아트)
```

**📸 사진 스타일:**
```
- DSLR photo (DSLR 사진)
- film photography (필름 사진)
- Polaroid (폴로이드)
- GoPro style (고프로)
- drone photography (드론)
- macro photography (접사)
- portrait photography (인물)
```

**🎬 애니메이션/영화:**
```
- Pixar style (픽사)
- Disney style (디즈니)
- Studio Ghibli (지브리)
- anime style (일본 애니)
- Marvel comic style (마블)
- cinematic lighting (영화같은 조명)
```

**🎭 예술가 스타일:**
```
- in the style of Van Gogh (반 고흐)
- Picasso style (피카소)
- Monet style (모네)
- Andy Warhol style (워홀)
- Hayao Miyazaki style (미야자키)
- Tim Burton style (버튼)
```

### 2-5. 실전 팁

**팁 1: 가중치 주기**
```
주제::2 배경::1 스타일::0.5
→ 주제를 더 강조

예:
cat::2 sleeping on sofa::1 
→ 고양이를 더 중요하게
```

**팁 2: 멀티 프롬프트**
```
[프롬프트 1] :: [프롬프트 2]

예:
hot day :: cold night
→ 낮과 밤을 섞음
```

**팁 3: 이미지 참조**
```
[이미지 URL] [프롬프트]
→ 업로드한 이미지를 참고

예:
[내 얼굴 사진 URL] as a superhero
```

---

## 3. Stable Diffusion 실전

### 3-1. Stable Diffusion이 뭔가요?

**특징:**
- **완전 물론** (오픈소스)
- 자신의 컴퓨터에서 실행
- 무제한 생성
- 커스텀 모델 지원

**실행 방법:**
```
방법 1: 로컬 설치
- Automatic1111 WebUI
- ComfyUI
→ 고사양 PC 필요 (GPU 권장)

방법 2: 클라우드
- Google Colab
- RunPod
→ 저사양 PC도 가능

방법 3: 웹사이트
- Civitai
- Tensor.art
→ 간편하지만 제한적
```

### 3-2. 핵심 개념

**모델 (Checkpoint):**
```
- 기본 모델: SD 1.5, SDXL
- 특화 모델: Realistic Vision, DreamShaper
- 다운로드: Civitai.com
```

**LoRA (미세조정):**
```
- 특정 스타일/캐릭터 학습
- 작은 파일 (MB 단위)
- 기본 모델 + LoRA 조합
```

**프롬프트 구조:**
```
Positive (포지티브):
(quality tags), (subject), 
(details), (environment), 
(style), (lighting)

Negative (네거티브):
(blurry), (worst quality), 
(bad anatomy), (extra limbs), 
(text), (watermark)
```

### 3-3. WebUI 사용법

**인터페이스:**
```
1. txt2img (텍스트→이미지)
 - 프롬프트 입력
 - 샘플링 스텝: 20-30
 - CFG Scale: 7-12
 - 생성 클릭

2. img2img (이미지→이미지)
 - 기존 이미지 업로드
 - 수정 정도 조절 (Denoising)
 - 변형 생성

3. Extras (기타 기능)
 - Upscale (고화질화)
 - PNG Info (정보 확인)
```

**파라미터 설명:**
```
🎛️ Sampling Steps:
- 20-30: 적정
- 50+: 더 정교하지만 오래 걸림

🎛️ CFG Scale:
- 7: 기본
- 3-5: 프롬프트 덜 따름
- 12-15: 프롬프트 강하게 따름

🎛️ Seed:
- -1: 랜덤
- 특정 숫자: 재현 가능
```

---

## 4. 상업적 활용과 저작권

### 4-1. 사용 가능 범위

**Midjourney:**
```
✅ 묶 사용자:
- 개인용 OK
- 상업용 OK (월 2만원 이하)
- Attribution 불필요

⚠️ 금지:
- 다른 플랫폼/API로 판매
- 다른 사람 흉내
- 불법 콘텐츠
```

**Stable Diffusion:**
```
✅ 완전 물론:
- 어떤 용도든 OK
- 수정/배포 OK
- 모델 학습도 OK

⚠️ 주의:
- 학습 데이터의 저작권
- 다른 사람 얼굴/작품 유사 주의
```

### 4-2. 안전한 상업 활용법

**원칙:**
```
1. 변형/편집 활용
 - AI 이미지를 베이스로
 - 포토샵 등으로 수정
 - 새로운 창작물로 탄생

2. 조합 사용
 - 여러 AI 이미지 합성
 - 실사 콘텐츠와 결합

3. 명시적 표기
 - "AI Generated" 표기
 - 고객에게 공개
 - 투명성 유지

4. 법률 검토
 - 중요한 상업용途은
 - 전문가 상담
```

---

## 5. 실전 활용 사례

### 사례 1: 블로그/콘텐츠 썸네일

**프롬프트:**
```
modern minimalist blog thumbnail,
colorful abstract shapes,
clean typography space,
professional design,
bold colors,
--ar 16:9 --v 6.0
```

**후처리:**
```
- Canva로 텍스트 추가
- 브랜드 컬러 적용
- 로고 삽입
```

### 사례 2: 제품 컨셉 이미지

**시나리오:**
```
아직 실물이 없는 새 제품
컨셉 이미지가 필요함
```

**프롬프트:**
```
sleek wireless earbuds,
matte white finish,
floating in air,
soft studio lighting,
apple style product photography,
minimalist background,
high detail, photorealistic,
--ar 1:1 --v 6.0
```

### 사례 3: 캐릭터 디자인

**시나리오:**
```
게임 캐릭터 초안 필요
```

**프롬프트:**
```
female warrior character design,
medieval armor with magic elements,
glowing blue sword,
dynamic pose,
concept art style,
multiple angles,
character sheet,
--ar 16:9 --niji 6
```

### 사례 4: 인테리어 컨셉

**프롬프트:**
```
modern Scandinavian living room,
natural light from large windows,
neutral colors with plants,
minimalist furniture,
cozy atmosphere,
interior design photography,
--ar 16:9 --v 6.0
```

---

## 6. 고급 테크닉

### 테크닉 1: Inpainting (부분 수정)

**사용법:**
```
1. 생성된 이미지에서
2. 수정하고 싶은 부분 선택
3. 새 프롬프트 입력
4. 해당 부분만 재생성

예:
"배경의 사람을 제거하고 풍경만 남겨줘"
```

### 테크닉 2: ControlNet (구도 통제)

**기능:**
```
- OpenPose: 포즈 정확히 통제
- Canny: 윤곽선 유지
- Depth: 깊이감 유지
- Lineart: 선화 기반 생성
```

**활용:**
```
- 캐릭터 포즈 통일
- 제품 각도 유지
- 건축물 구조 유지
```

### 테크닉 3: Img2Img 변형

**활용:**
```
1. 스케치 → 완성
 - 내 그림을 업로드
 - 스타일 프롬프트
 → 완성된 그림 생성

2. 사진 → 그림
 - 사진 업로드
 - "oil painting style"
 → 그림으로 변환

3. 낮 → 밤
 - 낮 사진 업로드
 - "night scene, neon lights"
 → 밤 버전 생성
```

---

## 7. 다음 단계

### 성장 로드맵

**단계 1: 기본기 (1-2주)**
```
- Midjourney로 100장 생성
- 다양한 프롬프트 실험
- 파라미터 이해
```

**단계 2: 스타일 정착 (2-4주)**
```
- 자신만의 프롬프트 템플릿
- 특정 스타일 마스터
- 후처리 워크플로우
```

**단계 3: 전문화 (1-2개월)**
```
- Stable Diffusion 설치
- 커스텀 모델 학습
- ControlNet 활용
- 상업 프로젝트 적용
```

---

## 마무리: AI와 함께 창작하기

AI 이미지 생성은 **도구** 입니다. 
마치 카메라가 화가를 대체하지 않듯, 
AI는 디자이너를 대체하지 않아요. 
**더 나은 결과를 만드는 도구**일 뿐입니다.

**오늘 시작하기:**
1. Midjourney 또는 Leonardo.ai 가입
2. 위 예시 프롬프트 5개 입력
3. 결과 비교 분석
4. 자신만의 프롬프트 3개 작성

---

**다음 강의 예고:** 
👉 **"Notion으로 올인원 워크스페이스 만들기"**

이미지도 만들었으니, 이제 생산성 도구로 업무를 정리해볼까요?

---

**작성자 디지털 스킬 강사** 
"AI는 당신의 상상력을 현실로 만듭니다! 🎨"
