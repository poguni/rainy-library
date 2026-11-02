// 테마 이름 → 테마 전용 부품 묶음. 새 테마는 variants/<테마>/에 4종을 만들고 여기에 등록합니다.
import * as emerald from './variants/emerald';
import * as paper from './variants/paper';
import { useThemeName, type ThemeName } from './useThemeName';

const VARIANTS: Record<ThemeName, typeof paper> = { paper, emerald };

/** 지금 테마의 부품 묶음 */
export function useThemeVariant() {
  return VARIANTS[useThemeName()];
}
