import { EditorButton } from './EditorButton';
import styles from './AllDone.module.css';

type Props = {
  routineTitle: string;
  // The routine has no enabled tasks at all, so "all done" would be misleading.
  empty?: boolean;
  onOpenEditor: () => void;
};

export function AllDone({ routineTitle, empty = false, onOpenEditor }: Props) {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <EditorButton onClick={onOpenEditor} />
      </header>
      <div className={styles.content}>
        <h1 className={styles.title}>{empty ? 'Дел пока нет' : 'Всё готово'}</h1>
        <p className={styles.text}>
          {empty ? 'Добавь дела в редакторе' : `${routineTitle}: все дела выполнены`}
        </p>
      </div>
    </section>
  );
}
