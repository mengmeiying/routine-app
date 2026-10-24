import { useState } from 'react';
import { useNow } from './hooks/useNow';
import {
  buildQueue,
  currentTask,
  markDone,
  postpone,
  type DayProgress,
} from './lib/queue';
import { getLogicalDate } from './lib/logicalDay';
import { getRoutineKind } from './lib/routine';
import { loadProgress, loadTasks, saveProgress } from './lib/storage';
import { ActionButtons } from './components/ActionButtons';
import { AllDone } from './components/AllDone';
import { CurrentTask } from './components/CurrentTask';
import { UpcomingList } from './components/UpcomingList';
import styles from './App.module.css';

export default function App() {
  const now = useNow();
  const date = getLogicalDate(now);
  const routine = getRoutineKind(now);

  const [tasks] = useState(loadTasks);
  const [saved, setSaved] = useState(() => ({ date, value: loadProgress(date) }));
  // A new logical date has no saved progress, so marks reset at 06:00.
  const progress = saved.date === date ? saved.value : loadProgress(date);

  const queue = buildQueue(tasks, routine, progress);
  const current = currentTask(queue);
  const total = tasks.filter((t) => t.routine === routine && t.enabled !== false).length;
  const title = routine === 'morning' ? 'Утро' : 'Вечер';

  const update = (next: DayProgress) => {
    saveProgress(date, next);
    setSaved({ date, value: next });
  };

  if (!current) {
    return (
      <main className={styles.page}>
        <AllDone routineTitle={title} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <CurrentTask
        routineTitle={title}
        task={current}
        position={total - queue.length + 1}
        total={total}
      />
      <UpcomingList tasks={queue.slice(1)} />
      <ActionButtons
        canPostpone={queue.length > 1}
        onDone={() => update(markDone(progress, current.id))}
        onPostpone={() => update(postpone(progress, current.id))}
      />
    </main>
  );
}
