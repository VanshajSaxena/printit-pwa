import { del, get, set } from "idb-keyval";
import type { PersistStorage, StorageValue } from "zustand/middleware";

export const createIdbStorage = <S>(): PersistStorage<S> => ({
  getItem: async (name: string): Promise<StorageValue<S> | null> => {
    try {
      const value = await get<StorageValue<S>>(name);
      return value ?? null;
    } catch (error) {
      console.error(`[IDB Storage] Failed to get item: ${name}`, error);
      return null;
    }
  },
  setItem: async (name: string, value: StorageValue<S>): Promise<void> => {
    try {
      await set(name, value);
    } catch (error) {
      console.error(`[IDB Storage] Failed to set item: ${name}`, error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await del(name);
    } catch (error) {
      console.error(`[IDB Storage] Failed to remove item: ${name}`, error);
    }
  },
});
