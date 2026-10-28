import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Task } from '../data/tasks';
import { Editor } from './Editor';

const tasks: Task[] = [
  { id: 'm1', title: 'Morning one', routine: 'morning', required: true },
  { id: 'e1', title: 'Evening one', routine: 'evening', required: false },
  { id: 'm2', title: 'Morning two', routine: 'morning', required: false, enabled: false },
  { id: 'e2', title: 'Evening two', routine: 'evening', required: true },
];

const titles = () => screen.getAllByRole('listitem').map((li) => li.textContent);

describe('Editor', () => {
  it('shows the tasks of the initial routine in order', () => {
    render(<Editor tasks={tasks} initialRoutine="evening" onBack={vi.fn()} />);

    expect(screen.getByRole('tab', { name: 'Вечер' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(titles()).toEqual(['Evening one', 'Evening two']);
  });

  it('switches between morning and evening', async () => {
    render(<Editor tasks={tasks} initialRoutine="evening" onBack={vi.fn()} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Утро' }));

    expect(screen.getByRole('tab', { name: 'Утро' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(titles()[0]).toContain('Morning one');
    expect(screen.queryByText('Evening one')).not.toBeInTheDocument();
  });

  it('marks disabled tasks but still lists them', async () => {
    render(<Editor tasks={tasks} initialRoutine="morning" onBack={vi.fn()} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).queryByText('выключено')).not.toBeInTheDocument();
    expect(within(items[1]).getByText('Morning two')).toBeInTheDocument();
    expect(within(items[1]).getByText('выключено')).toBeInTheDocument();
  });

  it('says so when a routine has no tasks', () => {
    render(<Editor tasks={[]} initialRoutine="morning" onBack={vi.fn()} />);

    expect(screen.getByText('Дел пока нет')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('calls onBack from the back button', async () => {
    const onBack = vi.fn();
    render(<Editor tasks={tasks} initialRoutine="morning" onBack={onBack} />);

    await userEvent.click(screen.getByRole('button', { name: '← Назад' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
