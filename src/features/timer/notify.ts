import type { Phase } from '../../lib/timer';

/** 시작 버튼을 누를 때 한 번 권한을 묻습니다(이미 정했으면 묻지 않음). */
export function askNotifyPermission() {
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    void Notification.requestPermission();
  }
}

const TEXT: Record<Phase, { title: string; body: string }> = {
  focus: { title: '다시 읽어 볼까요?', body: '집중 시간이 시작됐어요.' },
  shortBreak: { title: '쉬는 시간이에요', body: '잠깐 눈을 쉬어 주세요.' },
  longBreak: { title: '길게 쉬어 갈 시간이에요', body: '네 번 집중했어요. 충분히 쉬어 주세요.' },
};

/**
 * 권한을 허락했고 앱이 화면에 보이지 않을 때만 시스템 알림을 띄웁니다.
 * 안드로이드 크롬은 페이지에서 바로 띄우는 알림을 막으므로, 서비스 워커가 있으면 그쪽으로 띄웁니다.
 */
export async function notifyPhase(phase: Phase) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  if (!document.hidden) return;
  const { title, body } = TEXT[phase];
  const options = { body, tag: 'rl-phase', icon: 'icons/icon-192.png' };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification(title, options);
    else new Notification(title, options);
  } catch {
    // 알림을 못 띄워도 알림음은 이미 울렸으니 조용히 넘어갑니다.
  }
}
