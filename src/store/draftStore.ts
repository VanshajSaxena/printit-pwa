/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { getUUID } from "@utils/getUUID";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createIdbStorage } from "./createIdbStorage";
import {
  DraftDocument,
  DraftJob,
  DraftPageConfig,
  DraftStore,
  DraftTransaction,
  OutputColor,
} from "./structure";

export const useDraftStore = create<DraftStore>()(
  persist(
    immer((set, get) => ({
      state: {
        transactions: {},
        currentDraftTransactionId: null,
        currentDraftJobId: null,
        documents: {},
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
            outputColor: "Grayscale",
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
      addJobsToTransaction: (transactionId, documentsMetadata) => {
        set((store) => {
          const transaction = store.state.transactions[transactionId];
          if (!transaction) return;

          const now = new Date().toISOString();

          const newJobs: DraftJob[] = documentsMetadata.map((meta) => {
            const document: DraftDocument = {
              id: getUUID(),
              createdAt: now,
              updatedAt: now,
              filename: meta.filename,
              contentType: meta.contentType,
              fileId: meta.fileId,
              pageCount: meta.pageCount,
            };

            const pageConfigs: DraftPageConfig[] = Array.from(
              { length: meta.pageCount },
              (_, i) => ({ pageNumber: i + 1, excluded: false }),
            );

            return {
              id: getUUID(),
              createdAt: now,
              updatedAt: now,
              document,
              copyCount: 1,
              outputColor: "Grayscale",
              pageConfigs,
            };
          });

          transaction.jobs.push(...newJobs);
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
      deleteDraftJob: (transactionId, jobId) => {
        set((store) => {
          const transaction = store.state.transactions[transactionId];
          if (!transaction) return;
          transaction.jobs = transaction.jobs.filter((j) => j.id !== jobId);
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
          const page = job?.pageConfigs.find(
            (p) => p.pageNumber === pageNumber,
          );
          if (page) {
            page.excluded = !page.excluded;
          }
        });
      },
      updatePageConfig: (transactionId, jobId, pageNumber, updates) => {
        set((store) => {
          const transaction = store.state.transactions[transactionId];
          if (!transaction) return;
          const job = transaction.jobs.find((j) => j.id === jobId);
          const page = job?.pageConfigs.find(
            (p) => p.pageNumber === pageNumber,
          );
          if (page) {
            Object.assign(page, updates);
          }
        });
      },
      updatePageConfigOutputColor: (
        transactionId: string,
        jobId: string,
        pageNumber: number,
        outputColor: OutputColor,
      ) => {
        const { updatePageConfig, state } = get();

        const transaction = state.transactions[transactionId];
        if (!transaction) return;

        const job = transaction.jobs.find((j) => j.id === jobId);

        if (outputColor === job?.outputColor) {
          updatePageConfig(transactionId, jobId, pageNumber, {
            outputColor: undefined,
          });
          return;
        }

        set((store) => {
          const transaction = store.state.transactions[transactionId];
          const job = transaction?.jobs.find((j) => j.id === jobId);
          const page = job?.pageConfigs.find(
            (p) => p.pageNumber === pageNumber,
          );

          if (page) {
            page.outputColor = outputColor;
          }
        });
      },
      updatePageConfigCopyCount: (
        transactionId: string,
        jobId: string,
        pageNumber: number,
        copyCount: number,
      ) => {
        const { updatePageConfig, state } = get();

        const transaction = state.transactions[transactionId];
        if (!transaction) return;

        const job = transaction.jobs.find((j) => j.id === jobId);
        if (!job) return;

        if (copyCount === job.copyCount) {
          updatePageConfig(transactionId, jobId, pageNumber, {
            copyCount: undefined,
          });
          return;
        }

        set((store) => {
          const transaction = store.state.transactions[transactionId];
          const job = transaction?.jobs.find((j) => j.id === jobId);
          const page = job?.pageConfigs.find(
            (p) => p.pageNumber === pageNumber,
          );

          if (page) {
            page.copyCount = copyCount;
          }
        });
      },
      resetPageConfig: (transactionId, jobId, pageNumber) => {
        set((store) => {
          const transaction = store.state.transactions[transactionId];
          if (!transaction) return;
          const job = transaction.jobs.find((j) => j.id === jobId);
          const page = job?.pageConfigs.find(
            (p) => p.pageNumber === pageNumber,
          );
          if (page) {
            delete page.outputColor;
            delete page.copyCount;
            // excluded intentionally not reset — that's a deliberate user action
          }
        });
      },
    })),
    {
      name: "printit-draft-storage",
      storage: createIdbStorage<Pick<DraftStore, "state">>(),
      partialize: (store: DraftStore) => ({ state: store.state }),
      version: 1,
      onRehydrateStorage: (store) => {
        return () => {
          console.log("printit-draft-storage: hydrated");
          store.setHydrated();
        };
      },
      migrate: (persistedState, version) => {
        const store = persistedState as Pick<DraftStore, "state">;
        if (version < 1) {
          console.debug("Migrating draft store", {
            fromVersion: version,
            toVersion: 1,
          });
          store.state.documents = {};

          Object.values(store.state.transactions).forEach((transaction) => {
            transaction.jobs.forEach((job) => {
              store.state.documents[job.document.fileId] = job.document;
            });
          });
        }
        return store;
      },
    },
  ),
);
