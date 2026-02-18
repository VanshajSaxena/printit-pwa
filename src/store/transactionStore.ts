import { CreateTransactionResponseDto } from "@api/cloud-api-types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createIdbStorage } from "./createIdbStorage";
import { OutputColor } from "./draftStore";

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
  status: "PENDING" | "QUEUED" | "PRINTING" | "COMPLETED" | "ERROR";
  jobs: TransactionJob[];
}

export interface TransactionStore {
  state: {
    transactions: Record<number, Transaction>;
  };
  hydrated: boolean;
  setHydrated: () => void;

  createTransaction: (
    transactionResponse: CreateTransactionResponseDto,
  ) => void;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    immer((set) => ({
      state: { transactions: {} },
      hydrated: false,
      setHydrated: () => {
        set((store) => {
          store.hydrated = true;
        });
      },
      createTransaction: (transactionResponse) => {
        set((store) => {
          store.state.transactions[transactionResponse.id] =
            transactionResponse as Transaction;
        });
      },
    })),
    {
      name: "printit-transaction-store",
      version: 1,
      storage: createIdbStorage<Pick<TransactionStore, "state">>(),
      partialize: (store) => ({ state: store.state }),
      onRehydrateStorage: (store) => {
        return () => {
          console.log("printit-transaction-store: hydrated");
          store.setHydrated();
        };
      },
    },
  ),
);
