type IconProps = { size?: number };

const Icon = ({ d, size = 24 }: IconProps & { d: string }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
  >
    <path fill="currentColor" d={d} />
  </svg>
);

export const ArrowUpIcon = (p: IconProps) => (
  <Icon {...p} d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
);

export const ArrowDownIcon = (p: IconProps) => (
  <Icon {...p} d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
);

export const PencilIcon = (p: IconProps) => (
  <Icon
    {...p}
    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
  />
);

export const TrashIcon = (p: IconProps) => (
  <Icon
    {...p}
    d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
  />
);

export const ChevronIcon = (p: IconProps) => (
  <Icon {...p} d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
);
