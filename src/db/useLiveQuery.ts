import { liveQuery } from 'dexie';
import { useEffect, useState } from 'react';

/** Dexie 조회 결과를 구독해, 데이터가 바뀌면 다시 그립니다. 처음 불러오기 전에는 undefined. */
export function useLiveQuery<T>(query: () => Promise<T>, deps: unknown[]): T | undefined {
  const [value, setValue] = useState<T>();
  useEffect(() => {
    const sub = liveQuery(query).subscribe({
      next: setValue,
      error: (err) => console.error('[db]', err),
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}
