export type IdPrefix = 'ses' | 'book' | 'preset' | 'track' | 'quote';

/** 접두어 + 무작위 문자열. 예: book_k3j9x2m1q8 */
export function newId(prefix: IdPrefix): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const rand = Array.from(bytes, (b) => (b % 36).toString(36)).join('');
  return `${prefix}_${rand}`;
}
