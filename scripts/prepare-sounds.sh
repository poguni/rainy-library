#!/usr/bin/env bash
# 원본 환경음(sound-originals/*.m4a)을 앱용으로 다듬어 src/assets/sounds/에 저장합니다(docs/ASSETS.md 기준).
#  - 앞부분 페이드 인 잘라내기(rain_2만 2초)
#  - 통합 음량 −23 LUFS로 맞춤(볼륨만 조정, 넘치는 순간은 −1dB에서 제한)
#  - AAC 96kbps
# 사용: bash scripts/prepare-sounds.sh
set -e
cd "$(dirname "$0")/.."
TARGET=-23
for src in sound-originals/*.m4a; do
  name=$(basename "$src" .m4a)
  trim=0
  [ "$name" = rain_2 ] && trim=2
  I=$(ffmpeg -nostats -ss "$trim" -i "$src" -af ebur128 -f null - 2>&1 | awk '/^ +I:/{v=$2} END{print v}')
  gain=$(awk -v t="$TARGET" -v i="$I" 'BEGIN{printf "%.2f", t-i}')
  ffmpeg -v error -y -ss "$trim" -i "$src" -af "volume=${gain}dB,alimiter=limit=0.89:level=false" \
    -c:a aac -b:a 96k "src/assets/sounds/$name.m4a"
  echo "$name: ${I} LUFS → ${TARGET} LUFS (${gain}dB), 앞 ${trim}초 잘라냄"
done
