// DESIGN.md 6장의 하단 탭 아이콘 경로
export type TabIconName = 'timer' | 'sound' | 'library' | 'stats';

const paths: Record<TabIconName, JSX.Element> = {
  timer: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5M9 2h6" />
    </>
  ),
  sound: <path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2" />,
  library: (
    <>
      <rect x="4" y="4" width="4" height="16" />
      <rect x="9" y="6" width="4" height="14" />
      <path d="M15 6.5l3.8-1 3 13.5-3.8 1z" />
    </>
  ),
  stats: <path d="M4 20h16M7 16v-5M12 16V7M17 16V8" />,
};

export function TabIcon({ name, active }: { name: TabIconName; active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 1.8 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
