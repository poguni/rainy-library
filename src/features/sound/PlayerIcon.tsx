// 플레이어 아이콘(DESIGN.md 6장: 선 아이콘, 24×24, 굵기 1.6, 둥근 끝)
const PATHS = {
  play: 'M8 5l11 7-11 7z',
  pause: 'M9 6v12M15 6v12',
  next: 'M6 6l8 6-8 6zM18 6v12',
  prev: 'M18 6l-8 6 8 6zM6 6v12',
  shuffle: 'M4 7h3c5 0 5 10 10 10h3M17 14l3 3-3 3M4 17h3c1.6 0 2.7-1 3.6-2.4M13.4 9.4C14.3 8 15.4 7 17 7h3M17 4l3 3-3 3',
  repeat: 'M4 11V9a2 2 0 0 1 2-2h13M16 4l3 3-3 3M20 13v2a2 2 0 0 1-2 2H5M8 20l-3-3 3-3',
  trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',
  plus: 'M12 5v14M5 12h14',
  music: 'M9 18V6l10-2v12M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
} as const;

export type PlayerIconName = keyof typeof PATHS;

export function PlayerIcon({ name, size = 22 }: { name: PlayerIconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={name === 'pause' ? 2.4 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
