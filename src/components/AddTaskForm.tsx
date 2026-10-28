import { useState } from 'react';
import { MAX_TITLE_LENGTH, normalizeTitle } from '../lib/taskList';
import form from './Form.module.css';

type Props = {
  onAdd: (title: string, required: boolean) => void;
  onCancel: () => void;
};

export function AddTaskForm({ onAdd, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [required, setRequired] = useState(false);
  const valid = normalizeTitle(title) !== null;

  return (
    <form
      className={form.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onAdd(title, required);
      }}
    >
      <input
        className={form.input}
        value={title}
        maxLength={MAX_TITLE_LENGTH}
        placeholder="Название"
        aria-label="Название нового дела"
        autoFocus
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel();
        }}
      />
      <label className={form.check}>
        <input
          type="checkbox"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
        />
        Обязательное
      </label>
      <div className={form.buttons}>
        <button type="submit" className={form.primary} disabled={!valid}>
          Добавить
        </button>
        <button type="button" className={form.secondary} onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}
