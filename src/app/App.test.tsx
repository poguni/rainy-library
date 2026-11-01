import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('하단 탭', () => {
  it('처음에는 타이머 화면을 보여 준다', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { name: '타이머' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '타이머' })).toHaveAttribute('aria-current', 'page');
  });

  it.each([
    ['사운드', '사운드'],
    ['서재', '서재'],
    ['기록', '기록'],
    ['타이머', '타이머'],
  ])('%s 탭을 누르면 %s 화면으로 바뀐다', async (tab, heading) => {
    renderAt('/library');
    await userEvent.click(screen.getByRole('link', { name: tab }));
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: tab })).toHaveAttribute('aria-current', 'page');
  });
});
