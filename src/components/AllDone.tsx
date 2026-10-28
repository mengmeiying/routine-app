import { EditorButton } from './EditorButton';
import styles from './AllDone.module.css';

type Props = {
  routineTitle: string;
  onOpenEditor: () => void;
};

export function AllDone({ routineTitle, onOpenEditor }: Props) {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <EditorButton onClick={onOpenEditor} />
      </header>
      <div className={styles.content}>
        <h1 className={styles.title}>Всё готово</h1>
        <p className={styles.text}>{routineTitle}: все дела выполнены</p>
      </div>
    </section>
  );
}
