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
  { id: 'hot-water', title: 'Стакан горячей воды', routine: 'morning', required: true },
  { id: 'shower', title: 'Душ', routine: 'morning', required: false },
  { id: 'teeth-am', title: 'Почистить зубы', routine: 'morning', required: true },
  { id: 'sun-salute', title: 'Приветствие солнца', routine: 'morning', required: false },
  {
    id: 'gut-exercise',
    title: 'Зарядка для кишечника',
    routine: 'morning',
    required: true,
  },
  { id: 'meditation', title: 'Медитация 5 минут', routine: 'morning', required: true },
  { id: 'bed', title: 'Застелить постель', routine: 'morning', required: false },
  // evening
  { id: 'teeth-pm', title: 'Почистить зубы', routine: 'evening', required: true },
  { id: 'pills', title: 'Выпить таблетки', routine: 'evening', required: true },
  { id: 'moon-salute', title: 'Приветствие луны', routine: 'evening', required: false },
  {
    id: 'elastics',
    title: 'Надеть резинки для брекетов',
    routine: 'evening',
    required: false,
    enabled: false,
  },
];
