# 빗소리 서재 개발 키트 — 시작하기

Claude Code로 '빗소리 서재(Rainy Library)'를 만들기 위한 자료 묶음입니다.

## 들어 있는 것
```
rainy-library-kit/
├─ START_HERE.md          ← 지금 이 파일(사람이 읽는 안내서)
├─ CLAUDE.md              ← Claude Code가 자동으로 읽는 개발 지침
└─ docs/
   ├─ PRD.md / PRD.html   ← 제품 요구사항(무엇을 만들지)
   ├─ DESIGN.md / .html   ← 두 테마의 디자인 규칙(어떻게 보일지)
   ├─ TASKS.md            ← 단계별 작업 순서와 완료 기준
   ├─ ASSETS.md           ← 직접 준비할 소리·글꼴·아이콘 목록
   ├─ seed-data.json      ← 화면 확인용 샘플 데이터
   └─ design/
      ├─ tokens.css            ← 디자인 토큰(코드에 그대로 복사)
      ├─ paper-mockup.html     ← 종이 서재 시안
      └─ emerald-mockup.html   ← 에메랄드 서재 시안
```

## 시작 순서

**1. 프로젝트 폴더 만들기**
빈 폴더(예: `rainy-library`)를 만들고 이 키트의 내용물을 **그대로** 넣습니다. `CLAUDE.md`는 반드시 폴더 맨 위에 있어야 Claude Code가 자동으로 읽습니다.

```bash
mkdir rainy-library && cd rainy-library && git init
```

**2. 사람이 먼저 할 일** (`docs/ASSETS.md` 참고)
- 환경음 3종(빗소리·장작·카페) 구하기 — 없어도 4단계 전까지는 개발할 수 있습니다.
- PRD 14장의 '잠정 결정'을 훑어보고, 바꿀 것이 있으면 PRD와 `CLAUDE.md`를 함께 고칩니다.

**3. Claude Code 실행 후 첫 요청**
```bash
claude
```
그다음 아래 문장을 붙여 넣습니다.

> CLAUDE.md, docs/PRD.md, docs/DESIGN.md, docs/TASKS.md를 읽고 이 프로젝트를 이해한 내용을 5줄로 요약해 줘. 궁금한 점이 있으면 먼저 물어봐 줘. 그다음 TASKS.md의 0단계를 진행해 줘.

**4. 단계마다 반복**
> TASKS.md의 ○단계를 진행해 줘. 끝나면 완료 기준을 하나씩 확인하고 체크박스를 표시한 뒤 커밋해 줘.

- 화면 작업 때는 "docs/design/paper-mockup.html과 비교해 줘"처럼 시안을 기준으로 삼게 합니다.
- 한 번에 여러 단계를 맡기지 마세요. 단계가 끝날 때마다 `npm run dev`로 직접 확인하는 것이 가장 빠릅니다.

## 일정 한눈에 보기
| 단계 | 내용 | 결과 |
|---|---|---|
| 0~5 | 준비 → 서재 → 타이머 → 속도·완독일 → 믹서 → PWA | **MVP** (약 2주) |
| 6~7 | 음악 재생 목록·프리셋 → 통계·백업 | v1.1 기능 |
| 8~9 | 에메랄드 테마 → 테마 선택·자동 전환 | **v1.1 완성** (약 3.5주) |
