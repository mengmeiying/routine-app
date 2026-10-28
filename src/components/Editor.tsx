import { useState } from 'react';
import type { Task } from '../data/tasks';
import type { RoutineKind } from '../lib/routine';
import { addTask, createTaskId, removeTask, renameTask } from '../lib/taskList';
import { AddTaskForm } from './AddTaskForm';
import { TaskRow, type RowMode } from './TaskRow';
import styles from './Editor.module.css';

type Props = {
  tasks: Task[];
  initialRoutine: RoutineKind;
  onBack: () => void;
  onChange: (tasks: Task[]) => void;
};

// Only one action is open at a time.
type Action = { kind: 'rename' | 'delete'; id: string } | { kind: 'add' } | null;

const TABS: { kind: RoutineKind; label: string }[] = [
  { kind: 'morning', label: 'Утро' },
  { kind: 'evening', label: 'Вечер' },
];

export function Editor({ tasks, initialRoutine, onBack, onChange }: Props) {
  const [routine, setRoutine] = useState(initialRoutine);
  const [action, setAction] = useState<Action>(null);
  const list = tasks.filter((t) => t.routine === routine);

  const close = () => setAction(null);
  const modeOf = (id: string): RowMode =>
    action !== null && action.kind !== 'add' && action.id === id ? action.kind : 'view';

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={onBack}>
          ← Назад
        </button>
        <h1 className={styles.title}>Список дел</h1>
      </header>

      <div role="tablist" aria-label="Рутина" className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.kind}
            type="button"
            role="tab"
            aria-selected={routine === tab.kind}
            className={styles.tab}
            onClick={() => {
              setRoutine(tab.kind);
              close();
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {list.length === 0 ? (
          <p className={styles.empty}>Дел пока нет</p>
        ) : (
          <ol className={styles.list}>
            {list.map((task) => (
              <li key={task.id} className={styles.item}>
                <TaskRow
                  task={task}
                  mode={modeOf(task.id)}
                  onStartRename={() => setAction({ kind: 'rename', id: task.id })}
                  onStartDelete={() => setAction({ kind: 'delete', id: task.id })}
                  onRename={(title) => {
                    onChange(renameTask(tasks, task.id, title));
                    close();
                  }}
                  onDelete={() => {
                    onChange(removeTask(tasks, task.id));
                    close();
                  }}
                  onCancel={close}
                />
              </li>
            ))}
          </ol>
        )}

        {action?.kind === 'add' ? (
          <div className={styles.add}>
            <AddTaskForm
              onAdd={(title, required) => {
                onChange(
                  addTask(tasks, { id: createTaskId(), title, routine, required }),
                );
                close();
              }}
              onCancel={close}
            />
          </div>
        ) : (
          <button
            type="button"
            className={styles.addButton}
            onClick={() => setAction({ kind: 'add' })}
          >
            <span aria-hidden="true">+</span> Добавить дело
          </button>
        )}
      </div>
    </section>
  );
}
