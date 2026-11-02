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
      className="fixed inset-x-0 bottom-0 mx-auto max-w-[480px] border-t border-line bg-surface print:hidden emerald:border-t-0 emerald:bg-bg emerald:px-[22px] emerald:pb-2"
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
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="hidden size-[5px] rotate-45 bg-accent emerald:block"
                    />
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
