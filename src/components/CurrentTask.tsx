import type { Task } from '../data/tasks';
import { EditorButton } from './EditorButton';
import styles from './CurrentTask.module.css';

type Props = {
  routineTitle: string;
  task: Task;
  position: number;
  total: number;
  onOpenEditor: () => void;
};

export function CurrentTask({
  routineTitle,
  task,
  position,
  total,
  onOpenEditor,
}: Props) {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h1 className={styles.routine}>{routineTitle}</h1>
        <div className={styles.side}>
          <span className={styles.counter}>
            {position} из {total}
          </span>
          <EditorButton onClick={onOpenEditor} />
        </div>
      </header>
      <p className={styles.task}>{task.title}</p>
    </section>
  );
}
