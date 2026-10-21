import styles from './AllDone.module.css';

export function AllDone({ routineTitle }: { routineTitle: string }) {
  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Всё готово</h1>
      <p className={styles.text}>{routineTitle}: все дела выполнены</p>
    </section>
  );
}
