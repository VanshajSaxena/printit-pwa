import { create } from "zustand";

export type PresenceStatus = "online" | "offline" | "busy" | "away";

interface PresenceState {
  // Map of vendorId to their presence status
  presenceMap: Map<number, PresenceStatus>;

  // Currently selected vendor ID
  currentVendorId: number | null;

  // Actions
  setPresence: (vendorId: number, status: PresenceStatus) => void;
  bulkUpdate: (
    presences: { vendorId: number; status: PresenceStatus }[],
  ) => void;
  clear: () => void;
  setCurrentVendorId: (vendorId: number | null) => void;
  getPresence: (vendorId: number) => PresenceStatus | undefined;
  getCurrentVendorPresence: () => PresenceStatus | undefined;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  presenceMap: new Map(),
  currentVendorId: null,

  setPresence: (vendorId, status) => {
    set((state) => {
      const newMap = new Map(state.presenceMap);
      newMap.set(vendorId, status);
      return { presenceMap: newMap };
    });
  },

  bulkUpdate: (presences) => {
    set((state) => {
      const newMap = new Map(state.presenceMap);
      presences.forEach(({ vendorId, status }) => {
        newMap.set(vendorId, status);
      });
      return { presenceMap: newMap };
    });
  },

  clear: () => {
    set({
      presenceMap: new Map(),
    });
  },

  setCurrentVendorId: (vendorId) => {
    set({ currentVendorId: vendorId });
  },

  getPresence: (vendorId) => get().presenceMap.get(vendorId),

  getCurrentVendorPresence: () => {
    const { currentVendorId, presenceMap } = get();
    if (currentVendorId === null) return undefined;
    return presenceMap.get(currentVendorId);
  },
}));
