// DESIGN.md 6장의 환경음 아이콘
const PATHS: Record<string, JSX.Element> = {
  rain: (
    <>
      <path d="M7 14h10a3.5 3.5 0 0 0 .5-7A5 5 0 0 0 8 6.5 3.75 3.75 0 0 0 7 14z" />
      <path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3" />
    </>
  ),
  fire: <path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 0 2 1 3 2 3 0-3-1-5.5.5-8z" />,
  cafe: (
    <path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3v3M11 3v3" />
  ),
  // 아래 두 개는 DESIGN.md에 없어 같은 선 스타일로 새로 그렸습니다.
  // 빗소리 2: 우산
  rain2: (
    <>
      <path d="M3 12a9 9 0 0 1 18 0z" />
      <path d="M12 12v6a2 2 0 0 0 4 0M12 3V2" />
    </>
  ),
  // 귀뚜라미: 초승달 + 풀(시골 밤)
  crickets: (
    <>
      <path d="M16 3a6 6 0 1 0 5 9 5 5 0 0 1-5-9z" />
      <path d="M4 21c1-3 1-5 0-8M8 21c0-3 1-5 3-7M12 21c0-2 0-3-1-5" />
    </>
  ),
};

export function SoundIcon({ id, size = 18 }: { id: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[id]}
    </svg>
  );
}
