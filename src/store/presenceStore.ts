import { create } from "zustand";

export type PresenceStatus = "online" | "offline" | "busy" | "away" | undefined;

export interface VendorObject {
  id: number;
  firstName: string;
  lastName: string;
  givenName: string | null;
  status: PresenceStatus;
}

interface PresenceState {
  presenceMap: Map<number, VendorObject>;
  selectorMap: Map<string, number>;
  setPresence: (id: number, vendor: VendorObject, selector?: string) => void;
  updatePresence: (id: number, status: PresenceStatus) => void;
  clear: () => void;
  getPresence: (
    selector: number | string | undefined,
  ) => VendorObject | undefined;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  presenceMap: new Map(),
  selectorMap: new Map(),
  setPresence: (id, vendor, selector?: string) => {
    set((state) => {
      const newPresenceMap = new Map(state.presenceMap);
      newPresenceMap.set(id, vendor);
      if (!selector) {
        return { presenceMap: newPresenceMap };
      }
      const newSelectorMap = new Map(state.selectorMap);
      newSelectorMap.set(selector, id);
      return { presenceMap: newPresenceMap, selectorMap: newSelectorMap };
    });
  },
  updatePresence: (id, status) => {
    set((store) => {
      const newPresenceMap = new Map(store.presenceMap);
      const vendor = store.presenceMap.get(id);

      if (vendor) {
        const updatedVendor = { ...vendor, status };
        newPresenceMap.set(id, updatedVendor);
      }

      return { presenceMap: newPresenceMap };
    });
  },
  clear: () => {
    set({
      presenceMap: new Map(),
    });
  },
  getPresence: (selector) => {
    if (!selector) {
      return undefined;
    }
    if (typeof selector === "number") {
      return get().presenceMap.get(selector);
    }
    if (typeof selector === "string") {
      const id = get().selectorMap.get(selector);
      if (!id) {
        return undefined;
      }
      return get().presenceMap.get(id);
    }
  },
}));
