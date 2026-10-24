import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { saveTasks } from './lib/storage';

// Local-time constructor keeps tests independent of the machine's timezone.
const at = (d: number, h: number, min = 0) => new Date(2026, 9, d, h, min);

const done = () => userEvent.click(screen.getByRole('button', { name: 'Готово' }));
const later = () => userEvent.click(screen.getByRole('button', { name: 'Сделаю позже' }));
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

beforeEach(() => {
  localStorage.clear();
  // Only the clock and intervals are faked, so user-event keeps working.
  vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('App', () => {
  it('uses the saved task list instead of the starter one', () => {
    saveTasks([
      { id: 'x', title: 'Своё первое', routine: 'morning', required: false },
      { id: 'y', title: 'Своё второе', routine: 'morning', required: false },
    ]);
    vi.setSystemTime(at(21, 7));
    render(<App />);

    expect(screen.getByText('Своё первое', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('1 из 2')).toBeInTheDocument();
    expect(screen.queryByText('Стакан воды')).not.toBeInTheDocument();
  });

  it('shows the first morning task and moves on after "Готово"', async () => {
    vi.setSystemTime(at(21, 7));
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Утро' })).toBeInTheDocument();
    expect(screen.getByText('Стакан воды')).toBeInTheDocument();
    expect(screen.getByText('1 из 7')).toBeInTheDocument();

    await done();

    expect(screen.getByText('Душ', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('2 из 7')).toBeInTheDocument();
  });

  it('moves a postponed task to the end of the queue', async () => {
    vi.setSystemTime(at(21, 19));
    render(<App />);

    await later();

    expect(screen.getByText('Почитать книгу', { selector: 'p' })).toBeInTheDocument();
    const upcoming = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(upcoming).toEqual(['Растяжка перед сном', 'Почистить зубы']);
  });

  it('does not show disabled tasks', async () => {
    vi.setSystemTime(at(21, 19));
    render(<App />);

    await done();
    await done();
    await done();

    expect(screen.queryByText('Подготовить одежду на завтра')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Всё готово' })).toBeInTheDocument();
  });

  it('keeps progress after a remount', async () => {
    vi.setSystemTime(at(21, 19));
    const { unmount } = render(<App />);
    await done();
    unmount();

    render(<App />);

    expect(screen.getByText('Почитать книгу', { selector: 'p' })).toBeInTheDocument();
  });

  it('resets marks when the logical day changes at 06:00', async () => {
    vi.setSystemTime(at(21, 5, 59));
    render(<App />);
    await done();
    expect(screen.getByText('Почитать книгу', { selector: 'p' })).toBeInTheDocument();

    vi.setSystemTime(at(21, 6, 0));
    advance(60_000);

    expect(screen.getByRole('heading', { name: 'Утро' })).toBeInTheDocument();
    expect(screen.getByText('Стакан воды')).toBeInTheDocument();
  });

  it('switches from morning to evening at 18:00', () => {
    vi.setSystemTime(at(21, 17, 59));
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Утро' })).toBeInTheDocument();

    vi.setSystemTime(at(21, 18, 0));
    advance(60_000);

    expect(screen.getByRole('heading', { name: 'Вечер' })).toBeInTheDocument();
    expect(screen.getByText('Почистить зубы', { selector: 'p' })).toBeInTheDocument();
  });
});
