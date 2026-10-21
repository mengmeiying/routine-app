import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestPersistentStorage } from './storage';

const stubStorageApi = (storage: unknown) => vi.stubGlobal('navigator', { storage });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('requestPersistentStorage', () => {
  it('returns false when the API is unavailable', async () => {
    stubStorageApi(undefined);
    expect(await requestPersistentStorage()).toBe(false);
  });

  it('does not ask again when storage is already persistent', async () => {
    const persist = vi.fn();
    stubStorageApi({ persisted: async () => true, persist });
    expect(await requestPersistentStorage()).toBe(true);
    expect(persist).not.toHaveBeenCalled();
  });

  it('asks the browser and returns its answer', async () => {
    stubStorageApi({ persisted: async () => false, persist: async () => true });
    expect(await requestPersistentStorage()).toBe(true);

    stubStorageApi({ persisted: async () => false, persist: async () => false });
    expect(await requestPersistentStorage()).toBe(false);
  });

  it('returns false when the API throws', async () => {
    stubStorageApi({
      persisted: async () => {
        throw new Error('denied');
      },
      persist: async () => true,
    });
    expect(await requestPersistentStorage()).toBe(false);
  });
});
