import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Task } from '../data/tasks';
import { AllDone } from './AllDone';
import { CurrentTask } from './CurrentTask';
import { UpcomingList } from './UpcomingList';

const task = (id: string, title: string): Task => ({
  id,
  title,
  routine: 'morning',
  required: true,
});

describe('CurrentTask', () => {
  it('shows the routine, the task and the position', () => {
    render(
      <CurrentTask
        routineTitle="Утро"
        task={task('a', 'Душ')}
        position={2}
        total={7}
        onOpenEditor={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Утро' })).toBeInTheDocument();
    expect(screen.getByText('Душ')).toBeInTheDocument();
    expect(screen.getByText('2 из 7')).toBeInTheDocument();
  });

  it('opens the editor from the gear button', async () => {
    const onOpenEditor = vi.fn();
    render(
      <CurrentTask
        routineTitle="Утро"
        task={task('a', 'Душ')}
        position={1}
        total={1}
        onOpenEditor={onOpenEditor}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Редактор списка' }));

    expect(onOpenEditor).toHaveBeenCalledTimes(1);
  });
});

describe('UpcomingList', () => {
  it('lists the tasks in the given order', () => {
    render(<UpcomingList tasks={[task('a', 'Душ'), task('b', 'Зубы')]} />);

    const items = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(items).toEqual(['Душ', 'Зубы']);
  });

  it('renders nothing for an empty list', () => {
    render(<UpcomingList tasks={[]} />);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});

describe('AllDone', () => {
  it('shows the completion message', () => {
    render(<AllDone routineTitle="Вечер" onOpenEditor={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Всё готово' })).toBeInTheDocument();
    expect(screen.getByText('Вечер: все дела выполнены')).toBeInTheDocument();
  });

  it('asks to add tasks instead of claiming completion when the routine is empty', () => {
    render(<AllDone routineTitle="Вечер" empty onOpenEditor={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Дел пока нет' })).toBeInTheDocument();
    expect(screen.getByText('Добавь дела в редакторе')).toBeInTheDocument();
    expect(screen.queryByText('Всё готово')).not.toBeInTheDocument();
  });

  it('opens the editor from the gear button', async () => {
    const onOpenEditor = vi.fn();
    render(<AllDone routineTitle="Вечер" onOpenEditor={onOpenEditor} />);

    await userEvent.click(screen.getByRole('button', { name: 'Редактор списка' }));

    expect(onOpenEditor).toHaveBeenCalledTimes(1);
  });
});
