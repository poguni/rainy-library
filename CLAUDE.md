# CLAUDE.md — 빗소리 서재(Rainy Library)

이 파일은 Claude Code가 이 저장소에서 작업할 때 항상 따르는 지침입니다.

## 프로젝트 한 줄 요약
책 읽는 시간을 재고(뽀모도로), 빗소리·장작·카페 소음과 내 음악을 섞어 집중 환경을 만드는 **오프라인 우선 PWA**. 두 가지 테마(종이 서재 / 에메랄드 서재)를 사용자가 고른다.

## 먼저 읽을 문서
| 문서 | 내용 | 언제 |
|---|---|---|
| `docs/PRD.md` | 기능 요구사항(ID: T-, P-, B-, M-, L-, C-, W-, TH-), 계산식, 데이터 모델 | 기능을 만들기 전 |
| `docs/DESIGN.md` | 두 테마의 색·글꼴·부품 규칙 | 화면을 만들기 전 |
| `docs/design/tokens.css` | 디자인 토큰 원본 → `src/theme/tokens.css`로 복사해서 사용 | 1단계 |
| `docs/design/*-mockup.html` | 화면 시안(브라우저로 열어 확인) | 화면 작업 시 |
| `docs/TASKS.md` | 단계별 작업 순서와 완료 기준 | 매 작업 시작 시 |
| `docs/ASSETS.md` | 환경음·글꼴·아이콘 준비 목록과 라이선스 | 오디오·글꼴 작업 시 |
| `docs/seed-data.json` | 개발용 샘플 책·세션 | 화면 확인용 |

문서와 다르게 만들어야 할 이유가 생기면 **임의로 바꾸지 말고 먼저 물어본다.**

## 기술 스택
- Vite + React 18 + TypeScript(strict)
- Tailwind CSS (색·글꼴은 CSS 변수 토큰에 연결)
- Dexie.js (IndexedDB)
- Web Audio API (직접 구현, 오디오 라이브러리 사용 안 함)
- vite-plugin-pwa (Workbox)
- 통계 그래프: 라이브러리 없이 직접 그림(2026-11-02 결정, Recharts 대신)
- exceljs (엑셀 내보내기, 버튼을 누를 때만 불러옴)
- Vitest + Testing Library (테스트), Playwright (E2E, 필요할 때)
- 패키지 매니저: npm

새 라이브러리를 추가하기 전에 이유를 말하고 확인을 받는다.

## 명령어
```bash
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기(PWA·오프라인 확인)
npm run test       # Vitest
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## 폴더 구조
```
src/
├─ app/            # 라우팅, 하단 탭, 레이아웃
├─ features/
│  ├─ timer/       # 뽀모도로·자유 모드, 세션 종료 시트
│  ├─ sound/       # 오디오 엔진, 믹서, 프리셋, 재생 목록
│  ├─ library/     # 책 목록·상세·등록
│  ├─ stats/       # 그래프, 독서 달력
│  └─ settings/    # 설정, 테마 선택, 백업
├─ db/             # Dexie 스키마, 저장소 함수
├─ lib/            # 순수 함수(읽기 속도, 완독 예상일, 시간 형식)
├─ theme/
│  ├─ tokens.css
│  ├─ themes.ts
│  ├─ useTheme.ts
│  └─ variants/{paper,emerald}/  # TimerFace, SoundControls, FinishCard, BookSpine
└─ assets/sounds/  # 환경음 파일
```

## 꼭 지킬 규칙

### 디자인·테마
- 화면 코드에 색상값(`#…`, `rgb()`)과 글꼴 이름을 **직접 쓰지 않는다.** 항상 토큰(`var(--color-…)` 또는 Tailwind의 `bg-surface`, `text-ink` 같은 이름)을 쓴다.
- 테마마다 모양이 다른 부품은 `TimerFace`, `SoundControls`, `FinishCard`, `BookSpine` **4종뿐**이다. 그 밖의 화면은 두 테마가 같은 마크업을 쓴다.
- 테마 전용 부품에는 저장·계산 로직을 넣지 않는다. 로직은 `features/*/use*.ts` 훅에 두고, 부품은 props로 받아 그리기만 한다.
- 새 화면을 만들면 **두 테마에서 모두** 확인한다.

### 접근성
- 누를 수 있는 것은 `<button>` 또는 `<a>`. 아이콘만 있는 버튼에는 `aria-label`.
- 입력칸에는 `<label>`, 슬라이더는 `<input type="range">` + `aria-label`.
- 누르는 영역은 44×44px 이상. 글자 대비 4.5:1 이상.

### 타이머·오디오
- 타이머는 `setInterval` 횟수로 세지 않는다. **시작 시각과 일시정지 누적 시간**을 저장하고 `Date.now()`로 계산한다(새로고침·백그라운드 후에도 정확해야 함).
- `AudioContext`는 앱 전체에 하나만 만든다. 사용자가 버튼을 누른 뒤에 `resume()`한다.
- 볼륨 변화는 `linearRampToValueAtTime`으로 부드럽게(뚝 끊기는 소리 방지).

### 데이터
- 모든 데이터는 기기(IndexedDB)에만 저장한다. 외부 서버 전송, 분석 도구, 광고 SDK는 넣지 않는다.
- Dexie 스키마를 바꿀 때는 버전을 올리고 마이그레이션을 쓴다. 기존 데이터를 지우지 않는다.
- ID는 `ses_`, `book_`, `preset_`, `track_` 접두어 + 무작위 문자열.

### 코드
- 계산 함수(`lib/`)는 순수 함수로 만들고 **반드시 단위 테스트**를 쓴다. 특히 읽기 속도, 완독 예상일, 타이머 남은 시간.
- 컴포넌트 파일은 200줄을 넘기지 않도록 나눈다.
- 화면 문구는 한국어, 존댓말. 문구 규칙은 `docs/DESIGN.md` 12장.
- 코드 주석과 커밋 메시지는 한국어로 짧게 써도 된다.

## 작업 방식
1. `docs/TASKS.md`에서 **한 번에 한 단계**만 진행한다.
2. 시작하기 전에 무엇을 바꿀지 짧게 계획을 말한다.
3. 끝나면 `npm run typecheck && npm run lint && npm run test`를 통과시킨다.
4. 해당 단계의 **완료 기준**을 하나씩 확인하고, `TASKS.md`의 체크박스를 `[x]`로 바꾼다.
5. 단계마다 커밋한다. 메시지 예: `feat(timer): 시작 시각 기준 뽀모도로 타이머`.

## 잠정 결정(바뀌면 여기와 PRD 14장을 함께 고친다)
- 프레임워크: React + TypeScript
- 4-1 독서 연대기 연동: v1.2 전까지 JSON 파일 내보내기
- 환경음: CC0 무료 음원
- 자동 테마 기본 규칙: 기기 다크 모드 따르기
- 배포: GitHub Pages(`https://poguni.github.io/rainy-library/`, `.github/workflows/deploy.yml`, 2026-11-02 결정)
