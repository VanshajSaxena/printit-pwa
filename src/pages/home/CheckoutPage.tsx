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
  IonLabel,
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
} from "@ionic/react";

import { useCurrentVendorPresence } from "@hooks/usePresence";
import AppContent from "@layout/AppContent";
import { OutputColor, useDraftStore } from "@store/draftStore";
import { usePresenceStore } from "@store/presenceStore";
import { useTransactionStore } from "@store/transactionStore";
import {
  add,
  colorPaletteOutline,
  document,
  printOutline,
  remove,
  settingsOutline,
} from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const [presentLoading, dismissLoading] = useIonLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageRef = useRef<HTMLElement>(null);
  const [presentingElement, setPresentingElement] = useState<
    HTMLElement | undefined
  >(undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setPresentingElement(pageRef.current ?? undefined);
  }, []);

  const currentVendorId = usePresenceStore((store) => store.currentVendorId);
  const vendorStatus = useCurrentVendorPresence();

  const getCurrentDraftTransactionId = useDraftStore(
    (store) => store.getCurrentDraftTransactionId,
  );
  const createTransaction = useTransactionStore(
    (store) => store.createTransaction,
  );
  const clearCurrentDraftTransactionId = useDraftStore(
    (store) => store.clearCurrentDraftTransactionId,
  );
  const updateDraftJob = useDraftStore((store) => store.updateDraftJob);

  const currentDraftTransactionId = getCurrentDraftTransactionId();

  if (!currentDraftTransactionId) {
    throw new Error("CurrentDraftTransactionId doesn't exist");
  }

  const currentDraftTransaction = useDraftStore((store) => {
    return store.state.transactions[currentDraftTransactionId];
  });

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
    if (!currentVendorId) {
      console.error("currentVendorId is null.");
      return;
    }

    setIsSubmitting(true);
    await presentLoading({ message: "Preparing your documents..." });

    try {
      const draftDocuments = currentDraftTransaction.jobs.map(
        ({ document: draft }) => ({
          filename: draft.filename,
          contentType: draft.contentType,
          draftId: draft.id,
        }),
      );

      const { documents } = await createDocumentsMutation.mutateAsync({
        body: { documents: draftDocuments },
      });

      await dismissLoading();
      await presentLoading({ message: "Uploading files..." });

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

            const file = currentDraftTransaction.jobs.find(
              ({ document: draftDocument }) =>
                draftDocument.id === document.draftId,
            )?.document.file;

            if (!file) {
              throw new Error(`File not found for draftId ${document.draftId}`);
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

      await dismissLoading();
      await presentLoading({ message: "Creating print job..." });

      const jobs = currentDraftTransaction.jobs.map((job) => {
        const documentId = documents.find(
          (document) => job.document.id === document.draftId,
        )?.id;

        if (!documentId) {
          throw new Error(
            `Missing document id from documents received from backend`,
          );
        }

        return {
          copyCount: job.copyCount,
          outputColor: job.outputColor,
          documentId,
        };
      });

      const transactionResponse = await createTransactionMutation.mutateAsync({
        body: { jobs, vendorId: currentVendorId },
      });

      createTransaction(transactionResponse);
      clearCurrentDraftTransactionId();

      await dismissLoading();
    } catch (error) {
      console.error("Transaction creation failed:", error);
      await dismissLoading();
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = currentDraftTransaction.jobs.reduce(
    (total, job) => total + job.document.pageCount * job.copyCount,
    0,
  );

  const isOnline = vendorStatus === "online";

  return (
    <IonPage ref={pageRef}>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref={
                currentVendorId
                  ? `/home/printer/${currentVendorId.toString()}`
                  : "/home"
              }
            />
          </IonButtons>
          <IonTitle>Checkout</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent
        fullscreen
        scrollY={true}
        className="ion-padding flex min-h-full flex-col items-center justify-start gap-0"
      >
        <IonCard className="m-0 min-w-full bg-transparent px-4 pt-2 pb-6 shadow-none">
          <IonCardContent className="p-0!">
            <IonCardTitle>
              {isOnline ? "Printer Ready" : "Printer Offline"}
              <PulseIcon
                className="m-1 mt-0 align-middle"
                status={vendorStatus}
              />
            </IonCardTitle>
            <IonCardSubtitle color="medium">
              Galgotias University, Greater Noida, UP
            </IonCardSubtitle>
          </IonCardContent>
        </IonCard>

        <IonButton
          expand="block"
          size="default"
          fill="solid"
          color="primary"
          className="m-0 min-w-full"
          disabled={isSubmitting}
        >
          <IonIcon icon={settingsOutline} slot="start" />
          <IonLabel>Change Settings</IonLabel>
        </IonButton>

        <IonCard
          className="my-6 max-w-full min-w-full"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          <IonCardTitle className="flex items-center justify-between px-5 pt-4 text-lg">
            <IonLabel>Documents</IonLabel>
            <IonButton
              fill="clear"
              size="small"
              className="m-0 p-0!"
              shape="round"
            >
              <IonIcon
                icon={settingsOutline}
                color="medium"
                slot="icon-only"
                className="text-2xl"
              />
            </IonButton>
          </IonCardTitle>
          <IonCardContent className="p-0!">
            <IonGrid>
              {/* Header row */}
              <IonRow className="px-1.25 pt-1.25">
                <IonCol
                  size="auto"
                  className="flex items-center justify-center"
                >
                  <IonIcon icon={document} className="invisible text-xl" />
                </IonCol>
                <IonCol className="min-w-0 flex-1 pl-2">
                  <IonText
                    color="medium"
                    className="invisible text-sm font-medium"
                  >
                    Filename
                  </IonText>
                </IonCol>
                <IonCol size="auto" className="min-w-12 text-center">
                  <IonText color="medium" className="text-sm font-medium">
                    Copies
                  </IonText>
                </IonCol>
                <IonCol size="auto" className="min-w-16 text-center">
                  <IonText color="medium" className="text-sm font-medium">
                    Pages
                  </IonText>
                </IonCol>
              </IonRow>

              {currentDraftTransaction.jobs.map((job) => (
                <IonRow key={job.id} className="p-1.25">
                  <IonCol
                    size="auto"
                    className="flex min-h-8 min-w-8 items-center justify-center"
                  >
                    <IonIcon
                      icon={document}
                      className="text-xl"
                      color={
                        job.outputColor === "COLOR" ? "secondary" : "medium"
                      }
                    />
                  </IonCol>
                  <IonCol className="flex min-w-0 flex-1 items-center pl-2">
                    <IonText
                      color="dark"
                      className="block truncate font-medium"
                      title={job.document.filename}
                    >
                      {job.document.filename}
                    </IonText>
                  </IonCol>
                  <IonCol size="auto" className="min-w-12 text-center">
                    {job.copyCount}
                  </IonCol>
                  <IonCol
                    size="auto"
                    className="min-w-16 text-center font-semibold"
                  >
                    {job.document.pageCount}
                  </IonCol>
                </IonRow>
              ))}

              {/* Total row */}
              <IonRow className="ion-align-items-center p-1.25 pt-4">
                <IonCol
                  size="auto"
                  className="flex min-h-8 min-w-8 items-center justify-center"
                >
                  <IonIcon icon={document} className="invisible text-xl" />
                </IonCol>
                <IonCol className="pl-2">
                  <IonText color="dark">
                    <strong>Total Pages</strong>
                  </IonText>
                </IonCol>
                <IonCol size="auto" className="min-w-12" />
                <IonCol size="auto" className="min-w-16 text-center">
                  <IonText color="dark">
                    <strong>{totalPages}</strong>
                  </IonText>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        <IonModal
          isOpen={isModalOpen}
          presentingElement={
            presentingElement && (isPlatform("ios") || window.location.href)
              ? presentingElement
              : undefined
          }
          canDismiss={true}
          onDidDismiss={() => {
            setIsModalOpen(false);
          }}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Quick Settings</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  onClick={() => {
                    setIsModalOpen(false);
                  }}
                >
                  Done
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <AppContent
            fullscreen
            className="ion-padding flex min-h-full flex-col items-center justify-start gap-0"
          >
            {currentDraftTransaction.jobs.map((job) => (
              <IonCard
                key={job.id}
                className="m-0 mb-4 min-w-full pt-2 shadow-sm"
              >
                <IonCardContent className="p-3!">
                  <div className="mb-3 flex items-center gap-3 pb-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                      <IonIcon
                        icon={document}
                        className="text-2xl"
                        color={
                          job.outputColor === "COLOR" ? "secondary" : "medium"
                        }
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <IonText
                        color="dark"
                        className="block truncate text-base font-semibold"
                      >
                        {job.document.filename}
                      </IonText>
                      <IonText color="medium" className="text-xs">
                        {job.document.pageCount} pages •{" "}
                        {job.document.contentType
                          .split("/")[1]
                          ?.toUpperCase() || "FILE"}
                      </IonText>
                    </div>
                  </div>

                  {/* Settings Grid */}
                  <IonGrid className="p-0">
                    <IonRow className="ion-align-items-center">
                      {/* Color Toggle */}
                      <IonCol size="12" className="mb-3 pb-0">
                        <IonSegment
                          value={job.outputColor}
                          onIonChange={(e) => {
                            handleColorChange(
                              job.id,
                              e.detail.value as OutputColor,
                            );
                          }}
                          mode="ios"
                          className="w-full"
                        >
                          <IonSegmentButton value="MONOCHROME">
                            <IonLabel>B&W</IonLabel>
                          </IonSegmentButton>
                          <IonSegmentButton value="COLOR">
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

                      {/* Copies Control */}
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
                              handleDecrementCopy(job.id, job.copyCount);
                            }}
                            disabled={job.copyCount <= 1}
                          >
                            <IonIcon icon={remove} size="small" color="dark" />
                          </IonButton>

                          <IonText
                            color="dark"
                            className="w-6 text-center text-lg font-semibold"
                          >
                            {job.copyCount}
                          </IonText>

                          <IonButton
                            size="small"
                            fill="solid"
                            color="light"
                            className="m-0 h-8 w-10 shadow-none"
                            onClick={() => {
                              handleIncrementCopy(job.id, job.copyCount);
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
            ))}
          </AppContent>
        </IonModal>
      </AppContent>

      <div className="ion-padding mx-auto w-full max-w-2xl">
        <IonFooter className="ion-no-border">
          <IonToolbar>
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
          </IonToolbar>
        </IonFooter>
      </div>
    </IonPage>
  );
}
