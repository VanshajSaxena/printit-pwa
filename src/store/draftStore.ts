import { getUUID } from "@utils/getUUID";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { getPdfPageCount } from "../utils/getPdfPageCount";
import { createIdbStorage } from "./createIdbStorage";

export type OutputColor = "COLOR" | "MONOCHROME" | "GRAYSCALE";

export interface TimeAndIdentifierType {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface DraftDocument extends TimeAndIdentifierType {
  filename: string;
  contentType: string;
  file: File;
  pageCount: number;
}

export interface DraftJob extends TimeAndIdentifierType {
  document: DraftDocument;
  copyCount: number;
  outputColor: OutputColor;
}

export interface DraftTransaction extends TimeAndIdentifierType {
  vendorId: number;
  jobs: DraftJob[];
}

export interface DraftStore {
  state: {
    transactions: Record<string, DraftTransaction>;
    currentDraftTransactionId: string | null;
  };
  hydrated: boolean;
  setHydrated: () => void;
  createDraftTransaction: (files: File[], vendorId: number) => Promise<string>;
  setCurrentDraftTransactionId: (id: string) => void;
  getCurrentDraftTransactionId: () => string | null;
  clearCurrentDraftTransactionId: () => void;
}

export const useDraftStore = create<DraftStore>()(
  persist(
    immer((set, get) => ({
      state: {
        transactions: {},
        currentDraftTransactionId: null,
      },
      hydrated: false,
      setHydrated: () => {
        set((store) => {
          store.hydrated = true;
        });
      },
      createDraftTransaction: async (files, vendorId) => {
        const now = new Date().toISOString();
        const documents = await Promise.all(
          files.map(async (file) => {
            const pageCount = await getPdfPageCount(file);
            return {
              id: getUUID(),
              createdAt: now,
              updatedAt: now,
              filename: file.name,
              contentType: file.type,
              file,
              pageCount,
            };
          }),
        );
        const jobs = documents.map((document) => {
          return {
            id: getUUID(),
            createdAt: now,
            updatedAt: now,
            document,
            copyCount: 1, // we assume single copy by default
            outputColor: "MONOCHROME", // we assume Monochrome by default
          } satisfies DraftJob;
        });
        const transaction = {
          vendorId,
          id: getUUID(),
          createdAt: now,
          updatedAt: now,
          jobs,
        };
        set((store) => {
          store.state.transactions[transaction.id] = transaction;
        });
        return transaction.id;
      },
      setCurrentDraftTransactionId: (id) => {
        set((store) => {
          store.state.currentDraftTransactionId = id;
        });
      },
      getCurrentDraftTransactionId: () => {
        return get().state.currentDraftTransactionId;
      },
      clearCurrentDraftTransactionId: () => {
        set((store) => (store.state.currentDraftTransactionId = null));
      },
    })),
    {
      name: "printit-draft-storage",
      storage: createIdbStorage<Pick<DraftStore, "state">>(),
      partialize: (store: DraftStore) => ({ state: store.state }),
      onRehydrateStorage: (store) => {
        return () => {
          store.setHydrated();
        };
      },
    },
  ),
);
