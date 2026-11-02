import type { Preset } from '../../db/types';

interface Props {
  presets: Preset[];
  activeId?: string;
  onPick: (id: string) => void;
}

/** 프리셋 칩 줄(사운드 탭·타이머 홈 공통). 누르면 조합이 한 번에 바뀝니다. */
export function PresetChips({ presets, activeId, onPick }: Props) {
  return (
    <div role="group" aria-label="프리셋" className="flex flex-wrap gap-x-2">
      {presets.map((p) => {
        const on = p.id === activeId;
        return (
          <button
            key={p.id}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(p.id)}
            className="press flex min-h-11 items-center"
          >
            {/* 보이는 칩은 36px, 누르는 영역은 44px */}
            <span
              className={`flex h-9 items-center rounded-full px-3.5 text-sm ${
                on ? 'bg-ink text-surface' : 'border border-line-strong text-ink'
              }`}
            >
              {p.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
