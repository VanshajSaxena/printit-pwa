/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createIdbStorage } from "./createIdbStorage";
import { enableMapSet } from "immer";

enableMapSet();

export interface VendorProfile {
  id: number;
  firstName: string;
  lastName: string;
  givenName: string | null;
  username: string;
  lastUsedAt?: string;
}

interface VendorStore {
  vendors: Record<number, VendorProfile>;
  selectorMap: Record<string, number>;
  hydrated: boolean;

  setHydrated: () => void;
  upsertVendor: (vendor: VendorProfile) => void;
  getVendor: (
    selector: number | string | undefined,
  ) => VendorProfile | undefined;
  getAllVendors: () => VendorProfile[];
}

export const useVendorStore = create<VendorStore>()(
  persist(
    immer((set, get) => ({
      vendors: {},
      selectorMap: {},
      hydrated: false,

      setHydrated: () => {
        set((state) => {
          state.hydrated = true;
        });
      },

      upsertVendor: (vendor) => {
        set((state) => {
          state.vendors[vendor.id] = {
            ...(state.vendors[vendor.id] || {}),
            ...vendor,
            lastUsedAt: new Date().toISOString(),
          };

          if (vendor.username) {
            state.selectorMap[vendor.username] = vendor.id;
          }
        });
      },

      getVendor: (selector) => {
        const state = get();
        if (!selector) return undefined;

        if (typeof selector === "number") {
          return state.vendors[selector];
        }

        if (typeof selector === "string") {
          const id = state.selectorMap[selector];
          return id ? state.vendors[id] : undefined;
        }
      },

      getAllVendors: () => {
        return Object.values(get().vendors);
      },
    })),
    {
      name: "printit-vendor-storage",
      storage: createIdbStorage<Pick<VendorStore, "vendors" | "selectorMap">>(),
      partialize: (state) => ({
        vendors: state.vendors,
        selectorMap: state.selectorMap,
      }),
      onRehydrateStorage: (store) => {
        return () => {
          store.setHydrated();
        };
      },
    },
  ),
);
