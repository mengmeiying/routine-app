import { useState } from 'react';
import { useEditorOpen } from './hooks/useEditorOpen';
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
import type { Task } from './data/tasks';
import { loadProgress, loadTasks, saveProgress, saveTasks } from './lib/storage';
import { ActionButtons } from './components/ActionButtons';
import { AllDone } from './components/AllDone';
import { CurrentTask } from './components/CurrentTask';
import { Editor } from './components/Editor';
import { UpcomingList } from './components/UpcomingList';
import styles from './App.module.css';

export default function App() {
  const now = useNow();
  const date = getLogicalDate(now);
  const routine = getRoutineKind(now);

  const { open: editorOpen, openEditor, closeEditor } = useEditorOpen();
  const [tasks, setTasks] = useState(loadTasks);
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

  const changeTasks = (next: Task[]) => {
    saveTasks(next);
    setTasks(next);
  };

  if (editorOpen) {
    return (
      <main className={styles.page}>
        <Editor
          tasks={tasks}
          initialRoutine={routine}
          onBack={closeEditor}
          onChange={changeTasks}
        />
      </main>
    );
  }

  if (!current) {
    return (
      <main className={styles.page}>
        <AllDone routineTitle={title} empty={total === 0} onOpenEditor={openEditor} />
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
        onOpenEditor={openEditor}
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
