import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
      <CurrentTask routineTitle="Утро" task={task('a', 'Душ')} position={2} total={7} />,
    );

    expect(screen.getByRole('heading', { name: 'Утро' })).toBeInTheDocument();
    expect(screen.getByText('Душ')).toBeInTheDocument();
    expect(screen.getByText('2 из 7')).toBeInTheDocument();
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
    render(<AllDone routineTitle="Вечер" />);

    expect(screen.getByRole('heading', { name: 'Всё готово' })).toBeInTheDocument();
    expect(screen.getByText('Вечер: все дела выполнены')).toBeInTheDocument();
  });
});
