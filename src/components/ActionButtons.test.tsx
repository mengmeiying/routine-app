import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ActionButtons } from './ActionButtons';

describe('ActionButtons', () => {
  it('calls the matching callback for each button', async () => {
    const onDone = vi.fn();
    const onPostpone = vi.fn();
    render(<ActionButtons canPostpone onDone={onDone} onPostpone={onPostpone} />);

    await userEvent.click(screen.getByRole('button', { name: 'Готово' }));
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onPostpone).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Сделаю позже' }));
    expect(onPostpone).toHaveBeenCalledTimes(1);
  });

  it('hides the postpone button when postponing is pointless', () => {
    render(<ActionButtons canPostpone={false} onDone={vi.fn()} onPostpone={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Готово' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Сделаю позже' }),
    ).not.toBeInTheDocument();
  });
});
