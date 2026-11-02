import { checkQuote, cleanQuote, QUOTE_MAX, quoteOfDay } from './quotes';

describe('cleanQuote', () => {
  it('앞뒤 공백을 지우고 빈 줄은 하나만 남긴다', () => {
    expect(cleanQuote('  새는 알에서 나오려고 투쟁한다.  ')).toBe('새는 알에서 나오려고 투쟁한다.');
    expect(cleanQuote('첫 줄  \n\n\n\n둘째 줄')).toBe('첫 줄\n\n둘째 줄');
  });
});

describe('checkQuote', () => {
  it('비었거나 너무 길면', () => {
    expect(checkQuote('   ', undefined, 200)).toBe('empty');
    expect(checkQuote('가'.repeat(QUOTE_MAX + 1), undefined, 200)).toBe('too-long');
    expect(checkQuote('가'.repeat(QUOTE_MAX), undefined, 200)).toBeNull();
  });

  it('쪽수는 비워도 되고, 적으면 1~전체 쪽수', () => {
    expect(checkQuote('문장', undefined, 200)).toBeNull();
    expect(checkQuote('문장', 200, 200)).toBeNull();
    expect(checkQuote('문장', 0, 200)).toBe('bad-page');
    expect(checkQuote('문장', 201, 200)).toBe('bad-page');
    expect(checkQuote('문장', 1.5, 200)).toBe('bad-page');
  });
});

describe('quoteOfDay', () => {
  const quotes = ['가', '나', '다', '라'];

  it('문장이 없으면 undefined', () => {
    expect(quoteOfDay([], new Date())).toBeUndefined();
    expect(quoteOfDay(undefined, new Date())).toBeUndefined();
  });

  it('같은 날에는 시각이 달라도 같은 문장', () => {
    const a = quoteOfDay(quotes, new Date(2026, 10, 2, 7, 0));
    const b = quoteOfDay(quotes, new Date(2026, 10, 2, 23, 59));
    expect(a).toBe(b);
  });

  it('날이 바뀌면 여러 문장이 돌아가며 나온다', () => {
    const seen = new Set<string>();
    for (let d = 1; d <= 30; d++) seen.add(quoteOfDay(quotes, new Date(2026, 10, d))!);
    expect(seen.size).toBeGreaterThan(1);
  });
});
