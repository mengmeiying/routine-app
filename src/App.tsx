import styles from './App.module.css';

// Placeholder: real routine/logical-day logic will live in src/lib.
function isMorning(now: Date): boolean {
  const hour = now.getHours();
  return hour >= 6 && hour < 18;
}

export default function App() {
  const title = isMorning(new Date()) ? 'Утро' : 'Вечер';

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>Скоро здесь будет рутина</p>
    </main>
  );
}
