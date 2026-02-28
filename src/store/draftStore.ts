/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { getUUID } from "@utils/getUUID";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createIdbStorage } from "./createIdbStorage";

export type OutputColor = "Color" | "Monochrome" | "Grayscale";

export interface TimeAndIdentifierType {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface DraftPageConfig {
  pageNumber: number;
  excluded: boolean;
  outputColor?: OutputColor;
  copyCount?: number;
}

export interface DraftJob extends TimeAndIdentifierType {
  document: DraftDocument;
  copyCount: number;
  outputColor: OutputColor;
  pageConfigs: DraftPageConfig[];
}

export interface DraftDocument extends TimeAndIdentifierType {
  filename: string;
  contentType: string;
  fileId: string;
  pageCount: number;
}

export interface DraftTransaction extends TimeAndIdentifierType {
  vendorId?: number;
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
    currentDraftJobId: string | null;
  };
  hydrated: boolean;
  setHydrated: () => void;

  createDraftTransaction: (
    documents: DocumentMetadata[],
    vendorId?: number,
  ) => string;

  setCurrentDraftTransactionId: (id: string) => void;
  clearCurrentDraftTransactionId: () => void;

  updateTransactionVendor: (transactionId: string, vendorId: number) => void;

  setCurrentDraftJobId: (id: string) => void;
  clearCurrentDraftJobId: () => void;

  updateDraftJob: (
    transactionId: string,
    jobId: string,
    updates: Partial<DraftJob>,
  ) => void;
  togglePageExclusion: (
    transactionId: string,
    jobId: string,
    pageNumber: number,
  ) => void;

  updatePageConfig: (
    transactionId: string,
    jobId: string,
    pageNumber: number,
    updates: Partial<Omit<DraftPageConfig, "pageNumber">>,
  ) => void;

  resetPageConfig: (
    transactionId: string,
    jobId: string,
    pageNumber: number,
  ) => void;
}

export const useDraftStore = create<DraftStore>()(
  persist(
    immer((set) => ({
      state: {
        transactions: {},
        currentDraftTransactionId: null,
        currentDraftJobId: null,
      },
      hydrated: false,
      setHydrated: () => {
        set((store) => {
          store.hydrated = true;
        });
      },
      createDraftTransaction: (documentsMetadata, vendorId) => {
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
          const pageConfigs: DraftPageConfig[] = Array.from(
            { length: document.pageCount },
            (_, i) => ({
              pageNumber: i + 1,
              excluded: false,
            }),
          );
          return {
            id: getUUID(),
            createdAt: now,
            updatedAt: now,
            document,
            copyCount: 1,
            outputColor: "Monochrome",
            pageConfigs,
          } satisfies DraftJob;
        });

        const transaction: DraftTransaction = {
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
      clearCurrentDraftTransactionId: () => {
        set((store) => {
          store.state.currentDraftTransactionId = null;
        });
      },
      updateDraftJob: (transactionId, jobId, updates) => {
        set((store) => {
          const transaction = store.state.transactions[transactionId];
          if (!transaction) return;

          const job = transaction.jobs.find((j) => j.id === jobId);
          if (job) {
            Object.assign(job, updates);
          }
        });
      },
      updateTransactionVendor: (transactionId, vendorId) => {
        set((store) => {
          const transaction = store.state.transactions[transactionId];
          if (transaction) {
            transaction.vendorId = vendorId;
          }
        });
      },
      setCurrentDraftJobId: (id) => {
        set((store) => {
          store.state.currentDraftJobId = id;
        });
      },
      clearCurrentDraftJobId: () => {
        set((store) => {
          store.state.currentDraftJobId = null;
        });
      },
      togglePageExclusion: (transactionId, jobId, pageNumber) => {
        set((store) => {
          const transaction = store.state.transactions[transactionId];
          if (!transaction) return;
          const job = transaction.jobs.find((j) => j.id === jobId);
          if (job?.pageConfigs[pageNumber]) {
            const currentStatus = job.pageConfigs[pageNumber].excluded;
            job.pageConfigs[pageNumber].excluded = !currentStatus;
          }
        });
      },
      updatePageConfig: (
        transactionId: string,
        jobId: string,
        pageNumber: number,
        updates: Partial<Omit<DraftPageConfig, "pageNumber">>,
      ) => {
        console.log(transactionId, jobId, pageNumber, updates);
      },

      resetPageConfig: (
        transactionId: string,
        jobId: string,
        pageNumber: number,
      ) => {
        console.log(transactionId, jobId, pageNumber);
      },
    })),
    {
      name: "printit-draft-storage",
      storage: createIdbStorage<Pick<DraftStore, "state">>(),
      partialize: (store: DraftStore) => ({ state: store.state }),
      onRehydrateStorage: (store) => {
        return () => {
          console.log("printit-draft-storage: hydrated");
          store.setHydrated();
        };
      },
    },
  ),
);
