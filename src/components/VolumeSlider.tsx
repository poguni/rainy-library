import type { CSSProperties } from 'react';

interface Props {
  /** 0~100 */
  value: number;
  onChange: (value: number) => void;
  /** 화면에 보이는 라벨이 없을 때 */
  label?: string;
  id?: string;
  dimmed?: boolean;
  className?: string;
}

/**
 * 음량 슬라이더(사운드 탭 공통). 휴대폰에서 스크롤하다 스쳐도 값이 바뀌지 않도록
 * 막대는 터치를 받지 않고, 손잡이를 잡아 끌 때만 움직입니다(index.css의 .volume-range).
 * 키보드·화면 읽기 프로그램에서는 보통 슬라이더와 같습니다.
 */
export function VolumeSlider({ value, onChange, label, id, dimmed, className = '' }: Props) {
  return (
    <input
      id={id}
      type="range"
      min={0}
      max={100}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ '--fill': `${value}%` } as CSSProperties}
      className={`volume-range h-11 ${dimmed ? 'opacity-50' : ''} ${className}`}
    />
  );
}
