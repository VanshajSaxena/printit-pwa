import { client } from "@api/client";
import { PulseIcon } from "@components/graphics/PulseIcon";
import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonLoading,
  useIonRouter,
  useIonToast,
} from "@ionic/react";

import { Dialog } from "@components/Dialog";
import AppContent from "@layout/AppContent";
import { useDraftStore } from "@store/draftStore";
import { usePresenceStore } from "@store/presenceStore";
import { OutputColor, type DraftJob } from "@store/structure";
import { useTransactionStore } from "@store/transactionStore";
import { useVendorStore } from "@store/vendorStore";
import { getPdfPageCount } from "@utils/getPdfPageCount";
import { getUUID } from "@utils/getUUID";
import { isPdfEncryptedFast } from "@utils/isPdfEncryptedFast";
import { deriveJobSummary, formatSubtitle } from "@utils/jobSummary";
import { resolveJobGroups } from "@utils/resolveJobGroups";
import { getMany, setMany } from "idb-keyval";
import {
  add,
  addOutline,
  alertCircle,
  chevronForwardOutline,
  colorPaletteOutline,
  contrastOutline,
  document as documentIcon,
  informationCircle,
  print,
  printOutline,
  remove,
  trashOutline,
} from "ionicons/icons";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import "./CheckoutPage.css";

export interface StoredFileWrapper {
  id: string;
  file: File;
  filename?: string;
  mimeType?: string;
}

// ─── Override Chips ───────────────────────────────────────────────────────────

function OverrideChips({ job }: { job: DraftJob }) {
  const summary = deriveJobSummary(job);
  if (!summary.hasAnyOverride) return null;

  const chips: { key: string; label: string }[] = [];
  if (summary.hasExclusions) {
    const skipped = summary.totalPagesCount - summary.activePagesCount;
    chips.push({
      key: "excluded",
      label: `${skipped.toString()} ${skipped === 1 ? "page" : "pages"} skipped`,
    });
  }
  if (summary.hasMixedColor) chips.push({ key: "color", label: "Mixed color" });
  if (summary.hasMixedCopies)
    chips.push({ key: "copies", label: "Mixed copies" });

  return (
    <div className="flex flex-wrap gap-1">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            background: "var(--ion-color-light)",
            color: "var(--ion-color-medium-shade)",
            border: "1px solid var(--ion-color-light-shade)",
          }}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

// ─── Quick Settings Dialog ────────────────────────────────────────────────────
//
// Clicking outside (the backdrop) dismisses via onClick — NOT onPointerDown.
// This keeps the backdrop in the DOM for the full click cycle so the event
// never reaches anything underneath it.

interface QuickSettingsDialogProps {
  job: DraftJob;
  onColorChange: (color: OutputColor) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onDismiss: () => void;
}

function QuickSettingsDialog({
  job,
  onColorChange,
  onIncrement,
  onDecrement,
  onDismiss,
}: QuickSettingsDialogProps) {
  const summary = deriveJobSummary(job);

  return (
    <Dialog
      onDismiss={onDismiss}
      ariaLabel="Quick Settings"
      maxWidthClassName="max-w-sm"
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-3 pt-5 pb-3"
        style={{
          borderBottom: "1px solid rgba(var(--ion-color-medium-rgb), 0.3)",
        }}
      >
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
          <IonIcon
            icon={documentIcon}
            className="text-2xl"
            style={{
              color:
                job.outputColor === "Color"
                  ? "var(--ion-color-secondary)"
                  : "var(--ion-color-medium)",
            }}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <p
            className="m-0 text-sm leading-snug font-semibold"
            style={{ color: "var(--ion-color-dark)" }}
            title={job.document.filename}
          >
            {job.document.filename}
          </p>

          <p
            className="m-0 mt-0.5 text-xs"
            style={{ color: "var(--ion-color-medium)" }}
          >
            {formatSubtitle(job, summary)}
          </p>

          <div className="mt-3">
            {summary.hasAnyOverride && <OverrideChips job={job} />}
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-col gap-4 px-4 pt-4 pb-4">
        {/* Output color */}
        <div className="flex flex-col gap-2">
          <p
            className="m-0 text-sm font-semibold tracking-wide uppercase"
            style={{ color: "var(--ion-color-medium)" }}
          >
            Color Mode
          </p>

          <div className="flex flex-row gap-2">
            <IonChip
              color={job.outputColor === "Grayscale" ? "primary" : undefined}
              onClick={() => {
                onColorChange("Grayscale");
              }}
            >
              <IonIcon icon={contrastOutline} />
              <IonLabel className="font-semibold">B&amp;W</IonLabel>
            </IonChip>

            <IonChip
              color={job.outputColor === "Color" ? "primary" : undefined}
              onClick={() => {
                onColorChange("Color");
              }}
            >
              <IonIcon icon={colorPaletteOutline} />
              <IonLabel className="font-semibold">Color</IonLabel>
            </IonChip>
          </div>
        </div>

        {/* Copies stepper */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start justify-center">
            <p
              className="m-0 text-sm font-semibold tracking-wide uppercase"
              style={{ color: "var(--ion-color-medium)" }}
            >
              Copy Count
            </p>

            <p
              className="my-0.5 text-xs tracking-wide"
              style={{ color: "var(--ion-color-medium)" }}
            >
              Per page default
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl px-2 py-1.5">
            <button
              onClick={onDecrement}
              disabled={job.copyCount <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-xl transition active:scale-95 disabled:opacity-30"
              style={{
                background: "var(--ion-card-background)",
                color: "var(--ion-color-dark)",
              }}
              aria-label="Decrease copies"
            >
              <IonIcon icon={remove} size="small" />
            </button>

            <span
              className="min-w-[26px] text-center text-sm font-semibold tabular-nums"
              style={{ color: "var(--ion-color-dark)" }}
            >
              {job.copyCount}
            </span>

            <button
              onClick={onIncrement}
              disabled={job.copyCount >= 99}
              className="flex h-8 w-8 items-center justify-center rounded-xl transition active:scale-95 disabled:opacity-30"
              style={{
                background: "var(--ion-card-background)",
                color: "var(--ion-color-dark)",
              }}
              aria-label="Increase copies"
            >
              <IonIcon icon={add} size="small" />
            </button>
          </div>
        </div>

        {summary.hasAnyOverride && (
          <IonNote
            className="m-0 flex items-start gap-1.5 rounded-xl text-xs leading-relaxed"
            style={{
              color: "var(--ion-color-medium)",
            }}
          >
            <IonIcon
              icon={informationCircle}
              className="flex-shrink-0"
              size="small"
            />

            <span>
              Some pages have individual settings. Changes here apply to pages
              without overrides. Use{" "}
              <strong style={{ color: "var(--ion-color-dark-shade)" }}>
                Print Options
              </strong>{" "}
              to edit per-page settings.
            </span>
          </IonNote>
        )}
      </div>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useIonRouter();
  const [presentLoading, dismissLoading] = useIonLoading();
  const [presentToast] = useIonToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    onConfirm: (() => void) | undefined;
    onCancel: (() => void) | undefined;
  }>({
    isOpen: false,
    onConfirm: undefined,
    onCancel: undefined,
  });
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isAddingFiles, setIsAddingFiles] = useState(false);

  const slidingRefs = useRef<Map<string, HTMLIonItemSlidingElement>>(new Map());
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const setPresence = usePresenceStore((store) => store.setPresence);
  const createTransaction = useTransactionStore(
    (store) => store.createTransaction,
  );
  const setCurrentTransactionId = useTransactionStore(
    (store) => store.setCurrentTransactionId,
  );
  const updateDraftJob = useDraftStore((store) => store.updateDraftJob);
  const deleteDraftJob = useDraftStore((store) => store.deleteDraftJob);
  const addJobsToTransaction = useDraftStore(
    (store) => store.addJobsToTransaction,
  );

  const currentDraftTransactionId = useDraftStore(
    (store) => store.state.currentDraftTransactionId,
  );

  if (!currentDraftTransactionId) {
    // this will never happen because of the parent guard
    throw new Error("CurrentDraftTransactionId doesn't exist");
  }

  const currentDraftTransaction = useDraftStore(
    (store) => store.state.transactions[currentDraftTransactionId],
  );

  const vendorId = currentDraftTransaction.vendorId;
  const vendorProfile = useVendorStore((store) => store.getVendor(vendorId));
  const presenceStatus = usePresenceStore((store) =>
    vendorId ? store.getPresence(vendorId) : undefined,
  );
  const isOnline = presenceStatus === "online";

  const createDocumentsMutation = client.useMutation(
    "post",
    "/api/v1/documents",
  );
  const updateDocumentsMutation = client.useMutation(
    "patch",
    "/api/v1/documents/{id}",
  );
  const createTransactionMutation = client.useMutation(
    "post",
    "/api/v1/transactions",
  );
  const filesMutation = client.useMutation("post", "/api/v1/files/upload");

  // Dismiss dialog if its job is deleted while open
  useEffect(() => {
    if (
      selectedJobId &&
      !currentDraftTransaction.jobs.find((j) => j.id === selectedJobId)
    ) {
      setSelectedJobId(null);
    }
  }, [currentDraftTransaction.jobs, selectedJobId]);

  // ── Add more files ──────────────────────────────────────────────────────────

  const handleAddFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const eventTargetFiles = event.target.files;
    if (!eventTargetFiles || eventTargetFiles.length === 0) return;

    const selectedFiles = Array.from(eventTargetFiles);
    const onlyPdfFiles = selectedFiles.filter(
      (f) => f.type === "application/pdf",
    );
    if (onlyPdfFiles.length === 0) return;

    setIsAddingFiles(true);
    await presentLoading({ message: "Processing files..." });

    try {
      const encryptionChecks = await Promise.all(
        onlyPdfFiles.map(async (file) => ({
          file,
          encrypted: await isPdfEncryptedFast(file),
        })),
      );

      const unencryptedFiles = encryptionChecks
        .filter(({ encrypted }) => !encrypted)
        .map(({ file }) => file);

      if (unencryptedFiles.length === 0) {
        await dismissLoading();
        await presentToast({
          message: "The selected file is encrypted and cannot be printed.",
          duration: 3000,
          color: "warning",
          position: "top",
          translucent: true,
        });
        return;
      }

      const processedData = await Promise.all(
        unencryptedFiles.map(async (file) => {
          const fileId = getUUID();
          const pageCount = await getPdfPageCount(file);
          const storageObject = {
            id: fileId,
            file,
            filename: file.name,
            mimeType: file.type,
          };
          return {
            idbEntry: [fileId, storageObject] as [string, typeof storageObject],
            metadata: {
              fileId,
              filename: file.name,
              contentType: file.type,
              pageCount,
            },
          };
        }),
      );

      await setMany(processedData.map((d) => d.idbEntry));
      addJobsToTransaction(
        currentDraftTransactionId,
        processedData.map((d) => d.metadata),
      );

      await dismissLoading();
      event.target.value = "";
    } catch (error) {
      console.error("Failed to add files:", error);
      await dismissLoading();
      await presentToast({
        message: "Failed to add files. Please try again.",
        duration: 3000,
        color: "danger",
        position: "top",
        translucent: true,
      });
    } finally {
      setIsAddingFiles(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleDelete = useCallback(
    (jobId: string) => {
      // Never allow deleting the last document in a transaction
      if (currentDraftTransaction.jobs.length <= 1) return;
      void slidingRefs.current.get(jobId)?.close();
      deleteDraftJob(currentDraftTransactionId, jobId);
    },
    [
      currentDraftTransaction.jobs.length,
      currentDraftTransactionId,
      deleteDraftJob,
    ],
  );

  const handleColorChange = useCallback(
    (jobId: string, value: OutputColor) => {
      updateDraftJob(currentDraftTransactionId, jobId, { outputColor: value });
    },
    [currentDraftTransactionId, updateDraftJob],
  );

  const handleIncrementCopy = useCallback(
    (jobId: string, current: number) => {
      updateDraftJob(currentDraftTransactionId, jobId, {
        copyCount: current + 1,
      });
    },
    [currentDraftTransactionId, updateDraftJob],
  );

  const handleDecrementCopy = useCallback(
    (jobId: string, current: number) => {
      if (current <= 1) return;
      updateDraftJob(currentDraftTransactionId, jobId, {
        copyCount: current - 1,
      });
    },
    [currentDraftTransactionId, updateDraftJob],
  );
  const confirmOfflinePrint = () => {
    return new Promise((resolve) => {
      setAlertConfig({
        isOpen: true,
        onConfirm: () => {
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        },
      });
    });
  };
  const handleSubmit = async () => {
    if (!vendorId || !vendorProfile) {
      await presentToast({
        message: "No printer selected. Please go back and select a printer.",
        duration: 3000,
        color: "danger",
        position: "top",
        translucent: true,
      });
      return;
    }

    if (!isOnline) {
      const shouldContinue = await confirmOfflinePrint();
      if (!shouldContinue) return;
    }

    setIsSubmitting(true);
    await presentLoading({
      message: "Please wait while we connect to the printer...",
    });

    try {
      const jobs = currentDraftTransaction.jobs;
      const fileIds = jobs.map((job) => job.document.fileId);
      const fileObjects: (StoredFileWrapper | undefined)[] =
        await getMany(fileIds);

      if (fileObjects.some((f) => !f)) {
        throw new Error(
          "One or more files could not be retrieved from device storage.",
        );
      }

      const fileMap = new Map<string, File>();
      jobs.forEach((job) => {
        const wrapper = fileObjects.find((w) => w?.id === job.document.fileId);
        if (wrapper?.file) fileMap.set(job.document.fileId, wrapper.file);
      });

      if (fileMap.size !== jobs.length) {
        throw new Error("Mismatch between jobs and retrieved files.");
      }

      const preparedJobsNested = await Promise.all(
        jobs.map((job) => {
          const file = fileMap.get(job.document.fileId);
          if (!file) throw new Error("Failed to prepare job.");
          return resolveJobGroups(job, file);
        }),
      );

      const preparedJobs = preparedJobsNested.flat();
      if (preparedJobs.length === 0)
        throw new Error("No pages selected for printing.");

      const { documents } = await createDocumentsMutation.mutateAsync({
        body: {
          documents: preparedJobs.map((job) => ({
            filename: job.filename,
            contentType: job.contentType,
            draftId: job.draftId,
            pageCount: job.pageCount,
          })),
        },
      });

      const { signedUrls } = await filesMutation.mutateAsync({
        body: { ids: documents.map((d) => d.id) },
      });

      try {
        await Promise.all(
          signedUrls.map(async ({ url, id }) => {
            const doc = documents.find((d) => d.id === id);
            if (!doc)
              throw new Error(`Document not found for id ${id.toString()}`);
            const preparedJob = preparedJobs.find(
              (pj) => pj.draftId === doc.draftId,
            );
            if (!preparedJob)
              throw new Error(
                `PreparedJob not found for draftId ${doc.draftId}`,
              );

            const uploadResponse = await fetch(url, {
              method: "PUT",
              headers: { "Content-Type": preparedJob.file.type },
              body: preparedJob.file,
            });
            if (!uploadResponse.ok) {
              throw new Error(
                `Upload failed for document ${id.toString()}: ${uploadResponse.status.toString()}`,
              );
            }
          }),
        );

        await Promise.all(
          documents.map(async (doc) => {
            await updateDocumentsMutation.mutateAsync({
              params: { path: { id: doc.id } },
              body: { status: "UPLOADED" },
            });
          }),
        );
      } catch (uploadError) {
        console.error("Upload failed:", uploadError);
        await Promise.all(
          documents.map(async (doc) => {
            await updateDocumentsMutation.mutateAsync({
              params: { path: { id: doc.id } },
              body: { status: "FAILED" },
            });
          }),
        );
        throw new Error("Failed to upload documents");
      }

      const finalJobs = preparedJobs.map((pj) => {
        const documentId = documents.find((d) => d.draftId === pj.draftId)?.id;
        if (!documentId)
          throw new Error(`Missing document id for draftId ${pj.draftId}`);
        return {
          copyCount: pj.copyCount,
          outputColor: pj.outputColor,
          documentId,
        };
      });

      const transactionResponse = await createTransactionMutation.mutateAsync({
        body: { jobs: finalJobs, vendorId },
      });

      createTransaction(transactionResponse);
      setCurrentTransactionId(transactionResponse.id);
      router.push(
        `/${router.routeInfo.tab ?? "home"}/status`,
        "forward",
        "replace",
      );
      await dismissLoading();
    } catch (error) {
      console.error("Transaction creation failed:", error);
      await dismissLoading();
      await presentToast({
        message: "Failed to print your files. Please try again.",
        duration: 3000,
        color: "danger",
        position: "bottom",
        translucent: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data: presenceData } = client.useQuery(
    "get",
    "/api/v1/vendors/{selector}/presence",
    { params: { path: { selector: vendorId ?? 0 } } },
    {
      enabled: !!vendorId && presenceStatus !== "online",
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (presenceData && vendorProfile) {
      setPresence(vendorProfile.id, presenceData.status);
    }
  }, [presenceData, setPresence, vendorProfile]);

  const totalPages = currentDraftTransaction.jobs.reduce(
    (total, job) => total + deriveJobSummary(job).effectiveTotalSheets,
    0,
  );

  const isVendorSelected = vendorId !== null;

  const selectedVendor = !isVendorSelected
    ? "Please select a printer"
    : (vendorProfile?.displayName ??
      `${vendorProfile?.firstName ?? ""} ${vendorProfile?.lastName ?? ""}`);

  const selectedVendorStatus = isOnline ? "Printer Ready" : "Printer Offline";

  const vendorLabel = !isVendorSelected
    ? "No Printer Selected"
    : selectedVendorStatus;
  const selectedJob = currentDraftTransaction.jobs.find(
    (j) => j.id === selectedJobId,
  );
  const canDelete = currentDraftTransaction.jobs.length > 1;

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Checkout</IonTitle>
          <IonButtons slot="end">
            {/* Hidden file input — triggered by the button below */}
            <input
              ref={addFileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(e) => void handleAddFileChange(e)}
            />
            <IonButton
              disabled={isAddingFiles}
              onClick={() => addFileInputRef.current?.click()}
              aria-label="Add more documents"
            >
              <IonIcon slot="icon-only" icon={addOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <AppContent
        fullscreen
        scrollY={true}
        className="ion-padding flex min-h-full flex-col items-center justify-start gap-0"
      >
        <IonCard
          className="m-0 min-w-full bg-transparent py-2 pr-2 pl-4 shadow-none"
          routerLink={`/${router.routeInfo.tab ?? "home"}/checkout/select-printer`}
        >
          <IonCardContent className="p-0!">
            <IonCardTitle className="mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center justify-between gap-2">
                <IonLabel
                  color={"dark"}
                  className="m-0 h-auto p-0 text-left font-bold"
                >
                  {vendorLabel}
                </IonLabel>
                {isVendorSelected &&
                  (isOnline ? (
                    <PulseIcon status={presenceStatus} className="m-1 mt-0" />
                  ) : (
                    <IonIcon
                      icon={alertCircle}
                      color="danger"
                      className="shrink-0"
                      style={{ fontSize: "1.75rem" }}
                    />
                  ))}
              </div>
              <IonIcon
                icon={chevronForwardOutline}
                className="text-2xl text-white/70 sm:text-3xl"
              />
            </IonCardTitle>
            <IonCardSubtitle color="medium">{selectedVendor}</IonCardSubtitle>
          </IonCardContent>
        </IonCard>

        <IonList
          lines="inset"
          inset
          className="!mx-0 !my-3 max-w-full min-w-full"
        >
          <IonItem
            detail={false}
            lines="none"
            style={{ "--inner-padding-top": "0.6rem" }}
          >
            <IonLabel>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--ion-color-dark)",
                }}
              >
                Documents
              </div>
            </IonLabel>
          </IonItem>

          {currentDraftTransaction.jobs.map((job) => {
            const summary = deriveJobSummary(job);
            const subtitle = formatSubtitle(job, summary);

            return (
              <IonItemSliding
                key={job.id}
                ref={(el) => {
                  if (el) slidingRefs.current.set(job.id, el);
                  else slidingRefs.current.delete(job.id);
                }}
              >
                <IonItem
                  button
                  detail={false}
                  onClick={() => {
                    setSelectedJobId(job.id);
                  }}
                  style={{
                    "--inner-padding-top": summary.hasAnyOverride
                      ? "0.5rem"
                      : "0.6rem",
                    "--inner-padding-bottom": summary.hasAnyOverride
                      ? "0.5rem"
                      : "0.6rem",
                  }}
                >
                  <IonIcon
                    icon={documentIcon}
                    slot="start"
                    color={job.outputColor === "Color" ? "secondary" : "medium"}
                    className="text-2xl"
                  />
                  <IonLabel className="my-1">
                    <div
                      className="truncate"
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "var(--ion-color-dark)",
                      }}
                      title={job.document.filename}
                    >
                      {job.document.filename}
                    </div>
                    <div
                      className="mt-1"
                      style={{
                        fontSize: "14px",
                        color: "var(--ion-color-medium)",
                      }}
                    >
                      {subtitle}
                    </div>
                    <div className="mt-3">
                      <OverrideChips job={job} />
                    </div>
                  </IonLabel>
                  <div
                    slot="end"
                    style={{
                      fontSize: "15px",
                      color: "var(--ion-color-medium)",
                      textAlign: "right",
                      minWidth: "48px",
                      alignSelf: "flex-start",
                      paddingTop: "2px",
                    }}
                  >
                    {summary.effectiveTotalSheets} sheets
                  </div>
                </IonItem>

                {/* Only render the delete option when there is more than one job */}
                {canDelete && (
                  <IonItemOptions side="end">
                    <IonItemOption
                      color="danger"
                      onClick={() => {
                        handleDelete(job.id);
                      }}
                    >
                      <IonIcon slot="top" icon={trashOutline} size="small" />
                      Delete
                    </IonItemOption>
                  </IonItemOptions>
                )}
              </IonItemSliding>
            );
          })}

          <IonItem
            detail={false}
            style={{
              "--inner-padding-top": "0.5rem",
              "--inner-padding-bottom": "0.4rem",
            }}
          >
            <IonIcon
              icon={documentIcon}
              slot="start"
              className="invisible text-2xl"
            />
            <IonLabel>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--ion-color-dark)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Total Sheets</span>
                <span>{totalPages}</span>
              </div>
            </IonLabel>
          </IonItem>
        </IonList>

        <IonList inset className="min-w-full py-0!">
          <IonItem
            button
            detail
            routerLink={`/${router.routeInfo.tab ?? "home"}/checkout/print-options`}
            routerDirection="forward"
          >
            <IonIcon icon={print} color="medium" slot="start"></IonIcon>
            <IonLabel>Print Options</IonLabel>
          </IonItem>
        </IonList>
      </AppContent>

      {selectedJob && (
        <QuickSettingsDialog
          job={selectedJob}
          onColorChange={(color) => {
            handleColorChange(selectedJob.id, color);
          }}
          onIncrement={() => {
            handleIncrementCopy(selectedJob.id, selectedJob.copyCount);
          }}
          onDecrement={() => {
            handleDecrementCopy(selectedJob.id, selectedJob.copyCount);
          }}
          onDismiss={() => {
            setSelectedJobId(null);
          }}
        />
      )}

      <IonFooter className="ion-no-border">
        <IonToolbar class="transparent-toolbar">
          <div className="ion-padding mx-auto w-full max-w-2xl">
            <IonButton
              expand="block"
              size="large"
              fill="solid"
              color="primary"
              className="m-0 min-w-full"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
            >
              <IonIcon icon={printOutline} slot="start" />
              <IonLabel>
                {isSubmitting ? "Processing..." : "Start Printing"}
              </IonLabel>
            </IonButton>
          </div>
        </IonToolbar>
      </IonFooter>

      <IonAlert
        isOpen={alertConfig.isOpen}
        header="Printer Offline"
        subHeader="Queue your documents?"
        message="We'll save your files and start printing as soon as the printer is back online."
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            cssClass: "secondary",
            handler: () => {
              alertConfig.onCancel?.();
              setAlertConfig((prev) => ({ ...prev, isOpen: false }));
            },
          },
          {
            text: "Continue",
            role: "confirm",
            handler: () => {
              alertConfig.onConfirm?.();
              setAlertConfig((prev) => ({ ...prev, isOpen: false }));
            },
          },
        ]}
      />
    </IonPage>
  );
}
