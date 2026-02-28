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
import { OutputColor, useDraftStore } from "@store/draftStore";
import { usePresenceStore } from "@store/presenceStore";
import { useTransactionStore } from "@store/transactionStore";
import { useVendorStore } from "@store/vendorStore";
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
  const clearCurrentDraftTransactionId = useDraftStore(
    (store) => store.clearCurrentDraftTransactionId,
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
    updateDraftJob(currentDraftTransactionId, jobId, {
      outputColor: value,
    });
  };

  const handleSubmit = async () => {
    if (!vendorId || !vendorProfile) {
      await presentToast({
        message: "No printer selected. Please go back and select a printer.",
        duration: 3000,
        color: "danger",
        position: "top",
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

        if (wrapper?.file) {
          fileMap.set(job.document.id, wrapper.file);
        }
      });

      if (fileMap.size !== jobs.length) {
        throw new Error("Mismatch between jobs and retrieved files.");
      }

      const draftDocuments = jobs.map(({ document }) => ({
        filename: document.filename,
        contentType: document.contentType,
        draftId: document.id,
      }));

      const { documents } = await createDocumentsMutation.mutateAsync({
        body: { documents: draftDocuments },
      });

      const { signedUrls } = await filesMutation.mutateAsync({
        body: { ids: documents.map((document) => document.id) },
      });

      try {
        await Promise.all(
          signedUrls.map(async ({ url, id }) => {
            const document = documents.find((document) => document.id === id);
            if (!document) {
              throw new Error(`Document not found for id ${id.toString()}`);
            }

            const file = fileMap.get(document.draftId);

            if (!file) {
              throw new Error(
                `File binary not found for draftId ${document.draftId}`,
              );
            }

            const uploadResponse = await fetch(url, {
              method: "PUT",
              headers: { "Content-Type": file.type },
              body: file,
            });

            if (!uploadResponse.ok) {
              throw new Error(
                `Upload failed for document ${id.toString()}: ${uploadResponse.status.toString()}`,
              );
            }
          }),
        );

        await Promise.all(
          documents.map(async (document) => {
            await updateDocumentsMutation.mutateAsync({
              params: { path: { id: document.id } },
              body: { status: "UPLOADED" },
            });
          }),
        );
      } catch (uploadError) {
        console.error("Upload failed:", uploadError);

        await Promise.all(
          documents.map(async (document) => {
            await updateDocumentsMutation.mutateAsync({
              params: { path: { id: document.id } },
              body: { status: "FAILED" },
            });
          }),
        );

        throw new Error("Failed to upload documents");
      }

      const finalJobs = jobs.map((job) => {
        const documentId = documents.find(
          (document) => job.document.id === document.draftId,
        )?.id;

        if (!documentId) {
          throw new Error("Missing document id");
        }

        return {
          copyCount: job.copyCount,
          outputColor: job.outputColor,
          documentId,
        };
      });

      const transactionResponse = await createTransactionMutation.mutateAsync({
        body: { jobs: finalJobs, vendorId: vendorId },
      });

      createTransaction(transactionResponse);
      setCurrentTransactionId(transactionResponse.id);
      router.push(
        `/${router.routeInfo.tab ?? "home"}/status`,
        "forward",
        "replace",
      );

      await dismissLoading();
      await presentToast({
        message: "Print job submitted successfully!",
        duration: 3000,
        color: "success",
        position: "top",
      });
    } catch (error) {
      console.error("Transaction creation failed:", error);
      await dismissLoading();
      await presentToast({
        message: "Failed to print your files. Please try again.",
        duration: 3000,
        color: "danger",
      });
    } finally {
      // clearCurrentDraftTransactionId();
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
    (total, job) => total + job.document.pageCount * job.copyCount,
    0,
  );

  const displayName =
    vendorProfile?.displayName ??
    `${vendorProfile?.firstName ?? ""} ${vendorProfile?.lastName ?? ""}`.trim();

  const backLink = vendorProfile?.username
    ? `${router.routeInfo.tab === "home" || !router.routeInfo.tab ? "/home/printer" : router.routeInfo.tab}/@${vendorProfile.username}`
    : "/home";
  const selectedJob = currentDraftTransaction.jobs.find(
    (job) => job.id === selectedJobId,
  );
  return (
    <IonPage ref={pageRef}>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={backLink} />
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
            style={{
              "--inner-padding-top": "0.75rem",
              "--inner-padding-bottom": "0.25rem",
            }}
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
            const totalSheets = job.document.pageCount * job.copyCount;

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
                  "--inner-padding-top": "0.5rem",
                  "--inner-padding-bottom": "0.5rem",
                }}
              >
                {/* Left Icon */}
                <IonIcon
                  icon={document}
                  slot="start"
                  color={job.outputColor === "Color" ? "secondary" : "medium"}
                  className="text-2xl"
                />

                {/* Main Label */}
                <IonLabel>
                  {/* Filename */}
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

                  {/* Pages + Copies */}
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "14px",
                      color: "var(--ion-color-medium)",
                    }}
                  >
                    {job.document.pageCount} pages • {job.copyCount}{" "}
                    {job.copyCount === 1 ? "copy" : "copies"}
                  </div>
                </IonLabel>

                {/* Right Side: Total Sheets */}
                <div
                  slot="end"
                  style={{
                    fontSize: "15px",
                    color: "var(--ion-color-medium)",
                    textAlign: "right",
                    minWidth: "48px",
                  }}
                >
                  {totalSheets} Pages
                </div>
              </IonItem>
            );
          })}

          {/* Total Pages Row */}
          <IonItem
            detail={false}
            style={{
              "--inner-padding-top": "0.75rem",
              "--inner-padding-bottom": "0.75rem",
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
            {selectedJob && (
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
                        {selectedJob.document.pageCount} pages •{" "}
                        {selectedJob.document.contentType
                          .split("/")[1]
                          ?.toUpperCase() || "FILE"}
                      </IonText>
                    </div>
                  </div>
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
                              <IonIcon icon={contrastOutline} size="small" />
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
                            <IonIcon icon={remove} size="small" color="dark" />
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
            )}
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
