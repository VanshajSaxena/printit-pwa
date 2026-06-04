export type OutputColor = "Color" | "Monochrome" | "Grayscale";

export interface DraftStore {
  state: {
    transactions: Record<string, DraftTransaction>;
    currentDraftTransactionId: string | null;
    currentDraftJobId: string | null;
    documents: Record<string, Omit<DraftDocument, "id" | "updatedAt">>;
  };
  hydrated: boolean;
  setHydrated: () => void;

  createDraftTransaction: (
    documents: DocumentInfo[],
    vendorId: number | null,
  ) => string;

  setCurrentDraftTransactionId: (id: string) => void;
  clearCurrentDraftTransactionId: () => void;

  updateTransactionVendor: (transactionId: string, vendorId: number) => void;

  setCurrentDraftJobId: (id: string) => void;
  clearCurrentDraftJobId: () => void;

  addJobsToTransaction: (
    transactionId: string,
    documents: DocumentInfo[],
  ) => void;

  updateDraftJob: (
    transactionId: string,
    jobId: string,
    updates: Partial<DraftJob>,
  ) => void;

  deleteDraftJob: (transactionId: string, jobId: string) => void;

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

  updatePageConfigOutputColor: (
    transactionId: string,
    jobId: string,
    pageNumber: number,
    outputColor: OutputColor,
  ) => void;

  updatePageConfigCopyCount: (
    transactionId: string,
    jobId: string,
    pageNumber: number,
    copyCount: number,
  ) => void;

  resetPageConfig: (
    transactionId: string,
    jobId: string,
    pageNumber: number,
  ) => void;

  addDocument: (
    fileId: string,
    document: Omit<DraftDocument, "id" | "updatedAt">,
  ) => void;
}

export interface DraftPageConfig {
  pageNumber: number;
  excluded: boolean;
  outputColor?: OutputColor;
  copyCount?: number;
}

export interface DraftJob extends WithIdentifierAndTimeStamps {
  document: DraftDocument;
  copyCount: number;
  outputColor: OutputColor;
  pageConfigs: DraftPageConfig[];
}

export interface DocumentInfo {
  fileId: string;
  filename: string;
  contentType: string;
  pageCount: number;
}

export type DraftDocument = DocumentInfo & WithIdentifierAndTimeStamps;

export interface DraftTransaction extends WithIdentifierAndTimeStamps {
  vendorId: number | null;
  jobs: DraftJob[];
}

export interface WithIdentifierAndTimeStamps {
  id: string;
  createdAt: string;
  updatedAt: string;
}
