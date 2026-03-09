import { client } from "@api/client";
import { PulseIcon } from "@components/graphics/PulseIcon";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
  isPlatform,
  useIonLoading,
  useIonRouter,
  useIonToast,
} from "@ionic/react";

import AppContent from "@layout/AppContent";
import { OutputColor, useDraftStore, type DraftJob } from "@store/draftStore";
import { usePresenceStore } from "@store/presenceStore";
import { useTransactionStore } from "@store/transactionStore";
import { useVendorStore } from "@store/vendorStore";
import { resolveJobGroups } from "@utils/resolveJobGroups";
import { deriveJobSummary, formatSubtitle } from "@utils/jobSummary";
import { getMany } from "idb-keyval";
import {
  add,
  colorPaletteOutline,
  contrastOutline,
  document,
  printOutline,
  remove,
} from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import "./CheckoutPage.css";

export interface StoredFileWrapper {
  id: string;
  file: File;
  filename?: string;
  mimeType?: string;
}

// ─── Override Chips ───────────────────────────────────────────────────────────
//
// Rendered only when the job has per-page overrides. Each chip is a small,
// low-contrast pill that communicates a single fact without demanding attention.
// The user who hasn't touched Print Options will never see these.

interface OverrideChipsProps {
  job: DraftJob;
}

function OverrideChips({ job }: OverrideChipsProps) {
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

  if (summary.hasMixedColor) {
    chips.push({ key: "color", label: "Mixed color" });
  }

  if (summary.hasMixedCopies) {
    chips.push({ key: "copies", label: "Mixed copies" });
  }

  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            background: "var(--ion-color-light)",
            color: "var(--ion-color-medium-shade)",
            // Subtle border so chips read as distinct on any background
            border: "1px solid var(--ion-color-light-shade)",
          }}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useIonRouter();
  const [presentLoading, dismissLoading] = useIonLoading();
  const [presentToast] = useIonToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageRef = useRef<HTMLElement>(null);
  const [presentingElement, setPresentingElement] = useState<
    HTMLElement | undefined
  >(undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    setPresentingElement(pageRef.current ?? undefined);
  }, []);

  const setPresence = usePresenceStore((store) => store.setPresence);

  const createTransaction = useTransactionStore(
    (store) => store.createTransaction,
  );
  const setCurrentTransactionId = useTransactionStore(
    (store) => store.setCurrentTransactionId,
  );

  const updateDraftJob = useDraftStore((store) => store.updateDraftJob);

  const currentDraftTransactionId = useDraftStore(
    (store) => store.state.currentDraftTransactionId,
  );

  if (!currentDraftTransactionId) {
    throw new Error("CurrentDraftTransactionId doesn't exist");
  }

  const currentDraftTransaction = useDraftStore((store) => {
    return store.state.transactions[currentDraftTransactionId];
  });

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

  const handleIncrementCopy = (jobId: string, currentCopyCount: number) => {
    updateDraftJob(currentDraftTransactionId, jobId, {
      copyCount: currentCopyCount + 1,
    });
  };

  const handleDecrementCopy = (jobId: string, currentCopyCount: number) => {
    if (currentCopyCount <= 1) return;
    updateDraftJob(currentDraftTransactionId, jobId, {
      copyCount: currentCopyCount - 1,
    });
  };

  const handleColorChange = (jobId: string, value: OutputColor) => {
    updateDraftJob(currentDraftTransactionId, jobId, { outputColor: value });
  };

  const handleSubmit = async () => {
    if (!vendorId || !vendorProfile) {
      await presentToast({
        message: "No printer selected. Please go back and select a printer.",
        duration: 3000,
        color: "danger",
        position: "top",
        translucent: true,
        positionAnchor: "header",
      });
      return;
    }

    setIsSubmitting(true);
    await presentLoading({
      message: "Please wait while we talk to the printer...",
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
          if (!file) throw new Error("Failed to prepare job from nested jobs.");
          return resolveJobGroups(job, file);
        }),
      );

      const preparedJobs = preparedJobsNested.flat();

      if (preparedJobs.length === 0) {
        throw new Error("No pages selected for printing.");
      }

      const { documents } = await createDocumentsMutation.mutateAsync({
        body: {
          documents: preparedJobs.map((job) => ({
            filename: job.filename,
            contentType: job.contentType,
            draftId: job.draftId,
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
            if (!preparedJob) {
              throw new Error(
                `PreparedJob not found for draftId ${doc.draftId}`,
              );
            }

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
      // await presentToast({
      //   message: "Print job submitted successfully!",
      //   duration: 3000,
      //   color: "success",
      //   position: "top",
      //   translucent: true,
      //   positionAnchor: "header",
      // });
    } catch (error) {
      console.error("Transaction creation failed:", error);
      await dismissLoading();
      await presentToast({
        message: "Failed to print your files. Please try again.",
        duration: 3000,
        color: "danger",
        position: "bottom",
        translucent: true,
        positionAnchor: "footer",
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

  // Grand total: sum effectiveTotalSheets across all jobs so excluded pages
  // and per-page copy overrides are both reflected correctly.
  const totalPages = currentDraftTransaction.jobs.reduce((total, job) => {
    return total + deriveJobSummary(job).effectiveTotalSheets;
  }, 0);

  const displayName =
    vendorProfile?.displayName ??
    `${vendorProfile?.firstName ?? ""} ${vendorProfile?.lastName ?? ""}`.trim();

  const selectedJob = currentDraftTransaction.jobs.find(
    (job) => job.id === selectedJobId,
  );

  return (
    <IonPage ref={pageRef}>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={"/home"} />
          </IonButtons>
          <IonTitle>Checkout</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent
        fullscreen
        scrollY={true}
        className="ion-padding flex min-h-full flex-col items-center justify-start gap-0"
      >
        <IonCard className="m-0 min-w-full bg-transparent px-4 pt-2 pb-2 shadow-none">
          <IonCardContent className="p-0!">
            <IonCardTitle className="flex items-center gap-1">
              {isOnline ? "Printer Ready" : "Printer Offline"}
              <PulseIcon className="m-1 mt-0" status={presenceStatus} />
            </IonCardTitle>
            <IonCardSubtitle color="medium">{displayName}</IonCardSubtitle>
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
              <IonItem
                key={job.id}
                button
                detail={false}
                onClick={() => {
                  setSelectedJobId(job.id);
                  setIsModalOpen(true);
                }}
                style={{
                  "--inner-padding-top": summary.hasAnyOverride
                    ? "0.6rem"
                    : "0.5rem",
                  "--inner-padding-bottom": summary.hasAnyOverride
                    ? "0.6rem"
                    : "0.5rem",
                }}
              >
                <IonIcon
                  icon={document}
                  slot="start"
                  color={job.outputColor === "Color" ? "secondary" : "medium"}
                  className="text-2xl"
                />

                <IonLabel>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "var(--ion-color-dark)",
                    }}
                    className="truncate"
                    title={job.document.filename}
                  >
                    {job.document.filename}
                  </div>
                  <div
                    style={{
                      marginTop: "2px",
                      fontSize: "14px",
                      color: "var(--ion-color-medium)",
                    }}
                  >
                    {subtitle}
                  </div>
                  {/* Chips — only rendered when the job has been customised */}
                  <OverrideChips job={job} />
                </IonLabel>

                <div
                  slot="end"
                  style={{
                    fontSize: "15px",
                    color: "var(--ion-color-medium)",
                    textAlign: "right",
                    minWidth: "48px",
                    // Keep end slot aligned with the top of the label
                    alignSelf: "flex-start",
                    paddingTop: "2px",
                  }}
                >
                  {summary.effectiveTotalSheets} pages
                </div>
              </IonItem>
            );
          })}

          {/* Grand total */}
          <IonItem
            detail={false}
            style={{
              "--inner-padding-top": "0.5rem",
              "--inner-padding-bottom": "0.4rem",
            }}
          >
            <IonIcon
              icon={document}
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
                <span>Total Pages</span>
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
            <IonLabel>Print Options</IonLabel>
          </IonItem>
        </IonList>

        {/* ── Quick Settings Modal ───────────────────────────────────────── */}
        <IonModal
          isOpen={isModalOpen}
          presentingElement={
            presentingElement && (isPlatform("ios") || window.location.href)
              ? presentingElement
              : undefined
          }
          canDismiss={true}
          expandToScroll={false}
          onDidDismiss={() => {
            setIsModalOpen(false);
            setSelectedJobId(null);
          }}
        >
          <IonHeader translucent>
            <IonToolbar>
              <IonTitle>Quick Settings</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedJobId(null);
                  }}
                >
                  Done
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <AppContent
            fullscreen
            className="ion-padding flex flex-col items-center justify-start gap-0"
          >
            {selectedJob &&
              (() => {
                const selectedSummary = deriveJobSummary(selectedJob);
                return (
                  <IonCard
                    key={selectedJob.id}
                    className="m-0 mb-4 max-w-full min-w-full pt-2 shadow-sm"
                  >
                    <IonCardContent className="p-3!">
                      <div className="mb-3 flex items-center gap-3 pb-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                          <IonIcon
                            icon={document}
                            className="text-2xl"
                            color={
                              selectedJob.outputColor === "Color"
                                ? "secondary"
                                : "medium"
                            }
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <IonText
                            color="dark"
                            className="block truncate text-base font-semibold"
                          >
                            {selectedJob.document.filename}
                          </IonText>
                          <IonText color="medium" className="text-xs">
                            {formatSubtitle(selectedJob, selectedSummary)}
                          </IonText>
                          {/* Chips repeated in modal header for quick awareness */}
                          {selectedSummary.hasAnyOverride && (
                            <div className="mt-1">
                              <OverrideChips job={selectedJob} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Note when per-page overrides exist */}
                      {selectedSummary.hasAnyOverride && (
                        <div
                          className="mb-3 rounded-lg px-3 py-2 text-xs"
                          style={{
                            background: "var(--ion-color-light)",
                            color: "var(--ion-color-medium-shade)",
                          }}
                        >
                          Some pages have individual settings. Changes here
                          apply to pages without overrides. Go to{" "}
                          <strong style={{ color: "var(--ion-color-dark)" }}>
                            Print Options
                          </strong>{" "}
                          to edit per-page settings.
                        </div>
                      )}

                      <IonGrid className="p-0">
                        <IonRow className="ion-align-items-center">
                          <IonCol size="12" className="mb-3 pb-0">
                            <IonSegment
                              value={selectedJob.outputColor}
                              onIonChange={(e) => {
                                handleColorChange(
                                  selectedJob.id,
                                  e.detail.value as OutputColor,
                                );
                              }}
                              mode="ios"
                              className="w-full"
                            >
                              <IonSegmentButton value="Monochrome">
                                <IonLabel className="flex items-center gap-1">
                                  <IonIcon
                                    icon={contrastOutline}
                                    size="small"
                                  />
                                  B&W
                                </IonLabel>
                              </IonSegmentButton>
                              <IonSegmentButton value="Color">
                                <IonLabel className="flex items-center gap-1">
                                  <IonIcon
                                    icon={colorPaletteOutline}
                                    size="small"
                                  />
                                  Color
                                </IonLabel>
                              </IonSegmentButton>
                            </IonSegment>
                          </IonCol>
                          <IonCol
                            size="12"
                            className="flex items-center justify-between pt-2"
                          >
                            <IonText color="dark" className="font-medium">
                              Copies
                            </IonText>
                            <div className="flex items-center gap-3 rounded-lg p-1">
                              <IonButton
                                size="small"
                                fill="solid"
                                color="light"
                                className="m-0 h-8 w-10 shadow-none"
                                onClick={() => {
                                  handleDecrementCopy(
                                    selectedJob.id,
                                    selectedJob.copyCount,
                                  );
                                }}
                                disabled={selectedJob.copyCount <= 1}
                              >
                                <IonIcon
                                  icon={remove}
                                  size="small"
                                  color="dark"
                                />
                              </IonButton>
                              <IonText
                                color="dark"
                                className="w-6 text-center text-lg"
                              >
                                {selectedJob.copyCount}
                              </IonText>
                              <IonButton
                                size="small"
                                fill="solid"
                                color="light"
                                className="m-0 h-8 w-10 shadow-none"
                                onClick={() => {
                                  handleIncrementCopy(
                                    selectedJob.id,
                                    selectedJob.copyCount,
                                  );
                                }}
                              >
                                <IonIcon icon={add} size="small" color="dark" />
                              </IonButton>
                            </div>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonCardContent>
                  </IonCard>
                );
              })()}
          </AppContent>
        </IonModal>
      </AppContent>

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
    </IonPage>
  );
}
