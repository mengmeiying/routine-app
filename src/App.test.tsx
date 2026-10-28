import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { saveTasks } from './lib/storage';

// Local-time constructor keeps tests independent of the machine's timezone.
const at = (d: number, h: number, min = 0) => new Date(2026, 9, d, h, min);

const done = () => userEvent.click(screen.getByRole('button', { name: 'Готово' }));
const later = () => userEvent.click(screen.getByRole('button', { name: 'Сделаю позже' }));
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

const openEditor = () =>
  userEvent.click(screen.getByRole('button', { name: 'Редактор списка' }));
const goBack = () => userEvent.click(screen.getByRole('button', { name: '← Назад' }));

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, '', '/');
  // Only the clock and intervals are faked, so user-event keeps working.
  vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('App editor', () => {
  const list = [
    { id: 'a', title: 'Первое', routine: 'morning', required: true },
    { id: 'b', title: 'Второе', routine: 'morning', required: false },
    { id: 'c', title: 'Вечернее', routine: 'evening', required: false },
  ] as const;

  beforeEach(() => {
    saveTasks([...list]);
    vi.setSystemTime(at(21, 7));
  });

  it('opens from the gear and returns with the back button', async () => {
    render(<App />);

    await openEditor();
    expect(screen.getByRole('heading', { name: 'Список дел' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Первое',
      'Второе',
    ]);

    await goBack();
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Список дел' }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('heading', { name: 'Утро' })).toBeInTheDocument();
  });

  it('closes on the system back gesture', async () => {
    render(<App />);
    await openEditor();
    expect(window.location.hash).toBe('#editor');

    act(() => window.history.back());

    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Список дел' }),
      ).not.toBeInTheDocument(),
    );
    expect(window.location.hash).toBe('');
  });

  it('opens straight from #editor and closes without leaving the app', async () => {
    window.history.replaceState(null, '', '/#editor');
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Список дел' })).toBeInTheDocument();

    await goBack();

    expect(screen.getByRole('heading', { name: 'Утро' })).toBeInTheDocument();
    expect(window.location.hash).toBe('');
  });

  it('is reachable from the "all done" screen', async () => {
    saveTasks([list[0]]);
    render(<App />);
    await done();
    expect(screen.getByRole('heading', { name: 'Всё готово' })).toBeInTheDocument();

    await openEditor();

    expect(screen.getByRole('heading', { name: 'Список дел' })).toBeInTheDocument();
  });

  it("keeps today's marks after visiting the editor", async () => {
    render(<App />);
    await done();
    expect(screen.getByText('Второе', { selector: 'p' })).toBeInTheDocument();

    await openEditor();
    await goBack();

    await waitFor(() =>
      expect(screen.getByText('Второе', { selector: 'p' })).toBeInTheDocument(),
    );
  });
});

describe('App list editing', () => {
  const list = [
    { id: 'a', title: 'Первое', routine: 'morning', required: true },
    { id: 'b', title: 'Второе', routine: 'morning', required: false },
  ] as const;

  const backToRoutine = async () => {
    await goBack();
    await screen.findByRole('heading', { name: 'Утро' });
  };
  const confirmDelete = async (title: string) => {
    await userEvent.click(screen.getByRole('button', { name: `Удалить «${title}»` }));
    await userEvent.click(screen.getByRole('button', { name: 'Удалить' }));
  };

  beforeEach(() => {
    saveTasks([...list]);
    vi.setSystemTime(at(21, 7));
  });

  it('puts an added task into the queue and keeps it after a restart', async () => {
    const { unmount } = render(<App />);

    await openEditor();
    await userEvent.click(screen.getByRole('button', { name: /Добавить дело/ }));
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Название нового дела' }),
      'Новое{Enter}',
    );
    await backToRoutine();

    expect(screen.getByText('1 из 3')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Второе',
      'Новое',
    ]);

    unmount();
    render(<App />);
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Второе',
      'Новое',
    ]);
  });

  it('shows a renamed task right away', async () => {
    render(<App />);

    await openEditor();
    await userEvent.click(screen.getByRole('button', { name: 'Изменить «Первое»' }));
    const field = screen.getByRole('textbox', { name: 'Название дела' });
    await userEvent.clear(field);
    await userEvent.type(field, 'Главное{Enter}');
    await backToRoutine();

    expect(screen.getByText('Главное', { selector: 'p' })).toBeInTheDocument();
  });

  it('moves on to the next task when the current one is deleted', async () => {
    render(<App />);

    await openEditor();
    await confirmDelete('Первое');
    await backToRoutine();

    expect(screen.getByText('Второе', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('1 из 1')).toBeInTheDocument();
  });

  it('keeps the history of a deleted task', async () => {
    render(<App />);
    await done();

    await openEditor();
    await confirmDelete('Первое');
    await backToRoutine();

    const history = JSON.parse(localStorage.getItem('routine-app:history')!);
    expect(history['2026-10-21'].done).toEqual(['a']);
    expect(screen.getByText('Второе', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('1 из 1')).toBeInTheDocument();
  });

  it('saves the edited list with a format version', async () => {
    render(<App />);

    await openEditor();
    await confirmDelete('Второе');

    const stored = JSON.parse(localStorage.getItem('routine-app:tasks')!);
    expect(stored.version).toBe(1);
    expect(stored.tasks.map((t: { id: string }) => t.id)).toEqual(['a']);
  });

  it('asks to add tasks when the routine becomes empty', async () => {
    render(<App />);

    await openEditor();
    await confirmDelete('Первое');
    await confirmDelete('Второе');
    await goBack();

    expect(
      await screen.findByRole('heading', { name: 'Дел пока нет' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Добавь дела в редакторе')).toBeInTheDocument();
  });
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
