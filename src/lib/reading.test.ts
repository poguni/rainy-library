import seed from '../../docs/seed-data.json';
import type { Book, Session } from '../db/types';
import {
  bookAverageSpeed,
  countsForSpeed,
  dailyAverageMinutes,
  estimateRemaining,
  finishEstimate,
  formatSpeed,
  recentSpeed,
  sessionSpeed,
  sessionSummary,
} from './reading';

const books = seed.books as Book[];
const sessions = seed.sessions as Session[];
const demian = books.find((b) => b.id === 'book_demian')!;

let n = 0;
const ses = (p: Partial<Session>): Session => ({
  id: `ses_${n++}`,
  bookId: 'book_x',
  startedAt: '2026-10-31T21:00:00+09:00',
  endedAt: `2026-10-31T21:${String(n).padStart(2, '0')}:00+09:00`,
  focusSeconds: 3000,
  startPage: 120,
  endPage: 142,
  mode: 'pomodoro',
  ...p,
});

describe('세션 속도', () => {
  it('PRD 예: 22쪽 / 50분 → 0.44쪽/분', () => {
    expect(formatSpeed(sessionSpeed(ses({}))!)).toBe('0.44쪽/분');
  });
  it('3분 미만 세션은 빠진다', () => {
    expect(countsForSpeed(ses({ focusSeconds: 179 }))).toBe(false);
    expect(countsForSpeed(ses({ focusSeconds: 180 }))).toBe(true);
    expect(sessionSpeed(ses({ focusSeconds: 120 }))).toBeNull();
  });
  it('쪽수를 적지 않은 세션은 빠진다', () => {
    expect(sessionSpeed(ses({ endPage: null }))).toBeNull();
  });
});

describe('책 평균 속도와 최근 속도', () => {
  it('짧은 세션·쪽수 없는 세션을 빼고 총 쪽수 ÷ 총 시간', () => {
    const list = [
      ses({ startPage: 0, endPage: 30, focusSeconds: 3600 }), // 30쪽/60분
      ses({ startPage: 30, endPage: 40, focusSeconds: 1200 }), // 10쪽/20분
      ses({ startPage: 40, endPage: 90, focusSeconds: 60 }), // 1분 → 제외
      ses({ startPage: 40, endPage: null, focusSeconds: 1800 }), // 쪽수 없음 → 제외
    ];
    expect(bookAverageSpeed(list, 'book_x')).toBeCloseTo(0.5);
  });
  it('기록이 없으면 null', () => expect(bookAverageSpeed([], 'book_x')).toBeNull());
  it('데미안: 평균 0.37쪽/분, 최근 5회 0.44쪽/분', () => {
    expect(formatSpeed(bookAverageSpeed(sessions, 'book_demian')!)).toBe('0.37쪽/분');
    expect(formatSpeed(recentSpeed(sessions, 'book_demian')!)).toBe('0.44쪽/분');
  });
});

describe('완독 예상일', () => {
  it('TASKS 예: 남은 106쪽, 0.44쪽/분, 하루 30분 → 약 241분, 9일', () => {
    const { remainingMin, days } = estimateRemaining(106, 0.44, 30);
    expect(Math.round(remainingMin)).toBe(241);
    expect(days).toBe(9);
  });

  it('하루 평균은 오늘 포함 최근 14일의 이 책 독서 시간 ÷ 14', () => {
    const today = new Date(2026, 9, 31, 22, 0);
    // 10/18~10/31 데미안 세션 합 255분
    expect(dailyAverageMinutes(sessions, 'book_demian', today)).toBeCloseTo(255 / 14);
  });

  it('데미안 샘플(10월 31일 기준) → 11월 14일, 약 241분 남음(시안과 같음)', () => {
    const r = finishEstimate(demian, sessions, new Date(2026, 9, 31, 22, 0));
    expect(r.kind).toBe('ok');
    if (r.kind !== 'ok') return;
    expect(r.date.getMonth() + 1).toBe(11);
    expect(r.date.getDate()).toBe(14);
    expect(Math.round(r.remainingMin)).toBe(242);
  });

  it('쓸 수 있는 기록이 3회 미만이면 알려 주지 않는다', () => {
    const book = { ...demian, id: 'book_x' };
    const two = [ses({}), ses({}), ses({ focusSeconds: 60 })];
    expect(finishEstimate(book, two, new Date(2026, 9, 31)).kind).toBe('need-more');
  });

  it('최근 14일 동안 읽지 않았으면 계산하지 않는다', () => {
    expect(finishEstimate(demian, sessions, new Date(2027, 0, 31)).kind).toBe('no-recent');
  });

  it('다 읽은 책', () => {
    expect(finishEstimate({ ...demian, currentPage: 248 }, sessions, new Date()).kind).toBe('done');
    expect(finishEstimate({ ...demian, status: 'finished' }, sessions, new Date()).kind).toBe(
      'done',
    );
  });
});

describe('sessionSummary', () => {
  it('PRD 예: 22쪽 / 50분 → 0.44쪽/분', () => {
    expect(sessionSummary(ses({}))).toEqual({ line: '22쪽 / 50분 → 0.44쪽/분' });
  });
  it('쪽수 없이 기록하면 시간만', () => {
    expect(sessionSummary(ses({ endPage: null })).line).toBe('50분 읽었어요');
  });
  it('3분 미만이면 속도 없이 안내', () => {
    const r = sessionSummary(ses({ focusSeconds: 120, startPage: 10, endPage: 12 }));
    expect(r.line).toBe('2쪽 / 2분');
    expect(r.hint).toMatch(/3분/);
  });
});
