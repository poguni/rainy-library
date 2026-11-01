import { useState } from 'react';
import { PageStepper } from '../../components/PageStepper';
import { updateSettings } from '../../db/settings';
import type { Settings } from '../../db/types';
import { checkMinutes, MINUTE_RANGES, type MinuteField } from '../../lib/settingsRules';

const FIELDS = Object.keys(MINUTE_RANGES) as MinuteField[];

/** 타이머 시간(T-01, W-05). 올바른 값이면 바로 저장합니다. */
export function TimerSettings({ settings }: { settings: Settings }) {
  const [values, setValues] = useState<Record<MinuteField, string>>(() => ({
    focusMin: String(settings.focusMin),
    shortBreakMin: String(settings.shortBreakMin),
    longBreakMin: String(settings.longBreakMin),
  }));

  const change = (field: MinuteField, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (!checkMinutes(field, value)) void updateSettings({ [field]: Number(value) });
  };

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-md font-bold">타이머</h2>
        <p className="text-sm text-ink-muted">
          바꾼 시간은 다음에 시작하는 독서부터 적용돼요. 네 번 집중하면 길게 쉬어요.
        </p>
      </div>
      {FIELDS.map((field) => (
        <PageStepper
          key={field}
          id={`setting-${field}`}
          label={MINUTE_RANGES[field].label}
          unit="분"
          value={values[field]}
          onChange={(v) => change(field, v)}
          error={checkMinutes(field, values[field]) ?? undefined}
        />
      ))}
    </section>
  );
}
