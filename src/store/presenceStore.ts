import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";

enableMapSet();

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
  setPresence: (
    id: number,
    vendor: Partial<VendorObject>,
    selector?: string,
  ) => void;
  updatePresence: (id: number, status: PresenceStatus) => void;
  clear: () => void;
  getPresence: (
    selector: number | string | undefined,
  ) => VendorObject | undefined;
}

export const usePresenceStore = create<PresenceState>()(
  immer((set, get) => ({
    presenceMap: new Map(),
    selectorMap: new Map(),

    setPresence: (id, vendorUpdate, selector) => {
      set((state) => {
        const existingVendor = state.presenceMap.get(id);

        state.presenceMap.set(id, {
          ...(existingVendor ?? {}),
          ...vendorUpdate,
          id,
        } as VendorObject);

        if (selector) {
          state.selectorMap.set(selector, id);
        }
      });
    },

    updatePresence: (id, status) => {
      set((state) => {
        const vendor = state.presenceMap.get(id);

        if (vendor) {
          vendor.status = status;
        } else {
          state.presenceMap.set(id, {
            id,
            status,
          } as VendorObject);
        }
      });
    },

    clear: () => {
      set((state) => {
        state.presenceMap.clear();
        state.selectorMap.clear();
      });
    },

    getPresence: (selector) => {
      const state = get();

      if (!selector) {
        return undefined;
      }
      if (typeof selector === "number") {
        const presence = state.presenceMap.get(selector);
        return presence;
      }

      if (typeof selector === "string") {
        const id = state.selectorMap.get(selector);
        if (!id) return undefined;
        const presence = state.presenceMap.get(id);
        return presence;
      }
    },
  })),
);
