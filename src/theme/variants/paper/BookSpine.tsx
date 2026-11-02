import type { SpineLook } from '../../../lib/books';
import { SpineTitle } from '../SpineTitle';

export interface BookSpineProps {
  title: string;
  look: SpineLook;
  selected: boolean;
  /** 책꽂이 마지막 책을 기대어 놓기 */
  leaning: boolean;
  onSelect: () => void;
}

/** 종이 서재 책등: 단색 천 장정 + 왼쪽 4px 그늘. 선택하면 10px 위로 (DESIGN.md 8.4) */
export function BookSpine({ title, look, selected, leaning, onSelect }: BookSpineProps) {
  const shade = 'inset 4px 0 0 var(--spine-shade)';
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      style={{
        width: look.width,
        height: look.height,
        background: `var(--spine-${look.colorIndex})`,
        color: look.darkInk ? 'var(--spine-ink-dark)' : 'var(--spine-ink-light)',
        boxShadow: selected ? `var(--shadow-lifted), ${shade}` : shade,
        transform: `${selected ? 'translateY(-10px)' : ''} ${leaning ? 'rotate(8deg)' : ''}`,
        transformOrigin: 'bottom left',
      }}
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[2px] py-2 font-display transition-transform duration-150 ${
        leaning ? 'ml-1' : ''
      }`}
    >
      <SpineTitle
        title={title}
        className={selected ? 'text-[13px] font-bold tracking-[1px]' : 'text-xs tracking-[1px]'}
      />
    </button>
  );
}
