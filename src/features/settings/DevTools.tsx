import { useState } from 'react';
import { loadSeedData } from '../../db/seed';

export function DevTools() {
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const n = await loadSeedData();
      setMessage(`책 ${n.books}권, 세션 ${n.sessions}개를 불러왔어요.`);
    } catch (err) {
      console.error(err);
      setMessage('불러오지 못했어요. 콘솔을 확인해 주세요.');
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-2 border-t border-dashed border-line-strong pt-4">
      <h2 className="font-display text-md font-bold">개발용</h2>
      <button
        type="button"
        onClick={load}
        className="press min-h-11 self-start rounded-full border border-line-strong bg-surface px-4 text-md"
      >
        샘플 데이터 불러오기
      </button>
      <p role="status" className="text-sm text-ink-muted">
        {message}
      </p>
    </div>
  );
}
