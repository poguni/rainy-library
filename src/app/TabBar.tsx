import { NavLink } from 'react-router-dom';
import { TabIcon, type TabIconName } from './TabIcon';

const tabs: { to: string; label: string; icon: TabIconName }[] = [
  { to: '/timer', label: '타이머', icon: 'timer' },
  { to: '/sound', label: '사운드', icon: 'sound' },
  { to: '/library', label: '서재', icon: 'library' },
  { to: '/stats', label: '기록', icon: 'stats' },
];

export function TabBar() {
  return (
    <nav
      aria-label="주요 화면"
      className="fixed inset-x-0 bottom-0 mx-auto max-w-[480px] border-t border-line bg-surface"
    >
      <ul className="grid grid-cols-4">
        {tabs.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                `flex min-h-[52px] flex-col items-center justify-center gap-1 py-2 text-xs ${
                  isActive ? 'font-bold text-accent' : 'text-ink-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <TabIcon name={tab.icon} active={isActive} />
                  <span>{tab.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
