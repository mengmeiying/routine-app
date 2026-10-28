import { useState } from 'react';
import type { Task } from '../data/tasks';
import { MAX_TITLE_LENGTH, normalizeTitle } from '../lib/taskList';
import form from './Form.module.css';
import styles from './TaskRow.module.css';

export type RowMode = 'view' | 'rename' | 'delete';

type Props = {
  task: Task;
  mode: RowMode;
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
  return (
    <div className={styles.row}>
      <span className={off ? styles.titleOff : styles.title}>{task.title}</span>
      {off && <span className={styles.badge}>выключено</span>}
      <button
        type="button"
        className={styles.icon}
        aria-label={`Изменить «${task.title}»`}
        onClick={onStartRename}
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="currentColor"
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
          />
        </svg>
      </button>
      <button
        type="button"
        className={styles.icon}
        aria-label={`Удалить «${task.title}»`}
        onClick={onStartDelete}
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="currentColor"
            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
          />
        </svg>
      </button>
    </div>
  );
}
