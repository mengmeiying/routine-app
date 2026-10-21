import type { RoutineKind } from '../lib/routine';

export type Task = {
  id: string;
  title: string;
  routine: RoutineKind;
  // Stored but not used by the UI yet.
  required: boolean;
  // Treated as true when omitted.
  enabled?: boolean;
};

// Array order is the order of execution.
export const tasks: Task[] = [
  // morning
  { id: 'hot-water', title: 'Стакан воды', routine: 'morning', required: true },
  { id: 'shower', title: 'Душ', routine: 'morning', required: false },
  { id: 'teeth-am', title: 'Почистить зубы', routine: 'morning', required: true },
  { id: 'stretch-am', title: 'Растяжка', routine: 'morning', required: false },
  {
    id: 'exercise',
    title: 'Зарядка',
    routine: 'morning',
    required: true,
  },
  { id: 'meditation', title: 'Медитация 5 минут', routine: 'morning', required: true },
  { id: 'bed', title: 'Застелить постель', routine: 'morning', required: false },
  // evening
  { id: 'teeth-pm', title: 'Почистить зубы', routine: 'evening', required: true },
  { id: 'read', title: 'Почитать книгу', routine: 'evening', required: true },
  { id: 'stretch-pm', title: 'Растяжка перед сном', routine: 'evening', required: false },
  {
    id: 'clothes',
    title: 'Подготовить одежду на завтра',
    routine: 'evening',
    required: false,
    enabled: false,
  },
];
