import { newId } from './id';

describe('newId', () => {
  it('접두어와 무작위 문자열로 만든다', () => {
    expect(newId('book')).toMatch(/^book_[0-9a-z]{8}$/);
    expect(newId('ses')).toMatch(/^ses_/);
  });
  it('매번 다른 값을 만든다', () => {
    const ids = new Set(Array.from({ length: 200 }, () => newId('book')));
    expect(ids.size).toBe(200);
  });
});
