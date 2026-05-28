export type OutputColor = "Color" | "Monochrome" | "Grayscale";

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

  addJobsToTransaction: (
    transactionId: string,
    documents: DocumentMetadata[],
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

export interface DocumentMetadata {
  fileId: string;
  contentType: string;
  filename: string;
  pageCount: number;
}

export type DraftDocument = DocumentMetadata & WithIdentifierAndTimeStamps;

export interface DraftTransaction extends WithIdentifierAndTimeStamps {
  vendorId?: number;
  jobs: DraftJob[];
}

export interface WithIdentifierAndTimeStamps {
  id: string;
  createdAt: string;
  updatedAt: string;
}
