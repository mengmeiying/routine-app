import styles from './ActionButtons.module.css';

type Props = {
  canPostpone: boolean;
  onDone: () => void;
  onPostpone: () => void;
};

export function ActionButtons({ canPostpone, onDone, onPostpone }: Props) {
  return (
    <div className={styles.actions}>
      <button type="button" className={styles.done} onClick={onDone}>
        Готово
      </button>
      {canPostpone && (
        <button type="button" className={styles.later} onClick={onPostpone}>
          Сделаю позже
        </button>
      )}
    </div>
  );
}
