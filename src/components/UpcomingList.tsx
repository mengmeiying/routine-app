import type { Task } from '../data/tasks';
import styles from './UpcomingList.module.css';

export function UpcomingList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return null;

  return (
    <ul className={styles.list}>
      {tasks.map((task) => (
        <li key={task.id} className={styles.item}>
          {task.title}
        </li>
      ))}
    </ul>
  );
}
