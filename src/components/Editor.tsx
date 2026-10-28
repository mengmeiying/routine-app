import { useState } from 'react';
import type { Task } from '../data/tasks';
import type { RoutineKind } from '../lib/routine';
import styles from './Editor.module.css';

type Props = {
  tasks: Task[];
  initialRoutine: RoutineKind;
  onBack: () => void;
};

const TABS: { kind: RoutineKind; label: string }[] = [
  { kind: 'morning', label: 'Утро' },
  { kind: 'evening', label: 'Вечер' },
];

export function Editor({ tasks, initialRoutine, onBack }: Props) {
  const [routine, setRoutine] = useState(initialRoutine);
  const list = tasks.filter((t) => t.routine === routine);

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
            onClick={() => setRoutine(tab.kind)}
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
              <li
                key={task.id}
                className={task.enabled === false ? styles.itemOff : styles.item}
              >
                <span>{task.title}</span>
                {task.enabled === false && (
                  <span className={styles.badge}>выключено</span>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
