/** 초를 "6시간 20분" / "25분" / "0분" 형태로 바꿉니다(분 아래는 버림). */
export function formatDuration(totalSeconds: number): string {
  const totalMin = Math.floor(Math.max(0, totalSeconds) / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

/** 대략의 시간: 10분 단위로 반올림한 "4시간", "4시간 10분"(10분 미만은 올림해 "7분") */
export function formatApproxMinutes(minutes: number): string {
  const m = minutes < 10 ? Math.max(1, Math.ceil(minutes)) : Math.round(minutes / 10) * 10;
  return formatDuration(m * 60);
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 날짜: "11월 14일 (토)" (DESIGN.md 12장) */
export function formatKoreanDate(date: Date): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
}

/** 타이머 숫자: "18:42", 1시간이 넘으면 "1:02:03" */
export function formatClock(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

const DAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

/** 머리말 "오늘의 한 줄"(DESIGN.md 9장): 요일 + 시간대별로 미리 정한 문장. 날씨는 쓰지 않음 */
export function todayLine(date: Date): string {
  const h = date.getHours();
  const day = DAYS[date.getDay()];
  if (h >= 5 && h < 12) return `${day} 아침, 천천히 한 장`;
  if (h >= 12 && h < 17) return `${day} 오후, 창가에 앉아`;
  if (h >= 17 && h < 21) return `${day} 저녁, 창밖엔 비`;
  return `${day} 밤, 빗소리와 함께`;
}
