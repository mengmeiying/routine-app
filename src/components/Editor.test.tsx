import { useState } from 'react';
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

// Reads the title of every row, whether or not its toolbar is open.
const titles = () =>
  screen.getAllByRole('listitem').map((li) => li.querySelector('span')!.textContent);

const ids = (list: Task[]) => list.map((t) => t.id);
const lastChange = (onChange: ReturnType<typeof vi.fn>): Task[] =>
  onChange.mock.lastCall![0];

const openRow = (title: string) =>
  userEvent.click(screen.getByRole('button', { name: new RegExp(`^${title}`) }));
const tool = (name: string) => screen.getByRole('button', { name });

// Keeps the list in state like App does, and reports every change.
function Harness({
  initial = tasks,
  routine = 'morning',
  onChange = vi.fn(),
  onBack = vi.fn(),
}: {
  initial?: Task[];
  routine?: 'morning' | 'evening';
  onChange?: (tasks: Task[]) => void;
  onBack?: () => void;
}) {
  const [list, setList] = useState(initial);
  return (
    <Editor
      tasks={list}
      initialRoutine={routine}
      onBack={onBack}
      onChange={(next) => {
        setList(next);
        onChange(next);
      }}
    />
  );
}

describe('Editor view', () => {
  it('shows the tasks of the initial routine in order', () => {
    render(<Harness routine="evening" />);

    expect(screen.getByRole('tab', { name: 'Вечер' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(titles()).toEqual(['Evening one', 'Evening two']);
  });

  it('switches between morning and evening', async () => {
    render(<Harness routine="evening" />);

    await userEvent.click(screen.getByRole('tab', { name: 'Утро' }));

    expect(screen.getByRole('tab', { name: 'Утро' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(titles()[0]).toBe('Morning one');
    expect(screen.queryByText('Evening one')).not.toBeInTheDocument();
  });

  it('marks disabled tasks but still lists them', () => {
    render(<Harness />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).queryByText('выключено')).not.toBeInTheDocument();
    expect(within(items[1]).getByText('Morning two')).toBeInTheDocument();
    expect(within(items[1]).getByText('выключено')).toBeInTheDocument();
  });

  it('says so when a routine has no tasks', () => {
    render(<Harness initial={[]} />);

    expect(screen.getByText('Дел пока нет')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('calls onBack from the back button', async () => {
    const onBack = vi.fn();
    render(<Harness onBack={onBack} />);

    await userEvent.click(screen.getByRole('button', { name: '← Назад' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

describe('Editor: row toolbar', () => {
  it('opens on tap, closes on a second tap', async () => {
    render(<Harness />);
    expect(screen.queryByRole('button', { name: 'Выше' })).not.toBeInTheDocument();

    await openRow('Morning one');
    expect(screen.getByRole('button', { name: /^Morning one/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    for (const name of ['Выше', 'Ниже', 'Изменить', 'Удалить']) {
      expect(tool(name)).toBeInTheDocument();
    }

    await openRow('Morning one');
    expect(screen.queryByRole('button', { name: 'Выше' })).not.toBeInTheDocument();
  });

  it('keeps only one row open', async () => {
    render(<Harness />);

    await openRow('Morning one');
    await openRow('Morning two');

    expect(screen.getAllByRole('button', { name: 'Выше' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: /^Morning one/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('closes when the routine tab changes', async () => {
    render(<Harness />);

    await openRow('Morning one');
    await userEvent.click(screen.getByRole('tab', { name: 'Вечер' }));
    await userEvent.click(screen.getByRole('tab', { name: 'Утро' }));

    expect(screen.queryByRole('button', { name: 'Выше' })).not.toBeInTheDocument();
  });
});

describe('Editor: reordering', () => {
  const three: Task[] = [
    { id: 'a', title: 'First', routine: 'morning', required: false },
    { id: 'x', title: 'Evening', routine: 'evening', required: false },
    { id: 'b', title: 'Second', routine: 'morning', required: false },
    { id: 'c', title: 'Third', routine: 'morning', required: false },
  ];

  it('moves a task up and reports the new order', async () => {
    const onChange = vi.fn();
    render(<Harness initial={three} onChange={onChange} />);

    await openRow('Second');
    await userEvent.click(tool('Выше'));

    expect(titles()).toEqual(['Second', 'First', 'Third']);
    expect(ids(lastChange(onChange))).toEqual(['b', 'x', 'a', 'c']);
  });

  it('moves a task down', async () => {
    render(<Harness initial={three} />);

    await openRow('First');
    await userEvent.click(tool('Ниже'));

    expect(titles()).toEqual(['Second', 'First', 'Third']);
  });

  it('keeps the row open and follows the task through repeated moves', async () => {
    render(<Harness initial={three} />);

    await openRow('First');
    await userEvent.click(tool('Ниже'));
    await userEvent.click(tool('Ниже'));

    expect(titles()).toEqual(['Second', 'Third', 'First']);
    expect(screen.getByRole('button', { name: /^First/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(tool('Ниже')).toBeDisabled();
    expect(tool('Выше')).toBeEnabled();
  });

  it('disables "Выше" for the first task and "Ниже" for the last', async () => {
    render(<Harness initial={three} />);

    await openRow('First');
    expect(tool('Выше')).toBeDisabled();
    expect(tool('Ниже')).toBeEnabled();

    await openRow('Third');
    expect(tool('Выше')).toBeEnabled();
    expect(tool('Ниже')).toBeDisabled();
  });

  it('does not touch the other routine', async () => {
    const onChange = vi.fn();
    render(<Harness initial={three} onChange={onChange} />);

    await openRow('Third');
    await userEvent.click(tool('Выше'));

    const evening = lastChange(onChange).filter((t) => t.routine === 'evening');
    expect(ids(evening)).toEqual(['x']);
  });

  it('can move a disabled task', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await openRow('Morning two');
    await userEvent.click(tool('Выше'));

    expect(titles()).toEqual(['Morning two', 'Morning one']);
    expect(lastChange(onChange).find((t) => t.id === 'm2')?.enabled).toBe(false);
  });
});

describe('Editor: adding', () => {
  const openForm = () =>
    userEvent.click(screen.getByRole('button', { name: /Добавить дело/ }));
  const nameField = () => screen.getByRole('textbox', { name: 'Название нового дела' });

  it('adds a task to the end of the selected routine', async () => {
    const onChange = vi.fn();
    render(<Harness routine="evening" onChange={onChange} />);

    await openForm();
    await userEvent.type(nameField(), '  Новое дело ');
    await userEvent.click(screen.getByRole('button', { name: 'Добавить' }));

    expect(titles()).toEqual(['Evening one', 'Evening two', 'Новое дело']);
    const saved = lastChange(onChange);
    expect(saved.at(-1)).toMatchObject({
      title: 'Новое дело',
      routine: 'evening',
      required: false,
    });
    expect(saved).toHaveLength(5);
  });

  it('stores the "required" checkbox', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await openForm();
    await userEvent.type(nameField(), 'Важное');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Обязательное' }));
    await userEvent.click(screen.getByRole('button', { name: 'Добавить' }));

    expect(lastChange(onChange).at(-1)).toMatchObject({
      title: 'Важное',
      required: true,
    });
  });

  it('submits with Enter and closes the form', async () => {
    render(<Harness />);

    await openForm();
    await userEvent.type(nameField(), 'Через Enter{Enter}');

    expect(titles().at(-1)).toBe('Через Enter');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Добавить дело/ })).toBeInTheDocument();
  });

  it('does not allow an empty title', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await openForm();
    expect(screen.getByRole('button', { name: 'Добавить' })).toBeDisabled();
    await userEvent.type(nameField(), '   {Enter}');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('cancels with the button and with Escape', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await openForm();
    await userEvent.type(nameField(), 'Не нужно');
    await userEvent.click(screen.getByRole('button', { name: 'Отмена' }));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await openForm();
    await userEvent.type(nameField(), 'Тоже не нужно{Escape}');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    expect(onChange).not.toHaveBeenCalled();
    expect(titles()).toHaveLength(2);
  });
});

describe('Editor: renaming', () => {
  const startRename = async (title: string) => {
    await openRow(title);
    await userEvent.click(tool('Изменить'));
  };
  const field = () => screen.getByRole('textbox', { name: 'Название дела' });

  it('renames a task and keeps its place', async () => {
    const onChange = vi.fn();
    render(<Harness routine="evening" onChange={onChange} />);

    await startRename('Evening one');
    expect(field()).toHaveValue('Evening one');
    await userEvent.clear(field());
    await userEvent.type(field(), 'Renamed');
    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(titles()).toEqual(['Renamed', 'Evening two']);
    expect(lastChange(onChange).find((t) => t.id === 'e1')).toMatchObject({
      title: 'Renamed',
      routine: 'evening',
      required: false,
    });
  });

  it('does not save an empty title', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await startRename('Morning one');
    await userEvent.clear(field());

    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeDisabled();
    await userEvent.type(field(), '{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('cancels with the button and with Escape', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await startRename('Morning one');
    await userEvent.type(field(), ' edited');
    await userEvent.click(screen.getByRole('button', { name: 'Отмена' }));
    expect(titles()[0]).toBe('Morning one');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await startRename('Morning one');
    await userEvent.type(field(), ' edited{Escape}');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps a disabled task disabled after renaming', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await startRename('Morning two');
    await userEvent.type(field(), '!{Enter}');

    expect(lastChange(onChange).find((t) => t.id === 'm2')).toMatchObject({
      title: 'Morning two!',
      enabled: false,
    });
  });

  it('opens only one action at a time', async () => {
    render(<Harness />);

    await startRename('Morning one');
    await userEvent.click(screen.getByRole('button', { name: /Добавить дело/ }));

    expect(
      screen.queryByRole('textbox', { name: 'Название дела' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Название нового дела' }),
    ).toBeInTheDocument();
  });
});

describe('Editor: deleting', () => {
  const startDelete = async (title: string) => {
    await openRow(title);
    await userEvent.click(tool('Удалить'));
  };

  it('asks first and deletes only after confirmation', async () => {
    const onChange = vi.fn();
    render(<Harness routine="evening" onChange={onChange} />);

    await startDelete('Evening one');
    expect(screen.getByText('Удалить «Evening one»?')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Удалить' }));

    expect(titles()).toEqual(['Evening two']);
    expect(ids(lastChange(onChange))).toEqual(['m1', 'm2', 'e2']);
  });

  it('keeps the task when the confirmation is cancelled', async () => {
    const onChange = vi.fn();
    render(<Harness routine="evening" onChange={onChange} />);

    await startDelete('Evening one');
    await userEvent.click(screen.getByRole('button', { name: 'Отмена' }));

    expect(titles()).toEqual(['Evening one', 'Evening two']);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('can delete the last task of a routine', async () => {
    render(<Harness initial={[tasks[0]]} />);

    await startDelete('Morning one');
    await userEvent.click(screen.getByRole('button', { name: 'Удалить' }));

    expect(screen.getByText('Дел пока нет')).toBeInTheDocument();
  });

  it('closes an open action when the routine tab changes', async () => {
    render(<Harness />);

    await startDelete('Morning one');
    await userEvent.click(screen.getByRole('tab', { name: 'Вечер' }));
    await userEvent.click(screen.getByRole('tab', { name: 'Утро' }));

    expect(screen.queryByText('Удалить «Morning one»?')).not.toBeInTheDocument();
  });
});
