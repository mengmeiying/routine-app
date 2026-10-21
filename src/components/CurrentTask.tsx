import type { Task } from '../data/tasks';
import styles from './CurrentTask.module.css';

type Props = {
  routineTitle: string;
  task: Task;
  position: number;
  total: number;
};

export function CurrentTask({ routineTitle, task, position, total }: Props) {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h1 className={styles.routine}>{routineTitle}</h1>
        <span className={styles.counter}>
          {position} из {total}
        </span>
      </header>
      <p className={styles.task}>{task.title}</p>
    </section>
  );
}
