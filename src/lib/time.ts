/** 초를 "6시간 20분" / "25분" / "0분" 형태로 바꿉니다(분 아래는 버림). */
export function formatDuration(totalSeconds: number): string {
  const totalMin = Math.floor(Math.max(0, totalSeconds) / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}
