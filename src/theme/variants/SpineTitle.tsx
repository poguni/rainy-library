/**
 * 책등 제목(두 테마 공통): 실제 책등처럼 세로 한 줄로 쓰고, 넘치면 끝을 '…'로 줄입니다.
 * 화면에서만 줄어들고, 화면 읽기 프로그램은 제목 전체를 읽습니다.
 */
export function SpineTitle({ title, className = '' }: { title: string; className?: string }) {
  return (
    <span
      className={`block max-h-full min-h-0 overflow-hidden text-ellipsis whitespace-nowrap [writing-mode:vertical-rl] ${className}`}
    >
      {title}
    </span>
  );
}
