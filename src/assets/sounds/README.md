# 환경음

| 파일 | 화면 이름 | 길이 | 비고 |
|---|---|---|---|
| `rain_1.m4a` | 창밖 빗소리 | 60초 | |
| `rain_2.m4a` | 처마 끝 빗소리 | 58초 | 원본 앞 2초(페이드 인) 잘라냄 |
| `fire.m4a` | 장작 | 60초 | |
| `cafe.m4a` | 카페 | 90초 | |
| `crickets.m4a` | 귀뚜라미 | 60초 | |

- 이 폴더의 파일은 `sound-originals/`의 원본을 `scripts/prepare-sounds.sh`로 다듬은 것입니다(−23 LUFS, AAC 96kbps).
- 음원을 바꾸려면 원본을 `sound-originals/`에 같은 이름으로 넣고 `bash scripts/prepare-sounds.sh`를 실행합니다.
- 반복 이음새는 앱이 불러올 때 1초 크로스페이드로 처리합니다(`src/lib/loop.ts`).
- 저작권: 비상업 목적 사용 허락을 제작자에게 다시 확인하는 중. 그동안 '흐르는 소리' 화면 아래에 `[출처] 유튜브 채널명`으로 간단히 표기합니다(`sounds.ts`의 `source`).
