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
  /** 타이머 홈에서 고른 '지금 읽는 책'(색인 없는 필드라 스키마 버전 변경 불필요) */
  currentBookId?: string;
}

/** settings 저장소는 key='app' 한 줄만 씁니다. */
export interface SettingsRow extends Settings {
  key: 'app';
}
