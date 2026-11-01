// PRD 8.1 데이터 모델
export type BookStatus = 'reading' | 'finished' | 'paused';

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  coverBlob?: Blob;
  status: BookStatus;
  currentPage: number;
  createdAt: string;
}

export interface Session {
  id: string;
  bookId: string;
  startedAt: string;
  endedAt: string;
  focusSeconds: number;
  startPage: number | null;
  endPage: number | null;
  mode: 'pomodoro' | 'free';
  presetId?: string;
}

export interface SoundLayer {
  soundId: string;
  volume: number;
  on: boolean;
}

export interface Preset {
  id: string;
  name: string;
  layers: SoundLayer[];
  masterVolume: number;
}

export interface Track {
  id: string;
  name: string;
  fileBlob: Blob;
  duration: number;
  order: number;
}

export interface Settings {
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  wakeLock: boolean;
  chime: string;
  theme: 'paper' | 'emerald' | 'auto';
  autoRule: 'system' | 'schedule';
  nightStart: string;
  nightEnd: string;
}

/** settings 저장소는 key='app' 한 줄만 씁니다. */
export interface SettingsRow extends Settings {
  key: 'app';
}
