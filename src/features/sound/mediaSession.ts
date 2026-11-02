// 잠금 화면·알림창·이어폰 버튼 제어(L-05, Media Session API). 지원하지 않는 브라우저에서는 아무것도 하지 않습니다.
const ARTWORK = [
  { src: `${import.meta.env.BASE_URL}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
  { src: `${import.meta.env.BASE_URL}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
];

const supported = () => typeof navigator !== 'undefined' && 'mediaSession' in navigator;

export interface MediaHandlers {
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
}

export function bindMediaSession(h: MediaHandlers) {
  if (!supported()) return;
  const actions: [MediaSessionAction, () => void][] = [
    ['play', h.play],
    ['pause', h.pause],
    ['nexttrack', h.next],
    ['previoustrack', h.prev],
  ];
  for (const [action, fn] of actions) {
    try {
      navigator.mediaSession.setActionHandler(action, fn);
    } catch {
      // 이 동작을 지원하지 않는 브라우저
    }
  }
}

/** 지금 곡 이름과 재생 상태를 잠금 화면에 알립니다. title이 null이면 지웁니다. */
export function setNowPlaying(title: string | null, playing: boolean) {
  if (!supported()) return;
  const ms = navigator.mediaSession;
  ms.metadata =
    title && typeof MediaMetadata !== 'undefined'
      ? new MediaMetadata({ title, artist: '빗소리 서재', artwork: ARTWORK })
      : null;
  ms.playbackState = title ? (playing ? 'playing' : 'paused') : 'none';
}
