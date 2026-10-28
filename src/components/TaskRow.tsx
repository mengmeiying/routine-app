import { useState } from 'react';
import type { Task } from '../data/tasks';
import { MAX_TITLE_LENGTH, normalizeTitle, type MoveDirection } from '../lib/taskList';
import { ArrowDownIcon, ArrowUpIcon, ChevronIcon, PencilIcon, TrashIcon } from './icons';
import form from './Form.module.css';
import styles from './TaskRow.module.css';

// 'open' is the collapsed row with its toolbar shown.
export type RowMode = 'view' | 'open' | 'rename' | 'delete';

type Props = {
  task: Task;
  mode: RowMode;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggle: () => void;
  onMove: (direction: MoveDirection) => void;
  onStartRename: () => void;
  onStartDelete: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onCancel: () => void;
};

function RenameForm({
  task,
  onRename,
  onCancel,
}: Pick<Props, 'task' | 'onRename' | 'onCancel'>) {
  const [value, setValue] = useState(task.title);
  const valid = normalizeTitle(value) !== null;

  return (
    <form
      className={form.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onRename(value);
      }}
    >
      <input
        className={form.input}
        value={value}
        maxLength={MAX_TITLE_LENGTH}
        aria-label="Название дела"
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel();
        }}
      />
      <div className={form.buttons}>
        <button type="submit" className={form.primary} disabled={!valid}>
          Сохранить
        </button>
        <button type="button" className={form.secondary} onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}

export function TaskRow({
  task,
  mode,
  canMoveUp,
  canMoveDown,
  onToggle,
  onMove,
  onStartRename,
  onStartDelete,
  onRename,
  onDelete,
  onCancel,
}: Props) {
  if (mode === 'rename') {
    return <RenameForm task={task} onRename={onRename} onCancel={onCancel} />;
  }

  if (mode === 'delete') {
    return (
      <div className={form.form}>
        <p className={styles.question}>Удалить «{task.title}»?</p>
        <div className={form.buttons}>
          <button type="button" className={form.primary} onClick={onDelete}>
            Удалить
          </button>
          <button type="button" className={form.secondary} onClick={onCancel}>
            Отмена
          </button>
        </div>
      </div>
    );
  }

  const off = task.enabled === false;
  const open = mode === 'open';
  return (
    <div>
      <button
        type="button"
        className={styles.header}
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className={off ? styles.titleOff : styles.title}>{task.title}</span>
        {off && <span className={styles.badge}>выключено</span>}
        <span className={open ? styles.chevronOpen : styles.chevron}>
          <ChevronIcon />
        </span>
      </button>
      {open && (
        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.action}
            disabled={!canMoveUp}
            onClick={() => onMove('up')}
          >
            <ArrowUpIcon />
            Выше
          </button>
          <button
            type="button"
            className={styles.action}
            disabled={!canMoveDown}
            onClick={() => onMove('down')}
          >
            <ArrowDownIcon />
            Ниже
          </button>
          <button type="button" className={styles.action} onClick={onStartRename}>
            <PencilIcon />
            Изменить
          </button>
          <button type="button" className={styles.action} onClick={onStartDelete}>
            <TrashIcon />
            Удалить
          </button>
        </div>
      )}
    </div>
  );
}
