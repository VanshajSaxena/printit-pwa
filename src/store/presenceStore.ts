import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";

enableMapSet();

export type PresenceStatus = "online" | "offline" | "away" | undefined;

interface PresenceState {
  presenceMap: Map<number, PresenceStatus>;

  setPresence: (id: number, status: PresenceStatus) => void;

  getPresence: (id: number) => PresenceStatus;

  clear: () => void;
}

export const usePresenceStore = create<PresenceState>()(
  immer((set, get) => ({
    presenceMap: new Map(),

    setPresence: (id, status) => {
      set((state) => {
        state.presenceMap.set(id, status);
      });
    },

    getPresence: (id) => {
      return get().presenceMap.get(id);
    },

    clear: () => {
      set((state) => {
        state.presenceMap.clear();
      });
    },
  })),
);
