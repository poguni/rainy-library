import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** 공통 바텀 시트(DESIGN.md 7장): 위쪽 모서리 16px, 손잡이, 배경 어둡게. Esc나 바깥을 누르면 닫힘. */
export function BottomSheet({ title, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>('input, button, select')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prevFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[var(--color-scrim)]"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-up relative max-h-[90dvh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl bg-surface-raised px-6 pt-3 pb-8"
      >
        <div aria-hidden="true" className="mx-auto mb-4 h-1 w-9 rounded-full bg-line-strong" />
        <h2 className="font-display text-lg font-bold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
