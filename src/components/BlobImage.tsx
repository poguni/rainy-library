import { useEffect, useRef } from 'react';

/** 기기에 저장한 Blob 이미지를 보여 주고, 다 쓰면 임시 주소를 정리합니다. */
export function BlobImage({ blob, className }: { blob: Blob; className?: string }) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(blob);
    if (ref.current) ref.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [blob]);
  return <img ref={ref} alt="" className={className} />;
}
