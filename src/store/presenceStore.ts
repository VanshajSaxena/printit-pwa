import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type PresenceStatus = "online" | "offline" | "away";

interface PresenceStore {
  currentVendorId: number | null;
  setCurrentVendorId: (vendorId: number | null) => void;

  vendors: Record<number, PresenceStatus>;
  setPresence: (vendorId: number, status: PresenceStatus) => void;
  bulkUpdate: (updates: Record<number, PresenceStatus>) => void;
  clear: () => void;
}
export const usePresenceStore = create<PresenceStore>()(
  immer((set) => ({
    vendors: {},
    currentVendorId: null,

    setCurrentVendorId: (vendorId) => {
      set((state) => {
        state.currentVendorId = vendorId;
      });
    },
    setPresence: (vendorId, status) => {
      set((state) => {
        state.vendors[vendorId] = status;
      });
    },
    bulkUpdate: (updates) => {
      set((state) => {
        Object.assign(state.vendors, updates);
      });
    },
    clear: () => {
      set((state) => {
        state.vendors = {};
        state.currentVendorId = null;
      });
    },
  })),
);
