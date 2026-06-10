/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { CreateTransactionResponseDto } from "@api/cloud-api-types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createIdbStorage } from "./createIdbStorage";
import { OutputColor } from "./structure";

export type TransactionStatus =
  | "PENDING"
  | "QUEUED"
  | "PRINTING"
  | "COMPLETED"
  | "ERROR";

export interface TransactionDocument {
  id: number;
  createdAt: string;
  updatedAt: string;
  filename: string;
  contentType: string;
  draftId: string;
}

export interface TransactionJob {
  id: number;
  createdAt: string;
  updatedAt: string;
  document: TransactionDocument;
  copyCount: number;
  outputColor: OutputColor;
}

export interface Transaction {
  id: number;
  createdAt: string;
  updatedAt: string;
  vendorId: number;
  friendlyId: string;
  draftId: string | null;
  status: TransactionStatus;
  jobs: TransactionJob[];
}

interface TransactionState {
  transactions: Record<number, Transaction>;
  currentTransactionId: number | null;
}

interface TransactionStore {
  state: TransactionState;
  hydrated: boolean;
  setHydrated: () => void;

  createTransaction: (
    transactionResponse: CreateTransactionResponseDto,
    draftId: string,
  ) => void;
  setCurrentTransactionId: (id: number | null) => void;
  updateTransactionStatus: (id: number, status: TransactionStatus) => void;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    immer((set) => ({
      state: {
        transactions: {},
        currentTransactionId: null,
      },
      hydrated: false,
      setHydrated: () => {
        set((store) => {
          store.hydrated = true;
        });
      },
      createTransaction: (transactionResponse, draftId: string) => {
        const transaction: Transaction = {
          ...transactionResponse,
          draftId,
        };
        set((store) => {
          store.state.transactions[transactionResponse.id] = transaction;
        });
      },
      setCurrentTransactionId: (id) => {
        set((store) => {
          store.state.currentTransactionId = id;
        });
      },
      updateTransactionStatus: (id: number, status) => {
        set((store) => {
          const existing = store.state.transactions[id];
          existing.updatedAt = new Date().toISOString();
          existing.status = status;
        });
      },
    })),
    {
      name: "printit-transaction-store",
      version: 2,
      storage: createIdbStorage<Pick<TransactionStore, "state">>(),
      partialize: (store: TransactionStore) => ({ state: store.state }),
      onRehydrateStorage: (store) => {
        return () => {
          console.log("printit-transaction-store: hydrated");
          store.setHydrated();
        };
      },
      migrate: (persistedState, version: number) => {
        const store = persistedState as Pick<TransactionStore, "state">;
        if (version < 2) {
          Object.values(store.state.transactions).forEach((transaction) => {
            if (transaction.draftId === undefined) {
              transaction.draftId = null;
            }
          });
        }
        return store;
      },
    },
  ),
);
