import type { AppliedTheme } from '../../lib/theme';

/** 미리보기 카드 안의 작은 타이머 그림. data-theme을 붙여 그 테마의 실제 토큰으로 그립니다. */
export function ThemePreview({ theme }: { theme: AppliedTheme }) {
  return (
    <div
      data-theme={theme}
      aria-hidden="true"
      className="flex h-full flex-col items-center justify-center gap-1.5 bg-bg px-2 py-3 text-ink"
    >
      <svg width="54" height="54" viewBox="0 0 54 54">
        <circle cx="27" cy="27" r="23" fill="none" stroke="var(--color-track)" strokeWidth="3" />
        <circle
          cx="27"
          cy="27"
          r="23"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="90 145"
          transform="rotate(-90 27 27)"
        />
        <text
          x="27"
          y="31"
          textAnchor="middle"
          fontSize="12"
          fill="var(--color-ink-strong)"
          style={{ fontFamily: 'var(--font-numeral)', fontFeatureSettings: "'lnum' 1" }}
        >
          18:42
        </text>
      </svg>
      <span className="h-1.5 w-10 rounded-full bg-accent" />
    </div>
  );
}
