import { useState } from 'react';
import { updateSettings } from '../../db/settings';
import type { Settings } from '../../db/types';
import type { AutoRule, ThemeChoice } from '../../lib/theme';
import { ThemePreview } from './ThemePreview';

const CHOICES: { value: ThemeChoice; label: string; desc: string }[] = [
  { value: 'paper', label: '종이 서재', desc: '밝은 낮에' },
  { value: 'emerald', label: '에메랄드 서재', desc: '어두운 밤에' },
  { value: 'auto', label: '자동', desc: '때에 맞춰' },
];

const timeInput =
  'h-11 rounded-[var(--radius-md)] border border-line-strong bg-surface px-2 text-md text-ink';

/** 설정 > 테마(TH-05, TH-06): 미리보기 카드를 누르면 바로 바뀝니다. 타이머·소리는 그대로 이어집니다. */
export function ThemeSettings({ settings }: { settings: Settings }) {
  // 누르자마자 화면에 보이도록 먼저 바꾸고, 저장은 뒤에서 합니다.
  const [choice, setChoice] = useState<ThemeChoice>(settings.theme);
  const [rule, setRule] = useState<AutoRule>(settings.autoRule);
  const [start, setStart] = useState(settings.nightStart);
  const [end, setEnd] = useState(settings.nightEnd);

  const pick = (value: ThemeChoice) => {
    setChoice(value);
    void updateSettings({ theme: value });
  };

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="font-display text-md font-bold">테마</legend>
      <div className="grid grid-cols-3 gap-2">
        {CHOICES.map((c) => {
          const on = choice === c.value;
          return (
            <label
              key={c.value}
              className={`press flex cursor-pointer flex-col overflow-hidden rounded-[var(--radius-lg)] border-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
                on ? 'border-accent' : 'border-line'
              }`}
            >
              <input
                type="radio"
                name="theme"
                value={c.value}
                checked={on}
                onChange={() => pick(c.value)}
                className="sr-only"
              />
              <div className="flex h-[96px]">
                {c.value === 'auto' ? (
                  <>
                    <div className="w-1/2 overflow-hidden">
                      <ThemePreview theme="paper" />
                    </div>
                    <div className="w-1/2 overflow-hidden">
                      <ThemePreview theme="emerald" />
                    </div>
                  </>
                ) : (
                  <div className="w-full">
                    <ThemePreview theme={c.value} />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center bg-surface px-1 py-2 text-center">
                <span className={`text-sm ${on ? 'font-bold text-ink' : 'text-ink'}`}>
                  {c.label}
                </span>
                <span className="text-xs text-ink-muted">{c.desc}</span>
              </div>
            </label>
          );
        })}
      </div>

      {choice === 'auto' && (
        <div className="flex flex-col gap-1 rounded-[var(--radius-lg)] border border-line bg-surface px-4 py-2">
          <label className="flex min-h-11 items-center gap-3 text-md">
            <input
              type="radio"
              name="auto-rule"
              checked={rule === 'system'}
              onChange={() => {
                setRule('system');
                void updateSettings({ autoRule: 'system' });
              }}
              className="size-5 accent-accent"
            />
            기기의 다크 모드를 따라요
          </label>
          <label className="flex min-h-11 items-center gap-3 text-md">
            <input
              type="radio"
              name="auto-rule"
              checked={rule === 'schedule'}
              onChange={() => {
                setRule('schedule');
                void updateSettings({ autoRule: 'schedule' });
              }}
              className="size-5 accent-accent"
            />
            정한 시간에만 에메랄드로
          </label>
          {rule === 'schedule' && (
            <div className="flex items-center gap-2 pb-2 pl-8 text-sm">
              <label className="flex items-center gap-2">
                <span className="sr-only">에메랄드 시작 시각</span>
                <input
                  type="time"
                  value={start}
                  onChange={(e) => {
                    setStart(e.target.value);
                    if (e.target.value) void updateSettings({ nightStart: e.target.value });
                  }}
                  className={timeInput}
                />
              </label>
              <span aria-hidden="true">~</span>
              <label className="flex items-center gap-2">
                <span className="sr-only">에메랄드 끝 시각</span>
                <input
                  type="time"
                  value={end}
                  onChange={(e) => {
                    setEnd(e.target.value);
                    if (e.target.value) void updateSettings({ nightEnd: e.target.value });
                  }}
                  className={timeInput}
                />
              </label>
            </div>
          )}
          <p className="pb-1 text-sm text-ink-muted">
            읽는 도중에 갑자기 바뀌지 않도록, 앱을 다시 열거나 돌아올 때 바꿔요.
          </p>
        </div>
      )}
    </fieldset>
  );
}
