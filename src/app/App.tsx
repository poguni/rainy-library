import { Navigate, Route, Routes } from 'react-router-dom';
import { TabBar } from './TabBar';
import { ThemeSync } from '../theme/ThemeSync';
import { TimerProvider } from '../features/timer/TimerProvider';
import { TimerPage } from '../features/timer/TimerPage';
import { SoundPage } from '../features/sound/SoundPage';
import { LibraryPage } from '../features/library/LibraryPage';
import { PrintPage } from '../features/stats/PrintPage';
import { StatsPage } from '../features/stats/StatsPage';
import { SettingsPage } from '../features/settings/SettingsPage';

export default function App() {
  return (
    <TimerProvider>
      <ThemeSync />
      <div className="mx-auto min-h-dvh max-w-[480px] bg-bg pb-[var(--tabbar-height)] text-ink print:max-w-none print:pb-0">
        <main className="px-[var(--screen-pad-x)] pt-6 print:p-0">
          <Routes>
            <Route path="/" element={<Navigate to="/timer" replace />} />
            <Route path="/timer" element={<TimerPage />} />
            <Route path="/sound" element={<SoundPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/stats/settings" element={<SettingsPage />} />
            <Route path="/stats/print" element={<PrintPage />} />
            <Route path="*" element={<Navigate to="/timer" replace />} />
          </Routes>
        </main>
        <TabBar />
        <div aria-hidden="true" className="screen-frame" />
      </div>
    </TimerProvider>
  );
}
