/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { enableMapSet } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createIdbStorage } from "./createIdbStorage";

enableMapSet();

export interface VendorLocation {
  latitude: number | null;
  longitude: number | null;
}

export interface VendorProfile {
  id: number;
  firstName: string;
  lastName: string;
  displayName: string | null;
  username: string;
  address: string;
  lastUsedAt?: string;
}

interface VendorState {
  vendors: Record<number, VendorProfile>;
  usernameSelectorMap: Record<string, number>;

  hydrated: boolean;
  setHydrated: () => void;
  upsertVendor: (vendor: VendorProfile) => void;
  getVendor: (selector: number | string | null) => VendorProfile | undefined;
  getAllVendors: () => VendorProfile[];
}

export const useVendorStore = create<VendorState>()(
  persist(
    immer((set, get) => ({
      vendors: {},
      usernameSelectorMap: {},
      slugSelectorMap: {},
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
            const usernameKey = vendor.username.startsWith("@")
              ? vendor.username
              : `@${vendor.username}`;
            state.usernameSelectorMap[usernameKey] = vendor.id;
          }
        });
      },

      getVendor: (selector) => {
        const state = get();
        if (!selector) return undefined;

        if (typeof selector === "number") {
          return state.vendors[selector];
        }

        if (selector.startsWith("@")) {
          const id = state.usernameSelectorMap[selector];
          return id ? state.vendors[id] : undefined;
        }

        return undefined;
      },

      getAllVendors: () => {
        return Object.values(get().vendors).sort((a, b) => {
          const dateA = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
          const dateB = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
          return dateB - dateA;
        });
      },
    })),
    {
      name: "printit-vendor-storage",
      version: 1,
      storage:
        createIdbStorage<
          Pick<VendorState, "vendors" | "usernameSelectorMap">
        >(),
      partialize: (state) => ({
        vendors: state.vendors,
        usernameSelectorMap: state.usernameSelectorMap,
      }),
      onRehydrateStorage: (store) => {
        return () => {
          console.log("printit-vendor-storage: hydrated");
          store.setHydrated();
        };
      },
      migrate: (persistedState, version: number) => {
        const store = persistedState as VendorState;
        if (version < 1) {
          store.vendors[1] = {
            id: 1,
            firstName: "Vanshaj",
            lastName: "Saxena",
            displayName: "Vanshaj's Printer",
            username: "vanshaj",
            address: "",
            lastUsedAt: new Date().toISOString(),
          };
        }
        return store;
      },
    },
  ),
);
