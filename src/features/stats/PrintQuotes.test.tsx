import { render, screen } from '@testing-library/react';
import type { Book } from '../../db/types';
import { PrintQuotes } from './PrintQuotes';

const base: Book = {
  id: 'book_1',
  title: '데미안',
  author: '헤르만 헤세',
  totalPages: 248,
  status: 'reading',
  currentPage: 30,
  createdAt: new Date(2026, 9, 1).toISOString(),
};

describe('PrintQuotes', () => {
  it('문장이 하나도 없으면 아무것도 그리지 않는다', () => {
    const { container } = render(<PrintQuotes books={[base, { ...base, quotes: [] }]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('문장이 있는 책만, 먼저 남긴 문장부터, 쪽수·날짜와 함께', () => {
    const book: Book = {
      ...base,
      quotes: [
        { id: 'quote_2', text: '둘째', createdAt: new Date(2026, 10, 2).toISOString() },
        { id: 'quote_1', text: '첫째', page: 120, createdAt: new Date(2026, 10, 1).toISOString() },
      ],
    };
    render(<PrintQuotes books={[{ ...base, id: 'book_2', title: '문장 없는 책' }, book]} />);
    expect(screen.queryByText('문장 없는 책')).not.toBeInTheDocument();
    const items = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(items).toEqual(['“첫째”120쪽 · 2026-11-01', '“둘째”2026-11-02']);
  });
});
