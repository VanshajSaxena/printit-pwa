import { create } from "zustand";

export type PresenceStatus = "online" | "offline" | "away";

interface PresenceStore {
  vendors: Record<string, PresenceStatus>;
  setPresence: (vendorId: string, status: PresenceStatus) => void;
  bulkUpdate: (updates: Record<string, PresenceStatus>) => void;
  clear: () => void;
}

export const usePresenceStore = create<PresenceStore>((set) => ({
  vendors: {},
  setPresence: (vendorId, status) => {
    set((state) => ({
      vendors: { ...state.vendors, [vendorId]: status },
    }));
  },
  bulkUpdate: (updates) => {
    set((state) => ({
      vendors: { ...state.vendors, ...updates },
    }));
  },
  clear: () => {
    set({ vendors: {} });
  },
}));
