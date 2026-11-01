import { Navigate, Route, Routes } from 'react-router-dom';
import { TabBar } from './TabBar';
import { TimerPage } from '../features/timer/TimerPage';
import { SoundPage } from '../features/sound/SoundPage';
import { LibraryPage } from '../features/library/LibraryPage';
import { StatsPage } from '../features/stats/StatsPage';

export default function App() {
  return (
    <div className="mx-auto min-h-dvh max-w-[480px] bg-bg pb-[var(--tabbar-height)] text-ink">
      <main className="px-[var(--screen-pad-x)] pt-6">
        <Routes>
          <Route path="/" element={<Navigate to="/timer" replace />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/sound" element={<SoundPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="*" element={<Navigate to="/timer" replace />} />
        </Routes>
      </main>
      <TabBar />
    </div>
  );
}
