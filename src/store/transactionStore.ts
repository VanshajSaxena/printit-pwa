import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createIdbStorage } from "./createIdbStorage";
import { OutputColor, TimeAndIdentifierType } from "./draftStore";
import { CreateTransactionResponseDto } from "@api/cloud-api-types";

interface JobDocument extends Omit<TimeAndIdentifierType, "id"> {
  id: number;
  filename: string;
  contentType: string;
}

interface Job extends Omit<TimeAndIdentifierType, "id"> {
  document: JobDocument;
  copyCount: number;
  outputColor: OutputColor;
}

interface Transaction extends Omit<TimeAndIdentifierType, "id"> {
  jobs: Job[];
  friendlyId: string;
  status: "PENDING" | "QUEUED" | "PRINTING" | "COMPLETED" | "ERROR";
}

interface TransactionState {
  transactions: Record<number, Transaction>;
}

interface TransactionStore {
  state: TransactionState;
  createTransaction: (
    transactionResponse: CreateTransactionResponseDto,
  ) => void;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    immer((set) => ({
      state: { transactions: {} },
      createTransaction: (transactionResponse) => {
        set((store) => {
          store.state.transactions[transactionResponse.id] ??=
            transactionResponse;
        });
      },
    })),
    {
      name: "printit-transaction-store",
      version: 1,
      storage: createIdbStorage<Pick<TransactionStore, "state">>(),
      partialize: (store: TransactionStore) => ({ state: store.state }),
    },
  ),
);
