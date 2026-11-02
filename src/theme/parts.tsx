// 테마 전용 부품 4종을 고르는 곳(DESIGN.md 8장). 화면은 여기의 공통 이름만 씁니다.
// 어느 테마의 부품을 쓸지는 useThemeVariant()가 정합니다.
import type { BookSpineProps } from './variants/paper/BookSpine';
import type { FinishCardProps } from './variants/paper/FinishCard';
import type { SoundControlsProps } from './variants/paper/SoundControls';
import type { TimerFaceProps } from './variants/paper/TimerFace';
import { useThemeVariant } from './useThemeVariant';

export function TimerFace(props: TimerFaceProps) {
  const { TimerFace: Part } = useThemeVariant();
  return <Part {...props} />;
}

export function SoundControls(props: SoundControlsProps) {
  const { SoundControls: Part } = useThemeVariant();
  return <Part {...props} />;
}

export function FinishCard(props: FinishCardProps) {
  const { FinishCard: Part } = useThemeVariant();
  return <Part {...props} />;
}

export function BookSpine(props: BookSpineProps) {
  const { BookSpine: Part } = useThemeVariant();
  return <Part {...props} />;
}
