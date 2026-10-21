import { getRoutineKind } from './lib/routine';
import styles from './App.module.css';

export default function App() {
  const title = getRoutineKind(new Date()) === 'morning' ? 'Утро' : 'Вечер';

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>Скоро здесь будет рутина</p>
    </main>
  );
}
