import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createIdbStorage } from "./createIdbStorage";

interface JobDocument {
  id: number;
}

interface Job {
  id: number;
  documents: JobDocument;
  copyCount: number;
}

interface Transaction {
  jobs: Job[];
}

interface TransactionState {
  transactions: Record<number, Transaction>;
}

interface TransactionStore {
  state: TransactionState;
  createTransaction: () => void;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    immer((set, get) => ({
      state: { transactions: {} },
      createTransaction: () => ({}),
    })),
    {
      name: "printly-transaction-store",
      version: 1,
      storage: createIdbStorage<Pick<TransactionStore, "state">>(),
      partialize: (store: TransactionStore) => ({ state: store.state }),
    },
  ),
);
