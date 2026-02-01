import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createIdbStorage } from "./createIdbStorage";
import { getPdfPageCount } from "../utils/getPdfPageCount";

function getUUID() {
  return crypto.randomUUID();
}

interface DraftBaseType {
  id: string;
  createdAt: number;
  updatedAt: number;
}

interface DraftDocument {
  filename: string;
  contentType: string;
  file: File;
  pageCount: number;
}

interface DraftJob extends DraftBaseType {
  document: DraftDocument;
  copies: number;
}

interface DraftTransaction extends DraftBaseType {
  jobs: DraftJob[];
}

interface DraftStore {
  state: {
    transactions: Record<string, DraftTransaction>;
    currentDraftTransactionId: string | null;
  };
  hydrated: boolean;
  setHydrated: () => void;
  createDraftTransaction: (files: File[]) => Promise<string>;
  setCurrentDraftTransactionId: (id: string) => void;
  getCurrentDraftTransactionId: () => string | null;
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
      createDraftTransaction: async (files) => {
        const now = Date.now();
        const documents = await Promise.all(
          files.map(async (file) => {
            const pageCount = await getPdfPageCount(file);
            return {
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
            copies: 1, // we assume single copy by default
          };
        });
        const transaction = {
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
    })),
    {
      name: "printly-draft-storage",
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
