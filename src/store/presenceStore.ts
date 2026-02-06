import { create } from "zustand";

export interface PresenceData {
  status: "online" | "offline" | "away";
  id: number;
}

interface PresenceStore {
  vendors: Record<string, PresenceData>;
  setPresence: (vendorId: string, status: PresenceData) => void;
  bulkUpdate: (updates: Record<string, PresenceData>) => void;
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
