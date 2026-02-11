import { getUUID } from "@utils/getUUID";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createIdbStorage } from "./createIdbStorage";
import { VendorObject } from "./presenceStore";

export type OutputColor = "COLOR" | "MONOCHROME" | "GRAYSCALE";

export interface TimeAndIdentifierType {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface DraftDocument extends TimeAndIdentifierType {
  filename: string;
  contentType: string;
  fileId: string;
  pageCount: number;
}

export interface DraftJob extends TimeAndIdentifierType {
  document: DraftDocument;
  copyCount: number;
  outputColor: OutputColor;
}

export interface DraftTransaction extends TimeAndIdentifierType {
  vendor?: VendorObject;
  jobs: DraftJob[];
}

export interface DocumentMetadata {
  fileId: string;
  filename: string;
  contentType: string;
  pageCount: number;
}

export interface DraftStore {
  state: {
    transactions: Record<string, DraftTransaction>;
    currentDraftTransactionId: string | null;
  };
  hydrated: boolean;
  setHydrated: () => void;

  createDraftTransaction: (
    documents: DocumentMetadata[],
    vendor?: VendorObject,
  ) => string;
  setCurrentDraftTransactionId: (id: string) => void;
  clearCurrentDraftTransactionId: () => void;
  updateDraftJob: (
    transactionId: string,
    jobId: string,
    updates: Partial<DraftJob>,
  ) => void;

  updateTransactionVendor: (
    transactionId: string,
    vendor: VendorObject,
  ) => void;
}

export const useDraftStore = create<DraftStore>()(
  persist(
    immer((set) => ({
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
      createDraftTransaction: (documentsMetadata, vendor) => {
        const now = new Date().toISOString();

        const documents: DraftDocument[] = documentsMetadata.map((meta) => ({
          id: getUUID(),
          createdAt: now,
          updatedAt: now,
          filename: meta.filename,
          contentType: meta.contentType,
          fileId: meta.fileId,
          pageCount: meta.pageCount,
        }));

        const jobs = documents.map((document) => {
          return {
            id: getUUID(),
            createdAt: now,
            updatedAt: now,
            document,
            copyCount: 1,
            outputColor: "MONOCHROME",
          } satisfies DraftJob;
        });

        const transaction: DraftTransaction = {
          vendor,
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
      clearCurrentDraftTransactionId: () => {
        set((store) => (store.state.currentDraftTransactionId = null));
      },
      updateDraftJob: (transactionId, jobId, updates) => {
        set((store) => {
          const transaction = store.state.transactions[transactionId];

          const job = transaction.jobs.find((j) => j.id === jobId);
          if (job) {
            Object.assign(job, updates);
          }
        });
      },
      updateTransactionVendor: (transactionId, vendor) => {
        set((store) => {
          const transaction = store.state.transactions[transactionId];
          transaction.vendor = vendor;
        });
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
