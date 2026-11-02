import type { BookSpineProps } from '../paper/BookSpine';

/** 위·아래 금박 이중 띠 */
const Band = ({ thick }: { thick: boolean }) => (
  <span
    aria-hidden="true"
    className={`w-full shrink-0 border-y border-accent ${thick ? 'h-1' : 'h-[3px]'}`}
  />
);

/**
 * 에메랄드 서재 책등(DESIGN.md 8.4): 가죽 장정 + 위·아래 금박 이중 띠, 금빛 글자.
 * 선택하면 10px 위로 + 1px 금 테두리 + 금빛 후광. 마지막 책도 기울이지 않습니다(정돈된 느낌).
 */
export function BookSpine({ title, look, selected, onSelect }: BookSpineProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      style={{
        width: look.width,
        height: look.height,
        background: `var(--spine-${look.colorIndex})`,
        boxShadow: selected ? 'var(--shadow-lifted)' : undefined,
        transform: selected ? 'translateY(-10px)' : undefined,
      }}
      className={`flex shrink-0 flex-col items-center justify-between overflow-hidden rounded-[2px] py-2 transition-transform duration-150 ${
        selected ? 'border border-accent' : ''
      }`}
    >
      <Band thick={selected} />
      <span
        className={`min-h-0 overflow-hidden font-display [writing-mode:vertical-rl] ${
          selected
            ? 'text-[13px] font-bold tracking-[3px] text-ink-strong'
            : 'text-[11px] tracking-[2px] text-accent-strong'
        }`}
      >
        {title}
      </span>
      <Band thick={selected} />
    </button>
  );
}
